import { useState, useEffect, useRef } from "react";
import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import Tabbar from "../../../component/tabar/index";
import { musicData } from "../../../component/HomeMusic/index";
import { useMusic } from "../../../context/MusicContext";
import {
  FaStepBackward,
  FaStepForward,
  FaPlay,
  FaPause,
  FaRandom,
  FaVolumeUp,
  FaVolumeMute,
  FaEllipsisV,
  FaSpinner,
  FaRegHeart,
  FaSearch,
  FaChevronDown,
  FaChevronUp,
  FaMicrophone,
  FaSoundcloud,
  FaHeart,
  FaShareAlt,
  FaPlus,
  FaHeadphones,
  FaExpandAlt,
  FaRetweet,
  FaListUl,
  FaCompactDisc,
  FaSlidersH,
  FaUndo,
  FaTimes,
  FaFacebook,
  FaExclamationTriangle,
  FaServer,
} from "react-icons/fa";
import Loading from "../../../component/LoadingScreen/index";
import "./style.scss";

const BASE_CATEGORIES = {
  mood: {
    dbType: "nhackhongloi",
    title: "Nhạc Tâm Trạng 🎵",
    desc: "Chữa lành tâm hồn",
    img: "https://i.ibb.co/tpQF1yq5/85ea2a41bcba853ca1656f17b54d6a71.webp",
  },
  "nhac-douyin": {
    dbType: "nhacdouyin",
    title: "Nhạc Douyin 🎵",
    desc: "Trend TikTok Trung Quốc",
    img: "https://i.ibb.co/XZBqqxPT/bb95fae35b14b87ed5d6d2d15791e3f2.webp",
  },
  "nhac-tre": {
    dbType: "nhactre",
    title: "Nhạc Trẻ 🎧",
    desc: "V-hit thập cẩm",
    img: "https://i.ibb.co/KcWRC4Xr/f8067e4d176cf42261c0b2789a1a1035.webp",
  },
  usuk: {
    dbType: "nhacusuk",
    title: "Nhạc Âu Mỹ 🗽",
    desc: "Tổng hợp hot hit",
    img: "https://i.ibb.co/V0Cc13KY/1a5d4aca0654d716f9ec965dbafc8bf2.webp",
  },
  "trung-quoc": {
    dbType: "nhactrungquoc",
    title: "Nhạc Trung Quốc 🎧",
    desc: "Nhạc Hoa Ngữ hay nhất",
    img: "https://i.ibb.co/20Jr4KNf/9cb9409ff6db5a3e70ca628f2be2b3ee.webp",
  },
  "nhactre-remix": {
    dbType: "nhactreremix",
    title: "Nhạc Remix 🎧",
    desc: "Quẩy tung nóc nhà",
    img: "https://i.ibb.co/nNXDCBDW/z6742344336920-1eae53132a29744632a92d96486d4a9c.webp",
  },
  edm: {
    dbType: "nhacedm",
    title: "Nhạc EDM ⚡",
    desc: "Electronic Dance Music",
    img: "https://i.ibb.co/F4z8B0ST/6659861e5f2cb99d7a210d2b258ec8f5.webp",
  },
  phonk: {
    dbType: "nhacphonk",
    title: "Nhạc Phonk 🎵",
    desc: "Nhạc cháy như FreeFire.",
    img: "https://i.ibb.co/YBKJGt8X/z6731791091720-ce92821376e7f43bbbf76879ac9f07e3.webp",
  },
  "nhac-lofi": {
    dbType: "nhac-lofi",
    title: "Nhạc Lofi 🎵",
    desc: "Chill and Study",
    img: "https://i.ibb.co/rjFJn7H/z7604161484626-99ee66797819706db71be74a68b02785.webp",
  },
};

const CATEGORY_CONFIG = {
  ...BASE_CATEGORIES,
  nhactre: BASE_CATEGORIES["nhac-tre"],
  nhacusuk: BASE_CATEGORIES["usuk"],
  nhactrungquoc: BASE_CATEGORIES["trung-quoc"],
  nhactreremix: BASE_CATEGORIES["nhactre-remix"],
  nhacedm: BASE_CATEGORIES["edm"],
  nhacphonk: BASE_CATEGORIES["phonk"],
  nhackhongloi: BASE_CATEGORIES["mood"],
  nhacdouyin: BASE_CATEGORIES["nhac-douyin"],
  nhaclofi: BASE_CATEGORIES["nhac-lofi"],
  category: BASE_CATEGORIES["nhac-tre"],
};

const getOptimizedAlbumArt = (url) => {
  if (!url || typeof url !== "string") return url;
  let optimized = url;
  // Nâng cấp ảnh Bing từ thumbnail h=180 lên h=600&w=600 HD siêu nét
  if (optimized.includes("mm.bing.net")) {
    optimized = optimized.replace(/[?&]h=\d+/g, "&h=600&w=600");
  }
  // Nâng cấp ảnh Zing MP3 từ w94/w240 lên w600 HD
  if (optimized.includes("zmp3") || optimized.includes("zadn.vn")) {
    optimized = optimized.replace(/w\d+_r/g, "w600_r");
  }
  // Nâng cấp ảnh YouTube từ hqdefault lên maxresdefault
  if (
    optimized.includes("i.ytimg.com") &&
    optimized.includes("hqdefault.jpg")
  ) {
    optimized = optimized.replace("hqdefault.jpg", "maxresdefault.jpg");
  }
  return optimized;
};

