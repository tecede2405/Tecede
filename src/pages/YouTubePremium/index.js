import React, { useState, useEffect, useCallback } from "react";
import YouTubeHeader from "./components/YouTubeHeader";
import VideoCard from "./components/VideoCard";
import { 
  fetchTrending, 
  fetchSearch, 
  extractVideoId,
  getWatchHistory, 
  clearWatchHistory, 
  getRecommendationKeywords 
} from "../../services/pipedApi";
import { 
  FaFire, 
  FaUndo, 
  FaExclamationTriangle, 
  FaHistory, 
  FaTrashAlt, 
  FaPlay, 
  FaChevronRight, 
  FaSpinner,
  FaTimes
} from "react-icons/fa";
import { Link } from "react-router-dom";
import { Swiper, SwiperSlide } from "swiper/react";
import { FreeMode, Mousewheel, Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/free-mode";
import "swiper/css/navigation";
import "./style.scss";

const DEFAULT_CHIPS = [
  { label: "Tất cả", query: null },
  { label: "Thịnh hành", query: null },
  { label: "Âm nhạc", query: "nhạc trẻ thịnh hành việt nam" },
  { label: "Gaming", query: "gaming highlight tiếng việt" },
  { label: "Tin tức", query: "tin tức thời sự 24h" },
  { label: "Phim ảnh", query: "review phim tóm tắt phim" },
  { label: "Podcast", query: "vietnam podcast talkshow" },
  { label: "Công nghệ", query: "công nghệ smartphone review" },
  { label: "Hài hước", query: "hài hước tiểu phẩm việt nam" },
  { label: "Thể thao", query: "bóng đá việt nam highlight" }
];

const MORE_EXPLORE_QUERIES = [
  "ẩm thực đường phố việt nam",
  "khám phá du lịch việt nam",
  "khoa học vũ trụ khám phá",
  "nhạc lofi chill học bài",
  "xe và công nghệ review",
  "vlog cuộc sống đời thường"
];

export default function YouTubePremium() {
  const [region, setRegion] = useState(() => {
    return localStorage.getItem("tecede_yt_region") || "VN";
  });
  const [activeChip, setActiveChip] = useState("Tất cả");
  const [chips, setChips] = useState(DEFAULT_CHIPS);
  
  // Videos & pagination state
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  const [pageBatch, setPageBatch] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  // Watch history state
  const [watchHistory, setWatchHistory] = useState([]);
  const [isPersonalized, setIsPersonalized] = useState(false);
  const [showFullHistory, setShowFullHistory] = useState(false);

  // Sync and update watch history & personalized chips
  const refreshHistoryAndChips = useCallback(() => {
    const history = getWatchHistory();
    setWatchHistory(history);

    const recKeywords = getRecommendationKeywords();
    let hiddenKeywords = [];
    try {
      hiddenKeywords = JSON.parse(localStorage.getItem("tecede_yt_hidden_chips") || "[]");
    } catch {}

    const filteredKeywords = (recKeywords || []).filter(
      (kw) => !hiddenKeywords.includes(kw.toLowerCase())
    );

    if (filteredKeywords.length > 0) {
      setIsPersonalized(true);
      const dynamicChips = filteredKeywords.map((kw) => ({
        label: kw,
        query: kw,
        isCustom: true
      }));
      // Merge unique chips
      setChips([
        DEFAULT_CHIPS[0], // "Tất cả"
        DEFAULT_CHIPS[1], // "Thịnh hành"
        ...dynamicChips,
        ...DEFAULT_CHIPS.slice(2)
      ]);
    } else {
      setIsPersonalized(false);
      setChips(DEFAULT_CHIPS);
    }
  }, []);

  // Xóa / ẩn một chip tùy chỉnh khỏi thanh chips
  const handleRemoveCustomChip = (e, chipLabel) => {
    e.stopPropagation();
    try {
      const hidden = JSON.parse(localStorage.getItem("tecede_yt_hidden_chips") || "[]");
      if (!hidden.includes(chipLabel.toLowerCase())) {
        hidden.push(chipLabel.toLowerCase());
        localStorage.setItem("tecede_yt_hidden_chips", JSON.stringify(hidden));
      }
    } catch {}

    // Loại bỏ chip khỏi state hiện tại
    setChips((prev) => prev.filter((c) => c.label !== chipLabel));

    // Nếu chip đang được chọn bị xóa, quay về "Tất cả"
    if (activeChip === chipLabel) {
      setActiveChip("Tất cả");
      loadVideos("Tất cả", region);
    }
  };

  useEffect(() => {
    refreshHistoryAndChips();
  }, [refreshHistoryAndChips]);

  // Handle clearing watch history
  const handleClearHistory = (e) => {
    e.stopPropagation();
    if (window.confirm("Bạn có chắc chắn muốn xóa toàn bộ lịch sử xem gần đây?")) {
      clearWatchHistory();
      refreshHistoryAndChips();
      setShowFullHistory(false);
    }
  };

  /**
   * Tải danh sách video ban đầu (kết hợp Trending + Personalized Recommendations)
   */
  const loadVideos = async (chipLabel = activeChip, reg = region) => {
    setLoading(true);
    setError(null);
    setPageBatch(1);
    setHasMore(true);

    try {
      const selectedChip = chips.find((c) => c.label === chipLabel) || 
                           DEFAULT_CHIPS.find((c) => c.label === chipLabel);

      if (selectedChip && selectedChip.query) {
        // Tải theo từ khóa chip
        const data = await fetchSearch(selectedChip.query, "videos");
        const list = data?.items || (Array.isArray(data) ? data : []);
        setVideos(list);
      } else if (chipLabel === "Thịnh hành") {
        // Chỉ tải trending thuần túy
        const data = await fetchTrending(reg);
        setVideos(Array.isArray(data) ? data : []);
      } else {
        // "Tất cả": Kết hợp Đề xuất cá nhân từ lịch sử xem + Trending để trang chủ dài & phong phú
        const recKeywords = getRecommendationKeywords();
        const promises = [fetchTrending(reg)];

        // Nếu có lịch sử xem, lấy top 2-3 từ khóa/kênh để tìm kiếm đề xuất
        if (recKeywords.length > 0) {
          recKeywords.slice(0, 3).forEach((kw) => {
            promises.push(fetchSearch(kw, "videos"));
          });
        } else {
          // Nếu chưa có lịch sử, fetch thêm một vài chủ đề phổ biến để trang chủ dài ngay từ đầu
          promises.push(fetchSearch("nhạc trẻ hot tiktok", "videos"));
          promises.push(fetchSearch("gaming highlight hay nhất", "videos"));
        }

        const results = await Promise.allSettled(promises);
        const trendingList = results[0]?.status === "fulfilled" && Array.isArray(results[0].value) 
          ? results[0].value 
          : [];

        const recLists = results.slice(1).map((r) => {
          if (r.status === "fulfilled") {
            return r.value?.items || (Array.isArray(r.value) ? r.value : []);
          }
          return [];
        });

        // Hợp nhất và loại bỏ trùng lặp
        const seenIds = new Set();
        const blended = [];

        const addVideo = (v) => {
          if (!v) return;
          const vidId = v.id || extractVideoId(v.url);
          if (vidId && !seenIds.has(vidId)) {
            seenIds.add(vidId);
            blended.push(v);
          }
        };

        // Xen kẽ: 2 video gợi ý cá nhân, 2 video trending
        const maxLen = Math.max(trendingList.length, ...recLists.map((l) => l.length));
        for (let i = 0; i < maxLen; i++) {
          recLists.forEach((list) => {
            if (list[i]) addVideo(list[i]);
          });
          if (trendingList[i]) addVideo(trendingList[i]);
          if (trendingList[i + 1]) addVideo(trendingList[i + 1]);
        }

        setVideos(blended.length > 0 ? blended : trendingList);
      }
    } catch (err) {
      console.error("[YouTubePremium] Lỗi tải video:", err);
      setError("Không thể tải danh sách video từ máy chủ. Hãy thử lại hoặc chuyển máy chủ.");
      setVideos([]);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Tải thêm video (Load more) - Giúp trang chủ dài vô tận theo yêu cầu người dùng
   */
  const handleLoadMore = async () => {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);

    try {
      const nextBatchIndex = pageBatch;
      const queryToLoad = MORE_EXPLORE_QUERIES[nextBatchIndex % MORE_EXPLORE_QUERIES.length];
      
      const data = await fetchSearch(queryToLoad, "videos");
      const newItems = data?.items || (Array.isArray(data) ? data : []);

      if (newItems.length === 0) {
        setHasMore(false);
      } else {
        const seenIds = new Set(videos.map((v) => v.id || extractVideoId(v.url)));
        const uniqueNew = newItems.filter((v) => {
          const id = v.id || extractVideoId(v.url);
          return id && !seenIds.has(id);
        });

        if (uniqueNew.length > 0) {
          setVideos((prev) => [...prev, ...uniqueNew]);
          setPageBatch((prev) => prev + 1);
        } else {
          setPageBatch((prev) => prev + 1);
        }
      }
    } catch (e) {
      console.warn("Lỗi khi tải thêm video:", e);
    } finally {
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    loadVideos(activeChip, region);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [region, activeChip]);

  const handleChipClick = (chip) => {
    setActiveChip(chip.label);
  };

  const handleRegionChange = (newReg) => {
    setRegion(newReg);
    localStorage.setItem("tecede_yt_region", newReg);
  };

  return (
    <div className="yt-page yt-theme-dark">
      <YouTubeHeader currentRegion={region} onRegionChange={handleRegionChange} />

      {/* TOPIC CHIPS BAR - SWIPER SLIDE KÉO THẢ */}
      <div className="yt-chips-container">
        <Swiper
          modules={[FreeMode, Mousewheel]}
          slidesPerView="auto"
          spaceBetween={10}
          freeMode={{
            enabled: true,
            sticky: false,
            momentum: true,
            momentumRatio: 0.8,
            momentumVelocityRatio: 0.8,
          }}
          mousewheel={{ forceToAxis: true }}
          grabCursor={true}
          className="yt-chips-swiper"
        >
          {chips.map((chip, index) => {
            const isActive = activeChip === chip.label;
            return (
              <SwiperSlide 
                key={`${chip.label}-${index}`} 
                className="yt-chip-slide" 
                style={{ width: "auto" }}
              >
                <button
                  type="button"
                  className={`yt-chip ${isActive ? "active" : ""} ${chip.isCustom ? "yt-chip--custom" : ""}`}
                  onClick={() => handleChipClick(chip)}
                >
                  {chip.isCustom && <span className="yt-chip-star">✨</span>}
                  <span className="yt-chip-label">{chip.label}</span>
                  {chip.isCustom && (
                    <span
                      className="yt-chip-remove-btn"
                      onClick={(e) => handleRemoveCustomChip(e, chip.label)}
                      title={`Xóa chủ đề "${chip.label}"`}
                    >
                      <FaTimes />
                    </span>
                  )}
                </button>
              </SwiperSlide>
            );
          })}
        </Swiper>
      </div>

      {/* MAIN CONTENT AREA */}
      <main className="yt-main-content">
        {/* SHELF: ĐÃ XEM GẦN ĐÂY - SWIPER SLIDE KÉO THẢ HOẶC XEM TẤT CẢ FULL LƯỚI */}
        {watchHistory.length > 0 && activeChip === "Tất cả" && (
          <section className="yt-history-shelf">
            <div className="yt-history-shelf__header">
              <div className="yt-history-shelf__title-wrap">
                <FaHistory className="yt-history-icon" />
                <h2 className="yt-history-title">Đã xem gần đây</h2>
                <span className="yt-history-count">({watchHistory.length})</span>
              </div>

              <div className="yt-history-shelf__actions">
                <button
                  type="button"
                  className={`yt-history-view-all-btn ${showFullHistory ? "active" : ""}`}
                  onClick={() => setShowFullHistory(!showFullHistory)}
                  title={showFullHistory ? "Thu gọn về dạng cuộn trượt" : "Xem tất cả lịch sử đã xem"}
                >
                  {showFullHistory ? "Thu gọn" : "Xem tất cả"}
                </button>

                <button 
                  type="button"
                  className="yt-history-clear-btn" 
                  onClick={handleClearHistory}
                  title="Xóa lịch sử xem"
                >
                  <FaTrashAlt className="me-1" /> Xóa lịch sử
                </button>
              </div>
            </div>

            {/* HIỂN THỊ FULL LỊCH SỬ DẠNG LƯỚI KHI CLICK XEM TẤT CẢ */}
            {showFullHistory ? (
              <div className="yt-history-grid">
                {watchHistory.map((item) => (
                  <Link 
                    key={item.id} 
                    to={`/tecede-yt/watch/${item.id}`} 
                    className="yt-history-grid-card"
                  >
                    <div className="yt-history-card__thumb-wrap">
                      <img 
                        src={item.thumbnail} 
                        alt={item.title} 
                        className="yt-history-card__thumb"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = `https://i.ytimg.com/vi/${item.id}/hqdefault.jpg`;
                        }} 
                      />
                      <div className="yt-history-card__play-overlay">
                        <FaPlay />
                      </div>
                    </div>
                    <div className="yt-history-card__info">
                      <h4 className="yt-history-card__title" title={item.title}>
                        {item.title}
                      </h4>
                      <span className="yt-history-card__uploader">{item.uploader}</span>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              /* DẠNG SLIDER SWIPER KÉO THẢ MẶC ĐỊNH */
              <Swiper
                modules={[FreeMode, Mousewheel, Navigation]}
                slidesPerView="auto"
                spaceBetween={14}
                freeMode={{
                  enabled: true,
                  sticky: false,
                  momentum: true,
                }}
                mousewheel={{ forceToAxis: true }}
                grabCursor={true}
                navigation={true}
                className="yt-history-swiper"
              >
                {watchHistory.map((item) => (
                  <SwiperSlide 
                    key={item.id} 
                    className="yt-history-slide" 
                    style={{ width: "auto" }}
                  >
                    <Link 
                      to={`/tecede-yt/watch/${item.id}`} 
                      className="yt-history-card"
                    >
                      <div className="yt-history-card__thumb-wrap">
                        <img 
                          src={item.thumbnail} 
                          alt={item.title} 
                          className="yt-history-card__thumb"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = `https://i.ytimg.com/vi/${item.id}/hqdefault.jpg`;
                          }} 
                        />
                        <div className="yt-history-card__play-overlay">
                          <FaPlay />
                        </div>
                      </div>
                      <div className="yt-history-card__info">
                        <h4 className="yt-history-card__title" title={item.title}>
                          {item.title}
                        </h4>
                        <span className="yt-history-card__uploader">{item.uploader}</span>
                      </div>
                    </Link>
                  </SwiperSlide>
                ))}
              </Swiper>
            )}
          </section>
        )}

        {/* FEED SECTION HEADER */}
        <div className="yt-section-header">
          <div className="yt-section-title-wrap">
            <FaFire className="yt-section-icon" />
            <h1 className="yt-section-title">
              {activeChip === "Tất cả"
                ? (isPersonalized ? "Dành cho bạn & Thịnh hành" : `Video Thịnh Hành (${region === "VN" ? "Việt Nam" : region})`)
                : activeChip === "Thịnh hành"
                ? `Thịnh Hành (${region === "VN" ? "Việt Nam" : region})`
                : `Chủ đề: ${activeChip}`}
            </h1>
            {activeChip === "Tất cả" && isPersonalized && (
              <span className="yt-personalized-badge" title="Đề xuất dựa theo các video bạn đã xem gần đây">
                <span className="sparkle">✨</span> Gợi ý theo sở thích của bạn
              </span>
            )}
          </div>
          <span className="yt-noads-pill">⚡ Không Quảng Cáo</span>
        </div>

        {/* LOADING SKELETON */}
        {loading && (
          <div className="yt-video-grid">
            {Array.from({ length: 16 }).map((_, idx) => (
              <div key={idx} className="yt-card-skeleton">
                <div className="skeleton-thumb" />
                <div className="skeleton-body">
                  <div className="skeleton-avatar" />
                  <div className="skeleton-lines">
                    <div className="skeleton-line line-1" />
                    <div className="skeleton-line line-2" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ERROR STATE */}
        {!loading && error && (
          <div className="yt-error-card">
            <FaExclamationTriangle className="yt-error-icon" />
            <h3>Máy chủ video phản hồi chậm</h3>
            <p>{error}</p>
            <button className="yt-btn-retry" onClick={() => loadVideos()}>
              <FaUndo className="me-2" /> Thử tải lại
            </button>
          </div>
        )}

        {/* EMPTY STATE */}
        {!loading && !error && videos.length === 0 && (
          <div className="yt-empty-card">
            <p>Không có video nào để hiển thị trong khu vực này.</p>
            <button className="yt-btn-retry" onClick={() => loadVideos()}>
              <FaUndo className="me-2" /> Làm mới
            </button>
          </div>
        )}

        {/* VIDEO GRID */}
        {!loading && !error && videos.length > 0 && (
          <>
            <div className="yt-video-grid">
              {videos.map((vid, idx) => (
                <VideoCard key={vid.id || vid.url || idx} video={vid} layout="grid" />
              ))}
            </div>

            {/* LOAD MORE BUTTON SECTION - CHO PHÉP TRANG CHỦ DÀI VÔ TẬN */}
            <div className="yt-loadmore-wrap">
              {hasMore ? (
                <button 
                  className="yt-btn-load-more" 
                  onClick={handleLoadMore} 
                  disabled={loadingMore}
                >
                  {loadingMore ? (
                    <>
                      <FaSpinner className="yt-spin me-2" /> Đang tải thêm video...
                    </>
                  ) : (
                    <>
                      <span>Khám phá thêm video</span>
                      <FaChevronRight className="ms-2" />
                    </>
                  )}
                </button>
              ) : (
                <div className="yt-nomore-hint">
                  Đã tải hết các nội dung đề xuất cho danh mục này.
                </div>
              )}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
