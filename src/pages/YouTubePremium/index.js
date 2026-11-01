import React, { useState, useEffect, useCallback } from "react";
import YouTubeHeader from "./components/YouTubeHeader";
import YouTubeSidebar from "./components/YouTubeSidebar";
import YouTubeHistoryView from "./components/YouTubeHistoryView";
import VideoCard from "./components/VideoCard";
import { 
  fetchTrending, 
  fetchSearch, 
  extractVideoId,
  getWatchHistory as getLocalWatchHistory, 
  getRecommendationKeywords 
} from "../../services/pipedApi";
import {
  getYoutubeHiddenChips,
  hideYoutubeChip,
  getYoutubeActiveChips
} from "../../services/youtubeHistoryApi";
import { 
  FaFire, 
  FaUndo, 
  FaExclamationTriangle, 
  FaChevronRight, 
  FaSpinner,
  FaTimes,
  FaSyncAlt
} from "react-icons/fa";
import { useLocation, useSearchParams } from "react-router-dom";
import { Swiper, SwiperSlide } from "swiper/react";
import { FreeMode, Mousewheel } from "swiper/modules";
import { useAuth } from "../../context/AuthContext";
import { useTecedeYtPlayer } from "../../context/TecedeYtPlayerContext";
import "swiper/css";
import "swiper/css/free-mode";
import "./style.scss";

const DEFAULT_CHIPS = [
  { 
    label: "Tất cả", 
    query: null 
  },
  { 
    label: "Thịnh hành", 
    query: null 
  },
  { 
    label: "Âm nhạc", 
    query: "nhạc trẻ thịnh hành việt nam",
    variants: ["nhạc trẻ thịnh hành việt nam", "nhạc remix tiktok mới nhất", "bxh nhạc việt triệu view", "acoustic cover việt nam"]
  },
  { 
    label: "Gaming", 
    query: "gaming highlight tiếng việt",
    variants: ["gaming highlight tiếng việt", "liên quân highlight đỉnh cao", "gameplay việt nam hay nhất", "streamer highlight hài hước"]
  },
  { 
    label: "Tin tức", 
    query: "tin tức thời sự 24h",
    variants: ["tin tức thời sự 24h mới nhất", "chuyển động 24h hôm nay", "bản tin thời sự việt nam"]
  },
  { 
    label: "Phim ảnh", 
    query: "review phim tóm tắt phim",
    variants: ["review phim tóm tắt phim", "tóm tắt phim chiếu rạp", "review phim kinh dị hay"]
  },
  { 
    label: "Podcast", 
    query: "vietnam podcast talkshow",
    variants: ["vietnam podcast talkshow", "podcast cuộc sống hay", "talkshow người nổi tiếng việt nam"]
  },
  { 
    label: "Công nghệ", 
    query: "công nghệ smartphone review",
    variants: ["công nghệ smartphone review", "đánh giá điện thoại mới", "mẹo công nghệ máy tính smartphone"]
  },
  { 
    label: "Hài hước", 
    query: "hài hước tiểu phẩm việt nam",
    variants: ["hài hước tiểu phẩm việt nam", "hài hước tiktok triệu view", "tiểu phẩm hài chọn lọc"]
  },
  { 
    label: "Thể thao", 
    query: "bóng đá việt nam highlight",
    variants: ["bóng đá việt nam highlight", "highlight bóng đá ngoại hạng anh", "thể thao tổng hợp 24h"]
  }
];

const MORE_EXPLORE_QUERIES = [
  "ẩm thực đường phố việt nam",
  "khám phá du lịch việt nam",
  "khoa học vũ trụ khám phá",
  "nhạc lofi chill học bài",
  "xe và công nghệ review",
  "vlog cuộc sống đời thường",
  "mẹo vặt cuộc sống hữu ích",
  "nấu ăn gia đình ngon mỗi ngày"
];

const shuffleArray = (arr) => {
  if (!Array.isArray(arr) || arr.length <= 1) return arr;
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
};