function MusicCategory() {
  const { categorySlug } = useParams();
  const navigate = useNavigate();

  const currentInfo = CATEGORY_CONFIG[categorySlug] || {
    dbType: categorySlug,
    title: "Danh sách phát",
    desc: "Cập nhật hôm nay",
    img: "https://i.ibb.co/YBKJGt8X/z6731791091720-ce92821376e7f43bbbf76879ac9f07e3.webp",
  };

  const {
    playlist,
    currentIndex,
    soundRef,
    isPlaying,
    isLoading,
    currentTime,
    duration,
    togglePlay,
    handlePlay,
    handlePrev,
    handleNext,
    handleShufflePlaylist,
    updatePlaylist,
    setGlobalVolume,
    setGlobalMute,
    audioEffectEnabled,
    toggleAudioEffect,
    audioEffectPreset,
    changeAudioEffectPreset,
    audioEffectIntensity,
    changeAudioEffectIntensity,
    customAudioSettings,
    updateCustomAudioSetting,
    resetCustomAudioSettings,
    audioPresets,
    isRepeat,
    toggleRepeat,
    currentCategory,
    setCurrentCategory,
    setIsMiniPlayerVisible,
  } = useMusic();

  // Khi người dùng vào lại trang nhạc, tự động bật lại trạng thái hiển thị mini player
  useEffect(() => {
    setIsMiniPlayerVisible(true);
  }, [setIsMiniPlayerVisible]);

  const [loading, setLoading] = useState(true);
  const [serverError, setServerError] = useState(false);
  const [retryKey, setRetryKey] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");

  const [showMenu, setShowMenu] = useState(false);
  const [showFullPlayer, setShowFullPlayer] = useState(false);
  const [fspTab, setFspTab] = useState("karaoke");
  const [lyrics, setLyrics] = useState([]);

  const [playbackRate, setPlaybackRate] = useState(1);
  const [sleepTimer, setSleepTimer] = useState(null);
  const [isAtmosCollapsed, setIsAtmosCollapsed] = useState(false);
  const sleepTimerRef = useRef(null);
  const lyricsRef = useRef(null);
  const [showSplitLyrics, setShowSplitLyrics] = useState(false);
  const splitLyricsRef = useRef(null);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const scTabRef = useRef(null);
  const [isMobileScreen, setIsMobileScreen] = useState(
    () => typeof window !== "undefined" && window.innerWidth <= 768,
  );

  useEffect(() => {
    const handleResize = () => {
      setIsMobileScreen(window.innerWidth <= 768);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Fetch Lyrics LRCLIB
  useEffect(() => {
    if (!playlist[currentIndex]) return;
    const { title, artist } = playlist[currentIndex];

    setLyrics([]); // reset

    fetch(
      `https://lrclib.net/api/search?track_name=${encodeURIComponent(title)}&artist_name=${encodeURIComponent(artist)}`,
    )
      .then((res) => res.json())
      .then((data) => {
        if (data && data.length > 0 && data[0].syncedLyrics) {
          const lrc = data[0].syncedLyrics;
          const lines = lrc.split("\n");
          const result = [];
          const timeRegex = /\[(\d{2}):(\d{2}\.\d{2})\]/;

          lines.forEach((line) => {
            const match = timeRegex.exec(line);
            if (match) {
              const minutes = parseInt(match[1], 10);
              const seconds = parseFloat(match[2]);
              const time = minutes * 60 + seconds;
              const text = line.replace(timeRegex, "").trim();
              if (text) {
                result.push({ time, text });
              }
            }
          });
          setLyrics(result);
        } else {
          setLyrics([]);
        }
      })
      .catch((err) => {
        console.error("Lỗi lấy lời bài hát:", err);
        setLyrics([]);
      });
  }, [currentIndex, playlist]);

  // Find active lyric index
  let activeLyricIndex = -1;
  if (lyrics.length > 0) {
    for (let i = 0; i < lyrics.length; i++) {
      if (currentTime >= lyrics[i].time) {
        activeLyricIndex = i;
      } else {
        break;
      }
    }
  }

  // Auto-scroll lyrics (cuộn mượt nội bộ bên trong container, không dùng scrollIntoView để tránh làm lệch/kéo màn hình cha)
  useEffect(() => {
    if (!showFullPlayer || activeLyricIndex === -1) return;

    const scrollContainerToActive = (container) => {
      if (!container) return;
      const activeEl = container.querySelector(".lyric-line.active");
      if (!activeEl) return;

      const containerRect = container.getBoundingClientRect();
      const activeRect = activeEl.getBoundingClientRect();
      const relativeTop =
        activeRect.top - containerRect.top + container.scrollTop;
      const targetTop =
        relativeTop - container.clientHeight / 2 + activeEl.clientHeight / 2;

      container.scrollTo({
        top: Math.max(0, targetTop),
        behavior: "smooth",
      });
    };

    if (fspTab === "lyrics" && lyricsRef.current) {
      scrollContainerToActive(lyricsRef.current);
    }

    if (fspTab === "karaoke" && showSplitLyrics && splitLyricsRef.current) {
      scrollContainerToActive(splitLyricsRef.current);
    }
  }, [activeLyricIndex, fspTab, showFullPlayer, showSplitLyrics]);

  // Scroll listener cho nút cuộn lên đầu trang
  useEffect(() => {
    const handleWinScroll = () => {
      if (!showFullPlayer) {
        const threshold =
          Math.min(window.innerHeight, window.innerWidth) || 350;
        setShowScrollTop(window.scrollY > threshold);
      }
    };
    window.addEventListener("scroll", handleWinScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleWinScroll);
  }, [showFullPlayer]);

  useEffect(() => {
    setShowScrollTop(false);
  }, [fspTab, currentIndex, showFullPlayer]);

  const handleScrollToTop = () => {
    if (showFullPlayer && fspTab === "soundcloud" && scTabRef.current) {
      scTabRef.current.scrollTo({ top: 0, behavior: "smooth" });
    } else if (showFullPlayer && fspTab === "lyrics" && lyricsRef.current) {
      lyricsRef.current.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  // Auto-scroll playlist (cuộn an toàn nội bộ container)
  useEffect(() => {
    if (fspTab === "playlist" && showFullPlayer) {
      setTimeout(() => {
        const container = document.querySelector(".playlist-container");
        const activeEl = document.querySelector(".fsp-playlist-active");
        if (container && activeEl) {
          const containerRect = container.getBoundingClientRect();
          const activeRect = activeEl.getBoundingClientRect();
          const relativeTop =
            activeRect.top - containerRect.top + container.scrollTop;
          const targetTop =
            relativeTop -
            container.clientHeight / 2 +
            activeEl.clientHeight / 2;

          container.scrollTo({
            top: Math.max(0, targetTop),
            behavior: "smooth",
          });
        }
      }, 100);
    }
  }, [currentIndex, fspTab, showFullPlayer]);

  const toggleMute = () => {
    const newMute = !isMuted;
    setGlobalMute(newMute);
    setIsMuted(newMute);
  };

  const handleVolumeChange = (e) => {
    const newVol = Number(e.target.value);
    setGlobalVolume(newVol);
    setVolume(newVol);
    setIsMuted(newVol === 0);
  };

  const categoryStateRef = useRef({ currentCategory, playlist });
  useEffect(() => {
    categoryStateRef.current = { currentCategory, playlist };
  }, [currentCategory, playlist]);

  useEffect(() => {
    const { currentCategory: cat, playlist: pl } = categoryStateRef.current;
    if (cat?.slug === categorySlug && Array.isArray(pl) && pl.length > 0) {
      setLoading(false);
      setServerError(false);
      return;
    }

    let isMounted = true;
    setLoading(true);
    setServerError(false);

    const dbType = CATEGORY_CONFIG[categorySlug]?.dbType || categorySlug;
    const catTitle = CATEGORY_CONFIG[categorySlug]?.title || "Danh sách phát";
    const catImg =
      CATEGORY_CONFIG[categorySlug]?.img ||
      "https://i.ibb.co/YBKJGt8X/z6731791091720-ce92821376e7f43bbbf76879ac9f07e3.webp";

    const baseUrl = process.env.REACT_APP_API_URL || "http://localhost:5000";
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 12000);

    fetch(`${baseUrl}/api/songs/category/${dbType}`, {
      signal: controller.signal,
    })
      .then((res) => {
        clearTimeout(timeoutId);
        if (!res.ok) {
          throw new Error(`HTTP error ${res.status}`);
        }
        return res.json();
      })
      .then((data) => {
        if (!isMounted) return;
        if (Array.isArray(data) && data.length > 0) {
          updatePlaylist(data);
          setCurrentCategory({
            slug: categorySlug,
            dbType,
            title: catTitle,
            img: catImg,
          });
          setServerError(false);
        } else {
          updatePlaylist([]);
          setServerError(true);
        }
        setLoading(false);
      })
      .catch((err) => {
        clearTimeout(timeoutId);
        if (!isMounted) return;
        console.warn("Lỗi tải danh sách bài hát:", err);
        updatePlaylist([]);
        setServerError(true);
        setLoading(false);
      });

    return () => {
      isMounted = false;
      clearTimeout(timeoutId);
      controller.abort();
    };
  }, [categorySlug, retryKey, updatePlaylist, setCurrentCategory]);

  const handleSeek = (e) => {
    const newTime = Number(e.target.value);
    if (soundRef.current) soundRef.current.seek(newTime);
  };

  const formatTime = (time) => {
    if (!time || isNaN(time)) return "0:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        !event.target.closest(".custom-options-popup") &&
        !event.target.closest(".options-trigger-btn")
      ) {
        setShowMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, []);

  const changeSpeed = (rate) => {
    if (soundRef.current) {
      soundRef.current.rate(rate);
      setPlaybackRate(rate);
    }
  };

  const handleSleepTimer = (minutes) => {
    if (sleepTimerRef.current) clearTimeout(sleepTimerRef.current);
    if (minutes === 0) {
      setSleepTimer(null);
    } else {
      setSleepTimer(minutes);
      sleepTimerRef.current = setTimeout(
        () => {
          if (soundRef.current) {
            soundRef.current.pause();
            setSleepTimer(null);
          }
        },
        minutes * 60 * 1000,
      );
    }
  };

  const filteredPlaylist = playlist.filter(
    (song) =>
      song.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      song.artist?.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;
  const volPercent = (isMuted ? 0 : volume) * 100;

  const isNewSong = (rawDate) => {
    if (!rawDate) return false;
    let songDate;

    if (typeof rawDate === "number") {
      songDate = new Date(rawDate);
    } else if (typeof rawDate === "string") {
      const raw = rawDate.trim();
      if (!raw) return false;

      // Kiểm tra xem chuỗi có định dạng timezone (+07:00, Z, v.v.) hay không
      const hasTimezone = raw.endsWith("Z") || /[+-]\d{2}(:?\d{2})?$/.test(raw);

      if (!hasTimezone) {
        // Quy chuẩn theo múi giờ Việt Nam (UTC+7)
        const formatted = raw.replace(" ", "T") + "+07:00";
        songDate = new Date(formatted);
        if (isNaN(songDate.getTime())) {
          songDate = new Date(raw.replace(" ", "T"));
        }
      } else {
        songDate = new Date(raw);
      }
    } else if (rawDate instanceof Date) {
      songDate = rawDate;
    }

    if (!songDate || isNaN(songDate.getTime())) return false;

    // So sánh thời gian hiện tại với thời gian bài hát được tạo (nhỏ hơn 7 ngày theo giờ VN)
    const now = Date.now();
    const songTime = songDate.getTime();
    const diffMs = now - songTime;
    const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

    return diffMs >= -3600000 && diffMs < SEVEN_DAYS_MS;
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      const tag = document.activeElement?.tagName;
      if (
        tag === "INPUT" ||
        tag === "TEXTAREA" ||
        document.activeElement?.isContentEditable
      )
        return;
      if (e.code === "Space") {
        e.preventDefault();
        togglePlay();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [togglePlay]);

  // KHAI BÁO MENU DÙNG CHUNG CHO PC VÀ MOBILE (DOLBY ATMOS & SPATIAL ENGINE)
  const renderMenuPopup = () => (
    <div className="custom-options-popup" onClick={(e) => e.stopPropagation()}>
      {/* 🌌 DOLBY ATMOS & 3D SPATIAL AUDIO SECTION */}
      <div className="option-section atmos-section">
        <div className="d-flex align-items-center justify-content-between mb-2">
          <div className="d-flex align-items-center gap-2">
            <span className="dolby-title">DOLBY ATMOS</span>
            <span className="spatial-badge">3D SPATIAL</span>
          </div>
          <div className="d-flex align-items-center gap-2">
            <label
              className="atmos-toggle"
              title={
                audioEffectEnabled
                  ? "Tắt hiệu ứng Dolby Atmos"
                  : "Bật hiệu ứng Dolby Atmos"
              }
            >
              <input
                type="checkbox"
                checked={!!audioEffectEnabled}
                onChange={toggleAudioEffect}
              />
              <span className="atmos-slider"></span>
            </label>
            <button
              type="button"
              className="btn-close-atmos-menu"
              onClick={() => setShowMenu(false)}
              title="Đóng menu"
            >
              <FaTimes size={11} />
            </button>
          </div>
        </div>

        {audioEffectEnabled ? (
          isAtmosCollapsed ? (
            <div
              className="atmos-compact-bar"
              onClick={() => setIsAtmosCollapsed(false)}
              title="Bấm để mở rộng các chế độ âm thanh"
            >
              <div className="compact-left">
                <span className="compact-icon">
                  {audioPresets?.[audioEffectPreset]?.icon || "🌌"}
                </span>
                <span className="compact-name">
                  {audioPresets?.[audioEffectPreset]?.name || "Dolby Atmos"}
                </span>
                <span className="compact-sub">
                  •{" "}
                  {audioEffectPreset === "custom"
                    ? "Tùy chỉnh EQ"
                    : `${audioEffectIntensity}%`}
                </span>
              </div>
              <span className="compact-action">
                <FaChevronDown size={11} />
              </span>
            </div>
          ) : (
            <>
              <div className="active-preset-desc mb-2">
                <div
                  className="preset-desc-content"
                  onClick={() => setIsAtmosCollapsed(true)}
                  title="Thu gọn tùy chọn hiệu ứng"
                >
                  <span className="preset-pill-dot"></span>
                  <span className="preset-pill-text">
                    {audioPresets?.[audioEffectPreset]?.name || "Dolby Atmos"}
                    <span className="preset-pill-sub">
                      {" "}
                      •{" "}
                      {audioPresets?.[audioEffectPreset]?.desc ||
                        "Hiệu ứng 3D đang hoạt động"}
                    </span>
                  </span>
                </div>
                <button
                  type="button"
                  className="btn-collapse-atmos"
                  onClick={() => setIsAtmosCollapsed(true)}
                  title="Thu gọn tùy chọn hiệu ứng"
                >
                  <FaChevronUp size={11} />
                </button>
              </div>

              {/* PRESET CHIPS / GRID */}
              <div className="preset-grid mb-3">
                {audioPresets &&
                  Object.values(audioPresets).map((p) => {
                    const isActive = audioEffectPreset === p.id;
                    return (
                      <button
                        key={p.id}
                        className={`preset-card ${isActive ? "active" : ""}`}
                        onClick={() => changeAudioEffectPreset(p.id)}
                        title={p.desc}
                      >
                        <span className="preset-icon">{p.icon}</span>
                        <span className="preset-name">{p.name}</span>
                      </button>
                    );
                  })}
              </div>

              {/* INTENSITY SLIDER (Khi không ở chế độ custom) */}
              {audioEffectPreset !== "custom" ? (
                <div className="intensity-control mb-2">
                  <div className="d-flex justify-content-between align-items-center mb-1">
                    <span className="control-label">
                      Độ sâu không gian & hiệu ứng
                    </span>
                    <span className="control-val">{audioEffectIntensity}%</span>
                  </div>
                  <input
                    type="range"
                    min="20"
                    max="100"
                    step="5"
                    value={audioEffectIntensity}
                    onChange={(e) =>
                      changeAudioEffectIntensity(Number(e.target.value))
                    }
                    className="atmos-range"
                    style={{
                      background: `linear-gradient(to right, #9b4de0 ${audioEffectIntensity}%, rgba(255,255,255,0.15) ${audioEffectIntensity}%)`,
                    }}
                  />
                </div>
              ) : (
                /* BẢNG TÙY CHỈNH NÂNG CAO (CUSTOM EQUALIZER & SPATIAL) */
                <div className="custom-dsp-panel mb-2">
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <span className="custom-panel-title">
                      Tinh chỉnh chi tiết
                    </span>
                    <button
                      className="custom-reset-btn"
                      onClick={resetCustomAudioSettings}
                      title="Khôi phục thiết lập mặc định"
                    >
                      <FaUndo size={11} className="me-1" />
                      Mặc định
                    </button>
                  </div>

                  {/* 1. BASS */}
                  <div className="custom-row mb-2">
                    <div className="d-flex justify-content-between align-items-center">
                      <span className="dsp-label">🔊 Âm trầm (Bass)</span>
                      <span className="dsp-value">
                        {customAudioSettings.bass > 0
                          ? `+${customAudioSettings.bass}`
                          : customAudioSettings.bass}{" "}
                        dB
                      </span>
                    </div>
                    <input
                      type="range"
                      min="-8"
                      max="10"
                      step="0.5"
                      value={customAudioSettings.bass}
                      onChange={(e) =>
                        updateCustomAudioSetting("bass", Number(e.target.value))
                      }
                      className="atmos-range"
                      style={{
                        background: `linear-gradient(to right, #c084fc ${Math.min(100, Math.max(0, ((customAudioSettings.bass + 8) / 18) * 100))}%, rgba(255,255,255,0.15) ${Math.min(100, Math.max(0, ((customAudioSettings.bass + 8) / 18) * 100))}%)`,
                      }}
                    />
                  </div>

                  {/* 2. MID / VOCAL */}
                  <div className="custom-row mb-2">
                    <div className="d-flex justify-content-between align-items-center">
                      <span className="dsp-label">🎤 Giọng hát & Mid</span>
                      <span className="dsp-value">
                        {customAudioSettings.mid > 0
                          ? `+${customAudioSettings.mid}`
                          : customAudioSettings.mid}{" "}
                        dB
                      </span>
                    </div>
                    <input
                      type="range"
                      min="-6"
                      max="8"
                      step="0.5"
                      value={customAudioSettings.mid}
                      onChange={(e) =>
                        updateCustomAudioSetting("mid", Number(e.target.value))
                      }
                      className="atmos-range"
                      style={{
                        background: `linear-gradient(to right, #c084fc ${Math.min(100, Math.max(0, ((customAudioSettings.mid + 6) / 14) * 100))}%, rgba(255,255,255,0.15) ${Math.min(100, Math.max(0, ((customAudioSettings.mid + 6) / 14) * 100))}%)`,
                      }}
                    />
                  </div>

                  {/* 3. TREBLE */}
                  <div className="custom-row mb-2">
                    <div className="d-flex justify-content-between align-items-center">
                      <span className="dsp-label">✨ Âm cao (Treble)</span>
                      <span className="dsp-value">
                        {customAudioSettings.treble > 0
                          ? `+${customAudioSettings.treble}`
                          : customAudioSettings.treble}{" "}
                        dB
                      </span>
                    </div>
                    <input
                      type="range"
                      min="-6"
                      max="8"
                      step="0.5"
                      value={customAudioSettings.treble}
                      onChange={(e) =>
                        updateCustomAudioSetting(
                          "treble",
                          Number(e.target.value),
                        )
                      }
                      className="atmos-range"
                      style={{
                        background: `linear-gradient(to right, #c084fc ${Math.min(100, Math.max(0, ((customAudioSettings.treble + 6) / 14) * 100))}%, rgba(255,255,255,0.15) ${Math.min(100, Math.max(0, ((customAudioSettings.treble + 6) / 14) * 100))}%)`,
                      }}
                    />
                  </div>

                  {/* 4. SPATIAL WIDTH */}
                  <div className="custom-row mb-2">
                    <div className="d-flex justify-content-between align-items-center">
                      <span className="dsp-label">🌐 Âm trường 3D</span>
                      <span className="dsp-value">
                        {customAudioSettings.spatial}%
                      </span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      step="5"
                      value={customAudioSettings.spatial}
                      onChange={(e) =>
                        updateCustomAudioSetting(
                          "spatial",
                          Number(e.target.value),
                        )
                      }
                      className="atmos-range"
                      style={{
                        background: `linear-gradient(to right, #38bdf8 ${customAudioSettings.spatial}%, rgba(255,255,255,0.15) ${customAudioSettings.spatial}%)`,
                      }}
                    />
                  </div>

                  {/* 5. REVERB ROOM */}
                  <div className="custom-row mb-1">
                    <div className="d-flex justify-content-between align-items-center">
                      <span className="dsp-label">🏛️ Vang phòng (Reverb)</span>
                      <span className="dsp-value">
                        {customAudioSettings.reverb}%
                      </span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      step="5"
                      value={customAudioSettings.reverb}
                      onChange={(e) =>
                        updateCustomAudioSetting(
                          "reverb",
                          Number(e.target.value),
                        )
                      }
                      className="atmos-range"
                      style={{
                        background: `linear-gradient(to right, #38bdf8 ${customAudioSettings.reverb}%, rgba(255,255,255,0.15) ${customAudioSettings.reverb}%)`,
                      }}
                    />
                  </div>
                </div>
              )}
            </>
          )
        ) : (
          <div className="atmos-disabled-notice">
            <p
              className="m-0 text-secondary"
              style={{ fontSize: "11.5px", lineHeight: "1.4" }}
            >
              Chế độ âm thanh gốc (Bypass). Bật công tắc để kích hoạt âm vòm
              Dolby Atmos đa chiều & tăng cường âm học.
            </p>
          </div>
        )}
      </div>

      <hr className="menu-divider" />
      <div className="option-section">
        <p className="option-title">Tốc độ phát ({playbackRate}x)</p>
        <div className="d-flex gap-2">
          {[0.75, 1, 1.25, 1.5].map((rate) => (
            <button
              key={rate}
              className={`option-btn ${playbackRate === rate ? "active" : ""}`}
              onClick={() => changeSpeed(rate)}
            >
              {rate}x
            </button>
          ))}
        </div>
      </div>

      <hr className="menu-divider" />
      <div className="option-section">
        <p className="option-title">
          Hẹn giờ tắt {sleepTimer ? `(${sleepTimer}p)` : ""}
        </p>
        <div className="d-flex gap-2 flex-wrap">
          {[0, 15, 30, 60, 180].map((mins) => (
            <button
              key={mins}
              className={`option-btn ${sleepTimer === mins ? "active" : ""}`}
              onClick={() => handleSleepTimer(mins)}
            >
              {mins === 0 ? "Tắt" : `${mins}p`}
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="music-container-box dark-theme">
      <Tabbar />
      <div className="music-container d-flex">
        <div className="main-content-area flex-grow-1 position-relative">
          {loading ? (
            <div className="music-loading-wrapper">
              <Loading />
            </div>
          ) : serverError || !playlist || playlist.length === 0 ? (
            <div className="music-server-error-wrapper">
              <div className="music-server-error-card">
                <div className="error-pulse-badge">
                  <span className="dot-pulse"></span>
                  <span>Thông báo máy chủ</span>
                </div>

                <div className="error-icon-circle">
                  <FaServer className="server-main-icon" />
                  <FaExclamationTriangle className="alert-badge-icon" />
                </div>

                <h2 className="error-title">
                  Máy chủ đang quá tải hoặc nghẽn mạng
                </h2>

                <p className="error-message">
                  Người dùng tăng đột biến nên đường truyền nghẽn, nhắn tin với
                  ad qua fanpage để ad cấu hình lại server nhé.
                </p>

                <div className="error-category-badge">
                  <img
                    src={currentInfo.img}
                    alt={currentInfo.title}
                    className="cat-thumb"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src =
                        "https://i.ibb.co/tpQF1yq5/85ea2a41bcba853ca1656f17b54d6a71.webp";
                    }}
                  />
                  <div className="cat-text">
                    <span className="cat-label">Thể loại</span>
                    <span className="cat-name">{currentInfo.title}</span>
                  </div>
                </div>

                <div className="error-actions">
                  <a
                    href="https://www.facebook.com/profile.php?id=100084710083595"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-fanpage-contact"
                  >
                    <FaFacebook className="me-2" />
                    Nhắn tin với Admin qua Fanpage
                  </a>

                  <button
                    onClick={() => setRetryKey((k) => k + 1)}
                    className="btn-retry-fetch"
                  >
                    <FaUndo className="me-2" />
                    Thử tải lại
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="music-scroll-area custom-scrollbar">
              <div className="main-layout-grid d-flex gap-4">
                {/* CỘT TRÁI */}
                <div className="left-column flex-grow-1">
                  <div
                    className="album-header d-flex align-items-center gap-4"
                    style={{ "--album-cover": `url(${currentInfo.img})` }}
                  >
                    <div className="album-cover-wrapper">
                      <img
                        src={currentInfo.img}
                        alt={currentInfo.title}
                        className="album-cover-img"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src =
                            "https://i.ibb.co/tpQF1yq5/85ea2a41bcba853ca1656f17b54d6a71.webp";
                        }}
                      />
                    </div>

                    <div className="album-info text-md-start">
                      <h1 className="album-title">{currentInfo.title}</h1>
                      <p className="album-desc">{currentInfo.desc}</p>
                      <p className="album-stats">• {playlist.length} bài hát</p>

                      <div className="album-actions d-flex align-items-center gap-3 mt-3">
                        <button
                          onClick={handleShufflePlaylist}
                          className="btn-play-all"
                        >
                          <FaRandom className="me-2" /> Phát ngẫu nhiên
                        </button>
                        <button className="action-icon-btn">
                          <FaRegHeart />
                        </button>
                        <button className="action-icon-btn">
                          <FaEllipsisV />
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="playlist-table-container">
                    <div className="filter-bar d-flex justify-content-between align-items-center my-3">
                      <div className="search-mini">
                        <FaSearch className="search-icon" />
                        <input
                          type="text"
                          placeholder="Tìm trong playlist..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                        />
                      </div>
                    </div>

                    <table className="custom-song-table w-100">
                      <thead>
                        <tr>
                          <th className="th-number">#</th>
                          <th className="th-title">Bài hát</th>
                          <th className="th-artist">Nghệ sĩ</th>
                          <th className="th-time text-center">Lượt nghe</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredPlaylist.length === 0 ? (
                          <tr>
                            <td
                              colSpan="4"
                              className="text-center py-4 text-secondary"
                              style={{ color: "#a0a0ab" }}
                            >
                              Không tìm thấy bài hát nào phù hợp với "
                              {searchQuery}"
                            </td>
                          </tr>
                        ) : (
                          filteredPlaylist.map((song, idx) => {
                            const currentSong = playlist[currentIndex];
                            const currentSongId =
                              currentSong?.id || currentSong?._id;
                            const songId = song?.id || song?._id;
                            const isCurrent = Boolean(
                              currentSongId &&
                              songId &&
                              String(currentSongId) === String(songId),
                            );
                            return (
                              <tr
                                key={songId || idx}
                                className={`song-row ${isCurrent ? "playing" : ""}`}
                                onClick={() => {
                                  const realIndex = playlist.findIndex(
                                    (p) =>
                                      String(p?.id || p?._id) ===
                                      String(songId),
                                  );
                                  handlePlay(realIndex >= 0 ? realIndex : idx);
                                }}
                              >
                                <td className="td-number">
                                  {isCurrent && isPlaying ? (
                                    <img
                                      src="https://zmp3-static.zmdcdn.me/skins/zmp3-v6.1/images/icons/icon-playing.gif"
                                      alt="playing"
                                      className="playing-gif"
                                    />
                                  ) : (
                                    idx + 1
                                  )}
                                </td>
                                <td className="td-title">
                                  <div className="d-flex align-items-center gap-3 w-100 overflow-hidden">
                                    <img
                                      src={song.image}
                                      alt={song.title}
                                      className="song-thumb flex-shrink-0"
                                    />
                                    <div className="d-flex flex-column w-100 overflow-hidden">
                                      <div className="song-name-box w-100 overflow-hidden text-truncate">
                                        <span
                                          className="song-name-text text-truncate d-inline-block align-middle"
                                          style={{ maxWidth: "85%" }}
                                        >
                                          {song.title}
                                        </span>
                                        <div>
                                          {isNewSong(
                                            song.create_at ||
                                              song.created_at ||
                                              song.createdAt,
                                          ) && (
                                            <span className="new-badge ms-2">
                                              Mới
                                            </span>
                                          )}
                                          <span className="song-badge flex-shrink-0 ms-2 align-middle">
                                            HQ
                                          </span>
                                        </div>
                                      </div>
                                      <div
                                        className="d-md-none text-truncate mt-1"
                                        style={{
                                          fontSize: "11px",
                                          color: "#a0a0ab",
                                        }}
                                      >
                                        {song.artist} •{" "}
                                        {song.listens
                                          ? song.listens.toLocaleString()
                                          : "0"}{" "}
                                        lượt nghe
                                      </div>
                                    </div>
                                  </div>
                                </td>
                                <td className="td-artist">
                                  <div
                                    className="text-truncate"
                                    style={{ maxWidth: "100%" }}
                                  >
                                    {song.artist}
                                  </div>
                                </td>
                                <td className="td-time text-center">
                                  <div className="d-flex align-items-center justify-content-center gap-3">
                                    <FaRegHeart className="row-action-icon heart-icon d-none d-md-block" />
                                    <span className="d-flex justify-content-center align-items-center gap-2">
                                      <FaPlay style={{ fontSize: "10px" }} />
                                      {song.listens
                                        ? song.listens.toLocaleString()
                                        : "0"}
                                    </span>
                                    <FaEllipsisV className="row-action-icon ms-2 d-none d-md-block" />
                                  </div>
                                </td>
                              </tr>
                            );
                          })
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* CỘT PHẢI */}
                <div className="right-column">
                  {playlist[currentIndex] && (
                    <div className="now-playing-section mb-4">
                      <h5 className="right-panel-title mb-3">
                        <FaCompactDisc
                          className={`panel-title-icon playing-icon ${isPlaying ? "spinning" : ""}`}
                        />
                        <span className="panel-title-text">Đang phát</span>
                      </h5>
                      <div
                        className="now-playing-card"
                        style={{
                          "--bg-image": `url(${playlist[currentIndex].image})`,
                        }}
                      >
                        <img
                          src={playlist[currentIndex].image}
                          alt="now-playing"
                          className="np-large-img"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = currentInfo.img;
                          }}
                        />

                        <div className="np-info d-flex justify-content-between align-items-center">
                          <div className="overflow-hidden pe-2">
                            <h6 className="np-title m-0 text-truncate">
                              {playlist[currentIndex].title}
                            </h6>
                            <p className="np-artist m-0 text-truncate">
                              {playlist[currentIndex].artist}
                            </p>
                          </div>

                          <img
                            src="https://zmp3-static.zmdcdn.me/skins/zmp3-v6.1/images/icons/icon-playing.gif"
                            style={{ height: "15px", width: "15px" }}
                            alt="playing"
                            className="playing-gif"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="up-next-section">
                    <div className="d-flex justify-content-between align-items-center mb-3">
                      <h5 className="right-panel-title m-0">
                        <FaListUl className="panel-title-icon next-icon" />
                        <span className="panel-title-text">Tiếp theo</span>
                      </h5>
                      <span className="clear-queue-btn">Lượt nghe</span>
                    </div>

                    <div className="up-next-list">
                      {playlist
                        .slice(currentIndex + 1, currentIndex + 11)
                        .map((song, i) => {
                          const sId = song.id || song._id || i;
                          return (
                            <div
                              key={sId}
                              className="up-next-item d-flex align-items-center gap-3 mb-2"
                              onClick={() => handlePlay(currentIndex + 1 + i)}
                            >
                              <span className="un-number">
                                {currentIndex + 2 + i}
                              </span>
                              <img
                                src={song.image}
                                alt={song.title}
                                className="un-thumb flex-shrink-0"
                              />
                              <div className="un-info flex-grow-1 overflow-hidden">
                                <h6 className="un-title text-truncate m-0">
                                  {song.title}
                                </h6>
                                <p className="un-artist text-truncate m-0">
                                  {song.artist}
                                </p>
                              </div>
                              <span className="un-time  flex-shrink-0 d-flex justify-content-center align-items-center gap-2">
                                <FaPlay style={{ fontSize: "8px" }} />
                                {song.listens
                                  ? song.listens.toLocaleString()
                                  : "0"}
                              </span>
                            </div>
                          );
                        })}
                      {currentIndex + 1 >= playlist.length && (
                        <p className="end-of-queue text-center mt-4">
                          Hết bài hát để phát.
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* BOTTOM PLAYER SPOTIFY STYLE */}
              {playlist[currentIndex] && (
                <div
                  className="custom-bottom-player spotify-style"
                  onClick={() => setShowFullPlayer(true)}
                >
                  {/* LEFT: Info */}
                  <div className="player-left">
                    <img
                      src={playlist[currentIndex].image}
                      alt={playlist[currentIndex].title}
                      className={`player-thumb flex-shrink-0`}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = currentInfo.img;
                      }}
                    />
                    <div className="song-info flex-grow-1 overflow-hidden ms-2 ms-md-3">
                      <h6
                        className="song-name m-0 text-white text-truncate"
                        style={{ fontSize: "14px" }}
                      >
                        {playlist[currentIndex].title}
                      </h6>
                      <p
                        className="song-artist m-0 text-truncate"
                        style={{ fontSize: "12px", color: "#b3b3b3" }}
                      >
                        {playlist[currentIndex].artist}
                      </p>
                    </div>
                  </div>

                  {/* CENTER: Controls & Progress */}
                  <div
                    className="player-center"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="audio-controls d-flex align-items-center justify-content-center mb-0 mb-md-2">
                      <button
                        onClick={handleShufflePlaylist}
                        className="ctrl-btn d-none d-md-block"
                        title="Phát ngẫu nhiên"
                      >
                        <FaRandom size={14} />
                      </button>
                      <button
                        onClick={handlePrev}
                        className="ctrl-btn ms-3 d-none d-md-block"
                        title="Bài trước"
                      >
                        <FaStepBackward size={16} />
                      </button>

                      <button
                        onClick={togglePlay}
                        className="ctrl-btn play-pause-btn ms-auto ms-md-3"
                        title="Phát/Tạm dừng"
                        disabled={isLoading}
                      >
                        {isLoading ? (
                          <FaSpinner
                            size={14}
                            style={{ animation: "spin 1s linear infinite" }}
                          />
                        ) : isPlaying ? (
                          <FaPause size={14} />
                        ) : (
                          <FaPlay size={14} style={{ marginLeft: "2px" }} />
                        )}
                      </button>

                      <button
                        onClick={handleNext}
                        className="ctrl-btn ms-3"
                        title="Bài tiếp theo"
                      >
                        <FaStepForward size={16} />
                      </button>
                      <button
                        onClick={toggleRepeat}
                        className={`ctrl-btn ms-3 d-none d-md-block ${isRepeat ? "text-primary" : ""}`}
                        title="Lặp lại 1 bài"
                      >
                        <FaRetweet
                          size={14}
                          color={isRepeat ? "#c084fc" : "inherit"}
                        />
                      </button>
                      <button
                        className={`ctrl-btn ms-3 d-md-none options-trigger-btn ${showMenu ? "active-menu" : ""}`}
                        title="Dolby Atmos & Cài đặt"
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowMenu(!showMenu);
                        }}
                      >
                        <FaSlidersH size={14} />
                      </button>
                    </div>

                    <div className="progress-container w-100 d-none d-md-flex align-items-center gap-2">
                      <span
                        className="time-text"
                        style={{ fontSize: "11px", color: "#a7a7a7" }}
                      >
                        {formatTime(currentTime)}
                      </span>
                      <input
                        type="range"
                        className="custom-range"
                        min="0"
                        max={duration || 0}
                        value={currentTime}
                        onChange={handleSeek}
                        style={{
                          background: `linear-gradient(to right, #fff ${progressPercent}%, rgba(255,255,255,0.1) ${progressPercent}%)`,
                        }}
                      />
                      <span
                        className="time-text"
                        style={{ fontSize: "11px", color: "#a7a7a7" }}
                      >
                        {formatTime(duration)}
                      </span>
                    </div>
                  </div>

                  {/* RIGHT: Volume & Actions */}
                  <div
                    className="player-right d-none d-md-flex justify-content-end align-items-center gap-3 pe-2"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      className={`ctrl-btn ${fspTab === "lyrics" ? "text-primary" : ""}`}
                      title="Lời bài hát"
                      onClick={() => {
                        setFspTab("lyrics");
                        setShowFullPlayer(true);
                      }}
                    >
                      <FaMicrophone size={14} />
                    </button>

                    <div
                      className="volume-control d-flex justify-content-center align-items-center"
                      style={{ width: "90px" }}
                    >
                      <button
                        className="ctrl-btn me-2"
                        onClick={toggleMute}
                        title="Âm lượng"
                      >
                        {isMuted ? (
                          <FaVolumeMute size={16} style={{ color: "#666" }} />
                        ) : (
                          <FaVolumeUp size={16} />
                        )}
                      </button>

                      <input
                        type="range"
                        className="volume-slider"
                        min="0"
                        max="1"
                        step="0.1"
                        value={isMuted ? 0 : volume}
                        onChange={handleVolumeChange}
                        style={{
                          width: "100%",
                          background: `linear-gradient(to right, #fff ${volPercent}%, rgba(255,255,255,0.3) ${volPercent}%)`,
                        }}
                      />
                    </div>
                    <button
                      className="ctrl-btn"
                      title="Toàn màn hình"
                      onClick={() => setShowFullPlayer(true)}
                    >
                      <FaExpandAlt size={14} />
                    </button>

                    <div className="options-container position-relative">
                      <button
                        className={`ctrl-btn options-trigger-btn ${showMenu ? "active-menu" : ""}`}
                        title="Dolby Atmos & Cài đặt"
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowMenu(!showMenu);
                        }}
                      >
                        <FaSlidersH size={15} />
                      </button>
                    </div>
                  </div>

                  {/* POPUP OPTIONS CHO BOTTOM PLAYER */}
                  {showMenu && !showFullPlayer && renderMenuPopup()}

                  {/* MOBILE PROGRESS BAR (Absolute Bottom) */}
                  <div
                    className="mobile-progress-bar d-md-none position-absolute bottom-0 start-0 w-100"
                    style={{
                      height: "2px",
                      background: "rgba(255,255,255,0.1)",
                    }}
                  >
                    <div
                      className="mobile-progress-fill h-100 bg-white"
                      style={{ width: `${progressPercent}%` }}
                    ></div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* FULL-SCREEN PLAYER OVERLAY */}
      <div className={`full-screen-player ${showFullPlayer ? "active" : ""}`}>
        {playlist[currentIndex] && (
          <>
            <div
              className="fsp-background"
              style={{
                backgroundImage: `url(${getOptimizedAlbumArt(playlist[currentIndex].image)})`,
              }}
            />
            <div className="fsp-overlay" />

            <div className="fsp-content d-flex flex-column h-100">
              <div className="fsp-header d-flex justify-content-between align-items-center p-3 pt-4 position-relative">
                <button
                  className="fsp-btn z-index-3"
                  onClick={() => setShowFullPlayer(false)}
                  style={{ zIndex: 10 }}
                >
                  <FaChevronDown />
                </button>

                {/* SEGMENTED CONTROL TABS (IN HEADER) */}
                <div
                  className="fsp-tabs-container position-absolute top-50 start-50 translate-middle w-100 d-flex justify-content-center px-5"
                  style={{ zIndex: 5, pointerEvents: "none" }}
                >
                  <div
                    className="d-flex align-items-center"
                    style={{
                      background: "rgba(255,255,255,0.1)",
                      borderRadius: "30px",
                      padding: "4px",
                      pointerEvents: "auto",
                    }}
                  >
                    <button
                      className={`fsp-tab-btn ${fspTab === "playlist" ? "active" : ""}`}
                      onClick={() => setFspTab("playlist")}
                    >
                      <span className="d-none d-md-inline">Danh sách phát</span>
                      <FaListUl className="d-md-none" size={16} />
                    </button>
                    <button
                      className={`fsp-tab-btn ${fspTab === "karaoke" ? "active" : ""}`}
                      onClick={() => setFspTab("karaoke")}
                    >
                      <span className="d-none d-md-inline">Màn hình phát</span>
                      <FaCompactDisc className="d-md-none" size={16} />
                    </button>
                    <button
                      className={`fsp-tab-btn ${fspTab === "lyrics" ? "active" : ""}`}
                      onClick={() => setFspTab("lyrics")}
                    >
                      <span className="d-none d-md-inline">Lời bài hát</span>
                      <FaMicrophone className="d-md-none" size={16} />
                    </button>
                    <button
                      className={`fsp-tab-btn ${fspTab === "soundcloud" ? "active" : ""}`}
                      onClick={() => setFspTab("soundcloud")}
                      title="SC-Theme"
                    >
                      <span className="d-none d-md-inline">SC-Theme</span>
                      <FaSoundcloud className="d-md-none" size={16} />
                    </button>
                  </div>
                </div>

                <div
                  className="z-index-3 position-relative d-flex align-items-center gap-2"
                  style={{ zIndex: 10 }}
                >
                  {/* Nút lời bài hát ngay cạnh nút điều chỉnh khi có lyrics */}
                  {fspTab === "karaoke" && lyrics && lyrics.length > 0 && (
                    <button
                      className={`fsp-btn fsp-lyrics-toggle-btn d-inline-flex align-items-center gap-1 ${showSplitLyrics ? "active text-primary" : ""}`}
                      title={
                        showSplitLyrics ? "Ẩn lời bài hát" : "Hiện lời bài hát"
                      }
                      onClick={() => setShowSplitLyrics(!showSplitLyrics)}
                    >
                      <FaMicrophone size={15} />
                      <span
                        className="d-none d-md-inline"
                        style={{ fontSize: "13px", fontWeight: 500 }}
                      >
                        Ảnh + Lời
                      </span>
                    </button>
                  )}

                  <button
                    className={`fsp-btn options-trigger-btn ${showMenu ? "text-primary" : ""}`}
                    title="Dolby Atmos & Cài đặt"
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowMenu(!showMenu);
                    }}
                  >
                    <FaSlidersH size={18} />
                  </button>
                  {showMenu && showFullPlayer && renderMenuPopup()}
                </div>
              </div>

              <div
                className="fsp-body flex-grow-1 d-flex flex-column justify-content-center align-items-center px-0 px-md-4"
                style={{ overflowY: "hidden", position: "relative" }}
              >
                {/* 1. PLAYLIST */}
                {fspTab === "playlist" && (
                  <div
                    className="playlist-container custom-scrollbar w-100 h-100"
                    style={{
                      overflowY: "auto",
                      padding: "10px 0",
                      maxWidth: "1200px",
                    }}
                  >
                    <div className="d-flex flex-wrap w-100 m-0">
                      {playlist.map((song, idx) => (
                        <div className="col-12 col-sm-6 p-1" key={idx}>
                          <div
                            className={`d-flex align-items-center px-2 py-1 rounded ${idx === currentIndex ? "text-white fsp-playlist-active" : "text-light"}`}
                            style={{
                              cursor: "pointer",
                              background:
                                idx === currentIndex
                                  ? "rgba(155, 77, 224, 0.4)"
                                  : "rgba(255,255,255,0.05)",
                              transition: "background 0.2s",
                            }}
                            onClick={() => {
                              handlePlay(idx);
                            }}
                          >
                            <div
                              className="ms-1 me-2 opacity-50 text-end"
                              style={{ minWidth: "20px", fontSize: "13px" }}
                            >
                              {idx + 1}
                            </div>
                            <img
                              src={song.image}
                              alt={song.title}
                              style={{
                                width: "42px",
                                height: "42px",
                                borderRadius: "4px",
                                objectFit: "cover",
                              }}
                            />
                            <div className="ms-2 overflow-hidden text-start">
                              <p
                                className="m-0 fw-bold text-truncate"
                                style={{ fontSize: "14px" }}
                              >
                                {song.title}
                              </p>
                              <p
                                className="m-0 opacity-75 text-truncate"
                                style={{ fontSize: "12px" }}
                              >
                                {song.artist}
                              </p>
                            </div>
                            {idx === currentIndex && (
                              <div className="ms-auto pe-2">
                                <img
                                  src="https://zmp3-static.zmdcdn.me/skins/zmp3-v6.1/images/icons/icon-playing.gif"
                                  alt="playing"
                                  style={{ width: "16px", height: "16px" }}
                                />
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 2. KARAOKE (Default) */}
                {fspTab === "karaoke" && (
                  <div
                    className={`fsp-karaoke-layout ${
                      showSplitLyrics && lyrics && lyrics.length > 0
                        ? isMobileScreen
                          ? "has-inline-lyrics"
                          : "has-split-lyrics"
                        : ""
                    }`}
                  >
                    <div className="fsp-album-section">
                      <img
                        src={getOptimizedAlbumArt(playlist[currentIndex].image)}
                        alt={playlist[currentIndex].title}
                        className={`fsp-album-art ${
                          isPlaying && !isLoading
                            ? isMobileScreen
                              ? "spinning"
                              : "floating"
                            : ""
                        }`}
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = currentInfo.img;
                        }}
                      />
                      <div className="fsp-song-info text-center mt-3 mb-2">
                        <h2 className="fsp-title m-0 fw-bold">
                          {playlist[currentIndex].title}
                        </h2>
                        <p className="fsp-artist m-0 opacity-75 mt-1">
                          {playlist[currentIndex].artist}
                        </p>
                      </div>

                      {/* MOBILE INLINE COMPACT LYRICS (KHI BẬT LỜI BÀI HÁT TRÊN MOBILE) */}
                      {isMobileScreen &&
                        showSplitLyrics &&
                        lyrics &&
                        lyrics.length > 0 && (
                          <div className="fsp-inline-lyrics-box">
                            {(() => {
                              const currentIdx =
                                activeLyricIndex >= 0 ? activeLyricIndex : 0;
                              const visibleLines = lyrics.filter(
                                (_, i) => Math.abs(i - currentIdx) <= 1,
                              );
                              return (
                                <div className="fsp-inline-lyrics-content">
                                  {visibleLines.map((line, idx) => {
                                    const isCurrent =
                                      line.time === lyrics[currentIdx]?.time;
                                    const isPast =
                                      line.time < lyrics[currentIdx]?.time;
                                    return (
                                      <p
                                        key={line.time || idx}
                                        className={`fsp-inline-line ${isCurrent ? "current" : isPast ? "past" : "future"}`}
                                        onClick={() => {
                                          if (soundRef.current)
                                            soundRef.current.seek(line.time);
                                        }}
                                      >
                                        {line.text}
                                      </p>
                                    );
                                  })}
                                </div>
                              );
                            })()}
                          </div>
                        )}
                    </div>

                    {/* DESKTOP SPLIT VIEW LYRICS (KHI BẬT LỜI BÀI HÁT TRÊN PC/LAPTOP) */}
                    {!isMobileScreen &&
                      showSplitLyrics &&
                      lyrics &&
                      lyrics.length > 0 && (
                        <div
                          className="fsp-split-lyrics-section custom-scrollbar"
                          ref={splitLyricsRef}
                        >
                          {lyrics.map((line, idx) => (
                            <p
                              key={idx}
                              className={`lyric-line ${
                                idx === activeLyricIndex
                                  ? "active fw-bold text-white fs-4"
                                  : "text-secondary fs-5"
                              }`}
                              style={{
                                transition: "all 0.3s",
                                minHeight: "36px",
                                cursor: "pointer",
                                margin: "14px 0",
                                opacity: idx === activeLyricIndex ? 1 : 0.55,
                              }}
                              onClick={() => {
                                if (soundRef.current)
                                  soundRef.current.seek(line.time);
                              }}
                            >
                              {line.text}
                            </p>
                          ))}
                        </div>
                      )}
                  </div>
                )}

                {/* 4. SOUNDCLOUD WAVEFORM TAB */}
                {fspTab === "soundcloud" && playlist[currentIndex] && (
                  <div
                    ref={scTabRef}
                    className="fsp-soundcloud-tab-container custom-scrollbar w-100 h-100"
                    onScroll={(e) => {
                      const threshold =
                        Math.min(window.innerHeight, window.innerWidth) || 350;
                      setShowScrollTop(e.currentTarget.scrollTop > threshold);
                    }}
                  >
                    {/* HERO TRACK BANNER */}
                    <div className="sc-hero-banner">
                      {/* TOP ROW: CÙNG HÀNG GỒM PLAY BUTTON + TÊN BÀI HÁT + ẢNH THU NHỎ */}
                      <div className="sc-banner-top">
                        <div className="sc-header-row">
                          <button
                            className="sc-main-play-btn"
                            onClick={togglePlay}
                            title={isPlaying ? "Tạm dừng" : "Phát nhạc"}
                          >
                            {isPlaying ? (
                              <FaPause size={22} />
                            ) : (
                              <FaPlay size={22} className="ms-1" />
                            )}
                          </button>
                          <div className="sc-track-meta">
                            <div className="d-flex align-items-center gap-2 mb-1 flex-wrap">
                              <span className="sc-private-badge">
                                TECEDE EXCLUSIVE
                              </span>
                              <span className="sc-timestamp-tag">#Track</span>
                            </div>
                            <h1 className="sc-track-title">
                              {playlist[currentIndex].title}
                            </h1>
                            <p className="sc-track-artist">
                              {playlist[currentIndex].artist}
                            </p>
                          </div>
                        </div>

                        {/* ARTWORK ĐƯA LÊN CÙNG HÀNG */}
                        <div className="sc-hero-right">
                          <img
                            src={getOptimizedAlbumArt(
                              playlist[currentIndex].image,
                            )}
                            alt={playlist[currentIndex].title}
                            className="sc-hero-artwork"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = currentInfo.img;
                            }}
                          />
                        </div>
                      </div>

                      {/* BOTTOM ROW: INTERACTIVE WAVEFORM SCRUBBER TRẢI RỘNG */}
                      <div
                        className="sc-waveform-wrapper"
                        onClick={(e) => {
                          if (!duration || !soundRef.current) return;
                          const rect = e.currentTarget.getBoundingClientRect();
                          const clickX = e.clientX - rect.left;
                          const percent = Math.max(
                            0,
                            Math.min(1, clickX / rect.width),
                          );
                          soundRef.current.seek(percent * duration);
                        }}
                      >
                        <div className="sc-waveform-bars">
                          {(() => {
                            const barCount = isMobileScreen ? 80 : 300;
                            return Array.from({ length: barCount }).map(
                              (_, idx) => {
                                const percentCurrent =
                                  duration > 0
                                    ? (currentTime / duration) * 100
                                    : 0;
                                const barPercent = (idx / barCount) * 100;
                                const isPlayed = barPercent <= percentCurrent;

                                // Waveform linh hoạt: 300 vạch trên PC/Laptop, 80 vạch trên Mobile
                                const titleStr =
                                  playlist[currentIndex].title || "music";
                                const seed =
                                  titleStr.charCodeAt(idx % titleStr.length) ||
                                  55;
                                const waveEnvelope =
                                  Math.sin((idx / barCount) * Math.PI) * 0.4 +
                                  0.55;
                                const harmonic =
                                  Math.sin(
                                    (idx / barCount) *
                                      Math.PI *
                                      (isMobileScreen ? 6 : 9),
                                  ) * 0.16;
                                const pseudoNoise =
                                  (((seed * (idx * 7 + 19)) % 100) / 100) *
                                  0.42;
                                const barHeight = Math.max(
                                  12,
                                  Math.min(
                                    96,
                                    Math.floor(
                                      (waveEnvelope + harmonic + pseudoNoise) *
                                        62,
                                    ),
                                  ),
                                );

                                return (
                                  <div
                                    key={idx}
                                    className={`sc-wave-bar ${isPlayed ? "played" : ""}`}
                                    style={{ height: `${barHeight}%` }}
                                  />
                                );
                              },
                            );
                          })()}
                        </div>

                        {/* TIMESTAMPS */}
                        <div className="sc-time-badge sc-time-left">
                          {Math.floor(currentTime / 60)}:
                          {String(Math.floor(currentTime % 60)).padStart(
                            2,
                            "0",
                          )}
                        </div>
                        <div className="sc-time-badge sc-time-right">
                          -
                          {Math.floor(Math.max(0, duration - currentTime) / 60)}
                          :
                          {String(
                            Math.floor(
                              Math.max(0, duration - currentTime) % 60,
                            ),
                          ).padStart(2, "0")}
                        </div>

                        {/* AVATAR COMMENT MARKERS ON WAVEFORM */}
                        <div className="sc-waveform-avatars">
                          {[12, 28, 42, 60, 75].map((pos, aIdx) => (
                            <img
                              key={aIdx}
                              src={`https://i.pravatar.cc/40?img=${aIdx * 7 + 10}`}
                              alt="user"
                              className="sc-comment-avatar"
                              style={{ left: `${pos}%` }}
                            />
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="sc-action-bar">
                      <div className="sc-action-left">
                        <button className="sc-btn-action active">
                          <FaHeart className="me-1 text-danger" /> Like
                        </button>
                        <button className="sc-btn-action">
                          <FaShareAlt className="me-1" /> Share
                        </button>
                        <button className="sc-btn-action">
                          <FaPlus className="me-1" /> Add to Next up
                        </button>
                        <button className="sc-btn-action">••• More</button>
                      </div>
                      <div className="sc-action-right">
                        <span className="sc-stats-pill">
                          <FaHeadphones className="me-1" />{" "}
                          {playlist[currentIndex].listens !== undefined &&
                          playlist[currentIndex].listens !== null
                            ? playlist[currentIndex].listens.toLocaleString()
                            : "0"}{" "}
                          lượt nghe
                        </span>
                      </div>
                    </div>

                    {/* TWO-COLUMN LAYOUT */}
                    <div className="sc-two-columns">
                      {/* COLUMN LEFT: RELATED TRACKLIST */}
                      <div className="sc-column-left">
                        <h4 className="sc-section-heading">Phát tiếp theo</h4>
                        <div className="sc-tracklist">
                          {playlist.slice(currentIndex + 1).length > 0 ? (
                            playlist
                              .slice(currentIndex + 1)
                              .map((song, sIdx) => {
                                const realIdx = currentIndex + 1 + sIdx;
                                return (
                                  <div
                                    key={song.id || realIdx}
                                    className="sc-track-row"
                                    onClick={() => handlePlay(realIdx)}
                                  >
                                    <span className="sc-row-num">
                                      {realIdx + 1}
                                    </span>
                                    <img
                                      src={song.image}
                                      alt={song.title}
                                      className="sc-row-thumb"
                                    />
                                    <div className="sc-row-info">
                                      <span className="sc-row-title">
                                        {song.title}
                                      </span>
                                      <span className="sc-row-divider">-</span>
                                      <span className="sc-row-artist">
                                        {song.artist}
                                      </span>
                                    </div>
                                    <span className="sc-row-plays">
                                      <FaPlay
                                        size={10}
                                        className="me-1 opacity-75"
                                      />
                                      {song.listens !== undefined &&
                                      song.listens !== null
                                        ? song.listens.toLocaleString()
                                        : "0"}
                                    </span>
                                  </div>
                                );
                              })
                          ) : (
                            <div
                              className="p-3 text-secondary"
                              style={{ fontSize: "13px" }}
                            >
                              Hết danh sách phát tiếp theo
                            </div>
                          )}
                        </div>
                      </div>

                      {/* COLUMN RIGHT: GENRES FEATURED (REPLACING ARTISTS FEATURED) */}
                      <div className="sc-column-right">
                        {/* BASED ON TRACK ARTIST */}
                        <div className="sc-based-on-box mb-4">
                          <p className="sc-based-label">
                            {playlist[currentIndex].artist} -{" "}
                            {playlist[currentIndex].title}
                          </p>
                          <div className="d-flex align-items-center gap-3">
                            <img
                              src={playlist[currentIndex].image}
                              alt={playlist[currentIndex].artist}
                              className="sc-artist-avatar-round"
                            />
                            <div>
                              <p className="m-0 fw-bold text-white">
                                {playlist[currentIndex].artist}
                              </p>
                              <span className="sc-sub-text">
                                Người tạo bản phối
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* THỂ LOẠI NỔI BẬT (TỪ HOMEMUSIC/INDEX.JS) */}
                        <div className="sc-genres-feature-box">
                          <h4 className="sc-section-heading-sm">
                            THỂ LOẠI NỔI BẬT
                          </h4>
                          <div className="sc-genre-list">
                            {musicData.map((genre, gIdx) => {
                              const genreConfig =
                                CATEGORY_CONFIG[genre.path] ||
                                BASE_CATEGORIES[genre.path] ||
                                {};
                              const displayName =
                                genreConfig.title || genre.title;

                              return (
                                <div key={gIdx} className="sc-genre-item">
                                  <div className="d-flex align-items-center gap-2 overflow-hidden">
                                    <img
                                      src={genre.image}
                                      alt={displayName}
                                      className="sc-genre-avatar"
                                      onError={(e) => {
                                        e.target.onerror = null;
                                        e.target.src =
                                          "https://i.ibb.co/tpQF1yq5/85ea2a41bcba853ca1656f17b54d6a71.webp";
                                      }}
                                    />
                                    <div className="overflow-hidden">
                                      <p className="sc-genre-name text-truncate m-0">
                                        {displayName}
                                      </p>
                                      <span className="sc-genre-meta">
                                        {genreConfig.desc ||
                                          "Tuyển tập hay nhất"}
                                      </span>
                                    </div>
                                  </div>

                                  <button
                                    className="sc-genre-btn-follow"
                                    onClick={() => {
                                      setShowFullPlayer(false);
                                      navigate(`/music/${genre.path}`);
                                    }}
                                  >
                                    Khám phá
                                  </button>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* 3. LYRICS */}
                {fspTab === "lyrics" && (
                  <div
                    className="lyrics-container w-100 h-100"
                    ref={lyricsRef}
                    style={{
                      overflowY: "auto",
                      overflowX: "hidden",
                      padding: "20vh 0 45vh 0",
                      maskImage:
                        "linear-gradient(to bottom, transparent, black 10%, black 90%, transparent)",
                    }}
                  >
                    {lyrics.length > 0 ? (
                      lyrics.map((line, idx) => (
                        <p
                          key={idx}
                          className={`lyric-line ${idx === activeLyricIndex ? "active fw-bold text-white" : "text-secondary"} text-center`}
                          style={{
                            transition: "all 0.3s",
                            cursor: "pointer",
                            opacity: idx === activeLyricIndex ? 1 : 0.6,
                          }}
                          onClick={() => {
                            if (soundRef.current)
                              soundRef.current.seek(line.time);
                          }}
                        >
                          {line.text}
                        </p>
                      ))
                    ) : (
                      <div className="d-flex h-100 justify-content-center align-items-center text-center">
                        <p className="text-secondary fs-5 w-75">
                          Đang tải hoặc không tìm thấy lời cho bài hát này...
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {fspTab !== "soundcloud" && (
                <div className="fsp-footer p-4 pt-0">
                  {fspTab === "lyrics" && (
                    <div className="fsp-song-info-small d-flex align-items-center mb-3">
                      <img
                        src={playlist[currentIndex].image}
                        alt="thumb"
                        style={{
                          width: "40px",
                          height: "40px",
                          borderRadius: "4px",
                          objectFit: "cover",
                        }}
                      />
                      <div className="ms-3 overflow-hidden text-start">
                        <p
                          className="m-0 fw-bold text-white text-truncate"
                          style={{ fontSize: "14px" }}
                        >
                          {playlist[currentIndex].title}
                        </p>
                        <p
                          className="m-0 text-light opacity-75 text-truncate"
                          style={{ fontSize: "12px" }}
                        >
                          {playlist[currentIndex].artist}
                        </p>
                      </div>
                    </div>
                  )}
                  <div className="fsp-progress-container mb-4 mt-2">
                    <div className="d-flex justify-content-between mb-2">
                      <span className="time-text">
                        {formatTime(currentTime)}
                      </span>
                      <span className="time-text">{formatTime(duration)}</span>
                    </div>
                    <input
                      type="range"
                      className="custom-range w-100"
                      min="0"
                      max={duration || 0}
                      value={currentTime}
                      onChange={handleSeek}
                      style={{
                        background: `linear-gradient(to right, #fff ${progressPercent}%, rgba(255,255,255,0.2) ${progressPercent}%)`,
                      }}
                    />
                  </div>

                  <div className="fsp-controls d-flex justify-content-center align-items-center gap-3 gap-md-5">
                    <button
                      onClick={handleShufflePlaylist}
                      className="fsp-btn opacity-75 hover-opacity-100"
                    >
                      <FaRandom className="fsp-icon-sm" />
                    </button>
                    <button onClick={handlePrev} className="fsp-btn">
                      <FaStepBackward className="fsp-icon-md" />
                    </button>

                    <button
                      onClick={togglePlay}
                      className="fsp-btn fsp-play-pause-btn"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <FaSpinner
                          className="fsp-icon-lg"
                          style={{ animation: "spin 1s linear infinite" }}
                        />
                      ) : isPlaying ? (
                        <FaPause className="fsp-icon-lg" />
                      ) : (
                        <FaPlay className="fsp-icon-lg ms-1" />
                      )}
                    </button>

                    <button onClick={handleNext} className="fsp-btn">
                      <FaStepForward className="fsp-icon-md" />
                    </button>
                    <button
                      onClick={toggleRepeat}
                      className={`fsp-btn opacity-75 hover-opacity-100 ${isRepeat ? "text-primary" : ""}`}
                    >
                      <FaRetweet
                        className="fsp-icon-sm"
                        color={isRepeat ? "#c084fc" : "inherit"}
                      />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* NÚT CUỘN LÊN ĐẦU TRANG BÊN GÓC PHẢI */}
      {showScrollTop && (
        <button
          className={`fsp-scroll-top-btn ${showFullPlayer ? "in-fsp" : ""}`}
          onClick={handleScrollToTop}
          title="Cuộn lên đầu trang"
          aria-label="Cuộn lên đầu trang"
        >
          <FaChevronUp size={18} />
        </button>
      )}
    </div>
  );
}

export default MusicCategory;
