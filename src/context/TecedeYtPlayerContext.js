import React, { createContext, useContext, useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const TecedeYtPlayerContext = createContext(null);

export const TecedeYtPlayerProvider = ({ children }) => {
  const [activeVideo, setActiveVideo] = useState(null);
  const [isMini, setIsMini] = useState(false);
  const [dragProgress, setDragProgress] = useState(0); // 0 -> 1 khi kéo vuốt trên mobile
  const location = useLocation();
  const navigate = useNavigate();
  const currentTimeRef = useRef(0);
  const prevRouteRef = useRef("/tecede-yt");

  // Lưu lịch sử đường dẫn trang trước đó (để khi vuốt xuống hoặc minimize quay lại trang trước đó)
  useEffect(() => {
    const isWatch = location.pathname.startsWith("/tecede-yt/watch/");
    if (!isWatch) {
      prevRouteRef.current = `${location.pathname}${location.search}`;
    }
  }, [location.pathname, location.search]);

  // Cập nhật currentTime vào ref (không kích hoạt re-render gây gián đoạn luồng video)
  const updateCurrentTime = (seconds) => {
    const sec = Math.floor(Number(seconds) || 0);
    if (sec >= 0) {
      currentTimeRef.current = sec;
    }
  };

  // Đóng miniplayer nếu mở một video hoặc playlist khác
  useEffect(() => {
    const isWatch = location.pathname.startsWith("/tecede-yt/watch/");
    if (isWatch && activeVideo) {
      const match = location.pathname.match(/\/watch\/([^/?]+)/);
      const currentVidId = match ? match[1] : null;
      if (currentVidId && currentVidId !== activeVideo.videoId) {
        setIsMini(false);
        currentTimeRef.current = 0;
      }
    }

    const isPlaylist = location.pathname.startsWith("/tecede-yt/playlist/");
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
    setActiveVideo((prev) => {
      const merged = {
        ...(prev || {}),
        ...(videoData || {}),
        currentTime: timeToKeep
      };
      return merged.videoId ? merged : prev;
    });
    setIsMini(true);
  };

  /**
   * Thu nhỏ video xuống góc phải và quay trở về trang trước đó (như app YouTube)
   */
  const minimizeToPreviousPage = (videoData) => {
    minimizePlayer(videoData);
    const target = prevRouteRef.current || "/tecede-yt";
    if (location.pathname !== target) {
      navigate(target);
    }
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
        dragProgress,
        setDragProgress,
        minimizePlayer,
        minimizeToPreviousPage,
        maximizePlayer,
        closeMiniPlayer,
        updateCurrentTime,
        currentTimeRef,
        prevRoute: prevRouteRef.current
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
