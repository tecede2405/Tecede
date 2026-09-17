import { useState, useRef, useEffect, useCallback } from "react";
import spatialEngine, { PRESETS, DEFAULT_CUSTOM_SETTINGS } from "../audio/SpatialAudioEngine";

const STORAGE_KEY = "tecede_spatial_audio_settings";

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

let consecutiveErrors = 0; // Biến theo dõi số lần lỗi liên tiếp

export default function useMusicPlayer(initialSongs) {
  const [originalPlaylist, setOriginalPlaylist] = useState(initialSongs);
  const [currentPlaylist, setCurrentPlaylist] = useState(initialSongs);
  const [currentIndex, setCurrentIndex] = useState(null);
  const [isShuffle, setIsShuffle] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false); 
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isRepeat, setIsRepeat] = useState(false); // Thêm trạng thái lặp lại

  // 🎛️ KHỞI TẠO SETTINGS HIỆU ỨNG TỪ LOCALSTORAGE
  const [audioEffectEnabled, setAudioEffectEnabled] = useState(() => {
    if (typeof window !== "undefined") {
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (typeof parsed.enabled === "boolean") return parsed.enabled;
        }
      } catch (e) {}
      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
      return !isMobile; 
    }
    return false;
  });

  const [audioEffectPreset, setAudioEffectPreset] = useState(() => {
    if (typeof window !== "undefined") {
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (parsed.preset && PRESETS[parsed.preset]) return parsed.preset;
        }
      } catch (e) {}
    }
    return "atmos";
  });

  const [audioEffectIntensity, setAudioEffectIntensity] = useState(() => {
    if (typeof window !== "undefined") {
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (typeof parsed.intensity === "number") return parsed.intensity;
        }
      } catch (e) {}
    }
    return 80;
  });

  const [customAudioSettings, setCustomAudioSettings] = useState(() => {
    if (typeof window !== "undefined") {
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (parsed.custom) return { ...DEFAULT_CUSTOM_SETTINGS, ...parsed.custom };
        }
      } catch (e) {}
    }
    return { ...DEFAULT_CUSTOM_SETTINGS };
  });

  const stateRef = useRef({ playlist: initialSongs, index: null, isRepeat: false });
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
    stateRef.current.isRepeat = isRepeat;
  }, [currentPlaylist, currentIndex, isRepeat]);

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

  // 🎛️ LƯU THIẾT LẬP VÀO LOCALSTORAGE
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        enabled: audioEffectEnabled,
        preset: audioEffectPreset,
        intensity: audioEffectIntensity,
        custom: customAudioSettings
      }));
    } catch (e) {}
  }, [audioEffectEnabled, audioEffectPreset, audioEffectIntensity, customAudioSettings]);

  const audioEffectRef = useRef({
    enabled: audioEffectEnabled,
    preset: audioEffectPreset,
    intensity: audioEffectIntensity,
    custom: customAudioSettings
  });

  useEffect(() => {
    audioEffectRef.current = {
      enabled: audioEffectEnabled,
      preset: audioEffectPreset,
      intensity: audioEffectIntensity,
      custom: customAudioSettings
    };
  }, [audioEffectEnabled, audioEffectPreset, audioEffectIntensity, customAudioSettings]);

  // 🎛️ KHỞI TẠO VÀ CẤP ĐIỆN CHO SPATIAL ENGINE
  const initAudioContext = useCallback(() => {
    try {
      if (!spatialEngine.isInitialized) {
        spatialEngine.init(globalAudio, audioEffectRef.current.enabled);
      }
      spatialEngine.resumeContext();
      spatialEngine.applySettings({
        preset: audioEffectRef.current.preset,
        intensity: audioEffectRef.current.intensity,
        custom: audioEffectRef.current.custom
      });
    } catch (err) {
      console.warn("Lỗi Spatial Audio API:", err);
    }
  }, []);

  // 🎛️ KHỞI TẠO TỰ ĐỘNG KHI CÓ TƯƠNG TÁC ĐẦU TIÊN
  useEffect(() => {
    const handleFirstInteraction = () => {
      if (!spatialEngine.isInitialized) {
        initAudioContext();
      }
      spatialEngine.resumeContext();
    };
    window.addEventListener('click', handleFirstInteraction, { once: true });
    window.addEventListener('touchstart', handleFirstInteraction, { once: true });
    return () => {
      window.removeEventListener('click', handleFirstInteraction);
      window.removeEventListener('touchstart', handleFirstInteraction);
    };
  }, [initAudioContext]);

  // 🌟 ĐIỀU KHIỂN BẬT/TẮT HIỆU ỨNG
  const toggleAudioEffect = useCallback(() => {
    setAudioEffectEnabled((prev) => {
      const next = !prev;
      if (!spatialEngine.isInitialized) {
        spatialEngine.init(globalAudio, next);
      } else {
        spatialEngine.setEnabled(next);
      }
      if (next) {
        spatialEngine.applySettings({
          preset: audioEffectRef.current.preset,
          intensity: audioEffectRef.current.intensity,
          custom: audioEffectRef.current.custom
        });
      }
      return next;
    });
  }, []);

  const changeAudioEffectPreset = useCallback((presetId) => {
    setAudioEffectPreset(presetId);
    if (!spatialEngine.isInitialized) {
      spatialEngine.init(globalAudio, true);
    }
    spatialEngine.resumeContext();
    spatialEngine.applySettings({
      preset: presetId,
      intensity: audioEffectRef.current.intensity,
      custom: audioEffectRef.current.custom
    });
  }, []);

  const changeAudioEffectIntensity = useCallback((intensity) => {
    setAudioEffectIntensity(intensity);
    if (!spatialEngine.isInitialized) {
      spatialEngine.init(globalAudio, true);
    }
    spatialEngine.resumeContext();
    spatialEngine.applySettings({ intensity });
  }, []);

  const updateCustomAudioSetting = useCallback((key, value) => {
    setCustomAudioSettings((prev) => {
      const updated = { ...prev, [key]: value };
      if (!spatialEngine.isInitialized) {
        spatialEngine.init(globalAudio, true);
      }
      spatialEngine.resumeContext();
      // Tự động bật hiệu ứng nếu đang tắt để nghe thấy ngay lập tức
      setAudioEffectEnabled((curEnabled) => {
        if (!curEnabled) {
          spatialEngine.setEnabled(true);
          return true;
        }
        return curEnabled;
      });
      setAudioEffectPreset("custom");
      spatialEngine.applySettings({ preset: "custom", custom: updated });
      return updated;
    });
  }, []);

  const resetCustomAudioSettings = useCallback(() => {
    const reset = { ...DEFAULT_CUSTOM_SETTINGS };
    setCustomAudioSettings(reset);
    if (!spatialEngine.isInitialized) {
      spatialEngine.init(globalAudio, true);
    }
    spatialEngine.resumeContext();
    setAudioEffectPreset("custom");
    spatialEngine.applySettings({ preset: "custom", custom: reset });
  }, []);

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

    // Khởi tạo và đánh thức AudioContext ngay trong cử chỉ bấm của user
    if (!spatialEngine.isInitialized) {
      spatialEngine.init(globalAudio, audioEffectRef.current.enabled);
    }
    spatialEngine.resumeContext();

    if (!optionalPlaylist && index === stateRef.current.index) {
        if (globalAudio.paused) globalAudio.play();
        return;
    }

    const baseUrl = process.env.REACT_APP_API_URL || "http://localhost:5000";
    const newSrc = `${baseUrl}/api/songs/stream/${song._id}`;
    
    setIsPlaying(true); 
    setIsLoading(true); 

    globalAudio.onplay = null;
    globalAudio.onpause = null;
    globalAudio.onended = null;
    globalAudio.onerror = null;

    // Tránh set lại src nếu bài hát đang phát trùng với bài yêu cầu, ngăn lỗi trình duyệt
    if (globalAudio.src === newSrc || globalAudio.src.endsWith(`/api/songs/stream/${song._id}`)) {
      globalAudio.currentTime = 0;
    } else {
      globalAudio.src = newSrc;
      globalAudio.load();
    }

    // Đăng ký MediaSession NGAY LẬP TỨC để OS (Android/iOS) biết app vẫn đang active khi chuyển bài dưới nền
    if ('mediaSession' in navigator) {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: song.title || "Unknown Title",
        artist: song.artist || "Unknown Artist",
        artwork: [{ src: song.image || 'https://via.placeholder.com/512', sizes: '512x512', type: 'image/jpeg' }]
      });
      navigator.mediaSession.playbackState = 'playing';
      navigator.mediaSession.setActionHandler('play', () => { globalAudio.play(); setIsPlaying(true); });
      navigator.mediaSession.setActionHandler('pause', () => { globalAudio.pause(); setIsPlaying(false); });
      navigator.mediaSession.setActionHandler('previoustrack', () => actionsRef.current.prev && actionsRef.current.prev());
      navigator.mediaSession.setActionHandler('nexttrack', () => actionsRef.current.next && actionsRef.current.next());
    }

    globalAudio.onplay = () => {
      setIsLoading(false);
      setIsPlaying(true);
      consecutiveErrors = 0; // Reset lỗi khi phát thành công
      
      // Đánh thức Web Audio Context mỗi khi nhạc bắt đầu phát
      spatialEngine.resumeContext();
    };

    globalAudio.onpause = () => setIsPlaying(false);
    
    globalAudio.onended = () => {
      if (stateRef.current.isRepeat) {
        globalAudio.currentTime = 0;
        globalAudio.play();
      } else {
        if (actionsRef.current.next) actionsRef.current.next(); 
      }
    };
    
    globalAudio.onerror = (e) => {
      console.warn("Lỗi nhạc:", e);
      setIsLoading(false);
      setIsPlaying(false);
      consecutiveErrors++;
      
      // Chỉ next tự động nếu số lần lỗi liên tiếp < 3 để tránh nhảy cóc liên tục dưới nền
      if (consecutiveErrors <= 3) {
        setTimeout(() => {
          if (actionsRef.current.next) actionsRef.current.next();
        }, 2000);
      } else {
        console.warn("Quá nhiều lỗi liên tiếp. Vòng lặp autoplay bị chặn.");
      }
    };

    globalAudio.play().catch((err) => {
      setIsLoading(false);
      setIsPlaying(false);
      
      // Nếu HĐH chặn autoplay dưới nền hoặc màn hình tắt -> Ngưng vòng lặp
      if (err.name === 'NotAllowedError' || (typeof document !== 'undefined' && document.hidden)) {
         consecutiveErrors = 99; // Bứt dây vòng lặp ngay lập tức
      }
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

  const handlePrev = useCallback(() => {
    const list = stateRef.current.playlist;
    const cur = stateRef.current.index;
    if (list.length === 0 || cur === null) return;
    const newIdx = cur - 1 < 0 ? list.length - 1 : cur - 1;
    handlePlay(newIdx);
  }, [handlePlay]);

  const handleNext = useCallback(() => {
    const list = stateRef.current.playlist;
    const cur = stateRef.current.index;
    if (list.length === 0 || cur === null) return;
    const newIdx = cur + 1 >= list.length ? 0 : cur + 1;
    handlePlay(newIdx);
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
    if (!spatialEngine.isInitialized) {
      spatialEngine.init(globalAudio, audioEffectRef.current.enabled);
    }
    spatialEngine.resumeContext();
    if (globalAudio.paused) {
      globalAudio.play().catch(()=>{});
    } else {
      globalAudio.pause();
    }
  }, []);

  const setGlobalVolume = useCallback((vol) => { globalAudio.volume = vol; }, []);
  const setGlobalMute = useCallback((isMuted) => { globalAudio.muted = isMuted; }, []);

  const toggleRepeat = useCallback(() => {
    setIsRepeat((prev) => !prev);
  }, []);

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
    
    // 🌌 Hiệu ứng âm thanh vòm Dolby Atmos & Spatial DSP
    audioEffectEnabled,
    setAudioEffectEnabled,
    toggleAudioEffect,
    audioEffectPreset,
    changeAudioEffectPreset,
    audioEffectIntensity,
    changeAudioEffectIntensity,
    customAudioSettings,
    updateCustomAudioSetting,
    resetCustomAudioSettings,
    audioPresets: PRESETS,

    // Tương thích ngược với các component cũ
    isVibeEnabled: audioEffectEnabled,
    toggleVibe: toggleAudioEffect,

    isRepeat,
    toggleRepeat
  };
}