import { useEffect, useState, useRef } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { CiSearch } from "react-icons/ci";
import { GoChevronLeft } from "react-icons/go";

export default function FilmListByCountry() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [pageInput, setPageInput] = useState(1);
  const [results, setResults] = useState([]);
  const [imageUrls, setImageUrls] = useState([]); // State lưu mảng og_image
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  const [hoverFilm, setHoverFilm] = useState(null);
  const [hoverFilmIndex, setHoverFilmIndex] = useState(null); // Lưu index để lấy đúng ảnh preview
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
        // Chú ý: Đảm bảo endpoint là /v1/api/quoc-gia/
        const url = `${process.env.REACT_APP_FILM_API_URL}/v1/api/quoc-gia/${slug}?${query}`;
        const res = await fetch(url);
        const data = await res.json();

        if (data.status) {
          // Lưu dữ liệu phim
          setResults(data.data?.items || []);
          
          // LẤY MẢNG ĐƯỜNG DẪN ẢNH ĐẦY ĐỦ TỪ seoOnPage
          const ogImages = data.data?.seoOnPage?.og_image || [];
          setImageUrls(ogImages);

          // Tự tính totalPages dựa trên totalItems và totalItemsPerPage
          const paginationData = data.data?.params?.pagination;
          if (paginationData) {
            const total = paginationData.totalItems || 0;
            const perPage = paginationData.totalItemsPerPage || 24;
            const calculatedTotalPages = Math.ceil(total / perPage);
            
            setTotalItems(total);
            setTotalPages(calculatedTotalPages > 0 ? calculatedTotalPages : 1);
          }
        } else {
          console.error("API error:", data.msg);
          setResults([]);
          setImageUrls([]);
        }
      } catch (err) {
        console.error("Fetch error:", err);
        setResults([]);
        setImageUrls([]);
      } finally {
        setLoading(false);
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    }

    fetchData();
  }, [slug, page]);

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
        setHoverFilmIndex(null);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [hoverFilm]);

  useEffect(() => {
    const handleResize = () => {
      const enabled = window.innerWidth >= 775;
      setEnablePreview(enabled);
      if (!enabled && hoverFilm) {
        setHoverFilm(null);
        setHoverFilmIndex(null);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [hoverFilm]);

  const handleMouseEnter = (film, index) => {
    if (!enablePreview) return;
    hoverTimerRef.current = setTimeout(() => {
      setHoverFilm(film);
      setHoverFilmIndex(index);
    }, 5000);
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
  // Lấy đường dẫn ảnh hoàn chỉnh dựa vào index
  const getFullImageUrl = (index) => {
    const path = imageUrls[index];
    if (!path) return "";
    
    // Nếu path bắt đầu bằng '/', bỏ dấu '/' thừa trước khi ghép
    const cleanPath = path.startsWith('/') ? path.substring(1) : path;
    return `${cleanPath}`;
  };

  const handleSearch = () => {
    if (!search.trim()) return;
    const searchSlug = search.trim().toLowerCase().replace(/\s+/g, "-");
    navigate(`/search/${searchSlug}`);
    setSearch("");
  };

  /* ================= PAGINATION ================= */
  useEffect(() => {
    setPageInput(page);
  }, [page]);

  const handlePageSubmit = () => {
    if (!pageInput) return;
    let newPage = Number(pageInput);
    if (isNaN(newPage)) return;
    if (newPage < 1) newPage = 1;
    if (newPage > totalPages) newPage = totalPages;
    setPage(newPage);
  };

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
        <button disabled={page === 1} onClick={() => setPage(page - 1)}>‹</button>
        {start > 1 && <span>...</span>}
        {pages}
        {end < totalPages && <span>...</span>}
        <button disabled={page === totalPages} onClick={() => setPage(page + 1)}>›</button>
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
          <button onClick={handlePageSubmit}>Chuyển trang</button>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="container py-4">
        <h4 className="result-title fst-italic">Đang tải quốc gia: {title}...</h4>
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
        <i className="ms-2">Quốc gia: {title} {totalItems > 0 ? `(${totalItems} phim)` : ""}</i>
      </h3>

      {/* GRID */}
      <div className={`film-grid ${hoverFilm ? "disable-hover" : ""}`}>
        {results.length === 0 ? (
          <p>Không tìm thấy phim nào của quốc gia này.</p>
        ) : (
          results.map((film, index) => (
            <Link
              to={`/chi-tiet/${film.slug}`}
              key={film.slug}
              className="film-card"
              onMouseEnter={enablePreview ? () => handleMouseEnter(film, index) : undefined}
              onMouseLeave={enablePreview ? handleMouseLeave : undefined}
            >
              <div className="film-poster-wrapper">
                <img
                  // Sử dụng hàm getFullImageUrl truyền vào index
                  src={getFullImageUrl(index)}
                  alt={film.name}
                  loading="lazy"
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
      {enablePreview && hoverFilm && hoverFilmIndex !== null && (
        <div className="hover-preview-backdrop">
          <div
            className="hover-preview-card"
            onMouseLeave={() => {
              setHoverFilm(null);
              setHoverFilmIndex(null);
            }}
            ref={previewRef}
            style={{
              // Sử dụng lại hàm getFullImageUrl cho preview
              backgroundImage: `url(${getFullImageUrl(hoverFilmIndex)})`,
            }}
          >
            <div className="preview-info">
              {/* LEFT */}
              <div className="preview-left">
                <h5 className="preview-name">{hoverFilm.name}</h5>
                <div className="preview-origin">{hoverFilm.origin_name}</div>
                <div className="preview-meta">
                  <span className="preview-tag">{hoverFilm.quality || "N/A"}</span>
                  <span className="preview-tag">{hoverFilm.lang || "N/A"}</span>
                </div>
                <div className="preview-actions">
                  <Link to={`/chi-tiet/${hoverFilm.slug}`} className="btn-watch">▶ Xem ngay</Link>
                  <Link to={`/chi-tiet/${hoverFilm.slug}`} className="btn-detail">Chi tiết</Link>
                </div>
              </div>

              {/* RIGHT */}
              <div className="preview-right">
                <div className="preview-box blue"><b>Chất lượng:</b> {hoverFilm.quality || "N/A"}</div>
                <div className="preview-box yellow"><b>Số tập:</b> {hoverFilm.episode_current || "N/A"}</div>
                <div className="preview-box green"><b>Thời lượng:</b> {hoverFilm.time || "N/A"}</div>
                <div className="preview-box blue"><b>Ngôn ngữ:</b> {hoverFilm.lang || "N/A"}</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}