import { useState, useRef, useEffect, useCallback } from "react";

// Hàm xáo trộn mảng
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
  // ⚡ VŨ KHÍ MỚI: Quản lý chính xác link đang phát để chặn React gán đè
  const playingUrlRef = useRef(""); 

  // Cập nhật playlist khi fetch từ API
  const updatePlaylist = useCallback((songs) => {
    setOriginalPlaylist(songs);
    setCurrentPlaylist(songs);
    setCurrentIndex(null);
    setIsShuffle(false);
  }, []);

  // Hàm update State và API 
  const handlePlay = (index) => {
    const song = currentPlaylist[index];
    if (song?._id) {
      fetch(`${process.env.REACT_APP_API_URL}/api/songs/${song._id}/listen`, {
        method: "PUT",
      }).catch((err) => console.error("Lỗi tăng lượt nghe:", err));
    }
    setCurrentIndex(index);
    setCurrentPlaylist((prev) => {
      const updated = [...prev];
      if (updated[index]) {
        updated[index] = {
          ...updated[index],
          listens: (updated[index].listens || 0) + 1,
        };
      }
      return updated;
    });
  };

  // ⚡ HÀM CỐT LÕI: Phát nhạc an toàn tuyệt đối, tránh đứt gãy khi chạy ngầm
  const safePlayAudio = async (url) => {
    if (!audioRef.current || !url) return;

    // CHỈ GÁN LINK KHI ĐÓ LÀ BÀI HOÀN TOÀN MỚI
    if (playingUrlRef.current !== url) {
      audioRef.current.src = url;
      playingUrlRef.current = url;
    }

    try {
      // Cho dù là link cũ hay link mới, cứ gọi play() để duy trì MediaSession
      await audioRef.current.play();
    } catch (err) {
      console.warn("Lỗi phát nền:", err);
    }
  };

  // Preload (tải trước) bài hát tiếp theo - ĐÃ SỬA LỖI TỰ HỦY MẠNG
  useEffect(() => {
    if (currentPlaylist.length > 0 && currentIndex !== null) {
      const nextIndex = (currentIndex + 1) % currentPlaylist.length;
      const nextSongUrl = currentPlaylist[nextIndex]?.file;

      if (nextSongUrl) {
        const audioPreloader = new Audio();
        audioPreloader.preload = "auto";
        audioPreloader.src = nextSongUrl;
        // Bỏ hàm dọn dẹp src="" ở đây để không làm đứt luồng bài tiếp theo
      }
    }
  }, [currentIndex, currentPlaylist]);

  const handleShufflePlaylist = () => {
    if (!isShuffle) {
      const shuffled = shuffleArray(originalPlaylist);
      setCurrentPlaylist(shuffled);
      setCurrentIndex(0);
    } else {
      setCurrentPlaylist(originalPlaylist);
      setCurrentIndex(0);
    }
    setIsShuffle(!isShuffle);
  };

  // Ép trình duyệt đổi link và phát ngay lập tức (Xử lý Next, Prev, Ended)
  const forcePlayAudio = (index) => {
    const song = currentPlaylist[index];
    if (!song) return;

    safePlayAudio(song.file); // Phát âm thanh trước tiên
    handlePlay(index);        // Cập nhật State giao diện sau
  };

  const handleNext = () => {
    if (currentPlaylist.length === 0) return;
    const nextIndex = currentIndex === null ? 0 : (currentIndex + 1) % currentPlaylist.length;
    forcePlayAudio(nextIndex);
  };

  const handlePrev = () => {
    if (currentPlaylist.length === 0) return;
    const prevIndex = currentIndex === null
        ? 0
        : (currentIndex - 1 + currentPlaylist.length) % currentPlaylist.length;
    forcePlayAudio(prevIndex);
  };

  const handleEnded = () => {
    if (currentIndex === null) return;
    const nextIndex = (currentIndex + 1) % currentPlaylist.length;
    forcePlayAudio(nextIndex);
  };

  // Auto phát khi click bằng tay từ giao diện
  useEffect(() => {
    if (currentIndex !== null && currentPlaylist[currentIndex]) {
      const currentSongUrl = currentPlaylist[currentIndex].file;
      safePlayAudio(currentSongUrl);
    }
  }, [currentIndex, currentPlaylist]);

  // Phục hồi audio khi mở lại tab bị tắt tiếng
  useEffect(() => {
    const handleVisibility = () => {
      if (document.visibilityState === "visible") {
        if (audioRef.current && currentIndex !== null && audioRef.current.paused) {
          audioRef.current.play().catch(() => {});
        }
      }
    };

    document.addEventListener("visibilitychange", handleVisibility);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibility);
    };
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
    handleEnded,
    updatePlaylist,
  };
}