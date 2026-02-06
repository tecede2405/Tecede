import { useEffect, useState, useRef } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { CiSearch } from "react-icons/ci";
import { GoChevronLeft } from "react-icons/go";

export default function FilmListByCountry() {
  const { slug } = useParams();
  const navigate = useNavigate();

  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  const [hoverFilm, setHoverFilm] = useState(null);
  const [enablePreview, setEnablePreview] = useState(window.innerWidth >= 775);

  const inputRef = useRef(null);
  const previewRef = useRef(null);
  const hoverTimerRef = useRef(null);

  const title = slug.replace(/-/g, " ");

  const handleBack = () => {
    navigate(-1);
  };

  /* ================= FETCH DATA ================= */
  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);

        const query = `page=${page}&limit=24`;
        const url = `${process.env.REACT_APP_FILM_API_URL}/v1/api/quoc-gia/${slug}?${query}`;
        const res = await fetch(url);
        const data = await res.json();

        if (data.status) {
          setResults(data.data?.items || []);
          setTotalPages(data.data?.params?.pagination?.totalPages || 1);
          setTotalItems(data.data?.params?.pagination?.totalItems || 0);
        } else {
          console.error("API error:", data.msg);
          setResults([]);
        }
      } catch (err) {
        console.error("Fetch error:", err);
        setResults([]);
      } finally {
        setLoading(false);
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    }

    fetchData();
  }, [slug, page]); // Chỉ phụ thuộc slug và page

  /* RESET PAGE KHI SLUG THAY ĐỔI */
  useEffect(() => {
    setPage(1);
  }, [slug]);

  /* ================= PREVIEW LOGIC ================= */
  useEffect(() => {
    if (!hoverFilm) return;

    function handleClickOutside(e) {
      if (previewRef.current && !previewRef.current.contains(e.target)) {
        setHoverFilm(null);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [hoverFilm]);

  useEffect(() => {
    const handleResize = () => {
      const enabled = window.innerWidth >= 775;
      setEnablePreview(enabled);
      if (!enabled && hoverFilm) setHoverFilm(null);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [hoverFilm]);

  const handleMouseEnter = (film) => {
    if (!enablePreview) return;
    hoverTimerRef.current = setTimeout(() => {
      setHoverFilm(film);
    }, 500);
  };

  const handleMouseLeave = () => {
    if (!enablePreview) return;
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

  /* ================= UTILS ================= */
  function getPoster(url) {
    if (!url) return "";

    // Chuẩn hóa URL gốc
    let originalUrl = url;
    if (!originalUrl.startsWith("http")) {
      if (!originalUrl.startsWith("/")) originalUrl = "/" + originalUrl;
      originalUrl = `https://phimimg.com${originalUrl}`;
    }

    // Convert sang WEBP qua phimapi
    return `${process.env.REACT_APP_FILM_API_URL}/image.php?url=${encodeURIComponent(
      originalUrl
    )}`;
  }

  const handleSearch = () => {
    if (!search.trim()) return;
    const searchSlug = search.trim().toLowerCase().replace(/\s+/g, "-");
    navigate(`/search/${searchSlug}`);
    setSearch("");
  };

  /* ================= PAGINATION ================= */
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
          onClick={() => setPage(i)}
        >
          {i}
        </button>
      );
    }

    return (
      <div className="pagination">
        <button disabled={page === 1} onClick={() => setPage(page - 1)}>
          ‹
        </button>
        {start > 1 && <span>...</span>}
        {pages}
        {end < totalPages && <span>...</span>}
        <button
          disabled={page === totalPages}
          onClick={() => setPage(page + 1)}
        >
          ›
        </button>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="container py-4">
        <h4 className="result-title fst-italic">
          Đang tải thể loại: {title}...
        </h4>
      </div>
    );
  }

  return (
    <div className="film-container">
      {/* SEARCH */}
      <div className="input-search-film">
        <input
          ref={inputRef}
          type="text"
          className="input-film fst-italic"
          placeholder="Tìm phim khác..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
        />
        <CiSearch className="search-film-icon" onClick={handleSearch} />
      </div>

      <h3 className="result-title fst-italic">
        <GoChevronLeft 
          onClick={handleBack} 
          style={{ cursor: "pointer", border: "1px solid #ddd", borderRadius: "50%" }} 
          />
        <i className="ms-2">Thể loại: {title} {totalItems > 0 ? `(${totalItems} phim)` : ""}</i>
      </h3>

      {/* GRID */}
      <div className={`film-grid ${hoverFilm ? "disable-hover" : ""}`}>
        {results.length === 0 ? (
          <p>Không tìm thấy phim nào trong thể loại này.</p>
        ) : (
          results.map((film) => (
            <Link
              to={`/film/${film.slug}`}
              key={film.slug}
              className="film-card"
              onMouseEnter={enablePreview ? () => handleMouseEnter(film) : undefined}
              onMouseLeave={enablePreview ? handleMouseLeave : undefined}
            >
              <div className="film-poster-wrapper">
                <img
                  src={film.poster_url ? getPoster(film.poster_url) : ""}
                  alt={film.name}
                  className="film-poster"
                />

                <span className="film-episodes">
                  {film.episode_total === 1
                    ? "Full"
                    : film.episode_current?.includes("Hoàn Tất")
                    ? film.episode_current
                    : film.episode_current && film.episode_total
                    ? `${film.episode_current}/${film.episode_total}`
                    : film.episode_current || "N/A"}
                </span>

                <div className="film-overlay">
                  <h6 className="film-name">{film.name}</h6>
                  <span className="film-year">{film.year}</span>
                </div>
              </div>
            </Link>
          ))
        )}
      </div>

      {renderPagination()}

      {/* PREVIEW */}
      {enablePreview && hoverFilm && (
        <div className="hover-preview-backdrop">
          <div
            className="hover-preview-card"
            onMouseLeave={() => setHoverFilm(null)}
            ref={previewRef}
            style={{
              backgroundImage: `url(${getPoster(
                hoverFilm.thumb_url || hoverFilm.poster_url
              )})`,
            }}
          >
            <div className="preview-info">
              <h5 className="preview-name">{hoverFilm.name}</h5>
              <span className="film-year">{hoverFilm.origin_name}</span>

              <div className="preview-actions">
                <Link
                  to={`/film/${hoverFilm.slug}`}
                  className="btn-watch btn btn-info"
                >
                  ▶ Xem ngay
                </Link>
                <Link
                  to={`/film/${hoverFilm.slug}`}
                  className="btn-detail btn btn-outline-info"
                >
                  Chi tiết
                </Link>
              </div>

              <div className="film-detail-info mt-2">
                <span className="detail-year me-2 mt-2">
                  Chất lượng: {hoverFilm.quality || "N/A"}
                </span>
                <span className="detail-year me-2 mt-2">
                  Số tập: {hoverFilm.episode_current || "N/A"}
                </span>
                <span className="detail-year me-2 mt-2">
                  Thời lượng: {hoverFilm.time || "N/A"}
                </span>
                <p
                  className="detail-year mt-2"
                  style={{ display: "inline-block", maxWidth: "70%" }}
                >
                  Ngôn ngữ: {hoverFilm.lang || "N/A"}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}