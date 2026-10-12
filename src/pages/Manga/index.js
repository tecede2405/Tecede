import { useEffect, useState, useCallback, useRef } from "react";
import ComicCard from "../../component/MangaCard/index";
import SearchComic from "../../component/SearchComic/index";
import {
  FaFire,
  FaClock,
  FaStar,
  FaBookOpen,
  FaFilter,
  FaChevronLeft,
  FaChevronRight,
  FaImage,
  FaFeatherAlt,
  FaSyncAlt,
  FaCompass,
  FaLayerGroup
} from "react-icons/fa";
import { fetchStories, fetchGenres } from "../../utils/truyenApi";
import "./style.scss";

export default function Manga() {
  // Bộ lọc chính
  const [selectedType, setSelectedType] = useState(""); // "" | "manga" | "novel"
  const [selectedSort, setSelectedSort] = useState("updated_desc"); // updated_desc | views_desc | rating_desc | chapter_desc
  const [selectedStatus, setSelectedStatus] = useState(""); // "" | "ongoing" | "completed"
  const [selectedGenre, setSelectedGenre] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  // Dữ liệu
  const [trendingStories, setTrendingStories] = useState([]);
  const [stories, setStories] = useState([]);
  const [genresList, setGenresList] = useState([]);
  const [meta, setMeta] = useState({ page: 1, perPage: 24, total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [trendingLoading, setTrendingLoading] = useState(true);

  const listRef = useRef(null);

  // 1. Tải danh sách thể loại sạch (1 lần khi mount)
  useEffect(() => {
    fetchGenres().then((data) => setGenresList(data || []));
  }, []);

  // 2. Tải top truyện thịnh hành theo selectedType (mỗi khi đổi loại truyện)
  useEffect(() => {
    setTrendingLoading(true);
    fetchStories({
      type: selectedType,
      sort: "views_desc",
      perPage: 12,
      page: 1
    })
      .then((res) => {
        setTrendingStories(res?.data || []);
      })
      .finally(() => setTrendingLoading(false));
  }, [selectedType]);

  // 3. Tải danh sách truyện theo bộ lọc và phân trang
  const loadStories = useCallback(() => {
    setLoading(true);
    fetchStories({
      type: selectedType,
      sort: selectedSort,
      filter: selectedStatus,
      genres: selectedGenre,
      page: currentPage,
      perPage: 24
    })
      .then((res) => {
        setStories(res?.data || []);
        if (res?.meta) setMeta(res.meta);
      })
      .finally(() => setLoading(false));
  }, [selectedType, selectedSort, selectedStatus, selectedGenre, currentPage]);

  useEffect(() => {
    loadStories();
  }, [loadStories]);

  // Xử lý chuyển trang
  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > meta.totalPages || newPage === currentPage) return;
    setCurrentPage(newPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Reset về trang 1 khi đổi bộ lọc
  const handleTypeChange = (type) => {
    setSelectedType(type);
    setCurrentPage(1);
  };

  const handleSortChange = (sort) => {
    setSelectedSort(sort);
    setCurrentPage(1);
  };

  const handleStatusChange = (status) => {
    setSelectedStatus(status);
    setCurrentPage(1);
  };

  const handleGenreChange = (genre) => {
    setSelectedGenre(genre);
    setCurrentPage(1);
  };

  const handleResetFilters = () => {
    setSelectedType("");
    setSelectedSort("updated_desc");
    setSelectedStatus("");
    setSelectedGenre("");
    setCurrentPage(1);
  };

  return (
    <div className="manga-home">
      {/* 🚀 HERO SECTION */}
      <div className="manga-hero">
        <div className="manga-hero__badge">
          <span className="dot"></span> Kho Truyện Tranh & Truyện Chữ Không Giới Hạn
        </div>
        <h1 className="manga-hero__title">Tecede - Thế Giới Truyện</h1>

        {/* Thanh tìm kiếm */}
        <div className="manga-hero__search-wrap">
          <SearchComic />
        </div>

        {/* Quick Type Selection Pills */}
        <div className="manga-type-pills-wrap">
          <div className="manga-type-pills" role="tablist" aria-label="Chọn định dạng truyện">
            <button
              role="tab"
              aria-selected={selectedType === ""}
              className={`type-pill ${selectedType === "" ? "active" : ""}`}
              onClick={() => handleTypeChange("")}
            >
              <FaBookOpen className="type-pill__icon" />
              <span>Tất Cả</span>
            </button>
            <button
              role="tab"
              aria-selected={selectedType === "manga"}
              className={`type-pill manga ${selectedType === "manga" ? "active" : ""}`}
              onClick={() => handleTypeChange("manga")}
            >
              <FaImage className="type-pill__icon" />
              <span>Truyện Tranh</span>
            </button>
            <button
              role="tab"
              aria-selected={selectedType === "novel"}
              className={`type-pill novel ${selectedType === "novel" ? "active" : ""}`}
              onClick={() => handleTypeChange("novel")}
            >
              <FaFeatherAlt className="type-pill__icon" />
              <span>Truyện Chữ</span>
            </button>
          </div>
        </div>
      </div>

      <div className="manga-sections container-fluid p-0">
        {/* 🔥 SECTION TOP THỊNH HÀNH (ĐỌC NHIỀU) */}
        {currentPage === 1 && !selectedGenre && (
          <div className="manga-block manga-block--trending">
            <div className="manga-block__header">
              <h3 className="manga-block__title">
                <FaFire className="text-danger" />{" "}
                <span>
                  {selectedType === "manga"
                    ? "Truyện Tranh Thịnh Hành"
                    : selectedType === "novel"
                    ? "Truyện Chữ Thịnh Hành"
                    : "Truyện Thịnh Hành & Đọc Nhiều"}
                </span>
              </h3>
              <span className="manga-block__sub">
                {selectedType === "manga"
                  ? "Top truyện tranh & comic được đọc nhiều nhất"
                  : selectedType === "novel"
                  ? "Top tiểu thuyết & truyện chữ được đọc nhiều nhất"
                  : "Top những tác phẩm được yêu thích nhất"}
              </span>
            </div>

            {trendingLoading ? (
              <div className="comicList">
                {Array.from({ length: 6 }).map((_, idx) => (
                  <div key={idx} className="manga-card skeleton">
                    <div className="skeleton-box manga-card__thumb"></div>
                    <div className="manga-card__info">
                      <div className="skeleton-line title"></div>
                      <div className="skeleton-line small"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : trendingStories.length > 0 ? (
              <div className="comicList">
                {trendingStories.slice(0, 12).map((item) => (
                  <ComicCard key={item.id || item.slug} comic={item} />
                ))}
              </div>
            ) : null}
          </div>
        )}

        {/* 🎛️ BỘ LỌC TOÀN DIỆN & DANH SÁCH KHÁM PHÁ */}
        <div className="manga-block" ref={listRef}>
          <div className="manga-block__header d-flex flex-wrap align-items-center justify-content-between gap-3 mb-3">
            <h3 className="manga-block__title mb-0">
              <FaCompass className="text-primary" />{" "}
              <span>
                {selectedType === "manga"
                  ? "Khám Phá Truyện Tranh"
                  : selectedType === "novel"
                  ? "Khám Phá Truyện Chữ"
                  : "Khám Phá Truyện"}
              </span>
              {meta.total > 0 && (
                <span className="manga-count-badge">({meta.total.toLocaleString()} bộ)</span>
              )}
            </h3>

            {(selectedType || selectedGenre || selectedStatus || selectedSort !== "updated_desc") && (
              <button className="btn-reset-filters" onClick={handleResetFilters}>
                <FaSyncAlt className="me-1" /> Đặt lại bộ lọc
              </button>
            )}
          </div>

          {/* Filter Bar Controls */}
          <div className="manga-filter-bar">
            {/* 1. Định dạng truyện */}
            <div className="filter-group">
              <label className="filter-label">
                <FaLayerGroup className="me-1" /> Định dạng:
              </label>
              <div className="filter-pills">
                <button
                  className={`filter-btn ${selectedType === "" ? "active" : ""}`}
                  onClick={() => handleTypeChange("")}
                >
                  Tất cả
                </button>
                <button
                  className={`filter-btn manga ${selectedType === "manga" ? "active" : ""}`}
                  onClick={() => handleTypeChange("manga")}
                >
                  <FaImage className="me-1" /> Truyện tranh
                </button>
                <button
                  className={`filter-btn novel ${selectedType === "novel" ? "active" : ""}`}
                  onClick={() => handleTypeChange("novel")}
                >
                  <FaFeatherAlt className="me-1" /> Truyện chữ
                </button>
              </div>
            </div>

            {/* 2. Sắp xếp */}
            <div className="filter-group">
              <label className="filter-label">
                <FaFilter className="me-1" /> Sắp xếp:
              </label>
              <div className="filter-pills">
                <button
                  className={`filter-btn ${selectedSort === "updated_desc" ? "active" : ""}`}
                  onClick={() => handleSortChange("updated_desc")}
                >
                  <FaClock className="me-1" /> Mới cập nhật
                </button>
                <button
                  className={`filter-btn ${selectedSort === "views_desc" ? "active" : ""}`}
                  onClick={() => handleSortChange("views_desc")}
                >
                  <FaFire className="me-1" /> Đọc nhiều
                </button>
                <button
                  className={`filter-btn ${selectedSort === "rating_desc" ? "active" : ""}`}
                  onClick={() => handleSortChange("rating_desc")}
                >
                  <FaStar className="me-1" /> Đánh giá cao
                </button>
                <button
                  className={`filter-btn ${selectedSort === "chapter_desc" ? "active" : ""}`}
                  onClick={() => handleSortChange("chapter_desc")}
                >
                  <FaBookOpen className="me-1" /> Nhiều chương
                </button>
              </div>
            </div>

            {/* 2. Trạng thái & Thể loại */}
            <div className="filter-group-row d-flex flex-wrap gap-2 align-items-center">
              {/* Trạng thái */}
              <div className="filter-dropdown-wrap">
                <select
                  value={selectedStatus}
                  onChange={(e) => handleStatusChange(e.target.value)}
                  className="filter-select"
                >
                  <option value="">Trạng thái: Tất cả</option>
                  <option value="ongoing">Đang phát hành</option>
                  <option value="completed">Đã hoàn thành</option>
                </select>
              </div>

              {/* Thể loại */}
              {genresList.length > 0 && (
                <div className="filter-dropdown-wrap">
                  <select
                    value={selectedGenre}
                    onChange={(e) => handleGenreChange(e.target.value)}
                    className="filter-select"
                  >
                    <option value="">Thể loại: Tất cả</option>
                    {genresList.map((g) => (
                      <option key={g.slug} value={g.slug}>
                        {g.name} {g.count ? `(${g.count})` : ""}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          </div>

          {/* Grid danh sách truyện */}
          {loading ? (
            <div className="comicList">
              {Array.from({ length: 18 }).map((_, idx) => (
                <div key={idx} className="manga-card skeleton">
                  <div className="skeleton-box manga-card__thumb"></div>
                  <div className="manga-card__info">
                    <div className="skeleton-line title"></div>
                    <div className="skeleton-line small"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : stories.length > 0 ? (
            <div className="comicList">
              {stories.map((item) => (
                <ComicCard key={item.id || item.slug} comic={item} />
              ))}
            </div>
          ) : (
            <div className="manga-empty-state">
              <FaBookOpen className="empty-icon" />
              <h4>Không tìm thấy bộ truyện nào</h4>
              <p>Hãy thử thay đổi bộ lọc hoặc tìm kiếm với từ khóa khác nhé.</p>
              <button className="btn-empty-reset" onClick={handleResetFilters}>
                Xem tất cả truyện
              </button>
            </div>
          )}

          {/* Phân trang (Pagination) */}
          {meta.totalPages > 1 && (
            <div className="manga-pagination">
              <button
                className="page-btn prev"
                disabled={currentPage <= 1}
                onClick={() => handlePageChange(currentPage - 1)}
                title="Trang trước"
              >
                <FaChevronLeft />
              </button>

              <div className="page-numbers">
                {/* Trang đầu */}
                {currentPage > 3 && (
                  <>
                    <button className="page-btn" onClick={() => handlePageChange(1)}>
                      1
                    </button>
                    {currentPage > 4 && <span className="page-dots">...</span>}
                  </>
                )}

                {/* Các trang lân cận */}
                {Array.from({ length: 5 }, (_, i) => currentPage - 2 + i)
                  .filter((p) => p >= 1 && p <= meta.totalPages)
                  .map((p) => (
                    <button
                      key={p}
                      className={`page-btn ${p === currentPage ? "active" : ""}`}
                      onClick={() => handlePageChange(p)}
                    >
                      {p}
                    </button>
                  ))}

                {/* Trang cuối */}
                {currentPage < meta.totalPages - 2 && (
                  <>
                    {currentPage < meta.totalPages - 3 && <span className="page-dots">...</span>}
                    <button className="page-btn" onClick={() => handlePageChange(meta.totalPages)}>
                      {meta.totalPages}
                    </button>
                  </>
                )}
              </div>

              <button
                className="page-btn next"
                disabled={currentPage >= meta.totalPages}
                onClick={() => handlePageChange(currentPage + 1)}
                title="Trang sau"
              >
                <FaChevronRight />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}