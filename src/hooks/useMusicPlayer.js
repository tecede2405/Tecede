import { useState, useRef, useEffect, useCallback } from "react";

//  Hàm xáo trộn mảng
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

  //  Cập nhật playlist khi fetch từ API
  const updatePlaylist = useCallback((songs) => {
  setOriginalPlaylist(songs);
  setCurrentPlaylist(songs);
  setCurrentIndex(null);
  setIsShuffle(false);
}, []);

  //  Phát bài theo index
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

  // useEffect dùng để Preload (tải trước) bài hát tiếp theo
useEffect(() => {
  if (currentPlaylist.length > 0 && currentIndex !== null) {
    const nextIndex = (currentIndex + 1) % currentPlaylist.length;
    const nextSongUrl = currentPlaylist[nextIndex]?.file;

    if (nextSongUrl) {
      const audioPreloader = new Audio();
      audioPreloader.preload = "auto";
      audioPreloader.src = nextSongUrl;

      // Hàm dọn dẹp khi useEffect chạy lại hoặc component unmount
      return () => {
        audioPreloader.src = ""; // Xóa nguồn để trình duyệt dừng tải ngầm file cũ
        audioPreloader.load();
      };
    }
  }
}, [currentIndex, currentPlaylist]);

  //  Xáo trộn hoặc trở lại danh sách gốc
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

    // Can thiệp trực tiếp vào DOM Audio thay vì đợi React render
    if (audioRef.current) {
      audioRef.current.src = song.file; // Gán cứng link mới
      audioRef.current.play().catch((err) => console.log("Lỗi autoplay nền:", err));
    }

    // Vẫn gọi hàm gốc để cập nhật State UI và gọi API tăng view
    handlePlay(index);
  };

  // Phát bài tiếp theo
  const handleNext = () => {
    if (currentPlaylist.length === 0) return;
    const nextIndex = currentIndex === null ? 0 : (currentIndex + 1) % currentPlaylist.length;
    forcePlayAudio(nextIndex); // SỬA Ở ĐÂY
  };

  // Quay lại bài trước
  const handlePrev = () => {
    if (currentPlaylist.length === 0) return;
    const prevIndex = currentIndex === null
        ? 0
        : (currentIndex - 1 + currentPlaylist.length) % currentPlaylist.length;
    forcePlayAudio(prevIndex); // SỬA Ở ĐÂY
  };

  // Tự động phát bài tiếp khi bài hiện tại kết thúc (Quan trọng nhất cho phát nền)
  const handleEnded = () => {
    if (currentIndex === null) return;
    const nextIndex = (currentIndex + 1) % currentPlaylist.length;
    forcePlayAudio(nextIndex); // SỬA Ở ĐÂY
  };

  // Auto phát khi đổi bài
  useEffect(() => {
    if (currentIndex !== null && audioRef.current) {
      const audio = audioRef.current;
      const currentSongUrl = currentPlaylist[currentIndex]?.file;

      // QUAN TRỌNG: Nếu bài hát đã được forcePlayAudio gán src và đang phát nền,
      // ta thoát ngay (return) để không gọi lại audio.play() hay audio.load() làm ngắt nhạc.
      if (currentSongUrl && audio.src.includes(currentSongUrl)) {
        return;
      }

      // Khúc này sẽ chạy ở lần đầu tiên người dùng bấm vào bài hát (khi audioRef vừa mount)
      const playAudio = async () => {
        try {
          await audio.play();
        } catch (err) {
          console.warn("Autoplay bị chặn");
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
      if (audioRef.current && currentIndex !== null) {
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
