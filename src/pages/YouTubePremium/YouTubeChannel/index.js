import React, { useState, useEffect, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import YouTubeHeader from "../components/YouTubeHeader";
import VideoCard from "../components/VideoCard";
import {
  fetchChannel,
  fetchChannelTab,
  fetchSearch,
  formatViews,
  extractVideoId,
  cleanImageUrl
} from "../../../services/pipedApi";
import {
  FaCheckCircle,
  FaBell,
  FaVideo,
  FaBolt,
  FaListUl,
  FaInfoCircle,
  FaExclamationTriangle,
  FaSpinner,
  FaPlay,
  FaShareAlt
} from "react-icons/fa";
import Swal from "sweetalert2";
import "../style.scss";

export default function YouTubeChannel() {
  const { channelId } = useParams();
  const [channelData, setChannelData] = useState(null);
  const [activeTab, setActiveTab] = useState("videos"); // "videos" | "shorts" | "playlists" | "about"
  
  // Tab contents
  const [videos, setVideos] = useState([]);
  const [shorts, setShorts] = useState([]);
  const [playlists, setPlaylists] = useState([]);
  
  // Loading & Error states
  const [isLoading, setIsLoading] = useState(true);
  const [isTabLoading, setIsTabLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Subscription state
  const [isSubscribed, setIsSubscribed] = useState(() => {
    try {
      const subs = JSON.parse(localStorage.getItem("tecede_yt_subs") || "[]");
      return subs.includes(channelId);
    } catch {
      return false;
    }
  });

  const [isDescExpanded, setIsDescExpanded] = useState(false);

  // 1. Tải thông tin tổng quan của kênh và tab Videos mặc định
  const loadChannelData = useCallback(async () => {
    if (!channelId) return;
    setIsLoading(true);
    setError(null);

    try {
      const decodedId = decodeURIComponent(channelId).trim();
      const data = await fetchChannel(decodedId);
      setChannelData(data);

      // Thu thập video cho kênh:
      // A. Lấy từ relatedStreams nếu có
      let initialVideos = Array.isArray(data.relatedStreams) ? [...data.relatedStreams] : [];

      // B. Gọi search video theo tên kênh để có danh sách video đầy đủ nhất
      try {
        const searchRes = await fetchSearch(data.name || "", "videos");
        if (searchRes && Array.isArray(searchRes.items)) {
          // Lọc ưu tiên các video đúng tên uploader của kênh
          const chNameLower = (data.name || "").toLowerCase().trim();
          const channelVideos = searchRes.items.filter(
            (item) => (item.uploaderName || "").toLowerCase().trim().includes(chNameLower) ||
                      chNameLower.includes((item.uploaderName || "").toLowerCase().trim())
          );
          
          // Gộp và loại bỏ video trùng lặp theo ID
          const combined = [...initialVideos, ...channelVideos, ...searchRes.items];
          const seen = new Set();
          const uniqueVideos = [];
          
          combined.forEach((v) => {
            const vidId = v.id || extractVideoId(v.url);
            if (vidId && !seen.has(vidId)) {
              seen.add(vidId);
              uniqueVideos.push(v);
            }
          });
          
          setVideos(uniqueVideos);
        } else {
          setVideos(initialVideos);
        }
      } catch (e) {
        setVideos(initialVideos);
      }

      // Tự động tải trước Shorts và Playlists nếu có tab data
      if (Array.isArray(data.tabs)) {
        const shortsTabObj = data.tabs.find((t) => t.name === "shorts");
        if (shortsTabObj && shortsTabObj.data) {
          fetchChannelTab(shortsTabObj.data)
            .then((res) => {
              if (res && Array.isArray(res.content)) {
                setShorts(res.content);
              }
            })
            .catch(() => {});
        }

        const playlistTabObj = data.tabs.find((t) => t.name === "playlists");
        if (playlistTabObj && playlistTabObj.data) {
          fetchChannelTab(playlistTabObj.data)
            .then((res) => {
              if (res && Array.isArray(res.content)) {
                setPlaylists(res.content);
              }
            })
            .catch(() => {});
        }
      }

      setIsLoading(false);
    } catch (err) {
      console.warn("Lỗi tải thông tin kênh từ endpoint /channel/:", err);
      // Fallback: Tìm kiếm video theo mã / tên kênh để người dùng vẫn xem được nội dung!
      try {
        const decoded = decodeURIComponent(channelId).trim().replace(/^@+/, "");
        const searchRes = await fetchSearch(decoded, "videos");
        if (searchRes && Array.isArray(searchRes.items) && searchRes.items.length > 0) {
          const first = searchRes.items[0];
          setChannelData({
            id: channelId,
            name: first.uploaderName || decoded,
            avatarUrl: first.uploaderAvatar || null,
            subscriberCount: 0,
            verified: first.uploaderVerified || false,
            description: "",
            relatedStreams: []
          });
          setVideos(searchRes.items);
          setIsLoading(false);
          return;
        }
      } catch (fallbackErr) {}

      setError("Không thể tải thông tin kênh từ máy chủ. Vui lòng thử lại sau.");
      setIsLoading(false);
    }
  }, [channelId]);

  useEffect(() => {
    window.scrollTo(0, 0);
    loadChannelData();
  }, [loadChannelData]);

  // Xử lý chuyển tab
  const handleTabChange = async (tabName) => {
    setActiveTab(tabName);
    if (!channelData || !Array.isArray(channelData.tabs)) return;

    if (tabName === "shorts" && shorts.length === 0) {
      const tabObj = channelData.tabs.find((t) => t.name === "shorts");
      if (tabObj && tabObj.data) {
        setIsTabLoading(true);
        try {
          const res = await fetchChannelTab(tabObj.data);
          if (res && Array.isArray(res.content)) {
            setShorts(res.content);
          }
        } catch (e) {}
        setIsTabLoading(false);
      }
    }

    if (tabName === "playlists" && playlists.length === 0) {
      const tabObj = channelData.tabs.find((t) => t.name === "playlists");
      if (tabObj && tabObj.data) {
        setIsTabLoading(true);
        try {
          const res = await fetchChannelTab(tabObj.data);
          if (res && Array.isArray(res.content)) {
            setPlaylists(res.content);
          }
        } catch (e) {}
        setIsTabLoading(false);
      }
    }
  };

  // Xử lý Đăng ký / Hủy đăng ký
  const handleToggleSubscribe = () => {
    const nextState = !isSubscribed;
    setIsSubscribed(nextState);
    try {
      const subs = JSON.parse(localStorage.getItem("tecede_yt_subs") || "[]");
      if (nextState) {
        if (!subs.includes(channelId)) subs.push(channelId);
      } else {
        const idx = subs.indexOf(channelId);
        if (idx !== -1) subs.splice(idx, 1);
      }
      localStorage.setItem("tecede_yt_subs", JSON.stringify(subs));
    } catch {}

    const Toast = Swal.mixin({
      toast: true,
      position: "bottom-end",
      showConfirmButton: false,
      timer: 2000,
      background: "#212121",
      color: "#fff"
    });
    Toast.fire({
      icon: "success",
      title: nextState ? `Đã đăng ký kênh ${channelData?.name || ""}` : "Đã hủy đăng ký"
    });
  };

  // Chia sẻ kênh
  const handleShareChannel = () => {
    const shareUrl = window.location.href;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(shareUrl);
      Swal.fire({
        toast: true,
        position: "bottom-end",
        icon: "success",
        title: "Đã sao chép liên kết kênh!",
        showConfirmButton: false,
        timer: 2000,
        background: "#212121",
        color: "#fff"
      });
    }
  };

  const channelName = channelData?.name || "Kênh YouTube";
  const rawAvatar = channelData?.avatarUrl;
  const avatarUrl = rawAvatar 
    ? cleanImageUrl(rawAvatar) 
    : `https://ui-avatars.com/api/?name=${encodeURIComponent(channelName)}&background=27272a&color=f4f4f5&size=200`;
  const bannerUrl = channelData?.bannerUrl ? cleanImageUrl(channelData.bannerUrl) : null;
  const subscriberCount = channelData?.subscriberCount || 0;
  const isVerified = channelData?.verified;
  const description = channelData?.description || "";

  return (
    <div className="yt-page yt-theme-dark yt-channel-page">
      <Helmet>
        <title>{channelName} - TecedeYT</title>
        <meta name="description" content={`Xem tất cả video, Shorts và danh sách phát của kênh ${channelName} không quảng cáo trên TecedeYT.`} />
      </Helmet>

      <YouTubeHeader />

      <main className="yt-channel-main">
        {isLoading ? (
          <div className="yt-channel-loading">
            <FaSpinner className="yt-spin-icon" />
            <p>Đang tải thông tin kênh và danh sách video...</p>
          </div>
        ) : error ? (
          <div className="yt-channel-error">
            <FaExclamationTriangle className="error-icon" />
            <h3>{error}</h3>
            <button className="yt-btn-retry" onClick={loadChannelData}>
              Thử lại
            </button>
          </div>
        ) : (
          <>
            {/* ================= BANNER KÊNH ================= */}
            <div className="yt-channel-banner-wrap">
              {bannerUrl ? (
                <img
                  src={bannerUrl}
                  alt={`Banner ${channelName}`}
                  className="yt-channel-banner-img"
                  onError={(e) => {
                    e.target.style.display = "none";
                  }}
                />
              ) : (
                <div className="yt-channel-banner-fallback" />
              )}
            </div>

            {/* ================= PROFILE HEADER ================= */}
            <div className="yt-channel-header-container">
              <div className="yt-channel-header-content">
                <div className="yt-channel-avatar-box">
                  <img
                    src={avatarUrl}
                    alt={channelName}
                    className="yt-channel-avatar-img"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(channelName)}&background=27272a&color=f4f4f5&size=200`;
                    }}
                  />
                </div>

                <div className="yt-channel-meta-box">
                  <h1 className="yt-channel-title">
                    <span>{channelName}</span>
                    {isVerified && (
                      <FaCheckCircle className="verified-badge" title="Kênh chính thức đã xác minh" />
                    )}
                  </h1>

                  <div className="yt-channel-stats-row">
                    {subscriberCount > 0 && (
                      <span className="channel-sub-info">
                        {formatViews(subscriberCount).replace("lượt xem", "người đăng ký")}
                      </span>
                    )}
                    {videos.length > 0 && (
                      <>
                        <span className="dot">•</span>
                        <span className="channel-videos-info">{videos.length}+ video</span>
                      </>
                    )}
                  </div>

                  {description && (
                    <div className="yt-channel-desc-box">
                      <p className={`desc-text ${isDescExpanded ? "expanded" : ""}`}>
                        {description}
                      </p>
                      {description.length > 120 && (
                        <button
                          type="button"
                          className="btn-toggle-desc"
                          onClick={() => setIsDescExpanded(!isDescExpanded)}
                        >
                          {isDescExpanded ? "Thu gọn" : "Xem thêm"}
                        </button>
                      )}
                    </div>
                  )}

                  <div className="yt-channel-actions-row">
                    <button
                      type="button"
                      className={`btn-sub-main ${isSubscribed ? "subscribed" : ""}`}
                      onClick={handleToggleSubscribe}
                    >
                      {isSubscribed ? (
                        <>
                          <FaBell className="me-2" /> Đã đăng ký
                        </>
                      ) : (
                        "Đăng ký kênh"
                      )}
                    </button>

                    <button
                      type="button"
                      className="btn-share-channel"
                      onClick={handleShareChannel}
                      title="Chia sẻ kênh"
                    >
                      <FaShareAlt className="me-1" />
                      <span>Chia sẻ</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* ================= TABS NAVIGATION ================= */}
              <div className="yt-channel-tabs-bar">
                <button
                  type="button"
                  className={`tab-btn ${activeTab === "videos" ? "active" : ""}`}
                  onClick={() => handleTabChange("videos")}
                >
                  <FaVideo className="tab-icon" />
                  <span>Video</span>
                  {videos.length > 0 && <span className="tab-count">({videos.length})</span>}
                </button>

                <button
                  type="button"
                  className={`tab-btn ${activeTab === "shorts" ? "active" : ""}`}
                  onClick={() => handleTabChange("shorts")}
                >
                  <FaBolt className="tab-icon icon-bolt" />
                  <span>Shorts</span>
                  {shorts.length > 0 && <span className="tab-count">({shorts.length})</span>}
                </button>

                <button
                  type="button"
                  className={`tab-btn ${activeTab === "playlists" ? "active" : ""}`}
                  onClick={() => handleTabChange("playlists")}
                >
                  <FaListUl className="tab-icon" />
                  <span>Danh sách phát</span>
                  {playlists.length > 0 && <span className="tab-count">({playlists.length})</span>}
                </button>

                <button
                  type="button"
                  className={`tab-btn ${activeTab === "about" ? "active" : ""}`}
                  onClick={() => handleTabChange("about")}
                >
                  <FaInfoCircle className="tab-icon" />
                  <span>Giới thiệu</span>
                </button>
              </div>
            </div>

            {/* ================= NỘI DUNG TỪNG TAB ================= */}
            <div className="yt-channel-tab-content">
              {isTabLoading ? (
                <div className="yt-tab-loading">
                  <FaSpinner className="yt-spin-icon" />
                  <p>Đang tải nội dung...</p>
                </div>
              ) : (
                <>
                  {/* TAB 1: VIDEOS */}
                  {activeTab === "videos" && (
                    <div className="yt-channel-videos-section">
                      {videos.length > 0 ? (
                        <div className="yt-video-grid">
                          {videos.map((vid, idx) => (
                            <VideoCard key={vid.id || vid.url || idx} video={vid} layout="grid" />
                          ))}
                        </div>
                      ) : (
                        <div className="yt-channel-empty">
                          <FaVideo className="empty-icon" />
                          <h4>Chưa tìm thấy video nào</h4>
                          <p>Kênh này hiện chưa có video công khai hoặc máy chủ đang cập nhật.</p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* TAB 2: SHORTS */}
                  {activeTab === "shorts" && (
                    <div className="yt-channel-shorts-section">
                      {shorts.length > 0 ? (
                        <div className="yt-shorts-grid">
                          {shorts.map((item, idx) => {
                            const vidId = item.id || extractVideoId(item.url);
                            return (
                              <Link
                                key={vidId || idx}
                                to={`/tecede-yt/watch/${vidId}`}
                                className="yt-short-card"
                              >
                                <div className="short-thumb-wrap">
                                  <img
                                    src={cleanImageUrl(item.thumbnail, vidId)}
                                    alt={item.title}
                                    className="short-thumb"
                                    loading="lazy"
                                    onError={(e) => {
                                      e.target.onerror = null;
                                      if (vidId) {
                                        e.target.src = `https://i.ytimg.com/vi/${vidId}/hqdefault.jpg`;
                                      }
                                    }}
                                  />
                                  <div className="short-badge">
                                    <FaBolt /> Shorts
                                  </div>
                                </div>
                                <h4 className="short-title">{item.title}</h4>
                                {item.views > 0 && (
                                  <span className="short-views">{formatViews(item.views)}</span>
                                )}
                              </Link>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="yt-channel-empty">
                          <FaBolt className="empty-icon" />
                          <h4>Không có video Shorts nào</h4>
                          <p>Kênh này chưa đăng tải video ngắn (Shorts).</p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* TAB 3: PLAYLISTS */}
                  {activeTab === "playlists" && (
                    <div className="yt-channel-playlists-section">
                      {playlists.length > 0 ? (
                        <div className="yt-playlists-grid">
                          {playlists.map((pl, idx) => {
                            const plId = (pl.url || "").replace("/playlist?list=", "").replace("/playlist/", "");
                            return (
                              <Link
                                key={plId || idx}
                                to={`/tecede-yt/playlist/${plId}`}
                                className="yt-playlist-card"
                              >
                                <div className="playlist-thumb-wrap">
                                  <img
                                    src={cleanImageUrl(pl.thumbnail) || "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&q=80"}
                                    alt={pl.name}
                                    className="playlist-thumb"
                                    loading="lazy"
                                    onError={(e) => {
                                      e.target.onerror = null;
                                      e.target.src = "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&q=80";
                                    }}
                                  />
                                  <div className="playlist-overlay-info">
                                    <FaListUl className="icon-list" />
                                    <span>{pl.videos > 0 ? `${pl.videos} video` : "Danh sách phát"}</span>
                                  </div>
                                  <div className="playlist-play-btn">
                                    <FaPlay />
                                  </div>
                                </div>
                                <h4 className="playlist-title">{pl.name}</h4>
                                <span className="playlist-author">{pl.uploaderName || channelName}</span>
                              </Link>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="yt-channel-empty">
                          <FaListUl className="empty-icon" />
                          <h4>Chưa có danh sách phát nào</h4>
                          <p>Kênh này chưa tạo hoặc chưa công khai danh sách phát.</p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* TAB 4: GIỚI THIỆU (ABOUT) */}
                  {activeTab === "about" && (
                    <div className="yt-channel-about-section">
                      <div className="about-card">
                        <h3>Mô tả kênh</h3>
                        <p className="about-desc">
                          {description || "Kênh chưa cập nhật phần mô tả giới thiệu."}
                        </p>

                        <div className="about-stats-grid">
                          <div className="stat-item">
                            <span className="stat-label">Tên kênh:</span>
                            <span className="stat-value">{channelName}</span>
                          </div>
                          <div className="stat-item">
                            <span className="stat-label">Xác minh:</span>
                            <span className="stat-value">{isVerified ? "Đã xác minh ✓" : "Chưa xác minh"}</span>
                          </div>
                          {subscriberCount > 0 && (
                            <div className="stat-item">
                              <span className="stat-label">Lượng người đăng ký:</span>
                              <span className="stat-value">{formatViews(subscriberCount).replace("lượt xem", "")}</span>
                            </div>
                          )}
                          <div className="stat-item">
                            <span className="stat-label">ID kênh:</span>
                            <span className="stat-value code-font">{channelId}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
