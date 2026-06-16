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
      fetch(`${baseUrl}/api/songs/${song._id}/listen`, { method: "PUT" }).catch(()=>{});
      
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
    handlePlay(nextIndex);
  };

  const handlePrev = () => {
    if (currentPlaylist.length === 0) return;
    const prevIndex = currentIndex === null
        ? 0
        : (currentIndex - 1 + currentPlaylist.length) % currentPlaylist.length;
    handlePlay(prevIndex);
  };

  // 🚀 TỐI ƯU CỰC ĐỘ: Auto-play ngay khi đổi Index
  useEffect(() => {
    if (currentIndex !== null && currentPlaylist[currentIndex] && audioRef.current) {
      const song = currentPlaylist[currentIndex];
      const baseUrl = process.env.REACT_APP_API_URL || "http://localhost:5000";
      const streamUrl = `${baseUrl}/api/songs/stream/${song._id}`;
      
      const audio = audioRef.current;
      
      // Gán link 1 lần duy nhất ở đây!
      if (!audio.src.includes(song._id)) {
        audio.src = streamUrl;
        
        // Hứa play ngay lập tức
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