import { useEffect, useState, useMemo, useCallback } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import {
  FaPlay,
  FaHeart,
  FaRegHeart,
  FaServer,
  FaTimes,
  FaShareAlt,
  FaUsers,
  FaSearch,
  FaSortAmountDown,
  FaChevronDown,
} from "react-icons/fa";
import { createPortal } from "react-dom";
import { Helmet } from "react-helmet-async";
import Swal from "sweetalert2";
import { useFavoriteToggle } from "../../hooks/useFavorites";
import "./style.scss";

// TỪ ĐIỂN ĐỂ ĐỒNG BỘ TÊN SERVER VỚI TRANG XEM PHIM
const SOURCE_NAMES = {
  kk: "KK",
  kkphim: "KK",
  op: "OP",
  nc: "NC",
  nguonc: "NC",
};

export default function MovieDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const sourceFromSearch = location.state?.sourceName;
  const isRefreshParam =
    new URLSearchParams(location.search).get("refresh") === "true";

  const [movie, setMovie] = useState(null);
  const [sources, setSources] = useState([]);
  const [currentServer, setCurrentServer] = useState(0);
  const [loading, setLoading] = useState(true);
  const [imgConfig, setImgConfig] = useState({ poster: "", thumb: "" });

  // State tìm kiếm & sắp xếp tập
  const [searchEpisode, setSearchEpisode] = useState("");
  const [isSortAsc, setIsSortAsc] = useState(true);
  const [showMobileInfo, setShowMobileInfo] = useState(false);
  const [showTrailerModal, setShowTrailerModal] = useState(false);

  const cleanDescription = useMemo(() => {
    return movie?.content?.replace(/<\/?[^>]+(>|$)/g, "") || "";
  }, [movie?.content]);

  const fetchMovieDetail = useCallback(
    async (forceRefresh = false) => {
      setLoading(true);
      setCurrentServer(0);
      try {
        const baseUrl = `${process.env.REACT_APP_SERVER_API_URL}/movie-detail/${slug}`;
        const shouldRefresh = forceRefresh || isRefreshParam;
        const firstUrl = shouldRefresh ? `${baseUrl}?refresh=true` : baseUrl;

        let res = await fetch(firstUrl);
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
          sourceFromSearch === "NC" ||
          sourceFromSearch === "nguonc" ||
          epList.some(
            (s) =>
              s.source?.toLowerCase() === "nc" ||
              s.source?.toLowerCase() === "nguonc"
          );
        const lacksM3u8 = !checkHasM3u8(epList) || (isNc && !checkNcHasM3u8(epList));

        // Nếu chưa gọi refresh mà data thiếu m3u8 hoặc không có tập -> tự động gọi ?refresh=true
        if (!shouldRefresh && (!data.success || !m || epList.length === 0 || lacksM3u8)) {
          try {
            const refRes = await fetch(`${baseUrl}?refresh=true`);
            const refData = await refRes.json();
            if (refData.success && refData.data?.movie) {
              m = refData.data.movie;
              epList = refData.data.episodes || [];
            }
          } catch (refErr) {
            console.warn("[FilmDetail] Lỗi refresh phim:", refErr);
          }
        }

        m = m || {};
        setMovie(m);

        // Đảo chiều ảnh nếu nguồn là Nguồn C hoặc OPhim
        const isNguonC_or_OPhim =
          m.poster_url?.includes("phim.nguonc.com") ||
          m.thumb_url?.includes("phim.nguonc.com") ||
          m.poster_url?.includes("ophim") ||
          m.thumb_url?.includes("ophim");

        let p = isNguonC_or_OPhim ? m.thumb_url : m.poster_url;
        let t = isNguonC_or_OPhim ? m.poster_url : m.thumb_url;

        if (!p) p = t;
        if (!t) t = p;

        setImgConfig({ poster: p, thumb: t });
        setSources(epList);
      } catch (err) {
        console.error("Lỗi fetch chi tiết phim:", err);
      } finally {
        setLoading(false);
      }
    },
    [slug, isRefreshParam, sourceFromSearch]
  );

  useEffect(() => {
    fetchMovieDetail();
  }, [fetchMovieDetail]);

  // Sắp xếp ưu tiên server (OP -> KK -> NC)
  const allServers = useMemo(() => {
    let list = [];
    sources.forEach((src) => {
      const sourceLabel =
        SOURCE_NAMES[src.source] || src.source?.toUpperCase() || "Server";

      (src.episodes || []).forEach((srv) => {
        const epList = srv.server_data || srv.items || [];
        const hasValidData = epList.some(
          (ep) => ep.slug && ep.slug.trim() !== ""
        );

        if (hasValidData) {
          const episodeCount = epList.length;
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
            server_name: `${sourceLabel} - ${srv.server_name}`,
            display_name: `#${sourceLabel} (${serverType}) | ${episodeCount} tập`,
            server_type: serverType,
            original_name: srv.server_name,
            sourceName: sourceLabel,
            episodeCount,
          });
        }
      });
    });

    const priority = {
      KK: 1,
      OP: 2,
      OF: 3,
      NC: 4,
      VM: 5,
    };

    list.sort((a, b) => {
      const rankA = priority[a.sourceName] || 99;
      const rankB = priority[b.sourceName] || 99;
      return rankA - rankB;
    });

    return list;
  }, [sources]);

  useEffect(() => {
    if (sourceFromSearch && allServers.length > 0) {
      const idx = allServers.findIndex((s) => s.sourceName === sourceFromSearch);
      if (idx !== -1) {
        setCurrentServer(idx);
      }
    }
  }, [sourceFromSearch, allServers]);

  const currentServerObj = allServers[currentServer];
  const episodes = useMemo(() => {
    return currentServerObj?.server_data || currentServerObj?.items || [];
  }, [currentServerObj]);
  const currentServerName = currentServerObj?.server_name || "";

  function getImageUrl(url) {
    if (!url) return "";
    return url;
  }

  const posterUrl = getImageUrl(imgConfig.poster);
  const thumbUrl = getImageUrl(imgConfig.thumb);

  // ── FAVORITES ──
  const { isFavorited, loading: favLoading, init: initFav, toggle: toggleFav } =
    useFavoriteToggle(slug, movie?.name, posterUrl);

  useEffect(() => {
    if (movie && slug) initFav();
  }, [movie, slug, initFav]);

  // Lọc và sắp xếp tập phim
  const filteredEpisodes = useMemo(() => {
    let list = [...episodes];
    if (searchEpisode.trim()) {
      const q = searchEpisode.toLowerCase().trim();
      list = list.filter(
        (ep) =>
          ep.name?.toLowerCase().includes(q) ||
          ep.slug?.toLowerCase().includes(q)
      );
    }
    if (!isSortAsc) {
      list.reverse();
    }
    return list;
  }, [episodes, searchEpisode, isSortAsc]);

  // Chia sẻ liên kết phim
  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      Swal.fire({
        toast: true,
        position: "top-end",
        icon: "success",
        title: "Đã sao chép liên kết phim!",
        showConfirmButton: false,
        timer: 2000,
        background: "#181424",
        color: "#fff",
      });
    }
  };

  // Xem chung cùng bạn bè (Watch Party)
  const handleWatchTogether = () => {
    const posterImg = movie?.poster_url || movie?.thumb_url || "";
    navigate(
      `/xem-chung?slug=${encodeURIComponent(slug || "")}&name=${encodeURIComponent(
        movie?.name || ""
      )}&poster=${encodeURIComponent(posterImg)}`
    );
  };

  // Thông tin metadata 2 cột
  const movieType = useMemo(() => {
    if (movie?.type === "series") return "Phim Bộ";
    if (movie?.type === "single") return "Phim Lẻ";
    if (movie?.type === "hoathinh") return "Hoạt Hình";
    if (movie?.type === "tvshows") return "TV Shows";
    return movie?.type || "Phim Bộ";
  }, [movie?.type]);

  const categoriesText = useMemo(() => {
    if (Array.isArray(movie?.category) && movie.category.length > 0) {
      return movie.category.map((c) => c.name).join(", ");
    }
    return "Đang cập nhật";
  }, [movie?.category]);

  const countriesText = useMemo(() => {
    if (Array.isArray(movie?.country) && movie.country.length > 0) {
      return movie.country.map((c) => c.name).join(", ");
    }
    return "Đang cập nhật";
  }, [movie?.country]);

  const totalEpisodesText = useMemo(() => {
    const tot = movie?.episode_total || movie?.total_episodes;
    if (tot) {
      return String(tot).toLowerCase().includes("tập") ? String(tot) : `${tot} tập`;
    }
    if (episodes.length > 0) {
      return `${episodes.length} tập`;
    }
    return "Đang cập nhật";
  }, [movie?.episode_total, movie?.total_episodes, episodes.length]);

  const statusText = useMemo(() => {
    const cur = movie?.episode_current;
    if (!cur) return "Đang cập nhật";
    if (
      cur.toLowerCase().includes("tập") ||
      cur.toLowerCase().includes("full") ||
      cur.toLowerCase().includes("hoàn tất")
    ) {
      return cur;
    }
    return `Tập ${cur}`;
  }, [movie?.episode_current]);

  const tmdbScore = useMemo(() => {
    let score = null;
    // 1. Kiểm tra TMDB vote_average
    if (movie?.tmdb) {
      if (typeof movie.tmdb === "object" && movie.tmdb.vote_average) {
        const val = Number(movie.tmdb.vote_average);
        if (val > 0) score = val;
      } else if (typeof movie.tmdb === "number" && movie.tmdb > 0) {
        score = movie.tmdb;
      } else if (typeof movie.tmdb === "string") {
        const val = parseFloat(movie.tmdb);
        if (!isNaN(val) && val > 0) score = val;
      }
    }

    // 2. Fallback sang movie.vote_average
    if (!score && movie?.vote_average) {
      const val = parseFloat(movie.vote_average);
      if (!isNaN(val) && val > 0) score = val;
    }

    // 3. Fallback sang movie.imdb nếu có điểm
    if (!score && movie?.imdb) {
      if (typeof movie.imdb === "object" && movie.imdb.vote_average) {
        const val = Number(movie.imdb.vote_average);
        if (val > 0) score = val;
      } else if (typeof movie.imdb === "number" && movie.imdb > 0) {
        score = movie.imdb;
      } else if (typeof movie.imdb === "string" && !movie.imdb.startsWith("tt")) {
        const val = parseFloat(movie.imdb);
        if (!isNaN(val) && val > 0) score = val;
      }
    }

    if (score && score > 0) {
      return Number(score).toFixed(1);
    }
    return null;
  }, [movie?.tmdb, movie?.vote_average, movie?.imdb]);

  return (
    <>
      <Helmet>
        <title>
          {movie?.name
            ? `${movie.name} Vietsub HD | Xem phim miễn phí - Tecede`
            : "Đang tải phim... - Tecede"}
        </title>
      </Helmet>

      {loading ? (
        <div className="movie-detail-container skeleton-mode">
          <div className="db-detail-layout">
            <aside className="db-sidebar">
              <div className="db-poster-wrap skeleton-animate" />
              <div className="db-desc-skeleton">
                <div className="sk-line skeleton-animate" style={{ width: "60%" }} />
                <div className="sk-line skeleton-animate" />
                <div className="sk-line skeleton-animate" />
                <div className="sk-line skeleton-animate" style={{ width: "80%" }} />
              </div>
            </aside>
            <main className="db-main-content">
              <div className="sk-title skeleton-animate" />
              <div className="sk-subtitle skeleton-animate" />
              <div className="sk-tags-row">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="sk-tag-pill skeleton-animate" />
                ))}
              </div>
              <div className="sk-grid-info skeleton-animate" />
              <div className="sk-actions skeleton-animate" />
            </main>
          </div>
        </div>
      ) : !movie ? (
        <div className="error-screen">Không tải được dữ liệu phim!</div>
      ) : (
        <div className="movie-detail-container">
          {/* Nền Backdrop phía trên mờ sang nền tối */}
          <div
            className="db-hero-backdrop"
            style={{ backgroundImage: `url(${thumbUrl || posterUrl})` }}
          >
            <div className="db-hero-backdrop-overlay" />
          </div>

          <div className="db-detail-layout">
            {/* ── CỘT TRÁI: POSTER + GIỚI THIỆU ── */}
            <aside className="db-sidebar">
              <div className="db-poster-wrap">
                <img src={posterUrl} alt={movie.name} loading="lazy" />
              </div>

              <div className="db-description-block">
                <h4 className="db-desc-heading">GIỚI THIỆU:</h4>
                <p className="db-desc-text">
                  {cleanDescription || "Đang cập nhật nội dung phim..."}
                </p>
              </div>
            </aside>

            {/* ── CỘT PHẢI: THÔNG TIN + HÀNH ĐỘNG + MÁY CHỦ + DANH SÁCH TẬP ── */}
            <main className="db-main-content">
              {/* Tiêu đề phim */}
              <h1 className="db-movie-title">{movie.name}</h1>
              {movie.origin_name && (
                <p className="db-movie-subtitle">
                  {movie.origin_name} {movie.year ? `(${movie.year})` : ""}
                </p>
              )}

              {/* Hàng nhãn / tags */}
              <div className="db-tags-row">
                <span className="db-tag-pill tag-quality">
                  {movie.quality || "FHD"}
                </span>

                <span className="db-tag-pill tag-lang">
                  {movie.lang || "Vietsub"}
                </span>

                {statusText && statusText !== "Đang cập nhật" && (
                  <span className="db-tag-pill tag-episode">
                    Trạng thái: {statusText}
                  </span>
                )}

                {totalEpisodesText && totalEpisodesText !== "Đang cập nhật" && (
                  <span className="db-tag-pill tag-total-ep">
                    Tổng: {totalEpisodesText}
                  </span>
                )}

                {countriesText && countriesText !== "Đang cập nhật" && (
                  <span className="db-tag-pill tag-country">
                    Quốc gia: {countriesText}
                  </span>
                )}

                {tmdbScore && (
                  <span
                    className="db-tag-pill tag-tmdb"
                    style={{
                      background: "rgba(250, 204, 21, 0.15)",
                      color: "#facc15",
                      borderColor: "rgba(250, 204, 21, 0.4)",
                      fontWeight: 600,
                    }}
                  >
                    ★ TMDB: {tmdbScore}
                  </span>
                )}
              </div>

              {/* Nút Xem thông tin trên màn Mobile */}
              <div className="db-mobile-info-toggle-wrap">
                <button
                  type="button"
                  className={`db-mobile-info-toggle-btn ${showMobileInfo ? "active" : ""}`}
                  onClick={() => setShowMobileInfo(!showMobileInfo)}
                >
                  <span>{showMobileInfo ? "Thu gọn thông tin" : "Xem thông tin"}</span>
                  <FaChevronDown className={`chevron-icon ${showMobileInfo ? "rotate" : ""}`} />
                </button>
              </div>

              {/* Khối thông tin: Mặc định hiển thị trên desktop, trên mobile đóng/mở theo showMobileInfo */}
              <div className={`db-info-section ${showMobileInfo ? "mobile-open" : "mobile-closed"}`}>
                <div className="db-info-grid">
                  <div className="db-info-col">
                    <div className="db-info-item">
                      <span className="db-info-label">Trạng thái:</span>
                      <span className="db-info-val">{statusText}</span>
                    </div>

                    <div className="db-info-item">
                      <span className="db-info-label">Tổng:</span>
                      <span className="db-info-val">{totalEpisodesText}</span>
                    </div>

                    <div className="db-info-item">
                      <span className="db-info-label">Năm:</span>
                      <span className="db-info-val">
                        {movie.year || "2026"}
                      </span>
                    </div>

                    <div className="db-info-item">
                      <span className="db-info-label">Thể loại:</span>
                      <span className="db-info-val text-truncate-2">
                        {categoriesText}
                      </span>
                    </div>
                  </div>

                  <div className="db-info-col">
                    <div className="db-info-item">
                      <span className="db-info-label">Loại:</span>
                      <span className="db-info-val">{movieType}</span>
                    </div>

                    <div className="db-info-item">
                      <span className="db-info-label">Thời lượng:</span>
                      <span className="db-info-val">
                        {movie.time || "Đang cập nhật"}
                      </span>
                    </div>

                    <div className="db-info-item">
                      <span className="db-info-label">Quốc gia:</span>
                      <span className="db-info-val">{countriesText}</span>
                    </div>

                    <div className="db-info-item">
                      <span className="db-info-label">TMDB:</span>
                      <span className="db-info-val">
                        {tmdbScore ? (
                          <span style={{ color: "#facc15", fontWeight: 600 }}>
                            ★ {tmdbScore}
                          </span>
                        ) : (
                          "Đang cập nhật"
                        )}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Nội dung tóm tắt hiển thị thêm trên mobile khi mở xem thông tin */}
                <div className="db-mobile-desc-block">
                  <h4 className="db-desc-heading">GIỚI THIỆU:</h4>
                  <p className="db-desc-text">
                    {cleanDescription || "Đang cập nhật nội dung phim..."}
                  </p>
                </div>
              </div>

              {/* Cụm nút hành động */}
              <div className="db-actions-row">
                <div className="db-actions-left">
                  {/* Nút Xem Ngay */}
                  <button
                    className="db-btn-play"
                    onClick={() => {
                      if (!episodes.length) return;
                      navigate(
                        `/xem-phim/${slug}/${encodeURIComponent(currentServerName)}/${episodes[0].slug}`,
                        { state: { movieData: movie, sourcesData: sources } }
                      );
                    }}
                  >
                    <FaPlay className="play-triangle" />
                    <span>Xem Ngay</span>
                  </button>

                  {/* Nút Yêu thích */}
                  <button
                    className={`db-action-btn ${isFavorited ? "favorited" : ""}`}
                    onClick={toggleFav}
                    disabled={favLoading || isFavorited === null}
                    title={isFavorited ? "Bỏ yêu thích" : "Yêu thích"}
                  >
                    {isFavorited ? (
                      <FaHeart className="act-icon heart-active" />
                    ) : (
                      <FaRegHeart className="act-icon" />
                    )}
                    <span>{isFavorited ? "Đã thích" : "Yêu thích"}</span>
                  </button>

                  {/* Nút Chia sẻ */}
                  <button
                    className="db-action-btn"
                    onClick={handleShare}
                    title="Chia sẻ liên kết phim"
                  >
                    <FaShareAlt className="act-icon" />
                    <span>Chia sẻ</span>
                  </button>
                </div>

                <div className="db-actions-right">
                  {/* Nút Xem Chung */}
                  <button
                    className="db-btn-watch-together"
                    onClick={handleWatchTogether}
                    title="Xem phim cùng bạn bè"
                  >
                    <FaUsers className="watch-together-icon" />
                    <span>Xem Chung</span>
                  </button>

                  {/* Nút Trailer bên phải */}
                  {movie.trailer_url && (
                    <button
                      className="db-btn-trailer"
                      onClick={() => setShowTrailerModal(true)}
                      title="Xem Trailer"
                    >
                      <FaPlay className="trailer-icon" />
                      <span>Trailer</span>
                    </button>
                  )}
                </div>
              </div>

              {/* ── MÁY CHỦ (SERVERS) ── */}
              {allServers.length > 0 && (
                <div className="db-servers-row">
                  <div className="db-servers-label">
                    <FaServer />
                    <span>MÁY CHỦ:</span>
                  </div>

                  <div className="db-servers-list">
                    {allServers.map((s, i) => {
                      const isActive = i === currentServer;
                      return (
                        <button
                          key={i}
                          className={`db-server-pill ${isActive ? "active" : ""}`}
                          onClick={() => setCurrentServer(i)}
                        >
                          #{s.sourceName} ({s.server_type || "Vietsub"}) | {s.episodeCount} tập
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* ── DANH SÁCH TẬP PHIM ── */}
              <div className="db-episodes-section">
                <div className="db-episodes-header">
                  <div className="db-episodes-title-wrap">
                    <h3 className="db-episodes-title">Danh sách tập</h3>
                    <span className="db-episodes-count">
                      ( <strong className="highlight">{filteredEpisodes.length}</strong> / {episodes.length} )
                    </span>
                  </div>

                  <div className="db-episodes-tools">
                    {/* Ô tìm kiếm tập */}
                    <div className="db-search-box">
                      <FaSearch className="search-icon" />
                      <input
                        type="text"
                        placeholder="Tìm tập..."
                        value={searchEpisode}
                        onChange={(e) => setSearchEpisode(e.target.value)}
                      />
                      {searchEpisode && (
                        <button
                          className="clear-search-btn"
                          onClick={() => setSearchEpisode("")}
                        >
                          <FaTimes />
                        </button>
                      )}
                    </div>

                    {/* Nút đảo chiều sắp xếp */}
                    <button
                      className="db-tool-btn db-sort-btn"
                      onClick={() => setIsSortAsc(!isSortAsc)}
                      title={isSortAsc ? "Đang xếp: 1 -> N (Bấm để đảo ngược)" : "Đang xếp: N -> 1 (Bấm để đảo ngược)"}
                    >
                      <FaSortAmountDown className={!isSortAsc ? "rotate-sort" : ""} />
                    </button>
                  </div>
                </div>

                {/* Danh sách thẻ tập */}
                {filteredEpisodes.length > 0 ? (
                  <div className="db-episode-grid">
                    {filteredEpisodes.map((ep) => (
                      <button
                        key={ep.slug}
                        className="db-episode-card"
                        onClick={() => {
                          if (!ep?.slug) return;
                          navigate(
                            `/xem-phim/${slug}/${encodeURIComponent(currentServerName)}/${ep.slug}`,
                            { state: { movieData: movie, sourcesData: sources } }
                          );
                        }}
                      >
                        <div className="ep-info">
                          <span className="ep-name">{ep.name}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="db-episodes-empty">
                    Không tìm thấy tập phim phù hợp!
                  </div>
                )}
              </div>
            </main>
          </div>

          {/* ── POPUP TRAILER NẾU CÓ ── */}
          {showTrailerModal &&
            typeof document !== "undefined" &&
            createPortal(
              <div
                className="db-trailer-modal-backdrop"
                onClick={() => setShowTrailerModal(false)}
              >
                <div
                  className="db-trailer-modal-content"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    className="db-trailer-close-btn"
                    onClick={() => setShowTrailerModal(false)}
                  >
                    <FaTimes size={18} />
                  </button>
                  <div className="db-trailer-iframe-wrap">
                    <iframe
                      src={movie.trailer_url
                        ?.replace("watch?v=", "embed/")
                        ?.replace("youtu.be/", "www.youtube.com/embed/")}
                      title="Trailer Phim"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                </div>
              </div>,
              document.body
            )}
        </div>
      )}
    </>
  );
}
