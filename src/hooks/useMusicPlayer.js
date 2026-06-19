import { useState, useRef, useEffect, useCallback } from "react";

function shuffleArray(arr) {
  const newArr = [...arr];
  for (let i = newArr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
  }
  return newArr;
}

export default function useMusicPlayer(initialSongs) {
  const [originalPlaylist, setOriginalPlaylist] = useState(initialSongs);
  const [currentPlaylist, setCurrentPlaylist] = useState(initialSongs);
  const [currentIndex, setCurrentIndex] = useState(null);
  const [isShuffle, setIsShuffle] = useState(false);
  
  const audioRef = useRef(null);

  const updatePlaylist = useCallback((songs) => {
    setOriginalPlaylist(songs);
    setCurrentPlaylist(songs);
    setCurrentIndex(null);
    setIsShuffle(false);
  }, []);

  const handlePlay = (index) => {
    if (currentIndex === index) return; 

    const song = currentPlaylist[index];
    if (song?._id) {
      const baseUrl = process.env.REACT_APP_API_URL || "http://localhost:5000";
      
      // 🚀 BÍ QUYẾT CHẠY NỀN: Ép thẻ Audio nhận bài mới và Play NGAY LẬP TỨC (Bỏ qua thời gian chờ React Render)
      if (audioRef.current) {
        const streamUrl = `${baseUrl}/api/songs/stream/${song._id}`;
        audioRef.current.src = streamUrl;
        audioRef.current.play().catch((err) => console.warn("Lỗi auto-play:", err));

        // 🎵 CẬP NHẬT MEDIA SESSION: Giữ giao diện nghe nhạc trên màn hình khóa luôn sống
        if ('mediaSession' in navigator) {
          navigator.mediaSession.metadata = new MediaMetadata({
            title: song.title || "Unknown Title",
            artist: song.artist || "Unknown Artist",
            // Đảm bảo truyền đúng URL ảnh, kích thước tiêu chuẩn 512x512
            artwork: [
              { src: song.image || 'https://via.placeholder.com/512', sizes: '512x512', type: 'image/jpeg' }
            ]
          });
        }
      }

      // Vẫn gọi API tăng view như bình thường
      fetch(`${baseUrl}/api/songs/${song._id}/listen`, { method: "PUT" }).catch(()=>{});
      
      // Để cho React từ từ cập nhật UI sau, không ảnh hưởng tới luồng nhạc
      setCurrentPlaylist((prev) => {
        const updated = [...prev];
        updated[index] = { ...updated[index], listens: (updated[index].listens || 0) + 1 };
        return updated;
      });
    }
    
    setCurrentIndex(index);
  };

  const handleShufflePlaylist = () => {
    if (!isShuffle) {
      setCurrentPlaylist(shuffleArray(originalPlaylist));
      setCurrentIndex(0);
    } else {
      setCurrentPlaylist(originalPlaylist);
      setCurrentIndex(0);
    }
    setIsShuffle(!isShuffle);
  };

  const handleNext = () => {
    if (currentPlaylist.length === 0) return;
    const nextIndex = currentIndex === null ? 0 : (currentIndex + 1) % currentPlaylist.length;
    handlePlay(nextIndex); // Gọi thẳng vào handlePlay để kích hoạt cơ chế phát lập tức
  };

  const handlePrev = () => {
    if (currentPlaylist.length === 0) return;
    const prevIndex = currentIndex === null
        ? 0
        : (currentIndex - 1 + currentPlaylist.length) % currentPlaylist.length;
    handlePlay(prevIndex);
  };

  // Giữ lại useEffect này làm phương án dự phòng (Fallback) nếu việc khởi tạo bị trễ
  useEffect(() => {
    if (currentIndex !== null && currentPlaylist[currentIndex] && audioRef.current) {
      const song = currentPlaylist[currentIndex];
      const audio = audioRef.current;
      
      if (!audio.src.includes(song._id)) {
        const baseUrl = process.env.REACT_APP_API_URL || "http://localhost:5000";
        audio.src = `${baseUrl}/api/songs/stream/${song._id}`;
        audio.play().catch(err => {
            console.warn("Trình duyệt chặn Auto-play hoặc mạng lỗi:", err);
        });
      }
    }
  }, [currentIndex, currentPlaylist]);

  useEffect(() => {
    const handleVisibility = () => {
      if (document.visibilityState === "visible" && audioRef.current && audioRef.current.paused && currentIndex !== null) {
          audioRef.current.play().catch(() => {});
      }
    };
    document.addEventListener("visibilitychange", handleVisibility);
    return () => document.removeEventListener("visibilitychange", handleVisibility);
  }, [currentIndex]);

  return {
    playlist: currentPlaylist,
    currentIndex,
    audioRef,
    isShuffle,
    handlePlay,
    handleShufflePlaylist,
    handlePrev,
    handleNext,
    handleEnded: handleNext, 
    updatePlaylist,
  };
}