export default function YouTubePremium({ initialView = "feed" }) {
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useAuth();
  const { isSidebarCollapsed } = useTecedeYtPlayer();

  // Xác định view hiển thị: "feed" (trang chủ video) hoặc "history" (lịch sử xem)
  const isHistoryRoute = location.pathname === "/tecede-yt/history" || searchParams.get("view") === "history" || initialView === "history";
  const [currentView, setCurrentView] = useState(isHistoryRoute ? "history" : "feed");

  useEffect(() => {
    if (location.pathname === "/tecede-yt/history" || searchParams.get("view") === "history") {
      setCurrentView("history");
    } else {
      setCurrentView("feed");
    }
  }, [location.pathname, searchParams]);

  const [region, setRegion] = useState(() => {
    return localStorage.getItem("tecede_yt_region") || "VN";
  });

  const chipParam = searchParams.get("chip");
  const [activeChip, setActiveChip] = useState(chipParam || "Tất cả");
  const [chips, setChips] = useState(DEFAULT_CHIPS);
  
  // Videos & pagination state
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  const [pageBatch, setPageBatch] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const [isPersonalized, setIsPersonalized] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Lấy tối đa 5 chip gợi ý FIFO từ Cloudflare D1 và đồng bộ chip đã ẩn
  const refreshHistoryAndChips = useCallback(async () => {
    // 1. Đồng bộ danh sách chip đã ẩn từ Cloudflare D1
    let hiddenKeywords = [];
    if (user?.token) {
      try {
        const chipsRes = await getYoutubeHiddenChips(user.token);
        if (chipsRes?.success && Array.isArray(chipsRes.data)) {
          hiddenKeywords = chipsRes.data
            .filter((k) => typeof k === "string" && k.trim().length > 0)
            .map((k) => k.trim());
          try {
            localStorage.setItem("tecede_yt_hidden_chips", JSON.stringify(hiddenKeywords));
          } catch {}
        }
      } catch (err) {
        console.warn("Lỗi tải hidden chips D1:", err);
      }
    }

    if (hiddenKeywords.length === 0) {
      try {
        const rawLocal = JSON.parse(localStorage.getItem("tecede_yt_hidden_chips") || "[]");
        if (Array.isArray(rawLocal)) {
          hiddenKeywords = rawLocal
            .filter((k) => typeof k === "string" && k.trim().length > 0)
            .map((k) => k.trim());
        }
      } catch {}
    }

    const hiddenSet = new Set(
      hiddenKeywords.map((k) => k.toLowerCase())
    );

    // 2. Lấy tối đa 5 chip gợi ý FIFO từ Cloudflare D1 (GET /youtube/chips/active)
    let activeChipsList = [];
    if (user?.token) {
      try {
        const activeRes = await getYoutubeActiveChips(user.token);
        if (activeRes?.success && Array.isArray(activeRes.data) && activeRes.data.length > 0) {
          activeChipsList = activeRes.data;
        }
      } catch (err) {
        console.warn("Lỗi tải active chips D1:", err);
      }
    }

    // Nếu chưa có trên D1 hoặc chưa đăng nhập -> Dùng từ khóa trích xuất từ lịch sử cục bộ
    if (activeChipsList.length === 0) {
      activeChipsList = getRecommendationKeywords(getLocalWatchHistory());
    }

    const validKeywords = (activeChipsList || []).filter((kw) => {
      if (typeof kw !== "string") return false;
      const clean = kw.trim();
      if (clean.length < 2) return false;
      return !hiddenSet.has(clean.toLowerCase());
    }).slice(0, 5); // Tối đa 5 chip gợi ý FIFO

    let dynamicChips = [];
    if (validKeywords.length > 0) {
      setIsPersonalized(true);
      dynamicChips = validKeywords.map((kw) => ({
        label: kw.trim(),
        query: kw.trim(),
        isCustom: true
      }));
    } else {
      setIsPersonalized(false);
    }

    const nextChips = [
      DEFAULT_CHIPS[0], // "Tất cả"
      DEFAULT_CHIPS[1], // "Thịnh hành"
      ...dynamicChips,
      ...DEFAULT_CHIPS.slice(2)
    ];
    setChips(nextChips);
    return nextChips;
  }, [user]);

  // Xóa / ẩn một chip tùy chỉnh khỏi thanh chips (đồng bộ D1 Database)
  const handleRemoveCustomChip = (e, chipLabel) => {
    e.stopPropagation();
    const cleanLabel = typeof chipLabel === "string" ? chipLabel.trim() : "";
    if (!cleanLabel) return;

    // 1. Lưu tạm vào localStorage
    try {
      const hidden = JSON.parse(localStorage.getItem("tecede_yt_hidden_chips") || "[]");
      const cleanHidden = Array.isArray(hidden)
        ? hidden.filter((k) => typeof k === "string" && k.trim().length > 0)
        : [];
      if (!cleanHidden.some((k) => k.toLowerCase() === cleanLabel.toLowerCase())) {
        cleanHidden.push(cleanLabel);
        localStorage.setItem("tecede_yt_hidden_chips", JSON.stringify(cleanHidden));
      }
    } catch {}

    // 2. Đồng bộ trực tiếp lên Cloudflare D1 Backend nếu đã đăng nhập
    if (user?.token) {
      hideYoutubeChip(user.token, cleanLabel).catch((err) => {
        console.warn("Lỗi đồng bộ ẩn chip lên D1:", err);
      });
    }

    // 3. Cập nhật UI ngay lập tức
    setChips((prev) => prev.filter((c) => (c.label || "").trim().toLowerCase() !== cleanLabel.toLowerCase()));

    if ((activeChip || "").trim().toLowerCase() === cleanLabel.toLowerCase()) {
      setActiveChip("Tất cả");
      loadVideos("Tất cả", region);
    }
  };

  useEffect(() => {
    refreshHistoryAndChips();
  }, [refreshHistoryAndChips]);

  /**
   * Tải danh sách video ban đầu (Trending + Personalized Recommendations)
   */
  const loadVideos = async (chipLabel = activeChip, reg = region, currentChips = null, isRefresh = false) => {
    setLoading(true);
    setError(null);
    setPageBatch(1);
    setHasMore(true);

    try {
      const activeChipsList = currentChips || chips;
      const selectedChip = activeChipsList.find((c) => c.label === chipLabel) || 
                           DEFAULT_CHIPS.find((c) => c.label === chipLabel);

      if (selectedChip && selectedChip.query) {
        let searchQuery = selectedChip.query;
        if (isRefresh && Array.isArray(selectedChip.variants) && selectedChip.variants.length > 1) {
          const otherVariants = selectedChip.variants.filter((v) => v !== selectedChip.query);
          searchQuery = otherVariants[Math.floor(Math.random() * otherVariants.length)] || selectedChip.query;
        }

        const data = await fetchSearch(searchQuery, "videos");
        let list = data?.items || (Array.isArray(data) ? data : []);
        if (isRefresh && list.length > 3) {
          list = shuffleArray(list);
        }
        setVideos(list);
      } else if (chipLabel === "Thịnh hành") {
        const data = await fetchTrending(reg);
        let list = Array.isArray(data) ? data : [];
        if (isRefresh && list.length > 3) {
          list = shuffleArray(list);
        }
        setVideos(list);
      } else {
        const activeTopicKeywords = activeChipsList
          .filter((c) => c.isCustom && c.query)
          .map((c) => c.query);
        let recKeywords = activeTopicKeywords.length > 0
          ? activeTopicKeywords
          : getRecommendationKeywords(getLocalWatchHistory());

        // Nếu người dùng bấm làm mới -> Xáo trộn thứ tự chủ đề để thay đổi ưu tiên
        if (isRefresh && recKeywords.length > 1) {
          recKeywords = shuffleArray([...recKeywords]);
        }

        const promises = [fetchTrending(reg)];

        if (recKeywords.length > 0) {
          recKeywords.slice(0, 3).forEach((kw) => {
            promises.push(fetchSearch(kw, "videos"));
          });
          // Thêm 1 chủ đề khám phá ngẫu nhiên khi làm mới để luôn có video mới
          if (isRefresh) {
            const randomExplore = MORE_EXPLORE_QUERIES[Math.floor(Math.random() * MORE_EXPLORE_QUERIES.length)];
            promises.push(fetchSearch(randomExplore, "videos"));
          }
        } else {
          const explorePick1 = isRefresh 
            ? MORE_EXPLORE_QUERIES[Math.floor(Math.random() * MORE_EXPLORE_QUERIES.length)]
            : "nhạc trẻ hot tiktok";
          const explorePick2 = isRefresh 
            ? MORE_EXPLORE_QUERIES[(Math.floor(Math.random() * MORE_EXPLORE_QUERIES.length) + 1) % MORE_EXPLORE_QUERIES.length]
            : "gaming highlight hay nhất";
          promises.push(fetchSearch(explorePick1, "videos"));
          promises.push(fetchSearch(explorePick2, "videos"));
        }

        const results = await Promise.allSettled(promises);
        const trendingList = results[0]?.status === "fulfilled" && Array.isArray(results[0].value) 
          ? (isRefresh ? shuffleArray([...results[0].value]) : results[0].value)
          : [];

        const recLists = results.slice(1).map((r) => {
          if (r.status === "fulfilled") {
            const raw = r.value?.items || (Array.isArray(r.value) ? r.value : []);
            return isRefresh ? shuffleArray([...raw]) : raw;
          }
          return [];
        });

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
   * Tải thêm video (Load more vô tận)
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
    if (currentView === "feed") {
      loadVideos(activeChip, region);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [region, activeChip, currentView]);

  const handleChipClick = (chip) => {
    setCurrentView("feed");
    setActiveChip(chip.label);
    setSearchParams(chip.label === "Tất cả" ? {} : { chip: chip.label });
  };

  const handleRegionChange = (newReg) => {
    setRegion(newReg);
    localStorage.setItem("tecede_yt_region", newReg);
  };

  const handleSelectView = (view) => {
    setCurrentView(view);
    if (view === "history") {
      setSearchParams({ view: "history" });
    } else {
      setSearchParams({});
    }
  };

  // Hàm làm mới toàn bộ trang chủ & đồng bộ lại gợi ý từ lịch sử xem
  const handleRefreshAll = async () => {
    if (isRefreshing) return;
    setIsRefreshing(true);
    setLoading(true);
    setVideos([]);
    try {
      const nextChips = await refreshHistoryAndChips();
      await loadVideos(activeChip, region, nextChips, true);
    } catch (err) {
      console.warn("Lỗi khi làm mới:", err);
    } finally {
      setIsRefreshing(false);
      setLoading(false);
    }
  };

  return (
    <div className="yt-page yt-theme-dark">
      <YouTubeHeader currentRegion={region} onRegionChange={handleRegionChange} />

      <div className={`yt-page-layout ${isSidebarCollapsed ? "sidebar-collapsed" : "sidebar-expanded"}`}>
        {/* SIDEBAR BÊN TRÁI ĐỒNG BỘ YOUTUBE */}
        <YouTubeSidebar
          activeChip={activeChip}
          onSelectChip={(chip) => {
            setCurrentView("feed");
            setActiveChip(chip);
            setSearchParams(chip === "Tất cả" ? {} : { chip });
          }}
          currentView={currentView}
          onSelectView={handleSelectView}
        />

        {/* KHU VỰC NỘI DUNG CHÍNH (MAIN WRAPPER) */}
        <div className="yt-page-main-wrap">
          {currentView === "history" ? (
            <YouTubeHistoryView onBackToFeed={() => handleSelectView("feed")} />
          ) : (
            <>
              {/* TOPIC CHIPS BAR - SWIPER SLIDE KÉO THẢ */}
              <div className="yt-chips-container">
                <button
                  type="button"
                  className={`yt-chip-refresh-btn ${isRefreshing ? "is-refreshing" : ""}`}
                  onClick={handleRefreshAll}
                  disabled={isRefreshing}
                  title="Làm mới chủ đề & gợi ý video"
                >
                  <FaSyncAlt className={`refresh-icon ${isRefreshing ? "spin" : ""}`} />
                  <span className="refresh-label">Làm mới</span>
                </button>

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

                  <div className="yt-section-actions">
                    <button
                      type="button"
                      className="yt-btn-refresh-feed"
                      onClick={handleRefreshAll}
                      disabled={isRefreshing}
                      title="Làm mới để cập nhật gợi ý từ lịch sử xem"
                    >
                      <FaSyncAlt className={`me-1 ${isRefreshing ? "spin" : ""}`} />
                      <span className="btn-label-desktop">{isRefreshing ? "Đang cập nhật..." : "Làm mới gợi ý"}</span>
                      <span className="btn-label-mobile">{isRefreshing ? "Đang tải..." : "Làm mới"}</span>
                    </button>
                    <span className="yt-noads-pill">⚡ Không Quảng Cáo</span>
                  </div>
                </div>

                {/* LOADING SKELETON */}
                {(loading || isRefreshing || (videos.length === 0 && !error)) && (
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
                {!loading && !isRefreshing && error && (
                  <div className="yt-error-card">
                    <FaExclamationTriangle className="yt-error-icon" />
                    <h3>Máy chủ video phản hồi chậm</h3>
                    <p>{error}</p>
                    <button className="yt-btn-retry" onClick={() => loadVideos()}>
                      <FaUndo className="me-2" /> Thử tải lại
                    </button>
                  </div>
                )}

                {/* VIDEO GRID */}
                {!loading && !isRefreshing && !error && videos.length > 0 && (
                  <>
                    <div className="yt-video-grid">
                      {videos.map((vid, idx) => (
                        <VideoCard key={vid.id || vid.url || idx} video={vid} layout="grid" />
                      ))}
                    </div>

                    {/* LOAD MORE BUTTON SECTION */}
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
            </>
          )}
        </div>
      </div>
    </div>
  );
}
