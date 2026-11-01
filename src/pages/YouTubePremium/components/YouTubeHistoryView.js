import React, { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import {
  getYoutubeHistoryList,
  deleteYoutubeHistoryItem,
  clearAllYoutubeHistory,
} from "../../../services/youtubeHistoryApi";
import {
  getWatchHistory as getLocalWatchHistory,
  clearWatchHistory as clearLocalWatchHistory,
} from "../../../services/pipedApi";
import { checkYtWatchAccess } from "../utils/watchAuth";
import {
  FaHistory,
  FaTrashAlt,
  FaPlay,
  FaTimes,
  FaSpinner,
  FaSignInAlt,
  FaArrowLeft,
} from "react-icons/fa";
import Swal from "sweetalert2";

export default function YouTubeHistoryView({ onBackToFeed }) {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [historyItems, setHistoryItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  // Fetch lịch sử từ Cloudflare D1 (nếu đã đăng nhập) hoặc LocalStorage (nếu là khách)
  const loadHistory = useCallback(async (pageNum = 1, append = false) => {
    if (pageNum === 1) setLoading(true);
    else setLoadingMore(true);

    try {
      if (user?.token) {
        // Đã đăng nhập -> Lấy từ D1 Database
        const res = await getYoutubeHistoryList(user.token, pageNum, 12);
        if (res?.success && Array.isArray(res.data)) {
          if (append) {
            setHistoryItems((prev) => [...prev, ...res.data]);
          } else {
            setHistoryItems(res.data);
          }
          setHasMore(Boolean(res.hasMore));
          setPage(pageNum);
        } else {
          if (!append) setHistoryItems([]);
          setHasMore(false);
        }
      } else {
        // Chưa đăng nhập -> Lấy từ local storage của trình duyệt
        const local = getLocalWatchHistory();
        const formatted = (local || []).map((item) => ({
          video_id: item.id || item.videoId,
          title: item.title,
          thumbnail: item.thumbnail,
          channel_title: item.uploader,
          duration: item.duration || 0,
          current_time: item.currentTime || 0,
          updated_at: item.watchedAt || Date.now(),
        }));
        setHistoryItems(formatted);
        setHasMore(false);
      }
    } catch (err) {
      console.warn("[YouTubeHistoryView] Error fetching history:", err);
      if (!append) setHistoryItems([]);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [user]);

  useEffect(() => {
    loadHistory(1, false);
  }, [loadHistory]);

  // Tải thêm trang tiếp theo
  const handleLoadMore = () => {
    if (loadingMore || !hasMore) return;
    loadHistory(page + 1, true);
  };

  // Xóa 1 video khỏi lịch sử xem
  const handleDeleteItem = async (e, videoId, videoTitle) => {
    e.preventDefault();
    e.stopPropagation();

    const confirmRes = await Swal.fire({
      title: "Xóa video này?",
      text: `Bạn có chắc muốn xóa "${videoTitle || 'video'}" khỏi lịch sử xem?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#3f3f46",
      confirmButtonText: "Xóa ngay",
      cancelButtonText: "Hủy",
      background: "#18181b",
      color: "#f4f4f5",
    });

    if (!confirmRes.isConfirmed) return;

    setDeletingId(videoId);
    try {
      if (user?.token) {
        // Gọi DELETE API Backend D1
        const res = await deleteYoutubeHistoryItem(user.token, videoId);
        if (res?.success) {
          setHistoryItems((prev) => prev.filter((item) => item.video_id !== videoId));
          Swal.fire({
            toast: true,
            position: "bottom-end",
            icon: "success",
            title: "Đã xóa video khỏi lịch sử xem",
            showConfirmButton: false,
            timer: 2000,
            background: "#27272a",
            color: "#fff",
          });
        } else {
          throw new Error("Lỗi xóa từ máy chủ");
        }
      } else {
        // Xóa khỏi localStorage
        let local = getLocalWatchHistory();
        local = local.filter((x) => (x.id || x.videoId) !== videoId);
        localStorage.setItem("tecede_yt_history", JSON.stringify(local));
        setHistoryItems((prev) => prev.filter((item) => item.video_id !== videoId));
      }
    } catch (err) {
      Swal.fire({
        toast: true,
        position: "bottom-end",
        icon: "error",
        title: "Không thể xóa video này, hãy thử lại!",
        showConfirmButton: false,
        timer: 2500,
        background: "#27272a",
        color: "#fff",
      });
    } finally {
      setDeletingId(null);
    }
  };

  // Xóa toàn bộ lịch sử xem
  const handleClearAll = async () => {
    const confirmRes = await Swal.fire({
      title: "Xóa toàn bộ lịch sử?",
      text: "Thao tác này sẽ xóa sạch tất cả video trong lịch sử xem YouTube của bạn và không thể khôi phục.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#3f3f46",
      confirmButtonText: "Xác nhận xóa hết",
      cancelButtonText: "Đóng",
      background: "#18181b",
      color: "#f4f4f5",
    });

    if (!confirmRes.isConfirmed) return;

    try {
      if (user?.token) {
        const res = await clearAllYoutubeHistory(user.token);
        if (res?.success) {
          setHistoryItems([]);
          Swal.fire({
            toast: true,
            position: "bottom-end",
            icon: "success",
            title: "Đã xóa toàn bộ lịch sử xem",
            showConfirmButton: false,
            timer: 2500,
            background: "#27272a",
            color: "#fff",
          });
        }
      } else {
        clearLocalWatchHistory();
        setHistoryItems([]);
      }
    } catch (err) {
      Swal.fire({
        toast: true,
        position: "bottom-end",
        icon: "error",
        title: "Có lỗi khi xóa lịch sử, vui lòng thử lại sau!",
        showConfirmButton: false,
        timer: 2500,
        background: "#27272a",
        color: "#fff",
      });
    }
  };

  const handleWatchClick = (e) => {
    if (!checkYtWatchAccess(user, navigate)) {
      e.preventDefault();
    }
  };

  // Định dạng thời lượng mm:ss hoặc hh:mm:ss
  const formatDuration = (sec) => {
    const s = Number(sec) || 0;
    if (s <= 0) return null;
    const hours = Math.floor(s / 3600);
    const minutes = Math.floor((s % 3600) / 60);
    const seconds = Math.floor(s % 60);

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
    }
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  // Định dạng thời gian xem trước (vd: 5 phút trước, 2 ngày trước)
  const formatTimeAgo = (timestamp) => {
    if (!timestamp) return "";
    const time = typeof timestamp === "number" ? timestamp : new Date(timestamp).getTime();
    if (isNaN(time)) return "";

    const diff = Math.floor((Date.now() - time) / 1000);
    if (diff < 60) return "Vừa xem xong";
    if (diff < 3600) return `${Math.floor(diff / 60)} phút trước`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} giờ trước`;
    if (diff < 2592000) return `${Math.floor(diff / 86400)} ngày trước`;
    return `${Math.floor(diff / 2592000)} tháng trước`;
  };

  return (
    <div className="yt-history-view-page">
      {/* HEADER LỊCH SỬ XEM */}
      <div className="yt-history-view__header">
        <div className="header-left">
          <button
            type="button"
            className="btn-back-to-feed"
            onClick={onBackToFeed}
            title="Quay lại khám phá video"
          >
            <FaArrowLeft className="me-2" /> Quay lại
          </button>
          <div className="title-group">
            <h1 className="main-title">
              <FaHistory className="title-icon" />
              <span>Lịch sử xem video</span>
            </h1>
            {historyItems.length > 0 && (
              <div className="sub-badge-row">
                <span className="count-badge">{historyItems.length} video đã xem</span>
              </div>
            )}
          </div>
        </div>

        {historyItems.length > 0 && (
          <div className="header-right">
            <button
              type="button"
              className="btn-clear-all-history"
              onClick={handleClearAll}
              title="Xóa toàn bộ lịch sử xem"
            >
              <FaTrashAlt className="me-2" /> Xóa tất cả
            </button>
          </div>
        )}
      </div>

      {/* GUEST NOTICE CALLOUT (KHI CHƯA ĐĂNG NHẬP) */}
      {!user?.token && (
        <div className="yt-history-guest-notice">
          <div className="notice-content">
            <h4>Đăng nhập để đồng bộ lịch sử xem</h4>
            <p>
              Đăng nhập tài khoản để lưu tiến trình xem và tiếp tục xem trên bất kỳ thiết bị nào.
            </p>
          </div>
          <Link to="/login" className="btn-login-prompt">
            <FaSignInAlt className="me-2" /> Đăng nhập ngay
          </Link>
        </div>
      )}

      {/* LOADING STATE BAN ĐẦU */}
      {loading && (
        <div className="yt-history-loading-grid">
          {Array.from({ length: 10 }).map((_, idx) => (
            <div key={idx} className="yt-history-card-skeleton">
              <div className="skeleton-thumb" />
              <div className="skeleton-text">
                <div className="skeleton-line line-1" />
                <div className="skeleton-line line-2" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* EMPTY STATE */}
      {!loading && historyItems.length === 0 && (
        <div className="yt-history-empty-state">
          <div className="empty-icon-wrap">
            <FaHistory />
          </div>
          <h3>Chưa có video nào trong lịch sử xem</h3>
          <p>
            Các video bạn xem trên TecedeYT sẽ được tự động lưu lại ở đây để bạn dễ dàng xem lại bất cứ lúc nào.
          </p>
          <button type="button" className="btn-explore-now" onClick={onBackToFeed}>
            Khám phá video ngay
          </button>
        </div>
      )}

      {/* DANH SÁCH LỊCH SỬ XEM */}
      {!loading && historyItems.length > 0 && (
        <>
          <div className="yt-history-card-grid">
            {historyItems.map((item) => {
              const videoId = item.video_id;
              const durationSec = Number(item.duration) || 0;
              const currentSec = Number(item.current_time) || 0;
              const progressPercent = durationSec > 0 ? Math.min(Math.round((currentSec / durationSec) * 100), 100) : 0;
              const isDeleting = deletingId === videoId;

              return (
                <div
                  key={`${videoId}-${item.updated_at}`}
                  className={`yt-history-item-card ${isDeleting ? "is-deleting" : ""}`}
                >
                  <Link
                    to={`/tecede-yt/watch/${videoId}`}
                    state={{
                      video: {
                        videoId,
                        title: item.title,
                        uploader: item.channel_title,
                        thumbnail: item.thumbnail,
                        duration: durationSec
                      }
                    }}
                    onClick={handleWatchClick}
                    className="thumb-container"
                  >
                    <img
                      src={item.thumbnail}
                      alt={item.title}
                      className="thumb-img"
                      loading="lazy"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;
                      }}
                    />
                    <div className="play-overlay">
                      <FaPlay />
                    </div>

                    {durationSec > 0 && (
                      <span className="duration-pill">
                        {formatDuration(durationSec)}
                      </span>
                    )}

                    {/* THANH TIẾN TRÌNH XEM TIẾP THEO YOUTUBE */}
                    {progressPercent > 0 && (
                      <div className="progress-bar-track">
                        <div
                          className="progress-bar-fill"
                          style={{ width: `${progressPercent}%` }}
                        />
                      </div>
                    )}
                  </Link>

                  <div className="info-container">
                    <Link
                      to={`/tecede-yt/watch/${videoId}`}
                    state={{
                      video: {
                        videoId,
                        title: item.title,
                        uploader: item.channel_title,
                        thumbnail: item.thumbnail,
                        duration: durationSec
                      }
                    }}
                      onClick={handleWatchClick}
                      className="title-link"
                    >
                      <h3 className="video-title" title={item.title}>
                        {item.title}
                      </h3>
                    </Link>

                    <div className="meta-row">
                      <span className="channel-title">{item.channel_title || "YouTube Creator"}</span>
                      {item.updated_at && (
                        <>
                          <span className="dot">•</span>
                          <span className="time-ago">{formatTimeAgo(item.updated_at)}</span>
                        </>
                      )}
                    </div>

                    {currentSec > 0 && (
                      <div className="resume-hint">
                        <span>Đã xem đến {formatDuration(currentSec)}</span>
                      </div>
                    )}
                  </div>

                  {/* NÚT XÓA TỪNG VIDEO */}
                  <button
                    type="button"
                    className="btn-delete-single-video"
                    onClick={(e) => handleDeleteItem(e, videoId, item.title)}
                    title="Xóa khỏi lịch sử xem"
                    disabled={isDeleting}
                  >
                    {isDeleting ? <FaSpinner className="spin-icon" /> : <FaTimes />}
                  </button>
                </div>
              );
            })}
          </div>

          {/* LOAD MORE BUTTON CHO D1 DATABASE PAGINATION */}
          {hasMore && (
            <div className="yt-history-loadmore-wrap">
              <button
                type="button"
                className="btn-history-loadmore"
                onClick={handleLoadMore}
                disabled={loadingMore}
              >
                {loadingMore ? (
                  <>
                    <FaSpinner className="spin-icon me-2" /> Đang tải thêm lịch sử...
                  </>
                ) : (
                  "Tải thêm video cũ hơn"
                )}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
