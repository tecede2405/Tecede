import { useState, useRef, useEffect } from "react";

export default function useMusicPlayer(songs) {
  const [currentIndex, setCurrentIndex] = useState(null);
  const audioRef = useRef(null);

  useEffect(() => {
    if (currentIndex !== null && audioRef.current) {
      audioRef.current.load();
      audioRef.current.play().catch((err) => {
        console.log("Không thể phát tự động:", err);
      });
    }
  }, [currentIndex]);

  const handleEnded = () => {
    const nextIndex = currentIndex + 1;
    if (nextIndex < songs.length) {
      setCurrentIndex(nextIndex);
    } else {
      setCurrentIndex(null);
    }
  };

  const handlePlay = (index) => {
    setCurrentIndex(index);
  };

  const handlePrev = () => {
    if (songs.length === 0) return;
    setCurrentIndex((prev) => (prev - 1 + songs.length) % songs.length);
  };

  const handleNext = () => {
    if (songs.length === 0) return;
    setCurrentIndex((prev) => (prev + 1) % songs.length);
  };

  return {
    currentIndex,
    audioRef,
    handleEnded,
    handlePlay,
    handlePrev,
    handleNext,
  };
}