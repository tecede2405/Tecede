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
    setCurrentIndex(index);
  };

  // ✅ Xáo trộn hoặc trở lại danh sách gốc
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

  // ✅ Phát bài tiếp theo
  const handleNext = () => {
    if (currentPlaylist.length === 0) return;
    setCurrentIndex((prev) =>
      prev === null ? 0 : (prev + 1) % currentPlaylist.length
    );
  };

  // ✅ Quay lại bài trước
  const handlePrev = () => {
    if (currentPlaylist.length === 0) return;
    setCurrentIndex((prev) =>
      prev === null ? 0 : (prev - 1 + currentPlaylist.length) % currentPlaylist.length
    );
  };

  // ✅ Tự động phát bài tiếp khi bài hiện tại kết thúc
  const handleEnded = () => {
    if (currentIndex === null) return;
    if (currentIndex + 1 < currentPlaylist.length) {
      setCurrentIndex(currentIndex + 1);
    } else {
      setCurrentIndex(null); // hoặc về 0 nếu muốn phát lại
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
