import React from "react";
import { Link } from "react-router-dom";
import { FaCheckCircle, FaTv } from "react-icons/fa";
import { formatViews, cleanImageUrl } from "../../../services/pipedApi";

export default function ChannelCard({ channel }) {
  if (!channel) return null;

  const name = channel.name || channel.title || "Kênh";
  const rawAvatar = channel.thumbnail || channel.avatarUrl;
  const avatar = rawAvatar 
    ? cleanImageUrl(rawAvatar) 
    : `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=27272a&color=f4f4f5&size=160`;
  const subscribers = channel.subscribers;
  const isVerified = channel.verified;
  const description = channel.description || "";
  const videosCount = channel.videos;

  const rawChannel = channel.id || (channel.url && channel.url.replace("https://www.youtube.com/", "").replace("/channel/", "").replace("/c/", "").replace("/user/", "").trim()) || name;
  const channelUrl = rawChannel ? `/tecede-yt/channel/${encodeURIComponent(rawChannel)}` : null;

  return (
    <div className="yt-channel-card">
      {/* AVATAR KÊNH */}
      <Link to={channelUrl} className="yt-channel-card__avatar-wrap">
        <img
          src={avatar}
          alt={name}
          className="yt-channel-card__avatar"
          loading="lazy"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=27272a&color=f4f4f5&size=160`;
          }}
        />
      </Link>

      {/* THÔNG TIN KÊNH */}
      <div className="yt-channel-card__details">
        <Link to={channelUrl} className="yt-channel-card__title-link">
          <h2 className="yt-channel-card__title">
            <span>{name}</span>
            {isVerified && (
              <FaCheckCircle className="yt-channel-card__verified" title="Kênh chính thức đã xác minh" />
            )}
          </h2>
        </Link>

        <div className="yt-channel-card__meta">
          <span className="channel-badge">Kênh YouTube</span>
          {subscribers > 0 && (
            <>
              <span className="dot">•</span>
              <span className="subscribers-count">
                {formatViews(subscribers).replace("lượt xem", "người đăng ký")}
              </span>
            </>
          )}
          {videosCount > 0 && (
            <>
              <span className="dot">•</span>
              <span className="videos-count">{videosCount} video</span>
            </>
          )}
        </div>

        {description && (
          <p className="yt-channel-card__desc" title={description}>
            {description}
          </p>
        )}
      </div>

      {/* NÚT XEM CÁC VIDEO CỦA KÊNH */}
      <div className="yt-channel-card__action">
        <Link to={channelUrl} className="yt-btn-channel-view">
          <FaTv className="me-2" />
          <span>Xem video kênh</span>
        </Link>
      </div>
    </div>
  );
}
