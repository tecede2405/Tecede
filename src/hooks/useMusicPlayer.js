import { useState, useRef, useEffect, useCallback } from "react";
import { Howl } from "howler";

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
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false); 
  
  const soundRef = useRef(null);
  
  // 🌟 VŨ KHÍ MỚI: Trạm chờ cho bài hát tiếp theo
  const nextSoundRef = useRef(null); 
  const nextSongIdRef = useRef(null);

  const stateRef = useRef({ playlist: initialSongs, index: null });

  useEffect(() => {
    stateRef.current.playlist = currentPlaylist;
    stateRef.current.index = currentIndex;
  }, [currentPlaylist, currentIndex]);

  const actionsRef = useRef({ next: null, prev: null });

  const updatePlaylist = useCallback((songs) => {
    setOriginalPlaylist(songs);
    setCurrentPlaylist(songs);
    setCurrentIndex(null);
    setIsShuffle(false);
  }, []);

  const handlePlay = useCallback((index, optionalPlaylist = null) => {
    const listToUse = optionalPlaylist || stateRef.current.playlist;
    
    if (listToUse.length === 0 || index === null) return;

    const song = listToUse[index];
    if (!song?._id) return;

    if (!optionalPlaylist && index === stateRef.current.index && soundRef.current) {
        if (!soundRef.current.playing()) soundRef.current.play();
        return;
    }

    const baseUrl = process.env.REACT_APP_API_URL || "http://localhost:5000";
    
    if (soundRef.current) {
      soundRef.current.off(); 
      soundRef.current.unload();
    }

    setIsPlaying(true); 
    setIsLoading(true); 

    const streamUrl = `${baseUrl}/api/songs/stream/${song._id}`;
    let sound;

    // 🚀 LẤY HÀNG TỪ TRẠM CHỜ: Nếu bài người dùng muốn nghe đúng bằng bài đã tải ngầm
    if (nextSoundRef.current && nextSongIdRef.current === song._id) {
      sound = nextSoundRef.current;
      nextSoundRef.current = null; // Xóa trạm chờ vì đã xài
    } else {
      // Nếu nhảy cóc (bấm bài bất kỳ không theo thứ tự), đành phải tải mới
      sound = new Howl({
        src: [streamUrl],
        html5: true, 
        format: ['mp3', 'm4a', 'aac']
      });
    }

    // Đặt lại toàn bộ sự kiện cho an toàn (đề phòng hàng từ trạm chờ bị dính event cũ)
    sound.off();
    sound.on('loaderror', (id, err) => {
      console.warn("Lỗi tải nhạc:", err);
      setIsLoading(false);
      setIsPlaying(false);
    });
    sound.on('playerror', (id, err) => {
      sound.once('unlock', () => sound.play());
      setIsLoading(false);
    });
    sound.on('play', () => {
      setIsLoading(false);
      setIsPlaying(true);

      if ('mediaSession' in navigator) {
        navigator.mediaSession.metadata = new MediaMetadata({
          title: song.title || "Unknown Title",
          artist: song.artist || "Unknown Artist",
          artwork: [
            { src: song.image || 'https://via.placeholder.com/512', sizes: '512x512', type: 'image/jpeg' }
          ]
        });
        navigator.mediaSession.setActionHandler('play', () => soundRef.current?.play());
        navigator.mediaSession.setActionHandler('pause', () => soundRef.current?.pause());
        navigator.mediaSession.setActionHandler('previoustrack', () => actionsRef.current.prev && actionsRef.current.prev());
        navigator.mediaSession.setActionHandler('nexttrack', () => actionsRef.current.next && actionsRef.current.next());
      }
    });
    sound.on('pause', () => setIsPlaying(false));
    sound.on('end', () => {
      if (actionsRef.current.next) actionsRef.current.next(); 
    });
    sound.on('stop', () => setIsPlaying(false));

    soundRef.current = sound;
    sound.play();

    // ==========================================
    // ⚡ MẠ THUẬT TẢI TRƯỚC (PRE-FETCHING) TẠI ĐÂY
    // Ngay khi bài hiện tại được play, ta nhét luôn bài tiếp theo vào trạm chờ
    // ==========================================
    const nextIdx = (index + 1) % listToUse.length;
    const nextSong = listToUse[nextIdx];
    
    // Đảm bảo không tải ngầm chính bài đang hát (trường hợp list có 1 bài)
    if (nextSong && nextSong._id !== song._id) {
      if (nextSoundRef.current) {
        nextSoundRef.current.unload(); // Vứt bài chờ cũ đi
      }
      
      nextSongIdRef.current = nextSong._id;
      nextSoundRef.current = new Howl({
        src: [`${baseUrl}/api/songs/stream/${nextSong._id}`],
        html5: true,
        preload: true, // Ép trình duyệt kéo file từ server về lưu sẵn vào RAM/Cache
        onloaderror: () => {} // Chặn lỗi báo rác console nếu pre-fetch xịt
      });
    }
    // ==========================================

    fetch(`${baseUrl}/api/songs/${song._id}/listen`, { method: "PUT" }).catch(()=>{});
    
    setCurrentPlaylist((prev) => {
      const baseList = optionalPlaylist || prev;
      const updated = [...baseList];
      if (updated[index]) {
        updated[index] = { ...updated[index], listens: (updated[index].listens || 0) + 1 };
      }
      return updated;
    });
    
    setCurrentIndex(index);
  }, []);

  const handleNext = useCallback(() => {
    const { playlist, index } = stateRef.current;
    if (playlist.length === 0) return;
    const nextIdx = index === null ? 0 : (index + 1) % playlist.length;
    handlePlay(nextIdx);
  }, [handlePlay]);

  const handlePrev = useCallback(() => {
    const { playlist, index } = stateRef.current;
    if (playlist.length === 0) return;
    const prevIdx = index === null ? 0 : (index - 1 + playlist.length) % playlist.length;
    handlePlay(prevIdx);
  }, [handlePlay]);

  useEffect(() => {
    actionsRef.current.next = handleNext;
    actionsRef.current.prev = handlePrev;
  }, [handleNext, handlePrev]);

  const handleShufflePlaylist = useCallback(() => {
    let newPlaylist;
    if (!isShuffle) {
      newPlaylist = shuffleArray(originalPlaylist);
    } else {
      newPlaylist = originalPlaylist;
    }
    setIsShuffle(!isShuffle);
    handlePlay(0, newPlaylist); 
  }, [isShuffle, originalPlaylist, handlePlay]);

  const togglePlay = useCallback(() => {
    if (soundRef.current) {
      if (soundRef.current.playing()) {
        soundRef.current.pause();
      } else {
        soundRef.current.play();
      }
    }
  }, []);

  useEffect(() => {
    return () => {
      if (soundRef.current) soundRef.current.unload();
      if (nextSoundRef.current) nextSoundRef.current.unload(); // Dọn dẹp trạm chờ khi thoát trang
    };
  }, []);

  return {
    playlist: currentPlaylist,
    currentIndex,
    soundRef, 
    isPlaying, 
    isLoading, 
    isShuffle,
    togglePlay, 
    handlePlay,
    handleShufflePlaylist,
    handlePrev,
    handleNext,
    updatePlaylist,
  };
}