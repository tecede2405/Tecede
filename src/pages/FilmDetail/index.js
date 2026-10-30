import { useEffect, useState, useMemo, useCallback, useRef } from "react";
import { useParams, useNavigate, useLocation, Link } from "react-router-dom"; 
import LatestMovies from "../../component/LatestMovies.js/index";
import { GoChevronLeft } from "react-icons/go";
import { MdOutlineStorage, MdOutlineTune } from "react-icons/md";
import { FaBackwardStep, FaForwardStep } from "react-icons/fa6";
import { FaCommentDots, FaReply, FaPaperPlane, FaCrown } from "react-icons/fa";
import { useAuth } from "../../context/AuthContext";
import { VerifiedBadge, PremiumBadge } from "../../component/VerifiedBadge/index";
import Swal from "sweetalert2";
import HlsPlayer from "../../component/HlsPlayer";
import useScreenWakeLock from "../../hooks/useScreenWakeLock";
import "./style.scss";

// TẠO BỘ NHỚ ĐỆM (CACHE) Ở NGOÀI COMPONENT ĐỂ KHÔNG BỊ MẤT KHI RE-RENDER
const filmCache = {};
const commentCache = {};

// BỘ TỪ ĐIỂN ĐỂ ĐỔI TÊN NGUỒN NGẮN GỌN VÀ CHỐNG TRÙNG SERVER
const SOURCE_NAMES = {
  kk: "KK",
  kkphim: "KK",
  op: "OP",
  nc: "NC",
  of: "OF",
  onflix: "OF",
  nguonc: "NC",
  vm: "VM",
  vsmov: "VM"
};

const DEFAULT_AVATAR = "https://ui-avatars.com/api/?name=User&background=1e293b&color=cbd5e1&size=128";

