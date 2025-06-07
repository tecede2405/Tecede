import { useState, useRef, useEffect } from "react";

function shuffleArray(arr) {
  const newArr = [...arr];
  for (let i = newArr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
  }
  return newArr;
}

export default function useMusicPlayer(initialSongs) {
  const [originalPlaylist] = useState(initialSongs); // playlist gốc giữ nguyên
  const [playlist, setPlaylist] = useState(initialSongs); // playlist hiện tại có thể bị shuffle
  const [currentIndex, setCurrentIndex] = useState(null);
  const [isShuffle, setIsShuffle] = useState(false);
  const audioRef = useRef(null);

  // Phát bài theo index trong playlist hiện tại
  const handlePlay = (index) => {
    setCurrentIndex(index);
  };

  // Bật / tắt shuffle
  const handleShufflePlaylist = () => {
    if (!isShuffle) {
      // bật shuffle
      const shuffled = shuffleArray(originalPlaylist);
      setPlaylist(shuffled);
      setCurrentIndex(0);
    } else {
      // tắt shuffle, trả về playlist gốc
      setPlaylist(originalPlaylist);
      setCurrentIndex(0);
    }
    setIsShuffle(!isShuffle);
  };

  // Next bài
  const handleNext = () => {
    if (playlist.length === 0) return;
    setCurrentIndex((prev) => (prev === null ? 0 : (prev + 1) % playlist.length));
  };

  // Prev bài
  const handlePrev = () => {
    if (playlist.length === 0) return;
    setCurrentIndex((prev) =>
      prev === null ? 0 : (prev - 1 + playlist.length) % playlist.length
    );
  };

  // Khi bài hát kết thúc, tự động chuyển bài
  const handleEnded = () => {
    if (currentIndex === null) return;
    if (currentIndex + 1 < playlist.length) {
      setCurrentIndex(currentIndex + 1);
    } else {
      setCurrentIndex(null); // hoặc set về 0 nếu muốn phát lại từ đầu
    }
  };

  // Khi currentIndex hoặc playlist thay đổi, tự động load và phát nhạc
  useEffect(() => {
    if (currentIndex !== null && audioRef.current) {
      audioRef.current.load();
      audioRef.current
        .play()
        .catch((err) => console.log("Không thể phát tự động:", err));
    }
  }, [currentIndex, playlist]);

  return {
    playlist,
    currentIndex,
    audioRef,
    isShuffle,
    handlePlay,
    handleShufflePlaylist,
    handlePrev,
    handleNext,
    handleEnded,
  };
}
