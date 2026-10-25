import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FaChevronLeft, FaChevronRight, FaFilm, FaClock } from "react-icons/fa";
import { formatTimeAgo } from "../../services/pipedApi";
import "./style.scss";

export default function LatestMovies() {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const filmApiUrl = process.env.REACT_APP_FILM_API_URL || "https://phimapi.com";

  useEffect(() => {
    let isMounted = true;
    async function fetchData() {
      setLoading(true);
      try {
        const res = await fetch(
          `${filmApiUrl}/danh-sach/phim-moi-cap-nhat?page=${currentPage}`
        );
        const data = await res.json();

        if (!isMounted) return;

        const items = data.items || [];
        setMovies(items);

        // Xử lý phân trang
        if (data.pagination && data.pagination.totalPages) {
          setTotalPages(data.pagination.totalPages);
        } else if (data.totalItems && data.totalItemsPerPage) {
          setTotalPages(Math.ceil(data.totalItems / data.totalItemsPerPage));
        } else {
          setTotalPages(items.length > 0 ? currentPage : 1);
        }
      } catch (err) {
        console.error("Lỗi tải phim mới cập nhật:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    fetchData();

    return () => {
      isMounted = false;
    };
  }, [currentPage, filmApiUrl]);

  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > totalPages) return;
    setCurrentPage(newPage);
    const element = document.getElementById("latest-movies-widget");
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  /* ================= UTILS ================= */
  const getPoster = (url) => {
    if (!url || typeof url !== "string") return "";
    const cleanUrl = url.trim();
    if (!cleanUrl) return "";
    if (cleanUrl.startsWith("http")) return cleanUrl;
    return `https://phimimg.com/${cleanUrl.startsWith("/") ? cleanUrl.slice(1) : cleanUrl}`;
  };

  return (
    <div className="latest-movies-widget" id="latest-movies-widget">
      {/* HEADER SECTION (PHONG CÁCH YT-WATCH-RIGHT) */}
      <div className="latest-movies-header">
        <h3 className="latest-movies-title">
          <FaFilm className="title-icon" /> Phim mới cập nhật
        </h3>
        <span className="latest-movies-badge">
          Trang {currentPage} / {totalPages}
        </span>
      </div>

      {/* SKELETON LOADING STATE */}
      {loading && (
        <div className="compact-skeletons">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="compact-skel-card">
              <div className="skel-thumb" />
              <div className="skel-info">
                <div className="skel-line title" />
                <div className="skel-line sub" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* DANH SÁCH PHIM THIẾT KẾ COMPACT GỌN ĐẸP NHƯ YT-WATCH-RIGHT */}
      {!loading && (
        <div className="movie-compact-list">
          {movies.map((movie) => {
            let status = (movie.episode_current || "").trim();
            if (!status) {
              status =
                movie.tmdb?.type === "tv" && movie.tmdb?.season
                  ? `Tập ${movie.tmdb.season}`
                  : "Full";
            }

            // Nếu số liệu là chữ hoặc full là màu xanh lá cây, nếu số liệu là số thì background màu vàng
            const isFullOrText =
              status.toLowerCase().includes("full") ||
              status.toLowerCase().includes("hoàn tất") ||
              !/\d/.test(status);

            const poster = getPoster(movie.poster_url || movie.thumb_url);
            const timeAgo = formatTimeAgo(movie.modified?.time);

            return (
              <Link
                key={movie._id || movie.slug}
                to={`/chi-tiet/${movie.slug}`}
                className="movie-compact-card"
                title={`${movie.name} (${movie.origin_name})`}
              >
                {/* POSTER / THUMBNAIL */}
                <div className="compact-thumb-wrap">
                  <img
                    src={poster}
                    alt={movie.name}
                    loading="lazy"
                    className="compact-thumb-img"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = "https://phimimg.com/uploads/movies/placeholder.jpg";
                    }}
                  />
                </div>

                {/* META INFO */}
                <div className="compact-meta">
                  <h4 className="compact-title">{movie.name}</h4>

                  <p className="compact-origin">
                    {movie.origin_name || movie.name}
                    {movie.year ? ` • ${movie.year}` : ""}
                  </p>

                  {/* HÀNG STATS: SỐ TẬP + NGÀY CẬP NHẬT CÙNG HÀNG */}
                  <div className="compact-stats">
                    {status && (
                      <span
                        className={`compact-ep-badge ${
                          isFullOrText ? "badge-green" : "badge-yellow"
                        }`}
                      >
                        {status}
                      </span>
                    )}
                    {status && <span className="compact-dot">•</span>}
                    <span className="compact-date">
                      <FaClock className="clock-icon" /> {timeAgo || "Mới cập nhật"}
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}

      {/* PHÂN TRANG COMPACT TINH TẾ */}
      <div className="latest-movies-pagination">
        <button
          type="button"
          className="btn-page-nav prev"
          disabled={currentPage === 1 || loading}
          onClick={() => handlePageChange(currentPage - 1)}
          title="Trang trước"
        >
          <FaChevronLeft className="icon" />
          <span>Trước</span>
        </button>

        <div className="page-indicator">
          <span>{currentPage}</span> / {totalPages}
        </div>

        <button
          type="button"
          className="btn-page-nav next"
          disabled={currentPage >= totalPages || loading}
          onClick={() => handlePageChange(currentPage + 1)}
          title="Trang sau"
        >
          <span>Sau</span>
          <FaChevronRight className="icon" />
        </button>
      </div>
    </div>
  );
}
