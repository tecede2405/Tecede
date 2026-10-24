import React, { createContext, useContext, useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const TecedeYtPlayerContext = createContext(null);

export const TecedeYtPlayerProvider = ({ children }) => {
  const [activeVideo, setActiveVideo] = useState(null);
  const [isMini, setIsMini] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const currentTimeRef = useRef(0);

  // Lắng nghe tiến độ phát video từ YouTube Iframe API hoàn toàn ngầm (không gọi re-render React)
  useEffect(() => {
    const handleWindowMessage = (event) => {
      try {
        const data = typeof event.data === "string" ? JSON.parse(event.data) : event.data;
        if (data && data.info && typeof data.info.currentTime === "number") {
          const sec = Math.floor(data.info.currentTime);
          if (sec >= 0) {
            currentTimeRef.current = sec;
          }
        }
      } catch (err) {}
    };

    window.addEventListener("message", handleWindowMessage);

    // Gửi lệnh kiểm tra tiến độ mỗi 2s đến iframe (hoàn toàn ngầm trong ref, không gây giật lag)
    const interval = setInterval(() => {
      const iframes = document.querySelectorAll("iframe");
      iframes.forEach((ifr) => {
        try {
          ifr.contentWindow?.postMessage(JSON.stringify({ event: "listening" }), "*");
          ifr.contentWindow?.postMessage(JSON.stringify({ event: "command", func: "getCurrentTime" }), "*");
        } catch (e) {}
      });
    }, 2000);

    return () => {
      window.removeEventListener("message", handleWindowMessage);
      clearInterval(interval);
    };
  }, []);

  // Cập nhật currentTime vào ref (không kích hoạt re-render gây gián đoạn luồng video)
  const updateCurrentTime = (seconds) => {
    const sec = Math.floor(Number(seconds) || 0);
    if (sec >= 0) {
      currentTimeRef.current = sec;
    }
  };

  // Đóng miniplayer nếu mở một video hoặc playlist khác
  useEffect(() => {
    const isWatch = location.pathname.startsWith("/tecede-yt/watch/") || location.pathname.startsWith("/youtube-premium/watch/");
    if (isWatch && activeVideo) {
      const match = location.pathname.match(/\/watch\/([^/?]+)/);
      const currentVidId = match ? match[1] : null;
      if (currentVidId && currentVidId !== activeVideo.videoId) {
        setIsMini(false);
        currentTimeRef.current = 0;
      }
    }

    const isPlaylist = location.pathname.startsWith("/tecede-yt/playlist/") || location.pathname.startsWith("/youtube-premium/playlist/");
    if (isPlaylist && activeVideo) {
      const match = location.pathname.match(/\/playlist\/([^/?]+)/);
      const currentPlId = match ? match[1] : null;
      if (currentPlId && currentPlId !== activeVideo.playlistId) {
        setIsMini(false);
        currentTimeRef.current = 0;
      }
    }
  }, [location.pathname, activeVideo]);

  /**
   * Thu nhỏ video xuống góc phải
   */
  const minimizePlayer = (videoData) => {
    const timeToKeep = videoData?.currentTime !== undefined ? videoData.currentTime : currentTimeRef.current;
    setActiveVideo({
      ...(videoData || {}),
      currentTime: timeToKeep
    });
    setIsMini(true);
  };

  /**
   * Phóng to video quay trở lại trang xem chi tiết hoặc playlist mà giữ nguyên giây đang phát
   */
  const maximizePlayer = () => {
    setIsMini(false);
    setActiveVideo((prev) => (prev ? { ...prev, currentTime: currentTimeRef.current } : prev));
    if (activeVideo?.playlistId) {
      const targetUrl = `/tecede-yt/playlist/${activeVideo.playlistId}${activeVideo.videoId ? `?v=${activeVideo.videoId}` : ""}`;
      const currentFullUrl = `${location.pathname}${location.search}`;
      if (currentFullUrl !== targetUrl) {
        navigate(targetUrl);
      }
    } else if (activeVideo?.videoId) {
      const targetUrl = `/tecede-yt/watch/${activeVideo.videoId}`;
      if (location.pathname !== targetUrl) {
        navigate(targetUrl);
      }
    }
  };

  /**
   * Đóng hoàn toàn video thu nhỏ
   */
  const closeMiniPlayer = () => {
    setIsMini(false);
    setActiveVideo(null);
    currentTimeRef.current = 0;
  };

  return (
    <TecedeYtPlayerContext.Provider
      value={{
        activeVideo,
        setActiveVideo,
        isMini,
        setIsMini,
        minimizePlayer,
        maximizePlayer,
        closeMiniPlayer,
        updateCurrentTime,
        currentTimeRef
      }}
    >
      {children}
    </TecedeYtPlayerContext.Provider>
  );
};

export const useTecedeYtPlayer = () => {
  const context = useContext(TecedeYtPlayerContext);
  return context || {};
};
