import React, {
  useState,
  useEffect,
  useRef,
  useMemo,
  useCallback,
} from "react";
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
  FaTrashAlt,
  FaPhoneSlash,
  FaMicrophoneSlash,
  FaExchangeAlt,
  FaSlidersH,
} from "react-icons/fa";
import { FaForwardStep } from "react-icons/fa6";
import { useAuth } from "../../context/AuthContext";
import "./style.scss";

const BACKEND_HTTP = (
  process.env.REACT_APP_WATCH_PARTY_URL ||
  "https://watch-party-backend.ptoan5950.workers.dev"
).replace(/\/$/, "");
const BACKEND_WS = BACKEND_HTTP.replace(/^http/i, "ws");
const SERVER_API_BASE =
  process.env.REACT_APP_SERVER_API_URL ||
  "https://movie1-api-worker.nguyengiaminh532.workers.dev";
const KK_BASE = process.env.REACT_APP_FILM_API_URL || "https://phimapi.com";
const NC_BASE =
  process.env.REACT_APP_FILM_API_URL_3 || "https://phim.nguonc.com";

const AVATAR_COLORS = [
  "#00796b",
  "#1565c0",
  "#6a1b9a",
  "#d84315",
  "#00838f",
  "#2e7d32",
  "#c2185b",
  "#4527a0",
  "#e65100",
  "#0277bd",
];

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
  if (cleanUrl.startsWith("http://") || cleanUrl.startsWith("https://"))
    return cleanUrl;
  if (cleanUrl.startsWith("//")) return `https:${cleanUrl}`;
  if (sourceName === "VM")
    return `https://vsmov.com/${cleanUrl.startsWith("/") ? cleanUrl.slice(1) : cleanUrl}`;
  if (sourceName === "KK")
    return `https://phimimg.com/${cleanUrl.startsWith("/") ? cleanUrl.slice(1) : cleanUrl}`;
  if (sourceName === "NC")
    return `https://phim.nguonc.com/${cleanUrl.startsWith("/") ? cleanUrl.slice(1) : cleanUrl}`;
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
    if (typeof f.year === "string" || typeof f.year === "number")
      return String(f.year);
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
  const activeRoomId =
    urlRoomId && urlRoomId !== "default"
      ? urlRoomId
      : searchParams.get("room") && searchParams.get("room") !== "default"
        ? searchParams.get("room")
        : null;

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
      setFormRoomName(
        `Phòng của ${user?.display_name || user?.username || "Tôi"}`,
      );
    }
    setShowCreateModal(true);
  };

  // State: Inside Room
  const wsRef = useRef(null);
  const [isConnected, setIsConnected] = useState(false);
  const [roomData, setRoomData] = useState(null);
  const roomDataRef = useRef(null);
  useEffect(() => {
    roomDataRef.current = roomData;
  }, [roomData]);
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
  const connectWebSocketRef = useRef(null);

  const chatScrollRef = useRef(null);
  const mobileChatScrollRef = useRef(null);
  const elapsedTimerRef = useRef(null);
  const searchInputRef = useRef(null);
  const videoRef = useRef(null);
  const hlsInstanceRef = useRef(null);
  const isSeekingFromSyncRef = useRef(false);
  const roomStartedAtRef = useRef(0);
  const [needsUserGesture, setNeedsUserGesture] = useState(false);

  // Meet & TikTok UI States
  const [showMeetChat, setShowMeetChat] = useState(true);
  const [meetSideTab, setMeetSideTab] = useState("chat"); // "chat" | "people"
  const [showMobileViewers, setShowMobileViewers] = useState(false);
  const [activeMovieBackdrop, setActiveMovieBackdrop] = useState("");

  // Xử lý bàn phím ảo trên iOS & Mobile: Tự động điều chỉnh chiều cao boxchat, giữ header & video cố định không bị zoom hay đẩy ra ngoài
  useEffect(() => {
    if (!activeRoomId) return;

    document.body.classList.add("watch-party-active");

    const updateVisualViewport = () => {
      if (window.visualViewport) {
        const vvHeight = window.visualViewport.height;
        document.documentElement.style.setProperty(
          "--visual-viewport-height",
          `${vvHeight}px`,
        );
      } else {
        document.documentElement.style.setProperty(
          "--visual-viewport-height",
          `${window.innerHeight}px`,
        );
      }
      if (window.scrollY !== 0) {
        window.scrollTo(0, 0);
      }
    };

    updateVisualViewport();

    if (window.visualViewport) {
      window.visualViewport.addEventListener("resize", updateVisualViewport);
      window.visualViewport.addEventListener("scroll", updateVisualViewport);
    } else {
      window.addEventListener("resize", updateVisualViewport);
    }

    const preventWindowScroll = () => {
      if (window.scrollY !== 0) {
        window.scrollTo(0, 0);
      }
    };
    window.addEventListener("scroll", preventWindowScroll, { passive: true });

    return () => {
      document.body.classList.remove("watch-party-active");
      if (window.visualViewport) {
        window.visualViewport.removeEventListener(
          "resize",
          updateVisualViewport,
        );
        window.visualViewport.removeEventListener(
          "scroll",
          updateVisualViewport,
        );
      } else {
        window.removeEventListener("resize", updateVisualViewport);
      }
      window.removeEventListener("scroll", preventWindowScroll);
      document.documentElement.style.removeProperty("--visual-viewport-height");
    };
  }, [activeRoomId]);

  // Tải poster/backdrop cho phòng đang xem để làm background mờ nghệ thuật cho PC/Laptop
  useEffect(() => {
    if (!activeRoomId) return;

    // 1. Ưu tiên lấy trực tiếp từ selectedMovie nếu có
    if (selectedMovie?.thumb_url || selectedMovie?.poster_url) {
      setActiveMovieBackdrop(
        getPoster(
          selectedMovie.thumb_url || selectedMovie.poster_url,
          selectedMovie.sourceName || "KK",
        ),
      );
      return;
    }

    // 2. Lấy từ roomData nếu server đã lưu posterUrl
    if (roomData?.posterUrl || roomData?.thumbUrl) {
      setActiveMovieBackdrop(
        getPoster(roomData.posterUrl || roomData.thumbUrl, "KK"),
      );
      return;
    }

    // 3. Lấy từ cache thumbnails của phòng
    if (roomThumbnails[activeRoomId]) {
      setActiveMovieBackdrop(getPoster(roomThumbnails[activeRoomId], "KK"));
      return;
    }

    const slug =
      roomData?.movieSlug || (roomData?.title ? slugify(roomData.title) : "");
    const title = roomData?.title;
    if (!slug && !title) return;

    let isSubscribed = true;

    const fetchBackdrop = async () => {
      try {
        if (slug) {
          // Lấy trực tiếp từ API phim của KK (phimapi.com/phim/:slug)
          const kkRes = await fetch(`${KK_BASE}/phim/${slug}`);
          if (kkRes.ok) {
            const kkData = await kkRes.json();
            const m = kkData?.movie;
            if (m && (m.thumb_url || m.poster_url)) {
              if (isSubscribed) {
                const img = m.thumb_url || m.poster_url;
                setActiveMovieBackdrop(getPoster(img, "KK"));
                return;
              }
            }
          }

          // Fallback: Thử lấy từ movie-detail worker nếu nguồn khác
          try {
            const workerRes = await fetch(
              `${SERVER_API_BASE}/movie-detail/${slug}`,
            );
            if (workerRes.ok) {
              const workerData = await workerRes.json();
              const wm = workerData?.data?.movie;
              if (wm && (wm.thumb_url || wm.poster_url)) {
                if (isSubscribed) {
                  const img = wm.thumb_url || wm.poster_url;
                  setActiveMovieBackdrop(getPoster(img, "KK"));
                  return;
                }
              }
            }
          } catch (_) {}
        }

        // Fallback: Tìm kiếm theo keyword title trên PhimAPI
        if (title) {
          const sRes = await fetch(
            `${KK_BASE}/v1/api/tim-kiem?keyword=${encodeURIComponent(title)}&page=1`,
          );
          if (sRes.ok) {
            const sData = await sRes.json();
            const item = sData?.data?.items?.[0];
            if (item && (item.thumb_url || item.poster_url)) {
              if (isSubscribed) {
                const img = item.thumb_url || item.poster_url;
                setActiveMovieBackdrop(getPoster(img, "KK"));
                return;
              }
            }
          }
        }
      } catch (err) {
        console.warn("[WatchParty] Lỗi tải backdrop ảnh phim:", err);
      }
    };

    fetchBackdrop();

    return () => {
      isSubscribed = false;
    };
  }, [
    activeRoomId,
    selectedMovie?.thumb_url,
    selectedMovie?.poster_url,
    selectedMovie?.sourceName,
    roomData?.posterUrl,
    roomData?.thumbUrl,
    roomData?.movieSlug,
    roomData?.title,
    roomThumbnails,
  ]);

  const getUserColor = useCallback((name = "") => {
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
  }, []);

  const getUserInitial = useCallback((name = "") => {
    if (!name) return "?";
    const trimmed = name.trim();
    const parts = trimmed.split(/\s+/);
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (
      parts[0].charAt(0) + parts[parts.length - 1].charAt(0)
    ).toUpperCase();
  }, []);

  // Hàm render avatar hỗ trợ kế thừa avatar user hoặc fallback về ký tự đầu với background màu
  const renderAvatar = useCallback(
    (avatarUrl, name, sizeClass = "", customStyle = {}) => {
      const initial = getUserInitial(name);
      const bgColor = getUserColor(name);
      return (
        <div
          className={`user-avatar-badge-wrap ${sizeClass}`}
          style={{ backgroundColor: bgColor, ...customStyle }}
        >
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt={name || "avatar"}
              className="user-avatar-image-el"
              onError={(e) => {
                e.currentTarget.style.display = "none";
              }}
            />
          ) : null}
          <span className="user-avatar-fallback-text">{initial}</span>
        </div>
      );
    },
    [getUserInitial, getUserColor],
  );

  // Tự động cuộn xuống tin nhắn mới nhất trên cả Desktop (Meet) và Mobile (TikTok)
  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
    if (mobileChatScrollRef.current) {
      mobileChatScrollRef.current.scrollTop =
        mobileChatScrollRef.current.scrollHeight;
    }
  }, [messages]);

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
          fetchSourceItems(
            `${KK_BASE}/v1/api/tim-kiem?keyword=${encodeURIComponent(query)}`,
          ),
          fetchSourceItems(
            `${NC_BASE}/api/films/search?keyword=${encodeURIComponent(query)}`,
          ),
        ]);

        const normKk = (resKk || []).map((f) => ({
          ...f,
          sourceName: "KK",
          name: typeof f.name === "string" ? f.name : "N/A",
          original_name:
            typeof (f.origin_name || f.original_name) === "string"
              ? f.origin_name || f.original_name
              : "",
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
          original_name:
            typeof (f.original_name || f.origin_name) === "string"
              ? f.original_name || f.origin_name
              : "",
          poster_url: getPoster(f.thumb_url || f.poster_url, "NC"),
          thumb_url: getPoster(f.poster_url || f.thumb_url, "NC"),
          slug: f.slug || f.id || "",
          quality: typeof f.quality === "string" ? f.quality : "HD",
          language:
            typeof (f.language || f.lang) === "string"
              ? f.language || f.lang
              : "Vietsub",
          current_episode: f.current_episode || f.episode_current || "",
          year: getYearFromData(f),
          time: typeof f.time === "string" ? f.time : "",
        }));

        const combined = [...normKk, ...normNc];
        const uniqueResults = Array.from(
          new Map(
            combined
              .filter((item) => item && item.slug)
              .map((item) => [`${item.slug}-${item.sourceName}`, item]),
          ).values(),
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
          fetchSourceItems(
            `${KK_BASE}/v1/api/tim-kiem?keyword=${encodeURIComponent(query)}`,
          ),
          fetchSourceItems(
            `${NC_BASE}/api/films/search?keyword=${encodeURIComponent(query)}`,
          ),
        ]);

        const normKk = (resKk || []).map((f) => ({
          ...f,
          sourceName: "KK",
          name: typeof f.name === "string" ? f.name : "N/A",
          original_name:
            typeof (f.origin_name || f.original_name) === "string"
              ? f.origin_name || f.original_name
              : "",
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
          original_name:
            typeof (f.original_name || f.origin_name) === "string"
              ? f.original_name || f.origin_name
              : "",
          poster_url: getPoster(f.thumb_url || f.poster_url, "NC"),
          thumb_url: getPoster(f.poster_url || f.thumb_url, "NC"),
          slug: f.slug || f.id || "",
          quality: typeof f.quality === "string" ? f.quality : "HD",
          language:
            typeof (f.language || f.lang) === "string"
              ? f.language || f.lang
              : "Vietsub",
          current_episode: f.current_episode || f.episode_current || "",
          year: getYearFromData(f),
          time: typeof f.time === "string" ? f.time : "",
        }));

        const combined = [...normKk, ...normNc];
        const uniqueResults = Array.from(
          new Map(
            combined
              .filter((item) => item && item.slug)
              .map((item) => [`${item.slug}-${item.sourceName}`, item]),
          ).values(),
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
  const handleSelectMovie = async (
    movie,
    shouldBroadcastChangeMedia = false,
  ) => {
    setSelectedMovie(movie);
    setMovieSearchResults([]);
    setMovieSearchText("");
    setHostMovieSearchResults([]);
    setHostMovieSearchText("");
    setFormTitle(movie.name);
    if (!formRoomName.trim()) {
      setFormRoomName(
        `Phòng của ${user?.display_name || user?.username || "Tôi"}`,
      );
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
              Boolean(ep.link_m3u8 || ep.m3u8),
            ),
          ),
        );
      };

      const checkNcHasM3u8 = (list) => {
        if (!Array.isArray(list) || list.length === 0) return false;
        const nc = list.find(
          (s) =>
            s.source?.toLowerCase() === "nc" ||
            s.source?.toLowerCase() === "nguonc",
        );
        if (!nc) return true;
        return (nc.episodes || []).some((srv) =>
          (srv.server_data || srv.items || []).some((ep) =>
            Boolean(ep.link_m3u8 || ep.m3u8),
          ),
        );
      };

      const isNc =
        movie.sourceName === "NC" ||
        movie.sourceName === "nguonc" ||
        epList.some(
          (s) =>
            s.source?.toLowerCase() === "nc" ||
            s.source?.toLowerCase() === "nguonc",
        );
      const lacksM3u8 =
        !checkHasM3u8(epList) || (isNc && !checkNcHasM3u8(epList));

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
        origin_name:
          m?.origin_name || movie.origin_name || movie.original_name || "",
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
        if (
          srcKey !== "kk" &&
          srcKey !== "kkphim" &&
          srcKey !== "nc" &&
          srcKey !== "nguonc"
        ) {
          return;
        }

        const sourceLabel = SOURCE_NAMES[srcKey] || "KK";

        (src.episodes || []).forEach((srv) => {
          const rawEpList = srv.server_data || srv.items || [];
          // CHỈ LẤY CÁC TẬP CÓ LINK M3U8
          const validEpList = rawEpList
            .filter(
              (ep) =>
                ep.slug &&
                ep.slug.trim() !== "" &&
                Boolean(ep.link_m3u8 || ep.m3u8),
            )
            .map((ep) => ({
              ...ep,
              m3u8Url: ep.link_m3u8 || ep.m3u8,
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
            } else if (
              !serverType ||
              /^#?\d+$/.test(serverType.trim()) ||
              /server/i.test(serverType)
            ) {
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
          const matchIdx = list.findIndex(
            (s) => s.sourceName === movie.sourceName,
          );
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
              (roomData?.episode &&
                (ep.name === roomData.episode || ep.slug === roomData.episode)),
          );
          const activeEp = matchEp || firstEp;
          setSelectedEpisode(activeEp);
          setFormEpisode(activeEp.name || "Tập 1");
          setFormVideoUrl(
            activeEp.m3u8Url || activeEp.link_m3u8 || activeEp.m3u8 || "",
          );
          setFormMediaType("m3u8");
          if (!formRoomName.trim()) {
            setFormRoomName(
              `Phòng của ${user?.display_name || user?.username || "Tôi"}`,
            );
          }

          // NẾU LÀ CHỦ PHÒNG ĐỔI PHIM TRONG HOST PANEL: TỰ ĐỘNG PHÁT TẬP 1 PHIM MỚI CHO CẢ PHÒNG!
          if (
            shouldBroadcastChangeMedia &&
            wsRef.current &&
            wsRef.current.readyState === WebSocket.OPEN
          ) {
            const nextVideoUrl =
              firstEp.m3u8Url || firstEp.link_m3u8 || firstEp.m3u8 || "";
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
                    posterUrl: p || t || "",
                    startedAt: nowTime,
                    elapsedSeconds: 0,
                  }
                : null,
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
                posterUrl: p || t || "",
              }),
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
        : null,
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
        posterUrl:
          selectedMovie?.thumb_url ||
          selectedMovie?.poster_url ||
          roomData?.posterUrl ||
          "",
      }),
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
    if (
      activeRoomId &&
      roomData?.title &&
      movieServers.length === 0 &&
      !isLoadingDetail
    ) {
      if (roomData.movieSlug) {
        handleSelectMovie(
          { slug: roomData.movieSlug, name: roomData.title },
          false,
        );
      } else {
        const autoFetch = async () => {
          try {
            const res = await fetch(
              `${KK_BASE}/v1/api/tim-kiem?keyword=${encodeURIComponent(roomData.title)}&page=1`,
            );
            const data = await res.json();
            const items = data?.data?.items || [];
            if (items.length > 0) {
              handleSelectMovie(
                {
                  ...items[0],
                  slug: items[0].slug || items[0]._id,
                  name: items[0].name,
                },
                false,
              );
            }
          } catch (e) {
            console.warn("[WatchParty] Lỗi tự động tải tập cho phòng:", e);
          }
        };
        autoFetch();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    activeRoomId,
    roomData?.title,
    roomData?.movieSlug,
    movieServers.length,
    isLoadingDetail,
  ]);

  // Đồng bộ chip tập đang chọn theo đúng tập phòng đang phát
  useEffect(() => {
    if (movieEpisodes.length > 0 && roomData) {
      const match = movieEpisodes.find(
        (ep) =>
          (roomData.videoUrl &&
            (ep.m3u8Url === roomData.videoUrl ||
              ep.link_m3u8 === roomData.videoUrl ||
              ep.m3u8 === roomData.videoUrl)) ||
          (roomData.episode &&
            (ep.name === roomData.episode || ep.slug === roomData.episode)),
      );
      if (match) {
        setSelectedEpisode(match);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomData?.videoUrl, roomData?.episode, movieEpisodes]);

  // Lọc lỗi "The play() request was interrupted by a call to pause()" ở cấp độ Window để React Error Overlay không nhảy ra
  useEffect(() => {
    const handleUnhandledRejection = (event) => {
      const reason = event?.reason;
      const msg = typeof reason === "string" ? reason : reason?.message || "";
      if (
        reason?.name === "AbortError" ||
        msg.includes("The play() request was interrupted") ||
        msg.includes("interrupted by a call to pause")
      ) {
        event.preventDefault();
      }
    };

    window.addEventListener("unhandledrejection", handleUnhandledRejection);
    return () => {
      window.removeEventListener(
        "unhandledrejection",
        handleUnhandledRejection,
      );
    };
  }, []);

  // Helper gọi play() an toàn tuyệt đối, triệt tiêu lỗi AbortError / interrupted by pause()
  const safePlay = useCallback((videoEl) => {
    const el = videoEl || videoRef.current;
    if (!el) return;
    try {
      const promise = el.play();
      if (promise !== undefined && typeof promise.catch === "function") {
        promise.catch((err) => {
          // Bỏ qua lỗi DOMException khi trình duyệt ngắt play() do tua / đổi tập / pause
          if (
            err.name === "AbortError" ||
            err.message?.includes("interrupted by a call to pause") ||
            err.message?.includes("play() request was interrupted")
          ) {
            return;
          }
          if (err.name === "NotAllowedError") {
            setNeedsUserGesture(true);
          }
        });
      }
    } catch (e) {
      // Ignored
    }
  }, []);

  // Bộ điều khiển âm thanh và toàn màn hình riêng cho khách
  const toggleMute = () => {
    if (videoRef.current) {
      const nextMuted = !videoRef.current.muted;
      videoRef.current.muted = nextMuted;
      if (!nextMuted && videoRef.current.volume === 0) {
        videoRef.current.volume = 1;
      }
      setIsMuted(nextMuted);
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
      (video && video.webkitDisplayingFullscreen),
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
        try {
          await document.exitFullscreen();
        } catch (e) {}
      } else if (document.webkitExitFullscreen) {
        try {
          document.webkitExitFullscreen();
        } catch (e) {}
      } else if (document.mozCancelFullScreen) {
        try {
          document.mozCancelFullScreen();
        } catch (e) {}
      } else if (document.msExitFullscreen) {
        try {
          document.msExitFullscreen();
        } catch (e) {}
      }

      if (video && typeof video.webkitExitFullscreen === "function") {
        try {
          video.webkitExitFullscreen();
        } catch (e) {}
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
        (playerWrapperRef.current &&
          playerWrapperRef.current.classList.contains("is-fullscreen")) ||
        (video && video.webkitDisplayingFullscreen),
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
      setFormVideoUrl(
        firstEp.m3u8Url || firstEp.link_m3u8 || firstEp.m3u8 || "",
      );
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
        setActiveRooms(
          json.data.filter((r) => r && r.roomId && r.roomId !== "default"),
        );
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
      (r) => !roomThumbnails[r.roomId] && (r.movieSlug || r.title),
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
              const res = await fetch(
                `${SERVER_API_BASE}/movie-detail/${slug}`,
              );
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
              const sRes = await fetch(
                `${KK_BASE}/v1/api/tim-kiem?keyword=${encodeURIComponent(room.title)}&page=1`,
              );
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
            console.warn(
              "[WatchParty] Lỗi tải thumbnail phòng:",
              room.roomId,
              e,
            );
          }
        }),
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

      const username =
        user.display_name || user.username || `User #${user.id || ""}`;
      const avatar = user.avatar || "";
      const wsUrl = `${BACKEND_WS}/ws/room/${encodeURIComponent(activeRoomId)}?token=${encodeURIComponent(user.token)}&username=${encodeURIComponent(username)}&avatar=${encodeURIComponent(avatar)}`;

      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        setIsConnected(true);
        reconnectAttemptsRef.current = 0;

        // Bắt đầu nhịp tim PING định kỳ 10 giây (Giữ kết nối luôn sống, chống Cloudflare Workers đóng do rảnh)
        if (pingIntervalRef.current) clearInterval(pingIntervalRef.current);
        pingIntervalRef.current = setInterval(() => {
          if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
            wsRef.current.send(JSON.stringify({ type: "PING" }));
          }
        }, 10000);

        // Nếu là chủ phòng và video đang mở/đã phát, lập tức gửi SYNC_TIME để server và các khách cập nhật ngay
        if (videoRef.current && videoRef.current.currentTime > 0) {
          const isUserHost = Boolean(
            roomData?.isHost ||
            (user?.id &&
              roomData?.hostId &&
              String(user.id) === String(roomData.hostId)),
          );
          if (isUserHost) {
            const cur = Math.floor(videoRef.current.currentTime);
            ws.send(JSON.stringify({ type: "SYNC_TIME", time: cur }));
          }
        }
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

        // Nếu đóng có chủ đích (F5, unmount, ấn rời phòng) thì không thử kết nối lại
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

        // Mất kết nối bất ngờ (wifi/4G chuyển mạng, sleep, Cloudflare DO ngủ dậy): Tự động thử kết nối lại ngay lập tức
        reconnectAttemptsRef.current += 1;
        // Lần đầu thử lại cực nhanh (350ms), các lần sau lùi dần tối đa 2000ms, retry liên tục trong nền không chặn người dùng
        const delay =
          reconnectAttemptsRef.current === 1
            ? 350
            : Math.min(2000, reconnectAttemptsRef.current * 500);
        if (reconnectTimerRef.current) clearTimeout(reconnectTimerRef.current);
        reconnectTimerRef.current = setTimeout(() => {
          if (!isIntentionalCloseRef.current) {
            connectWebSocket();
          }
        }, delay);
      };

      ws.onerror = (err) => {
        console.error("Lỗi kết nối WebSocket:", err);
      };
    };

    connectWebSocketRef.current = connectWebSocket;
    connectWebSocket();

    // Tự động kết nối lại ngay khi người dùng quay lại tab hoặc có mạng trở lại
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
          connectWebSocket();
        } else {
          try {
            wsRef.current.send(JSON.stringify({ type: "PING" }));
          } catch {}
        }
      }
    };

    const handleOnline = () => {
      if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
        connectWebSocket();
      }
    };

    const handleBeforeUnload = () => {
      if (activeRoomId && user?.token) {
        try {
          fetch(`${BACKEND_HTTP}/api/rooms/${activeRoomId}/leave`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${user.token}`,
            },
            body: JSON.stringify({}),
            keepalive: true,
          }).catch(() => {});
        } catch {}
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("online", handleOnline);
    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("beforeunload", handleBeforeUnload);
      connectWebSocketRef.current = null;
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
      if (
        videoRef.current &&
        !videoRef.current.paused &&
        videoRef.current.currentTime > 0
      ) {
        const sec = Math.floor(videoRef.current.currentTime);
        const h = Math.floor(sec / 3600);
        const m = Math.floor((sec % 3600) / 60);
        const s = sec % 60;
        setElapsedDisplay(
          [h, m, s].map((v) => String(v).padStart(2, "0")).join(":"),
        );
        return;
      }

      const baseStartedAt = startedAt || roomStartedAtRef.current || Date.now();
      const sec = Math.max(0, Math.floor((Date.now() - baseStartedAt) / 1000));
      const h = Math.floor(sec / 3600);
      const m = Math.floor((sec % 3600) / 60);
      const s = sec % 60;
      setElapsedDisplay(
        [h, m, s].map((v) => String(v).padStart(2, "0")).join(":"),
      );
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
            const isUserHost = Boolean(
              user?.id &&
              json.data.hostId &&
              String(user.id) === String(json.data.hostId),
            );
            setRoomData((prev) =>
              prev
                ? { ...json.data, ...prev, isHost: prev.isHost ?? isUserHost }
                : { ...json.data, isHost: isUserHost },
            );
            if (json.data.startedAt) {
              roomStartedAtRef.current = json.data.startedAt;
              startElapsedCounter(json.data.startedAt);
            }
          }
        })
        .catch(() => {});
    }
  }, [activeRoomId, startElapsedCounter, user?.id]);

  // Xử lý các gói tin nhận từ Server
  const handleServerMessage = useCallback(
    (msg) => {
      switch (msg.type) {
        case "ROOM_INIT": {
          const isUserHost = Boolean(
            msg.room?.isHost ||
            (user?.id &&
              msg.room?.hostId &&
              String(user.id) === String(msg.room.hostId)),
          );
          // Nếu là chủ phòng và video đang phát ở một mốc thời gian cụ thể (> 2s),
          // giữ mốc thời gian của chủ phòng và đồng bộ ngược lên server để không bị server ghi đè lùi lại
          if (
            isUserHost &&
            videoRef.current &&
            videoRef.current.currentTime > 2
          ) {
            const currentSeconds = Math.floor(videoRef.current.currentTime);
            const newStartedAt = Date.now() - currentSeconds * 1000;
            roomStartedAtRef.current = newStartedAt;
            setRoomData((prev) => ({
              ...(prev || msg.room),
              ...msg.room,
              startedAt: newStartedAt,
              isHost: true,
            }));
            if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
              wsRef.current.send(
                JSON.stringify({
                  type: "SYNC_TIME",
                  time: currentSeconds,
                }),
              );
            }
            setMembers(msg.members || []);
            if (msg.messages && Array.isArray(msg.messages)) {
              setMessages(msg.messages);
              setTimeout(() => {
                if (chatScrollRef.current) {
                  chatScrollRef.current.scrollTop =
                    chatScrollRef.current.scrollHeight;
                }
              }, 60);
            }
            break;
          }

          setRoomData({ ...msg.room, isHost: isUserHost });
          roomStartedAtRef.current = msg.room.startedAt;
          setMembers(msg.members || []);
          if (msg.messages && Array.isArray(msg.messages)) {
            setMessages(msg.messages);
            setTimeout(() => {
              if (chatScrollRef.current) {
                chatScrollRef.current.scrollTop =
                  chatScrollRef.current.scrollHeight;
              }
            }, 60);
          }
          startElapsedCounter(msg.room.startedAt);

          // NẾU LÀ KHÁCH VÀO PHÒNG: TUA VIDEO ĐẾN ĐÚNG GIÂY ĐANG CHIẾU CỦA PHÒNG
          if (!isUserHost) {
            const targetTime =
              typeof msg.room?.elapsedSeconds === "number"
                ? msg.room.elapsedSeconds
                : Math.max(
                    0,
                    Math.floor(
                      (Date.now() - (msg.room?.startedAt || Date.now())) / 1000,
                    ),
                  );

            if (targetTime > 0) {
              const doSeek = () => {
                if (
                  videoRef.current &&
                  Math.abs(videoRef.current.currentTime - targetTime) > 1.5
                ) {
                  isSeekingFromSyncRef.current = true;
                  videoRef.current.currentTime = targetTime;
                }
              };
              if (videoRef.current && videoRef.current.readyState >= 1) {
                doSeek();
              } else if (videoRef.current) {
                videoRef.current.addEventListener("loadedmetadata", doSeek, {
                  once: true,
                });
                videoRef.current.addEventListener("canplay", doSeek, {
                  once: true,
                });
              }
            }
          }
          break;
        }

        case "PONG":
        case "MEMBERS_SYNC": {
          if (msg.members && Array.isArray(msg.members)) {
            setMembers(msg.members);
          }
          break;
        }

        case "USER_JOINED": {
          setMembers((prev) => {
            const exists = prev.some(
              (m) => String(m.userId) === String(msg.user.userId),
            );
            if (exists) return prev;
            return [...prev, msg.user];
          });
          // Nếu là chủ phòng và đang phát video, lập tức gửi SYNC_TIME để thành viên mới tua đúng giây
          const isUserHost = Boolean(
            roomDataRef.current?.isHost ||
            roomData?.isHost ||
            (user?.id &&
              roomDataRef.current?.hostId &&
              String(user.id) === String(roomDataRef.current.hostId)),
          );
          if (
            isUserHost &&
            videoRef.current &&
            videoRef.current.currentTime > 0
          ) {
            const cur = Math.floor(videoRef.current.currentTime);
            if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
              wsRef.current.send(
                JSON.stringify({ type: "SYNC_TIME", time: cur }),
              );
            }
          }
          break;
        }

        case "USER_LEFT": {
          const leftUserId = String(msg.userId);
          setMembers((prev) =>
            prev.filter((m) => String(m.userId) !== leftUserId),
          );
          setRoomData((prev) => {
            if (!prev) return null;
            // Nếu người vừa rời là chủ phòng và mình còn ở trong phòng
            if (String(prev.hostId) === leftUserId) {
              const nextData = {
                ...prev,
                hostId: user?.id || prev.hostId,
                hostUsername: user?.username || prev.hostUsername,
                isHost: true,
              };
              roomDataRef.current = nextData;
              return nextData;
            }
            return prev;
          });
          break;
        }

        case "CHAT": {
          setMessages((prev) => [...prev, msg]);
          setTimeout(() => {
            if (chatScrollRef.current) {
              chatScrollRef.current.scrollTop =
                chatScrollRef.current.scrollHeight;
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
          const isUserHost = Boolean(
            roomDataRef.current?.isHost ||
            roomData?.isHost ||
            (user?.id &&
              roomDataRef.current?.hostId &&
              String(user.id) === String(roomDataRef.current.hostId)),
          );
          // Chủ phòng là nguồn phát chuẩn, KHÔNG BAO GIỜ để gói tin SYNC_TIME tua ngược video của chủ phòng
          if (isUserHost) {
            break;
          }

          roomStartedAtRef.current = msg.startedAt;
          setRoomData((prev) =>
            prev ? { ...prev, startedAt: msg.startedAt } : null,
          );
          startElapsedCounter(msg.startedAt);
          if (typeof msg.time === "number") {
            const targetSeconds = msg.time;
            const applySeek = () => {
              if (videoRef.current) {
                const diff = Math.abs(
                  videoRef.current.currentTime - targetSeconds,
                );
                if (diff > 1.5) {
                  isSeekingFromSyncRef.current = true;
                  videoRef.current.currentTime = targetSeconds;
                }
                if (videoRef.current.paused) {
                  safePlay(videoRef.current);
                }
              }
            };

            if (videoRef.current && videoRef.current.readyState >= 1) {
              applySeek();
            } else if (videoRef.current) {
              videoRef.current.addEventListener("loadedmetadata", applySeek, {
                once: true,
              });
              videoRef.current.addEventListener("canplay", applySeek, {
                once: true,
              });
            }
          }
          break;
        }

        case "HOST_CHANGED": {
          const isMe = Boolean(
            user?.id && String(user.id) === String(msg.newHostId),
          );
          setRoomData((prev) => {
            if (!prev) return null;
            const nextData = {
              ...prev,
              hostId: msg.newHostId,
              hostUsername: msg.newHostUsername,
              isHost: isMe,
            };
            roomDataRef.current = nextData;
            return nextData;
          });
          setMembers((prev) =>
            prev.map((m) => ({
              ...m,
              isHost: String(m.userId) === String(msg.newHostId),
            })),
          );
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
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [user, startElapsedCounter],
  );

  // Hành động: Gửi tin nhắn chat (Hỗ trợ cả WebSocket thời gian thực và HTTP fallback khi đang kết nối lại)
  const handleSendChat = (e) => {
    e.preventDefault();
    const text = chatInput.trim();
    if (!text) return;

    setChatInput("");

    // Nếu WebSocket đang mở, gửi ngay lập tức qua WebSocket
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: "CHAT", text }));
      return;
    }

    // Nếu WebSocket đang mất kết nối / đang kết nối lại: gửi fallback qua HTTP POST
    if (user?.token && activeRoomId) {
      fetch(
        `${BACKEND_HTTP}/api/rooms/${encodeURIComponent(activeRoomId)}/chat`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${user.token}`,
          },
          body: JSON.stringify({
            text,
            username: user.display_name || user.username,
            avatar: user.avatar || "",
          }),
        },
      ).catch((err) => console.error("Lỗi gửi chat qua HTTP fallback:", err));
    }

    // Lập tức kích hoạt kết nối lại WebSocket nếu nó đang đóng
    if (connectWebSocketRef.current) {
      connectWebSocketRef.current();
    }
  };

  // Nhận biết nguồn M3U8 trực tiếp
  const isM3u8Stream = useMemo(() => {
    if (!roomData?.videoUrl) return false;
    return roomData.mediaType === "m3u8" || roomData.videoUrl.includes(".m3u8");
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
    if (!roomData?.roomName)
      return `Phòng của ${roomData?.hostUsername || "Host"}`;
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

  // Danh sách thành viên hiển thị: Luôn đảm bảo có Chủ phòng ở đầu, không bao giờ tự ý chèn người đã rời
  const displayMembers = useMemo(() => {
    let list = [...members];
    return list.sort((a, b) => {
      const aIsHost = Boolean(
        a.isHost ||
        (roomData?.hostId && String(a.userId) === String(roomData.hostId)),
      );
      const bIsHost = Boolean(
        b.isHost ||
        (roomData?.hostId && String(b.userId) === String(roomData.hostId)),
      );
      if (aIsHost && !bIsHost) return -1;
      if (!aIsHost && bIsHost) return 1;
      const aIsMe = Boolean(user?.id && String(a.userId) === String(user.id));
      const bIsMe = Boolean(user?.id && String(b.userId) === String(user.id));
      if (aIsMe && !bIsMe) return -1;
      if (!aIsMe && bIsMe) return 1;
      return 0;
    });
  }, [members, roomData?.hostId, user?.id]);

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

    const targetElapsed = Math.max(
      0,
      roomStartedAtRef.current
        ? Math.floor((Date.now() - roomStartedAtRef.current) / 1000)
        : roomData.elapsedSeconds || 0,
    );

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
      video.volume = 1;
      video.muted = isMuted;
      video.load();
    } catch (e) {
      // Ignored
    }

    if (Hls.isSupported()) {
      const hls = new Hls({
        ...SMOOTH_HLS_CONFIG,
        startPosition: targetElapsed > 0 ? targetElapsed : -1,
      });
      hlsInstanceRef.current = hls;
      hls.loadSource(roomData.videoUrl);
      hls.attachMedia(video);

      const seekToTarget = () => {
        if (
          targetElapsed > 0 &&
          Math.abs(video.currentTime - targetElapsed) > 1.5
        ) {
          isSeekingFromSyncRef.current = true;
          video.currentTime = targetElapsed;
        }
        safePlay(video);
      };

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        seekToTarget();
      });

      video.addEventListener("loadedmetadata", seekToTarget, { once: true });
      video.addEventListener("canplay", seekToTarget, { once: true });

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
          isSeekingFromSyncRef.current = true;
          video.currentTime = targetElapsed;
        }
        safePlay(video);
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

  // Bật tiếng và phát video khi bị trình duyệt chặn Autoplay có âm thanh
  const handleUnmuteAndPlay = () => {
    if (videoRef.current) {
      if (roomData?.elapsedSeconds) {
        videoRef.current.currentTime = roomData.elapsedSeconds;
      }
      safePlay(videoRef.current);
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
            (ep.m3u8 && ep.m3u8 === roomData?.videoUrl),
        ),
      );
      if (playingServer) {
        return Boolean(
          playingServer.sourceName === "KK" ||
          /kk/i.test(playingServer.server_name || "") ||
          /kk/i.test(playingServer.display_name || ""),
        );
      }

      // Kiểm tra server đang chọn ở tab server
      const currentSrv = movieServers[selectedServerIdx];
      if (currentSrv) {
        return Boolean(
          currentSrv.sourceName === "KK" ||
          /kk/i.test(currentSrv.server_name || "") ||
          /kk/i.test(currentSrv.display_name || ""),
        );
      }
    }

    // 2. Fallback nếu movieServers chưa load xong
    if (
      selectedMovie?.sourceName === "KK" ||
      selectedMovie?.source === "kk" ||
      selectedMovie?.source === "kkphim"
    ) {
      return true;
    }
    if (
      roomData?.videoUrl &&
      /phimapi|kkphim|phim128/i.test(roomData.videoUrl)
    ) {
      return true;
    }
    if (roomData?.videoUrl && /nguonc|embed69/i.test(roomData.videoUrl)) {
      return false;
    }

    return false;
  }, [movieServers, selectedServerIdx, roomData?.videoUrl, selectedMovie]);

  // Cập nhật trạng thái hiển thị nút bỏ qua quảng cáo (từ 14:57 [897s] đến 15:31 [931s])
  const updateSkipAdState = useCallback(
    (cur) => {
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
    },
    [roomData?.isHost, isKkServer],
  );

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
    roomStartedAtRef.current = newStartedAt;
    setRoomData((prev) => (prev ? { ...prev, startedAt: newStartedAt } : null));
    startElapsedCounter(newStartedAt);
    setElapsedDisplay("00:15:31");

    const isUserHost = Boolean(
      roomDataRef.current?.isHost ||
      roomData?.isHost ||
      (user?.id &&
        roomDataRef.current?.hostId &&
        String(user.id) === String(roomDataRef.current.hostId)),
    );

    if (isUserHost) {
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.send(
          JSON.stringify({
            type: "SYNC_TIME",
            time: targetTime,
          }),
        );
      }
      if (activeRoomId && user?.token) {
        fetch(
          `${BACKEND_HTTP}/api/rooms/${encodeURIComponent(activeRoomId)}/sync`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${user.token}`,
            },
            body: JSON.stringify({ time: targetTime }),
          },
        ).catch(() => {});
      }
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
        setElapsedDisplay(
          [h, m, s].map((v) => String(v).padStart(2, "0")).join(":"),
        );
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
    setElapsedDisplay(
      [h, m, s].map((v) => String(v).padStart(2, "0")).join(":"),
    );
    startElapsedCounter(newStartedAt);
    setRoomData((prev) => (prev ? { ...prev, startedAt: newStartedAt } : null));

    const isUserHost = Boolean(
      roomData?.isHost ||
      (user?.id &&
        roomData?.hostId &&
        String(user.id) === String(roomData.hostId)),
    );

    if (isUserHost) {
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.send(
          JSON.stringify({
            type: "SYNC_TIME",
            time: currentSeconds,
          }),
        );
      }
      // HTTP Fallback: Đảm bảo server lưu mốc tua mới ngay cả khi WebSocket đang tạm reconnecting
      if (activeRoomId && user?.token) {
        fetch(
          `${BACKEND_HTTP}/api/rooms/${encodeURIComponent(activeRoomId)}/sync`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${user.token}`,
            },
            body: JSON.stringify({ time: currentSeconds }),
          },
        ).catch(() => {});
      }
    }
  };

  // Đồng bộ khi chủ phòng Pause / Play
  const handleHostPause = () => {
    if (!videoRef.current) return;
    const isUserHost = Boolean(
      roomData?.isHost ||
      (user?.id &&
        roomData?.hostId &&
        String(user.id) === String(roomData.hostId)),
    );
    if (!isUserHost) return;

    const currentSeconds = Math.floor(videoRef.current.currentTime);
    const newStartedAt = Date.now() - currentSeconds * 1000;
    roomStartedAtRef.current = newStartedAt;
    setRoomData((prev) => (prev ? { ...prev, startedAt: newStartedAt } : null));

    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(
        JSON.stringify({
          type: "SYNC_TIME",
          time: currentSeconds,
        }),
      );
    }
    if (activeRoomId && user?.token) {
      fetch(
        `${BACKEND_HTTP}/api/rooms/${encodeURIComponent(activeRoomId)}/sync`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${user.token}`,
          },
          body: JSON.stringify({ time: currentSeconds }),
        },
      ).catch(() => {});
    }
  };

  const handleHostPlay = () => {
    if (!videoRef.current) return;
    const isUserHost = Boolean(
      roomData?.isHost ||
      (user?.id &&
        roomData?.hostId &&
        String(user.id) === String(roomData.hostId)),
    );
    if (!isUserHost) return;

    const currentSeconds = Math.floor(videoRef.current.currentTime);
    const newStartedAt = Date.now() - currentSeconds * 1000;
    roomStartedAtRef.current = newStartedAt;
    setRoomData((prev) => (prev ? { ...prev, startedAt: newStartedAt } : null));

    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(
        JSON.stringify({
          type: "SYNC_TIME",
          time: currentSeconds,
        }),
      );
    }
    if (activeRoomId && user?.token) {
      fetch(
        `${BACKEND_HTTP}/api/rooms/${encodeURIComponent(activeRoomId)}/sync`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${user.token}`,
          },
          body: JSON.stringify({ time: currentSeconds }),
        },
      ).catch(() => {});
    }
  };

  // Heartbeat định kỳ 4s để các khách luôn được đồng bộ mượt mà theo đúng player của chủ phòng
  useEffect(() => {
    if (!activeRoomId) return;
    const interval = setInterval(() => {
      const isUserHost = Boolean(
        roomDataRef.current?.isHost ||
        roomData?.isHost ||
        (user?.id &&
          roomDataRef.current?.hostId &&
          String(user.id) === String(roomDataRef.current.hostId)),
      );
      if (
        isUserHost &&
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
          }),
        );
      }
    }, 4000);
    return () => clearInterval(interval);
  }, [activeRoomId, user?.id, roomData?.isHost]);

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

  // Hành động: Chuyển quyền chủ phòng
  const handleTransferHost = (targetUserId, targetUsername) => {
    const isUserHost = Boolean(
      roomData?.isHost ||
      (user?.id &&
        roomData?.hostId &&
        String(user.id) === String(roomData.hostId)),
    );
    if (!isUserHost) return;

    DarkSwal.fire({
      icon: "question",
      title: "Chuyển quyền chủ phòng?",
      text: `Bạn có chắc muốn chuyển quyền chủ phòng cho "${targetUsername}" không? Bạn sẽ trở thành người xem thông thường.`,
      showCancelButton: true,
      confirmButtonText: "Đồng ý chuyển quyền",
      cancelButtonText: "Hủy",
      confirmButtonColor: "#f59e0b",
    }).then((res) => {
      if (
        res.isConfirmed &&
        wsRef.current &&
        wsRef.current.readyState === WebSocket.OPEN
      ) {
        wsRef.current.send(
          JSON.stringify({ type: "TRANSFER_HOST", targetUserId }),
        );
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
      if (
        res.isConfirmed &&
        wsRef.current &&
        wsRef.current.readyState === WebSocket.OPEN
      ) {
        wsRef.current.send(JSON.stringify({ type: "DESTROY_ROOM" }));
      }
    });
  };

  // Hành động: Rời phòng (Nếu là chủ phòng sẽ hỏi muốn chuyển quyền hay giải tán luôn)
  const handleLeaveOrDestroyRoom = () => {
    const isUserHost = Boolean(
      roomData?.isHost ||
      (user?.id &&
        roomData?.hostId &&
        String(user.id) === String(roomData.hostId)),
    );

    const otherMembers = displayMembers.filter(
      (m) => String(m.userId) !== String(user?.id),
    );

    const doLeaveAndTransfer = (targetUserId) => {
      isIntentionalCloseRef.current = true;
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.send(
          JSON.stringify({
            type: "LEAVE_AND_TRANSFER",
            targetUserId,
          }),
        );
      }
      if (activeRoomId && user?.token) {
        try {
          fetch(`${BACKEND_HTTP}/api/rooms/${activeRoomId}/leave`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${user.token}`,
            },
            body: JSON.stringify({ targetUserId }),
            keepalive: true,
          }).catch(() => {});
        } catch {}
      }
      navigate("/xem-chung");
    };

    const doLeaveRoom = () => {
      isIntentionalCloseRef.current = true;
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({ type: "LEAVE_ROOM" }));
      }
      if (activeRoomId && user?.token) {
        try {
          fetch(`${BACKEND_HTTP}/api/rooms/${activeRoomId}/leave`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${user.token}`,
            },
            keepalive: true,
          }).catch(() => {});
        } catch {}
      }
      navigate("/xem-chung");
    };

    const doDestroyRoom = () => {
      isIntentionalCloseRef.current = true;
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({ type: "DESTROY_ROOM" }));
      }
      navigate("/xem-chung");
    };

    if (isUserHost) {
      if (otherMembers.length === 0) {
        DarkSwal.fire({
          icon: "question",
          title: "Rời phòng xem",
          text: "Hiện không có thành viên nào khác trong phòng. Bạn có chắc muốn rời phòng và đóng phòng xem không?",
          showCancelButton: true,
          confirmButtonText: "Rời phòng",
          cancelButtonText: "Ở lại",
          confirmButtonColor: "#ef4444",
        }).then((result) => {
          if (result.isConfirmed) {
            doLeaveRoom();
          }
        });
        return;
      }

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
          if (otherMembers.length === 1) {
            // Đúng 1 người khác: chuyển quyền ngay cho người đó
            doLeaveAndTransfer(otherMembers[0].userId);
          } else {
            // Có từ 2 người khác trở lên (tổng phòng từ 3 người): chọn người nhận quyền
            const inputOptions = {};
            otherMembers.forEach((m) => {
              inputOptions[m.userId] = m.username || `Thành viên #${m.userId}`;
            });

            DarkSwal.fire({
              title: "Chọn chủ phòng mới",
              text: "Vui lòng chọn thành viên bạn muốn chuyển giao quyền chủ phòng:",
              input: "select",
              inputOptions,
              inputValue: otherMembers[0].userId,
              showCancelButton: true,
              confirmButtonText: "Chuyển & Rời phòng",
              cancelButtonText: "Hủy",
              confirmButtonColor: "#3b82f6",
            }).then((selectRes) => {
              if (selectRes.isConfirmed && selectRes.value) {
                doLeaveAndTransfer(selectRes.value);
              }
            });
          }
        } else if (result.isDenied) {
          doDestroyRoom();
        }
      });
    } else {
      doLeaveRoom();
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
      DarkSwal.fire({
        icon: "warning",
        title: "Thiếu tên phim",
        text: "Vui lòng chọn hoặc nhập tên bộ phim muốn xem!",
      });
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
          roomName:
            formRoomName.trim() ||
            `Phòng của ${user?.display_name || user?.username || "Tôi"}`,
          title: formTitle.trim(),
          episode: formEpisode.trim() || "Tập 1",
          videoUrl: formVideoUrl.trim(),
          mediaType: formMediaType,
          movieSlug: selectedMovie?.slug || "",
          posterUrl:
            selectedMovie?.thumb_url || selectedMovie?.poster_url || "",
          username: user.display_name || user.username,
        }),
      });

      const data = await res.json();
      if (data.success && data.data?.roomId) {
        setShowCreateModal(false);
        navigate(`/xem-chung/${data.data.roomId}`);
      } else {
        DarkSwal.fire({
          icon: "error",
          title: "Lỗi tạo phòng",
          text: data.message || "Không thể khởi tạo phòng",
        });
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
        (r.roomId && r.roomId.toLowerCase().includes(q)),
    );
  }, [activeRooms, searchQuery]);

  // Render: Nếu đang trong phòng xem (`activeRoomId`)
  if (activeRoomId) {
    const isCurrentUserHost = Boolean(
      roomData?.isHost ||
      (user?.id &&
        roomData?.hostId &&
        String(user.id) === String(roomData.hostId)),
    );
    const hostMember = members.find(
      (m) =>
        m.isHost ||
        (roomData?.hostId && String(m.userId) === String(roomData.hostId)),
    );
    const currentHostUsername =
      hostMember?.username || roomData?.hostUsername || "Host";
    const hostAvatar =
      hostMember?.avatar ||
      roomData?.hostAvatar ||
      (isCurrentUserHost ? user?.avatar : "");
    const rawBackdrop =
      selectedMovie?.thumb_url ||
      selectedMovie?.poster_url ||
      roomData?.posterUrl ||
      roomData?.thumbUrl ||
      activeMovieBackdrop ||
      roomThumbnails[activeRoomId] ||
      "";
    const currentBackdrop = rawBackdrop
      ? getPoster(rawBackdrop, selectedMovie?.sourceName || "KK")
      : "";

    const isUrlText = (str) => {
      if (!str || typeof str !== "string") return false;
      const s = str.trim().toLowerCase();
      return (
        s.startsWith("http://") ||
        s.startsWith("https://") ||
        s.startsWith("//") ||
        s.includes(".m3u8") ||
        s.includes(".mp4")
      );
    };

    const cleanDisplayTitle = (() => {
      if (selectedMovie?.name && !isUrlText(selectedMovie.name))
        return selectedMovie.name;
      if (roomData?.title && !isUrlText(roomData.title)) return roomData.title;
      if (roomData?.roomName && !isUrlText(roomData.roomName))
        return roomData.roomName;
      return "Phòng Xem Chung";
    })();

    const helmetTitle = `${cleanDisplayTitle} - Xem Chung | Tecede`;

    return (
      <div className="watch-party-room-page">
        <Helmet>
          <title>{helmetTitle}</title>
          <meta
            name="description"
            content={`Xem chung phim ${cleanDisplayTitle} cùng bạn bè trực tuyến theo thời gian thực trên Tecede.`}
          />
          <meta property="og:title" content={helmetTitle} />
          <meta
            property="og:description"
            content={`Xem chung phim ${cleanDisplayTitle} cùng bạn bè trực tuyến theo thời gian thực trên Tecede.`}
          />
        </Helmet>

        {/* Backdrop ảnh phim làm mờ cho PC/Laptop */}
        <div
          className={`meet-ambient-bg desktop-only ${currentBackdrop ? "has-backdrop" : ""}`}
          style={
            currentBackdrop
              ? { backgroundImage: `url("${currentBackdrop}")` }
              : undefined
          }
        />

        {/* 1. GOOGLE MEET TOP BAR (DESKTOP / PC / LAPTOP) */}
        <header className="meet-top-bar desktop-only">
          <div className="meet-top-left">
            <div className="meet-room-info-group">
              <span
                className="meet-movie-title"
                title={roomData?.title || "Đang phát phim"}
              >
                {roomData?.title || "Phòng xem chung"}
              </span>
              <span className="meet-ep-pill">{displayEpisode}</span>
              <span className="meet-room-tag" title={displayRoomName}>
                {displayRoomName}
              </span>
            </div>
          </div>

          <div className="meet-top-center">
            <div className="meet-presenting-pill" title="Người đang phát phim">
              {renderAvatar(
                hostAvatar,
                currentHostUsername,
                "meet-presenting-avatar",
              )}
              <span className="meet-presenting-name">
                {currentHostUsername}
              </span>
              <span className="meet-presenting-sub">(Chủ phòng)</span>
            </div>
          </div>

          <div className="meet-top-right">
            <div
              className="meet-timer-pill"
              title={`Thời gian đã chiếu: ${elapsedDisplay}`}
            >
              <FaClock />
              <span>{elapsedDisplay}</span>
            </div>

            <button
              type="button"
              className="btn-meet-action"
              onClick={handleCopyInvite}
              title="Sao chép link mời bạn bè"
            >
              <FaShareAlt />
            </button>

            {isCurrentUserHost && (
              <button
                type="button"
                className={`btn-meet-action ${showHostPanel ? "active" : ""}`}
                onClick={() => setShowHostPanel(true)}
                title="Bảng điều khiển"
              >
                <FaSlidersH />
              </button>
            )}

            <button
              type="button"
              className={`btn-meet-action ${showMeetChat && meetSideTab === "people" ? "active" : ""}`}
              onClick={() => {
                if (showMeetChat && meetSideTab === "people") {
                  setShowMeetChat(false);
                } else {
                  setShowMeetChat(true);
                  setMeetSideTab("people");
                  if (
                    wsRef.current &&
                    wsRef.current.readyState === WebSocket.OPEN
                  ) {
                    wsRef.current.send(JSON.stringify({ type: "GET_MEMBERS" }));
                  }
                }
              }}
              title="Danh sách thành viên"
            >
              <FaUsers />
              <span className="meet-count-badge">{displayMembers.length}</span>
            </button>

            <button
              type="button"
              className={`btn-meet-action ${showMeetChat && meetSideTab === "chat" ? "active" : ""}`}
              onClick={() => {
                if (showMeetChat && meetSideTab === "chat") {
                  setShowMeetChat(false);
                } else {
                  setShowMeetChat(true);
                  setMeetSideTab("chat");
                }
              }}
              title="Trò chuyện trong cuộc gọi"
            >
              <FaComments />
            </button>

            <button
              type="button"
              className="btn-meet-leave"
              onClick={handleLeaveOrDestroyRoom}
              title="Rời phòng"
            >
              <FaPhoneSlash />
              <span className="leave-text">Rời phòng</span>
            </button>
          </div>
        </header>

        {/* 2. TIKTOK TOP BAR (MOBILE) */}
        <header className="tiktok-top-bar mobile-only">
          <div
            className="tiktok-host-pill"
            onClick={() => isCurrentUserHost && setShowHostPanel(true)}
          >
            {renderAvatar(
              hostAvatar,
              currentHostUsername,
              "tiktok-host-avatar",
            )}
            <div className="tiktok-host-info">
              <span className="tiktok-host-name">{currentHostUsername}</span>
              <span className="tiktok-host-badge">
                <FaCrown /> Chủ phòng
              </span>
            </div>
          </div>

          <div className="tiktok-top-right">
            {/* Nút xem danh sách người xem */}
            <button
              type="button"
              className="tiktok-viewers-pill"
              onClick={() => {
                setShowMobileViewers(true);
                if (
                  wsRef.current &&
                  wsRef.current.readyState === WebSocket.OPEN
                ) {
                  wsRef.current.send(JSON.stringify({ type: "GET_MEMBERS" }));
                }
              }}
              title="Danh sách người xem"
            >
              <FaUsers />
              <span>{displayMembers.length}</span>
            </button>

            {/* Nút Bảng điều khiển chủ phòng: Nằm giữa icon số người và nút thoát */}
            {isCurrentUserHost && (
              <button
                type="button"
                className="btn-tiktok-head-host"
                onClick={() => setShowHostPanel(true)}
                title="Bảng điều khiển"
              >
                <FaSlidersH />
              </button>
            )}

            {/* Nút thoát */}
            <button
              type="button"
              className="btn-tiktok-close"
              onClick={handleLeaveOrDestroyRoom}
              title="Rời phòng"
            >
              <FaTimes />
            </button>
          </div>
        </header>

        {/* 3. MAIN WORKSPACE */}
        <div className="room-meet-container">
          {/* STAGE: VIDEO PLAYER + PARTICIPANTS */}
          <div
            className={`meet-stage-column ${showMeetChat ? "has-side-panel" : "no-side-panel"}`}
          >
            {/* The single player wrapper shared across PC and Mobile */}
            <div className="video-player-wrapper" ref={playerWrapperRef}>
              {roomData?.videoUrl ? (
                isM3u8Stream ? (
                  <div
                    className={`hls-video-container ${!isCurrentUserHost ? "guest-mode" : ""} ${!showGuestControls && !isCurrentUserHost ? "hide-cursor" : ""}`}
                    onMouseMove={
                      !isCurrentUserHost ? handlePlayerMouseMove : undefined
                    }
                    onMouseLeave={
                      !isCurrentUserHost ? handlePlayerMouseLeave : undefined
                    }
                    onClick={
                      !isCurrentUserHost ? handlePlayerMouseMove : undefined
                    }
                  >
                    <video
                      key={roomData?.videoUrl || "watch-party-video"}
                      ref={videoRef}
                      className={`watch-party-video-element ${!isCurrentUserHost ? "guest-video-element" : ""}`}
                      controls={Boolean(isCurrentUserHost)}
                      playsInline
                      webkit-playsinline="true"
                      x5-playsinline="true"
                      x-webkit-airplay="allow"
                      tabIndex={isCurrentUserHost ? 0 : -1}
                      onSeeked={() => {
                        if (isSeekingFromSyncRef.current) {
                          isSeekingFromSyncRef.current = false;
                          return;
                        }
                        if (isCurrentUserHost) {
                          handleHostSeeked();
                        }
                      }}
                      onCanPlay={() => {
                        isSeekingFromSyncRef.current = false;
                      }}
                      onTimeUpdate={handleTimeUpdate}
                      onPause={
                        isCurrentUserHost
                          ? handleHostPause
                          : () => {
                              if (
                                videoRef.current &&
                                isConnected &&
                                !videoRef.current.seeking
                              ) {
                                safePlay(videoRef.current);
                              }
                            }
                      }
                      onPlay={isCurrentUserHost ? handleHostPlay : undefined}
                    />

                    {isCurrentUserHost && showSkipAd && (
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

                    {!isCurrentUserHost && (
                      <div
                        className={`guest-player-bar ${showGuestControls ? "visible" : ""}`}
                      >
                        <div className="guest-bar-right">
                          <button
                            type="button"
                            className="btn-guest-action"
                            onClick={toggleMute}
                            title={isMuted ? "Bật âm thanh" : "Tắt âm thanh"}
                          >
                            {isMuted ? <FaVolumeMute /> : <FaVolumeUp />}
                          </button>
                          <button
                            type="button"
                            className="btn-guest-action"
                            onClick={toggleFullscreen}
                            title={
                              isFullscreen
                                ? "Thu nhỏ màn hình"
                                : "Toàn màn hình"
                            }
                          >
                            {isFullscreen ? <FaCompress /> : <FaExpand />}
                          </button>
                        </div>
                      </div>
                    )}

                    {needsUserGesture && (
                      <div
                        className="autoplay-unmute-overlay"
                        onClick={handleUnmuteAndPlay}
                      >
                        <div className="unmute-card">
                          <FaPlay className="play-pulse-icon" />
                          <h4>Bấm vào đây để xem phim</h4>
                          <p>
                            Phim đã phát được {elapsedDisplay}. Bấm để phát
                            tiếng và cùng xem với mọi người!
                          </p>
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
                          <FaClock /> Thời gian phòng:{" "}
                          <strong>{elapsedDisplay}</strong>
                        </span>
                      </div>
                      <span className="sync-bar-desc">
                        (Nếu phim chưa tự tua, bạn vui lòng bấm Play và kéo
                        thanh thời gian đến <strong>{elapsedDisplay}</strong> để
                        xem đúng đoạn cùng phòng nhé!)
                      </span>
                    </div>
                  </div>
                )
              ) : (
                <div className="empty-player-placeholder">
                  <FaFilm className="placeholder-icon" />
                  <p>Chưa có video được phát trong phòng này</p>
                  {isCurrentUserHost && (
                    <button
                      className="btn-add-media"
                      onClick={() => setShowHostPanel(true)}
                    >
                      Thêm link phim ngay
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* GOOGLE MEET PARTICIPANT TILES (DESKTOP ONLY) */}
            <div className="meet-participants-grid desktop-only">
              {displayMembers.slice(0, 9).map((m) => {
                const isMe = user?.id?.toString() === m.userId?.toString();
                const avatarUrl = m.avatar || (isMe ? user?.avatar : "");
                const isHost = Boolean(
                  m.isHost ||
                  (roomData?.hostId &&
                    String(m.userId) === String(roomData.hostId)),
                );
                return (
                  <div
                    key={m.userId}
                    className={`meet-participant-card ${isMe ? "is-me" : ""}`}
                  >
                    {renderAvatar(
                      avatarUrl,
                      m.username,
                      "participant-circle-avatar",
                    )}
                    <div className="participant-card-name">
                      {isHost && <FaCrown className="crown-mini" />}
                      <span className="name-string">
                        {m.username} {isMe ? "(Bạn)" : ""}
                      </span>
                    </div>
                    <div className="participant-card-mic" title="Micro">
                      <FaMicrophoneSlash className="mic-icon-muted" />
                    </div>
                    {isCurrentUserHost && !isMe && !isHost && (
                      <button
                        type="button"
                        className="btn-tile-transfer-host"
                        onClick={() => handleTransferHost(m.userId, m.username)}
                        title="Chuyển quyền chủ phòng"
                      >
                        <FaExchangeAlt />
                      </button>
                    )}
                    {isCurrentUserHost && !isMe && !isHost && (
                      <button
                        type="button"
                        className="btn-tile-kick"
                        onClick={() => handleKickUser(m.userId, m.username)}
                        title="Mời ra khỏi phòng"
                      >
                        <FaBan />
                      </button>
                    )}
                  </div>
                );
              })}

              {displayMembers.length > 9 && (
                <div className="meet-participant-card meet-tile-more">
                  <div className="participant-circle-avatar more-avatar">
                    <span>+{displayMembers.length - 9}</span>
                  </div>
                  <div className="participant-card-name">
                    <span className="name-string">
                      {displayMembers.length - 9} người khác
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* DESKTOP GOOGLE MEET RIGHT DRAWER (CHAT & PEOPLE) */}
          {showMeetChat && (
            <aside className="meet-side-panel desktop-only">
              <div className="meet-drawer-header">
                <div className="drawer-tab-switch">
                  <button
                    type="button"
                    className={`drawer-tab-btn ${meetSideTab === "chat" ? "active" : ""}`}
                    onClick={() => setMeetSideTab("chat")}
                  >
                    <FaComments /> Tin nhắn
                  </button>
                  <button
                    type="button"
                    className={`drawer-tab-btn ${meetSideTab === "people" ? "active" : ""}`}
                    onClick={() => {
                      setMeetSideTab("people");
                      if (
                        wsRef.current &&
                        wsRef.current.readyState === WebSocket.OPEN
                      ) {
                        wsRef.current.send(
                          JSON.stringify({ type: "GET_MEMBERS" }),
                        );
                      }
                    }}
                  >
                    <FaUsers /> Mọi người ({displayMembers.length})
                  </button>
                </div>
                <button
                  type="button"
                  className="btn-drawer-close"
                  onClick={() => setShowMeetChat(false)}
                  title="Đóng bảng"
                >
                  <FaTimes />
                </button>
              </div>

              {meetSideTab === "chat" ? (
                <div className="meet-drawer-chat-body">
                  <div
                    className="meet-chat-message-list custom-scroll"
                    ref={chatScrollRef}
                  >
                    {messages.length === 0 ? (
                      <div className="empty-chat-state">
                        <p>Chào mừng bạn đến với phòng xem chung!</p>
                        <span>
                          Hãy gửi lời chào đầu tiên tới mọi người nhé.
                        </span>
                      </div>
                    ) : (
                      messages.map((msg) => {
                        const isMe =
                          user?.id?.toString() === msg.userId?.toString();
                        const timeStr = new Date(
                          msg.timestamp,
                        ).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        });
                        const avatarUrl =
                          msg.avatar || (isMe ? user?.avatar : "");
                        return (
                          <div
                            key={msg.id}
                            className={`meet-chat-item ${isMe ? "is-me" : ""}`}
                          >
                            {renderAvatar(
                              avatarUrl,
                              msg.username,
                              "meet-msg-avatar",
                            )}
                            <div className="meet-msg-content">
                              <div className="meet-msg-meta">
                                <span
                                  className={`meet-msg-sender ${msg.isHost ? "is-host" : ""}`}
                                >
                                  {msg.isHost && (
                                    <FaCrown className="mini-crown" />
                                  )}
                                  {msg.username}
                                </span>
                                <span className="meet-msg-time">{timeStr}</span>
                              </div>
                              <div className="meet-msg-bubble">{msg.text}</div>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>

                  {errorMessage && (
                    <div className="meet-chat-error-alert">
                      <FaExclamationTriangle />
                      <span>{errorMessage}</span>
                    </div>
                  )}

                  <form
                    onSubmit={handleSendChat}
                    className="meet-chat-bottom-input"
                  >
                    <input
                      type="text"
                      maxLength={200}
                      placeholder="Gửi tin nhắn..."
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                    />
                    <button
                      type="submit"
                      disabled={!chatInput.trim()}
                      title="Gửi"
                    >
                      <FaPaperPlane />
                    </button>
                  </form>
                </div>
              ) : (
                <div className="meet-drawer-people-body custom-scroll">
                  <div className="people-group-title">
                    Đang xem cùng bạn ({displayMembers.length})
                  </div>
                  <div className="people-list-container">
                    {displayMembers.map((m) => {
                      const isMe =
                        user?.id?.toString() === m.userId?.toString();
                      const avatarUrl = m.avatar || (isMe ? user?.avatar : "");
                      const isHost = Boolean(
                        m.isHost ||
                        (roomData?.hostId &&
                          String(m.userId) === String(roomData.hostId)),
                      );
                      return (
                        <div key={m.userId} className="people-row-item">
                          {renderAvatar(
                            avatarUrl,
                            m.username,
                            "people-avatar-circle",
                          )}
                          <div className="people-meta-box">
                            <span className="people-display-name">
                              {m.username} {isMe ? "(Bạn)" : ""}
                            </span>
                            {isHost && (
                              <span className="people-host-badge">
                                <FaCrown /> Chủ phòng
                              </span>
                            )}
                          </div>
                          <div className="people-actions-box">
                            <FaMicrophoneSlash
                              className="mic-muted-status"
                              title="Micro đã tắt"
                            />
                            {isCurrentUserHost && !isMe && !isHost && (
                              <button
                                type="button"
                                className="btn-transfer-host-drawer"
                                onClick={() =>
                                  handleTransferHost(m.userId, m.username)
                                }
                                title="Chuyển quyền chủ phòng"
                              >
                                <FaExchangeAlt />
                              </button>
                            )}
                            {isCurrentUserHost && !isMe && !isHost && (
                              <button
                                type="button"
                                className="btn-kick-from-drawer"
                                onClick={() =>
                                  handleKickUser(m.userId, m.username)
                                }
                                title="Mời ra khỏi phòng"
                              >
                                <FaBan />
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </aside>
          )}

          {/* MOBILE TIKTOK LIVE STREAM CHAT & BOTTOM BAR (MOBILE ONLY) */}
          <div className="tiktok-live-container mobile-only">
            {/* System Pill cố định ở đầu boxchat */}
            <div className="tiktok-system-header">
              <div className="tiktok-system-pill">
                <span>Chào mừng bạn đến với phòng xem chung!</span>
              </div>
            </div>

            {/* Danh sách tin nhắn chat: từ cuối box đi lên */}
            <div
              className="tiktok-messages-stream custom-scroll"
              ref={mobileChatScrollRef}
            >
              <div
                className="tiktok-scroll-top-anchor"
                style={{ marginTop: "auto" }}
              />
              {messages.map((msg) => {
                const isMe = user?.id?.toString() === msg.userId?.toString();
                const avatarUrl = msg.avatar || (isMe ? user?.avatar : "");
                return (
                  <div key={msg.id} className="tiktok-stream-item">
                    {renderAvatar(
                      avatarUrl,
                      msg.username,
                      "tiktok-stream-avatar",
                    )}
                    <div className="tiktok-stream-bubble">
                      <span
                        className={`tiktok-sender-name ${msg.isHost ? "is-host" : ""}`}
                      >
                        {msg.isHost && <FaCrown className="mini-crown" />}
                        {msg.username}:
                      </span>
                      <span className="tiktok-sender-text">{msg.text}</span>
                    </div>
                  </div>
                );
              })}
            </div>

            {errorMessage && (
              <div className="tiktok-error-chip">
                <FaExclamationTriangle />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Mobile TikTok Live Bottom Input & Action Buttons */}
            <div className="tiktok-bottom-bar-fixed">
              <form onSubmit={handleSendChat} className="tiktok-bottom-form">
                <input
                  type="text"
                  maxLength={200}
                  placeholder="Nhập..."
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onFocus={() => {
                    setTimeout(() => {
                      if (window.scrollY !== 0) window.scrollTo(0, 0);
                      if (mobileChatScrollRef.current) {
                        mobileChatScrollRef.current.scrollTop =
                          mobileChatScrollRef.current.scrollHeight;
                      }
                    }, 60);
                  }}
                  onBlur={() => {
                    setTimeout(() => {
                      if (window.scrollY !== 0) window.scrollTo(0, 0);
                      if (mobileChatScrollRef.current) {
                        mobileChatScrollRef.current.scrollTop =
                          mobileChatScrollRef.current.scrollHeight;
                      }
                    }, 60);
                  }}
                />
                <button
                  type="submit"
                  className={`btn-tiktok-send-arrow ${chatInput.trim() ? "active" : "disabled"}`}
                  disabled={!chatInput.trim()}
                  title="Gửi"
                >
                  <FaPaperPlane />
                </button>
              </form>

              <div className="tiktok-quick-buttons">
                <button
                  type="button"
                  className="btn-tiktok-pill-action"
                  onClick={handleCopyInvite}
                  title="Sao chép link mời"
                >
                  <FaShareAlt />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* 4. MOBILE VIEWERS SLIDE-IN DRAWER (Từ phải kéo qua, làm mờ phía sau) */}
        {showMobileViewers && (
          <div
            className="mobile-viewers-drawer-overlay mobile-only"
            onClick={(e) => {
              if (e.target === e.currentTarget) setShowMobileViewers(false);
            }}
          >
            <div className="mobile-viewers-drawer-panel">
              <div className="drawer-header">
                <div className="drawer-title">
                  <FaUsers className="title-icon" />
                  <span>Người xem ({displayMembers.length})</span>
                </div>
                <button
                  type="button"
                  className="btn-close-drawer"
                  onClick={() => setShowMobileViewers(false)}
                  title="Đóng"
                >
                  <FaTimes />
                </button>
              </div>

              <div className="drawer-body custom-scroll">
                {displayMembers.map((m) => {
                  const isMe = user?.id?.toString() === m.userId?.toString();
                  const avatarUrl = m.avatar || (isMe ? user?.avatar : "");
                  const isHost = Boolean(
                    m.isHost ||
                    (roomData?.hostId &&
                      String(m.userId) === String(roomData.hostId)),
                  );
                  return (
                    <div key={m.userId} className="mobile-viewer-item">
                      {renderAvatar(
                        avatarUrl,
                        m.username,
                        "viewer-avatar-circle",
                      )}
                      <div className="viewer-info">
                        <span className="viewer-name">
                          {m.username} {isMe ? "(Bạn)" : ""}
                        </span>
                        {isHost && (
                          <span className="viewer-host-pill">
                            <FaCrown /> Chủ phòng
                          </span>
                        )}
                      </div>
                      <div className="viewer-actions">
                        <FaMicrophoneSlash
                          className="mic-muted-status"
                          title="Micro đã tắt"
                        />
                        {isCurrentUserHost && !isMe && !isHost && (
                          <button
                            type="button"
                            className="btn-transfer-host-mobile"
                            onClick={() =>
                              handleTransferHost(m.userId, m.username)
                            }
                            title="Chuyển quyền chủ phòng"
                          >
                            <FaExchangeAlt />
                          </button>
                        )}
                        {isCurrentUserHost && !isMe && !isHost && (
                          <button
                            type="button"
                            className="btn-kick-user-mobile"
                            onClick={() => handleKickUser(m.userId, m.username)}
                            title="Mời ra khỏi phòng"
                          >
                            <FaBan />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* 5. HOST CONTROLS MODAL OVERLAY (DESKTOP & MOBILE) */}
        {isCurrentUserHost && showHostPanel && (
          <div
            className="host-controls-modal-overlay"
            onClick={(e) => {
              if (e.target === e.currentTarget) setShowHostPanel(false);
            }}
          >
            <div className="host-controls-modal-dialog">
              <div className="host-card-header">
                <div className="header-title-row">
                  <h3 title="Bảng Điều Khiển">
                    <FaSlidersH className="crown-icon" />
                    <span>Bảng Điều Khiển</span>
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
                        <FaArrowLeft /> Quay lại
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
                    <FaTimes />
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
                            src={
                              m.poster_url ||
                              m.thumb_url ||
                              "https://placehold.co/45x60/1a1a2e/ffffff?text=Film"
                            }
                            alt={m.name}
                            className="result-poster"
                            onError={(e) => {
                              e.target.src =
                                "https://placehold.co/45x60/1a1a2e/ffffff?text=Film";
                            }}
                          />
                          <div className="result-info">
                            <strong className="result-title">{m.name}</strong>
                            <span className="result-origin">
                              {m.original_name || ""}
                            </span>
                            <div className="result-badges">
                              <span
                                className={`badge-tag badge-tag--source badge-tag--source-${m.sourceName?.toLowerCase()}`}
                              >
                                {m.sourceName}
                              </span>
                              {m.quality && (
                                <span className="badge-tag badge-tag--quality">
                                  {m.quality}
                                </span>
                              )}
                              {m.year && m.year !== "N/A" && (
                                <span className="badge-tag badge-tag--year">
                                  {m.year}
                                </span>
                              )}
                              {m.current_episode && (
                                <span className="badge-tag badge-tag--ep">
                                  {m.current_episode}
                                </span>
                              )}
                            </div>
                          </div>
                          <button
                            type="button"
                            className="btn-choose-this-movie"
                          >
                            <FaPlay /> Chọn & Phát
                          </button>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    hostMovieSearchText.trim().length >= 2 &&
                    !isSearchingHostMovie && (
                      <div className="host-no-results">
                        Không tìm thấy phim phù hợp với từ khóa "
                        {hostMovieSearchText}".
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
                      <strong className="current-movie-name">
                        {roomData?.title || selectedMovie?.name}
                      </strong>
                      <span className="current-movie-ep">{displayEpisode}</span>
                    </div>
                  </div>

                  {isLoadingDetail ? (
                    <div className="loading-episodes-host">
                      <div
                        className="spinner-border spinner-border-sm text-info"
                        role="status"
                      />
                      <span>Đang tải danh sách tập & server...</span>
                    </div>
                  ) : (
                    <>
                      {/* Chọn Server nếu có nhiều hơn 1 nguồn */}
                      {movieServers.length > 1 && (
                        <div className="host-server-selector">
                          <label>
                            <FaServer /> Nguồn / Server ({movieServers.length}):
                          </label>
                          <div className="server-chips-row">
                            {movieServers.map((srv, idx) => (
                              <button
                                key={idx}
                                type="button"
                                className={`host-srv-chip ${idx === selectedServerIdx ? "active" : ""}`}
                                onClick={() => handleHostSelectServer(idx)}
                              >
                                {srv.display_name ||
                                  srv.server_name ||
                                  `Server ${idx + 1}`}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Danh sách tập phim để chủ phòng bấm chọn */}
                      <div className="host-episode-selector">
                        <label>
                          <FaListOl /> Danh sách tập ({movieEpisodes.length}{" "}
                          tập):
                        </label>
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
                                  {isActive && (
                                    <FaCheck className="ep-check-icon" />
                                  )}
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

                      {/* Chuyển quyền chủ phòng */}
                      {displayMembers.filter(
                        (m) =>
                          !m.isHost &&
                          (roomData?.hostId
                            ? String(m.userId) !== String(roomData.hostId)
                            : true) &&
                          (user?.id
                            ? String(m.userId) !== String(user.id)
                            : true),
                      ).length > 0 && (
                        <div className="host-transfer-selector">
                          <label>
                            <FaCrown /> Chuyển quyền chủ phòng (
                            {
                              displayMembers.filter(
                                (m) =>
                                  !m.isHost &&
                                  (roomData?.hostId
                                    ? String(m.userId) !==
                                      String(roomData.hostId)
                                    : true) &&
                                  (user?.id
                                    ? String(m.userId) !== String(user.id)
                                    : true),
                              ).length
                            }{" "}
                            người khác):
                          </label>
                          <div className="host-transfer-chips custom-scroll">
                            {displayMembers
                              .filter(
                                (m) =>
                                  !m.isHost &&
                                  (roomData?.hostId
                                    ? String(m.userId) !==
                                      String(roomData.hostId)
                                    : true) &&
                                  (user?.id
                                    ? String(m.userId) !== String(user.id)
                                    : true),
                              )
                              .map((m) => (
                                <button
                                  key={m.userId}
                                  type="button"
                                  className="host-transfer-chip"
                                  onClick={() =>
                                    handleTransferHost(m.userId, m.username)
                                  }
                                  title={`Chuyển quyền chủ phòng cho ${m.username}`}
                                >
                                  {renderAvatar(
                                    m.avatar,
                                    m.username,
                                    "transfer-chip-avatar",
                                  )}
                                  <span className="transfer-name">
                                    {m.username}
                                  </span>
                                  <span className="transfer-action-text">
                                    <FaExchangeAlt /> Chuyển
                                  </span>
                                </button>
                              ))}
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  }

  // Render: Trang Sảnh Phòng Xem Chung (Lobby)
  return (
    <div className="watch-party-lobby-wrapper">
      <div className="watch-party-lobby-page">
        <Helmet>
          <title>Xem Chung Phim Trực Tiếp (Watch Party) | Tecede</title>
          <meta
            name="description"
            content="Xem phim cùng bạn bè theo thời gian thực, trò chuyện trực tiếp và chia sẻ khoảnh khắc điện ảnh đáng nhớ."
          />
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
              Xem phim cùng bạn bè theo thời gian thực, tự động đồng bộ và chat
              trực tiếp mà không cần cài đặt phần mềm.
            </p>

            <div className="hero-actions">
              <button
                className="btn-create-room-hero"
                onClick={handleOpenCreateModal}
              >
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
            <button
              className="btn-refresh-rooms"
              onClick={fetchRooms}
              title="Làm mới danh sách"
            >
              <FaSyncAlt className={isLoadingRooms ? "spin" : ""} />
              <span>Làm mới</span>
            </button>
          </div>
        </section>

        {/* Grid Danh Sách Phòng Đang Chiếu */}
        <section className="lobby-rooms-section">
          <div className="section-header">
            <h2>
              <FaTv className="sec-icon" /> Các phòng đang công chiếu (
              <strong>{filteredRooms.length}</strong>)
            </h2>
            <span className="section-note">
              Tham gia ngay để xem cùng mọi người
            </span>
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
              <p>
                Hãy là người đầu tiên tạo phòng xem chung để cùng thưởng thức
                phim với bạn bè!
              </p>
              <button
                className="btn-create-empty"
                onClick={handleOpenCreateModal}
              >
                <FaPlus /> Tạo phòng đầu tiên ngay
              </button>
            </div>
          ) : (
            <div className="rooms-grid">
              {filteredRooms.map((room) => {
                const elapsedSec =
                  typeof room.elapsedSeconds === "number"
                    ? room.elapsedSeconds
                    : Math.max(
                        0,
                        Math.floor(
                          (Date.now() - (room.startedAt || Date.now())) / 1000,
                        ),
                      );
                const elapsedMins = Math.floor(elapsedSec / 60);
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
                      <h3 className="room-card-title">
                        {room.title || "Phim xem chung"}
                      </h3>
                      <p className="room-card-name">{room.roomName}</p>

                      <div className="room-card-footer">
                        <span className="room-episode-badge">
                          {formatEpisode(room.episode)}
                        </span>
                        <span className="room-host-info">
                          <FaCrown /> {room.hostUsername || "Host"}
                        </span>
                      </div>

                      <div className="room-card-action">
                        <span className="elapsed-text">
                          Đã phát ~
                          {elapsedMins > 0
                            ? `${elapsedMins} phút`
                            : elapsedSec > 10
                              ? `${elapsedSec}s`
                              : "vừa mới"}
                        </span>
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
          <div
            className="modal-backdrop"
            onClick={() => setShowCreateModal(false)}
          >
            <div
              className="modal-create-card modal-create-card--smart"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="modal-header">
                <h2>
                  <FaPlus /> Tạo Phòng Xem Chung
                </h2>
                <button
                  className="btn-close-modal"
                  onClick={() => setShowCreateModal(false)}
                >
                  ×
                </button>
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
                        {isSearchingMovie && (
                          <div className="smart-search-spinner" />
                        )}
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
                                  <span
                                    className={`poster-source-badge source-${m.sourceName?.toLowerCase()}`}
                                  >
                                    {m.sourceName}
                                  </span>
                                )}
                                <img
                                  src={
                                    m.poster_url ||
                                    m.thumb_url ||
                                    "https://placehold.co/60x80/1a1a2e/ffffff?text=Film"
                                  }
                                  alt={m.name}
                                  className="suggestion-poster"
                                  onError={(e) => {
                                    e.target.src =
                                      "https://placehold.co/60x80/1a1a2e/ffffff?text=Film";
                                  }}
                                />
                              </div>
                              <div className="suggestion-info">
                                <strong className="suggestion-title">
                                  {m.name}
                                </strong>
                                <span className="suggestion-origin">
                                  {m.original_name || m.origin_name || ""}
                                </span>
                                <div className="suggestion-badges-row">
                                  {m.sourceName && (
                                    <span
                                      className={`badge-tag badge-tag--source badge-tag--source-${m.sourceName.toLowerCase()}`}
                                    >
                                      {m.sourceName}
                                    </span>
                                  )}
                                  {m.quality && m.quality !== "N/A" && (
                                    <span className="badge-tag badge-tag--quality">
                                      {m.quality}
                                    </span>
                                  )}
                                  {m.language && m.language !== "N/A" && (
                                    <span className="badge-tag badge-tag--lang">
                                      {m.language}
                                    </span>
                                  )}
                                  {m.current_episode && (
                                    <span className="badge-tag badge-tag--ep">
                                      {m.current_episode}
                                    </span>
                                  )}
                                  {m.year && m.year !== "N/A" && (
                                    <span className="badge-tag badge-tag--year">
                                      {m.year}
                                    </span>
                                  )}
                                  {m.time && m.time !== "N/A" && (
                                    <span className="badge-tag badge-tag--time">
                                      {m.time}
                                    </span>
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
                        src={
                          selectedMovie.poster_url ||
                          selectedMovie.thumb_url ||
                          "https://placehold.co/60x80/1a1a2e/ffffff?text=Film"
                        }
                        alt={selectedMovie.name}
                        className="selected-poster"
                        onError={(e) => {
                          e.target.src =
                            "https://placehold.co/60x80/1a1a2e/ffffff?text=Film";
                        }}
                      />
                      <div className="selected-meta">
                        <h4>{selectedMovie.name}</h4>
                        <span>
                          {selectedMovie.origin_name ||
                            selectedMovie.original_name ||
                            ""}
                        </span>
                        <div className="selected-badges-row">
                          {selectedMovie.sourceName && (
                            <span
                              className={`badge-tag badge-tag--source badge-tag--source-${selectedMovie.sourceName.toLowerCase()}`}
                            >
                              {selectedMovie.sourceName}
                            </span>
                          )}
                          {selectedMovie.quality &&
                            selectedMovie.quality !== "N/A" && (
                              <span className="badge-tag badge-tag--quality">
                                {selectedMovie.quality}
                              </span>
                            )}
                          {selectedMovie.language &&
                            selectedMovie.language !== "N/A" && (
                              <span className="badge-tag badge-tag--lang">
                                {selectedMovie.language}
                              </span>
                            )}
                          {selectedMovie.current_episode && (
                            <span className="badge-tag badge-tag--ep">
                              {selectedMovie.current_episode}
                            </span>
                          )}
                          {selectedMovie.year &&
                            selectedMovie.year !== "N/A" && (
                              <span className="badge-tag badge-tag--year">
                                {selectedMovie.year}
                              </span>
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
                        <div
                          className="spinner-border spinner-border-sm text-info"
                          role="status"
                        />
                        <span>Đang nạp danh sách tập & server...</span>
                      </div>
                    ) : (
                      <>
                        {/* Chọn Server nếu có nhiều hơn 1 server */}
                        {movieServers.length > 1 && (
                          <div className="server-selector-group">
                            <label>
                              <FaServer /> Nguồn / Server ({movieServers.length}
                              ):
                            </label>
                            <div className="server-pills-row">
                              {movieServers.map((srv, idx) => (
                                <button
                                  key={idx}
                                  type="button"
                                  className={`server-chip ${idx === selectedServerIdx ? "active" : ""}`}
                                  onClick={() => handleSelectServer(idx)}
                                >
                                  {srv.display_name ||
                                    srv.server_name ||
                                    `Server ${idx + 1}`}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Chọn Tập phim */}
                        {movieEpisodes.length > 0 ? (
                          <div className="episode-selector-group">
                            <label>
                              <FaListOl /> Chọn tập bắt đầu xem chung (
                              {movieEpisodes.length} tập):
                            </label>
                            <div className="episode-chips-grid custom-scroll">
                              {movieEpisodes.map((ep, idx) => (
                                <button
                                  key={idx}
                                  type="button"
                                  className={`episode-chip ${selectedEpisode?.slug === ep.slug ? "active" : ""}`}
                                  onClick={() => handleSelectEpisode(ep)}
                                >
                                  {selectedEpisode?.slug === ep.slug && (
                                    <FaCheck className="ep-check-icon" />
                                  )}
                                  {ep.name || `Tập ${idx + 1}`}
                                </button>
                              ))}
                            </div>
                          </div>
                        ) : (
                          <div className="no-episodes-warning">
                            Phim này chưa có nguồn M3U8 từ KK hoặc NC để đồng bộ
                            thời gian.
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
                  <button
                    type="button"
                    className="btn-cancel"
                    onClick={() => setShowCreateModal(false)}
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    className="btn-submit-create"
                    disabled={isSubmitting || (!selectedMovie && !formVideoUrl)}
                  >
                    {isSubmitting
                      ? "Đang tạo phòng..."
                      : "Khởi tạo & Vào phòng ngay"}
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
