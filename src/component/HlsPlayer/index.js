import React, { useEffect, useRef, useState, useCallback, useMemo } from "react";
import Hls from "hls.js";
import {
  FaVolumeHigh,
  FaVolumeLow,
  FaVolumeXmark,
  FaGear,
  FaRotateLeft,
  FaXmark,
  FaBarsStaggered,
  FaCheck,
  FaChevronRight,
  FaChevronLeft,
  FaForwardStep,
} from "react-icons/fa6";
import "./style.scss";

const SMOOTH_HLS_CONFIG = {
  debug: false,
  enableWorker: true,
  lowLatencyMode: false,
  backBufferLength: 30,             // Giữ 30s buffer quá khứ để dọn dẹp RAM kịp thời
  maxBufferLength: 30,              // 30s đệm trước chuẩn VOD, tránh tràn MediaSource MSE quota
  maxMaxBufferLength: 60,           // Tối đa 60s khi mạng nhàn rỗi
  maxBufferSize: 60 * 1000 * 1000,  // 60MB là ngưỡng an toàn tuyệt đối cho trình duyệt di động & PC
  maxBufferHole: 0.5,               // 0.5s bỏ qua lệch PTS/DTS của nguồn phim, triệt tiêu micro-stutter
  highBufferWatchdogPeriod: 2,      // Quét mỗi 2s theo chuẩn Hls.js
  nudgeOffset: 0.1,                 // Nhích nhẹ 0.1s
  nudgeMaxRetry: 3,
  nudgeOnVideoHole: true,
  maxFragLookUpTolerance: 0.25,
  startFragPrefetch: false,         // Tắt prefetch để tập trung 100% băng thông tải chunk đầu tiên phát ngay
  appendErrorMaxRetry: 3,
  autoStartLoad: true,
  fragLoadingTimeOut: 20000,        // 20s timeout phân đoạn
  fragLoadingMaxRetry: 4,
  fragLoadingRetryDelay: 1000,
};

