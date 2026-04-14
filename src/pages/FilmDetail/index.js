import { useEffect, useState, useMemo, useCallback, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import LatestMovies from "../../component/LatestMovies.js/index";
import { GoChevronLeft } from "react-icons/go";
import { MdOutlineStorage } from "react-icons/md";
import { useAuth } from "../../context/AuthContext";
import {VerifiedBadge} from "../../component/VerifiedBadge/index";
import "./style.scss";

export default function FilmDetail() {
  const { slug, server, episodeSlug } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [movie, setMovie] = useState(null);
  const [servers, setServers] = useState([]);
  const [currentServer, setCurrentServer] = useState(0);
  const [episodes, setEpisodes] = useState([]);
  const [comments, setComments] = useState([]);
  const [commentInput, setCommentInput] = useState("");
  const [replyBox, setReplyBox] = useState(null);
  const [replyInput, setReplyInput] = useState("");
  const lastSavedRef = useRef("");
  const lastEpisodeRef = useRef("");
  const isSavingRef = useRef(false);
  const lastKeyRef = useRef("");  

  // Trạng thái để buộc iframe phải hủy và tạo lại (mount/unmount)
  const [isVideoLoading, setIsVideoLoading] = useState(false);

  // State trung gian để đồng bộ URL <-> state
  const [selectedEpisodeSlug, setSelectedEpisodeSlug] = useState(episodeSlug || null);

  useEffect(() => {
    setMovie(null);
    setServers([]);
    setEpisodes([]);
  }, [slug]);
  // 1. Đồng bộ selectedEpisodeSlug khi URL hoặc episodes thay đổi
  useEffect(() => {
  if (!episodes || episodes.length === 0) return;

  // luôn ưu tiên URL
  if (episodeSlug) {
    setSelectedEpisodeSlug(episodeSlug);
    return;
  }

  // CHỈ chạy khi thật sự chưa có gì
  if (!selectedEpisodeSlug) {
    setSelectedEpisodeSlug(episodes[0].slug);
    navigate(`/xem-phim/${slug}/${encodeURIComponent(server)}/${episodes[0].slug}`, { replace: true });
  }

// eslint-disable-next-line react-hooks/exhaustive-deps
}, [episodeSlug, episodes]);

  // 2. TÌM TẬP PHIM HIỆN TẠI DỰA TRÊN selectedEpisodeSlug
  const currentVideo = useMemo(() => {
  if (!episodes || episodes.length === 0) return null;
  return episodes.find((v) => v.slug === selectedEpisodeSlug) || episodes[0];
}, [episodes, selectedEpisodeSlug]);

  const isReady =
    !!movie &&
    !!currentVideo &&
    episodes.length > 0;

  // 3. TÌM INDEX ĐỂ ĐIỀU HƯỚNG
  const currentIndex = useMemo(() => {
    return episodes.findIndex((v) => v.slug === currentVideo?.slug);
  }, [episodes, currentVideo]);

  // Debug logs để theo dõi thứ tự cập nhật
  useEffect(() => {
    
  }, [servers, currentServer]);
 

  // Khi currentVideo thay đổi, ép remount iframe và log để debug
  useEffect(() => {
    if (!currentVideo) return;
    setIsVideoLoading(true);
    const t = setTimeout(() => setIsVideoLoading(false), 60);
    return () => clearTimeout(t);
  }, [currentVideo]);

  const loadComments = useCallback(async () => {
    try {
      const res = await fetch(`${process.env.REACT_APP_SERVER_API_URL}/comments/${slug}`);
      const data = await res.json();
      setComments(data);
    } catch (e) {}
  }, [slug]);

  // 4. FETCH DỮ LIỆU PHIM
useEffect(() => {
  async function fetchFilm() {
    try {
      const res = await fetch(`${process.env.REACT_APP_FILM_API_URL}/phim/${slug}`);
      const data = await res.json();

      setMovie(data.movie);
      setServers(data.episodes || []);
      setCurrentServer(0);

      const initialServer = (data.episodes && data.episodes[0]) || { server_data: [] };
      const initialEpisodes = initialServer.server_data || [];

      setEpisodes(initialEpisodes);

      if (!episodeSlug && initialEpisodes.length > 0) {
        const firstSlug = initialEpisodes[0].slug;
        setSelectedEpisodeSlug(firstSlug);

        navigate(`/xem-phim/${slug}/${encodeURIComponent(server)}/${firstSlug}`, { replace: true });
      }
    } catch (err) {
      console.error(err);
    }
  }

  fetchFilm();
  loadComments();
}, [slug, episodeSlug, navigate, server, loadComments]);



  // Đồng bộ server index khi URL thay đổi
 useEffect(() => {
  if (!servers.length || !server) return;

  const serverIndex = servers.findIndex(
    (s) => s.server_name === server
  );

  if (serverIndex !== -1) {
    setCurrentServer(serverIndex);
  }
}, [server, servers]);


  // Đồng bộ episodes khi servers hoặc currentServer thay đổi
 useEffect(() => {
  if (!servers || servers.length === 0) return;

  const list = servers[currentServer]?.server_data || [];
  setEpisodes(list);

  if (!list.length) return;

  // Ưu tiên URL
  if (episodeSlug) {
    const found = list.find(e => e.slug === episodeSlug);

    if (found) {
      // chỉ set khi khác để tránh loop
      setSelectedEpisodeSlug(episodeSlug);
      return;
    } else {
      const first = list[0].slug;

      setSelectedEpisodeSlug(first);
      navigate(`/xem-phim/${slug}/${encodeURIComponent(server)}/${first}`, { replace: true });
      return;
    }
  }

  // fallback khi chưa có gì
  if (!selectedEpisodeSlug) {
    const first = list[0].slug;

    setSelectedEpisodeSlug(first);
    navigate(`/xem-phim/${slug}/${encodeURIComponent(server)}/${first}`, { replace: true });
  }

}, [
  servers,
  currentServer,
  episodeSlug,
  selectedEpisodeSlug, 
  navigate,
  server,            
  slug                 
]);


  const handleChangeServer = (serverIndex) => {
  const newList = servers[serverIndex]?.server_data || [];
  const newServerName = servers[serverIndex]?.server_name;

  setCurrentServer(serverIndex);
  setEpisodes(newList);

  if (newList.length > 0) {
    setSelectedEpisodeSlug(newList[0].slug);

    navigate(`/xem-phim/${slug}/${encodeURIComponent(newServerName)}/${newList[0].slug}`);
  }
};

  const submitComment = async (parentId = null) => {
  const content = parentId ? replyInput : commentInput;

  if (!content.trim()) return;

  if (!user?.token) {
    alert("Bạn cần đăng nhập");
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

    //  QUAN TRỌNG: update state
    setComments((prev) => {
      if (!parentId) {
        return [newComment, ...prev];
      }

      return addReply(prev, parentId, newComment);
    });

    // reset input
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
  server,
  episode,
  image,
  movieName
) => {
  try {
    if (!user?.token) return;

    const payload = {
      movie_path: moviePath,
      movie_name: movieName,
      server,
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
  const movieImage = movie.poster_url || movie.thumb_url;

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
  saveHistoryToServer
]);


useEffect(() => {
  lastSavedRef.current = "";
  lastEpisodeRef.current = "";
}, [slug, server]);
// tạo avatar 
  const getAvatarLetter = (name) => {
    if (!name) return "U";

    const words = name.trim().split(" ");
    const lastWord = words[words.length - 1];

    return lastWord.charAt(0).toUpperCase();
  };

 if (!movie || !currentVideo || servers.length === 0) {
    return <div className="container"><p>Đang tải...</p></div>;
  }
  return (
    <div
      className="movie-page pb-5 pt-3"
      style={{
        "--bg-url": `url(${process.env.REACT_APP_FILM_API_URL}/image.php?url=${encodeURIComponent(movie.poster_url)})`,
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

        {/* Player: Sử dụng isVideoLoading để gỡ bỏ hoàn toàn iframe cũ khỏi DOM */}
        <div className="movie-page__player ratio ratio-16x9 mb-4 mx-auto">
            {!isVideoLoading ? (
            <iframe
              key={`${currentServer}-${currentVideo?.slug}-${currentVideo?.link_embed}`}
              src={currentVideo?.link_embed}
              title="Movie Player"
              allow="autoplay; encrypted-media; picture-in-picture;"
              allowFullScreen
              referrerPolicy="strict-origin-when-cross-origin"
              frameBorder="0"
            />
          ) : (
            <div className="d-flex justify-content-center align-items-center bg-black text-white">
              <span>Đang tải tập phim...</span>
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
              setSelectedEpisodeSlug(prev.slug);
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
              setSelectedEpisodeSlug(next.slug);
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
                src={`${process.env.REACT_APP_FILM_API_URL}/image.php?url=${encodeURIComponent(movie.poster_url)}`}
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
                setSelectedEpisodeSlug(video.slug); // update state ngay
                navigate(`/xem-phim/${slug}/${encodeURIComponent(server)}/${video.slug}`);
              }}
              className={`movie-page__episode btn ${
                currentVideo.slug === video.slug ? "btn-primary" : "btn-outline-secondary"
              }`}
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
            style={{ background: "#111", color: "white", border: "1px solid #333", margin : "0", borderRadius: 7, width: "100%" }}
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
                </div>
              </div>
              <p style={{ margin: "6px 0", color: "#ccc" }}>{c.content}</p>
              <button onClick={() => setReplyBox(c.id)} style={{ fontSize: 12, background: "#333", color: "white", border: "none", padding: "4px 10px", borderRadius: 4, cursor: "pointer" }}>Trả lời</button>

              {replyBox === c.id && (
                <div style={{ marginTop: 10 }}>
                  <textarea value={replyInput} onChange={(e) => setReplyInput(e.target.value)} placeholder="Viết trả lời..." style={{ width: "100%", padding: 8, background: "#111", color: "white", border: "1px solid #333", borderRadius: 4 }} />
                  <button onClick={() => submitComment(c.id)} style={{ marginTop: 5, padding: "5px 12px", background: "#e50914", color: "white", border: "none", borderRadius: 4 }}>Gửi</button>
                </div>
              )}

              {c.replies?.length > 0 && (
                <div style={{ marginLeft: 20, marginTop: 10 }}>
                  {c.replies.map((r) => (
                    <div key={r.id} style={{ background: "#111", padding: 10, borderRadius: 5, marginBottom: 8, border: "1px solid #222" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
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

                  
                          <b style={{ fontSize: 13, display: "flex", alignItems: "center" }}>
                            {r.display_name || "User"}
                            {r.display_name === "Tecede" && <VerifiedBadge />}
                          </b>

                         
                      </div>
                      <p style={{ margin: "4px 0", fontSize: 14 }}>{r.content}</p>
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