const getDefaultAvatar = (name) => {
  if (!name) return DEFAULT_AVATAR;
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=1e293b&color=cbd5e1&size=128`;
};

const isValidAvatar = (url) => {
  return Boolean(
    url && 
    typeof url === "string" && 
    url.trim() !== "" && 
    url !== "null" && 
    url !== "undefined"
  );
};

export default function FilmDetail() {
  // Giữ màn hình luôn sáng khi xem phim (kể cả iframe embed và fullscreen)
  useScreenWakeLock(true);

  const { slug, server, episodeSlug } = useParams();
  const navigate = useNavigate();
  const location = useLocation(); 
  const { user } = useAuth();
  
  const passedMovie = location.state?.movieData;
  const passedSources = location.state?.sourcesData;

  const [movie, setMovie] = useState(null);
  const [servers, setServers] = useState([]);
  const [currentServer, setCurrentServer] = useState(0);
  const [episodes, setEpisodes] = useState([]);
  // eslint-disable-next-line no-unused-vars
  const [isKkphim, setIsKkphim] = useState(false); 
  
  const [comments, setComments] = useState([]);
  const [commentInput, setCommentInput] = useState("");
  const [replyBox, setReplyBox] = useState(null);
  const [replyInput, setReplyInput] = useState("");
  
  const lastSavedRef = useRef("");
  const lastEpisodeRef = useRef("");
  const isSavingRef = useRef(false);
  const lastKeyRef = useRef("");

  const [selectedEpisodeSlug, setSelectedEpisodeSlug] = useState(null);

  // Clear data (chỉ clear khi xem phim hoàn toàn mới, chưa có trong cache)
  useEffect(() => {
    if (!filmCache[slug]) {
      setMovie(null);
      setServers([]);
      setEpisodes([]);
      setIsKkphim(false);
      setSelectedEpisodeSlug(null);
    }
  }, [slug]);

  const loadComments = useCallback(async () => {
    try {
      if (commentCache[slug]) {
        setComments(commentCache[slug]);
        return;
      }
      const res = await fetch(`${process.env.REACT_APP_SERVER_API_URL}/comments/${slug}`);
      const data = await res.json();
      commentCache[slug] = data; 
      setComments(data);
    } catch (e) { }
  }, [slug]);

  // FETCH DỮ LIỆU HOẶC DÙNG DATA TỪ ROUTER
  useEffect(() => {
    let isMounted = true; 

    async function fetchFilm() {
      try {
        if (filmCache[slug]) {
          const cachedData = filmCache[slug];
          const cachedHasM3u8 = cachedData.mergedServers?.some(srv => 
            srv.server_data?.some(ep => ep.m3u8Url)
          );
          if (cachedHasM3u8 && isMounted) {
            setMovie(cachedData.movieData);
            setServers(cachedData.mergedServers);
            setIsKkphim(cachedData.isKkphim);
            return; 
          }
          delete filmCache[slug];
        }

        let movieDataToUse = passedMovie;
        let episodesDataToUse = passedSources;

        const checkHasM3u8 = (list) => {
          if (!Array.isArray(list) || list.length === 0) return false;
          return list.some(src => 
            (src.episodes || []).some(srv => 
              (srv.server_data || srv.items || []).some(ep => Boolean(ep.link_m3u8 || ep.m3u8))
            )
          );
        };

        const checkNcHasM3u8 = (list) => {
          if (!Array.isArray(list) || list.length === 0) return false;
          const nc = list.find(s => s.source?.toLowerCase() === "nc" || s.source?.toLowerCase() === "nguonc");
          if (!nc) return true;
          return (nc.episodes || []).some(srv => 
            (srv.server_data || srv.items || []).some(ep => Boolean(ep.link_m3u8 || ep.m3u8))
          );
        };

        const isMissingM3u8 = !movieDataToUse || 
                             !episodesDataToUse || 
                             episodesDataToUse.length === 0 || 
                             !checkHasM3u8(episodesDataToUse) || 
                             !checkNcHasM3u8(episodesDataToUse);

        if (isMissingM3u8) {
          const baseUrl = `${process.env.REACT_APP_SERVER_API_URL}/movie-detail/${slug}`;
          
          if (!movieDataToUse || !episodesDataToUse || episodesDataToUse.length === 0) {
            try {
              const res = await fetch(baseUrl);
              const responseJson = await res.json();
              movieDataToUse = responseJson.data?.movie;
              episodesDataToUse = responseJson.data?.episodes || [];
            } catch (e) {}
          }

          if (!movieDataToUse || episodesDataToUse.length === 0 || !checkHasM3u8(episodesDataToUse) || !checkNcHasM3u8(episodesDataToUse)) {
            console.log(`[FilmDetail/xem-phim] Phim ${slug} chưa có m3u8, đang tự động gọi ?refresh=true...`);
            try {
              const refRes = await fetch(`${baseUrl}?refresh=true`);
              const refJson = await refRes.json();
              if (refJson.success && refJson.data?.movie) {
                movieDataToUse = refJson.data.movie;
                episodesDataToUse = refJson.data.episodes || [];
              }
            } catch (e) {}
          }
        }

        const mergedServers = [];
        episodesDataToUse.forEach(src => {
          const sourceLabel = SOURCE_NAMES[src.source] || src.source?.toUpperCase() || "Server";

          (src.episodes || []).forEach(srv => {
            const serverData = srv.server_data || srv.items || [];
            const normalized = serverData.map(ep => ({
              name: ep.name,
              slug: ep.slug,
              embedUrl: ep.link_embed || ep.embed,
              m3u8Url: ep.link_m3u8 || ep.m3u8,
            }));

            const hasValidData = normalized.some(ep => ep.slug && ep.slug.trim() !== "");

            if (hasValidData) {
              const uniqueServerName = `${sourceLabel} - ${srv.server_name}`;
              const episodeCount = normalized.length;

              mergedServers.push({
                // Dùng cho URL và logics 
                server_name: uniqueServerName,

                // Dùng để hiển thị
                display_name: `${uniqueServerName} (${episodeCount} tập)`,

                server_data: normalized,
                sourceName: sourceLabel,
                episodeCount
              });
            }
          });
        });

        const priority = { "KK": 1, "OP": 2, "OF": 3,"NC": 4, "VM": 5 };
        mergedServers.sort((a, b) => {
          const rankA = priority[a.sourceName] || 99;
          const rankB = priority[b.sourceName] || 99;
          return rankA - rankB;
        });

        const isKk = episodesDataToUse.some(s => s.source === "kk" || s.source === "kkphim");

        filmCache[slug] = {
          movieData: movieDataToUse,
          mergedServers,
          isKkphim: isKk
        };

        if (isMounted) {
          setMovie(movieDataToUse);
          setServers(mergedServers);
          setIsKkphim(isKk);
        }
      } catch (err) {
        console.error("Lỗi fetch phim:", err);
      }
    }

    fetchFilm();
    loadComments();

    return () => {
      isMounted = false; 
    };
  }, [slug, loadComments, passedMovie, passedSources]);

  // ĐỒNG BỘ ĐỒNG THỜI CẢ SERVER VÀ TẬP TỪ URL
  useEffect(() => {
    if (!servers || servers.length === 0) return;

    if (!server || !episodeSlug) {
      const defaultServer = servers[0];
      const defaultEp = defaultServer.server_data[0]?.slug;
      if (defaultEp) {
        navigate(`/xem-phim/${slug}/${encodeURIComponent(defaultServer.server_name)}/${defaultEp}`, { replace: true });
      }
      return; 
    }

    const srvIdx = servers.findIndex(s => s.server_name === server);

    if (srvIdx === -1) {
      const defaultServer = servers[0];
      const defaultEp = defaultServer.server_data[0]?.slug;
      navigate(`/xem-phim/${slug}/${encodeURIComponent(defaultServer.server_name)}/${defaultEp}`, { replace: true });
      return;
    }

    setCurrentServer(srvIdx);
    const currentList = servers[srvIdx].server_data || [];
    setEpisodes(currentList);

    const foundEp = currentList.find(e => e.slug === episodeSlug);

    if (foundEp) {
      setSelectedEpisodeSlug(episodeSlug);
    } else {
      if (currentList.length > 0) {
        navigate(`/xem-phim/${slug}/${encodeURIComponent(server)}/${currentList[0].slug}`, { replace: true });
      }
    }
  }, [servers, server, episodeSlug, slug, navigate]);

  const currentVideo = useMemo(() => {
    if (!episodes || episodes.length === 0) return null;
    return episodes.find((v) => v.slug === selectedEpisodeSlug) || episodes[0];
  }, [episodes, selectedEpisodeSlug]);

  const isReady = !!movie && !!currentVideo && episodes.length > 0;

  const currentServerObj = servers[currentServer];

  const isKkOrNcServer = useMemo(() => {
    const sName = currentServerObj?.sourceName?.toUpperCase() || "";
    const sFullName = currentServerObj?.server_name?.toUpperCase() || "";
    return Boolean(
      sName === "KK" ||
      sName === "NC" ||
      sFullName.includes("KK") ||
      sFullName.includes("NC")
    );
  }, [currentServerObj]);

  const [playMode, setPlayMode] = useState(() => {
    try {
      return localStorage.getItem("mamphim_play_mode") || "hls";
    } catch (e) {
      return "hls";
    }
  });

  const handlePlayModeChange = (mode) => {
    setPlayMode(mode);
    try {
      localStorage.setItem("mamphim_play_mode", mode);
    } catch (e) {}
  };

  const isVmServer = useMemo(() => {
    const srv = servers[currentServer];
    return Boolean(
      srv?.sourceName?.toUpperCase() === "VM" ||
      srv?.server_name?.toUpperCase().includes("VM") ||
      (!currentVideo?.m3u8Url && currentVideo?.embedUrl)
    );
  }, [servers, currentServer, currentVideo]);

  const shouldUseIframe = useMemo(() => {
    if (isVmServer) return true;
    if (isKkOrNcServer && playMode === "iframe") return true;
    return false;
  }, [isVmServer, isKkOrNcServer, playMode]);

  const currentIndex = useMemo(() => {
    return episodes.findIndex((v) => v.slug === currentVideo?.slug);
  }, [episodes, currentVideo]);

  // ĐÃ XÓA BỎ CONFIG PROXY HÌNH ẢNH VÀ ĐUÔI WEB P - TRẢ VỀ LINK GỐC TRỰC TIẾP
  function getImageUrl(url) {
    if (!url) return "";
    return url; // Trả thẳng link ảnh sạch từ API gốc
  }

  const isNguonC_or_OPhim = 
    movie?.poster_url?.includes("phim.nguonc.com") || 
    movie?.thumb_url?.includes("phim.nguonc.com") ||
    movie?.poster_url?.includes("ophim") ||
    movie?.thumb_url?.includes("ophim");

  let posterRaw = "";
  let thumbRaw = "";

  if (isNguonC_or_OPhim) {
    posterRaw = movie?.thumb_url;
    thumbRaw = movie?.poster_url;
  } else {
    posterRaw = movie?.poster_url;
    thumbRaw = movie?.thumb_url;
  }

  if (!posterRaw) posterRaw = thumbRaw;
  if (!thumbRaw) thumbRaw = posterRaw;

  const posterUrl = getImageUrl(posterRaw);
  const thumbUrl = getImageUrl(thumbRaw);

  const handleChangeServer = (serverIndex) => {
    const newList = servers[serverIndex]?.server_data || [];
    const newServerName = servers[serverIndex]?.server_name;
    
    if (newList.length > 0) {
      navigate(`/xem-phim/${slug}/${encodeURIComponent(newServerName)}/${newList[0].slug}`);
    }
  };

  const submitComment = async (parentId = null) => {
    const content = parentId ? replyInput : commentInput;

    if (!content.trim()) return;

    if (!user?.token) {
      Swal.fire({
        icon: "warning",
        title: "Chưa đăng nhập",
        text: "Bạn cần đăng nhập để bình luận",
        background: "#111",
        color: "#fff",
        showCancelButton: true,
        confirmButtonText: "Đăng nhập",
        cancelButtonText: "Đóng",
        confirmButtonColor: "#e50914",
        cancelButtonColor: "#333",
        customClass: { popup: "dark-swal-popup" },
      }).then((result) => {
        if (result.isConfirmed) {
          navigate("/login");
          window.scrollTo({ top: 0, behavior: "instant" });
        }
      });
      return;
    }

    try {
      const res = await fetch(`${process.env.REACT_APP_SERVER_API_URL}/comments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
        body: JSON.stringify({
          movie_path: slug,
          content,
          parent_id: parentId,
        }),
      });

      const newComment = await res.json();

      const addReply = (comments, parentId, newComment) => {
        return comments.map((c) => {
          if (c.id === parentId) {
            return {
              ...c,
              replies: [...(c.replies || []), newComment],
            };
          }
          if (c.replies && c.replies.length > 0) {
            return {
              ...c,
              replies: addReply(c.replies, parentId, newComment),
            };
          }
          return c;
        });
      };

      setComments((prev) => {
        const commentWithUserRole = {
          ...newComment,
          role: newComment.role || user.role,
          user_role: newComment.user_role || user.role,
          user_id: newComment.user_id ?? user.id ?? user.user_id,
          avatar: newComment.avatar || user.avatar,
          display_name: newComment.display_name || user.display_name,
          replies: newComment.replies || [],
        };
        const newCommentsList = !parentId ? [commentWithUserRole, ...prev] : addReply(prev, parentId, commentWithUserRole);
        commentCache[slug] = newCommentsList;
        return newCommentsList;
      });

      setCommentInput("");
      setReplyInput("");
      setReplyBox(null);
    } catch (e) {
      alert("Lỗi gửi comment");
    }
  };

  useEffect(() => {
    lastKeyRef.current = "";
  }, [slug]);

  const saveHistoryToServer = useCallback(async (
    moviePath,
    serverName,
    episode,
    image,
    movieName
  ) => {
    try {
      if (!user?.token) return;

      const payload = {
        movie_path: moviePath,
        movie_name: movieName,
        server: serverName,
        episode,
        image,
      };

      await fetch(`${process.env.REACT_APP_SERVER_API_URL}/history`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
        body: JSON.stringify(payload),
      });

    } catch (err) {
      console.log("Lỗi lưu history:", err);
    }
  }, [user]);

  useEffect(() => {
    if (!user?.token) return;
    if (!isReady) return;

    const movieName = movie.name;
    const movieImage = posterUrl; 

    if (!movieName || !movieImage) return;

    const key = `${slug}-${server}-${currentVideo.slug}`;

    if (lastKeyRef.current === key) return;

    const timer = setTimeout(async () => {
      if (isSavingRef.current) return;

      isSavingRef.current = true;
      try {
        await saveHistoryToServer(
          slug,
          server,
          currentVideo.slug,
          movieImage,
          movieName
        );
        lastKeyRef.current = key;
      } finally {
        isSavingRef.current = false;
      }
    }, 2500);

    return () => clearTimeout(timer);
  }, [slug, server, currentVideo?.slug, user?.token, movie, episodes.length, isReady, saveHistoryToServer, posterUrl]);

  useEffect(() => {
    lastSavedRef.current = "";
    lastEpisodeRef.current = "";
  }, [slug, server]);

  const getAvatarLetter = (name) => {
    if (!name) return "U";
    const words = name.trim().split(" ");
    const lastWord = words[words.length - 1];
    return lastWord.charAt(0).toUpperCase();
  };

  const formatVietnamTime = (dateStr) => {
    if (!dateStr) return "";
    try {
      const isoString = dateStr.includes("Z") || dateStr.includes("+")
        ? dateStr
        : dateStr.replace(" ", "T") + "Z";
      const date = new Date(isoString);
      if (isNaN(date.getTime())) return dateStr;

      const parts = new Intl.DateTimeFormat("en-GB", {
        timeZone: "Asia/Ho_Chi_Minh",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
      }).formatToParts(date);

      const m = {};
      parts.forEach((p) => {
        m[p.type] = p.value;
      });

      return `${m.hour}:${m.minute}:${m.second} ${m.day}/${m.month}/${m.year}`;
    } catch (e) {
      return dateStr;
    }
  };

  const allUserNames = useMemo(() => {
    const names = new Set();
    comments.forEach((c) => {
      if (c.display_name) names.add(c.display_name.trim());
      if (Array.isArray(c.replies)) {
        c.replies.forEach((r) => {
          if (r.display_name) names.add(r.display_name.trim());
        });
      }
    });
    return Array.from(names).sort((a, b) => b.length - a.length);
  }, [comments]);

  const renderCommentContent = useCallback((content) => {
    if (!content) return "";
    const escapedCandidates = allUserNames.map((name) =>
      name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
    );
    let pattern;
    if (escapedCandidates.length > 0) {
      pattern = new RegExp("(@(?:" + escapedCandidates.join("|") + "|[\\p{L}\\p{N}_]+))", "gu");
    } else {
      pattern = /(@[\p{L}\p{N}_]+)/gu;
    }

    return content.split(pattern).map((part, index) => {
      if (part.startsWith("@")) {
        return (
          <span key={index} className="mention-tag">
            {part}
          </span>
        );
      }
      return part;
    });
  }, [allUserNames]);

  if (!movie || !currentVideo || servers.length === 0) {
    return (
      <div className="movie-loading">
        <div className="movie-loading__spinner"></div>
      </div>
    );
  }

  return (
    <div
      className="movie-page pb-5 pt-3"
      style={{
        "--bg-url": `url(${thumbUrl})`,
      }}
    >
      <div className="container-fluid px-0 px-md-5">
        
        <div className="movie-layout">
          
          {/* CỘT TRÁI */}
          <div className="movie-page__main">
            {/* Title */}
            <h5 className="movie-page__title mb-4">
              <GoChevronLeft
                onClick={() => navigate(-1)}
                style={{ cursor: "pointer", border: "1px solid #ddd", borderRadius: "50%" }}
              />
              <i className="ms-2">Bạn đang xem : {movie.name} – {currentVideo.name}</i>
            </h5>

            {/* Player */}
            {shouldUseIframe ? (
              <div className="movie-page__player ratio ratio-16x9 mb-4 mx-auto">
                {currentVideo?.embedUrl ? (
                  <iframe
                    key={currentVideo.embedUrl}
                    src={currentVideo.embedUrl}
                    title={`Phim ${movie.name} - ${currentVideo.name}`}
                    className="w-100 h-100"
                    allow="autoplay; fullscreen; encrypted-media; picture-in-picture; screen-wake-lock;"
                    allowFullScreen
                    referrerPolicy="strict-origin-when-cross-origin"
                    frameBorder="0"
                  />
                ) : (
                  <div className="d-flex align-items-center justify-content-center bg-dark text-white">
                    Đang tải video...
                  </div>
                )}
              </div>
            ) : (
              <div className="movie-page__player mb-4 mx-auto">
                <HlsPlayer
                  movie={movie}
                  servers={servers}
                  currentServer={currentServer}
                  currentVideo={currentVideo}
                  episodes={episodes}
                  selectedEpisodeSlug={selectedEpisodeSlug || currentVideo?.slug}
                  onChangeServer={handleChangeServer}
                  onChangeEpisode={(epSlug) => {
                    navigate(`/xem-phim/${slug}/${encodeURIComponent(server)}/${epSlug}`);
                  }}
                  posterUrl={posterUrl}
                  thumbUrl={thumbUrl}
                />
              </div>
            )}

            {/* Server selector */}
            <h5 className="server-title"><MdOutlineStorage /> Chọn server</h5>
            <div className="server-list">
              {servers.map((s, idx) => (
                <button
                  key={idx}
                  className={`server-pill ${idx === currentServer ? "active" : ""}`}
                  onClick={() => handleChangeServer(idx)}
                >
                  <MdOutlineStorage />
                  {s.display_name}
                </button>
              ))}
            </div>

            {/* Chế độ nguồn phát: IF (cũ) / HLS (mới) cho Server KK hoặc NC */}
            {isKkOrNcServer && (
              <div className="play-mode-container mt-3 mb-2">
                <div className="play-mode-label">
                  <MdOutlineTune /> Chế độ nguồn phát:
                </div>
                <div className="play-mode-options">
                  <button
                    type="button"
                    className={`play-mode-pill ${playMode === "iframe" ? "active" : ""}`}
                    onClick={() => handlePlayModeChange("iframe")}
                    title="Phát qua khung nhúng IF (cũ)"
                  >
                    <span className="mode-dot"></span>
                    <span>IF (cũ)</span>
                  </button>

                  <button
                    type="button"
                    className={`play-mode-pill ${playMode === "hls" ? "active" : ""}`}
                    onClick={() => handlePlayModeChange("hls")}
                    title="Phát qua bộ phát HLS (mới)"
                  >
                    <span className="mode-dot"></span>
                    <span>HLS (mới)</span>
                  </button>
                </div>
              </div>
            )}



            <p className="film-policy border-top pt-2 mt-3 fst-italic">
              Nếu bạn không load được phim hãy đổi server khác, 1 số phim sẽ bị match sai kết quả cứ đổi server khác sẽ xem được nha.
            </p>

            {/* Navigation buttons */}
            <div className="movie-page__nav">
              <button
                type="button"
                className="ep-nav-btn ep-nav-btn--prev"
                onClick={() => {
                  const prev = episodes[currentIndex - 1];
                  if (!prev) return;
                  navigate(`/xem-phim/${slug}/${encodeURIComponent(server)}/${prev.slug}`);
                }}
                disabled={currentIndex <= 0}
                title={currentIndex > 0 ? `Chuyển về tập ${episodes[currentIndex - 1]?.name || ""}` : "Đã là tập đầu tiên"}
              >
                <FaBackwardStep className="ep-nav-icon" />
                <span>Tập trước</span>
              </button>

              <button
                type="button"
                className="ep-nav-btn ep-nav-btn--next"
                onClick={() => {
                  const next = episodes[currentIndex + 1];
                  if (!next) return;
                  navigate(`/xem-phim/${slug}/${encodeURIComponent(server)}/${next.slug}`);
                }}
                disabled={currentIndex >= episodes.length - 1}
                title={currentIndex < episodes.length - 1 ? `Chuyển sang tập ${episodes[currentIndex + 1]?.name || ""}` : "Đã là tập mới nhất"}
              >
                <span>Tập sau</span>
                <FaForwardStep className="ep-nav-icon" />
              </button>
            </div>

            {/* Movie Info */}
            <div className="movie-page__info mb-4">
              <div className="movie-page__info-layout">
                <div className="movie-page__poster">
                  <img
                    src={posterUrl}
                    alt={movie.name}
                    loading="lazy"
                  />
                </div>
                <div className="movie-page__content">
                  <h2 className="movie-page__name">{movie.name}</h2>
                  <div className="movie-page__meta">
                    <span className="badge bg-info">Số tập: {movie.episode_total || episodes.length}</span>
                    <span className="badge bg-secondary ms-1">{movie.lang}</span>
                    {movie.category?.map((cat, index) => (
                      <span key={index} className="badge bg-dark ms-1">{cat.name}</span>
                    ))}
                  </div>
                  <p className="movie-page__desc mt-3">{movie.content}</p>
                </div>
              </div>
            </div>

            {/* Episode List */}
            <h2 className="movie-page__subtitle h5 mb-3">
              Danh sách tập – {servers[currentServer]?.server_name}
            </h2>
            <div className="movie-page__episodes d-flex flex-wrap gap-2 mb-3">
              {episodes.map((video, index) => (
                <button
                  key={`${video.slug}-${index}`}
                  onClick={() => {
                    navigate(`/xem-phim/${slug}/${encodeURIComponent(server)}/${video.slug}`);
                  }}
                  className={`movie-page__episode btn ${currentVideo.slug === video.slug ? "btn-primary" : "btn-outline-secondary"}`}
                >
                  {video.name}
                </button>
              ))}
            </div>

            {/* ================= COMMENT SECTION ================= */}
            <div className="comment-section">
              <div className="comment-section__header">
                <div className="comment-section__title-wrap">
                  <FaCommentDots className="comment-section__title-icon" />
                  <h4 className="comment-section__title">Bình luận</h4>
                  <span className="comment-section__count">{comments.length}</span>
                </div>
              </div>

              {/* Khung nhập bình luận chính */}
              <div className="comment-box-card">
                <div className="comment-box-card__body">
                  <textarea
                    value={commentInput}
                    onChange={(e) => setCommentInput(e.target.value)}
                    placeholder="Viết cảm nghĩ của bạn về tập phim này..."
                    className="comment-box-card__textarea"
                    rows={3}
                  />
                </div>
                <div className="comment-box-card__footer">
                  <span className="comment-box-card__hint">
                    Hãy bình luận văn minh và lịch sự nhé!
                  </span>
                  <button
                    onClick={() => submitComment()}
                    className="btn-comment-submit"
                    disabled={!commentInput.trim()}
                  >
                    <FaPaperPlane className="btn-icon" />
                    <span>Gửi</span>
                  </button>
                </div>
              </div>

              {/* Danh sách bình luận */}
              <div className="comment-list">
                {comments.length === 0 ? (
                  <div className="comment-list__empty">
                    <FaCommentDots className="empty-icon" />
                    <p>Chưa có bình luận nào. Hãy là người đầu tiên chia sẻ cảm nghĩ!</p>
                  </div>
                ) : (
                  comments.map((c) => {
                    const isCPremium = c.role === "premium" || c.user_role === "premium";
                    const isCAdmin = c.role === "admin" || c.user_role === "admin" || c.display_name === "Tecede";
                    const cUserId = c.user_id ?? c.userId ?? c.user?.id ?? c.username ?? c.user_name;

                    const renderAvatarContent = (avatar, displayName, size) => {
                      if (isValidAvatar(avatar)) {
                        return (
                          <img
                            src={avatar}
                            alt={displayName || "avatar"}
                            width={size}
                            height={size}
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = getDefaultAvatar(displayName);
                            }}
                            loading="lazy"
                            className={size === 36 ? "comment-card__avatar" : "reply-card__avatar"}
                          />
                        );
                      }
                      return (
                        <div className={`${size === 36 ? "comment-card__avatar" : "reply-card__avatar"} ${size === 36 ? "comment-card__avatar--fallback" : "reply-card__avatar--fallback"}`}>
                          {getAvatarLetter(displayName)}
                        </div>
                      );
                    };

                    return (
                      <div key={c.id} className="comment-card">
                        <div className="comment-card__header">
                          {cUserId ? (
                            <Link
                              to={`/profile/${cUserId}`}
                              className={`comment-card__avatar-wrap ${isCPremium ? "comment-card__avatar-wrap--premium" : ""}`}
                              title={`Xem trang cá nhân của ${c.display_name || "User"}`}
                            >
                              {isCPremium && (
                                <div className="comment-avatar-crown" title="Thành viên VIP Premium">
                                  <FaCrown className="comment-avatar-crown-icon" />
                                </div>
                              )}
                              {renderAvatarContent(c.avatar, c.display_name, 36)}
                            </Link>
                          ) : (
                            <div className={`comment-card__avatar-wrap ${isCPremium ? "comment-card__avatar-wrap--premium" : ""}`}>
                              {isCPremium && (
                                <div className="comment-avatar-crown" title="Thành viên VIP Premium">
                                  <FaCrown className="comment-avatar-crown-icon" />
                                </div>
                              )}
                              {renderAvatarContent(c.avatar, c.display_name, 36)}
                            </div>
                          )}

                          <div className="comment-card__meta">
                            <div className="comment-card__author-row">
                              {cUserId ? (
                                <Link
                                  to={`/profile/${cUserId}`}
                                  className={`comment-card__author-name ${isCPremium ? "comment-card__author-name--premium" : ""}`}
                                  title={`Xem trang cá nhân của ${c.display_name || "User"}`}
                                >
                                  {c.display_name || "User"}
                                </Link>
                              ) : (
                                <span className={`comment-card__author-name ${isCPremium ? "comment-card__author-name--premium" : ""}`}>
                                  {c.display_name || "User"}
                                </span>
                              )}
                              {isCAdmin && <VerifiedBadge />}
                              {isCPremium && <PremiumBadge showText={false} size={15} />}
                              <span className="comment-card__dot">•</span>
                              <span className="comment-card__time">
                                {formatVietnamTime(c.created_at)}
                              </span>
                            </div>
                          </div>
                        </div>

                      <div className="comment-card__body">
                        <p className="comment-card__content">{renderCommentContent(c.content)}</p>
                      </div>

                      <div className="comment-card__actions">
                        <button
                          onClick={() => {
                            if (replyBox === c.id) {
                              setReplyBox(null);
                              setReplyInput("");
                            } else {
                              setReplyBox(c.id);
                              setReplyInput(`@${c.display_name || "User"} `);
                            }
                          }}
                          className={`btn-reply-toggle ${replyBox === c.id ? "active" : ""}`}
                        >
                          <FaReply className="reply-icon" />
                          <span>{replyBox === c.id ? "Đóng" : "Trả lời"}</span>
                        </button>
                      </div>

                      {/* Hộp phản hồi cấp 1 */}
                      {replyBox === c.id && (
                        <div className="comment-reply-box">
                          <textarea
                            value={replyInput}
                            onChange={(e) => setReplyInput(e.target.value)}
                            placeholder="Nhập câu trả lời..."
                            className="comment-reply-box__textarea"
                            rows={2}
                            autoFocus
                          />
                          <div className="comment-reply-box__actions">
                            <button
                              onClick={() => {
                                setReplyBox(null);
                                setReplyInput("");
                              }}
                              className="btn-reply-cancel"
                            >
                              Hủy
                            </button>
                            <button
                              onClick={() => submitComment(c.id)}
                              className="btn-reply-submit"
                              disabled={!replyInput.trim()}
                            >
                              <FaPaperPlane className="btn-icon" />
                              <span>Gửi</span>
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Danh sách các bình luận con (Replies) */}
                      {c.replies?.length > 0 && (
                        <div className="comment-replies">
                          {c.replies.map((r) => {
                            const isRPremium = r.role === "premium" || r.user_role === "premium";
                            const isRAdmin = r.role === "admin" || r.user_role === "admin" || r.display_name === "Tecede";
                            const rUserId = r.user_id ?? r.userId ?? r.user?.id ?? r.username ?? r.user_name;

                            return (
                              <div key={r.id} className="reply-card">
                                <div className="reply-card__header">
                                  {rUserId ? (
                                    <Link
                                      to={`/profile/${rUserId}`}
                                      className={`reply-card__avatar-wrap ${isRPremium ? "reply-card__avatar-wrap--premium" : ""}`}
                                      title={`Xem trang cá nhân của ${r.display_name || "User"}`}
                                    >
                                      {isRPremium && (
                                        <div className="comment-avatar-crown reply-crown" title="Thành viên VIP Premium">
                                          <FaCrown className="comment-avatar-crown-icon" />
                                        </div>
                                      )}
                                      {renderAvatarContent(r.avatar, r.display_name, 28)}
                                    </Link>
                                  ) : (
                                    <div className={`reply-card__avatar-wrap ${isRPremium ? "reply-card__avatar-wrap--premium" : ""}`}>
                                      {isRPremium && (
                                        <div className="comment-avatar-crown reply-crown" title="Thành viên VIP Premium">
                                          <FaCrown className="comment-avatar-crown-icon" />
                                        </div>
                                      )}
                                      {renderAvatarContent(r.avatar, r.display_name, 28)}
                                    </div>
                                  )}

                                  <div className="reply-card__meta">
                                    <div className="reply-card__author-row">
                                      {rUserId ? (
                                        <Link
                                          to={`/profile/${rUserId}`}
                                          className={`reply-card__author-name ${isRPremium ? "reply-card__author-name--premium" : ""}`}
                                          title={`Xem trang cá nhân của ${r.display_name || "User"}`}
                                        >
                                          {r.display_name || "User"}
                                        </Link>
                                      ) : (
                                        <span className={`reply-card__author-name ${isRPremium ? "reply-card__author-name--premium" : ""}`}>
                                          {r.display_name || "User"}
                                        </span>
                                      )}
                                      {isRAdmin && <VerifiedBadge />}
                                      {isRPremium && <PremiumBadge showText={false} size={14} />}
                                      <span className="reply-card__dot">•</span>
                                      <span className="reply-card__time">
                                        {formatVietnamTime(r.created_at)}
                                      </span>
                                    </div>
                                  </div>
                                </div>

                              {/* Logic Highlight Tag @User */}
                              <div className="reply-card__body">
                                <p className="reply-card__content">
                                  {renderCommentContent(r.content)}
                                </p>
                              </div>

                              <div className="reply-card__actions">
                                <button
                                  onClick={() => {
                                    if (replyBox === r.id) {
                                      setReplyBox(null);
                                      setReplyInput("");
                                    } else {
                                      setReplyBox(r.id);
                                      setReplyInput(`@${r.display_name || "User"} `);
                                    }
                                  }}
                                  className={`btn-reply-toggle btn-reply-toggle--mini ${replyBox === r.id ? "active" : ""}`}
                                >
                                  <FaReply className="reply-icon" />
                                  <span>{replyBox === r.id ? "Đóng" : "Trả lời"}</span>
                                </button>
                              </div>

                              {/* Hộp phản hồi lồng nhau */}
                              {replyBox === r.id && (
                                <div className="comment-reply-box comment-reply-box--nested">
                                  <textarea
                                    value={replyInput}
                                    onChange={(e) => setReplyInput(e.target.value)}
                                    placeholder={`Trả lời @${r.display_name || "User"}...`}
                                    className="comment-reply-box__textarea"
                                    rows={2}
                                    autoFocus
                                  />
                                  <div className="comment-reply-box__actions">
                                    <button
                                      onClick={() => {
                                        setReplyBox(null);
                                        setReplyInput("");
                                      }}
                                      className="btn-reply-cancel"
                                    >
                                      Hủy
                                    </button>
                                    <button
                                      onClick={() => submitComment(c.id)}
                                      className="btn-reply-submit"
                                      disabled={!replyInput.trim()}
                                    >
                                      <FaPaperPlane className="btn-icon" />
                                      <span>Gửi</span>
                                    </button>
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })
                )}
              </div>
            </div>

            <p className="film-policy border-top pt-3 mt-5 fst-italic">
              Lưu ý: Chúng tôi từ chối mọi trách nhiệm liên quan đến nội dung hiển thị/tồn tại trên trang. Tất cả video và dữ liệu tại đây đều được tổng hợp từ các nguồn phổ biến trên Internet, và không thuộc quyền sở hữu hay kiểm soát của chúng tôi. Chúng tôi không cung cấp dịch vụ phát trực tuyến chính thức. Nếu bạn cho rằng quyền lợi của mình bị ảnh hưởng, vui lòng liên hệ ngay cho chúng tôi sẽ xử lý và gỡ bỏ nội dung vi phạm kịp thời. Xin cảm ơn sự thông cảm và hợp tác của bạn.
            </p>
          </div>

          {/* CỘT PHẢI */}
          <div className="movie-page__sidebar">
            <div className="Home__music">
              <LatestMovies />
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}