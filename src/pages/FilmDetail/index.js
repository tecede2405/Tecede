import { useEffect, useState, useMemo, useCallback, useRef } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom"; 
import LatestMovies from "../../component/LatestMovies.js/index";
import { GoChevronLeft } from "react-icons/go";
import { MdOutlineStorage } from "react-icons/md";
import { useAuth } from "../../context/AuthContext";
import { VerifiedBadge } from "../../component/VerifiedBadge/index";
import Swal from "sweetalert2";
import "./style.scss";

// TẠO BỘ NHỚ ĐỆM (CACHE) Ở NGOÀI COMPONENT ĐỂ KHÔNG BỊ MẤT KHI RE-RENDER
const filmCache = {};
const commentCache = {};

export default function FilmDetail() {
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
  const [isKkphim, setIsKkphim] = useState(false); // Thêm state kiểm tra nguồn KK
  
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
      commentCache[slug] = data; // Lưu cache bình luận
      setComments(data);
    } catch (e) { }
  }, [slug]);

  // 1. CHỈ FETCH DỮ LIỆU HOẶC DÙNG DATA TỪ ROUTER
  useEffect(() => {
    let isMounted = true; 

    async function fetchFilm() {
      try {
        // ƯU TIÊN 1: KIỂM TRA CACHE TRƯỚC
        if (filmCache[slug]) {
          const cachedData = filmCache[slug];
          if (isMounted) {
            setMovie(cachedData.movieData);
            setServers(cachedData.mergedServers);
            setIsKkphim(cachedData.isKkphim);
          }
          return; 
        }

        // ƯU TIÊN 2: DÙNG DỮ LIỆU TỪ FILE 1 (TRUYỀN SANG) ĐỂ KHÔNG PHẢI FETCH LẠI
        let movieDataToUse = passedMovie;
        let episodesDataToUse = passedSources;

        // ƯU TIÊN 3: NẾU NGƯỜI DÙNG F5 HOẶC SHARE LINK TRỰC TIẾP THÌ MỚI GỌI LẠI API
        if (!movieDataToUse || !episodesDataToUse) {
          const res = await fetch(`${process.env.REACT_APP_SERVER_API_URL}/movie-detail/${slug}`);
          const responseJson = await res.json();
          movieDataToUse = responseJson.data?.movie;
          episodesDataToUse = responseJson.data?.episodes || [];
        }

        const mergedServers = [];
        episodesDataToUse.forEach(src => {
          (src.episodes || []).forEach(srv => {
            const serverData = srv.server_data || srv.items || [];
            const normalized = serverData.map(ep => ({
              name: ep.name,
              slug: ep.slug,
              embedUrl: ep.link_embed || ep.embed,
              m3u8Url: ep.link_m3u8 || ep.m3u8,
            }));
            mergedServers.push({
              server_name: srv.server_name,
              server_data: normalized,
            });
          });
        });

        // Xác định nguồn phim có phải KKPhim không
        const isKk = episodesDataToUse.some(s => s.source === "kk" || s.source === "kkphim");

        // Lưu vào CACHE
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
      isMounted = false; // Dọn dẹp khi unmount
    };
  }, [slug, loadComments, passedMovie, passedSources]);

  // 2. ĐỒNG BỘ ĐỒNG THỜI CẢ SERVER VÀ TẬP TỪ URL
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

  // 3. TÌM TẬP PHIM HIỆN TẠI ĐỂ PLAY
  const currentVideo = useMemo(() => {
    if (!episodes || episodes.length === 0) return null;
    return episodes.find((v) => v.slug === selectedEpisodeSlug) || episodes[0];
  }, [episodes, selectedEpisodeSlug]);

  const isReady = !!movie && !!currentVideo && episodes.length > 0;

  const currentIndex = useMemo(() => {
    return episodes.findIndex((v) => v.slug === currentVideo?.slug);
  }, [episodes, currentVideo]);

  // ==================== XỬ LÝ ẢNH ====================
  function getImageUrl(url) {
  if (!url) return "";
  
  // Nếu url chứa domain của nguồn C thì trả về ngay (không proxy)
  if (url.includes("phim.nguonc.com")) {
    return url;
  }
  
  // Các domain còn lại (phimimg.com, phimapi.com...) thì gắn proxy
  return `${process.env.REACT_APP_FILM_API_URL}/image.php?url=${encodeURIComponent(url)}`;
}

  const isNguonC = movie?.poster_url?.includes("phim.nguonc.com") || movie?.thumb_url?.includes("phim.nguonc.com");

let posterRaw = "";
let thumbRaw = "";

if (isNguonC) {
  // Nguồn C: Đảo ngược key
  posterRaw = movie?.thumb_url;
  thumbRaw = movie?.poster_url;
} else {
  // KKPhim: Giữ nguyên key
  posterRaw = movie?.poster_url;
  thumbRaw = movie?.thumb_url;
}

// Fallback an toàn
if (!posterRaw) posterRaw = thumbRaw;
if (!thumbRaw) thumbRaw = posterRaw;

// Gọi hàm lấy ảnh (Không cần truyền isKk nữa vì hàm đã tự check domain)
const posterUrl = getImageUrl(posterRaw);
const thumbUrl = getImageUrl(thumbRaw);
  // ===================================================

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
        customClass: {
          popup: "dark-swal-popup",
        },
      }).then((result) => {
        if (result.isConfirmed) {
          navigate("/login");
          window.scrollTo({
            top: 0,
            behavior: "instant",
          });
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
        const newCommentsList = !parentId ? [newComment, ...prev] : addReply(prev, parentId, newComment);
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
    const movieImage = posterUrl; // Sửa đoạn lưu lịch sử thành URL ảnh đã convert

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
  }, [
    slug,
    server,
    currentVideo?.slug,
    user?.token,
    movie,
    episodes.length,
    isReady,
    saveHistoryToServer,
    posterUrl // Thêm dependency này vào đây
  ]);

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
        "--bg-url": `url(${thumbUrl})`, // Thay thế bằng background rộng
      }}
    >
      <div className="container container-film">
        {/* Title */}
        <h5 className="movie-page__title mb-4">
          <GoChevronLeft
            onClick={() => navigate(-1)}
            style={{ cursor: "pointer", border: "1px solid #ddd", borderRadius: "50%" }}
          />
          <i className="ms-2">Bạn đang xem : {movie.name} – {currentVideo.name}</i>
        </h5>

        {/* Player */}
        <div className="movie-page__player ratio ratio-16x9 mb-4 mx-auto">
          {currentVideo?.embedUrl ? (
            <iframe
              key={currentVideo.embedUrl} 
              src={currentVideo.embedUrl}
              title={`Phim ${movie.name} - ${currentVideo.name}`}
              className="w-100 h-100" 
              allow="autoplay; encrypted-media; picture-in-picture;"
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
              {s.server_name}
            </button>
          ))}
        </div>

        <p className="film-policy border-top pt-2 mt-3 fst-italic">
          Nếu bạn không load được phim hãy thử bật 1.1.1.1 tải ở CH play hoặc App store rồi thử lại nha.
        </p>

        {/* Navigation buttons */}
        <div className="movie-page__nav d-flex justify-content-between mb-4">
          <button
            className="btn btn-outline-info"
            onClick={() => {
              const prev = episodes[currentIndex - 1];
              if (!prev) return;
              navigate(`/xem-phim/${slug}/${encodeURIComponent(server)}/${prev.slug}`);
            }}
            disabled={currentIndex <= 0}
          >
            Tập trước
          </button>

          <button
            className="btn btn-outline-info"
            onClick={() => {
              const next = episodes[currentIndex + 1];
              if (!next) return;
              navigate(`/xem-phim/${slug}/${encodeURIComponent(server)}/${next.slug}`);
            }}
            disabled={currentIndex >= episodes.length - 1}
          >
            Tập sau
          </button>
        </div>

        {/* Movie Info */}
        <div className="movie-page__info mb-4">
          <div className="movie-page__info-layout">
            <div className="movie-page__poster">
              <img
                src={posterUrl} // Đổi thành poster đã xử lý proxy + logic đảo chiều
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
          {episodes.map((video) => (
            <button
              key={video.slug}
              onClick={() => {
                navigate(`/xem-phim/${slug}/${encodeURIComponent(server)}/${video.slug}`);
              }}
              className={`movie-page__episode btn ${currentVideo.slug === video.slug ? "btn-primary" : "btn-outline-secondary"}`}
            >
              {video.name}
            </button>
          ))}
        </div>

        {/* ================= COMMENT ================= */}
        <div className="mb-3">
          <textarea
            value={commentInput}
            onChange={(e) => setCommentInput(e.target.value)}
            placeholder="Viết bình luận..."
            className="mb-2 p-3"
            style={{ background: "#111", color: "white", border: "1px solid #333", margin: "0", borderRadius: 7, width: "100%" }}
          />
          <button onClick={() => submitComment()} className="btn btn-danger">Gửi</button>
        </div>

        <div>
          {comments.map((c) => (
            <div key={c.id} style={{ background: "#1a1a1a", padding: 12, borderRadius: 6, marginBottom: 12, border: "1px solid #333" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                {c.avatar ? (
                  <img
                    src={c.avatar}
                    alt="avatar"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = "/default-avatar.png";
                    }}
                    loading="lazy"
                    style={{
                      width: 30,
                      height: 30,
                      borderRadius: "50%",
                      objectFit: "cover",
                    }}
                  />
                ) : (
                  <div
                    style={{
                      width: 30,
                      height: 30,
                      borderRadius: "50%",
                      background: "#e50914",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontWeight: "bold",
                      color: "white",
                      textTransform: "uppercase",
                    }}
                  >
                    {getAvatarLetter(c.display_name)}
                  </div>
                )}

                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <b style={{ color: "#fff" }}>
                    {c.display_name || "User"}
                  </b>

                  {c.display_name === "Tecede" && <VerifiedBadge />}
                  <i style={{ fontSize: 11, color: "#999" }}>{c.created_at}</i>
                </div>
              </div>
              <p style={{ margin: "6px 0", color: "#ccc" }}>{c.content}</p>
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
                style={{
                  fontSize: 12,
                  background: "#333",
                  color: "white",
                  border: "none",
                  padding: "4px 10px",
                  borderRadius: 4,
                  cursor: "pointer"
                }}
              >
                Trả lời
              </button>

              {replyBox === c.id && (
                <div
                  style={{
                    marginTop: 10,
                    marginLeft: 10,
                  }}
                >
                  <textarea
                    value={replyInput}
                    onChange={(e) => setReplyInput(e.target.value)}
                    placeholder="Viết trả lời..."
                    style={{
                      width: "100%",
                      padding: 8,
                      background: "#111",
                      color: "white",
                      border: "1px solid #333",
                      borderRadius: 4
                    }}
                  />

                  <button
                    onClick={() => submitComment(c.id)}
                    style={{
                      marginTop: 5,
                      padding: "5px 12px",
                      background: "#e50914",
                      color: "white",
                      border: "none",
                      borderRadius: 4
                    }}
                  >
                    Gửi
                  </button>
                </div>
              )}

              {c.replies?.length > 0 && (
                <div style={{ marginLeft: 20, marginTop: 10 }}>
                  {c.replies.map((r) => (
                    <div
                      key={r.id}
                      style={{
                        background: "#111",
                        padding: 10,
                        borderRadius: 5,
                        marginBottom: 8,
                        border: "1px solid #222"
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 8
                        }}
                      >
                        {r.avatar ? (
                          <img
                            src={r.avatar}
                            alt="avatar"
                            loading="lazy"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = "/default-avatar.png";
                            }}
                            style={{
                              width: 28,
                              height: 28,
                              borderRadius: "50%",
                              objectFit: "cover",
                            }}
                          />
                        ) : (
                          <div
                            style={{
                              width: 28,
                              height: 28,
                              borderRadius: "50%",
                              background: "#444",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontWeight: "bold",
                              color: "white",
                              fontSize: 12
                            }}
                          >
                            {getAvatarLetter(r.display_name)}
                          </div>
                        )}

                        <b
                          style={{
                            fontSize: 13,
                            display: "flex",
                            alignItems: "center"
                          }}
                        >
                          {r.display_name || "User"}
                          {r.display_name === "Tecede" && (
                            <VerifiedBadge />
                          )}
                        </b>

                        <i
                          style={{
                            fontSize: 10,
                            color: "#999"
                          }}
                        >
                          {r.created_at}
                        </i>
                      </div>

                      <p
                        style={{
                          margin: "4px 0",
                          fontSize: 14,
                          color: "#ddd",
                          lineHeight: 1.5
                        }}
                      >
                        {r.content.split(/(@\w+)/g).map((part, index) => {
                          if (part.startsWith("@")) {
                            return (
                              <span
                                key={index}
                                style={{
                                  color: "#4da6ff",
                                  fontWeight: 600
                                }}
                              >
                                {part}
                              </span>
                            );
                          }
                          return part;
                        })}
                      </p>

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
                        style={{
                          marginTop: 4,
                          fontSize: 11,
                          background: "#2a2a2a",
                          color: "#ddd",
                          border: "1px solid #333",
                          padding: "3px 10px",
                          borderRadius: 999,
                          cursor: "pointer",
                        }}
                      >
                        Trả lời
                      </button>

                      {replyBox === r.id && (
                        <div
                          style={{
                            marginTop: 10
                          }}
                        >
                          <textarea
                            value={replyInput}
                            onChange={(e) =>
                              setReplyInput(e.target.value)
                            }
                            placeholder={`Trả lời @${r.display_name || "User"}...`}
                            style={{
                              width: "100%",
                              padding: 8,
                              background: "#111",
                              color: "white",
                              border: "1px solid #333",
                              borderRadius: 4
                            }}
                          />

                          <button
                            onClick={() => submitComment(c.id)}
                            style={{
                              marginTop: 5,
                              padding: "5px 12px",
                              background: "#e50914",
                              color: "white",
                              border: "none",
                              borderRadius: 4
                            }}
                          >
                            Gửi
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        <p className="film-policy border-top pt-3 mt-5 fst-italic">
          Lưu ý: Chúng tôi từ chối mọi trách nhiệm liên quan đến nội dung hiển thị/tồn tại trên trang. Tất cả video và dữ liệu tại đây đều được tổng hợp từ các nguồn phổ biến trên Internet, và không thuộc quyền sở hữu hay kiểm soát của chúng tôi. Chúng tôi không cung cấp dịch vụ phát trực tuyến chính thức. Nếu bạn cho rằng quyền lợi của mình bị ảnh hưởng, vui lòng liên hệ ngay cho chúng tôi sẽ xử lý và gỡ bỏ nội dung vi phạm kịp thời. Xin cảm ơn sự thông cảm và hợp tác của bạn.
        </p>

        <div className="Home__music">
          <LatestMovies />
        </div>
      </div>
    </div>
  );
}