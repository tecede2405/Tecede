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

  const updatePlaylist = useCallback((songs) => {
    setOriginalPlaylist(songs);
    setCurrentPlaylist(songs);
    setCurrentIndex(null);
    setIsShuffle(false);
  }, []);

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

  // 🛠 ĐÃ FIX LỖI PRELOADER TỰ HỦY
  useEffect(() => {
    if (currentPlaylist.length > 0 && currentIndex !== null) {
      const nextIndex = (currentIndex + 1) % currentPlaylist.length;
      const nextSongUrl = currentPlaylist[nextIndex]?.file;

      if (nextSongUrl) {
        const audioPreloader = new Audio();
        audioPreloader.preload = "auto";
        audioPreloader.src = nextSongUrl;

        // BỎ HOÀN TOÀN HÀM RETURN DỌN DẸP Ở ĐÂY!
        // Không được set src = "" vì nó sẽ cắt đứt luồng tải mạng của bài hát tiếp theo
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

  // 🛠 ĐÃ FIX: CHỐNG SPAM MẠNG KHI ÉP PHÁT
  const forcePlayAudio = (index) => {
    const song = currentPlaylist[index];
    if (!song) return;

    if (audioRef.current) {
      // Chỉ gán và load lại nếu thực sự là link mới
      if (audioRef.current.getAttribute("src") !== song.file) {
        audioRef.current.src = song.file;
        audioRef.current.load(); // Bắt buộc phải có để thiết lập luồng mạng ngầm
      }
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

  // 🛠 ĐÃ FIX: ĐỒNG BỘ AUTO PLAY CHUẨN XÁC
  useEffect(() => {
    if (currentIndex !== null && audioRef.current) {
      const audio = audioRef.current;
      const currentSongUrl = currentPlaylist[currentIndex]?.file;

      if (!currentSongUrl) return;

      // Dùng getAttribute để lấy URL gốc chuẩn xác 100%, tránh lỗi nhận diện sai
      if (audio.getAttribute("src") !== currentSongUrl) {
        audio.src = currentSongUrl;
        audio.load();
      } else if (!audio.paused) {
        // Nhạc đang phát rồi thì thoát ngay
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