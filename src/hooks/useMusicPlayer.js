import { useState, useRef, useEffect, useCallback } from "react";

// 🎲 Hàm xáo trộn mảng
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

  // ✅ Cập nhật playlist khi fetch từ API
  const updatePlaylist = useCallback((songs) => {
  setOriginalPlaylist(songs);
  setCurrentPlaylist(songs);
  setCurrentIndex(null);
  setIsShuffle(false);
}, []);

  // ✅ Phát bài theo index
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

  // ✅ Xáo trộn hoặc trở lại danh sách gốc
  const handleShufflePlaylist = () => {
    if (!isShuffle) {
      const shuffled = shuffleArray(originalPlaylist);
      setCurrentPlaylist(shuffled);
      setCurrentIndex(0);
      handlePlay(0); 
    } else {
      setCurrentPlaylist(originalPlaylist);
      setCurrentIndex(0);
      handlePlay(0);
    }
    setIsShuffle(!isShuffle);
  };

  // ✅ Phát bài tiếp theo
  const handleNext = () => {
  if (currentPlaylist.length === 0) return;
  const nextIndex =
    currentIndex === null ? 0 : (currentIndex + 1) % currentPlaylist.length;
  handlePlay(nextIndex); // ✅ dùng handlePlay
};

  // ✅ Quay lại bài trước
 const handlePrev = () => {
  if (currentPlaylist.length === 0) return;
  const prevIndex =
    currentIndex === null
      ? 0
      : (currentIndex - 1 + currentPlaylist.length) % currentPlaylist.length;
  handlePlay(prevIndex); // ✅ dùng handlePlay
  };

  // ✅ Tự động phát bài tiếp khi bài hiện tại kết thúc
  const handleEnded = () => {
  if (currentIndex === null) return;
  if (currentIndex + 1 < currentPlaylist.length) {
    handlePlay(currentIndex + 1); // ✅ dùng handlePlay
  } else {
    setCurrentIndex(null); // hoặc phát lại
  }
};

  // ✅ Auto phát khi đổi bài
  useEffect(() => {
    if (currentIndex !== null && audioRef.current) {
      const audio = audioRef.current;
      audio.load();
      audio.play().catch((err) => {
        console.warn("Không thể phát:", err.message || err);
      });
    }
  }, [currentIndex, currentPlaylist]);

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
