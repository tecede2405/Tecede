import React from "react";
import { useNavigate } from "react-router-dom";
import { Swiper, SwiperSlide } from "swiper/react";
import { FreeMode } from "swiper/modules";
import { FaCommentDots, FaFilm } from "react-icons/fa";
import { useComments } from "../../context/CommentContext";

import "swiper/css";
import "swiper/css/free-mode";
import "./style.scss";

function formatCommentTime(dateInput) {
  if (!dateInput) return "";
  let date;
  if (typeof dateInput === "string") {
    const isoString = dateInput.includes("Z") || dateInput.includes("+")
      ? dateInput
      : dateInput.replace(" ", "T") + "Z";
    date = new Date(isoString);
  } else {
    date = new Date(dateInput);
  }

  if (isNaN(date.getTime())) return "";

  const now = new Date();
  const diffMs = now.getTime() - date.getTime();

  if (diffMs < 0) return "Vừa xong";

  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);
  const diffWeeks = Math.floor(diffDays / 7);
  const diffMonths = Math.floor(diffDays / 30);
  const diffYears = Math.floor(diffDays / 365);

  if (diffYears >= 1) {
    return `${diffYears} năm trước`;
  }
  if (diffMonths >= 1) {
    return `${diffMonths} tháng trước`;
  }
  if (diffWeeks >= 1) {
    return `${diffWeeks} tuần trước`;
  }
  if (diffDays >= 1) {
    return `${diffDays} ngày trước`;
  }
  if (diffHours >= 1) {
    return `${diffHours} giờ trước`;
  }
  if (diffMins >= 1) {
    return `${diffMins} phút trước`;
  }
  return "Vừa xong";
}

export default function LatestComments() {
  const { comments, loading } = useComments();
  const navigate = useNavigate();

  if (loading && (!comments || comments.length === 0)) {
    return null;
  }

  if (!comments || comments.length === 0) {
    return null;
  }

  const handleCardClick = (moviePath) => {
    if (moviePath) {
      navigate(`/chi-tiet/${moviePath}`);
    }
  };

  return (
    <div className="latest-comments-wrapper">
      <div className="mb-1 d-flex justify-content-between align-items-center">
        <h2 className="film-category ms-3">
          <FaCommentDots className="film-category__icon" />
          <span>Comment mới</span>
        </h2>
      </div>

      <div className="latest-comments-container">
        <Swiper
          modules={[FreeMode]}
          freeMode={true}
          grabCursor={true}
          spaceBetween={12}
          slidesPerView={1.5}
          breakpoints={{
            0: {
              slidesPerView: 1.5,
              spaceBetween: 10,
            },
            640: {
              slidesPerView: 2.5,
              spaceBetween: 12,
            },
            1024: {
              slidesPerView: 4.5,
              spaceBetween: 14,
            },
          }}
          className="latest-comments-swiper"
        >
          {comments.map((item) => {
            const bgImage = item.thumb_url || item.poster_url || "";
            const displayName = item.display_name || "Người dùng";
            const timeAgo = formatCommentTime(item.created_at);

            return (
              <SwiperSlide key={item.id}>
                <div
                  className="latest-comment-card"
                  onClick={() => handleCardClick(item.movie_path)}
                  title={`Xem phim: ${item.movie_name || ""}`}
                >
                  {/* Background thumbnail */}
                  {bgImage && (
                    <div
                      className="latest-comment-card__bg"
                      style={{ backgroundImage: `url(${bgImage})` }}
                    />
                  )}

                  {/* Dark overlay */}
                  <div className="latest-comment-card__overlay" />

                  {/* Card content */}
                  <div className="latest-comment-card__body">
                    {/* Top: User info */}
                    <div className="latest-comment-card__user">
                      <div className="avatar-wrapper">
                        {item.avatar ? (
                          <img
                            src={item.avatar}
                            alt={displayName}
                            className="user-avatar"
                            onError={(e) => {
                              e.target.style.display = "none";
                              if (e.target.nextSibling) {
                                e.target.nextSibling.style.display = "flex";
                              }
                            }}
                          />
                        ) : null}
                        <div
                          className="fallback-avatar"
                          style={{ display: item.avatar ? "none" : "flex" }}
                        >
                          US
                        </div>
                      </div>
                      <div className="user-details">
                        <div className="user-name-row">
                          <span className="user-name" title={displayName}>
                            {displayName}
                          </span>
                          {timeAgo && (
                            <span className="comment-time">{timeAgo}</span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Middle: Comment text */}
                    <div className="latest-comment-card__content">
                      <p className="comment-text" title={item.content}>
                        {item.content}
                      </p>
                    </div>

                    {/* Bottom: Movie title */}
                    <div className="latest-comment-card__movie" title={item.movie_name}>
                      <FaFilm className="movie-icon" />
                      <span className="movie-name">
                        {item.movie_name || "Xem phim"}
                      </span>
                    </div>
                  </div>
                </div>
              </SwiperSlide>
            );
          })}
        </Swiper>
      </div>
    </div>
  );
}
