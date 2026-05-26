import { useEffect, useRef, useState } from "react";
import Hls from "hls.js";
import {
  FaPlay,
  FaPause,
} from "react-icons/fa";
import "./style.scss";

export default function MoviePlayer({
  src,
  title,
  poster,
}) {
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
  const [isBuffering, setIsBuffering] =
  useState(false);

  const hideTimeout = useRef(null);

  const storageKey = `movie-progress-${src}`;
  const VOLUME_KEY = "movie-volume";

  useEffect(() => {
    setProgress(0);
    setCurrentTime("00:00");
    setDuration("00:00");
  }, [src]);
  const isMobile =
    /Android|iPhone|iPad|iPod/i.test(
      navigator.userAgent
    );

  useEffect(() => {
    const video = videoRef.current;

    if (!video || !src) return;

      if ("mediaSession" in navigator) {
    navigator.mediaSession.metadata =
      new MediaMetadata({
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

    navigator.mediaSession.setActionHandler(
      "play",
      () => {
        video.play();
      }
    );

    navigator.mediaSession.setActionHandler(
      "pause",
      () => {
        video.pause();
      }
    );

    navigator.mediaSession.setActionHandler(
      "seekbackward",
      () => {
        video.currentTime -= 10;
      }
    );

    navigator.mediaSession.setActionHandler(
      "seekforward",
      () => {
        video.currentTime += 10;
      }
    );
  }

    let hls;

    if (Hls.isSupported()) {
      hls = new Hls();

      hls.loadSource(src);

      hls.attachMedia(video);
    } else if (
      video.canPlayType(
        "application/vnd.apple.mpegurl"
      )
    ) {
      video.src = src;
    }

    return () => {
      if (hls) hls.destroy();
    };
  }, [src, title, poster]);

  useEffect(() => {
    const video = videoRef.current;

    if (!video) return;

    const savedVolume =
      localStorage.getItem(VOLUME_KEY);

    if (isMobile) {
      video.volume = 1;

      setVolume(1);
    } else {
      if (savedVolume !== null) {
        video.volume =
          parseFloat(savedVolume);

        setVolume(parseFloat(savedVolume));
      }
    }

    const savedTime =
      localStorage.getItem(storageKey);

    if (
        savedTime &&
        !isNaN(savedTime)
      ) {
        video.currentTime =
          parseFloat(savedTime);
      }
  }, [isMobile, storageKey]);

  useEffect(() => {
    const interval = setInterval(() => {
      const video = videoRef.current;

      if (!video?.duration) return;

      localStorage.setItem(
        storageKey,
        video.currentTime
      );
    }, 2000);

    return () => clearInterval(interval);
  }, [storageKey]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);

    const secs = Math.floor(seconds % 60);

    return `${String(mins).padStart(
      2,
      "0"
    )}:${String(secs).padStart(2, "0")}`;
  };

  const togglePlay = () => {
    const video = videoRef.current;

    if (!video) return;

    if (video.paused) {
      video.play();

      setIsPlaying(true);
    } else {
      video.pause();

      setIsPlaying(false);
    }

    setShowCenter(true);

    setTimeout(() => {
      setShowCenter(false);
    }, 600);
  };

  const updateProgress = () => {
    const video = videoRef.current;

    if (!video) return;

    const percent =
      (video.currentTime / video.duration) *
      100;

    setProgress(percent);

    setCurrentTime(
      formatTime(video.currentTime)
    );

    setDuration(
      formatTime(video.duration || 0)
    );

    const current = video.currentTime;

    const triggerTime =
      14 * 60 + 59;

    if (
      current >= triggerTime &&
      current <= triggerTime + 30
    ) {
      setShowSkip(true);
    } else {
      setShowSkip(false);
    }
  };

  const handleSeek = (e) => {
    const video = videoRef.current;

    const value = e.target.value;

    setProgress(value);

    video.currentTime =
      (value / 100) * video.duration;
  };

  const handleVolume = (e) => {
    const video = videoRef.current;

    const value =
      parseFloat(e.target.value);

    video.volume = value;

    setVolume(value);

    localStorage.setItem(
      VOLUME_KEY,
      value
    );
  };

  const toggleMute = () => {
    const video = videoRef.current;

    if (video.volume > 0) {
      video.dataset.lastVolume =
        video.volume;

      video.volume = 0;

      setVolume(0);
    } else {
      const last =
        video.dataset.lastVolume || 1;

      video.volume = parseFloat(last);

      setVolume(parseFloat(last));
    }

    localStorage.setItem(
      VOLUME_KEY,
      video.volume
    );
  };

  const getVolumeIcon = () => {
    if (volume === 0) return "🔇";

    if (volume < 0.5) return "🔉";

    return "🔊";
  };

  const handleFullscreen = () => {
    if (!document.fullscreenElement) {
      playerRef.current.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  };

  const skip = (sec) => {
    videoRef.current.currentTime += sec;
  };

  const handlePreview = (e) => {
    const rect =
      e.target.getBoundingClientRect();

    const percent =
      (e.clientX - rect.left) / rect.width;

    const seconds =
      percent *
      videoRef.current.duration;

    setPreviewTime(
      formatTime(seconds)
    );

    setPreviewLeft(
      e.clientX - rect.left
    );

    setShowPreview(true);
  };

  const showControls = () => {
  setControlsVisible(true);

  clearTimeout(hideTimeout.current);

  hideTimeout.current = setTimeout(() => {
    const video = videoRef.current;

    if (!video) return;

    if (!video.paused) {
      setControlsVisible(false);
    }
  }, 3000);
};
useEffect(() => {
  return () => {
    clearTimeout(hideTimeout.current);
  };
}, []);

  const handlePip = async () => {
    try {
      if (
        document.pictureInPictureElement
      ) {
        await document.exitPictureInPicture();
      } else {
        await videoRef.current.requestPictureInPicture();
      }
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
  const saveProgress = () => {
    const video = videoRef.current;

    if (!video) return;

    localStorage.setItem(
      storageKey,
      video.currentTime
    );
  };

  window.addEventListener(
    "beforeunload",
    saveProgress
  );

  return () => {
    window.removeEventListener(
      "beforeunload",
      saveProgress
    );
  };
}, [storageKey]);

  useEffect(() => {
  const handleKey = (e) => {
    if (
      e.target.tagName === "INPUT" ||
      e.target.tagName === "TEXTAREA" ||
      e.target.tagName === "SELECT" ||
      e.target.isContentEditable
    ) {
      return;
    }

    // chỉ hoạt động khi player còn trong màn hình
    const player =
      playerRef.current;

    if (!player) return;

    const rect =
      player.getBoundingClientRect();

    const isVisible =
      rect.top < window.innerHeight &&
      rect.bottom > 0;

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

  document.addEventListener(
    "keydown",
    handleKey
  );

  return () => {
    document.removeEventListener(
      "keydown",
      handleKey
    );
  };
}, []);

  return (
    <div
      className="player-container"
      ref={playerRef}
      onMouseMove={showControls}
      onClick={showControls}
      onTouchStart={showControls}
    >
      <video
  ref={videoRef}
  playsInline
  poster={poster}
  onTimeUpdate={updateProgress}
  onClick={() => {
  // MOBILE
  if (isMobile) {
    if (controlsVisible) {
      setControlsVisible(false);
    } else {
      showControls();

      setShowCenter(true);

      setTimeout(() => {
        setShowCenter(false);
      }, 600);
    }

    return;
  }

  // DESKTOP
  togglePlay();
}}

  onWaiting={() => {
    setIsBuffering(true);
  }}

  onSeeking={() => {
    setIsBuffering(true);
  }}

  onCanPlay={() => {
    setIsBuffering(false);
  }}

  onPlaying={() => {
    setIsBuffering(false);
  }}

  onPause={() => {
    setIsPlaying(false);

    setControlsVisible(true);

    localStorage.setItem(
      storageKey,
      videoRef.current.currentTime
    );
  }}

  onPlay={() => {
    setIsPlaying(true);

    showControls();
  }}
/>

      <div
          className={`center-play ${
            showCenter ? "show" : ""
          }`}
          onClick={togglePlay}
        >
          {isPlaying ? (
            <FaPause />
          ) : (
            <FaPlay />
          )}
        </div>

        {isBuffering && (
          <div className="buffer-loader">
            <div className="spinner"></div>
          </div>
        )}

      {showSkip && (
        <button
          className="skip-ads-btn"
          onClick={() => {
            videoRef.current.currentTime =
              15 * 60 + 33;

            setShowSkip(false);
          }}
        >
          Bỏ qua quảng cáo
        </button>
      )}

      <div
        className={`controls ${
          !controlsVisible
            ? "hide"
            : ""
        }`}
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
          onInput={handleSeek}
          onMouseMove={handlePreview}
          onMouseLeave={() =>
            setShowPreview(false)
          }
        />

        <div
          className="preview-time"
          style={{
            opacity: showPreview
              ? 1
              : 0,
            left: previewLeft,
          }}
        >
          {previewTime}
        </div>

        <div className="bottom-controls">
          <div className="left-controls">
            <button onClick={togglePlay}>
              {isPlaying ? (
                <FaPause />
              ) : (
                <FaPlay />
              )}
            </button>

            <button
              className="seek-btn"
              onClick={() => skip(-10)}
            >
              <span className="seek-icon">«</span>

              <span className="seek-text">
                10
              </span>
            </button>

            <button
              className="seek-btn"
              onClick={() => skip(10)}
            >
              <span className="seek-icon">»</span>

              <span className="seek-text">
                10
              </span>
            </button>

            <span className="time">
              {currentTime} /{" "}
              {duration}
            </span>

            <div className="volume-wrapper">
              <button
                onClick={toggleMute}
              >
                {getVolumeIcon()}
              </button>

              {!isMobile && (
                <input
                  type="range"
                  className="volume"
                  min="0"
                  max="1"
                  step="0.01"
                  value={volume}
                  onInput={handleVolume}
                />
              )}
            </div>
          </div>

          <div className="right-controls">
            <select
              className="speed-select"
              value={playbackRate}
              onChange={(e) => {
                const value =
                  parseFloat(
                    e.target.value
                  );

                setPlaybackRate(
                  value
                );

                videoRef.current.playbackRate =
                  value;
              }}
            >
              <option value="0.5">
                0.5x
              </option>

              <option value="1">
                1x
              </option>

              <option value="1.25">
                1.25x
              </option>

              <option value="1.5">
                1.5x
              </option>

              <option value="2">
                2x
              </option>
            </select>

            <button
              id="pipBtn"
              onClick={handlePip}
            >
              ⧉
            </button>

            <button
              onClick={handleFullscreen}
            >
              ⛶
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}