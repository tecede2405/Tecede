import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import Swal from "sweetalert2";
import Hls from "hls.js";
import {
  FaUsers,
  FaPlus,
  FaPlay,
  FaCircle,
  FaClock,
  FaCrown,
  FaComments,
  FaPaperPlane,
  FaShareAlt,
  FaBan,
  FaSyncAlt,
  FaExclamationTriangle,
  FaSlidersH,
  FaFilm,
  FaArrowLeft,
  FaSearch,
  FaDoorOpen,
  FaTv,
  FaCheck,
  FaServer,
  FaListOl,
  FaTimes,
  FaVolumeUp,
  FaVolumeMute,
  FaExpand,
  FaCompress,
  FaTrashAlt
} from "react-icons/fa";
import { FaForwardStep } from "react-icons/fa6";
import { useAuth } from "../../context/AuthContext";
import "./style.scss";

const BACKEND_HTTP = (
  process.env.REACT_APP_WATCH_PARTY_URL ||
  "https://watch-party-backend.ptoan5950.workers.dev"
).replace(/\/$/, "");
const BACKEND_WS = BACKEND_HTTP.replace(/^http/i, "ws");
const SERVER_API_BASE = process.env.REACT_APP_SERVER_API_URL || "https://movie1-api-worker.nguyengiaminh532.workers.dev";
const KK_BASE = process.env.REACT_APP_FILM_API_URL || "https://phimapi.com";
const NC_BASE = process.env.REACT_APP_FILM_API_URL_3 || "https://phim.nguonc.com";

// Cấu hình Hls.js chuyên biệt cho xem chung: bộ đệm mượt mà, chống giật, tua tức thì và tự phục hồi
const SMOOTH_HLS_CONFIG = {
  debug: false,
  enableWorker: true,
  lowLatencyMode: false,
  backBufferLength: 60,
  maxBufferLength: 45,
  maxMaxBufferLength: 180,
  maxBufferSize: 60 * 1024 * 1024,
  maxBufferHole: 0.5,
  highBufferWatchdogPeriod: 2,
  nudgeOffset: 0.1,
  nudgeMaxRetry: 5,
  nudgeOnVideoHole: true,
  maxFragLookUpTolerance: 0.25,
  startFragPrefetch: true,
  appendErrorMaxRetry: 5,
  autoStartLoad: true,
  fragLoadingTimeOut: 25000,
  fragLoadingMaxRetry: 6,
  fragLoadingRetryDelay: 1000,
  manifestLoadingTimeOut: 25000,
  manifestLoadingMaxRetry: 6,
  manifestLoadingRetryDelay: 1000,
  levelLoadingTimeOut: 25000,
  levelLoadingMaxRetry: 6,
  abrEwmaDefaultEstimate: 5000000,
};

// Helper lấy poster theo nguồn y hệt trang tìm kiếm (FilmListBySlug)
function getPoster(url, sourceName) {
  if (!url || typeof url !== "string") return "";
  const cleanUrl = url.trim();
  if (!cleanUrl) return "";
  if (cleanUrl.startsWith("http://") || cleanUrl.startsWith("https://")) return cleanUrl;
  if (cleanUrl.startsWith("//")) return `https:${cleanUrl}`;
  if (sourceName === "VM") return `https://vsmov.com/${cleanUrl.startsWith("/") ? cleanUrl.slice(1) : cleanUrl}`;
  if (sourceName === "KK") return `https://phimimg.com/${cleanUrl.startsWith("/") ? cleanUrl.slice(1) : cleanUrl}`;
  if (sourceName === "NC") return `https://phim.nguonc.com/${cleanUrl.startsWith("/") ? cleanUrl.slice(1) : cleanUrl}`;
  return cleanUrl;
}

// Chuyển tiêu đề thành slug URL an toàn
function slugify(text) {
  if (!text) return "";
  return text
    .toString()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[đĐ]/g, "d")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

// Helper lấy năm phát hành chuẩn xác từ object/category
function getYearFromData(f) {
  if (!f) return "N/A";
  if (f.year) {
    if (typeof f.year === "string" || typeof f.year === "number") return String(f.year);
    if (typeof f.year === "object" && f.year?.name) return String(f.year.name);
  }
  if (f.category && typeof f.category === "object") {
    const categories = Object.values(f.category);
    for (let cat of categories) {
      if (cat && cat.list && Array.isArray(cat.list)) {
        for (let item of cat.list) {
          if (item && item.name) {
            const name = String(item.name);
            if (/^\d{4}$/.test(name)) return name;
          }
        }
      }
    }
  }
  return "N/A";
}

// SweetAlert helper
const DarkSwal = Swal.mixin({
  background: "#161b22",
  color: "#fff",
  confirmButtonColor: "#38bdf8",
  cancelButtonColor: "#334155",
  customClass: {
    popup: "swal-dark",
  },
});

