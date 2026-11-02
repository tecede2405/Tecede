import React, { useState, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { useTecedeYtPlayer } from "../../../context/TecedeYtPlayerContext";
import { FaExpand, FaTimes } from "react-icons/fa";
import "../style.scss";

export default function TecedeYtMiniPlayer() {
  const { activeVideo, isMini, dragProgress = 0, maximizePlayer, closeMiniPlayer, triggerVideoEnded } = useTecedeYtPlayer();
  const location = useLocation();
  const [slotRect, setSlotRect] = useState(null);
  const playerRef = useRef(null);

  // Vị trí kéo thả tự do của Mini Player
  const [miniPos, setMiniPos] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const dragRef = useRef({ startX: 0, startY: 0, initialX: 0, initialY: 0, width: 340, height: 191 });

  const videoId = activeVideo?.videoId;
  const title = activeVideo?.title;

  const isWatchPage = activeVideo && location.pathname.startsWith(`/tecede-yt/watch/`);
  const isPlaylistPage = activeVideo && location.pathname.startsWith(`/tecede-yt/playlist/`);
  const isDockedPage = Boolean(isWatchPage || isPlaylistPage);

  // Chế độ thu nhỏ khi user bật isMini HOẶC khi rời khỏi trang xem chi tiết / playlist
  const isFloatingMini = Boolean(isMini || !isDockedPage);

  // Khi chuyển từ chế độ mini sang chế độ đầy đủ (docked), reset lại vị trí kéo thả
  useEffect(() => {
    if (!isFloatingMini) {
      setMiniPos(null);
    }
  }, [isFloatingMini]);

  // Lắng nghe sự kiện kết thúc video từ YouTube Player Iframe API
  useEffect(() => {
    const handleMessage = (e) => {
      try {
        const data = typeof e.data === "string" ? JSON.parse(e.data) : e.data;
        if (!data) return;

        // YouTube gửi onStateChange với info === 0 khi phát hết video
        // hoặc infoDelivery với info.playerState === 0
        const isEnded =
          (data.event === "onStateChange" && data.info === 0) ||
          (data.event === "infoDelivery" && data.info?.playerState === 0);

        if (isEnded && typeof triggerVideoEnded === "function") {
          triggerVideoEnded();
        }
      } catch {}
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [triggerVideoEnded]);

  // Giới hạn lại vị trí nếu người dùng thay đổi kích thước cửa sổ trình duyệt
  useEffect(() => {
    if (!miniPos) return;

    const handleWindowResize = () => {
      const isMobile = window.innerWidth <= 576;
      const width = isMobile ? 240 : 340;
      const height = isMobile ? 135 : 191;
      const margin = 8;
      const headerH = 56;

      const maxX = Math.max(margin, window.innerWidth - width - margin);
      const maxY = Math.max(headerH + margin, window.innerHeight - height - margin);

      setMiniPos((prev) => {
        if (!prev) return null;
        return {
          x: Math.min(Math.max(prev.x, margin), maxX),
          y: Math.min(Math.max(prev.y, headerH + margin), maxY)
        };
      });
    };

    window.addEventListener("resize", handleWindowResize);
    return () => window.removeEventListener("resize", handleWindowResize);
  }, [miniPos]);

  // Xử lý kéo thả (Mouse & Touch events)
  useEffect(() => {
    if (!isDragging) return;

    const handleMove = (e) => {
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;

      const margin = 8;
      const headerH = 56;
      const width = dragRef.current.width || 340;
      const height = dragRef.current.height || 191;

      const maxX = Math.max(margin, window.innerWidth - width - margin);
      const maxY = Math.max(headerH + margin, window.innerHeight - height - margin);

      const nextX = Math.min(Math.max(dragRef.current.initialX + (clientX - dragRef.current.startX), margin), maxX);
      const nextY = Math.min(Math.max(dragRef.current.initialY + (clientY - dragRef.current.startY), headerH + margin), maxY);

      setMiniPos({ x: nextX, y: nextY });

      if (e.cancelable && e.type === "touchmove") {
        e.preventDefault();
      }
    };

    const handleEnd = () => {
      setIsDragging(false);
    };

    window.addEventListener("mousemove", handleMove);
    window.addEventListener("mouseup", handleEnd);
    window.addEventListener("touchmove", handleMove, { passive: false });
    window.addEventListener("touchend", handleEnd);
    window.addEventListener("touchcancel", handleEnd);

    return () => {
      window.removeEventListener("mousemove", handleMove);
      window.removeEventListener("mouseup", handleEnd);
      window.removeEventListener("touchmove", handleMove);
      window.removeEventListener("touchend", handleEnd);
      window.removeEventListener("touchcancel", handleEnd);
    };
  }, [isDragging]);

  const handleDragStart = (e) => {
    // Không bắt đầu drag nếu click vào nút đóng hoặc nút phóng to
    if (e.target.closest(".tecede-mini-icon-btn")) return;

    if (!playerRef.current) return;

    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;

    const rect = playerRef.current.getBoundingClientRect();

    dragRef.current = {
      startX: clientX,
      startY: clientY,
      initialX: rect.left,
      initialY: rect.top,
      width: rect.width,
      height: rect.height
    };

    setMiniPos({ x: rect.left, y: rect.top });
    setIsDragging(true);

    if (e.cancelable && e.type === "touchstart") {
      e.preventDefault();
    }
  };

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
    const isMobile = typeof window !== "undefined" && window.innerWidth <= 576;
    const defaultRight = isMobile ? "12px" : "20px";
    const defaultBottom = isMobile ? "16px" : "20px";

    containerStyle = {
      position: "fixed",
      ...(miniPos
        ? { left: `${miniPos.x}px`, top: `${miniPos.y}px`, right: "auto", bottom: "auto" }
        : { right: defaultRight, bottom: defaultBottom }
      ),
      width: isMobile ? "240px" : "340px",
      height: isMobile ? "135px" : "191px",
      zIndex: 99999,
      borderRadius: "12px",
      overflow: "hidden",
      boxShadow: isDragging
        ? "0 24px 50px rgba(0, 0, 0, 0.95), 0 0 0 2px rgba(245, 158, 11, 0.7)"
        : "0 16px 40px rgba(0, 0, 0, 0.9), 0 0 0 1px rgba(255, 255, 255, 0.15)",
      transition: isDragging ? "none" : "all 0.25s cubic-bezier(0.16, 1, 0.3, 1)",
      touchAction: "none"
    };
  } else if (currentRect) {
    // Hiệu ứng tương tác kéo vuốt mượt mà theo ngón tay trên mobile
    const translateY = dragProgress ? dragProgress * 80 : 0;
    const scale = dragProgress ? 1 - dragProgress * 0.15 : 1;

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
      ref={playerRef}
      className={`tecede-yt-master-player ${isFloatingMini ? "is-mini" : "is-docked"} ${isDragging ? "is-dragging" : ""}`}
      style={containerStyle}
    >
      <iframe
        key={videoId}
        src={`https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&playsinline=1&enablejsapi=1&origin=${encodeURIComponent(typeof window !== "undefined" ? window.location.origin : "")}`}
        onLoad={(e) => {
          try {
            e.target.contentWindow.postMessage(JSON.stringify({ event: "listening" }), "*");
          } catch {}
        }}
        title={title || "TecedeYT Video"}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
        className="tecede-yt-master-iframe"
      />

      {/* LỚP CHẮN BẮT SỰ KIỆN KHI ĐANG KÉO ĐỂ KHÔNG BỊ IFRAME NUỐT CHUỘT / TOUCH */}
      {isFloatingMini && isDragging && (
        <div
          className="tecede-mini-drag-shield"
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 100000,
            cursor: "grabbing",
            userSelect: "none",
            WebkitUserSelect: "none"
          }}
        />
      )}

      {/* KHI THU NHỎ (MINI PLAYER): NÚT ĐÓNG, THANH KÉO DI CHUYỂN, VÀ NÚT PHÓNG TO */}
      {isFloatingMini && (
        <div
          className={`tecede-mini-actions-overlay ${isDragging ? "is-active-dragging" : ""}`}
          onMouseDown={handleDragStart}
          onTouchStart={handleDragStart}
        >
          <button
            type="button"
            className="tecede-mini-icon-btn btn-close"
            onClick={(e) => {
              e.stopPropagation();
              closeMiniPlayer();
            }}
            title="Đóng video"
          >
            <FaTimes />
          </button>

          {/* THANH KÉO THẢ DI CHUYỂN MINI PLAYER */}
          <div className="tecede-mini-drag-handle" title="Kéo thả để đặt video ở bất kỳ đâu">
            <span className="drag-pill" />
          </div>

          <button
            type="button"
            className="tecede-mini-icon-btn btn-expand"
            onClick={(e) => {
              e.stopPropagation();
              maximizePlayer();
            }}
            title="Phóng to video"
          >
            <FaExpand />
          </button>
        </div>
      )}
    </div>
  );
}
