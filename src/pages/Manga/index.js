import { useEffect, useState, useCallback, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Swiper, SwiperSlide } from "swiper/react";
import { FreeMode } from "swiper/modules";
import "swiper/css";
import "swiper/css/free-mode";
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
  FaLayerGroup,
  FaHistory,
  FaTrashAlt,
  FaPlayCircle,
  FaTimes
} from "react-icons/fa";
import { fetchStories, fetchGenres, getCoverUrl } from "../../utils/truyenApi";
import "./style.scss";

// Hàm hiển thị thời gian tương đối
const formatTimeAgo = (timestamp) => {
  if (!timestamp) return "";
  const diffMs = Date.now() - Number(timestamp);
  if (diffMs < 0) return "Vừa xong";
  const diffSec = Math.floor(diffMs / 1000);
  if (diffSec < 60) return "Vừa xong";
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin} phút trước`;
  const diffHour = Math.floor(diffMin / 60);
  if (diffHour < 24) return `${diffHour} giờ trước`;
  const diffDay = Math.floor(diffHour / 24);
  if (diffDay < 30) return `${diffDay} ngày trước`;
  const diffMonth = Math.floor(diffDay / 30);
  if (diffMonth < 12) return `${diffMonth} tháng trước`;
  return `${Math.floor(diffMonth / 12)} năm trước`;
};

export default function Manga() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // Đọc các bộ lọc trực tiếp từ URL query parameters
  const selectedType = searchParams.get("type") || ""; // "" | "manga" | "novel" | "history"
  const selectedSort = searchParams.get("sort") || "updated_desc"; // updated_desc | views_desc | rating_desc | chapter_desc
  const selectedStatus = searchParams.get("status") || ""; // "" | "ongoing" | "completed"
  const selectedGenre = searchParams.get("genre") || "";
  const currentPage = parseInt(searchParams.get("page") || "1", 10) || 1;

  // Cập nhật bộ lọc lên URL query params (giúp lưu trạng thái trang khi xem chi tiết/đọc truyện rồi quay lại)
  const updateFilters = useCallback(
    (newParams) => {
      const current = Object.fromEntries(searchParams.entries());
      const next = { ...current, ...newParams };

      // Làm sạch các giá trị rỗng hoặc giá trị mặc định để URL ngắn gọn, sạch sẽ
      Object.keys(next).forEach((key) => {
        if (
          !next[key] ||
          (key === "sort" && next[key] === "updated_desc") ||
          (key === "page" && Number(next[key]) === 1)
        ) {
          delete next[key];
        }
      });

      setSearchParams(next);
    },
    [searchParams, setSearchParams]
  );

  // Lịch sử đọc truyện từ localStorage
  const [readingHistory, setReadingHistory] = useState([]);
  const [showAllHistory, setShowAllHistory] = useState(false);

  // Dữ liệu
  const [trendingStories, setTrendingStories] = useState([]);
  const [stories, setStories] = useState([]);
  const [genresList, setGenresList] = useState([]);
  const [meta, setMeta] = useState({ page: 1, perPage: 24, total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [trendingLoading, setTrendingLoading] = useState(true);

  const listRef = useRef(null);
  const historySwiperRef = useRef(null);
  const homeHistorySwiperRef = useRef(null);

  // Lưu URL danh sách truyện hiện tại (kèm toàn bộ query bộ lọc & trang) để khi ở chi tiết quay lại đúng vị trí
  useEffect(() => {
    try {
      const currentUrl = window.location.pathname + window.location.search;
      sessionStorage.setItem("lastMangaListUrl", currentUrl);
    } catch (e) {}
  }, [searchParams]);

  // Tải danh sách thể loại sạch (1 lần khi mount)
  useEffect(() => {
    fetchGenres().then((data) => setGenresList(data || []));
  }, []);

  // Tải lịch sử đọc từ localStorage
  const loadHistory = useCallback(() => {
    try {
      const data = JSON.parse(localStorage.getItem("readingHistory")) || [];
      if (Array.isArray(data)) {
        setReadingHistory(data);
      }
    } catch (e) {
      console.warn("Lỗi đọc readingHistory:", e);
      setReadingHistory([]);
    }
  }, []);

  useEffect(() => {
    loadHistory();
    const handleStorage = (e) => {
      if (e.key === "readingHistory") loadHistory();
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, [loadHistory]);

  const handleRemoveHistoryItem = (e, slug) => {
    e.stopPropagation();
    try {
      const updated = readingHistory.filter((item) => item.slug !== slug);
      localStorage.setItem("readingHistory", JSON.stringify(updated));
      setReadingHistory(updated);
    } catch (err) {
      console.warn("Lỗi xoá mục lịch sử:", err);
    }
  };

  const handleClearHistory = () => {
    if (window.confirm("Bạn có chắc chắn muốn xoá toàn bộ lịch sử đọc truyện không?")) {
      try {
        localStorage.removeItem("readingHistory");
        setReadingHistory([]);
      } catch (err) {
        console.warn("Lỗi xoá lịch sử:", err);
      }
    }
  };

  // 2. Tải top truyện thịnh hành theo selectedType (mỗi khi đổi loại truyện)
  useEffect(() => {
    if (selectedType === "history") return;
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
    if (selectedType === "history") return;
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
    updateFilters({ page: newPage });
    if (listRef.current) {
      listRef.current.scrollIntoView({ behavior: "smooth" });
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  // Reset về trang 1 khi đổi bộ lọc
  const handleTypeChange = (type) => {
    updateFilters({ type, page: 1 });
    setShowAllHistory(false);
  };

  const handleSortChange = (sort) => {
    updateFilters({ sort, page: 1 });
  };

  const handleStatusChange = (status) => {
    updateFilters({ status, page: 1 });
  };

  const handleGenreChange = (genre) => {
    updateFilters({ genre, page: 1 });
  };

  const handleResetFilters = () => {
    setSearchParams({});
    setShowAllHistory(false);
  };

  // Render thẻ truyện trong lịch sử đọc
  const renderHistoryCard = (item, idx) => {
    const targetUrl =
      item.chapterSlug || item.chapterId
        ? `/truyen/doc/${item.slug}/${item.chapterSlug || item.chapterId}`
        : `/truyen/chi-tiet/${item.slug}`;

    return (
      <div
        key={item.slug || idx}
        className="manga-card manga-card--history"
        onClick={() => navigate(targetUrl)}
        title={`${item.comicName} - ${item.chapterText || "Đang đọc"}`}
      >
        <div className="manga-card__thumb">
          <img
            src={getCoverUrl(item.thumb)}
            alt={item.comicName}
            loading="lazy"
            draggable="false"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src =
                "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=500&auto=format&fit=crop&q=60";
            }}
          />
          <div className="manga-card__overlay">
            <FaPlayCircle className="read-icon" />
          </div>

          {/* Nút xoá khỏi lịch sử */}
          <button
            className="manga-card__delete-btn"
            title="Xoá khỏi lịch sử"
            onClick={(e) => handleRemoveHistoryItem(e, item.slug)}
          >
            <FaTimes />
          </button>

          {/* Badge Chương đang đọc */}
          <span className="manga-badge manga-badge--chapter">
            {item.chapterText || (item.chapter ? `Chương ${item.chapter}` : "Đang đọc")}
          </span>
        </div>

        <div className="manga-card__info">
          <h4 className="manga-title">{item.comicName}</h4>
          <div className="manga-meta">
            <span className="manga-history-time">
              <FaClock className="me-1" />
              {formatTimeAgo(item.time)}
            </span>
            <span className="manga-history-action text-primary">
              Đọc tiếp &rarr;
            </span>
          </div>
        </div>
      </div>
    );
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
            <button
              role="tab"
              aria-selected={selectedType === "history"}
              className={`type-pill history ${selectedType === "history" ? "active" : ""}`}
              onClick={() => handleTypeChange("history")}
            >
              <FaHistory className="type-pill__icon" />
              <span>Lịch Sử</span>
              {readingHistory.length > 0 && (
                <span className="type-pill__badge">{readingHistory.length}</span>
              )}
            </button>
          </div>
        </div>
      </div>

      <div className="manga-sections container-fluid p-0">
        {/* 🎛️ BỘ LỌC TOÀN DIỆN (ĐẶT NGAY TRÊN TAB LỊCH SỬ) */}
        <div className="manga-filter-bar mb-4">
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
              <button
                className={`filter-btn history ${selectedType === "history" ? "active" : ""}`}
                onClick={() => handleTypeChange("history")}
              >
                <FaHistory className="me-1 text-warning" /> Lịch sử
                {readingHistory.length > 0 && (
                  <span className="type-pill__badge ms-1">{readingHistory.length}</span>
                )}
              </button>
            </div>
          </div>

          {/* 2. Sắp xếp */}
          {selectedType !== "history" && (
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
          )}

          {/* 3. Trạng thái & Thể loại */}
          {selectedType !== "history" && (
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

              {(selectedType || selectedGenre || selectedStatus || selectedSort !== "updated_desc") && (
                <button className="btn-reset-filters ms-auto" onClick={handleResetFilters} title="Đặt lại bộ lọc">
                  <FaSyncAlt className="me-1" /> Đặt lại
                </button>
              )}
            </div>
          )}
        </div>

        {selectedType === "history" ? (
          /* 🕒 TAB LỊCH SỬ ĐỌC TRUYỆN (KIỂU SWIPER KÉO NGANG 1 HÀNG) */
          <div className="manga-block manga-block--history-tab">
            <div className="manga-block__header d-flex flex-wrap align-items-center justify-content-between gap-3 mb-3">
              <div>
                <h3 className="manga-block__title mb-1">
                  <FaHistory className="text-warning" />{" "}
                  <span>Lịch Sử Đọc Truyện</span>
                  {readingHistory.length > 0 && (
                    <span className="manga-count-badge">
                      ({readingHistory.length} bộ)
                    </span>
                  )}
                </h3>
                <span className="manga-block__sub">
                  Kéo ngang để xem lại các bộ truyện bạn đã đọc gần đây
                </span>
              </div>

              {readingHistory.length > 0 && (
                <div className="manga-block__actions d-flex align-items-center gap-2">
                  {readingHistory.length > 8 && (
                    <button
                      className="btn-view-all-link"
                      onClick={() => setShowAllHistory(!showAllHistory)}
                    >
                      {showAllHistory
                        ? "Thu gọn (8 bộ)"
                        : `Xem tất cả (${readingHistory.length})`}
                    </button>
                  )}
                  <button
                    className="btn-clear-history"
                    onClick={handleClearHistory}
                    title="Xoá toàn bộ lịch sử"
                  >
                    <FaTrashAlt className="me-1" /> Xoá lịch sử
                  </button>
                </div>
              )}
            </div>

            {readingHistory.length > 0 ? (
              <div className="manga-history-swiper-wrap">
                <button
                  className="swiper-nav-btn swiper-nav-btn--prev"
                  onClick={() => historySwiperRef.current?.slidePrev()}
                  aria-label="Cuộn sang trái"
                >
                  <FaChevronLeft />
                </button>

                <Swiper
                  onSwiper={(swiper) => {
                    historySwiperRef.current = swiper;
                  }}
                  modules={[FreeMode]}
                  freeMode={true}
                  slidesPerView="auto"
                  spaceBetween={12}
                  grabCursor={true}
                  className="manga-history-swiper-component"
                >
                  {(showAllHistory
                    ? readingHistory
                    : readingHistory.slice(0, 8)
                  ).map((item, idx) => (
                    <SwiperSlide key={item.slug || idx}>
                      {renderHistoryCard(item, idx)}
                    </SwiperSlide>
                  ))}

                  {/* Thẻ xem tất cả ở cuối swiper nếu chưa mở rộng */}
                  {!showAllHistory && readingHistory.length > 8 && (
                    <SwiperSlide key="see-all-history">
                      <div
                        className="manga-card manga-card--history manga-card--history-more"
                        onClick={() => setShowAllHistory(true)}
                        title="Xem tất cả lịch sử"
                      >
                        <div className="history-more-content">
                          <div className="history-more-icon-wrap">
                            <FaChevronRight />
                          </div>
                          <span className="history-more-title">Xem tất cả</span>
                          <span className="history-more-sub">
                            +{readingHistory.length - 8} bộ nữa
                          </span>
                        </div>
                      </div>
                    </SwiperSlide>
                  )}
                </Swiper>

                <button
                  className="swiper-nav-btn swiper-nav-btn--next"
                  onClick={() => historySwiperRef.current?.slideNext()}
                  aria-label="Cuộn sang phải"
                >
                  <FaChevronRight />
                </button>
              </div>
            ) : (
              <div className="manga-empty-state">
                <FaHistory className="empty-icon text-warning" />
                <h4>Chưa có lịch sử đọc truyện</h4>
                <p>
                  Bạn chưa đọc bộ truyện nào. Hãy khám phá và chọn một bộ truyện tranh hoặc truyện chữ để bắt đầu nhé!
                </p>
                <button
                  className="btn-empty-reset"
                  onClick={() => handleTypeChange("")}
                >
                  Khám phá truyện ngay
                </button>
              </div>
            )}
          </div>
        ) : (
          <>
            {/* 🕒 SECTION LỊCH SỬ ĐỌC GẦN ĐÂY TRÊN TRANG CHỦ (SWIPER 1 HÀNG) */}
            {currentPage === 1 && !selectedGenre && readingHistory.length > 0 && (
              <div className="manga-block manga-block--history">
                <div className="manga-block__header d-flex flex-wrap align-items-center justify-content-between gap-3 mb-3">
                  <div>
                    <h3 className="manga-block__title mb-1">
                      <FaHistory className="text-warning" />{" "}
                      <span>Lịch Sử Đọc Gần Đây</span>
                      <span className="manga-count-badge">
                        ({readingHistory.length} bộ)
                      </span>
                    </h3>
                    <span className="manga-block__sub">
                      Kéo ngang để tiếp tục những bộ truyện đang đọc dở
                    </span>
                  </div>

                  {readingHistory.length > 8 && (
                    <div className="manga-block__actions">
                      <button
                        className="btn-view-all-link"
                        onClick={() => {
                          handleTypeChange("history");
                          setShowAllHistory(true);
                        }}
                      >
                        Xem tất cả ({readingHistory.length}) &rarr;
                      </button>
                    </div>
                  )}
                </div>

                <div className="manga-history-swiper-wrap">
                  <button
                    className="swiper-nav-btn swiper-nav-btn--prev"
                    onClick={() => homeHistorySwiperRef.current?.slidePrev()}
                    aria-label="Cuộn sang trái"
                  >
                    <FaChevronLeft />
                  </button>

                  <Swiper
                    onSwiper={(swiper) => {
                      homeHistorySwiperRef.current = swiper;
                    }}
                    modules={[FreeMode]}
                    freeMode={true}
                    slidesPerView="auto"
                    spaceBetween={12}
                    grabCursor={true}
                    className="manga-history-swiper-component"
                  >
                    {readingHistory.slice(0, 8).map((item, idx) => (
                      <SwiperSlide key={item.slug || idx}>
                        {renderHistoryCard(item, idx)}
                      </SwiperSlide>
                    ))}

                    {readingHistory.length > 8 && (
                      <SwiperSlide key="see-all-home">
                        <div
                          className="manga-card manga-card--history manga-card--history-more"
                          onClick={() => {
                            handleTypeChange("history");
                            setShowAllHistory(true);
                          }}
                          title="Xem tất cả lịch sử"
                        >
                          <div className="history-more-content">
                            <div className="history-more-icon-wrap">
                              <FaChevronRight />
                            </div>
                            <span className="history-more-title">Xem tất cả</span>
                            <span className="history-more-sub">
                              +{readingHistory.length - 8} bộ nữa
                            </span>
                          </div>
                        </div>
                      </SwiperSlide>
                    )}
                  </Swiper>

                  <button
                    className="swiper-nav-btn swiper-nav-btn--next"
                    onClick={() => homeHistorySwiperRef.current?.slideNext()}
                    aria-label="Cuộn sang phải"
                  >
                    <FaChevronRight />
                  </button>
                </div>
              </div>
            )}

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
      </>
    )}
  </div>
</div>
  );
}