export default function WatchPartyPage() {
  const { roomId: urlRoomId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  // Mode: If roomId is present in URL, we are inside a room. Otherwise we are in the Lobby.
  const activeRoomId = (urlRoomId && urlRoomId !== "default") ? urlRoomId : (searchParams.get("room") && searchParams.get("room") !== "default" ? searchParams.get("room") : null);

  // State: Lobby
  const [activeRooms, setActiveRooms] = useState([]);
  const [roomThumbnails, setRoomThumbnails] = useState({});
  const [isLoadingRooms, setIsLoadingRooms] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);

  // State: Tìm kiếm phim & Chọn tập tự động trong Modal Tạo phòng
  const [movieSearchText, setMovieSearchText] = useState("");
  const [movieSearchResults, setMovieSearchResults] = useState([]);
  const [isSearchingMovie, setIsSearchingMovie] = useState(false);
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);
  const [movieServers, setMovieServers] = useState([]);
  const [selectedServerIdx, setSelectedServerIdx] = useState(0);
  const [movieEpisodes, setMovieEpisodes] = useState([]);
  const [selectedEpisode, setSelectedEpisode] = useState(null);

  // Form State: Tạo phòng mới
  const [formRoomName, setFormRoomName] = useState("");
  const [formTitle, setFormTitle] = useState("");
  const [formEpisode, setFormEpisode] = useState("Tập 1");
  const [formVideoUrl, setFormVideoUrl] = useState("");
  const [formMediaType, setFormMediaType] = useState("m3u8");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleOpenCreateModal = () => {
    if (!formRoomName.trim()) {
      setFormRoomName(`Phòng của ${user?.display_name || user?.username || "Tôi"}`);
    }
    setShowCreateModal(true);
  };

  // State: Inside Room
  const wsRef = useRef(null);
  const [isConnected, setIsConnected] = useState(false);
  const [roomData, setRoomData] = useState(null);
  const [members, setMembers] = useState([]);
  const [messages, setMessages] = useState([]);
  const [chatInput, setChatInput] = useState("");
  const [errorMessage, setErrorMessage] = useState(null);
  const [elapsedDisplay, setElapsedDisplay] = useState("00:00:00");
  const [showHostPanel, setShowHostPanel] = useState(false);

  // Host Panel State: Smart Episode/Server selection & Change Movie
  const [hostSearchMode, setHostSearchMode] = useState(false);
  const [hostMovieSearchText, setHostMovieSearchText] = useState("");
  const [hostMovieSearchResults, setHostMovieSearchResults] = useState([]);
  const [isSearchingHostMovie, setIsSearchingHostMovie] = useState(false);

  // Guest Player Controls
  const [guestVolume, setGuestVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showGuestControls, setShowGuestControls] = useState(false);
  const playerWrapperRef = useRef(null);
  const controlsTimeoutRef = useRef(null);

  // WebSocket Stability & Heartbeat Refs
  const isIntentionalCloseRef = useRef(false);
  const reconnectAttemptsRef = useRef(0);
  const reconnectTimerRef = useRef(null);
  const pingIntervalRef = useRef(null);
  const [isReconnecting, setIsReconnecting] = useState(false);

  const chatScrollRef = useRef(null);
  const elapsedTimerRef = useRef(null);
  const searchInputRef = useRef(null);
  const videoRef = useRef(null);
  const hlsInstanceRef = useRef(null);
  const isSeekingFromSyncRef = useRef(false);
  const roomStartedAtRef = useRef(0);
  const [needsUserGesture, setNeedsUserGesture] = useState(false);

  // Bỏ qua quảng cáo (Server KK: 14:57 [897s] -> 15:31 [931s])
  const [showSkipAd, setShowSkipAd] = useState(false);
  const adSkippedRef = useRef(false);

  useEffect(() => {
    adSkippedRef.current = false;
    setShowSkipAd(false);
  }, [roomData?.videoUrl]);

  // Tự động tải thông tin phim nếu đi từ trang chi tiết phim sang
  useEffect(() => {
    const slug = searchParams.get("slug");
    const name = searchParams.get("name");
    const poster = searchParams.get("poster");

    if (slug && !activeRoomId) {
      handleOpenCreateModal();
      handleSelectMovie({
        name: name || slug,
        slug: slug,
        poster_url: poster || "",
        thumb_url: poster || "",
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, activeRoomId]);

  // Tìm kiếm phim live trong modal (Debounced) - lấy full data như trang search từ cả 3 nguồn (KK, VM, NC)
  useEffect(() => {
    if (!movieSearchText.trim() || movieSearchText.trim().length < 2) {
      setMovieSearchResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearchingMovie(true);
      const query = movieSearchText.trim();
      try {
        const fetchSourceItems = async (baseUrl) => {
          try {
            if (!baseUrl) return [];
            const hasQuery = baseUrl.includes("?");
            const res = await fetch(`${baseUrl}${hasQuery ? "&" : "?"}page=1`);
            if (!res.ok) return [];
            const data = await res.json();
            if (Array.isArray(data?.data?.items)) return data.data.items;
            if (Array.isArray(data?.items)) return data.items;
            if (Array.isArray(data?.data)) return data.data;
            return [];
          } catch {
            return [];
          }
        };

        const [resKk, resNc] = await Promise.all([
          fetchSourceItems(`${KK_BASE}/v1/api/tim-kiem?keyword=${encodeURIComponent(query)}`),
          fetchSourceItems(`${NC_BASE}/api/films/search?keyword=${encodeURIComponent(query)}`),
        ]);

        const normKk = (resKk || []).map((f) => ({
          ...f,
          sourceName: "KK",
          name: typeof f.name === "string" ? f.name : "N/A",
          original_name: typeof (f.origin_name || f.original_name) === "string" ? (f.origin_name || f.original_name) : "",
          poster_url: getPoster(f.poster_url || f.thumb_url, "KK"),
          thumb_url: getPoster(f.thumb_url || f.poster_url, "KK"),
          slug: f.slug || f._id || "",
          quality: typeof f.quality === "string" ? f.quality : "FHD",
          language: typeof f.lang === "string" ? f.lang : "Vietsub",
          current_episode: f.episode_current || "",
          year: getYearFromData(f),
          time: typeof f.time === "string" ? f.time : "",
        }));

        const normNc = (resNc || []).map((f) => ({
          ...f,
          sourceName: "NC",
          name: typeof f.name === "string" ? f.name : "N/A",
          original_name: typeof (f.original_name || f.origin_name) === "string" ? (f.original_name || f.origin_name) : "",
          poster_url: getPoster(f.thumb_url || f.poster_url, "NC"),
          thumb_url: getPoster(f.poster_url || f.thumb_url, "NC"),
          slug: f.slug || f.id || "",
          quality: typeof f.quality === "string" ? f.quality : "HD",
          language: typeof (f.language || f.lang) === "string" ? (f.language || f.lang) : "Vietsub",
          current_episode: f.current_episode || f.episode_current || "",
          year: getYearFromData(f),
          time: typeof f.time === "string" ? f.time : "",
        }));

        const combined = [...normKk, ...normNc];
        const uniqueResults = Array.from(
          new Map(
            combined
              .filter((item) => item && item.slug)
              .map((item) => [`${item.slug}-${item.sourceName}`, item])
          ).values()
        );

        setMovieSearchResults(uniqueResults);
      } catch (e) {
        setMovieSearchResults([]);
      } finally {
        setIsSearchingMovie(false);
      }
    }, 350);

    return () => clearTimeout(timer);
  }, [movieSearchText]);

  // Tìm kiếm phim live trong Bảng Điều Khiển Chủ Phòng (Host Panel)
  useEffect(() => {
    if (!hostMovieSearchText.trim() || hostMovieSearchText.trim().length < 2) {
      setHostMovieSearchResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearchingHostMovie(true);
      const query = hostMovieSearchText.trim();
      try {
        const fetchSourceItems = async (baseUrl) => {
          try {
            if (!baseUrl) return [];
            const hasQuery = baseUrl.includes("?");
            const res = await fetch(`${baseUrl}${hasQuery ? "&" : "?"}page=1`);
            if (!res.ok) return [];
            const data = await res.json();
            if (Array.isArray(data?.data?.items)) return data.data.items;
            if (Array.isArray(data?.items)) return data.items;
            if (Array.isArray(data?.data)) return data.data;
            return [];
          } catch {
            return [];
          }
        };

        const [resKk, resNc] = await Promise.all([
          fetchSourceItems(`${KK_BASE}/v1/api/tim-kiem?keyword=${encodeURIComponent(query)}`),
          fetchSourceItems(`${NC_BASE}/api/films/search?keyword=${encodeURIComponent(query)}`),
        ]);

        const normKk = (resKk || []).map((f) => ({
          ...f,
          sourceName: "KK",
          name: typeof f.name === "string" ? f.name : "N/A",
          original_name: typeof (f.origin_name || f.original_name) === "string" ? (f.origin_name || f.original_name) : "",
          poster_url: getPoster(f.poster_url || f.thumb_url, "KK"),
          thumb_url: getPoster(f.thumb_url || f.poster_url, "KK"),
          slug: f.slug || f._id || "",
          quality: typeof f.quality === "string" ? f.quality : "FHD",
          language: typeof f.lang === "string" ? f.lang : "Vietsub",
          current_episode: f.episode_current || "",
          year: getYearFromData(f),
          time: typeof f.time === "string" ? f.time : "",
        }));

        const normNc = (resNc || []).map((f) => ({
          ...f,
          sourceName: "NC",
          name: typeof f.name === "string" ? f.name : "N/A",
          original_name: typeof (f.original_name || f.origin_name) === "string" ? (f.original_name || f.origin_name) : "",
          poster_url: getPoster(f.thumb_url || f.poster_url, "NC"),
          thumb_url: getPoster(f.poster_url || f.thumb_url, "NC"),
          slug: f.slug || f.id || "",
          quality: typeof f.quality === "string" ? f.quality : "HD",
          language: typeof (f.language || f.lang) === "string" ? (f.language || f.lang) : "Vietsub",
          current_episode: f.current_episode || f.episode_current || "",
          year: getYearFromData(f),
          time: typeof f.time === "string" ? f.time : "",
        }));

        const combined = [...normKk, ...normNc];
        const uniqueResults = Array.from(
          new Map(
            combined
              .filter((item) => item && item.slug)
              .map((item) => [`${item.slug}-${item.sourceName}`, item])
          ).values()
        );

        setHostMovieSearchResults(uniqueResults);
      } catch (e) {
        setHostMovieSearchResults([]);
      } finally {
        setIsSearchingHostMovie(false);
      }
    }, 350);

    return () => clearTimeout(timer);
  }, [hostMovieSearchText]);

  // Xử lý khi user chọn 1 phim từ danh sách tìm kiếm: Gọi API /movie-detail/:slug y hệt trang /chi-tiet/:slug
  const handleSelectMovie = async (movie, shouldBroadcastChangeMedia = false) => {
    setSelectedMovie(movie);
    setMovieSearchResults([]);
    setMovieSearchText("");
    setHostMovieSearchResults([]);
    setHostMovieSearchText("");
    setFormTitle(movie.name);
    if (!formRoomName.trim()) {
      setFormRoomName(`Phòng của ${user?.display_name || user?.username || "Tôi"}`);
    }
    setIsLoadingDetail(true);

    try {
      const baseUrl = `${SERVER_API_BASE}/movie-detail/${movie.slug}`;
      let res = await fetch(baseUrl);
      let data = await res.json();

      let m = data.data?.movie;
      let epList = data.data?.episodes || [];

      const checkHasM3u8 = (list) => {
        if (!Array.isArray(list) || list.length === 0) return false;
        return list.some((src) =>
          (src.episodes || []).some((srv) =>
            (srv.server_data || srv.items || []).some((ep) =>
              Boolean(ep.link_m3u8 || ep.m3u8)
            )
          )
        );
      };

      const checkNcHasM3u8 = (list) => {
        if (!Array.isArray(list) || list.length === 0) return false;
        const nc = list.find(
          (s) =>
            s.source?.toLowerCase() === "nc" ||
            s.source?.toLowerCase() === "nguonc"
        );
        if (!nc) return true;
        return (nc.episodes || []).some((srv) =>
          (srv.server_data || srv.items || []).some((ep) =>
            Boolean(ep.link_m3u8 || ep.m3u8)
          )
        );
      };

      const isNc =
        movie.sourceName === "NC" ||
        movie.sourceName === "nguonc" ||
        epList.some(
          (s) =>
            s.source?.toLowerCase() === "nc" ||
            s.source?.toLowerCase() === "nguonc"
        );
      const lacksM3u8 = !checkHasM3u8(epList) || (isNc && !checkNcHasM3u8(epList));

      // Tự động refresh nếu data chưa có hoặc thiếu m3u8 giống FilmDetail
      if (!data.success || !m || epList.length === 0 || lacksM3u8) {
        try {
          const refRes = await fetch(`${baseUrl}?refresh=true`);
          const refData = await refRes.json();
          if (refData.success && refData.data?.movie) {
            m = refData.data.movie;
            epList = refData.data.episodes || [];
          }
        } catch (refErr) {
          console.warn("[WatchParty] Lỗi refresh phim:", refErr);
        }
      }

      // Xử lý ảnh đúng tỉ lệ / chiều như FilmDetail
      const isNguonC_or_OPhim =
        m?.poster_url?.includes("phim.nguonc.com") ||
        m?.thumb_url?.includes("phim.nguonc.com") ||
        m?.poster_url?.includes("ophim") ||
        m?.thumb_url?.includes("ophim");

      let p = isNguonC_or_OPhim ? m?.thumb_url : m?.poster_url;
      let t = isNguonC_or_OPhim ? m?.poster_url : m?.thumb_url;
      if (!p) p = t || movie.poster_url;
      if (!t) t = p || movie.thumb_url;

      const movieObj = {
        ...movie,
        ...m,
        name: m?.name || movie.name,
        origin_name: m?.origin_name || movie.origin_name || movie.original_name || "",
        poster_url: p,
        thumb_url: t,
        quality: m?.quality || movie.quality,
        language: m?.lang || movie.language,
        current_episode: m?.episode_current || movie.current_episode,
        year: m?.year || movie.year,
        slug: movie.slug || m?.slug,
      };

      setSelectedMovie(movieObj);

      // Bóc tách Server & Tập phim: CHỈ GIỮ NGUỒN KK VÀ NGUỒN C (NC) - VÌ CÓ LINK M3U8 ĐỂ ĐỒNG BỘ THỜI GIAN
      const SOURCE_NAMES = {
        kk: "KK",
        kkphim: "KK",
        nc: "NC",
        nguonc: "NC",
      };

      let list = [];
      (epList || []).forEach((src) => {
        const srcKey = src.source?.toLowerCase();
        // Loại bỏ hoàn toàn các nguồn khác (VM, OP,...), chỉ lấy KK và NC
        if (srcKey !== "kk" && srcKey !== "kkphim" && srcKey !== "nc" && srcKey !== "nguonc") {
          return;
        }

        const sourceLabel = SOURCE_NAMES[srcKey] || "KK";

        (src.episodes || []).forEach((srv) => {
          const rawEpList = srv.server_data || srv.items || [];
          // CHỈ LẤY CÁC TẬP CÓ LINK M3U8
          const validEpList = rawEpList
            .filter((ep) => ep.slug && ep.slug.trim() !== "" && Boolean(ep.link_m3u8 || ep.m3u8))
            .map((ep) => ({
              ...ep,
              m3u8Url: ep.link_m3u8 || ep.m3u8
            }));

          if (validEpList.length > 0) {
            const episodeCount = validEpList.length;
            let serverType = srv.server_name || "";
            if (/thuyết\s*minh/i.test(serverType)) {
              serverType = "Thuyết Minh";
            } else if (/lồng\s*tiếng/i.test(serverType)) {
              serverType = "Lồng Tiếng";
            } else if (/vietsub/i.test(serverType)) {
              serverType = "Vietsub";
            } else if (!serverType || /^#?\d+$/.test(serverType.trim()) || /server/i.test(serverType)) {
              serverType = "Vietsub";
            }

            list.push({
              ...srv,
              server_name: `${sourceLabel} - ${srv.server_name || serverType}`,
              display_name: `#${sourceLabel} (${serverType}) | ${episodeCount} tập`,
              server_type: serverType,
              original_name: srv.server_name,
              sourceName: sourceLabel,
              episodeCount,
              episodes: validEpList,
            });
          }
        });
      });

      // Ưu tiên thứ tự KK -> NC
      const priority = {
        KK: 1,
        NC: 2,
      };

      list.sort((a, b) => {
        const rankA = priority[a.sourceName] || 99;
        const rankB = priority[b.sourceName] || 99;
        return rankA - rankB;
      });

      if (list.length > 0) {
        let initialServerIdx = 0;
        if (movie.sourceName) {
          const matchIdx = list.findIndex((s) => s.sourceName === movie.sourceName);
          if (matchIdx !== -1) initialServerIdx = matchIdx;
        }

        setSelectedServerIdx(initialServerIdx);
        setMovieServers(list);

        const chosenSrv = list[initialServerIdx];
        const eps = chosenSrv?.episodes || [];
        setMovieEpisodes(eps);

        if (eps.length > 0) {
          // Ưu tiên chọn tập đang phát trong phòng (nếu có), nếu không có mới lấy tập 1
          const firstEp = eps[0];
          const matchEp = eps.find(
            (ep) =>
              (roomData?.videoUrl &&
                (ep.m3u8Url === roomData.videoUrl ||
                  ep.link_m3u8 === roomData.videoUrl ||
                  ep.m3u8 === roomData.videoUrl)) ||
              (roomData?.episode && (ep.name === roomData.episode || ep.slug === roomData.episode))
          );
          const activeEp = matchEp || firstEp;
          setSelectedEpisode(activeEp);
          setFormEpisode(activeEp.name || "Tập 1");
          setFormVideoUrl(activeEp.m3u8Url || activeEp.link_m3u8 || activeEp.m3u8 || "");
          setFormMediaType("m3u8");
          if (!formRoomName.trim()) {
            setFormRoomName(`Phòng của ${user?.display_name || user?.username || "Tôi"}`);
          }

          // NẾU LÀ CHỦ PHÒNG ĐỔI PHIM TRONG HOST PANEL: TỰ ĐỘNG PHÁT TẬP 1 PHIM MỚI CHO CẢ PHÒNG!
          if (shouldBroadcastChangeMedia && wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
            const nextVideoUrl = firstEp.m3u8Url || firstEp.link_m3u8 || firstEp.m3u8 || "";
            const nowTime = Date.now();
            roomStartedAtRef.current = nowTime;
            setRoomData((prev) =>
              prev
                ? {
                    ...prev,
                    videoUrl: nextVideoUrl,
                    title: m?.name || movie.name,
                    episode: firstEp.name || "Tập 1",
                    movieSlug: movie.slug || m?.slug,
                    startedAt: nowTime,
                    elapsedSeconds: 0,
                  }
                : null
            );
            startElapsedCounter(nowTime);

            wsRef.current.send(
              JSON.stringify({
                type: "CHANGE_MEDIA",
                videoUrl: nextVideoUrl,
                mediaType: "m3u8",
                title: m?.name || movie.name,
                episode: firstEp.name || "Tập 1",
                movieSlug: movie.slug || m?.slug,
              })
            );
            setHostSearchMode(false);
            DarkSwal.fire({
              toast: true,
              position: "top-end",
              icon: "success",
              title: `Đã chuyển sang phim ${m?.name || movie.name} (${firstEp.name || "Tập 1"})!`,
              showConfirmButton: false,
              timer: 3000,
            });
          }
        }
      } else {
        setMovieServers([]);
        setMovieEpisodes([]);
        setSelectedEpisode(null);
        if (shouldBroadcastChangeMedia) {
          DarkSwal.fire({
            icon: "warning",
            title: "Không tìm thấy link M3U8",
            text: "Phim này hiện chưa có nguồn M3U8 từ KK hoặc NC để đồng bộ thời gian. Vui lòng chọn phim khác!",
          });
        }
      }
    } catch (e) {
      console.warn("Lỗi tải chi tiết tập phim:", e);
      setMovieServers([]);
      setMovieEpisodes([]);
    } finally {
      setIsLoadingDetail(false);
    }
  };

  // Chủ phòng bấm chọn tập trong danh sách tập
  const handleHostChangeEpisode = (ep) => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return;
    const nextVideoUrl = ep.m3u8Url || ep.link_m3u8 || ep.m3u8 || "";
    if (!nextVideoUrl) {
      DarkSwal.fire({
        icon: "warning",
        title: "Tập phim chưa có link phát",
        text: "Không tìm thấy link m3u8 cho tập này.",
      });
      return;
    }

    setSelectedEpisode(ep);
    const nowTime = Date.now();
    roomStartedAtRef.current = nowTime;
    // Cập nhật ngay trên state local để player & chip tập lập tức chuyển đổi không bị trễ
    setRoomData((prev) =>
      prev
        ? {
            ...prev,
            videoUrl: nextVideoUrl,
            episode: ep.name,
            startedAt: nowTime,
            elapsedSeconds: 0,
          }
        : null
    );
    startElapsedCounter(nowTime);

    wsRef.current.send(
      JSON.stringify({
        type: "CHANGE_MEDIA",
        videoUrl: nextVideoUrl,
        mediaType: "m3u8",
        title: selectedMovie?.name || roomData?.title,
        episode: ep.name,
        movieSlug: selectedMovie?.slug || roomData?.movieSlug,
      })
    );
    DarkSwal.fire({
      toast: true,
      position: "top-end",
      icon: "success",
      title: `Đã chuyển sang: ${ep.name} cho cả phòng`,
      showConfirmButton: false,
      timer: 2000,
    });
  };

  // Chủ phòng đổi server trong Host Panel
  const handleHostSelectServer = (idx) => {
    setSelectedServerIdx(idx);
    const eps = movieServers[idx]?.episodes || [];
    setMovieEpisodes(eps);
  };

  // Tự động tải danh sách tập & server cho phòng hiện tại nếu chưa có (vd: khi F5 trang hoặc vào link trực tiếp)
  useEffect(() => {
    if (activeRoomId && roomData?.title && movieServers.length === 0 && !isLoadingDetail) {
      if (roomData.movieSlug) {
        handleSelectMovie({ slug: roomData.movieSlug, name: roomData.title }, false);
      } else {
        const autoFetch = async () => {
          try {
            const res = await fetch(`${KK_BASE}/v1/api/tim-kiem?keyword=${encodeURIComponent(roomData.title)}&page=1`);
            const data = await res.json();
            const items = data?.data?.items || [];
            if (items.length > 0) {
              handleSelectMovie({ ...items[0], slug: items[0].slug || items[0]._id, name: items[0].name }, false);
            }
          } catch (e) {
            console.warn("[WatchParty] Lỗi tự động tải tập cho phòng:", e);
          }
        };
        autoFetch();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeRoomId, roomData?.title, roomData?.movieSlug, movieServers.length, isLoadingDetail]);

  // Đồng bộ chip tập đang chọn theo đúng tập phòng đang phát
  useEffect(() => {
    if (movieEpisodes.length > 0 && roomData) {
      const match = movieEpisodes.find(
        (ep) =>
          (roomData.videoUrl &&
            (ep.m3u8Url === roomData.videoUrl ||
              ep.link_m3u8 === roomData.videoUrl ||
              ep.m3u8 === roomData.videoUrl)) ||
          (roomData.episode && (ep.name === roomData.episode || ep.slug === roomData.episode))
      );
      if (match) {
        setSelectedEpisode(match);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomData?.videoUrl, roomData?.episode, movieEpisodes]);

  // Bộ điều khiển âm thanh và toàn màn hình riêng cho khách
  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !videoRef.current.muted;
      setIsMuted(videoRef.current.muted);
    }
  };

  const handleGuestVolumeChange = (e) => {
    const val = parseFloat(e.target.value);
    setGuestVolume(val);
    if (videoRef.current) {
      videoRef.current.volume = val;
      videoRef.current.muted = val === 0;
      setIsMuted(val === 0);
    }
  };

  // Fullscreen Handler hỗ trợ đa nền tảng: PC, Android, và đặc biệt là iOS Safari (iPhone / iPad)
  const toggleFullscreen = useCallback(async () => {
    const container = playerWrapperRef.current;
    const video = videoRef.current;
    if (!container) return;

    const isFs = Boolean(
      document.fullscreenElement ||
      document.webkitFullscreenElement ||
      document.mozFullScreenElement ||
      document.msFullscreenElement ||
      container.classList.contains("is-fullscreen") ||
      (video && video.webkitDisplayingFullscreen)
    );

    if (!isFs) {
      // 1. Thử HTML5 Standard Fullscreen trên Container trước (PC, Android, Mac)
      if (container.requestFullscreen) {
        try {
          await container.requestFullscreen();
          setIsFullscreen(true);
          return;
        } catch (e) {}
      } else if (container.webkitRequestFullscreen) {
        try {
          container.webkitRequestFullscreen();
          setIsFullscreen(true);
          return;
        } catch (e) {}
      } else if (container.mozRequestFullScreen) {
        try {
          container.mozRequestFullScreen();
          setIsFullscreen(true);
          return;
        } catch (e) {}
      } else if (container.msRequestFullscreen) {
        try {
          container.msRequestFullscreen();
          setIsFullscreen(true);
          return;
        } catch (e) {}
      }

      // 2. iOS Safari (iPhone) KHÔNG hỗ trợ fullscreen trên thẻ div, BẮT BUỘC phải gọi trên thẻ video
      if (video && typeof video.webkitEnterFullscreen === "function") {
        try {
          video.webkitEnterFullscreen();
          setIsFullscreen(true);
          return;
        } catch (e) {}
      }

      // 3. Fallback CSS Pseudo-Fullscreen nếu trình duyệt không cho phép requestFullscreen
      container.classList.add("is-fullscreen");
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        try { await document.exitFullscreen(); } catch (e) {}
      } else if (document.webkitExitFullscreen) {
        try { document.webkitExitFullscreen(); } catch (e) {}
      } else if (document.mozCancelFullScreen) {
        try { document.mozCancelFullScreen(); } catch (e) {}
      } else if (document.msExitFullscreen) {
        try { document.msExitFullscreen(); } catch (e) {}
      }

      if (video && typeof video.webkitExitFullscreen === "function") {
        try { video.webkitExitFullscreen(); } catch (e) {}
      }

      container.classList.remove("is-fullscreen");
      setIsFullscreen(false);
    }
  }, []);

  useEffect(() => {
    const handleFsChange = () => {
      const video = videoRef.current;
      const isFs = Boolean(
        document.fullscreenElement ||
        document.webkitFullscreenElement ||
        document.mozFullScreenElement ||
        document.msFullscreenElement ||
        (playerWrapperRef.current && playerWrapperRef.current.classList.contains("is-fullscreen")) ||
        (video && video.webkitDisplayingFullscreen)
      );
      setIsFullscreen(isFs);
    };

    const video = videoRef.current;
    const onVideoEnterFs = () => setIsFullscreen(true);
    const onVideoExitFs = () => setIsFullscreen(false);

    document.addEventListener("fullscreenchange", handleFsChange);
    document.addEventListener("webkitfullscreenchange", handleFsChange);
    document.addEventListener("mozfullscreenchange", handleFsChange);
    document.addEventListener("MSFullscreenChange", handleFsChange);

    if (video) {
      video.addEventListener("webkitbeginfullscreen", onVideoEnterFs);
      video.addEventListener("webkitendfullscreen", onVideoExitFs);
    }

    return () => {
      document.removeEventListener("fullscreenchange", handleFsChange);
      document.removeEventListener("webkitfullscreenchange", handleFsChange);
      document.removeEventListener("mozfullscreenchange", handleFsChange);
      document.removeEventListener("MSFullscreenChange", handleFsChange);
      if (video) {
        video.removeEventListener("webkitbeginfullscreen", onVideoEnterFs);
        video.removeEventListener("webkitendfullscreen", onVideoExitFs);
      }
    };
  }, [roomData?.videoUrl]);

  // Quản lý hiển thị thanh điều khiển khi user tương tác (Nếu không làm gì sau 2.5s sẽ tự động ẩn)
  const handlePlayerMouseMove = useCallback(() => {
    setShowGuestControls(true);
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    controlsTimeoutRef.current = setTimeout(() => {
      setShowGuestControls(false);
    }, 2500);
  }, []);

  const handlePlayerMouseLeave = useCallback(() => {
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    setShowGuestControls(false);
  }, []);

  useEffect(() => {
    return () => {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
    };
  }, []);

  // Đổi Server phát
  const handleSelectServer = (idx) => {
    setSelectedServerIdx(idx);
    const eps = movieServers[idx]?.episodes || [];
    setMovieEpisodes(eps);
    if (eps.length > 0) {
      const firstEp = eps[0];
      setSelectedEpisode(firstEp);
      setFormEpisode(firstEp.name || "Tập 1");
      setFormVideoUrl(firstEp.m3u8Url || firstEp.link_m3u8 || firstEp.m3u8 || "");
      setFormMediaType("m3u8");
    }
  };

  // Đổi Tập phim
  const handleSelectEpisode = (ep) => {
    setSelectedEpisode(ep);
    setFormEpisode(ep.name || "Tập 1");
    setFormVideoUrl(ep.m3u8Url || ep.link_m3u8 || ep.m3u8 || "");
    setFormMediaType("m3u8");
  };

  // Fetch danh sách phòng công khai từ Backend Microservice
  const fetchRooms = useCallback(async () => {
    setIsLoadingRooms(true);
    try {
      const res = await fetch(`${BACKEND_HTTP}/api/rooms`);
      const json = await res.json();
      if (json && Array.isArray(json.data)) {
        setActiveRooms(json.data.filter((r) => r && r.roomId && r.roomId !== "default"));
      } else {
        setActiveRooms([]);
      }
    } catch (e) {
      console.warn("Lỗi tải danh sách phòng xem chung:", e);
      setActiveRooms([]);
    } finally {
      setIsLoadingRooms(false);
    }
  }, []);

  useEffect(() => {
    if (!activeRoomId) {
      fetchRooms();
      const interval = setInterval(fetchRooms, 15000); // Tự cập nhật mỗi 15s
      return () => clearInterval(interval);
    }
  }, [activeRoomId, fetchRooms]);

  // Tự động gọi API chi tiết để lấy ảnh thumbnail làm background cho các phòng đang công chiếu
  useEffect(() => {
    if (!activeRooms || activeRooms.length === 0 || activeRoomId) return;

    const missingRooms = activeRooms.filter(
      (r) => !roomThumbnails[r.roomId] && (r.movieSlug || r.title)
    );
    if (missingRooms.length === 0) return;

    let isMounted = true;

    const fetchThumbnails = async () => {
      const updates = {};
      await Promise.allSettled(
        missingRooms.map(async (room) => {
          const slug = room.movieSlug || slugify(room.title);
          try {
            if (slug) {
              const res = await fetch(`${SERVER_API_BASE}/movie-detail/${slug}`);
              const data = await res.json();
              if (data.success && data.data?.movie) {
                const m = data.data.movie;
                const isNguonC_or_OPhim =
                  m.poster_url?.includes("phim.nguonc.com") ||
                  m.thumb_url?.includes("phim.nguonc.com") ||
                  m.poster_url?.includes("ophim") ||
                  m.thumb_url?.includes("ophim");
                let thumb = isNguonC_or_OPhim ? m.poster_url : m.thumb_url;
                if (!thumb) thumb = m.thumb_url || m.poster_url;
                if (thumb) {
                  updates[room.roomId] = getPoster(thumb, m.sourceName || "KK");
                  return;
                }
              }
            }

            // Fallback: Tìm kiếm nếu slug trực tiếp không có
            if (room.title) {
              const sRes = await fetch(`${KK_BASE}/v1/api/tim-kiem?keyword=${encodeURIComponent(room.title)}&page=1`);
              const sData = await sRes.json();
              const item = sData?.data?.items?.[0];
              if (item) {
                const thumb = item.thumb_url || item.poster_url;
                if (thumb) {
                  updates[room.roomId] = getPoster(thumb, "KK");
                  return;
                }
              }
            }
          } catch (e) {
            console.warn("[WatchParty] Lỗi tải thumbnail phòng:", room.roomId, e);
          }
        })
      );

      if (isMounted && Object.keys(updates).length > 0) {
        setRoomThumbnails((prev) => ({ ...prev, ...updates }));
      }
    };

    fetchThumbnails();

    return () => {
      isMounted = false;
    };
  }, [activeRooms, roomThumbnails, activeRoomId]);

  // Xử lý WebSocket khi đang ở trong phòng xem
  useEffect(() => {
    if (!activeRoomId) {
      isIntentionalCloseRef.current = true;
      if (reconnectTimerRef.current) clearTimeout(reconnectTimerRef.current);
      if (pingIntervalRef.current) clearInterval(pingIntervalRef.current);
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
      setIsConnected(false);
      setIsReconnecting(false);
      setRoomData(null);
      setMovieServers([]);
      setMovieEpisodes([]);
      setSelectedEpisode(null);
      setSelectedMovie(null);
      setMessages([]);
      return;
    }

    if (!user || !user.token) {
      DarkSwal.fire({
        icon: "warning",
        title: "Yêu cầu đăng nhập",
        text: "Bạn cần đăng nhập tài khoản để vào phòng xem chung và trò chuyện cùng bạn bè!",
        confirmButtonText: "Đăng nhập ngay",
        showCancelButton: true,
        cancelButtonText: "Quay lại",
      }).then((result) => {
        if (result.isConfirmed) {
          navigate("/login");
        } else {
          navigate("/xem-chung");
        }
      });
      return;
    }

    isIntentionalCloseRef.current = false;

    const connectWebSocket = () => {
      if (!activeRoomId || !user?.token) return;
      if (
        wsRef.current &&
        (wsRef.current.readyState === WebSocket.OPEN ||
          wsRef.current.readyState === WebSocket.CONNECTING)
      ) {
        return;
      }

      const username = user.display_name || user.username || `User #${user.id || ""}`;
      const avatar = user.avatar || "";
      const wsUrl = `${BACKEND_WS}/ws/room/${encodeURIComponent(activeRoomId)}?token=${encodeURIComponent(user.token)}&username=${encodeURIComponent(username)}&avatar=${encodeURIComponent(avatar)}`;

      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        setIsConnected(true);
        setIsReconnecting(false);
        reconnectAttemptsRef.current = 0;

        // Bắt đầu nhịp tim PING định kỳ 15 giây (Giữ kết nối luôn sống, chống Cloudflare Workers đóng do rảnh)
        if (pingIntervalRef.current) clearInterval(pingIntervalRef.current);
        pingIntervalRef.current = setInterval(() => {
          if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
            wsRef.current.send(JSON.stringify({ type: "PING" }));
          }
        }, 15000);
      };

      ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data);
          if (msg.type === "PONG") return; // Bỏ qua phản hồi heartbeat
          handleServerMessage(msg);
        } catch (e) {
          console.error("Lỗi phân tích WebSocket message:", e);
        }
      };

      ws.onclose = (event) => {
        setIsConnected(false);
        if (pingIntervalRef.current) clearInterval(pingIntervalRef.current);

        // Nếu đóng có chủ đích (F5, unmount, ấn rời phòng) thì TUYỆT ĐỐI không hiện popup
        if (isIntentionalCloseRef.current) {
          return;
        }

        // Các mã đóng đặc biệt từ server
        if (event.code === 4001) {
          DarkSwal.fire({
            icon: "info",
            title: "Rời phòng",
            text: "Bạn đã bị chủ phòng mời ra khỏi phòng xem.",
            confirmButtonText: "Về sảnh",
          }).then(() => navigate("/xem-chung"));
          return;
        }
        if (event.code === 4003) {
          DarkSwal.fire({
            icon: "info",
            title: "Rời phòng",
            text: "Phòng đã đầy người xem.",
            confirmButtonText: "Về sảnh",
          }).then(() => navigate("/xem-chung"));
          return;
        }
        if (event.code === 4004) {
          DarkSwal.fire({
            icon: "info",
            title: "Phòng đã giải tán",
            text: "Phòng xem đã được giải tán bởi chủ phòng.",
            confirmButtonText: "Về sảnh",
          }).then(() => navigate("/xem-chung"));
          return;
        }

        // Mất kết nối bất ngờ (do rớt mạng wifi/4G hoặc Cloudflare edge rebalancing): Tự động thử kết nối lại
        if (reconnectAttemptsRef.current < 5) {
          setIsReconnecting(true);
          reconnectAttemptsRef.current += 1;
          const delay = Math.min(4000, reconnectAttemptsRef.current * 1500);
          if (reconnectTimerRef.current) clearTimeout(reconnectTimerRef.current);
          reconnectTimerRef.current = setTimeout(() => {
            if (!isIntentionalCloseRef.current) {
              connectWebSocket();
            }
          }, delay);
          return;
        }

        // Quá 5 lần thử không được mới báo lỗi
        setIsReconnecting(false);
        DarkSwal.fire({
          icon: "warning",
          title: "Mất kết nối",
          text: "Mạng của bạn bị gián đoạn. Bạn có muốn thử kết nối lại không?",
          showCancelButton: true,
          confirmButtonText: "Thử kết nối lại",
          cancelButtonText: "Về sảnh xem chung",
        }).then((res) => {
          if (res.isConfirmed) {
            reconnectAttemptsRef.current = 0;
            connectWebSocket();
          } else {
            navigate("/xem-chung");
          }
        });
      };

      ws.onerror = (err) => {
        console.error("Lỗi kết nối WebSocket:", err);
      };
    };

    connectWebSocket();

    return () => {
      isIntentionalCloseRef.current = true;
      if (reconnectTimerRef.current) clearTimeout(reconnectTimerRef.current);
      if (pingIntervalRef.current) clearInterval(pingIntervalRef.current);
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
      if (elapsedTimerRef.current) {
        clearInterval(elapsedTimerRef.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeRoomId, user?.token, user?.id]);

  // Bộ đếm thời gian đã chiếu
  const startElapsedCounter = useCallback((startedAt) => {
    if (elapsedTimerRef.current) clearInterval(elapsedTimerRef.current);

    const updateTimer = () => {
      // Nếu video đang phát, ưu tiên lấy trực tiếp từ video currentTime để đồng nhất 100%
      if (videoRef.current && !videoRef.current.paused && videoRef.current.currentTime > 0) {
        const sec = Math.floor(videoRef.current.currentTime);
        const h = Math.floor(sec / 3600);
        const m = Math.floor((sec % 3600) / 60);
        const s = sec % 60;
        setElapsedDisplay([h, m, s].map((v) => String(v).padStart(2, "0")).join(":"));
        return;
      }

      const baseStartedAt = startedAt || roomStartedAtRef.current || Date.now();
      const sec = Math.max(0, Math.floor((Date.now() - baseStartedAt) / 1000));
      const h = Math.floor(sec / 3600);
      const m = Math.floor((sec % 3600) / 60);
      const s = sec % 60;
      setElapsedDisplay([h, m, s].map((v) => String(v).padStart(2, "0")).join(":"));
    };

    updateTimer();
    elapsedTimerRef.current = setInterval(updateTimer, 1000);
  }, []);

  // Pre-fetch thông tin phòng qua HTTP để hiển thị ngay lập tức khi vào link phòng
  useEffect(() => {
    if (activeRoomId) {
      fetch(`${BACKEND_HTTP}/api/rooms/${encodeURIComponent(activeRoomId)}`)
        .then((res) => res.json())
        .then((json) => {
          if (json?.success && json?.data && json.data.roomId) {
            setRoomData((prev) => prev || json.data);
            if (json.data.startedAt) {
              roomStartedAtRef.current = json.data.startedAt;
              startElapsedCounter(json.data.startedAt);
            }
          }
        })
        .catch(() => {});
    }
  }, [activeRoomId, startElapsedCounter]);

  // Xử lý các gói tin nhận từ Server
  const handleServerMessage = useCallback((msg) => {
    switch (msg.type) {
      case "ROOM_INIT": {
        setRoomData(msg.room);
        roomStartedAtRef.current = msg.room.startedAt;
        setMembers(msg.members || []);
        startElapsedCounter(msg.room.startedAt);
        break;
      }

      case "USER_JOINED": {
        setMembers((prev) => {
          const exists = prev.some((m) => m.userId === msg.user.userId);
          if (exists) return prev;
          return [...prev, msg.user];
        });
        break;
      }

      case "USER_LEFT": {
        setMembers((prev) => prev.filter((m) => m.userId !== msg.userId));
        break;
      }

      case "CHAT": {
        setMessages((prev) => [...prev, msg]);
        setTimeout(() => {
          if (chatScrollRef.current) {
            chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
          }
        }, 50);
        break;
      }

      case "MEDIA_UPDATED": {
        setRoomData((prev) => (prev ? { ...prev, ...msg.media } : null));
        roomStartedAtRef.current = msg.media.startedAt;
        startElapsedCounter(msg.media.startedAt);
        DarkSwal.fire({
          toast: true,
          position: "top-end",
          icon: "info",
          title: `${msg.changedBy || "Chủ phòng"} đã chuyển sang: ${msg.media.title} (${msg.media.episode})`,
          showConfirmButton: false,
          timer: 3000,
        });
        break;
      }

      case "SYNC_TIME": {
        roomStartedAtRef.current = msg.startedAt;
        setRoomData((prev) => (prev ? { ...prev, startedAt: msg.startedAt } : null));
        startElapsedCounter(msg.startedAt);
        if (videoRef.current) {
          const diff = Math.abs(videoRef.current.currentTime - msg.time);
          if (diff > 1.2) {
            isSeekingFromSyncRef.current = true;
            videoRef.current.currentTime = msg.time;
            if (videoRef.current.paused) {
              videoRef.current.play().catch(() => {});
            }
          }
        }
        break;
      }

      case "HOST_CHANGED": {
        setRoomData((prev) => {
          if (!prev) return null;
          const isMe = user?.id?.toString() === msg.newHostId?.toString();
          return {
            ...prev,
            hostId: msg.newHostId,
            hostUsername: msg.newHostUsername,
            isHost: isMe,
          };
        });
        DarkSwal.fire({
          toast: true,
          position: "top-end",
          icon: "success",
          title: `Chủ phòng mới: ${msg.newHostUsername}`,
          showConfirmButton: false,
          timer: 3000,
        });
        break;
      }

      case "ROOM_DESTROYED": {
        isIntentionalCloseRef.current = true;
        DarkSwal.fire({
          icon: "info",
          title: "Phòng đã giải tán",
          text: msg.reason || "Chủ phòng đã giải tán phòng xem.",
          confirmButtonText: "Về sảnh xem chung",
        }).then(() => {
          navigate("/xem-chung");
        });
        break;
      }

      case "ERROR": {
        setErrorMessage(msg.message);
        setTimeout(() => setErrorMessage(null), 4500);
        break;
      }

      default:
        break;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, startElapsedCounter]);

  // Hành động: Gửi tin nhắn chat
  const handleSendChat = (e) => {
    e.preventDefault();
    const text = chatInput.trim();
    if (!text || !wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return;

    wsRef.current.send(JSON.stringify({ type: "CHAT", text }));
    setChatInput("");
  };

  // Nhận biết nguồn M3U8 trực tiếp
  const isM3u8Stream = useMemo(() => {
    if (!roomData?.videoUrl) return false;
    return (
      roomData.mediaType === "m3u8" ||
      roomData.videoUrl.includes(".m3u8")
    );
  }, [roomData?.videoUrl, roomData?.mediaType]);

  // Chuẩn hóa hiển thị tập phim (Thêm chữ "Tập: ")
  const formatEpisode = useCallback((ep) => {
    if (!ep) return "Tập: 1";
    const epStr = String(ep).trim();
    const numPart = epStr.replace(/^tập\s*:?\s*/i, "");
    return `Tập: ${numPart || epStr}`;
  }, []);

  const displayEpisode = useMemo(() => {
    return formatEpisode(roomData?.episode);
  }, [roomData?.episode, formatEpisode]);

  // Chuẩn hóa tên phòng: Loại bỏ chuỗi tự sinh "Phòng xem [tên phim] - [tập]", giữ đúng tên phòng
  const displayRoomName = useMemo(() => {
    if (!roomData?.roomName) return `Phòng của ${roomData?.hostUsername || "Host"}`;
    const raw = String(roomData.roomName).trim();
    const title = (roomData?.title || "").trim();
    if (
      /^Phòng xem\s+.*?\s*-\s*.*$/i.test(raw) ||
      (title && raw.toLowerCase() === `phòng xem ${title.toLowerCase()}`)
    ) {
      return `Phòng của ${roomData?.hostUsername || "Host"}`;
    }
    return raw;
  }, [roomData?.roomName, roomData?.hostUsername, roomData?.title]);

  // Khởi tạo và tự động tua đến đúng giây đã chiếu bằng Hls.js khi nguồn là M3U8
  useEffect(() => {
    if (!isM3u8Stream || !roomData?.videoUrl) {
      if (hlsInstanceRef.current) {
        try {
          hlsInstanceRef.current.stopLoad();
          hlsInstanceRef.current.detachMedia();
          hlsInstanceRef.current.destroy();
        } catch {}
        hlsInstanceRef.current = null;
      }
      return;
    }

    const video = videoRef.current;
    if (!video) return;

    const targetElapsed = Math.max(0, roomData.elapsedSeconds || 0);

    // Hủy triệt để HLS cũ nếu đang chạy để không giữ bộ đệm video tập cũ
    if (hlsInstanceRef.current) {
      try {
        hlsInstanceRef.current.stopLoad();
        hlsInstanceRef.current.detachMedia();
        hlsInstanceRef.current.destroy();
      } catch {}
      hlsInstanceRef.current = null;
    }

    try {
      video.pause();
      video.removeAttribute("src");
      video.currentTime = targetElapsed;
      video.volume = guestVolume;
      video.muted = isMuted;
      video.load();
    } catch (e) {
      // Ignored
    }

    if (Hls.isSupported()) {
      const hls = new Hls(SMOOTH_HLS_CONFIG);
      hlsInstanceRef.current = hls;
      hls.loadSource(roomData.videoUrl);
      hls.attachMedia(video);

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        if (targetElapsed > 0) {
          video.currentTime = targetElapsed;
        }
        video.play().catch(() => {
          setNeedsUserGesture(true);
        });
      });

      hls.on(Hls.Events.ERROR, (event, data) => {
        if (data.fatal) {
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              console.warn("[HLS] Network error, recovering...", data);
              hls.startLoad();
              break;
            case Hls.ErrorTypes.MEDIA_ERROR:
              console.warn("[HLS] Media error, recovering...", data);
              hls.recoverMediaError();
              break;
            default:
              console.error("[HLS] Unrecoverable fatal error:", data);
              hls.destroy();
              break;
          }
        }
      });
    } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
      // Hỗ trợ HLS Native trên Safari iOS (iPhone / iPad) & Mac
      video.src = roomData.videoUrl;
      const onMetadata = () => {
        if (targetElapsed > 0) {
          video.currentTime = targetElapsed;
        }
        video.play().catch(() => {
          setNeedsUserGesture(true);
        });
      };
      video.addEventListener("loadedmetadata", onMetadata, { once: true });
    }

    return () => {
      if (hlsInstanceRef.current) {
        try {
          hlsInstanceRef.current.stopLoad();
          hlsInstanceRef.current.detachMedia();
          hlsInstanceRef.current.destroy();
        } catch {}
        hlsInstanceRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isM3u8Stream, roomData?.videoUrl, roomData?.mediaType]);

  // Khách tự động kiểm tra và đồng bộ lại nếu bị trôi thời gian so với phòng (vd: mạng lag buffer 3s)
  useEffect(() => {
    if (roomData?.isHost || !videoRef.current || !isConnected) return;
    const interval = setInterval(() => {
      const video = videoRef.current;
      if (!video || video.paused || isSeekingFromSyncRef.current) return;
      const startedAt = roomStartedAtRef.current || roomData?.startedAt;
      if (!startedAt) return;
      const expectedTime = Math.max(0, (Date.now() - startedAt) / 1000);
      const diff = Math.abs(video.currentTime - expectedTime);
      if (diff > 3.0) {
        isSeekingFromSyncRef.current = true;
        video.currentTime = expectedTime;
        if (video.paused) video.play().catch(() => {});
      }
    }, 4000);
    return () => clearInterval(interval);
  }, [roomData?.isHost, isConnected, roomData?.startedAt]);

  // Bật tiếng và phát video khi bị trình duyệt chặn Autoplay có âm thanh
  const handleUnmuteAndPlay = () => {
    if (videoRef.current) {
      if (roomData?.elapsedSeconds) {
        videoRef.current.currentTime = roomData.elapsedSeconds;
      }
      videoRef.current.play();
      setNeedsUserGesture(false);
    }
  };

  // Kiểm tra server hiện tại có phải là server KK không
  const isKkServer = useMemo(() => {
    // 1. Kiểm tra từ server của tập phim đang phát trong danh sách movieServers
    if (movieServers && movieServers.length > 0) {
      const playingServer = movieServers.find((srv) =>
        srv.episodes?.some(
          (ep) =>
            (ep.m3u8Url && ep.m3u8Url === roomData?.videoUrl) ||
            (ep.link_m3u8 && ep.link_m3u8 === roomData?.videoUrl) ||
            (ep.m3u8 && ep.m3u8 === roomData?.videoUrl)
        )
      );
      if (playingServer) {
        return Boolean(
          playingServer.sourceName === "KK" ||
          /kk/i.test(playingServer.server_name || "") ||
          /kk/i.test(playingServer.display_name || "")
        );
      }

      // Kiểm tra server đang chọn ở tab server
      const currentSrv = movieServers[selectedServerIdx];
      if (currentSrv) {
        return Boolean(
          currentSrv.sourceName === "KK" ||
          /kk/i.test(currentSrv.server_name || "") ||
          /kk/i.test(currentSrv.display_name || "")
        );
      }
    }

    // 2. Fallback nếu movieServers chưa load xong
    if (selectedMovie?.sourceName === "KK" || selectedMovie?.source === "kk" || selectedMovie?.source === "kkphim") {
      return true;
    }
    if (roomData?.videoUrl && /phimapi|kkphim|phim128/i.test(roomData.videoUrl)) {
      return true;
    }
    if (roomData?.videoUrl && /nguonc|embed69/i.test(roomData.videoUrl)) {
      return false;
    }

    return false;
  }, [movieServers, selectedServerIdx, roomData?.videoUrl, selectedMovie]);

  // Cập nhật trạng thái hiển thị nút bỏ qua quảng cáo (từ 14:57 [897s] đến 15:31 [931s])
  const updateSkipAdState = useCallback((cur) => {
    if (!roomData?.isHost || !isKkServer) {
      setShowSkipAd((prev) => (prev ? false : prev));
      return;
    }
    if (cur < 897) {
      adSkippedRef.current = false;
      setShowSkipAd((prev) => (prev ? false : prev));
    } else if (cur >= 897 && cur <= 931) {
      if (!adSkippedRef.current) {
        setShowSkipAd((prev) => (!prev ? true : prev));
      }
    } else {
      setShowSkipAd((prev) => (prev ? false : prev));
    }
  }, [roomData?.isHost, isKkServer]);

  // Click nút Bỏ qua quảng cáo: Tua thẳng đến 15:31 (931s) và đồng bộ ngay cho cả phòng
  const handleSkipAd = (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (!videoRef.current) return;

    const targetTime = 931; // 15:31
    videoRef.current.currentTime = targetTime;
    adSkippedRef.current = true;
    setShowSkipAd(false);

    const newStartedAt = Date.now() - targetTime * 1000;
    setRoomData((prev) => (prev ? { ...prev, startedAt: newStartedAt } : null));
    startElapsedCounter(newStartedAt);
    setElapsedDisplay("00:15:31");

    if (
      roomData?.isHost &&
      wsRef.current &&
      wsRef.current.readyState === WebSocket.OPEN
    ) {
      wsRef.current.send(
        JSON.stringify({
          type: "SYNC_TIME",
          time: targetTime,
        })
      );
    }
  };

  // Cập nhật mốc "Đã chiếu: 00:15:00" theo đúng thời gian video phát thực tế
  const handleTimeUpdate = () => {
    if (videoRef.current) {
      if (!videoRef.current.paused) {
        const sec = Math.floor(videoRef.current.currentTime);
        const h = Math.floor(sec / 3600);
        const m = Math.floor((sec % 3600) / 60);
        const s = sec % 60;
        setElapsedDisplay([h, m, s].map((v) => String(v).padStart(2, "0")).join(":"));
      }
      updateSkipAdState(videoRef.current.currentTime);
    }
  };

  // Đồng bộ khi chủ phòng tua video M3U8 (vd tua từ phút 1 sang phút 15)
  const handleHostSeeked = () => {
    if (!videoRef.current) return;
    const currentSeconds = Math.floor(videoRef.current.currentTime);
    updateSkipAdState(videoRef.current.currentTime);
    const newStartedAt = Date.now() - currentSeconds * 1000;
    roomStartedAtRef.current = newStartedAt;

    // Cập nhật ngay bộ đếm cho bản thân chủ phòng để mục "Đã chiếu" nhảy ngay lập tức sang thời gian mới
    const h = Math.floor(currentSeconds / 3600);
    const m = Math.floor((currentSeconds % 3600) / 60);
    const s = currentSeconds % 60;
    setElapsedDisplay([h, m, s].map((v) => String(v).padStart(2, "0")).join(":"));
    startElapsedCounter(newStartedAt);
    setRoomData((prev) => (prev ? { ...prev, startedAt: newStartedAt } : null));

    if (
      roomData?.isHost &&
      wsRef.current &&
      wsRef.current.readyState === WebSocket.OPEN
    ) {
      wsRef.current.send(
        JSON.stringify({
          type: "SYNC_TIME",
          time: currentSeconds,
        })
      );
    }
  };

  // Đồng bộ khi chủ phòng Pause / Play
  const handleHostPause = () => {
    if (!videoRef.current || !roomData?.isHost) return;
    const currentSeconds = Math.floor(videoRef.current.currentTime);
    const newStartedAt = Date.now() - currentSeconds * 1000;
    roomStartedAtRef.current = newStartedAt;
    setRoomData((prev) => (prev ? { ...prev, startedAt: newStartedAt } : null));
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(
        JSON.stringify({
          type: "SYNC_TIME",
          time: currentSeconds,
        })
      );
    }
  };

  const handleHostPlay = () => {
    if (!videoRef.current || !roomData?.isHost) return;
    const currentSeconds = Math.floor(videoRef.current.currentTime);
    const newStartedAt = Date.now() - currentSeconds * 1000;
    roomStartedAtRef.current = newStartedAt;
    setRoomData((prev) => (prev ? { ...prev, startedAt: newStartedAt } : null));
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(
        JSON.stringify({
          type: "SYNC_TIME",
          time: currentSeconds,
        })
      );
    }
  };

  // Heartbeat định kỳ 15s để giữ startedAt trên server luôn tươi mới nhất cho người mới vào phòng
  useEffect(() => {
    if (!roomData?.isHost || !videoRef.current) return;
    const interval = setInterval(() => {
      if (
        wsRef.current &&
        wsRef.current.readyState === WebSocket.OPEN &&
        videoRef.current &&
        !videoRef.current.paused &&
        videoRef.current.currentTime > 0
      ) {
        const currentSeconds = Math.floor(videoRef.current.currentTime);
        wsRef.current.send(
          JSON.stringify({
            type: "SYNC_TIME",
            time: currentSeconds,
          })
        );
      }
    }, 15000);
    return () => clearInterval(interval);
  }, [roomData?.isHost]);

  // Link Embed kèm tham số thời gian
  const embedUrlWithParams = useMemo(() => {
    if (!roomData?.videoUrl) return "";
    const url = roomData.videoUrl;
    const separator = url.includes("?") ? "&" : "?";
    const t = Math.max(0, roomData.elapsedSeconds || 0);
    return `${url}${separator}autoplay=1&t=${t}&start=${t}#t=${t}`;
  }, [roomData?.videoUrl, roomData?.elapsedSeconds]);

  // Hành động: Đuổi người dùng
  const handleKickUser = (targetUserId, targetUsername) => {
    DarkSwal.fire({
      icon: "warning",
      title: "Mời ra khỏi phòng?",
      text: `Bạn có chắc muốn mời "${targetUsername}" ra khỏi phòng xem không?`,
      showCancelButton: true,
      confirmButtonText: "Đuổi ngay",
      cancelButtonText: "Hủy",
      confirmButtonColor: "#ef4444",
    }).then((res) => {
      if (res.isConfirmed && wsRef.current) {
        wsRef.current.send(JSON.stringify({ type: "KICK_USER", targetUserId }));
      }
    });
  };

  // Hành động: Hủy phòng xem hoàn toàn (Chỉ dành cho chủ phòng)
  const handleHostDestroyRoom = () => {
    DarkSwal.fire({
      icon: "warning",
      title: "Giải tán phòng xem?",
      text: "Hành động này sẽ đóng phòng xem ngay lập tức, đưa tất cả khán giả về sảnh và xóa toàn bộ dữ liệu phòng. Bạn có chắc chắn không?",
      showCancelButton: true,
      confirmButtonText: "Đồng ý giải tán phòng",
      cancelButtonText: "Hủy",
      confirmButtonColor: "#ef4444",
    }).then((res) => {
      if (res.isConfirmed && wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({ type: "DESTROY_ROOM" }));
      }
    });
  };

  // Hành động: Rời phòng (Nếu là chủ phòng sẽ hỏi muốn chuyển quyền hay giải tán luôn)
  const handleLeaveOrDestroyRoom = () => {
    if (roomData?.isHost) {
      DarkSwal.fire({
        icon: "question",
        title: "Tùy chọn rời phòng",
        text: "Bạn đang là chủ phòng. Bạn muốn rời đi và chuyển quyền chủ phòng cho người khác, hay giải tán phòng xem hoàn toàn?",
        showDenyButton: true,
        showCancelButton: true,
        confirmButtonText: "Chuyển quyền",
        denyButtonText: "Giải tán",
        cancelButtonText: "Ở lại",
        confirmButtonColor: "#3b82f6",
        denyButtonColor: "#ef4444",
      }).then((result) => {
        if (result.isConfirmed) {
          isIntentionalCloseRef.current = true;
          navigate("/xem-chung");
        } else if (result.isDenied) {
          isIntentionalCloseRef.current = true;
          if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
            wsRef.current.send(JSON.stringify({ type: "DESTROY_ROOM" }));
          }
        }
      });
    } else {
      isIntentionalCloseRef.current = true;
      navigate("/xem-chung");
    }
  };

  // Hành động: Copy link phòng
  const handleCopyInvite = () => {
    const inviteUrl = `${window.location.origin}/xem-chung/${activeRoomId}`;
    navigator.clipboard.writeText(inviteUrl);
    DarkSwal.fire({
      toast: true,
      position: "top-end",
      icon: "success",
      title: "Đã sao chép liên kết phòng xem!",
      showConfirmButton: false,
      timer: 2000,
    });
  };

  // Tạo phòng mới qua HTTP API
  const handleCreateRoomSubmit = async (e) => {
    e.preventDefault();
    if (!user || !user.token) {
      DarkSwal.fire({
        icon: "warning",
        title: "Chưa đăng nhập",
        text: "Vui lòng đăng nhập trước khi tạo phòng xem!",
      });
      return;
    }

    if (!formTitle.trim()) {
      DarkSwal.fire({ icon: "warning", title: "Thiếu tên phim", text: "Vui lòng chọn hoặc nhập tên bộ phim muốn xem!" });
      return;
    }

    if (!formVideoUrl.trim()) {
      DarkSwal.fire({
        icon: "warning",
        title: "Chưa chọn tập phim",
        text: "Vui lòng chọn tập phim trong danh sách để phát tự động!",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch(`${BACKEND_HTTP}/api/rooms`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
        body: JSON.stringify({
          roomName: formRoomName.trim() || `Phòng của ${user?.display_name || user?.username || "Tôi"}`,
          title: formTitle.trim(),
          episode: formEpisode.trim() || "Tập 1",
          videoUrl: formVideoUrl.trim(),
          mediaType: formMediaType,
          movieSlug: selectedMovie?.slug || "",
          username: user.display_name || user.username,
        }),
      });

      const data = await res.json();
      if (data.success && data.data?.roomId) {
        setShowCreateModal(false);
        navigate(`/xem-chung/${data.data.roomId}`);
      } else {
        DarkSwal.fire({ icon: "error", title: "Lỗi tạo phòng", text: data.message || "Không thể khởi tạo phòng" });
      }
    } catch (err) {
      DarkSwal.fire({ icon: "error", title: "Lỗi kết nối", text: err.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Lọc phòng ở trang Lobby
  const filteredRooms = useMemo(() => {
    if (!searchQuery.trim()) return activeRooms;
    const q = searchQuery.toLowerCase();
    return activeRooms.filter(
      (r) =>
        (r.title && r.title.toLowerCase().includes(q)) ||
        (r.roomName && r.roomName.toLowerCase().includes(q)) ||
        (r.hostUsername && r.hostUsername.toLowerCase().includes(q)) ||
        (r.roomId && r.roomId.toLowerCase().includes(q))
    );
  }, [activeRooms, searchQuery]);

  // Render: Nếu đang trong phòng xem (`activeRoomId`)
  if (activeRoomId) {
    return (
      <div className="watch-party-room-page">
        <Helmet>
          <title>{roomData?.title ? `${roomData.title} - Xem Chung` : "Phòng Xem Chung"} | Tecede</title>
        </Helmet>

        {/* Top Navbar của phòng xem */}
        <header className="room-header">
          <div className="room-header-left">
            <button className="btn-back-lobby" onClick={handleLeaveOrDestroyRoom} title="Quay lại danh sách phòng">
              <FaArrowLeft />
              <span className="btn-leave-text">Rời phòng</span>
            </button>
            <div className="room-meta">
              <h1 className="room-movie-title">{roomData?.title || "Đang tải phim..."}</h1>
              <div className="room-sub-meta">
                <span className="room-episode-tag">{displayEpisode}</span>
                <span className="room-name-tag">{displayRoomName}</span>
                <span className="room-host-tag">
                  <FaCrown className="host-icon" /> {roomData?.hostUsername || "Host"}
                </span>
              </div>
            </div>
          </div>

          <div className="room-header-right">
            {isReconnecting && (
              <div className="reconnecting-badge-header" title="Đang thử kết nối lại...">
                <FaSyncAlt className="spin" />
                <span className="d-none d-sm-inline">Đang kết nối lại...</span>
              </div>
            )}

            <div className="elapsed-timer-badge" title={`Đã chiếu: ${elapsedDisplay}`}>
              <FaClock />
              <span className="timer-label">Đã chiếu: </span>
              <strong>{elapsedDisplay}</strong>
            </div>

            <button className="btn-share-room" onClick={handleCopyInvite} title="Sao chép link mời bạn bè">
              <FaShareAlt />
              <span className="d-none d-md-inline">Mời bạn</span>
            </button>

            {roomData?.isHost && (
              <button
                className={`btn-host-toggle ${showHostPanel ? "active" : ""}`}
                onClick={() => setShowHostPanel(!showHostPanel)}
                title="Bảng điều khiển chủ phòng"
              >
                <FaSlidersH />
                <span className="d-none d-md-inline">Chủ phòng</span>
              </button>
            )}
          </div>
        </header>

        {/* Nội dung phòng: Bên trái Video Player, bên phải Khung Chat & Viewers */}
        <div className="room-body-grid">
          {/* Cột trái: Trình phát Video & Host Panel */}
          <main className="room-player-column">
            {/* Host Control Box */}
            {roomData?.isHost && showHostPanel && (
              <div className="host-controls-card">
                <div className="host-card-header">
                  <div className="header-title-row">
                    <h3 title="Bảng Điều Khiển Chủ Phòng">
                      <FaCrown className="crown-icon" />
                      <span className="host-panel-title-text">Bảng Điều Khiển Chủ Phòng</span>
                    </h3>
                  </div>
                  <div className="header-actions-row">
                    <button
                      type="button"
                      className={`btn-toggle-search-movie ${hostSearchMode ? "active" : ""}`}
                      onClick={() => setHostSearchMode(!hostSearchMode)}
                    >
                      {hostSearchMode ? (
                        <>
                          <FaArrowLeft /> Quay lại chọn tập
                        </>
                      ) : (
                        <>
                          <FaFilm /> Đổi phim khác
                        </>
                      )}
                    </button>
                    <button
                      type="button"
                      className="btn-destroy-room"
                      onClick={handleHostDestroyRoom}
                      title="Giải tán phòng xem và xóa dữ liệu hoàn toàn"
                    >
                      <FaTrashAlt /> Giải tán
                    </button>
                    <button
                      type="button"
                      className="btn-close-host-panel"
                      onClick={() => setShowHostPanel(false)}
                      title="Đóng bảng điều khiển"
                    >
                      ×
                    </button>
                  </div>
                </div>

                {hostSearchMode ? (
                  /* Giao diện Đổi Phim Khác: Tìm kiếm phim thông minh từ KK & NC */
                  <div className="host-movie-search-section">
                    <div className="host-search-input-box">
                      <FaSearch className="search-icon" />
                      <input
                        type="text"
                        placeholder="Gõ tên phim mới bạn muốn đổi (vd: Doraemon, Naruto, Spider-Man...)"
                        value={hostMovieSearchText}
                        onChange={(e) => setHostMovieSearchText(e.target.value)}
                        autoFocus
                      />
                      {isSearchingHostMovie && <div className="search-spinner" />}
                    </div>

                    {hostMovieSearchResults.length > 0 ? (
                      <ul className="host-movie-results-list custom-scroll">
                        {hostMovieSearchResults.map((m) => (
                          <li
                            key={`${m.slug}-${m.sourceName}`}
                            className="host-result-item"
                            onClick={() => handleSelectMovie(m, true)}
                          >
                            <img
                              src={m.poster_url || m.thumb_url || "https://placehold.co/45x60/1a1a2e/ffffff?text=Film"}
                              alt={m.name}
                              className="result-poster"
                              onError={(e) => {
                                e.target.src = "https://placehold.co/45x60/1a1a2e/ffffff?text=Film";
                              }}
                            />
                            <div className="result-info">
                              <strong className="result-title">{m.name}</strong>
                              <span className="result-origin">{m.original_name || ""}</span>
                              <div className="result-badges">
                                <span className={`badge-tag badge-tag--source badge-tag--source-${m.sourceName?.toLowerCase()}`}>
                                  {m.sourceName}
                                </span>
                                {m.quality && <span className="badge-tag badge-tag--quality">{m.quality}</span>}
                                {m.year && m.year !== "N/A" && <span className="badge-tag badge-tag--year">{m.year}</span>}
                                {m.current_episode && <span className="badge-tag badge-tag--ep">{m.current_episode}</span>}
                              </div>
                            </div>
                            <button type="button" className="btn-choose-this-movie">
                              <FaPlay /> Chọn & Phát
                            </button>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      hostMovieSearchText.trim().length >= 2 && !isSearchingHostMovie && (
                        <div className="host-no-results">
                          Không tìm thấy phim phù hợp với từ khóa "{hostMovieSearchText}".
                        </div>
                      )
                    )}
                  </div>
                ) : (
                  /* Giao diện Đổi Tập & Server của Phim Hiện Tại */
                  <div className="host-current-movie-section">
                    <div className="current-movie-overview">
                      <div className="movie-details">
                        <span className="label-sub">Đang chiếu:</span>
                        <strong className="current-movie-name">{roomData?.title || selectedMovie?.name}</strong>
                        <span className="current-movie-ep">{displayEpisode}</span>
                      </div>
                    </div>

                    {isLoadingDetail ? (
                      <div className="loading-episodes-host">
                        <div className="spinner-border spinner-border-sm text-info" role="status" />
                        <span>Đang tải danh sách tập & server...</span>
                      </div>
                    ) : (
                      <>
                        {/* Chọn Server nếu có nhiều hơn 1 nguồn */}
                        {movieServers.length > 1 && (
                          <div className="host-server-selector">
                            <label><FaServer /> Nguồn / Server ({movieServers.length}):</label>
                            <div className="server-chips-row">
                              {movieServers.map((srv, idx) => (
                                <button
                                  key={idx}
                                  type="button"
                                  className={`host-srv-chip ${idx === selectedServerIdx ? "active" : ""}`}
                                  onClick={() => handleHostSelectServer(idx)}
                                >
                                  {srv.display_name || srv.server_name || `Server ${idx + 1}`}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Danh sách tập phim để chủ phòng bấm chọn */}
                        <div className="host-episode-selector">
                          <label><FaListOl /> Danh sách tập ({movieEpisodes.length} tập):</label>
                          {movieEpisodes.length > 0 ? (
                            <div className="host-episode-grid custom-scroll">
                              {movieEpisodes.map((ep, idx) => {
                                const isActive =
                                  (roomData?.videoUrl &&
                                    (ep.m3u8Url === roomData.videoUrl ||
                                      ep.link_m3u8 === roomData.videoUrl ||
                                      ep.m3u8 === roomData.videoUrl)) ||
                                  roomData?.episode === ep.name;
                                return (
                                  <button
                                    key={idx}
                                    type="button"
                                    className={`host-ep-chip ${isActive ? "active" : ""}`}
                                    onClick={() => handleHostChangeEpisode(ep)}
                                  >
                                    {isActive && <FaCheck className="ep-check-icon" />}
                                    {ep.name || `Tập ${idx + 1}`}
                                  </button>
                                );
                              })}
                            </div>
                          ) : (
                            <div className="no-episodes-alert">
                              Đang tải hoặc phim không có nguồn M3U8 từ KK / NC.
                            </div>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Khung video Player (M3U8 HLS tự động đồng bộ hoặc Embed Iframe) */}
            <div className="video-player-wrapper" ref={playerWrapperRef}>
              {roomData?.videoUrl ? (
                isM3u8Stream ? (
                  <div
                    className={`hls-video-container ${!roomData?.isHost ? "guest-mode" : ""} ${!showGuestControls && !roomData?.isHost ? "hide-cursor" : ""}`}
                    onMouseMove={!roomData?.isHost ? handlePlayerMouseMove : undefined}
                    onMouseLeave={!roomData?.isHost ? handlePlayerMouseLeave : undefined}
                    onClick={!roomData?.isHost ? handlePlayerMouseMove : undefined}
                  >
                    <video
                      key={roomData?.videoUrl || "watch-party-video"}
                      ref={videoRef}
                      className={`watch-party-video-element ${!roomData?.isHost ? "guest-video-element" : ""}`}
                      controls={Boolean(roomData?.isHost)}
                      playsInline
                      webkit-playsinline="true"
                      x5-playsinline="true"
                      x-webkit-airplay="allow"
                      tabIndex={roomData?.isHost ? 0 : -1}
                      onSeeked={() => {
                        if (roomData?.isHost) {
                          handleHostSeeked();
                        } else {
                          isSeekingFromSyncRef.current = false;
                        }
                      }}
                      onCanPlay={() => {
                        if (!roomData?.isHost) {
                          isSeekingFromSyncRef.current = false;
                        }
                      }}
                      onTimeUpdate={handleTimeUpdate}
                      onPause={
                        roomData?.isHost
                          ? handleHostPause
                          : () => {
                              if (videoRef.current && isConnected) {
                                videoRef.current.play().catch(() => {});
                              }
                            }
                      }
                      onPlay={roomData?.isHost ? handleHostPlay : undefined}
                    />

                    {/* Nút thoát toàn màn hình nổi tiện lợi cho mobile / tablet */}
                    {isFullscreen && (
                      <button
                        type="button"
                        className="btn-exit-fullscreen-float"
                        onClick={toggleFullscreen}
                        title="Thu nhỏ màn hình"
                      >
                        <FaCompress />
                        <span>Thu nhỏ</span>
                      </button>
                    )}

                    {/* Nút Bỏ qua quảng cáo cho chủ phòng khi server là KK (từ 14:57 đến 15:31) */}
                    {roomData?.isHost && showSkipAd && (
                      <button
                        type="button"
                        className="btn-skip-ad"
                        onClick={handleSkipAd}
                        title="Bỏ qua quảng cáo đến 15:31"
                      >
                        <span>Bỏ qua quảng cáo</span>
                        <FaForwardStep />
                      </button>
                    )}

                    {/* Thanh điều khiển riêng cho khách: Chỉ có Mute/Volume và Fullscreen, TUYỆT ĐỐI KHÔNG TUA HAY PAUSE ĐƯỢC */}
                    {!roomData?.isHost && (
                      <div className={`guest-player-bar ${showGuestControls ? "visible" : ""}`}>
                        <div className="guest-bar-right">
                          <button
                            type="button"
                            className="btn-guest-action"
                            onClick={toggleMute}
                            title={isMuted || guestVolume === 0 ? "Bật âm thanh" : "Tắt âm thanh"}
                          >
                            {isMuted || guestVolume === 0 ? <FaVolumeMute /> : <FaVolumeUp />}
                          </button>
                          <input
                            type="range"
                            min="0"
                            max="1"
                            step="0.05"
                            value={isMuted ? 0 : guestVolume}
                            onChange={handleGuestVolumeChange}
                            className="guest-volume-slider"
                            title="Âm lượng"
                          />
                          <button
                            type="button"
                            className="btn-guest-action"
                            onClick={toggleFullscreen}
                            title={isFullscreen ? "Thu nhỏ màn hình" : "Toàn màn hình"}
                          >
                            {isFullscreen ? <FaCompress /> : <FaExpand />}
                          </button>
                        </div>
                      </div>
                    )}

                    {needsUserGesture && (
                      <div className="autoplay-unmute-overlay" onClick={handleUnmuteAndPlay}>
                        <div className="unmute-card">
                          <FaPlay className="play-pulse-icon" />
                          <h4>Bấm vào đây để xem phim</h4>
                          <p>Phim đã phát được {elapsedDisplay}. Bấm để phát tiếng và cùng xem với mọi người!</p>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="embed-video-container">
                    <iframe
                      title="Phim xem chung"
                      src={embedUrlWithParams}
                      allow="autoplay; fullscreen; encrypted-media; picture-in-picture"
                      allowFullScreen
                      className="watch-party-iframe"
                    />
                    <div className="embed-time-sync-bar">
                      <div className="sync-bar-left">
                        <span className="badge-embed-tag">Nguồn Embed</span>
                        <span className="sync-time-text">
                          <FaClock /> Thời gian phòng: <strong>{elapsedDisplay}</strong>
                        </span>
                      </div>
                      <span className="sync-bar-desc">
                        (Nếu phim chưa tự tua, bạn vui lòng bấm Play và kéo thanh thời gian đến <strong>{elapsedDisplay}</strong> để xem đúng đoạn cùng phòng nhé!)
                      </span>
                    </div>
                  </div>
                )
              ) : (
                <div className="empty-player-placeholder">
                  <FaFilm className="placeholder-icon" />
                  <p>Chưa có video được phát trong phòng này</p>
                  {roomData?.isHost && (
                    <button className="btn-add-media" onClick={() => setShowHostPanel(true)}>
                      Thêm link phim ngay
                    </button>
                  )}
                </div>
              )}
            </div>
          </main>

          {/* Cột phải: Chat & Danh sách người đang xem */}
          <aside className="room-sidebar-column">
            {/* Viewers bar */}
            <div className="viewers-card">
              <div className="viewers-card-header">
                <span className="viewers-count">
                  <FaUsers /> Người đang xem (<strong>{members.length}</strong>)
                </span>
                <span className="live-status-pill">
                  <FaCircle className="live-dot" /> LIVE
                </span>
              </div>
              <div className="viewers-avatar-list">
                {members.map((m) => (
                  <div key={m.userId} className="viewer-chip" title={m.username}>
                    {m.isHost && <FaCrown className="crown-badge" />}
                    <span className="viewer-name">{m.username}</span>
                    {roomData?.isHost && !m.isHost && (
                      <button
                        className="btn-kick-user"
                        onClick={() => handleKickUser(m.userId, m.username)}
                        title="Mời ra khỏi phòng"
                      >
                        <FaBan />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Live Chat Box */}
            <div className="chat-card">
              <div className="chat-card-header">
                <FaComments className="chat-icon" />
                <span>Trò Chuyện Trực Tiếp</span>
                <span className="chat-badge">Real-time</span>
              </div>

              {/* Chat Message List */}
              <div className="chat-message-list" ref={chatScrollRef}>
                {messages.length === 0 ? (
                  <div className="empty-chat-state">
                    <p>Chào mừng đến với phòng xem chung!</p>
                    <span>Hãy gửi lời chào đầu tiên tới mọi người nhé.</span>
                  </div>
                ) : (
                  messages.map((msg) => {
                    const isMe = user?.id?.toString() === msg.userId?.toString();
                    const timeStr = new Date(msg.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
                    return (
                      <div key={msg.id} className={`chat-item ${isMe ? "chat-item--me" : ""}`}>
                        <div className="chat-item-header">
                          <span className={`sender-name ${msg.isHost ? "sender-name--host" : ""}`}>
                            {msg.isHost && <FaCrown className="host-mini-crown" />}
                            {msg.username}
                          </span>
                          <span className="send-time">{timeStr}</span>
                        </div>
                        <div className="chat-bubble">{msg.text}</div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Anti-spam error alert */}
              {errorMessage && (
                <div className="anti-spam-alert">
                  <FaExclamationTriangle />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Chat Form */}
              <form onSubmit={handleSendChat} className="chat-input-form">
                <input
                  type="text"
                  maxLength={200}
                  placeholder="Nhập tin nhắn (tối đa 200 ký tự)..."
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  disabled={!isConnected}
                />
                <button type="submit" disabled={!isConnected || !chatInput.trim()}>
                  <FaPaperPlane />
                </button>
              </form>
            </div>
          </aside>
        </div>
      </div>
    );
  }

  // Render: Trang Sảnh Phòng Xem Chung (Lobby)
  return (
    <div className="watch-party-lobby-wrapper">
      <div className="watch-party-lobby-page">
        <Helmet>
        <title>Xem Chung Phim Trực Tiếp (Watch Party) | Tecede</title>
        <meta name="description" content="Xem phim cùng bạn bè theo thời gian thực, trò chuyện trực tiếp và chia sẻ khoảnh khắc điện ảnh đáng nhớ." />
      </Helmet>

      {/* Hero Header Banner (Đã thu gọn kích thước tinh tế) */}
      <section className="lobby-hero-banner">
        <div className="hero-content">
          <div className="hero-badge">
            <span className="live-dot" /> TÍNH NĂNG MỚI: WATCH PARTY
          </div>
          <h1 className="hero-title">
            Phòng Xem Chung <span className="highlight-text">Trực Tiếp</span>
          </h1>
          <p className="hero-desc">
            Xem phim cùng bạn bè theo thời gian thực, tự động đồng bộ và chat trực tiếp mà không cần cài đặt phần mềm.
          </p>

          <div className="hero-actions">
            <button className="btn-create-room-hero" onClick={handleOpenCreateModal}>
              <FaPlus /> Tạo Phòng Ngay
            </button>
            <button
              className="btn-join-code-hero"
              onClick={() => {
                DarkSwal.fire({
                  title: "Nhập mã phòng xem",
                  input: "text",
                  inputPlaceholder: "Ví dụ: room-abc-123",
                  showCancelButton: true,
                  confirmButtonText: "Vào phòng",
                  cancelButtonText: "Hủy",
                }).then((res) => {
                  if (res.isConfirmed && res.value?.trim()) {
                    navigate(`/xem-chung/${res.value.trim()}`);
                  }
                });
              }}
            >
              <FaDoorOpen /> Vào bằng mã phòng
            </button>
          </div>
        </div>
      </section>

      {/* Search & Filter Bar */}
      <section className="lobby-filter-bar">
        <div className="search-box-wrapper">
          <FaSearch className="search-icon" />
          <input
            type="text"
            placeholder="Tìm phòng theo tên phim, tên phòng hoặc chủ phòng..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="filter-actions">
          <button className="btn-refresh-rooms" onClick={fetchRooms} title="Làm mới danh sách">
            <FaSyncAlt className={isLoadingRooms ? "spin" : ""} />
            <span>Làm mới</span>
          </button>
        </div>
      </section>

      {/* Grid Danh Sách Phòng Đang Chiếu */}
      <section className="lobby-rooms-section">
        <div className="section-header">
          <h2>
            <FaTv className="sec-icon" /> Các phòng đang công chiếu (<strong>{filteredRooms.length}</strong>)
          </h2>
          <span className="section-note">Tham gia ngay để xem cùng mọi người</span>
        </div>

        {isLoadingRooms ? (
          <div className="loading-state">
            <div className="spinner-border text-info" role="status"></div>
            <p>Đang tìm kiếm các phòng xem trực tiếp...</p>
          </div>
        ) : filteredRooms.length === 0 ? (
          <div className="empty-rooms-card">
            <FaUsers className="empty-icon" />
            <h3>Chưa có phòng xem nào đang mở</h3>
            <p>Hãy là người đầu tiên tạo phòng xem chung để cùng thưởng thức phim với bạn bè!</p>
            <button className="btn-create-empty" onClick={handleOpenCreateModal}>
              <FaPlus /> Tạo phòng đầu tiên ngay
            </button>
          </div>
        ) : (
          <div className="rooms-grid">
            {filteredRooms.map((room) => {
              const elapsedMins = Math.floor((Date.now() - (room.startedAt || Date.now())) / 60000);
              const thumb = roomThumbnails[room.roomId];
              return (
                <div
                  key={room.roomId}
                  className={`room-card ${thumb ? "has-thumb" : ""}`}
                  onClick={() => navigate(`/xem-chung/${room.roomId}`)}
                >
                  {/* Ảnh Thumbnail từ API chi tiết làm background */}
                  {thumb && (
                    <div
                      className="room-card-bg"
                      style={{ backgroundImage: `url(${thumb})` }}
                    />
                  )}
                  <div className="room-card-overlay" />

                  <div className="room-card-badge-row">
                    <span className="live-pill">
                      <FaCircle className="live-dot" /> LIVE
                    </span>
                    <span className="viewers-pill">
                      <FaUsers /> {room.viewersCount || 1} người
                    </span>
                  </div>

                  <div className="room-card-content">
                    <h3 className="room-card-title">{room.title || "Phim xem chung"}</h3>
                    <p className="room-card-name">{room.roomName}</p>

                    <div className="room-card-footer">
                      <span className="room-episode-badge">{formatEpisode(room.episode)}</span>
                      <span className="room-host-info">
                        <FaCrown /> {room.hostUsername || "Host"}
                      </span>
                    </div>

                    <div className="room-card-action">
                      <span className="elapsed-text">Đã phát ~{elapsedMins > 0 ? `${elapsedMins} phút` : "vừa mới"}</span>
                      <button className="btn-join-card">
                        <FaPlay /> Vào xem
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Modal Tạo Phòng Mới Thông Minh (Tự Tìm Phim & Chọn Tập, Không Cần Lấy Link) */}
      {showCreateModal && (
        <div className="modal-backdrop" onClick={() => setShowCreateModal(false)}>
          <div className="modal-create-card modal-create-card--smart" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2><FaPlus /> Tạo Phòng Xem Chung</h2>
              <button className="btn-close-modal" onClick={() => setShowCreateModal(false)}>×</button>
            </div>

            <form onSubmit={handleCreateRoomSubmit} className="modal-form">
              {/* 1. Thanh tìm kiếm chọn phim (Tái sử dụng logic tìm kiếm trang chủ) */}
              <div className="form-group">
                <label className="label-highlight">
                  <FaFilm /> Chọn phim bạn muốn xem chung:
                </label>

                {!selectedMovie ? (
                  <div className="smart-search-box">
                    <div className="smart-input-wrapper">
                      <FaSearch className="smart-search-icon" />
                      <input
                        ref={searchInputRef}
                        type="text"
                        placeholder="Gõ tên phim để tìm (vd: Naruto, Spider-Man, Lật Mặt...)"
                        value={movieSearchText}
                        onChange={(e) => setMovieSearchText(e.target.value)}
                        autoFocus
                      />
                      {isSearchingMovie && <div className="smart-search-spinner" />}
                    </div>

                    {/* Danh sách gợi ý phim tìm được (Full data & Tags) */}
                    {movieSearchResults.length > 0 && (
                      <ul className="smart-suggestions-list custom-scroll">
                        {movieSearchResults.map((m) => (
                          <li
                            key={`${m.slug}-${m.sourceName}`}
                            onClick={() => handleSelectMovie(m)}
                            className="suggestion-item"
                          >
                            <div className="suggestion-poster-wrapper">
                              {m.sourceName && (
                                <span className={`poster-source-badge source-${m.sourceName?.toLowerCase()}`}>
                                  {m.sourceName}
                                </span>
                              )}
                              <img
                                src={m.poster_url || m.thumb_url || "https://placehold.co/60x80/1a1a2e/ffffff?text=Film"}
                                alt={m.name}
                                className="suggestion-poster"
                                onError={(e) => {
                                  e.target.src = "https://placehold.co/60x80/1a1a2e/ffffff?text=Film";
                                }}
                              />
                            </div>
                            <div className="suggestion-info">
                              <strong className="suggestion-title">{m.name}</strong>
                              <span className="suggestion-origin">{m.original_name || m.origin_name || ""}</span>
                              <div className="suggestion-badges-row">
                                {m.sourceName && (
                                  <span className={`badge-tag badge-tag--source badge-tag--source-${m.sourceName.toLowerCase()}`}>
                                    {m.sourceName}
                                  </span>
                                )}
                                {m.quality && m.quality !== "N/A" && (
                                  <span className="badge-tag badge-tag--quality">{m.quality}</span>
                                )}
                                {m.language && m.language !== "N/A" && (
                                  <span className="badge-tag badge-tag--lang">{m.language}</span>
                                )}
                                {m.current_episode && (
                                  <span className="badge-tag badge-tag--ep">{m.current_episode}</span>
                                )}
                                {m.year && m.year !== "N/A" && (
                                  <span className="badge-tag badge-tag--year">{m.year}</span>
                                )}
                                {m.time && m.time !== "N/A" && (
                                  <span className="badge-tag badge-tag--time">{m.time}</span>
                                )}
                              </div>
                            </div>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                ) : (
                  /* Thẻ phim đã chọn */
                  <div className="selected-movie-card">
                    <img
                      src={selectedMovie.poster_url || selectedMovie.thumb_url || "https://placehold.co/60x80/1a1a2e/ffffff?text=Film"}
                      alt={selectedMovie.name}
                      className="selected-poster"
                      onError={(e) => {
                        e.target.src = "https://placehold.co/60x80/1a1a2e/ffffff?text=Film";
                      }}
                    />
                    <div className="selected-meta">
                      <h4>{selectedMovie.name}</h4>
                      <span>{selectedMovie.origin_name || selectedMovie.original_name || ""}</span>
                      <div className="selected-badges-row">
                        {selectedMovie.sourceName && (
                          <span className={`badge-tag badge-tag--source badge-tag--source-${selectedMovie.sourceName.toLowerCase()}`}>
                            {selectedMovie.sourceName}
                          </span>
                        )}
                        {selectedMovie.quality && selectedMovie.quality !== "N/A" && (
                          <span className="badge-tag badge-tag--quality">{selectedMovie.quality}</span>
                        )}
                        {selectedMovie.language && selectedMovie.language !== "N/A" && (
                          <span className="badge-tag badge-tag--lang">{selectedMovie.language}</span>
                        )}
                        {selectedMovie.current_episode && (
                          <span className="badge-tag badge-tag--ep">{selectedMovie.current_episode}</span>
                        )}
                        {selectedMovie.year && selectedMovie.year !== "N/A" && (
                          <span className="badge-tag badge-tag--year">{selectedMovie.year}</span>
                        )}
                      </div>
                      <button
                        type="button"
                        className="btn-change-movie"
                        onClick={() => {
                          setSelectedMovie(null);
                          setMovieServers([]);
                          setMovieEpisodes([]);
                          setSelectedEpisode(null);
                          setFormVideoUrl("");
                        }}
                      >
                        <FaTimes /> Đổi phim khác
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* 2. Tự động hiển thị Server & Tập phim (User chỉ việc click chọn) */}
              {selectedMovie && (
                <div className="movie-episodes-selection">
                  {isLoadingDetail ? (
                    <div className="loading-episodes">
                      <div className="spinner-border spinner-border-sm text-info" role="status" />
                      <span>Đang nạp danh sách tập & server...</span>
                    </div>
                  ) : (
                    <>
                      {/* Chọn Server nếu có nhiều hơn 1 server */}
                      {movieServers.length > 1 && (
                        <div className="server-selector-group">
                          <label><FaServer /> Nguồn / Server ({movieServers.length}):</label>
                          <div className="server-pills-row">
                            {movieServers.map((srv, idx) => (
                              <button
                                key={idx}
                                type="button"
                                className={`server-chip ${idx === selectedServerIdx ? "active" : ""}`}
                                onClick={() => handleSelectServer(idx)}
                              >
                                {srv.display_name || srv.server_name || `Server ${idx + 1}`}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Chọn Tập phim */}
                      {movieEpisodes.length > 0 ? (
                        <div className="episode-selector-group">
                          <label><FaListOl /> Chọn tập bắt đầu xem chung ({movieEpisodes.length} tập):</label>
                          <div className="episode-chips-grid custom-scroll">
                            {movieEpisodes.map((ep, idx) => (
                              <button
                                key={idx}
                                type="button"
                                className={`episode-chip ${selectedEpisode?.slug === ep.slug ? "active" : ""}`}
                                onClick={() => handleSelectEpisode(ep)}
                              >
                                {selectedEpisode?.slug === ep.slug && <FaCheck className="ep-check-icon" />}
                                {ep.name || `Tập ${idx + 1}`}
                              </button>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <div className="no-episodes-warning">
                          Phim này chưa có nguồn M3U8 từ KK hoặc NC để đồng bộ thời gian.
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}

              {/* 3. Tên phòng xem */}
              <div className="form-group">
                <label>Tên phòng xem:</label>
                <input
                  type="text"
                  placeholder="Ví dụ: Phòng xem phim cuối tuần của Tuấn"
                  value={formRoomName}
                  onChange={(e) => setFormRoomName(e.target.value)}
                />
              </div>

              <div className="modal-footer">
                <button type="button" className="btn-cancel" onClick={() => setShowCreateModal(false)}>
                  Hủy
                </button>
                <button
                  type="submit"
                  className="btn-submit-create"
                  disabled={isSubmitting || (!selectedMovie && !formVideoUrl)}
                >
                  {isSubmitting ? "Đang tạo phòng..." : "Khởi tạo & Vào phòng ngay"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      </div>
    </div>
  );
}
