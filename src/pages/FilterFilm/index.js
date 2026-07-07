import { useEffect, useState, useRef, useCallback } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { CiSearch } from "react-icons/ci";
import { GoChevronLeft } from "react-icons/go";
import { IoFilterSharp } from "react-icons/io5";
import { MdClear } from "react-icons/md";
import Swal from "sweetalert2";
import "./style.scss";

const BLOCKED_KEYWORDS = ["18", "18+", "phim sex", "sex", "sexy", "adult", "xxx", "erotic", "porn", "hentai", "phim-18"];

const isBlocked = (text) => {
  if (!text) return false;
  return BLOCKED_KEYWORDS.some((k) => text.toLowerCase().includes(k));
};

export default function FilterFilm() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  /* ================= FILTER STATES ================= */
  const [keyword, setKeyword] = useState(searchParams.get("keyword") || "");
  const [category, setCategory] = useState(searchParams.get("category") || "");
  const [country, setCountry] = useState(searchParams.get("country") || "");
  const [year, setYear] = useState(searchParams.get("year") || "");
  const [sortField, setSortField] = useState(searchParams.get("sort_field") || "modified.time");
  const [sortType, setSortType] = useState(searchParams.get("sort_type") || "desc");
  const [sortLang, setSortLang] = useState(searchParams.get("sort_lang") || "");
  const [limit] = useState(24);

  /* ================= DATA STATES ================= */
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(Number(searchParams.get("page")) || 1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [pageInput, setPageInput] = useState(1);

  /* ================= FILTER OPTIONS ================= */
  const [categories, setCategories] = useState([]);
  const [countries, setCountries] = useState([]);
  const [showFilters, setShowFilters] = useState(true);

  /* ================= HOVER PREVIEW ================= */
  const [hoverFilm, setHoverFilm] = useState(null);
  const [enablePreview, setEnablePreview] = useState(window.innerWidth >= 775);
  const previewRef = useRef(null);
  const hoverTimerRef = useRef(null);

  /* ================= GENERATE YEAR OPTIONS ================= */
  const currentYear = new Date().getFullYear();
  const years = [];
  for (let y = currentYear; y >= 1970; y--) {
    years.push(y);
  }

  /* ================= FETCH FILTER OPTIONS ================= */
  /* ================= FETCH FILTER OPTIONS ================= */
  useEffect(() => {
    async function fetchOptions() {
      try {
        const [catRes, countryRes] = await Promise.all([
          fetch("https://phimapi.com/the-loai"),
          fetch("https://phimapi.com/quoc-gia"),
        ]);
        
        const catJson = await catRes.json();
        const countryJson = await countryRes.json();
        
        // CẬP NHẬT: Trích xuất mảng từ .data.items thay vì chỉ .data
        const catArray = catJson?.data?.items || [];
        const countryArray = countryJson?.data?.items || [];
        
        // Lọc các thể loại 18+
        const safeCategories = catArray.filter(
          (cat) => !isBlocked(cat.slug) && !isBlocked(cat.name)
        );
        
        setCategories(safeCategories);
        setCountries(countryArray);
      } catch (err) {
        console.error("Lỗi khi tải bộ lọc:", err);
      }
    }
    fetchOptions();
  }, []);

  /* ================= BUILD QUERY & FETCH ================= */
  const fetchMovies = useCallback(async () => {
    const trimmedKeyword = keyword.trim();
    if (isBlocked(trimmedKeyword) || isBlocked(category)) {
      setResults([]);
      setTotalPages(1);
      setTotalItems(0);
      return;
    }
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set("page", page);
      params.set("limit", limit);
      if (sortField) params.set("sort_field", sortField);
      if (sortType) params.set("sort_type", sortType);
      if (sortLang) params.set("sort_lang", sortLang);
      if (year) params.set("year", year);

      let url = "";

      if (trimmedKeyword) {
        params.set("keyword", trimmedKeyword);
        if (category) params.set("category", category);
        if (country) params.set("country", country);
        url = `${process.env.REACT_APP_FILM_API_URL}/v1/api/tim-kiem?${params.toString()}`;
      } else {
        if (category) {
          if (country) params.set("country", country);
          url = `${process.env.REACT_APP_FILM_API_URL}/v1/api/the-loai/${category}?${params.toString()}`;
        } else if (country) {
          url = `${process.env.REACT_APP_FILM_API_URL}/v1/api/quoc-gia/${country}?${params.toString()}`;
        } else {
          // If no keyword, category, or country is selected, fallback to tim-kiem with generic keyword "a"
          params.set("keyword", "a");
          url = `${process.env.REACT_APP_FILM_API_URL}/v1/api/tim-kiem?${params.toString()}`;
        }
      }

      const res = await fetch(url);
      const data = await res.json();

      if (data.status) {
        let items = data.data?.items || [];
        // Lấy danh sách ảnh đầy đủ từ seoOnPage (đặc sản của phimapi)
        const ogImages = data.data?.seoOnPage?.og_image || [];

        // Gắn link ảnh full vào từng bộ phim dựa trên index
        items = items.map((item, index) => ({
          ...item,
          full_image_path: ogImages[index] || item.poster_url 
        }));

        setResults(items);

        // Fix lỗi thiếu totalPages nếu API trả về khác cấu trúc (tương tự lỗi đã fix ở list)
        const paginationData = data.data?.params?.pagination;
        if (paginationData) {
          const total = paginationData.totalItems || 0;
          const perPage = paginationData.totalItemsPerPage || limit;
          const calculatedTotalPages = Math.ceil(total / perPage);
          
          setTotalItems(total);
          setTotalPages(calculatedTotalPages > 0 ? calculatedTotalPages : 1);
        } else {
          setTotalPages(1);
          setTotalItems(0);
        }
      } else {
        setResults([]);
        setTotalPages(1);
        setTotalItems(0);
      }
    } catch (err) {
      console.error("Fetch error:", err);
      setResults([]);
    } finally {
      setLoading(false);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [keyword, page, sortField, sortType, sortLang, category, country, year, limit]);

  /* ================= AUTO FETCH ON FILTER / PAGE CHANGE ================= */
  useEffect(() => {
    fetchMovies();
  }, [fetchMovies]);

  /* ================= SYNC URL PARAMS ================= */
  useEffect(() => {
    const trimmedKeyword = keyword.trim();
    if (isBlocked(trimmedKeyword) || isBlocked(category)) {
      return;
    }
    const params = new URLSearchParams();
    if (trimmedKeyword) params.set("keyword", trimmedKeyword);
    if (page > 1) params.set("page", page);
    if (sortField && sortField !== "modified.time") params.set("sort_field", sortField);
    if (sortType && sortType !== "desc") params.set("sort_type", sortType);
    if (sortLang) params.set("sort_lang", sortLang);
    if (category) params.set("category", category);
    if (country) params.set("country", country);
    if (year) params.set("year", year);
    setSearchParams(params, { replace: true });
  }, [keyword, page, sortField, sortType, sortLang, category, country, year, setSearchParams]);

  /* ================= URL SECURITY VALIDATION ================= */
  useEffect(() => {
    const urlKeyword = searchParams.get("keyword") || "";
    const urlCategory = searchParams.get("category") || "";

    if (isBlocked(urlKeyword) || isBlocked(urlCategory)) {
      setKeyword("");
      setCategory("");
      setPage(1);

      const cleanParams = new URLSearchParams(searchParams);
      cleanParams.delete("keyword");
      cleanParams.delete("category");
      setSearchParams(cleanParams, { replace: true });

      Swal.fire({
        icon: "warning",
        title: "Nội dung không hợp lệ",
        text: "Hệ thống không hỗ trợ tìm kiếm hoặc lọc nội dung 18+.",
        confirmButtonText: "OK",
        background: "#1f1f1f",
        color: "#fff",
        confirmButtonColor: "#e50914"
      });
    }
  }, [searchParams, setSearchParams]);

  /* ================= HANDLE FILTER APPLY ================= */
  const handleApplyFilter = () => {
    setPage(1);
  };

  const handleClearFilters = () => {
    setKeyword("");
    setCategory("");
    setCountry("");
    setYear("");
    setSortField("modified.time");
    setSortType("desc");
    setSortLang("");
    setPage(1);
  };

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
  function getPoster(url) {
    if (!url) return "";
    // Trả về trực tiếp nếu đã là link web
    if (url.startsWith("http")) return url;
    
    // Nối thẳng vào domain gốc, loại bỏ hoàn toàn proxy image.php
    return `https://phimimg.com/${url.startsWith("/") ? url.slice(1) : url}`;
  }

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
      <div className="filter-pagination">
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

  /* ================= COUNT ACTIVE FILTERS ================= */
  const activeFilterCount = [category, country, year, sortLang].filter(Boolean).length +
    (sortField !== "modified.time" ? 1 : 0) +
    (sortType !== "desc" ? 1 : 0);

  return (
    <div className="filter-film-page">
      {/* HEADER */}
      <div className="filter-header">
        <div className="filter-header-left">
          <GoChevronLeft
            onClick={() => navigate(-1)}
            className="filter-back-btn"
          />
          <h2 className="filter-page-title">
            <IoFilterSharp className="filter-title-icon" />
            Lọc Phim
          </h2>
        </div>
        <button
          className="filter-toggle-btn"
          onClick={() => setShowFilters(!showFilters)}
        >
          <IoFilterSharp />
          {showFilters ? "Ẩn bộ lọc" : "Hiện bộ lọc"}
          {activeFilterCount > 0 && (
            <span className="filter-badge">{activeFilterCount}</span>
          )}
        </button>
      </div>

      {/* FILTER PANEL */}
      <div className={`filter-panel ${showFilters ? "open" : "closed"}`}>
        <div className="filter-panel-inner">
          {/* Row 1: Keyword search */}
          <div className="filter-row filter-search-row">
            <div className="filter-search-wrapper">
              <CiSearch className="filter-search-icon" />
              <input
                type="text"
                className="filter-search-input"
                placeholder="Nhập từ khóa tìm kiếm..."
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleApplyFilter();
                }}
              />
              {keyword && (
                <MdClear
                  className="filter-search-clear"
                  onClick={() => setKeyword("")}
                />
              )}
            </div>
          </div>

          {/* Row 2: Dropdowns */}
          <div className="filter-row filter-dropdowns">
            <div className="filter-group">
              <label>Thể loại</label>
              <select
                value={category}
                onChange={(e) => { setCategory(e.target.value); setPage(1); }}
              >
                <option value="">-- Tất cả --</option>
                {categories.map((cat) => (
                  <option key={cat.slug} value={cat.slug}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <label>Quốc gia</label>
              <select
                value={country}
                onChange={(e) => { setCountry(e.target.value); setPage(1); }}
              >
                <option value="">-- Tất cả --</option>
                {countries.map((c) => (
                  <option key={c.slug} value={c.slug}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <label>Năm</label>
              <select
                value={year}
                onChange={(e) => { setYear(e.target.value); setPage(1); }}
              >
                <option value="">-- Tất cả --</option>
                {years.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <label>Ngôn ngữ</label>
              <select
                value={sortLang}
                onChange={(e) => { setSortLang(e.target.value); setPage(1); }}
              >
                <option value="">-- Tất cả --</option>
                <option value="vietsub">Vietsub</option>
                <option value="thuyet-minh">Thuyết Minh</option>
                <option value="long-tieng">Lồng Tiếng</option>
              </select>
            </div>

            <div className="filter-group">
              <label>Sắp xếp theo</label>
              <select
                value={sortField}
                onChange={(e) => { setSortField(e.target.value); setPage(1); }}
              >
                <option value="modified.time">Thời gian cập nhật</option>
                <option value="_id">ID phim</option>
                <option value="year">Năm phát hành</option>
              </select>
            </div>

            <div className="filter-group">
              <label>Thứ tự</label>
              <select
                value={sortType}
                onChange={(e) => { setSortType(e.target.value); setPage(1); }}
              >
                <option value="desc">Mới nhất</option>
                <option value="asc">Cũ nhất</option>
              </select>
            </div>
          </div>

          {/* Row 3: Action buttons */}
          <div className="filter-row filter-actions">
            <button className="filter-apply-btn" onClick={handleApplyFilter}>
              <CiSearch /> Tìm kiếm
            </button>
            <button className="filter-clear-btn" onClick={handleClearFilters}>
              <MdClear /> Xóa bộ lọc
            </button>
          </div>
        </div>
      </div>

      {/* RESULT STATS */}
      <div className="filter-result-stats">
        {loading ? (
          <span className="filter-loading-text">Đang tải kết quả...</span>
        ) : (
          <span>
            Tìm thấy <strong>{totalItems.toLocaleString()}</strong> phim
            {keyword && (
              <>
                {" "}cho từ khóa "<em>{keyword}</em>"
              </>
            )}
          </span>
        )}
      </div>

      {/* LOADING SKELETON */}
      {loading && (
        <div className="filter-film-grid">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="filter-film-card skeleton">
              <div className="filter-poster-skeleton" />
            </div>
          ))}
        </div>
      )}

      {/* FILM GRID */}
      {!loading && (
        <>
          <div className={`filter-film-grid ${hoverFilm ? "disable-hover" : ""}`}>
            {results.length === 0 ? (
              <div className="filter-no-result">
                <div className="filter-no-result-icon">🎬</div>
                <h3>Không tìm thấy phim</h3>
                <p>Hãy thử thay đổi bộ lọc hoặc từ khóa tìm kiếm</p>
              </div>
            ) : (
              results.map((film) => (
                <Link
                  to={`/chi-tiet/${film.slug}`}
                  key={film.slug}
                  className="filter-film-card"
                  onMouseEnter={
                    enablePreview ? () => handleMouseEnter(film) : undefined
                  }
                  onMouseLeave={enablePreview ? handleMouseLeave : undefined}
                >
                  <div className="filter-poster-wrapper">
                    <img
                      // Sử dụng đường dẫn full image path đã trích xuất
                      src={getPoster(film.full_image_path || film.poster_url)}
                      alt={film.name}
                      className="filter-poster-img"
                      loading="lazy"
                    />

                    {/* Episode badge */}
                    <span className="filter-episode-badge">
                      {film.episode_total === 1
                        ? "Full"
                        : film.episode_current?.includes("Hoàn Tất")
                        ? film.episode_current
                        : film.episode_current && film.episode_total
                        ? `${film.episode_current}/${film.episode_total}`
                        : film.episode_current || "N/A"}
                    </span>

                    {/* Quality badge */}
                    {film.quality && (
                      <span className="filter-quality-badge">{film.quality}</span>
                    )}

                    {/* Lang badge */}
                    {film.lang && (
                      <span className="filter-lang-badge">{film.lang}</span>
                    )}

                    {/* Overlay info */}
                    <div className="filter-poster-overlay">
                      <h6 className="filter-film-name">{film.name}</h6>
                      <div className="filter-film-meta">
                        {film.year && (
                          <span className="filter-film-year">{film.year}</span>
                        )}
                        {film.origin_name && (
                          <span className="filter-film-origin">
                            {film.origin_name}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>

          {renderPagination()}
        </>
      )}

      {/* HOVER PREVIEW */}
      {enablePreview && hoverFilm && (
        <div className="hover-preview-backdrop">
          <div
            className="hover-preview-card"
            onMouseLeave={() => setHoverFilm(null)}
            ref={previewRef}
            style={{
              // Sử dụng full_image_path cho ảnh nền preview
              backgroundImage: `url(${getPoster(
                hoverFilm.full_image_path || hoverFilm.thumb_url || hoverFilm.poster_url
              )})`,
            }}
          >
            <div className="preview-info">
              <div className="preview-left">
                <h5 className="preview-name">{hoverFilm.name}</h5>
                <div className="preview-origin">{hoverFilm.origin_name}</div>
                <div className="preview-meta">
                  <span className="preview-tag">
                    {hoverFilm.quality || "N/A"}
                  </span>
                  <span className="preview-tag">
                    {hoverFilm.lang || "N/A"}
                  </span>
                </div>
                <div className="preview-actions">
                  <Link
                    to={`/chi-tiet/${hoverFilm.slug}`}
                    className="btn-watch"
                  >
                    ▶ Xem ngay
                  </Link>
                  <Link
                    to={`/chi-tiet/${hoverFilm.slug}`}
                    className="btn-detail"
                  >
                    Chi tiết
                  </Link>
                </div>
              </div>

              <div className="preview-right">
                <div className="preview-box blue">
                  <b>Chất lượng:</b> {hoverFilm.quality || "N/A"}
                </div>
                <div className="preview-box yellow">
                  <b>Số tập:</b> {hoverFilm.episode_current || "N/A"}
                </div>
                <div className="preview-box green">
                  <b>Thời lượng:</b> {hoverFilm.time || "N/A"}
                </div>
                <div className="preview-box blue">
                  <b>Ngôn ngữ:</b> {hoverFilm.lang || "N/A"}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}