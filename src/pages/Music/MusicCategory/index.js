import { useState, useEffect, useRef } from "react";
import React from "react";
import { useParams } from "react-router-dom";
import Tabbar from '../../../component/tabar/index';
import useMusicPlayer from "../../../hooks/useMusicPlayer";
import { FaStepBackward, FaStepForward, FaPlay, FaPause, FaRandom, FaVolumeUp, FaVolumeMute, FaEllipsisV, FaSpinner, FaRegHeart, FaSearch, FaChevronDown, FaMicrophone, FaExpandAlt, FaRetweet, FaListUl, FaCompactDisc } from "react-icons/fa";
import Loading from "../../../component/LoadingScreen/index";
import "./style.scss";

const CATEGORY_CONFIG = {
  "mood": { dbType: "nhackhongloi", title: "Nhạc Tâm Trạng 🎵", desc: "Chữa lành tâm hồn", img: "https://i.ibb.co/tpQF1yq5/85ea2a41bcba853ca1656f17b54d6a71.webp" },
  "nhac-douyin": { dbType: "nhacdouyin", title: "Nhạc Douyin 🎵", desc: "Trend TikTok Trung Quốc", img: "https://i.ibb.co/XZBqqxPT/bb95fae35b14b87ed5d6d2d15791e3f2.webp" },
  "nhac-tre": { dbType: "nhactre", title: "Nhạc Trẻ 🎧", desc: "V-hit thập cẩm", img: "https://i.ibb.co/KcWRC4Xr/f8067e4d176cf42261c0b2789a1a1035.webp" },
  "usuk": { dbType: "nhacusuk", title: "Nhạc Âu Mỹ 🗽", desc: "Tổng hợp hot hit", img: "https://i.ibb.co/V0Cc13KY/1a5d4aca0654d716f9ec965dbafc8bf2.webp" },
  "trung-quoc": { dbType: "nhactrungquoc", title: "Nhạc Trung Quốc 🎧", desc: "Nhạc Hoa Ngữ hay nhất", img: "https://i.ibb.co/20Jr4KNf/9cb9409ff6db5a3e70ca628f2be2b3ee.webp" },
  "nhactre-remix": { dbType: "nhactreremix", title: "Nhạc Remix 🎧", desc: "Quẩy tung nóc nhà", img: "https://i.ibb.co/nNXDCBDW/z6742344336920-1eae53132a29744632a92d96486d4a9c.webp" },
  "edm": { dbType: "nhacedm", title: "Nhạc EDM ⚡", desc: "Electronic Dance Music", img: "https://i.ibb.co/F4z8B0ST/6659861e5f2cb99d7a210d2b258ec8f5.webp" },
  "phonk": { dbType: "nhacphonk", title: "Nhạc Phonk 🎵", desc: "Nhạc cháy như FreeFire.", img: "https://i.ibb.co/YBKJGt8X/z6731791091720-ce92821376e7f43bbbf76879ac9f07e3.webp" },
  "nhac-lofi": { dbType: "nhac-lofi", title: "Nhạc Lofi 🎵", desc: "Chill and Study", img: "https://i.ibb.co/rjFJn7H/z7604161484626-99ee66797819706db71be74a68b02785.webp" },
};

