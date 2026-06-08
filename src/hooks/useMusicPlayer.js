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
  const [originalPlaylist, setOriginalPlaylist] = useState(initialSongs); // ✅ giữ nguyên bản gốc
  const [currentPlaylist, setCurrentPlaylist] = useState(initialSongs);   // ✅ dùng để phát
  const [currentIndex, setCurrentIndex] = useState(null);
  const [isShuffle, setIsShuffle] = useState(false);
  const audioRef = useRef(null);

  // Cập nhật playlist khi fetch từ API
  const updatePlaylist = useCallback((songs) => {
    setOriginalPlaylist(songs);
    setCurrentPlaylist(songs);
    setCurrentIndex(null);
    setIsShuffle(false);
  }, []);

  // Phát bài theo index
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

  // Preload (tải trước) bài hát tiếp theo
  useEffect(() => {
    if (currentPlaylist.length > 0 && currentIndex !== null) {
      const nextIndex = (currentIndex + 1) % currentPlaylist.length;
      const nextSongUrl = currentPlaylist[nextIndex]?.file;

      if (nextSongUrl) {
        const audioPreloader = new Audio();
        audioPreloader.preload = "auto";
        audioPreloader.src = nextSongUrl;

        return () => {
          audioPreloader.src = ""; 
          audioPreloader.load();
        };
      }
    }
  }, [currentIndex, currentPlaylist]);

  // Xáo trộn hoặc trở lại danh sách gốc
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

  // Hàm ép trình duyệt đổi link và phát ngay lập tức (vượt rào tiết kiệm pin)
  const forcePlayAudio = (index) => {
    const song = currentPlaylist[index];
    if (!song) return;

    if (audioRef.current) {
      audioRef.current.src = song.file; 
      audioRef.current.play().catch((err) => console.log("Lỗi autoplay nền:", err));
    }

    handlePlay(index);
  };

  const handleNext = useCallback(() => {
    if (currentPlaylist.length === 0) return;
    const nextIndex = currentIndex === null ? 0 : (currentIndex + 1) % currentPlaylist.length;
    forcePlayAudio(nextIndex);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentIndex, currentPlaylist]);

  const handlePrev = useCallback(() => {
    if (currentPlaylist.length === 0) return;
    const prevIndex = currentIndex === null
        ? 0
        : (currentIndex - 1 + currentPlaylist.length) % currentPlaylist.length;
    forcePlayAudio(prevIndex);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentIndex, currentPlaylist]);

  const handleEnded = () => {
    if (currentIndex === null) return;
    const nextIndex = (currentIndex + 1) % currentPlaylist.length;
    forcePlayAudio(nextIndex);
  };

  // Auto phát khi đổi bài (ĐÃ FIX: Xử lý gán src độc lập với React)
  useEffect(() => {
    if (currentIndex !== null && audioRef.current) {
      const audio = audioRef.current;
      const currentSongUrl = currentPlaylist[currentIndex]?.file;

      if (!currentSongUrl) return;

      // Nếu chưa có src hoặc src khác bài hiện tại thì mới gán
      if (!audio.src.includes(currentSongUrl)) {
        audio.src = currentSongUrl;
      } else if (!audio.paused) {
         // Nhạc đang phát bằng forcePlayAudio rồi thì thoát
        return; 
      }

      const playAudio = async () => {
        try {
          await audio.play();
        } catch (err) {
          console.warn("Autoplay bị chặn", err);
          const resume = () => {
            audio.play().catch(() => {});
            document.removeEventListener("click", resume);
          };
          document.addEventListener("click", resume);
        }
      };

      playAudio();
    }
  }, [currentIndex, currentPlaylist]);

  // Phục hồi audio khi mở lại tab
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