import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaCheckCircle, FaEllipsisV, FaListUl, FaCheck } from "react-icons/fa";
import { useTecedeYtPlayer } from "../../../context/TecedeYtPlayerContext";
import { DarkSwal } from "../utils/watchAuth";
import ChannelCard from "./ChannelCard";
import { useAuth } from "../../../context/AuthContext";
import { checkYtWatchAccess } from "../utils/watchAuth";
import { 
  extractVideoId, 
  formatViews, 
  formatDuration, 
  formatTimeAgo,
  cleanImageUrl
} from "../../../services/pipedApi";

export default function VideoCard({ video, layout = "grid" }) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef(null);
  const { addToSessionPlaylist, sessionPlaylist } = useTecedeYtPlayer();

  useEffect(() => {
    if (!showMenu) return;
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setShowMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showMenu]);

  if (!video) return null;

  // Nếu là kênh YouTube -> Hiển thị thẻ kênh chuyên biệt
  if (video.type === "channel") {
    return <ChannelCard channel={video} />;
  }

  const videoId = video.id || video.videoId || extractVideoId(video.url);
  const isInPlaylist = sessionPlaylist?.some((item) => (item.id || item.videoId) === videoId);
  const title = video.title || "Video";
  const rawThumb = video.thumbnail || video.thumbnailUrl;
  const thumbnail = cleanImageUrl(rawThumb, videoId);
  const duration = video.duration || video.lengthSeconds;
  const uploaderName = video.uploaderName || video.uploader || video.author || "YouTube Creator";
  const rawAvatar = video.uploaderAvatar || video.authorThumbnails?.[0]?.url;
  const uploaderAvatar = rawAvatar 
    ? cleanImageUrl(rawAvatar) 
    : `https://ui-avatars.com/api/?name=${encodeURIComponent(uploaderName)}&background=27272a&color=f4f4f5&size=80`;
  const isVerified = video.uploaderVerified || video.authorVerified;
  
  // Trích xuất views linh hoạt từ mọi API format (Piped / Invidious / YouTube)
  const views = 
    video.views !== undefined ? video.views :
    video.viewCount !== undefined ? video.viewCount :
    video.viewCountText !== undefined ? video.viewCountText :
    video.shortViewCount !== undefined ? video.shortViewCount :
    video.shortViewCountText;

  // Trích xuất ngày đăng linh hoạt
  const uploadedDate = 
    video.uploadedDate || 
    video.uploadDate || 
    video.published || 
    video.uploaded || 
    video.publishedText || 
    video.uploadedText || 
    video.timeAgo || 
    video.publishedAt;

  const rawChannel = video.uploaderId || video.authorId || (video.uploaderUrl && video.uploaderUrl.replace("https://www.youtube.com/", "").replace("/channel/", "").replace("/c/", "").replace("/user/", "").trim()) || uploaderName;
  const channelUrl = rawChannel ? `/tecede-yt/channel/${encodeURIComponent(rawChannel)}` : null;

  const formattedViews = formatViews(views);
  const formattedDate = formatTimeAgo(uploadedDate);

  const handleToggleMenu = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setShowMenu((prev) => !prev);
  };

  const handleAddToPlaylistClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setShowMenu(false);

    if (!videoId) return;

    if (!isInPlaylist) {
      addToSessionPlaylist({
        id: videoId,
        videoId,
        title,
        thumbnail,
        uploader: uploaderName,
        duration
      });
      DarkSwal.fire({
        toast: true,
        position: "bottom-end",
        icon: "success",
        title: "Đã thêm vào danh sách phát",
        showConfirmButton: false,
        timer: 2000,
        background: "#27272a",
        color: "#fff"
      });
    } else {
      DarkSwal.fire({
        toast: true,
        position: "bottom-end",
        icon: "info",
        title: "Video đã có trong danh sách phát",
        showConfirmButton: false,
        timer: 1800,
        background: "#27272a",
        color: "#fff"
      });
    }
  };

  const handleWatchClick = (e) => {
    if (!checkYtWatchAccess(user, navigate)) {
      e.preventDefault();
    }
  };

  return (
    <div className={`yt-video-card yt-video-card--${layout}`}>
      {/* THUMBNAIL WRAPPER */}
      <Link 
        to={`/tecede-yt/watch/${videoId}`}
        state={{
          video: {
            videoId,
            title,
            uploader: uploaderName,
            thumbnail,
            duration
          }
        }} 
        onClick={handleWatchClick} 
        className="yt-card__thumb-link"
      >
        <div className="yt-card__thumb-wrap">
          <img
            src={thumbnail}
            alt={title}
            className="yt-card__thumb"
            loading="lazy"
            onError={(e) => {
              e.target.onerror = null;
              if (videoId) {
                e.target.src = `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;
              }
            }}
          />
          {duration > 0 && (
            <span className="yt-card__duration">
              {formatDuration(duration)}
            </span>
          )}
        </div>
      </Link>

      {/* INFO WRAPPER */}
      <div className="yt-card__details">
        {layout === "grid" && (
          <Link to={channelUrl} className="yt-card__avatar-wrap" title={`Kênh ${uploaderName}`}>
            <img
              src={uploaderAvatar}
              alt={uploaderName}
              className="yt-card__avatar"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(uploaderName)}&background=27272a&color=f4f4f5&size=80`;
              }}
            />
          </Link>
        )}

        <div className="yt-card__meta">
          <div className="yt-card__title-row">
            <Link 
              to={`/tecede-yt/watch/${videoId}`}
              state={{
                video: {
                  videoId,
                  title,
                  uploader: uploaderName,
                  thumbnail,
                  duration
                }
              }} 
              onClick={handleWatchClick} 
              className="yt-card__title-link"
            >
              <h3 className="yt-card__title" title={title}>
                {title}
              </h3>
            </Link>

            <div className="yt-card__more-wrap" ref={menuRef}>
              <button
                type="button"
                className="yt-card__more-btn"
                onClick={handleToggleMenu}
                title="Tùy chọn khác"
                aria-label="Tùy chọn"
              >
                <FaEllipsisV />
              </button>

              {showMenu && (
                <div className="yt-card__dropdown-menu">
                  <button
                    type="button"
                    className="yt-card__dropdown-item"
                    onClick={handleAddToPlaylistClick}
                  >
                    {isInPlaylist ? (
                      <>
                        <FaCheck className="item-icon success" />
                        <span>Đã có trong danh sách phát</span>
                      </>
                    ) : (
                      <>
                        <FaListUl className="item-icon" />
                        <span>Thêm vào danh sách phát</span>
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>

          <Link to={channelUrl} className="yt-card__channel-info" title={`Kênh ${uploaderName}`}>
            <span className="yt-card__channel-name">{uploaderName}</span>
            {isVerified && <FaCheckCircle className="yt-card__verified" title="Đã xác minh" />}
          </Link>

          <div className="yt-card__stats">
            {(video.liveNow || video.isLive) ? (
              <span className="live-badge" style={{ color: "#ef4444", fontWeight: 600 }}>• Trực tiếp</span>
            ) : (
              <>
                {formattedViews && <span>{formattedViews}</span>}
                {formattedDate && (
                  <>
                    {formattedViews && <span className="dot">•</span>}
                    <span>{formattedDate}</span>
                  </>
                )}
                {!formattedViews && !formattedDate && <span>YouTube Video</span>}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
