import { useState, useRef, useEffect, useCallback } from "react";

function shuffleArray(arr) {
  const newArr = [...arr];
  for (let i = newArr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
  }
  return newArr;
}

const globalAudio = new Audio();
globalAudio.preload = "auto";
globalAudio.crossOrigin = "anonymous";
globalAudio.playsInline = true;

let audioCtx;
let source;
let isDspInitialized = false;
let bass, mid, treble, delay, feedback, wetGain, dryGain, compressor;

export default function useMusicPlayer(initialSongs) {
  const [originalPlaylist, setOriginalPlaylist] = useState(initialSongs);
  const [currentPlaylist, setCurrentPlaylist] = useState(initialSongs);
  const [currentIndex, setCurrentIndex] = useState(null);
  const [isShuffle, setIsShuffle] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false); 
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  // Mặc định PC Bật, Mobile Tắt
  const [isVibeEnabled, setIsVibeEnabled] = useState(() => {
    if (typeof window !== "undefined") {
      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
      return !isMobile; 
    }
    return false;
  });

  const stateRef = useRef({ playlist: initialSongs, index: null });
  const actionsRef = useRef({ next: null, prev: null });

  const soundRef = useRef({
    seek: (time) => {
      if (time !== undefined) {
        globalAudio.currentTime = time;
        setCurrentTime(time);
      }
      return globalAudio.currentTime || 0;
    },
    duration: () => globalAudio.duration || 0,
    pause: () => globalAudio.pause(),
    play: () => globalAudio.play(),
    rate: (speed) => { globalAudio.playbackRate = speed; }
  });

  useEffect(() => {
    stateRef.current.playlist = currentPlaylist;
    stateRef.current.index = currentIndex;
  }, [currentPlaylist, currentIndex]);

  useEffect(() => {
    const handleTimeUpdate = () => setCurrentTime(globalAudio.currentTime);
    const handleLoadedMetadata = () => setDuration(globalAudio.duration);

    globalAudio.addEventListener("timeupdate", handleTimeUpdate);
    globalAudio.addEventListener("loadedmetadata", handleLoadedMetadata);

    return () => {
      globalAudio.removeEventListener("timeupdate", handleTimeUpdate);
      globalAudio.removeEventListener("loadedmetadata", handleLoadedMetadata);
    };
  }, []);

  // 🎛️ KHỞI TẠO VÀ NỐI DÂY (Chạy 1 lần duy nhất)
  const initAudioContext = useCallback(() => {
    if (isDspInitialized) return;
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      audioCtx = new AudioContext();
      source = audioCtx.createMediaElementSource(globalAudio);

      bass = audioCtx.createBiquadFilter(); bass.type = "lowshelf"; bass.frequency.value = 110; bass.gain.value = 7;
      mid = audioCtx.createBiquadFilter(); mid.type = "peaking"; mid.frequency.value = 400; mid.Q.value = 1.5; mid.gain.value = -2;
      treble = audioCtx.createBiquadFilter(); treble.type = "peaking"; treble.frequency.value = 3000; treble.Q.value = 1; treble.gain.value = 3;
      
      delay = audioCtx.createDelay(); delay.delayTime.value = 0.08;
      feedback = audioCtx.createGain(); feedback.gain.value = 0.25;
      wetGain = audioCtx.createGain(); wetGain.gain.value = 0.2;
      dryGain = audioCtx.createGain(); dryGain.gain.value = 1;
      
      compressor = audioCtx.createDynamicsCompressor();
      compressor.threshold.value = -14; compressor.knee.value = 10; compressor.ratio.value = 4; compressor.attack.value = 0.005; compressor.release.value = 0.1;

      isDspInitialized = true;
      applyRouting(isVibeEnabled); // Cấp điện ngay khi khởi tạo
    } catch (err) {
      console.warn("Lỗi Audio API:", err);
    }
  }, [isVibeEnabled]);

  // 🎛️ HÀM CẮM DÂY (ROUTING) - Tách ra riêng để dễ gọi
  const applyRouting = (vibeOn) => {
    if (!isDspInitialized || !source || !audioCtx) return;

    // Phải resume context thì tiếng mới kêu
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }

    try {
      source.disconnect();
      dryGain.disconnect();
      wetGain.disconnect();
      compressor.disconnect();
    } catch (e) {} // Bỏ qua lỗi ngắt kết nối lần đầu

    if (vibeOn) {
      source.connect(delay);
      delay.connect(feedback);
      feedback.connect(delay);
      delay.connect(wetGain);

      source.connect(bass);
      bass.connect(mid);
      mid.connect(treble);
      treble.connect(dryGain);

      dryGain.connect(compressor);
      wetGain.connect(compressor);
      compressor.connect(audioCtx.destination);
    } else {
      source.connect(audioCtx.destination);
    }
  };

  // 🎛️ KHỞI TẠO TỰ ĐỘNG KHI CÓ TƯƠNG TÁC ĐẦU TIÊN
  useEffect(() => {
    const handleFirstInteraction = () => {
      initAudioContext();
      window.removeEventListener('click', handleFirstInteraction);
      window.removeEventListener('touchstart', handleFirstInteraction);
    };
    window.addEventListener('click', handleFirstInteraction);
    window.addEventListener('touchstart', handleFirstInteraction);
    return () => {
      window.removeEventListener('click', handleFirstInteraction);
      window.removeEventListener('touchstart', handleFirstInteraction);
    };
  }, [initAudioContext]);

  // 🌟 SỬA LỖI NÚT BẤM: Gắn hàm toggleVibe ra ngoài thay vì setIsVibeEnabled
  const toggleVibe = useCallback(() => {
    if (!isDspInitialized) {
        initAudioContext(); // Ép khởi tạo nếu chưa có
    }
    const newState = !isVibeEnabled;
    setIsVibeEnabled(newState);
    applyRouting(newState); // Ép đi dây lại ngay lập tức
  }, [isVibeEnabled, initAudioContext]);

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

    if (!optionalPlaylist && index === stateRef.current.index) {
        if (globalAudio.paused) globalAudio.play();
        return;
    }

    const baseUrl = process.env.REACT_APP_API_URL || "http://localhost:5000";
    setIsPlaying(true); 
    setIsLoading(true); 

    globalAudio.onplay = null;
    globalAudio.onpause = null;
    globalAudio.onended = null;
    globalAudio.onerror = null;

    globalAudio.src = `${baseUrl}/api/songs/stream/${song._id}`;
    globalAudio.load();

    globalAudio.onplay = () => {
      setIsLoading(false);
      setIsPlaying(true);
      
      // Đánh thức DSP mỗi khi nhạc bắt đầu phát
      if (audioCtx && audioCtx.state === 'suspended') {
        audioCtx.resume();
      }

      if ('mediaSession' in navigator) {
        navigator.mediaSession.metadata = new MediaMetadata({
          title: song.title || "Unknown Title",
          artist: song.artist || "Unknown Artist",
          artwork: [{ src: song.image || 'https://via.placeholder.com/512', sizes: '512x512', type: 'image/jpeg' }]
        });
        navigator.mediaSession.setActionHandler('play', () => { globalAudio.play(); setIsPlaying(true); });
        navigator.mediaSession.setActionHandler('pause', () => { globalAudio.pause(); setIsPlaying(false); });
        navigator.mediaSession.setActionHandler('previoustrack', () => actionsRef.current.prev && actionsRef.current.prev());
        navigator.mediaSession.setActionHandler('nexttrack', () => actionsRef.current.next && actionsRef.current.next());
      }
    };

    globalAudio.onpause = () => setIsPlaying(false);
    
    globalAudio.onended = () => {
      if (actionsRef.current.next) actionsRef.current.next(); 
    };
    
    globalAudio.onerror = (e) => {
      console.warn("Lỗi nhạc:", e);
      setIsLoading(false);
      setIsPlaying(false);
      setTimeout(() => {
        if (actionsRef.current.next) actionsRef.current.next();
      }, 2000);
    };

    globalAudio.play().catch(() => {
      setIsLoading(false);
      setIsPlaying(false);
    });

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
    let newPlaylist = !isShuffle ? shuffleArray(originalPlaylist) : originalPlaylist;
    setIsShuffle(!isShuffle);
    handlePlay(0, newPlaylist); 
  }, [isShuffle, originalPlaylist, handlePlay]);

  const togglePlay = useCallback(() => {
    if (globalAudio.paused) {
      globalAudio.play().catch(()=>{});
    } else {
      globalAudio.pause();
    }
  }, []);

  const setGlobalVolume = useCallback((vol) => { globalAudio.volume = vol; }, []);
  const setGlobalMute = useCallback((isMuted) => { globalAudio.muted = isMuted; }, []);

  return {
    playlist: currentPlaylist,
    currentIndex,
    soundRef, 
    isPlaying, 
    isLoading, 
    isShuffle,
    currentTime, 
    duration,    
    togglePlay, 
    handlePlay,
    handleShufflePlaylist,
    handlePrev,
    handleNext,
    updatePlaylist,
    setGlobalVolume,
    setGlobalMute,
    isVibeEnabled,
    toggleVibe // XUẤT HÀM MỚI NÀY RA GIAO DIỆN
  };
}