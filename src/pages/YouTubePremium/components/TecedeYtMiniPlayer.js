import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useTecedeYtPlayer } from "../../../context/TecedeYtPlayerContext";
import { FaExpand, FaTimes } from "react-icons/fa";
import "../style.scss";

export default function TecedeYtMiniPlayer() {
  const { activeVideo, isMini, dragProgress = 0, maximizePlayer, closeMiniPlayer } = useTecedeYtPlayer();
  const location = useLocation();
  const [slotRect, setSlotRect] = useState(null);

  const videoId = activeVideo?.videoId;
  const title = activeVideo?.title;

  const isWatchPage = activeVideo && location.pathname.startsWith(`/tecede-yt/watch/`);

  const isPlaylistPage = activeVideo && location.pathname.startsWith(`/tecede-yt/playlist/`);

  const isDockedPage = Boolean(isWatchPage || isPlaylistPage);

  // Chế độ thu nhỏ góc dưới khi user bật isMini HOẶC khi rời khỏi trang xem chi tiết / playlist
  const isFloatingMini = Boolean(isMini || !isDockedPage);

  // Đo vị trí slot trên trang xem khi ở chế độ xem đầy đủ (watch slot hoặc playlist slot)
  useEffect(() => {
    if (!isDockedPage) {
      setSlotRect(null);
      return;
    }

    const getSlot = () => {
      return document.getElementById("yt-watch-slot") || document.getElementById("yt-playlist-slot");
    };

    const updateRect = () => {
      const slot = getSlot();
      if (slot) {
        const rect = slot.getBoundingClientRect();
        if (rect.width > 0 && rect.height > 0) {
          setSlotRect({
            top: rect.top + window.scrollY,
            left: rect.left + window.scrollX,
            width: rect.width,
            height: rect.height
          });
        }
      }
    };

    updateRect();
    const rafId = requestAnimationFrame(updateRect);
    const intervalId = setInterval(updateRect, 200);
    const t1 = setTimeout(updateRect, 50);
    const t2 = setTimeout(updateRect, 150);
    const t3 = setTimeout(updateRect, 400);

    const slotEl = getSlot();
    let ro = null;
    if (slotEl && typeof ResizeObserver !== "undefined") {
      ro = new ResizeObserver(() => updateRect());
      ro.observe(slotEl);
    }

    window.addEventListener("resize", updateRect);
    window.addEventListener("scroll", updateRect, { passive: true });
    return () => {
      cancelAnimationFrame(rafId);
      clearInterval(intervalId);
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      ro?.disconnect();
      window.removeEventListener("resize", updateRect);
      window.removeEventListener("scroll", updateRect);
    };
  }, [isMini, isDockedPage, location.pathname, location.search]);

  if (!activeVideo) {
    return null;
  }

  // Lấy vị trí tức thì đồng bộ nếu chưa kịp lưu trong state
  let currentRect = slotRect;
  if (!currentRect && isDockedPage && !isMini && typeof document !== "undefined") {
    const slot = document.getElementById("yt-watch-slot") || document.getElementById("yt-playlist-slot");
    if (slot) {
      const r = slot.getBoundingClientRect();
      if (r.width > 0 && r.height > 0) {
        currentRect = {
          top: r.top + window.scrollY,
          left: r.left + window.scrollX,
          width: r.width,
          height: r.height
        };
      }
    }
  }

  // Tính toán style chuyển đổi giữa chế độ Mini và Docked trên trang xem
  let containerStyle = {};

  if (isFloatingMini) {
    containerStyle = {
      position: "fixed",
      bottom: "20px",
      right: "20px",
      width: "340px",
      height: "191px",
      zIndex: 99999,
      borderRadius: "12px",
      overflow: "hidden",
      boxShadow: "0 16px 40px rgba(0, 0, 0, 0.9), 0 0 0 1px rgba(255, 255, 255, 0.15)",
      transition: "all 0.25s cubic-bezier(0.16, 1, 0.3, 1)"
    };
  } else if (currentRect) {
    // Hiệu ứng tương tác kéo vuốt mượt mà theo ngón tay trên mobile
    const translateY = dragProgress ? dragProgress * 80 : 0;
    const scale = dragProgress ? (1 - dragProgress * 0.15) : 1;

    containerStyle = {
      position: "absolute",
      top: `${currentRect.top}px`,
      left: `${currentRect.left}px`,
      width: `${currentRect.width}px`,
      height: `${currentRect.height}px`,
      zIndex: 25,
      borderRadius: dragProgress ? "16px" : "14px",
      overflow: "hidden",
      boxShadow: "0 8px 30px rgba(0, 0, 0, 0.7)",
      transform: `translateY(${translateY}px) scale(${scale})`,
      transformOrigin: "bottom right",
      transition: dragProgress > 0 ? "none" : "all 0.25s cubic-bezier(0.16, 1, 0.3, 1)"
    };
  } else {
    containerStyle = {
      position: "fixed",
      opacity: 0,
      pointerEvents: "none"
    };
  }

  return (
    <div 
      className={`tecede-yt-master-player ${isFloatingMini ? "is-mini" : "is-docked"}`} 
      style={containerStyle}
    >
      <iframe
        key={videoId}
        src={`https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&playsinline=1`}
        title={title || "TecedeYT Video"}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
        className="tecede-yt-master-iframe"
      />

      {/* KHI THU NHỎ (MINI PLAYER): NÚT ĐÓNG Ở SÁT BÊN TRÁI, NÚT PHÓNG TO Ở SÁT BÊN PHẢI */}
      {isFloatingMini && (
        <div className="tecede-mini-actions-overlay">
          <button 
            type="button"
            className="tecede-mini-icon-btn btn-close" 
            onClick={closeMiniPlayer} 
            title="Đóng video"
          >
            <FaTimes />
          </button>
          <button 
            type="button"
            className="tecede-mini-icon-btn btn-expand" 
            onClick={maximizePlayer} 
            title="Phóng to video"
          >
            <FaExpand />
          </button>
        </div>
      )}
    </div>
  );
}
