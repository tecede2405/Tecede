import React, { createContext, useContext, useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const TecedeYtPlayerContext = createContext(null);

export const TecedeYtPlayerProvider = ({ children }) => {
  const [activeVideo, setActiveVideo] = useState(null);
  const [isMini, setIsMini] = useState(false);
  const [dragProgress, setDragProgress] = useState(0); // 0 -> 1 khi kéo vuốt trên mobile
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(true);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // 1. Quản lý danh sách phát tạm thời lưu vào SessionStorage (giống YouTube Queue)
  const [sessionPlaylist, setSessionPlaylist] = useState(() => {
    try {
      const saved = sessionStorage.getItem("tecede_yt_session_playlist");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const addToSessionPlaylist = (videoItem) => {
    if (!videoItem) return { success: false, alreadyIn: false };
    const vId = videoItem.videoId || videoItem.id;
    if (!vId) return { success: false, alreadyIn: false };

    let added = false;
    setSessionPlaylist((prev) => {
      const exists = prev.some((item) => (item.videoId || item.id) === vId);
      if (exists) {
        return prev;
      }
      added = true;
      const next = [
        ...prev,
        {
          id: vId,
          videoId: vId,
          title: videoItem.title || "Video",
          uploader: videoItem.uploader || videoItem.uploaderName || videoItem.author || "YouTube Creator",
          thumbnail: videoItem.thumbnail || videoItem.thumbnailUrl || `https://i.ytimg.com/vi/${vId}/hqdefault.jpg`,
          duration: Number(videoItem.duration) || 0,
          addedAt: Date.now()
        }
      ];
      try {
        sessionStorage.setItem("tecede_yt_session_playlist", JSON.stringify(next));
      } catch {}
      return next;
    });

    return { success: true, alreadyIn: !added };
  };

  const removeFromSessionPlaylist = (vId) => {
    if (!vId) return;
    setSessionPlaylist((prev) => {
      const next = prev.filter((item) => (item.videoId || item.id) !== vId);
      try {
        sessionStorage.setItem("tecede_yt_session_playlist", JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  const clearSessionPlaylist = () => {
    setSessionPlaylist([]);
    try {
      sessionStorage.removeItem("tecede_yt_session_playlist");
    } catch {}
  };

  // 2. Quản lý trạng thái Tự động phát (Autoplay ON/OFF)
  const [isAutoPlay, setIsAutoPlay] = useState(() => {
    try {
      const saved = localStorage.getItem("tecede_yt_autoplay");
      return saved !== null ? saved === "true" : true;
    } catch {
      return true;
    }
  });

  const toggleAutoPlay = () => {
    setIsAutoPlay((prev) => {
      const next = !prev;
      try {
        localStorage.setItem("tecede_yt_autoplay", String(next));
      } catch {}
      return next;
    });
  };

  // 3. Quản lý sự kiện video phát xong (Video Ended Listener Registry)
  const videoEndedHandlersRef = useRef(new Map());

  const registerVideoEndedHandler = (id, handler) => {
    videoEndedHandlersRef.current.set(id, handler);
  };

  const unregisterVideoEndedHandler = (id) => {
    videoEndedHandlersRef.current.delete(id);
  };

  const triggerVideoEnded = () => {
    videoEndedHandlersRef.current.forEach((handler) => {
      try {
        handler();
      } catch (err) {
        console.warn("[TecedeYtPlayerContext] Error in videoEndedHandler:", err);
      }
    });
  };

  const location = useLocation();
  const navigate = useNavigate();
  const currentTimeRef = useRef(0);
  const prevRouteRef = useRef("/tecede-yt");

  // Đóng mobile drawer và desktop overlay khi chuyển trang
  useEffect(() => {
    setIsMobileSidebarOpen(false);
    setIsSidebarCollapsed(true);
  }, [location.pathname, location.search]);

  // Hàm bật/tắt sidebar theo màn hình Desktop hoặc Mobile
  const toggleSidebar = () => {
    if (typeof window !== "undefined" && window.innerWidth < 1200) {
      setIsMobileSidebarOpen((prev) => {
        const next = !prev;
        if (next) {
          setIsSidebarCollapsed(false);
        }
        return next;
      });
    } else {
      setIsSidebarCollapsed((prev) => !prev);
    }
  };

  const closeMobileSidebar = () => {
    setIsMobileSidebarOpen(false);
  };

  const closeSidebarOverlay = () => {
    setIsMobileSidebarOpen(false);
    setIsSidebarCollapsed(true);
  };

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
        prevRoute: prevRouteRef.current,
        isSidebarCollapsed,
        setIsSidebarCollapsed,
        isMobileSidebarOpen,
        setIsMobileSidebarOpen,
        toggleSidebar,
        closeMobileSidebar,
        closeSidebarOverlay,
        sessionPlaylist,
        addToSessionPlaylist,
        removeFromSessionPlaylist,
        clearSessionPlaylist,
        isAutoPlay,
        setIsAutoPlay,
        toggleAutoPlay,
        registerVideoEndedHandler,
        unregisterVideoEndedHandler,
        triggerVideoEnded
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
