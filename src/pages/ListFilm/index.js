import { useEffect, useState, useRef } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { CiSearch } from "react-icons/ci";
import { GoChevronLeft } from "react-icons/go";
import { useMovies } from "../../context/MoviesContext";
import "./style.scss";

export default function FilmListByType() {
  const { type } = useParams();

  const [search, setSearch] = useState("");
  const [hoverFilm, setHoverFilm] = useState(null);
  const [enablePreview, setEnablePreview] = useState(
    window.innerWidth >= 775
  );

  const inputRef = useRef(null);
  const previewRef = useRef(null);
  const hoverTimerRef = useRef(null);
  const navigate = useNavigate();

  /* ===================== MAP DATA THEO TYPE ===================== */
  const { grouped, loading } = useMovies();

  const typeMap = {
    cinematic: "phim-chieu-rap",
    films: "phim-noi-bat",
    anime: "anime",
    "new-film": "phim-moi",
    "new-anime": "anime-moi",
    "sieu-nhan": "tokusatsu",
    "high-rate-film": "high-rate-film",
    "korea-film": "korea-film",
    "china-film": "china-film",
    "china3d-film": "china3d",
  };

  const category = typeMap[type] || "phim-noi-bat";
  const results = grouped?.[category] || [];    

  /* ===================== PHÂN TRANG (27 ITEMS / PAGE) ===================== */
  const ITEMS_PER_PAGE = 27;
  const [page, setPage] = useState(1);
  const [pageInput, setPageInput] = useState(1);
  const totalPages = Math.ceil(results.length / ITEMS_PER_PAGE) || 1;

  useEffect(() => {
    setPage(1);
    setPageInput(1);
    setHoverFilm(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [type]);

  useEffect(() => {
    setPageInput(page);
    setHoverFilm(null);
  }, [page]);

  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > totalPages || newPage === page) return;
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handlePageSubmit = () => {
    if (!pageInput) return;
    let newPage = Number(pageInput);
    if (isNaN(newPage)) return;
    if (newPage < 1) newPage = 1;
    if (newPage > totalPages) newPage = totalPages;
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const startIndex = (page - 1) * ITEMS_PER_PAGE;
  const displayedFilms = results.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const renderPagination = () => {
    if (totalPages <= 1) return null;
    const pages = [];
    const start = Math.max(1, page - 2);
    const end = Math.min(totalPages, page + 2);

    for (let i = start; i <= end; i++) {
      pages.push(
        <button
          key={i}
          className={`page-btn ${page === i ? "active" : ""}`}
          onClick={() => handlePageChange(i)}
        >
          {i}
        </button>
      );
    }

    return (
      <div className="pagination">
        <button
          disabled={page === 1}
          onClick={() => handlePageChange(page - 1)}
          aria-label="Trang trước"
        >
          ‹
        </button>
        {start > 1 && <span>...</span>}
        {pages}
        {end < totalPages && <span>...</span>}
        <button
          disabled={page === totalPages}
          onClick={() => handlePageChange(page + 1)}
          aria-label="Trang sau"
        >
          ›
        </button>
        <div className="page-input-wrapper">
          <input
            type="number"
            value={pageInput}
            onChange={(e) => setPageInput(e.target.value)}
            onBlur={handlePageSubmit}
            onKeyDown={(e) => e.key === "Enter" && handlePageSubmit()}
            min={1}
            max={totalPages}
          />
          <span>/ {totalPages}</span>
          <button type="button" onClick={handlePageSubmit}>
            Chuyển trang
          </button>
        </div>
      </div>
    );
  };    

  /* ===================== RESPONSIVE PREVIEW ===================== */
  useEffect(() => {
    const handleResize = () => {
      const enabled = window.innerWidth >= 775;
      setEnablePreview(enabled);
      if (!enabled) setHoverFilm(null);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  /* ===================== SEARCH ===================== */
  const handleSearch = () => {
    if (!search.trim()) return;
    const slug = search.trim().toLowerCase().replace(/\s+/g, "-");
    navigate(`/search/${slug}`);
    setSearch("");
    inputRef.current.focus();
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") handleSearch();
  };

  /* ===================== HOVER PREVIEW ===================== */
  const handleMouseEnter = (film) => {
    if (!enablePreview) return;
    hoverTimerRef.current = setTimeout(() => {
      setHoverFilm(film);
    }, 5000);
  };

  const handleMouseLeave = () => {
    if (hoverTimerRef.current) {
      clearTimeout(hoverTimerRef.current);
      hoverTimerRef.current = null;
    }
  };

  useEffect(() => {
    if (hoverFilm && hoverTimerRef.current) {
      clearTimeout(hoverTimerRef.current);
      hoverTimerRef.current = null;
    }
  }, [hoverFilm]);

  return (
    <div className="film-container">

      {/* SEARCH */}
      <div className="input-search-film">
        <input
          ref={inputRef}
          type="text"
          className="input-film fst-italic"
          placeholder="Tìm kiếm phim khác..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={handleKeyPress}
        />
        <CiSearch className="search-film-icon" onClick={handleSearch} />
      </div>
      <div className="d-flex align-items-center mb-3 ms-2">
         <GoChevronLeft 
          size={25} 
          onClick={() => navigate(-1)}
          style={{ cursor: "pointer", border: "1px solid #ddd", borderRadius: "50%", color: "#fff" }} 
          />
        <h4 className="text-light ms-2 mb-0">
          {type === "cinematic"
            ? "Phim Chiếu Rạp"
            : type === "films"
            ? "Phim Nổi Bật"
            : type === "anime"
            ? "Anime"
            : type === "new-film"
            ? "Phim Mới"
            : type === "new-anime"
            ? "Anime Mới"
            : type === "sieu-nhan"
            ? "Siêu Nhân"
            : type === "high-rate-film"
            ? "Phim Hot"
            : type === "korea-film"
            ? "Series Hàn Quốc"
            : type === "china-film"
            ? "Series Trung Quốc"
            : type === "china3d-film"
            ? "Hoạt Hình 3D Trung Quốc"
            : "Danh sách phim"
            }
        </h4>

      </div>
      {/* GRID */}
      {loading ? (
        <div className="film-grid">
          {Array.from({ length: 18 }).map((_, idx) => (
            <div key={idx} className="film-card film-card--skeleton">
              <div className="film-poster-wrapper">
                <div className="skeleton-badge" />
                <div className="film-overlay">
                  <div className="skeleton-title-line" />
                  <div className="skeleton-title-line skeleton-title-line--short" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <>
          <div className={`film-grid ${hoverFilm ? "disable-hover" : ""}`}>
            {displayedFilms.map((film) => (
              <Link
                to={`/chi-tiet/${film.path}`}
                key={film.path}
                className="film-card"
                onMouseEnter={() => handleMouseEnter(film)}
                onMouseLeave={handleMouseLeave}
              >
                <div className="film-poster-wrapper">
                  <img
                    src={film.image || film.thumb || ""}
                    alt={film.title}
                    loading="lazy"
                    className="film-poster"
                    onLoad={(e) => {
                      e.currentTarget.parentElement?.classList.add("is-loaded");
                    }}
                    onError={(e) => {
                      e.currentTarget.parentElement?.classList.add("is-loaded");
                      e.currentTarget.src = "https://placehold.co/300x450/141824/ffffff?text=Tecede";
                    }}
                  />

                  <span className="film-episodes">
                    {film.time || film.episode_current}
                  </span>

                  <div className="film-overlay">
                    <h6 className="film-name">{film.title}</h6>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* PAGINATION */}
          {renderPagination()}

          {/* PREVIEW */}
          {enablePreview && hoverFilm && (
          <div className="hover-preview-backdrop">
            <div
              className="hover-preview-card"
              ref={previewRef}
              onMouseLeave={() => setHoverFilm(null)}
              style={{
                backgroundImage: `url(${hoverFilm.thumb || hoverFilm.image})`,
              }}
            >
              <div className="preview-info">
                
                {/* LEFT */}
                <div className="preview-left">
                  <h5 className="preview-name">{hoverFilm.title}</h5>

                  {/* META (chỉ có gì dùng đó) */}
                  <div className="preview-meta">
                    {hoverFilm.time && (
                      <span className="preview-tag">{hoverFilm.time}</span>
                    )}
                    {hoverFilm.episode_current && (
                      <span className="preview-tag">{hoverFilm.episode_current}</span>
                    )}
                  </div>

                  {/* BUTTON */}
                  <div className="preview-actions">
                    <Link
                      to={`/chi-tiet/${hoverFilm.path}`}
                      className="btn-watch"
                    >
                      ▶ Xem ngay
                    </Link>

                    <Link
                      to={`/chi-tiet/${hoverFilm.path}`}
                      className="btn-detail"
                    >
                      Chi tiết
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        </>
      )}
    </div>
  );
}