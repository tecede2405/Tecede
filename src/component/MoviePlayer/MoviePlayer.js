import { useEffect, useRef, useState, useCallback } from "react";
import Hls from "hls.js";
import { FaPlay, FaPause } from "react-icons/fa";
import "./style.scss";

export default function MoviePlayer({ src, title, poster }) {
  const videoRef = useRef(null);
  const playerRef = useRef(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState("00:00");
  const [duration, setDuration] = useState("00:00");
  const [volume, setVolume] = useState(1);
  const [showCenter, setShowCenter] = useState(false);
  const [controlsVisible, setControlsVisible] = useState(true);
  const [previewTime, setPreviewTime] = useState("00:00");
  const [previewLeft, setPreviewLeft] = useState(0);
  const [showPreview, setShowPreview] = useState(false);
  const [showSkip, setShowSkip] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [isBuffering, setIsBuffering] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const hideTimeout = useRef(null);
  const centerTimeout = useRef(null);

  const storageKey = `movie-progress-${src}`;
  const VOLUME_KEY = "movie-volume";

  const isMobile = /Android|iPhone|iPad|iPod/i.test(
    typeof window !== "undefined" ? navigator.userAgent : ""
  );

  const showCenterIcon = () => {
    setShowCenter(true);
    clearTimeout(centerTimeout.current);
    centerTimeout.current = setTimeout(() => {
      setShowCenter(false);
    }, 600);
  };

  useEffect(() => {
    setProgress(0);
    setCurrentTime("00:00");
    setDuration("00:00");
  }, [src]);

  // HLS & Media Session Setup
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !src) return;

    if ("mediaSession" in navigator) {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: title || "Movie",
        artist: "Tecede",
        album: "Movie Player",
        artwork: [
          {
            src: poster,
            sizes: "512x512",
            type: "image/png",
          },
        ],
      });

      navigator.mediaSession.setActionHandler("play", () => {
        video.play().catch(() => {});
      });
      navigator.mediaSession.setActionHandler("pause", () => {
        video.pause();
      });
      navigator.mediaSession.setActionHandler("seekbackward", () => {
        video.currentTime = Math.max(0, video.currentTime - 10);
      });
      navigator.mediaSession.setActionHandler("seekforward", () => {
        if (video.duration) {
          video.currentTime = Math.min(video.duration, video.currentTime + 10);
        }
      });
    }

    let hls;
    if (Hls.isSupported()) {
      hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 90,
        maxBufferLength: 30,
        maxMaxBufferLength: 60,
        capLevelToPlayerSize: true,
        startLevel: -1,
        abrEwmaDefaultEstimate: 5000000,
      });
      hls.loadSource(src);
      hls.attachMedia(video);
    } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = src;
    }

    return () => {
      if (hls) hls.destroy();
    };
  }, [src, title, poster]);

  // Kiểm tra thời gian hiển thị nút Bỏ qua quảng cáo
  useEffect(() => {
    const interval = setInterval(() => {
      const video = videoRef.current;
      if (!video) return;
      const current = video.currentTime;
      setShowSkip(current >= 899 && current <= 929);
    }, 500);

    return () => clearInterval(interval);
  }, []);

  // Khôi phục âm lượng & thời gian đã lưu
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const savedVolume = localStorage.getItem(VOLUME_KEY);
    if (isMobile) {
      video.volume = 1;
      setVolume(1);
    } else if (savedVolume !== null) {
      const parsedVolume = parseFloat(savedVolume);
      video.volume = parsedVolume;
      setVolume(parsedVolume);
    }

    const savedTime = localStorage.getItem(storageKey);
    if (savedTime && !isNaN(savedTime)) {
      video.currentTime = parseFloat(savedTime);
    }
  }, [isMobile, storageKey]);

  // Tự động lưu tiến độ xem sau mỗi 2 giây
  useEffect(() => {
    const interval = setInterval(() => {
      const video = videoRef.current;
      if (!video || !video.duration) return;
      localStorage.setItem(storageKey, video.currentTime);
    }, 2000);

    return () => clearInterval(interval);
  }, [storageKey]);

  const formatTime = (seconds) => {
    if (isNaN(seconds)) return "00:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  const togglePlay = useCallback(async () => {
    const video = videoRef.current;
    if (!video) return;

    try {
      if (video.paused) {
        await video.play();
      } else {
        video.pause();
      }
      showCenterIcon();
    } catch (err) {
      console.log("Play/Pause bị chặn:", err);
    }
  }, []);

  const skip = useCallback((sec) => {
    const video = videoRef.current;
    if (!video || !video.duration) return;
    video.currentTime = Math.max(0, Math.min(video.duration, video.currentTime + sec));
  }, []);

  const updateProgress = () => {
    const video = videoRef.current;
    if (!video) return;

    setProgress(video.duration ? (video.currentTime / video.duration) * 100 : 0);
    setCurrentTime(formatTime(video.currentTime));
  };

  const handleSeek = (e) => {
    const video = videoRef.current;
    if (!video || !video.duration) return;

    const value = e.target.value;
    const newTime = (value / 100) * video.duration;

    setProgress(Number(value));
    setCurrentTime(formatTime(newTime));
    video.currentTime = newTime;
  };

  const handleVolume = (e) => {
    const video = videoRef.current;
    if (!video) return;

    const value = parseFloat(e.target.value);
    video.volume = value;
    setVolume(value);
    localStorage.setItem(VOLUME_KEY, value);
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;

    if (isMobile) {
      video.muted = !video.muted;
      setVolume(video.muted ? 0 : 1);
      return;
    }

    if (video.volume > 0) {
      video.dataset.lastVolume = video.volume;
      video.volume = 0;
      setVolume(0);
    } else {
      const last = video.dataset.lastVolume || 1;
      video.volume = parseFloat(last);
      setVolume(parseFloat(last));
    }
    localStorage.setItem(VOLUME_KEY, video.volume);
  };

  const getVolumeIcon = () => {
    const video = videoRef.current;
    if (video?.muted || volume === 0) return "🔇";
    if (volume < 0.5) return "🔉";
    return "🔊";
  };

  const handleFullscreen = async () => {
    const player = playerRef.current;
    if (!player) return;

    if (isMobile) {
      setIsFullscreen((prev) => !prev);
      return;
    }

    try {
      if (!document.fullscreenElement) {
        if (player.requestFullscreen) {
          await player.requestFullscreen();
        } else if (player.mozRequestFullScreen) {
          await player.mozRequestFullScreen();
        } else if (player.webkitRequestFullscreen) {
          await player.webkitRequestFullscreen();
        }
        setIsFullscreen(true);
      } else {
        if (document.exitFullscreen) {
          await document.exitFullscreen();
        } else if (document.mozCancelFullScreen) {
          await document.mozCancelFullScreen();
        } else if (document.webkitExitFullscreen) {
          await document.webkitExitFullscreen();
        }
        setIsFullscreen(false);
      }
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      if (!document.fullscreenElement) {
        setIsFullscreen(false);
      } else {
        setIsFullscreen(true);
      }
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    document.addEventListener("webkitfullscreenchange", handleFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      document.removeEventListener("webkitfullscreenchange", handleFullscreenChange);
    };
  }, []);

  const handlePreview = (e) => {
    const video = videoRef.current;
    if (!video || !video.duration) return;

    const rect = e.target.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    const seconds = percent * video.duration;

    setPreviewTime(formatTime(seconds));
    setPreviewLeft(e.clientX - rect.left);
    setShowPreview(true);
  };

  const showControls = () => {
    setControlsVisible(true);
    clearTimeout(hideTimeout.current);
    hideTimeout.current = setTimeout(() => {
      const video = videoRef.current;
      if (video && !video.paused) {
        setControlsVisible(false);
      }
    }, 3000);
  };

  useEffect(() => {
    return () => clearTimeout(hideTimeout.current);
  }, []);

  const handlePip = async () => {
    const video = videoRef.current;
    if (!video) return;

    try {
      if (video.webkitSetPresentationMode) {
        const mode = video.webkitPresentationMode;
        if (mode === "picture-in-picture") {
          video.webkitSetPresentationMode("inline");
        } else {
          video.webkitSetPresentationMode("picture-in-picture");
        }
        return;
      }

      if (document.pictureInPictureEnabled && video.requestPictureInPicture) {
        if (document.pictureInPictureElement) {
          await document.exitPictureInPicture();
        } else {
          await video.requestPictureInPicture();
        }
      }
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    const saveProgress = () => {
      const video = videoRef.current;
      if (!video) return;
      localStorage.setItem(storageKey, video.currentTime);
    };
    window.addEventListener("beforeunload", saveProgress);
    return () => window.removeEventListener("beforeunload", saveProgress);
  }, [storageKey]);

  useEffect(() => {
    if (isFullscreen && isMobile) {
      document.body.style.overflow = "hidden";
      const header = document.querySelector(".header");
      if (header) header.style.display = "none";
    } else {
      document.body.style.overflow = "";
      const header = document.querySelector(".header");
      if (header) header.style.display = "";
    }

    return () => {
      document.body.style.overflow = "";
      const header = document.querySelector(".header");
      if (header) header.style.display = "";
    };
  }, [isFullscreen, isMobile]);

  useEffect(() => {
    const handleKey = (e) => {
      if (
        e.target.tagName === "INPUT" ||
        e.target.tagName === "TEXTAREA" ||
        e.target.tagName === "SELECT" ||
        e.target.isContentEditable
      )
        return;

      const player = playerRef.current;
      if (!player) return;

      const rect = player.getBoundingClientRect();
      const isVisible = rect.top < window.innerHeight && rect.bottom > 0;
      if (!isVisible) return;

      switch (e.code) {
        case "Space":
          e.preventDefault();
          togglePlay();
          break;
        case "ArrowLeft":
          e.preventDefault();
          skip(-10);
          break;
        case "ArrowRight":
          e.preventDefault();
          skip(10);
          break;
        default:
          break;
      }
    };

    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [togglePlay, skip]);

  return (
    <div
      className={`player-container ${isFullscreen ? "mobile-fullscreen" : ""}`}
      ref={playerRef}
      onMouseMove={showControls}
      onClick={(e) => {
        if (e.target.closest(".skip-ads-btn") || e.target.closest(".controls")) {
          return;
        }
        showControls();
      }}
      onTouchStart={(e) => {
        if (e.target.closest(".skip-ads-btn") || e.target.closest(".controls")) {
          return;
        }
        showControls();
      }}
    >
      <video
        ref={videoRef}
        playsInline
        webkitPlaysInline
        x5PlaysInline
        preload="auto"
        poster={poster}
        onTimeUpdate={updateProgress}
        onLoadedMetadata={() => {
          const video = videoRef.current;
          if (!video) return;
          setDuration(formatTime(video.duration));
        }}
        onClick={(e) => {
          e.stopPropagation();
          if (isMobile) {
            if (controlsVisible) {
              setControlsVisible(false);
            } else {
              showControls();
              showCenterIcon();
            }
            return;
          }
          togglePlay();
        }}
        onWaiting={() => setIsBuffering(true)}
        onSeeking={() => {
          const video = videoRef.current;
          if (video && video.readyState < 3) {
            setIsBuffering(true);
          }
        }}
        onPlaying={() => setIsBuffering(false)}
        onCanPlay={() => setIsBuffering(false)}
        onSeeked={() => setIsBuffering(false)}
        onPause={() => {
          setIsPlaying(false);
          setControlsVisible(true);
          if (videoRef.current) {
            localStorage.setItem(storageKey, videoRef.current.currentTime);
          }
        }}
        onPlay={() => {
          setIsPlaying(true);
          showControls();
        }}
      />

      <div
        className={`center-play ${showCenter ? "show" : ""}`}
        onClick={(e) => {
          e.stopPropagation();
          togglePlay();
        }}
      >
        {isPlaying ? <FaPause /> : <FaPlay />}
      </div>

      {isBuffering && (
        <div className="buffer-loader">
          <div className="spinner"></div>
        </div>
      )}

      {/* THANH CONTROLS ĐƯỢC ĐƯA LÊN TRÊN NÚT SKIP QUẢNG CÁO */}
      <div
        className={`controls ${!controlsVisible ? "hide" : ""}`}
        onClick={(e) => e.stopPropagation()}
        onTouchStart={(e) => {
          e.stopPropagation();
          showControls();
        }}
      >
        <input
          type="range"
          className="video-progress"
          value={progress}
          min="0"
          max="100"
          style={{
            "--progress": `${progress}%`,
          }}
          onChange={handleSeek}
          onMouseMove={handlePreview}
          onMouseLeave={() => setShowPreview(false)}
          onTouchStart={(e) => e.stopPropagation()}
          onTouchMove={(e) => e.stopPropagation()}
        />

        <div
          className="preview-time"
          style={{
            opacity: showPreview ? 1 : 0,
            left: previewLeft,
          }}
        >
          {previewTime}
        </div>

        <div className="bottom-controls">
          <div className="left-controls">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                togglePlay();
              }}
            >
              {isPlaying ? <FaPause /> : <FaPlay />}
            </button>

            <button
              type="button"
              className="seek-btn"
              onClick={(e) => {
                e.stopPropagation();
                skip(-10);
              }}
            >
              <span className="seek-icon">«</span>
              <span className="seek-text">10</span>
            </button>

            <button
              type="button"
              className="seek-btn"
              onClick={(e) => {
                e.stopPropagation();
                skip(10);
              }}
            >
              <span className="seek-icon">»</span>
              <span className="seek-text">10</span>
            </button>

            <span className="time">
              {currentTime} / {duration}
            </span>

            <div className="volume-wrapper">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleMute();
                }}
              >
                {getVolumeIcon()}
              </button>

              {!isMobile && (
                <input
                  type="range"
                  className="volume"
                  min="0"
                  max="100"
                  step="1"
                  value={volume * 100}
                  onInput={handleVolume}
                />
              )}
            </div>
          </div>

          <div className="right-controls">
            <select
              className="speed-select"
              value={playbackRate}
              onClick={(e) => e.stopPropagation()}
              onChange={(e) => {
                e.stopPropagation();
                const value = parseFloat(e.target.value);
                setPlaybackRate(value);
                if (videoRef.current) {
                  videoRef.current.playbackRate = value;
                }
              }}
            >
              <option value="0.5">0.5x</option>
              <option value="1">1x</option>
              <option value="1.25">1.25x</option>
              <option value="1.5">1.5x</option>
              <option value="2">2x</option>
            </select>

            <button
              id="pipBtn"
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handlePip();
              }}
            >
              ⧉
            </button>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleFullscreen();
              }}
            >
              ⛶
            </button>
          </div>
        </div>
      </div>

      {/* NÚT QUẢNG CÁO ĐƯỢC ĐƯA XUỐNG DƯỚI CÙNG DOM ĐỂ LUÔN NẰM Ở LỚP TRÊN CÙNG */}
      {showSkip && (
        <button
          type="button"
          className="skip-ads-btn"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();

            const video = videoRef.current;
            if (!video) return;

            video.currentTime = 15 * 60 + 33;
            setShowSkip(false);
            setControlsVisible(false);
            clearTimeout(hideTimeout.current);
          }}
        >
          Bỏ qua quảng cáo
        </button>
      )}
    </div>
  );
}