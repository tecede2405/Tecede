import React, { createContext, useContext, useState, useEffect, useRef } from "react";
import useMusicPlayer from "../hooks/useMusicPlayer";

const MusicContext = createContext(null);

export const MusicProvider = ({ children }) => {
  const music = useMusicPlayer([]);
  const [currentCategory, setCurrentCategory] = useState(null);
  const [isMiniPlayerVisible, setIsMiniPlayerVisible] = useState(true);
  const wakeLockRef = useRef(null);

  // Khi có bài hát mới được phát, tự động mở lại mini player nếu trước đó bị ẩn
  useEffect(() => {
    if (music.currentIndex !== null) {
      setIsMiniPlayerVisible(true);
    }
  }, [music.currentIndex]);

  // CƠ CHẾ WAKE LOCK TOÀN CỤC: Giữ màn hình luôn sáng khi nhạc đang phát
  useEffect(() => {
    let isMounted = true;

    const requestWakeLock = async () => {
      if (!("wakeLock" in navigator)) {
        console.log("❌ [WakeLock] Trình duyệt không hỗ trợ Screen Wake Lock");
        return;
      }
      if (document.visibilityState !== "visible") {
        console.log("⏸️ [WakeLock] Tab đang ẩn, hoãn xin Wake Lock");
        return;
      }

      try {
        if (!wakeLockRef.current) {
          wakeLockRef.current = await navigator.wakeLock.request("screen");
          console.log("🔒 [WakeLock] ĐÃ BẬT: Màn hình sẽ luôn sáng khi đang phát nhạc");

          wakeLockRef.current.addEventListener("release", () => {
            console.log("🔓 [WakeLock] ĐÃ TẮT: Wake Lock đã được giải phóng | Visibility:", document.visibilityState);
            wakeLockRef.current = null;
          });
        }
      } catch (err) {
        console.warn("⚠️ [WakeLock] Lỗi khi xin Wake Lock:", err);
      }
    };

    const releaseWakeLock = async () => {
      if (wakeLockRef.current) {
        try {
          await wakeLockRef.current.release();
          wakeLockRef.current = null;
          console.log("🔓 [WakeLock] Đã tắt giữ sáng màn hình do nhạc dừng hoặc hết bài");
        } catch (err) {
          console.warn("⚠️ [WakeLock] Lỗi giải phóng:", err);
        }
      }
    };

    // Nếu đang phát nhạc (ở bất kỳ trang nào) -> Giữ màn hình sáng
    if (music.isPlaying) {
      console.log("▶️ [MusicContext] Nhạc đang phát -> Xin quyền giữ màn hình sáng");
      requestWakeLock();
    } else {
      console.log("⏸️ [MusicContext] Nhạc đã dừng -> Giải phóng Wake Lock");
      releaseWakeLock();
    }

    const handleVisibilityChange = async () => {
      console.log("👀 [Visibility] Trạng thái tab:", document.visibilityState);
      if (document.visibilityState === "visible" && music.isPlaying && isMounted) {
        console.log("🔄 [WakeLock] Người dùng quay lại tab -> Xin lại Wake Lock...");
        await requestWakeLock();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      isMounted = false;
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [music.isPlaying]);

  const closeMiniPlayer = () => {
    setIsMiniPlayerVisible(false);
  };

  return (
    <MusicContext.Provider
      value={{
        ...music,
        currentCategory,
        setCurrentCategory,
        isMiniPlayerVisible,
        setIsMiniPlayerVisible,
        closeMiniPlayer,
      }}
    >
      {children}
    </MusicContext.Provider>
  );
};

export const useMusic = () => {
  const context = useContext(MusicContext);
  if (!context) {
    throw new Error("useMusic must be used within a MusicProvider");
  }
  return context;
};