function MusicCategory() {
  const { categorySlug } = useParams(); 
  
  const currentInfo = CATEGORY_CONFIG[categorySlug] || {
    dbType: categorySlug,
    title: "Danh sách phát",
    desc: "Cập nhật hôm nay",
    img: "https://i.ibb.co/YBKJGt8X/z6731791091720-ce92821376e7f43bbbf76879ac9f07e3.webp"
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
    isVibeEnabled,
    toggleVibe // 🌟 Gọi hàm toggle mới ở đây
  } = useMusicPlayer([]);

  const [loading, setLoading] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");

  const [showMenu, setShowMenu] = useState(false);
  const [showFullPlayer, setShowFullPlayer] = useState(false);
  const [fspTab, setFspTab] = useState('karaoke');
  const [lyrics, setLyrics] = useState([]);
  
  const [playbackRate, setPlaybackRate] = useState(1); 
  const [sleepTimer, setSleepTimer] = useState(null); 
  const sleepTimerRef = useRef(null);
  const wakeLockRef = useRef(null);
  const lyricsRef = useRef(null);

  // Fetch Lyrics LRCLIB
  useEffect(() => {
    if (!playlist[currentIndex]) return;
    const { title, artist } = playlist[currentIndex];
    
    setLyrics([]); // reset
    
    fetch(`https://lrclib.net/api/search?track_name=${encodeURIComponent(title)}&artist_name=${encodeURIComponent(artist)}`)
      .then(res => res.json())
      .then(data => {
        if (data && data.length > 0 && data[0].syncedLyrics) {
          const lrc = data[0].syncedLyrics;
          const lines = lrc.split('\n');
          const result = [];
          const timeRegex = /\[(\d{2}):(\d{2}\.\d{2})\]/;
          
          lines.forEach(line => {
            const match = timeRegex.exec(line);
            if (match) {
              const minutes = parseInt(match[1], 10);
              const seconds = parseFloat(match[2]);
              const time = minutes * 60 + seconds;
              const text = line.replace(timeRegex, '').trim();
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
      .catch(err => {
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

  // Auto-scroll lyrics
  useEffect(() => {
    if (fspTab === 'lyrics' && showFullPlayer && activeLyricIndex !== -1 && lyricsRef.current) {
      const activeEl = lyricsRef.current.querySelector('.lyric-line.active');
      if (activeEl) {
        activeEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }, [activeLyricIndex, fspTab, showFullPlayer]);

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

  useEffect(() => {
    setLoading(true);
    const baseUrl = process.env.REACT_APP_API_URL || "http://localhost:5000";
    fetch(`${baseUrl}/api/songs/category/${currentInfo.dbType}`)
      .then((res) => res.json())
      .then((data) => {
        updatePlaylist(data);
        setTimeout(() => setLoading(false), 1000); 
      })
      .catch(() => setTimeout(() => setLoading(false), 1000));
  }, [categorySlug, currentInfo.dbType, updatePlaylist]);

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
      if (!event.target.closest('.options-container')) {
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
      sleepTimerRef.current = setTimeout(() => {
        if (soundRef.current) {
          soundRef.current.pause();
          setSleepTimer(null);
        }
      }, minutes * 60 * 1000);
    }
  };

  const filteredPlaylist = playlist.filter(song => 
    song.title?.toLowerCase().includes(searchQuery.toLowerCase()) || 
    song.artist?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;
  const volPercent = (isMuted ? 0 : volume) * 100;

  const isNewSong = (createdAt) => {
    if (!createdAt) return false;
    const createdDate = new Date(createdAt);
    const now = new Date();
    const diffDays = (now - createdDate) / (1000 * 60 * 60 * 24);
    return diffDays <= 7;
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      const tag = document.activeElement?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || document.activeElement?.isContentEditable) return;
      if (e.code === "Space") {
        e.preventDefault(); 
        togglePlay();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [togglePlay]);

  // wakelock



useEffect(() => {
  let isMounted = true;

  // Hàm xin quyền giữ màn hình sáng
  const requestWakeLock = async () => {
    try {
      // Kiểm tra trình duyệt có hỗ trợ không
      if (!("wakeLock" in navigator)) {
        console.log("❌ Trình duyệt không hỗ trợ Wake Lock");
        return;
      }

      // Xin quyền giữ màn hình sáng
      wakeLockRef.current = await navigator.wakeLock.request("screen");

      console.log("🔒 Đã bật chế độ không tắt màn hình");

      // Khi Wake Lock bị hủy
      wakeLockRef.current.addEventListener("release", () => {
        console.log(
          "🔓 Wake Lock bị hủy | Trạng thái tab:",
          document.visibilityState
        );

        // Reset ref để lần sau xin lại được
        wakeLockRef.current = null;
      });
    } catch (error) {
      console.error("Lỗi Wake Lock:", error);
    }
  };

  // Vào trang là xin Wake Lock luôn
  requestWakeLock();

  // Theo dõi khi người dùng đổi tab hoặc quay lại tab
  const handleVisibilityChange = async () => {
    console.log(
      " thái tab:",
      document.visibilityState
    );

    // Nếu quay lại tab và Wake Lock đã mất
    if (
      document.visibilityState === "visible" &&
      !wakeLockRef.current &&
      isMounted
    ) {
      console.log("Đang xin lại Wake Lock...");
      await requestWakeLock();
    }
  };

  document.addEventListener(
    "visibilitychange",
    handleVisibilityChange
  );

  // Cleanup khi rời trang
  return async () => {
    isMounted = false;

    document.removeEventListener(
      "visibilitychange",
      handleVisibilityChange
    );

    if (wakeLockRef.current) {
      try {
        await wakeLockRef.current.release();
        wakeLockRef.current = null;

        console.log(
          "🔓 Đã tắt Wake Lock vì người dùng rời trang"
        );
      } catch (error) {
        console.error(error);
      }
    }
  };
}, []);

  // KHAI BÁO MENU DÙNG CHUNG CHO PC VÀ MOBILE
  const renderMenuPopup = () => (
    <div className="custom-options-popup">
      <div className="option-section">
        <p className="option-title">Hiệu ứng âm thanh</p>
        <button 
          className={`option-btn w-100 ${isVibeEnabled ? "active" : ""}`}
          onClick={toggleVibe} // Gọi hàm toggleVibe ở đây
        >
          {isVibeEnabled ? "Tắt Bass" : "Bật Bass"}
        </button>
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
        <p className="option-title">Hẹn giờ tắt {sleepTimer ? `(${sleepTimer}p)` : ""}</p>
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
          ) : (
            <div className="music-scroll-area custom-scrollbar">
              
              <div className="main-layout-grid d-flex gap-4">
                
                {/* CỘT TRÁI */}
                <div className="left-column flex-grow-1">
                  
                  <div className="album-header d-flex align-items-center gap-4">
                    <div className="album-cover-wrapper">
                      <img 
                        src={currentInfo.img} 
                        alt={currentInfo.title} 
                        className="album-cover-img"
                        onError={(e) => { e.target.onerror = null; e.target.src = "https://i.ibb.co/tpQF1yq5/85ea2a41bcba853ca1656f17b54d6a71.webp"; }}
                      />
                    </div>
                    
                    <div className="album-info text-md-start">
                      <h1 className="album-title">{currentInfo.title}</h1>
                      <p className="album-desc">{currentInfo.desc}</p>
                      <p className="album-stats">• {playlist.length} bài hát</p>
                      
                      <div className="album-actions d-flex align-items-center gap-3 mt-3">
                        <button onClick={handleShufflePlaylist} className="btn-play-all">
                          <FaRandom className="me-2" /> Phát ngẫu nhiên
                        </button>
                        <button className="action-icon-btn"><FaRegHeart /></button>
                        <button className="action-icon-btn"><FaEllipsisV /></button>
                      </div>
                    </div>
                  </div>

                  <div className="playlist-table-container">
                    <div className="playlist-tabs d-flex justify-content-between align-items-center">
                      <div className="tabs-left d-flex gap-4">
                        <span className="tab-item active">Tổng quan</span>
                        <span className="tab-item active">Bài hát<span className="badge">{playlist.length}</span></span>
                      </div>
                    </div>

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
                        {filteredPlaylist.map((song, idx) => {
                          const isCurrent = playlist[currentIndex]?._id === song._id;
                          return (
                            <tr 
                              key={song._id} 
                              className={`song-row ${isCurrent ? 'playing' : ''}`}
                              onClick={() => {
                                const realIndex = playlist.findIndex(p => p._id === song._id);
                                handlePlay(realIndex);
                              }}
                            >
                              <td className="td-number">
                                {isCurrent && isPlaying ? (
                                  <img src="https://zmp3-static.zmdcdn.me/skins/zmp3-v6.1/images/icons/icon-playing.gif" alt="playing" className="playing-gif" />
                                ) : (
                                  idx + 1
                                )}
                              </td>
                              <td className="td-title">
                                <div className="d-flex align-items-center gap-3 w-100 overflow-hidden">
                                  <img src={song.image} alt={song.title} className="song-thumb flex-shrink-0" />
                                  <div className="d-flex flex-column w-100 overflow-hidden">
                                    <div className="song-name-box w-100 overflow-hidden text-truncate">
                                      <span
                                        className="song-name-text text-truncate d-inline-block align-middle"
                                        style={{ maxWidth: "85%" }}
                                      >
                                        {song.title}
                                      </span>
                                    <div>
                                      {isNewSong(song.createdAt) && (
                                        <span className="new-badge ms-2">Mới</span>
                                      )}
                                      <span className="song-badge flex-shrink-0 ms-2 align-middle">
                                        HQ
                                      </span>
                                    </div>
                                    </div>
                                    <div className="d-md-none text-truncate mt-1" style={{fontSize: '11px', color: '#a0a0ab'}}>
                                      {song.artist} • {song.listens ? song.listens.toLocaleString() : "0"} lượt nghe
                                    </div>
                                  </div>
                                </div>
                              </td>
                              <td className="td-artist">
                                <div className="text-truncate" style={{maxWidth: '100%'}}>{song.artist}</div>
                              </td>
                              <td className="td-time text-center">
                                <div className="d-flex align-items-center justify-content-center gap-3">
                                  <FaRegHeart className="row-action-icon heart-icon d-none d-md-block" />
                                  <span className="d-flex justify-content-center align-items-center gap-2">
                                    <FaPlay style={{ fontSize: '10px' }} /> 
                                    {song.listens ? song.listens.toLocaleString() : "0"}
                                  </span>
                                  <FaEllipsisV className="row-action-icon ms-2 d-none d-md-block" />
                                </div>
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* CỘT PHẢI */}
                <div className="right-column">
                  {playlist[currentIndex] && (
                    <div className="now-playing-section mb-4">
                      <h5 className="right-panel-title mb-3">Đang phát</h5>
                     <div
                        className="now-playing-card"
                        style={{
                          "--bg-image": `url(${playlist[currentIndex].image})`
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
                      <h5 className="right-panel-title m-0">Tiếp theo</h5>
                      <span className="clear-queue-btn">Lượt nghe</span>
                    </div>
                    
                    <div className="up-next-list">
                      {playlist.slice(currentIndex + 1, currentIndex + 11).map((song, i) => (
                        <div 
                          key={song._id} 
                          className="up-next-item d-flex align-items-center gap-3 mb-2"
                          onClick={() => handlePlay(currentIndex + 1 + i)}
                        >
                          <span className="un-number">{currentIndex + 2 + i}</span>
                          <img src={song.image} alt={song.title} className="un-thumb flex-shrink-0" />
                          <div className="un-info flex-grow-1 overflow-hidden">
                            <h6 className="un-title text-truncate m-0">{song.title}</h6>
                            <p className="un-artist text-truncate m-0">{song.artist}</p>
                          </div>
                          <span className="un-time  flex-shrink-0 d-flex justify-content-center align-items-center gap-2">
                            <FaPlay style={{ fontSize: '8px' }} /> 
                            {song.listens ? song.listens.toLocaleString() : "0"}
                          </span>
                        </div>
                      ))}
                      {currentIndex + 1 >= playlist.length && (
                        <p className="end-of-queue text-center mt-4">Hết bài hát để phát.</p>
                      )}
                    </div>
                  </div>

                </div>
              </div>

              {/* BOTTOM PLAYER SPOTIFY STYLE */}
              {playlist[currentIndex] && (
                <div className="custom-bottom-player spotify-style" onClick={() => setShowFullPlayer(true)}>
                  {/* LEFT: Info */}
                  <div className="player-left">
                    <img
                      src={playlist[currentIndex].image}
                      alt={playlist[currentIndex].title}
                      className={`player-thumb flex-shrink-0 ${isPlaying && !isLoading ? "spinning" : ""}`}
                      onError={(e) => { e.target.onerror = null; e.target.src = currentInfo.img; }}
                    />
                    <div className="song-info flex-grow-1 overflow-hidden ms-2 ms-md-3">
                      <h6 className="song-name m-0 text-white text-truncate" style={{fontSize: '14px'}}>{playlist[currentIndex].title}</h6>
                      <p className="song-artist m-0 text-truncate" style={{fontSize: '12px', color: '#b3b3b3'}}>{playlist[currentIndex].artist}</p>
                    </div>
                  </div>

                  {/* CENTER: Controls & Progress */}
                  <div className="player-center" onClick={(e) => e.stopPropagation()}>
                    <div className="audio-controls d-flex align-items-center justify-content-center mb-0 mb-md-2">
                      <button onClick={handleShufflePlaylist} className="ctrl-btn d-none d-md-block" title="Phát ngẫu nhiên"><FaRandom size={14} /></button>
                      <button onClick={handlePrev} className="ctrl-btn ms-3 d-none d-md-block" title="Bài trước"><FaStepBackward size={16}/></button>
                      
                      <button onClick={togglePlay} className="ctrl-btn play-pause-btn ms-auto ms-md-3" title="Phát/Tạm dừng" disabled={isLoading}>
                        {isLoading ? (
                          <FaSpinner size={14} style={{ animation: "spin 1s linear infinite" }} />
                        ) : isPlaying ? (
                          <FaPause size={14} />
                        ) : (
                          <FaPlay size={14} style={{marginLeft:'2px'}}/>
                        )}
                      </button>

                      <button onClick={handleNext} className="ctrl-btn ms-3" title="Bài tiếp theo"><FaStepForward size={16}/></button>
                      <button className="ctrl-btn ms-3 d-none d-md-block" title="Lặp lại"><FaRetweet size={14} /></button>
                      <button className="ctrl-btn ms-3 d-md-none" title="Mở toàn màn hình" onClick={() => setShowFullPlayer(true)}><FaExpandAlt size={14} /></button>
                    </div>
                    
                    <div className="progress-container w-100 d-none d-md-flex align-items-center gap-2">
                      <span className="time-text" style={{fontSize:'11px', color:'#a7a7a7'}}>{formatTime(currentTime)}</span>
                      <input
                        type="range"
                        className="custom-range"
                        min="0"
                        max={duration || 0}
                        value={currentTime}
                        onChange={handleSeek}
                        style={{ background: `linear-gradient(to right, #fff ${progressPercent}%, rgba(255,255,255,0.1) ${progressPercent}%)` }}
                      />
                      <span className="time-text" style={{fontSize:'11px', color:'#a7a7a7'}}>{formatTime(duration)}</span>
                    </div>
                  </div>

                  {/* RIGHT: Volume & Actions */}
                  <div className="player-right d-none d-md-flex justify-content-end align-items-center gap-3 pe-2" onClick={(e) => e.stopPropagation()}>
                    <button 
                      className={`ctrl-btn ${fspTab === 'lyrics' ? 'text-primary' : ''}`} 
                      title="Lời bài hát"
                      onClick={() => {
                        setFspTab('lyrics');
                        setShowFullPlayer(true);
                      }}
                    >
                      <FaMicrophone size={14} />
                    </button>
                    
                    <div 
                      className="volume-control d-flex justify-content-center align-items-center" 
                      style={{width: '90px'}}
                    >
                      <button className="ctrl-btn me-2" onClick={toggleMute} title="Âm lượng">
                        {isMuted ? <FaVolumeMute size={16} style={{color: '#666'}}/> : <FaVolumeUp size={16}/>}
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
                          width: '100%', 
                          background: `linear-gradient(to right, #fff ${volPercent}%, rgba(255,255,255,0.3) ${volPercent}%)` 
                        }}
                      />
                    </div>
                    <button className="ctrl-btn" title="Toàn màn hình" onClick={() => setShowFullPlayer(true)}><FaExpandAlt size={14} /></button>
                    
                    <div className="options-container position-relative">
                      <button 
                        className={`ctrl-btn ${showMenu ? "active-menu" : ""}`} 
                        title="Tùy chọn khác"
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowMenu(!showMenu)
                        }}
                      >
                        <FaEllipsisV size={14} />
                      </button>
                      {showMenu && renderMenuPopup()}
                    </div>
                  </div>
                  
                  {/* MOBILE PROGRESS BAR (Absolute Bottom) */}
                  <div className="mobile-progress-bar d-md-none position-absolute bottom-0 start-0 w-100" style={{height: '2px', background: 'rgba(255,255,255,0.1)'}}>
                    <div className="mobile-progress-fill h-100 bg-white" style={{width: `${progressPercent}%`}}></div>
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
              style={{ backgroundImage: `url(${playlist[currentIndex].image})` }} 
            />
            <div className="fsp-overlay" />
            
            <div className="fsp-content d-flex flex-column h-100">
              <div className="fsp-header d-flex justify-content-between align-items-center p-3 pt-4 position-relative">
                <button className="fsp-btn z-index-3" onClick={() => setShowFullPlayer(false)} style={{zIndex: 10}}>
                  <FaChevronDown />
                </button>
                
                {/* SEGMENTED CONTROL TABS (IN HEADER) */}
                <div className="fsp-tabs-container position-absolute top-50 start-50 translate-middle w-100 d-flex justify-content-center px-5" style={{zIndex: 5, pointerEvents: 'none'}}>
                  <div className="d-flex align-items-center" style={{background: 'rgba(255,255,255,0.1)', borderRadius: '30px', padding: '4px', pointerEvents: 'auto'}}>
                    <button 
                      className={`fsp-tab-btn ${fspTab === 'playlist' ? 'active' : ''}`} 
                      onClick={() => setFspTab('playlist')}
                    >
                      <span className="d-none d-md-inline">Danh sách phát</span>
                      <FaListUl className="d-md-none" size={16}/>
                    </button>
                    <button 
                      className={`fsp-tab-btn ${fspTab === 'karaoke' ? 'active' : ''}`} 
                      onClick={() => setFspTab('karaoke')}
                    >
                      <span className="d-none d-md-inline">Màn hình phát</span>
                      <FaCompactDisc className="d-md-none" size={16}/>
                    </button>
                    <button 
                      className={`fsp-tab-btn ${fspTab === 'lyrics' ? 'active' : ''}`} 
                      onClick={() => setFspTab('lyrics')}
                    >
                      <span className="d-none d-md-inline">Lời bài hát</span>
                      <FaMicrophone className="d-md-none" size={16}/>
                    </button>
                  </div>
                </div>

                <div className="z-index-3" style={{width: '40px', zIndex: 10}}></div>
              </div>

              <div className="fsp-body flex-grow-1 d-flex flex-column justify-content-center align-items-center px-4" style={{overflowY: 'hidden', position: 'relative'}}>
                {/* 1. PLAYLIST */}
                {fspTab === 'playlist' && (
                  <div className="playlist-container custom-scrollbar w-100 h-100" style={{overflowY: 'auto', padding: '20px 0', maxWidth: '600px'}}>
                    <h3 className="mb-4 text-center fw-bold text-white">Danh sách phát</h3>
                    {playlist.map((song, idx) => (
                      <div 
                        key={idx} 
                        className={`d-flex align-items-center p-2 mb-2 rounded ${idx === currentIndex ? 'text-white' : 'text-light'}`}
                        style={{cursor: 'pointer', background: idx === currentIndex ? 'rgba(155, 77, 224, 0.4)' : 'rgba(255,255,255,0.05)', transition: 'background 0.2s'}}
                        onClick={() => {
                          handlePlay(idx);
                        }}
                      >
                        <img src={song.image} alt={song.title} style={{width: '50px', height: '50px', borderRadius: '4px', objectFit: 'cover'}} />
                        <div className="ms-3 overflow-hidden">
                          <p className="m-0 fw-bold text-truncate" style={{fontSize: '15px'}}>{song.title}</p>
                          <p className="m-0 small opacity-75 text-truncate">{song.artist}</p>
                        </div>
                        {idx === currentIndex && <div className="ms-auto pe-3"><FaPlay size={12} color="#c084fc"/></div>}
                      </div>
                    ))}
                  </div>
                )}

                {/* 2. KARAOKE (Default) */}
                {fspTab === 'karaoke' && (
                  <>
                    <img 
                      src={playlist[currentIndex].image} 
                      alt={playlist[currentIndex].title}
                      className={`fsp-album-art ${isPlaying && !isLoading ? "spinning" : ""}`}
                      onError={(e) => { e.target.onerror = null; e.target.src = currentInfo.img; }}
                    />
                    
                    <div className="fsp-song-info text-center mt-4 mb-2">
                      <h2 className="fsp-title m-0 fw-bold">{playlist[currentIndex].title}</h2>
                      <p className="fsp-artist m-0 fs-5 opacity-75 mt-1">{playlist[currentIndex].artist}</p>
                    </div>
                  </>
                )}

                {/* 3. LYRICS */}
                {fspTab === 'lyrics' && (
                  <div className="lyrics-container custom-scrollbar w-100 h-100" ref={lyricsRef} style={{overflowY: 'auto', padding: '20vh 0', maskImage: 'linear-gradient(to bottom, transparent, black 10%, black 90%, transparent)'}}>
                    {lyrics.length > 0 ? (
                      lyrics.map((line, idx) => (
                        <p 
                          key={idx} 
                          className={`lyric-line ${idx === activeLyricIndex ? 'active fw-bold text-white fs-3' : 'text-secondary fs-5'} text-center`} 
                          style={{transition: 'all 0.3s', minHeight: '40px', cursor: 'pointer', margin: '15px 0', opacity: idx === activeLyricIndex ? 1 : 0.6}}
                          onClick={() => {
                            if (soundRef.current) soundRef.current.seek(line.time);
                          }}
                        >
                          {line.text}
                        </p>
                      ))
                    ) : (
                      <div className="d-flex h-100 justify-content-center align-items-center text-center">
                        <p className="text-secondary fs-5 w-75">Đang tải hoặc không tìm thấy lời cho bài hát này...</p>
                      </div>
                    )}
                  </div>
                )}
              </div>



              <div className="fsp-footer p-4">
                <div className="fsp-progress-container mb-4">
                  <div className="d-flex justify-content-between mb-2">
                    <span className="time-text">{formatTime(currentTime)}</span>
                    <span className="time-text">{formatTime(duration)}</span>
                  </div>
                  <input
                    type="range"
                    className="custom-range w-100"
                    min="0"
                    max={duration || 0}
                    value={currentTime}
                    onChange={handleSeek}
                    style={{ background: `linear-gradient(to right, #fff ${progressPercent}%, rgba(255,255,255,0.2) ${progressPercent}%)` }}
                  />
                </div>

                <div className="fsp-controls d-flex justify-content-center align-items-center gap-4 gap-md-5">
                  <button onClick={handleShufflePlaylist} className="fsp-btn opacity-75 hover-opacity-100">
                    <FaRandom size={20} />
                  </button>
                  <button onClick={handlePrev} className="fsp-btn">
                    <FaStepBackward size={28} />
                  </button>
                  
                  <button onClick={togglePlay} className="fsp-btn fsp-play-pause-btn" disabled={isLoading}>
                    {isLoading ? (
                      <FaSpinner size={32} style={{ animation: "spin 1s linear infinite" }} />
                    ) : isPlaying ? (
                      <FaPause size={32} />
                    ) : (
                      <FaPlay size={32} className="ms-1" />
                    )}
                  </button>

                  <button onClick={handleNext} className="fsp-btn">
                    <FaStepForward size={28} />
                  </button>
                  <button className="fsp-btn opacity-75 hover-opacity-100">
                    <FaRegHeart size={20} />
                  </button>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

    </div>
  );
}

export default MusicCategory;