function formatTime(seconds) {
  if (isNaN(seconds) || seconds < 0) return "0:00:00";
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  return `${h}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}

export default function HlsPlayer({
  movie,
  servers = [],
  currentServer = 0,
  currentVideo,
  episodes = [],
  selectedEpisodeSlug,
  onChangeServer,
  onChangeEpisode,
  posterUrl,
  thumbUrl,
  onStatsUpdate,
}) {
  const videoRef = useRef(null);
  const containerRef = useRef(null);
  const hlsRef = useRef(null);
  const progressContainerRef = useRef(null);
  const hideOverlayTimerRef = useRef(null);
  const isDraggingSeekRef = useRef(false);
  const justFinishedDraggingRef = useRef(false);

  const curTimeRef = useRef(null);
  const durTimeRef = useRef(null);
  const progressPlayedRef = useRef(null);
  const progressScrubberRef = useRef(null);
  const progressBufferedRef = useRef(null);
  const hoverTooltipRef = useRef(null);
  const hoverTimeRef = useRef(null);
  const durationRef = useRef(0);
  const adSkippedRef = useRef(false);
  const lastSavedTimeRef = useRef(0);
  const lastActivityRef = useRef(0);
  const showServerMenuRef = useRef(false);
  const showEpisodesDrawerRef = useRef(false);
  const showSettingsRef = useRef(false);
  const playbackSpeedRef = useRef(1);
  const onStatsUpdateRef = useRef(onStatsUpdate);
  const networkStatsRef = useRef({
    speedMbps: 0,
    pingMs: 0,
    bufferAhead: 0,
    bandwidthEstimate: 0,
    qualityLabel: "",
    status: "connecting",
    statusText: "Đang kết nối...",
    advice: "Đang kết nối tới máy chủ CDN...",
    lastFragTime: 0,
  });

  useEffect(() => {
    onStatsUpdateRef.current = onStatsUpdate;
  }, [onStatsUpdate]);

  // States
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(() => {
    try {
      const s = localStorage.getItem("mamphim_player_volume");
      return s !== null ? parseFloat(s) : 1;
    } catch (e) {
      return 1;
    }
  });
  const [isMuted, setIsMuted] = useState(() => {
    try {
      return localStorage.getItem("mamphim_player_muted") === "true";
    } catch (e) {
      return false;
    }
  });
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isBuffering, setIsBuffering] = useState(false);
  const [userActive, setUserActive] = useState(true);

  const volumeRef = useRef(volume);
  const isMutedRef = useRef(isMuted);
  const isFullscreenRef = useRef(isFullscreen);
  const isBufferingRef = useRef(isBuffering);
  const userActiveRef = useRef(userActive);
  const lastBecameActiveRef = useRef(Date.now());
  const wasHiddenAtInteractionStartRef = useRef(false);

  useEffect(() => {
    volumeRef.current = volume;
  }, [volume]);
  useEffect(() => {
    isMutedRef.current = isMuted;
  }, [isMuted]);
  useEffect(() => {
    isFullscreenRef.current = isFullscreen;
  }, [isFullscreen]);
  useEffect(() => {
    isBufferingRef.current = isBuffering;
  }, [isBuffering]);
  useEffect(() => {
    userActiveRef.current = userActive;
  }, [userActive]);

  // Popups & Drawers
  const [showServerMenu, setShowServerMenu] = useState(false);
  const [showEpisodesDrawer, setShowEpisodesDrawer] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [settingsTab, setSettingsTab] = useState("main"); // 'main' | 'quality' | 'subtitle' | 'speed'

  // Settings states
  const [levels, setLevels] = useState([]);
  const [currentLevel, setCurrentLevel] = useState(-1); // -1 = Auto
  const [gearBadgeText, setGearBadgeText] = useState("Auto");
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [selectedSubtitle, setSelectedSubtitle] = useState("Mặc định");
  const [subtitleTracks, setSubtitleTracks] = useState([]);
  const [currentSubtitle, setCurrentSubtitle] = useState(0);
  const [autoNextEp, setAutoNextEp] = useState(true);

  // Center Flash Animation
  const [centerFlash, setCenterFlash] = useState(null);

  // Resume toast
  const [showResumeToast, setShowResumeToast] = useState(false);
  const [resumeTimeText, setResumeTimeText] = useState("00:00");

  // Skip Ad (KKPhim: 14:55 -> 15:00)
  const [showSkipAd, setShowSkipAd] = useState(false);

  // Xác định loại server
  const activeServerObj = servers[currentServer];
  const isKkServer = useMemo(() => {
    return Boolean(
      (activeServerObj?.sourceName && activeServerObj.sourceName.toUpperCase() === "KK") ||
      (activeServerObj?.server_name && activeServerObj.server_name.toUpperCase().includes("KK"))
    );
  }, [activeServerObj]);

  const isVmServer = useMemo(() => {
    return Boolean(
      (activeServerObj?.sourceName && activeServerObj.sourceName.toUpperCase() === "VM") ||
      (activeServerObj?.server_name && activeServerObj.server_name.toUpperCase().includes("VM")) ||
      (!currentVideo?.m3u8Url && currentVideo?.embedUrl)
    );
  }, [activeServerObj, currentVideo]);

  // Reset skip ad khi đổi tập hoặc server
  useEffect(() => {
    adSkippedRef.current = false;
    setShowSkipAd(false);
  }, [currentVideo?.slug, currentServer]);

  // Trigger Center Flash
  const triggerCenterFlash = useCallback((playing) => {
    setCenterFlash({ isPlaying: playing, time: Date.now() });
  }, []);

  // Play / Pause
  const togglePlay = useCallback(() => {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused || v.ended) {
      v.play().catch(() => {});
    } else {
      v.pause();
    }
  }, []);

  // Relative Seek (-10s / +10s)
  const seekRelative = useCallback((seconds) => {
    const v = videoRef.current;
    if (!v) return;
    v.currentTime = Math.max(0, Math.min(v.duration || 0, v.currentTime + seconds));
  }, []);

  // Đồng bộ ref của popup & menu để tránh stale closure trong setTimeout
  useEffect(() => {
    showServerMenuRef.current = showServerMenu;
  }, [showServerMenu]);
  useEffect(() => {
    showEpisodesDrawerRef.current = showEpisodesDrawer;
  }, [showEpisodesDrawer]);
  useEffect(() => {
    showSettingsRef.current = showSettings;
  }, [showSettings]);

  // User Inactivity Timer for overlay (3s khi ở cửa sổ thường, 2.5s khi fullscreen không tương tác -> tự động ẩn)
  const handleUserActivity = useCallback(() => {
    const now = Date.now();
    if (now - lastActivityRef.current < 40) return;
    lastActivityRef.current = now;

    setUserActive((prev) => {
      if (!prev) {
        lastBecameActiveRef.current = now;
      }
      return true;
    });

    if (hideOverlayTimerRef.current) {
      clearTimeout(hideOverlayTimerRef.current);
    }
    const timeoutMs = isFullscreenRef.current ? 2500 : 3000;
    hideOverlayTimerRef.current = setTimeout(() => {
      // Chỉ ẩn nếu không mở menu server, danh sách tập, hoặc cài đặt
      if (
        !showServerMenuRef.current &&
        !showEpisodesDrawerRef.current &&
        !showSettingsRef.current
      ) {
        const v = videoRef.current;
        if (!v || !v.paused) {
          setUserActive(false);
        }
      }
    }, timeoutMs);
  }, []);

  // Xử lý khi chuột rời khỏi player ở chế độ cửa sổ: chờ đủ 3s mới ẩn để user kịp thao tác
  const handleMouseLeave = useCallback(() => {
    if (!isFullscreenRef.current) {
      if (hideOverlayTimerRef.current) {
        clearTimeout(hideOverlayTimerRef.current);
      }
      hideOverlayTimerRef.current = setTimeout(() => {
        if (
          !showServerMenuRef.current &&
          !showEpisodesDrawerRef.current &&
          !showSettingsRef.current
        ) {
          const v = videoRef.current;
          if (!v || !v.paused) {
            setUserActive(false);
          }
        }
      }, 3000);
    }
  }, []);

  // Fullscreen Handler
  const toggleFullscreen = useCallback(() => {
    handleUserActivity();
    const container = containerRef.current;
    if (!container) return;

    const isFs =
      document.fullscreenElement ||
      document.webkitFullscreenElement ||
      container.classList.contains("is-fullscreen");

    if (!isFs) {
      if (container.requestFullscreen) {
        container.requestFullscreen().catch(() => {
          setIsFullscreen(true);
        });
      } else if (container.webkitRequestFullscreen) {
        container.webkitRequestFullscreen();
      } else if (videoRef.current && videoRef.current.webkitEnterFullscreen) {
        videoRef.current.webkitEnterFullscreen();
      } else {
        setIsFullscreen(true);
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
      }
      setIsFullscreen(false);
    }
  }, [handleUserActivity]);

  // Sync Fullscreen state
  useEffect(() => {
    const handleFsChange = () => {
      const isFs = Boolean(
        document.fullscreenElement ||
        document.webkitFullscreenElement ||
        document.mozFullScreenElement ||
        document.msFullscreenElement
      );
      setIsFullscreen(isFs);
      handleUserActivity();
    };

    document.addEventListener("fullscreenchange", handleFsChange);
    document.addEventListener("webkitfullscreenchange", handleFsChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFsChange);
      document.removeEventListener("webkitfullscreenchange", handleFsChange);
    };
  }, [handleUserActivity]);

  // Lắng nghe hoạt động chuột/phím toàn cục khi xem fullscreen hoặc di chuột trên player
  useEffect(() => {
    const onGlobalActivity = (e) => {
      if (
        isFullscreen ||
        (containerRef.current && containerRef.current.contains(e.target))
      ) {
        handleUserActivity();
      }
    };

    window.addEventListener("mousemove", onGlobalActivity, { passive: true });
    window.addEventListener("pointermove", onGlobalActivity, { passive: true });
    window.addEventListener("touchstart", onGlobalActivity, { passive: true });

    return () => {
      window.removeEventListener("mousemove", onGlobalActivity);
      window.removeEventListener("pointermove", onGlobalActivity);
      window.removeEventListener("touchstart", onGlobalActivity);
    };
  }, [isFullscreen, handleUserActivity]);

  // ============================================================
  // MEDIA SESSION API (Lockscreen, Notification, Hardware Keys)
  // ============================================================
  useEffect(() => {
    if (!("mediaSession" in navigator)) return;

    let epTitle = currentVideo?.name || "";
    if (epTitle && !isNaN(epTitle)) {
      epTitle = `Tập ${epTitle}`;
    } else if (!epTitle) {
      epTitle = "Tập Full";
    }

    const movieName = movie?.name || "Xem phim";
    const artworkUrl = posterUrl || thumbUrl || movie?.poster_url || movie?.thumb_url || "";

    try {
      navigator.mediaSession.metadata = new window.MediaMetadata({
        title: `${movieName} - ${epTitle}`,
        artist: movie?.origin_name || movieName,
        album: epTitle,
        artwork: artworkUrl
          ? [
              { src: artworkUrl, sizes: "96x96", type: "image/jpeg" },
              { src: artworkUrl, sizes: "128x128", type: "image/jpeg" },
              { src: artworkUrl, sizes: "192x192", type: "image/jpeg" },
              { src: artworkUrl, sizes: "256x256", type: "image/jpeg" },
              { src: artworkUrl, sizes: "384x384", type: "image/jpeg" },
              { src: artworkUrl, sizes: "512x512", type: "image/jpeg" },
            ]
          : [],
      });
    } catch (err) {
      console.warn("MediaSession metadata error:", err);
    }
  }, [
    movie?.name,
    movie?.origin_name,
    movie?.poster_url,
    movie?.thumb_url,
    currentVideo?.name,
    posterUrl,
    thumbUrl,
  ]);

  // Media Session Action Handlers
  useEffect(() => {
    if (!("mediaSession" in navigator)) return;

    const actionHandlers = [
      [
        "play",
        () => {
          if (videoRef.current) videoRef.current.play().catch(() => {});
        },
      ],
      [
        "pause",
        () => {
          if (videoRef.current) videoRef.current.pause();
        },
      ],
      [
        "seekbackward",
        (details) => {
          seekRelative(-(details?.seekOffset || 10));
        },
      ],
      [
        "seekforward",
        (details) => {
          seekRelative(details?.seekOffset || 10);
        },
      ],
      [
        "seekto",
        (details) => {
          if (videoRef.current && details?.seekTime !== undefined) {
            videoRef.current.currentTime = details.seekTime;
          }
        },
      ],
      [
        "previoustrack",
        () => {
          if (onChangeEpisode && episodes.length > 0) {
            const curSlug = selectedEpisodeSlug || currentVideo?.slug;
            const curIdx = episodes.findIndex((ep) => ep.slug === curSlug);
            if (curIdx > 0) {
              onChangeEpisode(episodes[curIdx - 1].slug);
            }
          }
        },
      ],
      [
        "nexttrack",
        () => {
          if (onChangeEpisode && episodes.length > 0) {
            const curSlug = selectedEpisodeSlug || currentVideo?.slug;
            const curIdx = episodes.findIndex((ep) => ep.slug === curSlug);
            if (curIdx >= 0 && curIdx < episodes.length - 1) {
              onChangeEpisode(episodes[curIdx + 1].slug);
            }
          }
        },
      ],
    ];

    for (const [action, handler] of actionHandlers) {
      try {
        navigator.mediaSession.setActionHandler(action, handler);
      } catch (e) {}
    }

    return () => {
      for (const [action] of actionHandlers) {
        try {
          navigator.mediaSession.setActionHandler(action, null);
        } catch (e) {}
      }
    };
  }, [seekRelative, onChangeEpisode, episodes, selectedEpisodeSlug, currentVideo?.slug]);

  // Resume Time Check from localStorage
  const checkSavedResumeTime = useCallback((v) => {
    if (!v) return;
    const movieSlug = movie?.slug || "default";
    const key = `Mamphim_Pos_${movieSlug}_S${currentServer}_E${selectedEpisodeSlug || currentVideo?.slug || "0"}`;
    const savedTime = parseFloat(localStorage.getItem(key));

    if (savedTime && savedTime > 25 && (!v.duration || savedTime < v.duration - 30)) {
      v.currentTime = savedTime;
      const mins = Math.floor(savedTime / 60).toString().padStart(2, "0");
      const secs = Math.floor(savedTime % 60).toString().padStart(2, "0");
      setResumeTimeText(`${mins}:${secs}`);
      setShowResumeToast(true);
      setTimeout(() => setShowResumeToast(false), 8000);
    }
  }, [movie?.slug, currentServer, selectedEpisodeSlug, currentVideo?.slug]);

  // Restart Playback (Xem từ đầu)
  const restartPlayback = useCallback(() => {
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      setShowResumeToast(false);
      videoRef.current.play().catch(() => {});
    }
  }, []);

  // Skip Ad click
  const handleSkipAd = useCallback((e) => {
    if (e) e.stopPropagation();
    if (videoRef.current) {
      videoRef.current.currentTime = 931; // 15:31
    }
    adSkippedRef.current = true;
    setShowSkipAd(false);
  }, []);

  // Volume & Mute with localStorage persistence
  const handleVolumeChange = (val) => {
    const num = parseFloat(val);
    setVolume(num);
    const muted = num === 0;
    setIsMuted(muted);
    try {
      localStorage.setItem("mamphim_player_volume", num);
      localStorage.setItem("mamphim_player_muted", muted ? "true" : "false");
    } catch (e) {}
    if (videoRef.current) {
      videoRef.current.volume = num;
      videoRef.current.muted = muted;
    }
  };

  const toggleMute = useCallback(() => {
    const v = videoRef.current;
    if (!v) return;
    setIsMuted((prevMuted) => {
      const nextMuted = !prevMuted;
      v.muted = nextMuted;
      try {
        localStorage.setItem("mamphim_player_muted", nextMuted ? "true" : "false");
      } catch (e) {}
      return nextMuted;
    });
    setVolume((prevVol) => {
      if (prevVol === 0) {
        v.volume = 1;
        try {
          localStorage.setItem("mamphim_player_volume", "1");
        } catch (e) {}
        return 1;
      }
      return prevVol;
    });
  }, []);

  // Picture in Picture
  const togglePiP = () => {
    const v = videoRef.current;
    if (!v) return;
    if (document.pictureInPictureElement) {
      document.exitPictureInPicture().catch(() => {});
    } else if (v.requestPictureInPicture) {
      v.requestPictureInPicture().catch(() => {});
    }
  };

  // ============================================================
  // HLS INIT & CLEANUP
  // ============================================================
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;

    // Nếu là VM hoặc không có m3u8Url -> Dùng Iframe embed
    if (isVmServer || !currentVideo?.m3u8Url) {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
      v.pause();
      return;
    }

    const streamUrl = currentVideo.m3u8Url;
    setIsBuffering(true);

    if (Hls.isSupported()) {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }

      const hls = new Hls(SMOOTH_HLS_CONFIG);
      hlsRef.current = hls;

      hls.loadSource(streamUrl);
      hls.attachMedia(v);

      hls.on(Hls.Events.MANIFEST_PARSED, (event, data) => {
        setLevels(data.levels || []);
        if (hls.subtitleTracks && hls.subtitleTracks.length > 0) {
          setSubtitleTracks(hls.subtitleTracks);
        }
        checkSavedResumeTime(v);
        if (v && playbackSpeedRef.current !== 1) {
          v.playbackRate = playbackSpeedRef.current;
        }
        v.play().catch(() => {});
      });

      hls.on(Hls.Events.LEVEL_LOADED, () => {
        if (hls.levels && hls.levels.length > 0) {
          setLevels(hls.levels);
        }
      });

      hls.on(Hls.Events.SUBTITLE_TRACKS_UPDATED, (event, data) => {
        if (data.subtitleTracks && data.subtitleTracks.length > 0) {
          setSubtitleTracks(data.subtitleTracks);
        }
      });

      hls.on(Hls.Events.LEVEL_SWITCHED, (event, data) => {
        const lvl = hls.levels[data.level];
        if (lvl) {
          if (hls.autoLevelEnabled) {
            setGearBadgeText("Auto");
          } else {
            setGearBadgeText(`${lvl.height}p`);
          }
        }
      });

      let mediaRecoveryAttempts = 0;
      hls.on(Hls.Events.ERROR, (event, data) => {
        if (data.fatal) {
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              hls.startLoad();
              break;
            case Hls.ErrorTypes.MEDIA_ERROR:
              if (mediaRecoveryAttempts === 0) {
                mediaRecoveryAttempts++;
                hls.recoverMediaError();
              } else if (mediaRecoveryAttempts === 1) {
                mediaRecoveryAttempts++;
                hls.swapAudioCodec();
                hls.recoverMediaError();
              } else {
                hls.destroy();
              }
              break;
            default:
              hls.destroy();
              break;
          }
        } else if (data.details === Hls.ErrorDetails.BUFFER_APPEND_ERROR) {
          hls.recoverMediaError();
        } else if (data.details === Hls.ErrorDetails.BUFFER_STALLED_ERROR) {
          hls.startLoad();
          // Để GapController và nudge nội bộ của Hls.js tự động xử lý, không can thiệp thủ công v.currentTime tránh flush pipeline
        }
      });

      hls.on(Hls.Events.FRAG_BUFFERED, () => {
        if (isBufferingRef.current) {
          setIsBuffering(false);
        }
      });

      hls.on(Hls.Events.FRAG_PARSED, () => {
        mediaRecoveryAttempts = 0;
      });

      hls.on(Hls.Events.FRAG_LOADED, (event, data) => {
        try {
          const frag = data?.frag;
          const stats = (data?.part && data.part.stats) || (frag && frag.stats) || data?.stats;
          if (stats && stats.loading) {
            const start = stats.loading.start || 0;
            const end = stats.loading.end || 0;
            const first = stats.loading.first || 0;
            const durationSec = end > start ? (end - start) / 1000 : 0;
            const loadedBytes =
              stats.loaded ||
              stats.total ||
              (data?.payload && data.payload.byteLength) ||
              (frag && frag.loaded) ||
              0;

            let instantSpeedMbps = 0;
            if (durationSec > 0 && loadedBytes > 0) {
              instantSpeedMbps = Number(((loadedBytes * 8) / (durationSec * 1000000)).toFixed(2));
            }

            let pingMs = 0;
            if (first > 0 && start > 0 && first >= start) {
              pingMs = Math.max(1, Math.round(first - start));
            } else if (hls.ttfbEstimate > 0) {
              pingMs = Math.max(1, Math.round(hls.ttfbEstimate));
            }

            const bwEstimateBps = hls.bandwidthEstimate || 0;
            const bwEstimateMbps = bwEstimateBps > 0 ? Number((bwEstimateBps / 1000000).toFixed(2)) : 0;

            const effectiveSpeed = instantSpeedMbps > 0 ? instantSpeedMbps : bwEstimateMbps;

            if (effectiveSpeed > 0) {
              networkStatsRef.current.speedMbps = effectiveSpeed;
            }
            if (pingMs > 0) {
              networkStatsRef.current.pingMs = pingMs;
            }
            if (bwEstimateBps > 0) {
              networkStatsRef.current.bandwidthEstimate = bwEstimateBps;
            }
            networkStatsRef.current.lastFragTime = Date.now();

            if (hls.levels && hls.currentLevel >= 0 && hls.levels[hls.currentLevel]) {
              const lvl = hls.levels[hls.currentLevel];
              networkStatsRef.current.qualityLabel = `${lvl.height || 720}p`;
            }
          }
        } catch (err) {}
      });
    } else if (v.canPlayType("application/vnd.apple.mpegurl")) {
      v.src = streamUrl;
      const onLoaded = () => {
        setIsBuffering(false);
        checkSavedResumeTime(v);
        v.play().catch(() => {});
      };
      v.addEventListener("loadedmetadata", onLoaded, { once: true });
    }

    return () => {
      if (hlsRef.current) {
        hlsRef.current.detachMedia();
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [currentVideo?.m3u8Url, isVmServer, checkSavedResumeTime]);

  // ============================================================
  // VIDEO EVENTS & TIMEUPDATE
  // ============================================================
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;

    let bufferingTimeout = null;

    const onPlay = () => {
      setIsPlaying(true);
      if (bufferingTimeout) clearTimeout(bufferingTimeout);
      setIsBuffering(false);
      handleUserActivity();
      if (v && playbackSpeedRef.current !== 1) {
        v.playbackRate = playbackSpeedRef.current;
      }
      if ("mediaSession" in navigator) {
        navigator.mediaSession.playbackState = "playing";
      }
    };
    const onPause = () => {
      setIsPlaying(false);
      if (bufferingTimeout) clearTimeout(bufferingTimeout);
      setIsBuffering(false);
      setUserActive(true);
      if (hideOverlayTimerRef.current) {
        clearTimeout(hideOverlayTimerRef.current);
      }
      if ("mediaSession" in navigator) {
        navigator.mediaSession.playbackState = "paused";
      }
    };
    const onWaiting = () => {
      // Nếu là server KK và bị kẹt/nghẽn đệm tại ngưỡng quảng cáo (14:57 -> 15:30)
      const cur = v ? v.currentTime : 0;
      if (isKkServer && cur >= 897 && cur <= 930 && !adSkippedRef.current) {
        if (bufferingTimeout) clearTimeout(bufferingTimeout);
        if (v) v.currentTime = 931; // Nhảy ngay tới 15:31 qua khỏi đoạn quảng cáo
        adSkippedRef.current = true;
        setShowSkipAd(false);
        setIsBuffering(false);
        if (hlsRef.current) {
          hlsRef.current.startLoad();
        }
        return;
      }

      if (bufferingTimeout) clearTimeout(bufferingTimeout);
      bufferingTimeout = setTimeout(() => {
        if (v && v.readyState < 3 && !v.paused) {
          setIsBuffering(true);
          if (hlsRef.current) {
            hlsRef.current.startLoad();
          }
        }
      }, 700);
    };
    const onPlaying = () => {
      if (bufferingTimeout) {
        clearTimeout(bufferingTimeout);
        bufferingTimeout = null;
      }
      if (isBufferingRef.current) {
        setIsBuffering(false);
      }
      if (v && playbackSpeedRef.current !== 1) {
        v.playbackRate = playbackSpeedRef.current;
      }
    };
    const onCanPlay = () => {
      if (bufferingTimeout) {
        clearTimeout(bufferingTimeout);
        bufferingTimeout = null;
      }
      if (isBufferingRef.current) {
        setIsBuffering(false);
      }
    };

    const onLoadedMetadata = () => {
      if (bufferingTimeout) clearTimeout(bufferingTimeout);
      if (isBufferingRef.current) {
        setIsBuffering(false);
      }
      const dur = v.duration || 0;
      durationRef.current = dur;
      if (durTimeRef.current && dur > 0) {
        durTimeRef.current.textContent = formatTime(dur);
      }
      try {
        v.volume = volumeRef.current;
        v.muted = isMutedRef.current;
        if (playbackSpeedRef.current !== 1) {
          v.playbackRate = playbackSpeedRef.current;
        }
      } catch (e) {}
    };

    const onEnded = () => {
      if (autoNextEp && onChangeEpisode && episodes.length > 0) {
        const curSlug = selectedEpisodeSlug || currentVideo?.slug;
        const curIdx = episodes.findIndex((ep) => ep.slug === curSlug);
        if (curIdx >= 0 && curIdx < episodes.length - 1) {
          onChangeEpisode(episodes[curIdx + 1].slug);
        }
      }
    };

    const onTimeUpdate = () => {
      const cur = v.currentTime;
      const dur = v.duration || durationRef.current || 0;

      // Nếu video đang phát ổn định, xóa buffering spinner nếu đang chờ
      if (v.readyState >= 3) {
        if (bufferingTimeout) {
          clearTimeout(bufferingTimeout);
          bufferingTimeout = null;
        }
        if (isBufferingRef.current) {
          setIsBuffering(false);
        }
      }

      if (dur > 0 && durationRef.current !== dur) {
        durationRef.current = dur;
        if (durTimeRef.current) {
          durTimeRef.current.textContent = formatTime(dur);
        }
      }

      if (!isDraggingSeekRef.current) {
        if (curTimeRef.current) {
          curTimeRef.current.textContent = formatTime(cur);
        }
        if (dur > 0) {
          const pct = Math.min(100, Math.max(0, (cur / dur) * 100));
          if (progressPlayedRef.current) {
            progressPlayedRef.current.style.width = `${pct}%`;
          }
          if (progressScrubberRef.current) {
            progressScrubberRef.current.style.left = `${pct}%`;
          }
        }
      }

      // Check Buffer Ahead
      if (v.buffered && v.buffered.length > 0 && dur > 0) {
        let bufEnd = 0;
        for (let i = 0; i < v.buffered.length; i++) {
          if (v.buffered.start(i) <= cur && cur <= v.buffered.end(i)) {
            bufEnd = v.buffered.end(i);
            break;
          }
        }
        const bufPct = Math.min(100, (bufEnd / dur) * 100);
        if (progressBufferedRef.current) {
          progressBufferedRef.current.style.width = `${bufPct}%`;
        }
      }

      // MediaSession position sync
      if ("mediaSession" in navigator && "setPositionState" in navigator.mediaSession) {
        if (dur > 0 && !isNaN(dur) && cur >= 0) {
          try {
            navigator.mediaSession.setPositionState({
              duration: dur,
              playbackRate: v.playbackRate || 1,
              position: Math.min(cur, dur),
            });
          } catch (e) {}
        }
      }

      // Save History to localStorage (key per movie + ep) - throttled to every 4s to eliminate disk I/O lag
      if (cur > 5 && !v.ended && Math.abs(cur - lastSavedTimeRef.current) >= 4) {
        lastSavedTimeRef.current = cur;
        const movieSlug = movie?.slug || "default";
        const key = `Mamphim_Pos_${movieSlug}_S${currentServer}_E${selectedEpisodeSlug || currentVideo?.slug || "0"}`;
        try {
          localStorage.setItem(key, cur);
        } catch (e) {}
      }

      // Skip Ad button for KKPhim: 14:57 (897s) -> 15:31 (931s)
      if (isKkServer) {
        if (cur < 897) {
          adSkippedRef.current = false;
          setShowSkipAd(false);
        } else if (cur >= 897 && cur <= 931) {
          if (!adSkippedRef.current) {
            setShowSkipAd(true);
          }
        } else {
          setShowSkipAd(false);
        }
      } else {
        setShowSkipAd(false);
      }
    };

    v.addEventListener("play", onPlay);
    v.addEventListener("pause", onPause);
    v.addEventListener("waiting", onWaiting);
    v.addEventListener("playing", onPlaying);
    v.addEventListener("canplay", onCanPlay);
    v.addEventListener("loadedmetadata", onLoadedMetadata);
    v.addEventListener("timeupdate", onTimeUpdate);
    v.addEventListener("ended", onEnded);

    return () => {
      if (bufferingTimeout) clearTimeout(bufferingTimeout);
      v.removeEventListener("play", onPlay);
      v.removeEventListener("pause", onPause);
      v.removeEventListener("waiting", onWaiting);
      v.removeEventListener("playing", onPlaying);
      v.removeEventListener("canplay", onCanPlay);
      v.removeEventListener("loadedmetadata", onLoadedMetadata);
      v.removeEventListener("timeupdate", onTimeUpdate);
      v.removeEventListener("ended", onEnded);
    };
  }, [
    movie?.slug,
    currentServer,
    selectedEpisodeSlug,
    currentVideo?.slug,
    isKkServer,
    autoNextEp,
    onChangeEpisode,
    episodes,
    handleUserActivity,
  ]);

  // ============================================================
  // NETWORK SPEED & STREAMING HEALTH MONITOR
  // ============================================================
  // 1. Reset chỉ số khi đổi tập hoặc server
  useEffect(() => {
    networkStatsRef.current = {
      speedMbps: 0,
      pingMs: 0,
      bufferAhead: 0,
      bandwidthEstimate: 0,
      qualityLabel: "",
      status: "connecting",
      statusText: "Đang kết nối...",
      advice: "Đang kết nối tới máy chủ CDN...",
      lastFragTime: 0,
    };

    const initialPayload = {
      speedMbps: 0,
      pingMs: 0,
      bufferAhead: 0,
      qualityLabel: "",
      status: "connecting",
      statusText: "Đang kết nối...",
      advice: "Đang kết nối tới máy chủ CDN...",
      isBuffering: true,
      serverName: activeServerObj?.display_name || activeServerObj?.server_name || "Mặc định",
      timestamp: Date.now(),
    };

    try {
      window.dispatchEvent(new CustomEvent("mamphim:network-stats", { detail: initialPayload }));
    } catch (e) {}
    if (onStatsUpdateRef.current) {
      onStatsUpdateRef.current(initialPayload);
    }
  }, [currentVideo?.slug, currentServer, activeServerObj]);

  // 2. Định kỳ cập nhật chỉ số mạng, buffer và tốc độ tải mỗi 1s
  useEffect(() => {
    const intervalId = setInterval(() => {
      const v = videoRef.current;
      if (!v) return;

      let bufferAhead = 0;
      if (v.buffered && v.buffered.length > 0) {
        const cur = v.currentTime;
        for (let i = 0; i < v.buffered.length; i++) {
          if (v.buffered.start(i) <= cur && cur <= v.buffered.end(i)) {
            bufferAhead = Math.max(0, Math.round(v.buffered.end(i) - cur));
            break;
          }
        }
      }
      networkStatsRef.current.bufferAhead = bufferAhead;

      // Đồng bộ thêm từ instance Hls.js nếu có
      const hls = hlsRef.current;
      if (hls) {
        if (hls.bandwidthEstimate && hls.bandwidthEstimate > 0) {
          const bwMbps = Number((hls.bandwidthEstimate / 1000000).toFixed(2));
          if (bwMbps > 0 && (!networkStatsRef.current.speedMbps || networkStatsRef.current.speedMbps === 0)) {
            networkStatsRef.current.speedMbps = bwMbps;
          }
        }
        if (hls.ttfbEstimate && hls.ttfbEstimate > 0 && (!networkStatsRef.current.pingMs || networkStatsRef.current.pingMs === 0)) {
          networkStatsRef.current.pingMs = Math.round(hls.ttfbEstimate);
        }
        if (hls.levels && hls.currentLevel >= 0 && hls.levels[hls.currentLevel]) {
          const lvl = hls.levels[hls.currentLevel];
          networkStatsRef.current.qualityLabel = `${lvl.height || 720}p`;
        }
      }

      const speed = networkStatsRef.current.speedMbps;
      const ping = networkStatsRef.current.pingMs;
      const isBuf = isBuffering;

      let status = "good";
      let statusText = "Mượt mà";
      let advice = "Đường truyền máy chủ ổn định, xem mượt mà.";

      if (isBuf) {
        status = "buffering";
        statusText = "Đang nạp đệm...";
        advice = "Đang tải dữ liệu phân đoạn video tiếp theo...";
      } else if (speed >= 8 || bufferAhead >= 20) {
        status = "excellent";
        statusText = "Siêu mượt";
        advice = "Đường truyền CDN rất mạnh, xem Full HD/2K cực mượt không lo giật.";
      } else if (speed >= 3.5 || bufferAhead >= 8) {
        status = "good";
        statusText = "Mượt mà";
        advice = "Tốc độ ổn định, phát mượt mà không khựng.";
      } else if (speed >= 1.2 || bufferAhead >= 3) {
        status = "normal";
        statusText = "Bình thường";
        advice = "Đủ xem ổn định, có thể chờ vài giây khi tua nhanh.";
      } else if (speed > 0 || bufferAhead > 0) {
        status = "slow";
        statusText = "Dễ giật / Lag";
        advice = "Tốc độ tải chậm hoặc CDN phản hồi chậm. Nếu bị đứng hình, bạn nên đổi server khác ở trên!";
      } else {
        status = "connecting";
        statusText = "Đang kết nối...";
        advice = "Đang kết nối tới máy chủ CDN...";
      }

      const payload = {
        speedMbps: networkStatsRef.current.speedMbps,
        pingMs: ping,
        bufferAhead,
        qualityLabel:
          networkStatsRef.current.qualityLabel ||
          (gearBadgeText !== "Auto" ? gearBadgeText : ""),
        status,
        statusText,
        advice,
        isBuffering: isBuf,
        serverName: activeServerObj?.display_name || activeServerObj?.server_name || "Mặc định",
        timestamp: Date.now(),
      };

      try {
        window.dispatchEvent(new CustomEvent("mamphim:network-stats", { detail: payload }));
      } catch (e) {}

      if (onStatsUpdateRef.current) {
        onStatsUpdateRef.current(payload);
      }
    }, 1000);

    return () => clearInterval(intervalId);
  }, [isBuffering, activeServerObj, gearBadgeText]);

  // ============================================================
  // PROGRESS BAR DRAGGING / SCRUBBING
  // ============================================================
  const updateSeekPos = (clientX) => {
    const el = progressContainerRef.current;
    if (!el) return 0;
    const rect = el.getBoundingClientRect();
    const pos = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    const dur = durationRef.current || (videoRef.current ? videoRef.current.duration : 0) || 0;
    const targetTime = pos * dur;
    if (curTimeRef.current) {
      curTimeRef.current.textContent = formatTime(targetTime);
    }
    if (progressPlayedRef.current) {
      progressPlayedRef.current.style.width = `${pos * 100}%`;
    }
    if (progressScrubberRef.current) {
      progressScrubberRef.current.style.left = `${pos * 100}%`;
    }
    return targetTime;
  };

  const handleSeekMouseDown = (e) => {
    isDraggingSeekRef.current = true;
    updateSeekPos(e.clientX);

    const onMouseMove = (moveEvt) => {
      if (isDraggingSeekRef.current) {
        updateSeekPos(moveEvt.clientX);
      }
    };

    const onMouseUp = (upEvt) => {
      if (isDraggingSeekRef.current) {
        const finalTime = updateSeekPos(upEvt.clientX);
        if (videoRef.current && finalTime !== undefined) {
          videoRef.current.currentTime = finalTime;
        }
        isDraggingSeekRef.current = false;
        justFinishedDraggingRef.current = true;
        setTimeout(() => {
          justFinishedDraggingRef.current = false;
        }, 150);
      }
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
  };

  const handleSeekTouchStart = (e) => {
    if (!e.touches[0]) return;
    isDraggingSeekRef.current = true;
    updateSeekPos(e.touches[0].clientX);

    const onTouchMove = (moveEvt) => {
      if (isDraggingSeekRef.current && moveEvt.touches[0]) {
        updateSeekPos(moveEvt.touches[0].clientX);
      }
    };

    const onTouchEnd = (endEvt) => {
      if (isDraggingSeekRef.current) {
        const touch = endEvt.changedTouches[0];
        if (touch) {
          const finalTime = updateSeekPos(touch.clientX);
          if (videoRef.current && finalTime !== undefined) {
            videoRef.current.currentTime = finalTime;
          }
        }
        isDraggingSeekRef.current = false;
        justFinishedDraggingRef.current = true;
        setTimeout(() => {
          justFinishedDraggingRef.current = false;
        }, 150);
      }
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", onTouchEnd);
    };

    window.addEventListener("touchmove", onTouchMove);
    window.addEventListener("touchend", onTouchEnd);
  };

  // ============================================================
  // PROGRESS BAR HOVER TOOLTIP (Zero re-render)
  // ============================================================
  const handleProgressHover = (e) => {
    const el = progressContainerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const pos = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const dur = durationRef.current || (videoRef.current ? videoRef.current.duration : 0) || 0;
    const hoverTime = pos * dur;

    if (hoverTooltipRef.current) {
      hoverTooltipRef.current.style.display = "block";
      hoverTooltipRef.current.style.left = `${pos * 100}%`;
    }
    if (hoverTimeRef.current) {
      hoverTimeRef.current.textContent = formatTime(hoverTime);
    }
  };

  const handleProgressLeave = () => {
    if (hoverTooltipRef.current) {
      hoverTooltipRef.current.style.display = "none";
    }
  };

  // ============================================================
  // STAGE SCREEN CLICK & KEYBOARD SHORTCUTS
  // ============================================================
  const handleStagePointerDown = (e) => {
    if (
      e.target.closest(
        ".player-bottom-bar, .settings-popup, .episodes-drawer, .server-menu-popup, .rop-resume-notify, .btn-top-server, .btn-top-eps, .btn-skip-ad, button, input"
      )
    ) {
      return;
    }
    // Ghi nhận chính xác xem tại thời điểm bắt đầu chạm/click thì controls có đang ẩn hay không
    wasHiddenAtInteractionStartRef.current = !userActiveRef.current;
  };

  const handleStageClick = (e) => {
    if (justFinishedDraggingRef.current) return;

    // Bỏ qua nếu click vào controls, popups, drawer, toasts, buttons
    if (
      e.target.closest(
        ".player-bottom-bar, .settings-popup, .episodes-drawer, .server-menu-popup, .rop-resume-notify, .btn-top-server, .btn-top-eps, .btn-skip-ad, button, input"
      )
    ) {
      return;
    }

    // Nếu đang mở popup hoặc drawer, click ra ngoài chỉ đóng lại
    if (showServerMenu || showSettings || showEpisodesDrawer) {
      setShowServerMenu(false);
      setShowSettings(false);
      setShowEpisodesDrawer(false);
      return;
    }

    // Nếu controls đang ẩn lúc bắt đầu chạm/click HOẶC vừa mới được đánh thức
    // -> Chỉ hiển thị controls trước, KHÔNG pause/play
    const wasHiddenAtStart = wasHiddenAtInteractionStartRef.current;
    const wasCurrentlyHidden = !userActiveRef.current;
    const justWokeUp = Date.now() - lastBecameActiveRef.current < 450;

    if (wasHiddenAtStart || wasCurrentlyHidden || justWokeUp) {
      wasHiddenAtInteractionStartRef.current = false;
      setUserActive(true);
      lastBecameActiveRef.current = 0; // Đã hoàn tất đánh thức
      handleUserActivity();
      return;
    }

    // Nếu controls ĐÃ HIỆN từ trước và user click vào màn hình -> Mới toggle play/pause
    const willPlay = !isPlaying;
    togglePlay();
    triggerCenterFlash(willPlay);
    handleUserActivity();
  };

  const handleStageDoubleClick = (e) => {
    if (
      e.target.closest(
        ".player-bottom-bar, .settings-popup, .episodes-drawer, .server-menu-popup, .rop-resume-notify, .btn-top-server, .btn-top-eps, .btn-skip-ad, button, input"
      )
    ) {
      return;
    }
    if (window.innerWidth > 768) {
      toggleFullscreen();
    }
  };

  // Keyboard Shortcuts
  useEffect(() => {
    const onKeyDown = (e) => {
      if (["input", "textarea"].includes(e.target.tagName?.toLowerCase())) return;
      if (e.code === "Space" || e.code === "KeyK") {
        e.preventDefault();
        togglePlay();
      } else if (e.code === "ArrowLeft" || e.code === "KeyJ") {
        e.preventDefault();
        seekRelative(-10);
      } else if (e.code === "ArrowRight" || e.code === "KeyL") {
        e.preventDefault();
        seekRelative(10);
      } else if (e.code === "KeyF") {
        e.preventDefault();
        toggleFullscreen();
      } else if (e.code === "KeyM") {
        e.preventDefault();
        toggleMute();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [togglePlay, seekRelative, toggleFullscreen, toggleMute]);

  // Click outside to close menus
  useEffect(() => {
    const onClickOutside = (e) => {
      if (!e.target.closest(".server-dropdown-wrap")) {
        setShowServerMenu(false);
      }
      if (!e.target.closest(".settings-btn-wrap") && !e.target.closest(".settings-popup")) {
        setShowSettings(false);
      }
      if (!e.target.closest(".episodes-drawer") && !e.target.closest(".btn-top-eps")) {
        setShowEpisodesDrawer(false);
      }
    };

    window.addEventListener("click", onClickOutside);
    return () => window.removeEventListener("click", onClickOutside);
  }, []);

  // Subtitle selection
  const handleSelectSubtitle = (subName, trackIdx = -1) => {
    setSelectedSubtitle(subName);
    setCurrentSubtitle(trackIdx);
    if (hlsRef.current) {
      try {
        hlsRef.current.subtitleTrack = trackIdx;
      } catch (e) {}
    }
    const v = videoRef.current;
    if (v && v.textTracks) {
      for (let i = 0; i < v.textTracks.length; i++) {
        v.textTracks[i].mode =
          trackIdx === -1 || subName === "Tắt"
            ? "disabled"
            : i === trackIdx
            ? "showing"
            : "disabled";
      }
    }
    setShowSettings(false);
  };

  // Quality Level selection
  const handleSelectQuality = (lvlIdx) => {
    if (hlsRef.current) {
      hlsRef.current.currentLevel = lvlIdx;
      hlsRef.current.loadLevel = lvlIdx;
      if (lvlIdx === -1) {
        setGearBadgeText("Auto");
      } else {
        const lvl = levels[lvlIdx];
        if (lvl) setGearBadgeText(`${lvl.height}p`);
      }
    }
    setCurrentLevel(lvlIdx);
    setShowSettings(false);
  };

  // Speed selection
  const handleSelectSpeed = (sp) => {
    setPlaybackSpeed(sp);
    playbackSpeedRef.current = sp;
    if (videoRef.current) {
      videoRef.current.defaultPlaybackRate = sp;
      videoRef.current.playbackRate = sp;
    }
    setShowSettings(false);
  };

  const activeServerName = activeServerObj?.display_name || activeServerObj?.server_name || "Server";

  return (
    <div
      ref={containerRef}
      className={`hls-player-wrapper ${userActive ? "user-active" : ""} ${
        isFullscreen ? "is-fullscreen" : ""
      }`}
      onMouseMove={handleUserActivity}
      onMouseEnter={handleUserActivity}
      onMouseLeave={handleMouseLeave}
      onTouchStart={handleUserActivity}
    >
      <div
        className="player-stage"
        onPointerDown={handleStagePointerDown}
        onClick={handleStageClick}
        onDoubleClick={handleStageDoubleClick}
      >
        {/* VIDEO CORE HOẶC EMBED IFRAME */}
        {isVmServer || !currentVideo?.m3u8Url ? (
          currentVideo?.embedUrl ? (
            <iframe
              key={currentVideo.embedUrl}
              src={currentVideo.embedUrl}
              title={`Phim ${movie?.name || ""} - ${currentVideo.name}`}
              className="embed-frame"
              allow="autoplay; encrypted-media; picture-in-picture;"
              allowFullScreen
              referrerPolicy="strict-origin-when-cross-origin"
            />
          ) : (
            <div className="d-flex align-items-center justify-content-center w-100 h-100 bg-dark text-white">
              Đang tải video...
            </div>
          )
        ) : (
          <video
            ref={videoRef}
            className="video-core"
            playsInline
            webkit-playsinline="true"
            x5-playsinline="true"
            preload="auto"
            crossOrigin="anonymous"
            poster={posterUrl || thumbUrl}
          />
        )}

        {/* LOADING BUFFER SPINNER */}
        {isBuffering && !isVmServer && <div className="loading-spinner" />}

        {/* CENTER FLASH ICON (Khi play/pause trên PC) */}
        {centerFlash && (
          <div key={centerFlash.time} className="center-play-flash animate">
            {centerFlash.isPlaying ? (
              <svg viewBox="0 0 24 24" fill="currentColor" style={{ marginLeft: 3 }}>
                <polygon points="6,4 20,12 6,20" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" fill="currentColor">
                <rect x="5" y="4" width="4.5" height="16" rx="1.5" />
                <rect x="14.5" y="4" width="4.5" height="16" rx="1.5" />
              </svg>
            )}
          </div>
        )}

        {/* NÚT BỎ QUA QUẢNG CÁO TẠI 14:57 - 15:31 (CHO KKPHIM) */}
        {showSkipAd && !isVmServer && (
          <button
            className="btn-skip-ad"
            onClick={handleSkipAd}
            title="Bỏ qua quảng cáo đến 15:31"
          >
            <span>Bỏ qua quảng cáo</span>
            <FaForwardStep />
          </button>
        )}

        {/* ================= TOP BAR OVERLAY ================= */}
        <div className="player-overlay player-top-bar">
          <div className="top-left-info">
            <div className="movie-title-text">{movie?.name || "Video Player"}</div>
            <div className="movie-sub-text">
              {currentVideo?.name || "Full"} ({movie?.quality || "FHD"})
            </div>
          </div>

          <div className="top-right-actions">
            {/* SERVER DROPDOWN */}
            <div className="server-dropdown-wrap">
              <button
                className="btn-top-server"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowServerMenu((prev) => !prev);
                  setShowSettings(false);
                  setShowEpisodesDrawer(false);
                }}
              >
                {/* SVG 2 Server Blade Drives */}
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                >
                  <rect x="3" y="4" width="18" height="6" rx="1.5" />
                  <circle cx="6" cy="7" r="1" fill="currentColor" />
                  <circle cx="9" cy="7" r="1" fill="currentColor" />
                  <rect x="3" y="14" width="18" height="6" rx="1.5" />
                  <circle cx="6" cy="17" r="1" fill="currentColor" />
                  <circle cx="9" cy="17" r="1" fill="currentColor" />
                </svg>
                <span>Server: {activeServerName}</span>
              </button>

              <div className={`server-menu-popup ${showServerMenu ? "show" : ""}`}>
                {servers.map((s, idx) => (
                  <div
                    key={idx}
                    className={`server-item ${idx === currentServer ? "active" : ""}`}
                    onClick={() => {
                      setShowServerMenu(false);
                      if (onChangeServer) onChangeServer(idx);
                    }}
                  >
                    <span>{s.display_name || s.server_name}</span>
                    <FaCheck className="check-icon" />
                  </div>
                ))}
              </div>
            </div>

            {/* EPISODES DRAWER BUTTON */}
            <button
              className="btn-top-eps"
              onClick={(e) => {
                e.stopPropagation();
                setShowEpisodesDrawer((prev) => !prev);
                setShowServerMenu(false);
                setShowSettings(false);
              }}
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
              >
                <rect x="2" y="7" width="20" height="14" rx="2" />
                <polygon points="10,11 15,14 10,17" fill="currentColor" />
                <line x1="5" y1="4" x2="19" y2="4" />
                <line x1="8" y1="1" x2="16" y2="1" />
              </svg>
              <span>Danh sách tập</span>
            </button>
          </div>
        </div>

        {/* ================= EPISODES DRAWER ================= */}
        <div className={`episodes-drawer ${showEpisodesDrawer ? "open" : ""}`}>
          <div className="drawer-header">
            <div className="drawer-title">{movie?.name || "Danh sách tập"}</div>
            <button
              className="btn-drawer-close"
              onClick={(e) => {
                e.stopPropagation();
                setShowEpisodesDrawer(false);
              }}
            >
              <FaXmark />
            </button>
          </div>

          <div className="season-indicator-row">
            <div className="season-badge-btn">
              <FaBarsStaggered />
              <span>{episodes.length} tập</span>
            </div>
          </div>

          <div className="drawer-episodes-list">
            {episodes.map((ep, idx) => {
              const isEpActive =
                ep.slug === selectedEpisodeSlug ||
                (!selectedEpisodeSlug && ep.slug === currentVideo?.slug);
              let epLabel = ep.name || `Tập ${idx + 1}`;
              if (!isNaN(epLabel)) {
                epLabel = `Tập ${epLabel}`;
              }

              return (
                <div
                  key={ep.slug || idx}
                  className={`drawer-ep-card ${isEpActive ? "active" : ""}`}
                  onClick={() => {
                    setShowEpisodesDrawer(false);
                    if (onChangeEpisode) onChangeEpisode(ep.slug);
                  }}
                >
                  <div className="drawer-ep-thumb">
                    <img src={thumbUrl || posterUrl} alt={epLabel} loading="lazy" />
                  </div>
                  <div className="drawer-ep-label">{epLabel}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ================= RESUME TOAST ================= */}
        {showResumeToast && (
          <div className="rop-resume-notify">
            <div className="rn-text">
              Hệ thống đã tự động tiếp tục phát tại <strong>{resumeTimeText}</strong> từ lần xem trước.
            </div>
            <button type="button" className="rn-action" onClick={restartPlayback}>
              <FaRotateLeft /> Xem từ đầu
            </button>
            <button
              type="button"
              className="btn-close-toast"
              onClick={() => setShowResumeToast(false)}
            >
              &times;
            </button>
          </div>
        )}

        {/* ================= SETTINGS POPUP ================= */}
        <div
          className={`settings-popup ${showSettings ? "show" : ""}`}
          onClick={(e) => e.stopPropagation()}
          onMouseDown={(e) => e.stopPropagation()}
          onTouchStart={(e) => e.stopPropagation()}
        >
          {settingsTab !== "main" && (
            <div className="settings-header">
              <button
                type="button"
                className="settings-back-btn show"
                onClick={(e) => {
                  e.stopPropagation();
                  setSettingsTab("main");
                }}
              >
                <FaChevronLeft />
              </button>
              <span>
                {settingsTab === "quality"
                  ? "Chất lượng"
                  : settingsTab === "subtitle"
                  ? "Phụ đề"
                  : "Tốc độ phát"}
              </span>
            </div>
          )}

          {settingsTab === "main" && (
            <div className="settings-submenu-wrap">
              <div
                className="settings-row"
                onClick={(e) => {
                  e.stopPropagation();
                  setSettingsTab("quality");
                }}
              >
                <span className="settings-label">Chất lượng</span>
                <span className="settings-val">
                  <span>{gearBadgeText}</span> <FaChevronRight />
                </span>
              </div>
              <div
                className="settings-row"
                onClick={(e) => {
                  e.stopPropagation();
                  setSettingsTab("subtitle");
                }}
              >
                <span className="settings-label">Phụ đề</span>
                <span className="settings-val">
                  <span>{selectedSubtitle}</span> <FaChevronRight />
                </span>
              </div>
              <div
                className="settings-row"
                onClick={(e) => {
                  e.stopPropagation();
                  setSettingsTab("speed");
                }}
              >
                <span className="settings-label">Tốc độ phát</span>
                <span className="settings-val">
                  <span>{playbackSpeed === 1 ? "1x (Chuẩn)" : `${playbackSpeed}x`}</span>{" "}
                  <FaChevronRight />
                </span>
              </div>
              <div
                className="settings-row"
                onClick={(e) => {
                  e.stopPropagation();
                  setAutoNextEp((prev) => !prev);
                }}
              >
                <span className="settings-label">Tự chuyển tập</span>
                <span className="settings-val">
                  <span
                    style={{
                      color: autoNextEp ? "var(--hls-accent)" : "var(--hls-text-muted)",
                      fontWeight: 600,
                    }}
                  >
                    {autoNextEp ? "Bật" : "Tắt"}
                  </span>
                </span>
              </div>
            </div>
          )}

          {settingsTab === "quality" && (
            <div className="settings-submenu-wrap">
              <div
                className="settings-row"
                onClick={(e) => {
                  e.stopPropagation();
                  handleSelectQuality(-1);
                }}
              >
                <span className="settings-label">
                  Auto {levels.length <= 1 ? "(Gốc)" : "(Thích ứng)"}
                </span>
                <span className="settings-val">
                  {currentLevel === -1 && <FaCheck style={{ color: "var(--hls-accent)" }} />}
                </span>
              </div>
              {levels.length === 1 && (
                <div
                  className="settings-row"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSelectQuality(0);
                  }}
                >
                  <span className="settings-label">{levels[0].height}p (Chất lượng gốc)</span>
                  <span className="settings-val">
                    {currentLevel === 0 && <FaCheck style={{ color: "var(--hls-accent)" }} />}
                  </span>
                </div>
              )}
              {levels.length > 1 &&
                levels.slice().reverse().map((lvl, revIdx) => {
                  const origIdx = levels.length - 1 - revIdx;
                  const isSelected = currentLevel === origIdx;
                  return (
                    <div
                      key={origIdx}
                      className="settings-row"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSelectQuality(origIdx);
                      }}
                    >
                      <span className="settings-label">{lvl.height}p</span>
                      <span className="settings-val">
                        {isSelected && <FaCheck style={{ color: "var(--hls-accent)" }} />}
                      </span>
                    </div>
                  );
                })}
            </div>
          )}

          {settingsTab === "subtitle" && (
            <div className="settings-submenu-wrap">
              {subtitleTracks && subtitleTracks.length > 0 ? (
                <>
                  <div
                    className="settings-row"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSelectSubtitle("Tắt", -1);
                    }}
                  >
                    <span className="settings-label">Tắt</span>
                    <span className="settings-val">
                      {currentSubtitle === -1 && <FaCheck style={{ color: "var(--hls-accent)" }} />}
                    </span>
                  </div>
                  {subtitleTracks.map((tr, idx) => (
                    <div
                      key={idx}
                      className="settings-row"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSelectSubtitle(tr.name || tr.lang || `Phụ đề ${idx + 1}`, idx);
                      }}
                    >
                      <span className="settings-label">{tr.name || tr.lang || `Phụ đề ${idx + 1}`}</span>
                      <span className="settings-val">
                        {currentSubtitle === idx && <FaCheck style={{ color: "var(--hls-accent)" }} />}
                      </span>
                    </div>
                  ))}
                </>
              ) : (
                <>
                  <div
                    className="settings-row"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSelectSubtitle("Vietsub (Mặc định)", 0);
                    }}
                  >
                    <span className="settings-label">Vietsub (Mặc định)</span>
                    <span className="settings-val">
                      <FaCheck style={{ color: "var(--hls-accent)" }} />
                    </span>
                  </div>
                  <div
                    className="settings-row"
                    style={{ opacity: 0.6 }}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSelectSubtitle("Tắt", -1);
                    }}
                  >
                    <span className="settings-label">Tắt</span>
                    <span className="settings-val">
                      <span style={{ fontSize: 11, color: "var(--hls-text-muted)" }}>Lồng sẵn</span>
                    </span>
                  </div>
                  <div style={{ padding: "6px 12px", fontSize: "11px", color: "var(--hls-text-muted)", lineHeight: 1.4 }}>
                    * Phim đã được lồng sẵn phụ đề Tiếng Việt trực tiếp vào video.
                  </div>
                </>
              )}
            </div>
          )}

          {settingsTab === "speed" && (
            <div className="settings-submenu-wrap speed-submenu-wrap">
              {[0.5, 0.75, 1, 1.25, 1.5, 2].map((sp) => (
                <div
                  key={sp}
                  className="settings-row"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSelectSpeed(sp);
                  }}
                >
                  <span className="settings-label">
                    {sp === 1 ? "1x (Chuẩn)" : `${sp}x`}
                  </span>
                  <span className="settings-val">
                    {playbackSpeed === sp && (
                      <FaCheck style={{ color: "var(--hls-accent)" }} />
                    )}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ================= BOTTOM CONTROLS BAR ================= */}
        <div className="player-overlay player-bottom-bar">
          {/* TIME LABELS */}
          <div className="time-indicators-row">
            <span ref={curTimeRef}>0:00:00</span>
            <span ref={durTimeRef}>0:00:00</span>
          </div>

          {/* PROGRESS BAR CONTAINER */}
          <div
            ref={progressContainerRef}
            className="progress-bar-container"
            onMouseDown={handleSeekMouseDown}
            onTouchStart={handleSeekTouchStart}
            onMouseMove={handleProgressHover}
            onMouseLeave={handleProgressLeave}
          >
            {/* TOOLTIP HIỂN THỊ THỜI GIAN KHI RÊ CHUỘT */}
            <div ref={hoverTooltipRef} className="seek-hover-tooltip">
              <span ref={hoverTimeRef}>0:00:00</span>
            </div>

            <div className="progress-track">
              <div
                ref={progressBufferedRef}
                className="progress-buffered"
                style={{ width: "0%" }}
              />
              <div
                ref={progressPlayedRef}
                className="progress-played"
                style={{ width: "0%" }}
              />
            </div>
            <div
              ref={progressScrubberRef}
              className="progress-scrubber"
              style={{ left: "0%" }}
            />
          </div>

          {/* CONTROLS ROW */}
          <div className="controls-row">
            <div className="controls-left">
              {/* PLAY/PAUSE */}
              <button
                className="ctrl-icon-btn btn-play-pause"
                onClick={togglePlay}
                title="Phát / Dừng (Space)"
              >
                {isPlaying ? (
                  <svg
                    viewBox="0 0 24 24"
                    width="30"
                    height="30"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <circle cx="12" cy="12" r="10" />
                    <line x1="10" y1="8" x2="10" y2="16" />
                    <line x1="14" y1="8" x2="14" y2="16" />
                  </svg>
                ) : (
                  <svg
                    viewBox="0 0 24 24"
                    width="30"
                    height="30"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <circle cx="12" cy="12" r="10" />
                    <polygon points="10,8 16,12 10,16" fill="currentColor" />
                  </svg>
                )}
              </button>

              {/* TUA LÙI 10S */}
              <button
                className="ctrl-icon-btn"
                onClick={() => seekRelative(-10)}
                title="Tua lại 10 giây (←)"
              >
                <svg
                  viewBox="0 0 24 24"
                  width="25"
                  height="25"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                >
                  <path d="M12 4a8 8 0 1 0 7.5 5.5" />
                  <polyline points="19.5 4 19.5 9.5 14 9.5" />
                  <text
                    x="12"
                    y="14.5"
                    fontSize="7.5"
                    fontFamily="sans-serif"
                    fontWeight="700"
                    textAnchor="middle"
                    fill="currentColor"
                    stroke="none"
                  >
                    10
                  </text>
                </svg>
              </button>

              {/* TUA TỚI 10S */}
              <button
                className="ctrl-icon-btn"
                onClick={() => seekRelative(10)}
                title="Tua tới 10 giây (→)"
              >
                <svg
                  viewBox="0 0 24 24"
                  width="25"
                  height="25"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                >
                  <path d="M12 4a8 8 0 1 1-7.5 5.5" />
                  <polyline points="4.5 4 4.5 9.5 10 9.5" />
                  <text
                    x="12"
                    y="14.5"
                    fontSize="7.5"
                    fontFamily="sans-serif"
                    fontWeight="700"
                    textAnchor="middle"
                    fill="currentColor"
                    stroke="none"
                  >
                    10
                  </text>
                </svg>
              </button>

              {/* VOLUME */}
              <div className="volume-wrap">
                <button
                  className="ctrl-icon-btn"
                  onClick={toggleMute}
                  title="Bật/Tắt âm (M)"
                >
                  {isMuted || volume === 0 ? (
                    <FaVolumeXmark style={{ fontSize: 18 }} />
                  ) : volume < 0.5 ? (
                    <FaVolumeLow style={{ fontSize: 18 }} />
                  ) : (
                    <FaVolumeHigh style={{ fontSize: 18 }} />
                  )}
                </button>
                <input
                  type="range"
                  className="volume-slider-range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={isMuted ? 0 : volume}
                  onChange={(e) => handleVolumeChange(e.target.value)}
                />
              </div>
            </div>

            <div className="controls-right">
              {/* PICTURE IN PICTURE */}
              <button
                className="ctrl-icon-btn"
                onClick={togglePiP}
                title="Hình trong hình (PiP)"
              >
                <svg
                  width="22"
                  height="22"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                >
                  <rect x="2" y="4" width="20" height="16" rx="2" />
                  <rect
                    x="12"
                    y="11"
                    width="8"
                    height="7"
                    rx="1"
                    fill="currentColor"
                    stroke="none"
                  />
                </svg>
              </button>

              {/* SETTINGS GEAR WITH BADGE */}
              <div className="settings-btn-wrap">
                <span className="gear-badge">{gearBadgeText}</span>
                <button
                  className="ctrl-icon-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowSettings((prev) => !prev);
                    setSettingsTab("main");
                    setShowServerMenu(false);
                    setShowEpisodesDrawer(false);
                  }}
                  title="Cài đặt"
                >
                  <FaGear style={{ fontSize: 19 }} />
                </button>
              </div>

              {/* FULLSCREEN */}
              <button
                className="ctrl-icon-btn btn-fullscreen"
                onClick={toggleFullscreen}
                title="Toàn màn hình (F)"
              >
                {isFullscreen ? (
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3" />
                  </svg>
                ) : (
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M3 8V5a2 2 0 0 1 2-2h3M16 3h3a2 2 0 0 1 2 2v3M21 16v3a2 2 0 0 1-2 2h-3M8 21H5a2 2 0 0 1-2-2v-3" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
