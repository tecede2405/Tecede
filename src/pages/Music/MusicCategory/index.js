import { useState, useEffect, useRef } from "react";
import React from "react";
import { useParams } from "react-router-dom";
import Tabbar from '../../../component/tabar/index';
import useMusicPlayer from "../../../hooks/useMusicPlayer";
import { FaStepBackward, FaStepForward, FaPlay, FaPause, FaRandom, FaVolumeUp, FaEllipsisV, FaSpinner, FaRegHeart, FaSearch } from "react-icons/fa";
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
  const [playbackRate, setPlaybackRate] = useState(1); 
  const [sleepTimer, setSleepTimer] = useState(null); 
  const sleepTimerRef = useRef(null);
  const wakeLockRef = useRef(null);

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

              {/* BOTTOM PLAYER */}
              {playlist[currentIndex] && (
                <div className="custom-bottom-player">
                  <div className="player-left">
                    <img
                      src={playlist[currentIndex].image}
                      alt={playlist[currentIndex].title}
                      className={`player-thumb flex-shrink-0 ${isPlaying && !isLoading ? "spinning" : ""}`}
                      onError={(e) => { e.target.onerror = null; e.target.src = currentInfo.img; }}
                    />
                    
                    <div className="mobile-song-info d-md-none ms-2 flex-grow-1 overflow-hidden">
                      <h6 className="text-truncate m-0 text-white" style={{fontSize: '13px'}}>{playlist[currentIndex].title}</h6>
                      <p className="text-truncate m-0" style={{fontSize: '11px', color: '#aaa'}}>{playlist[currentIndex].artist}</p>
                    </div>

                    <div className="audio-controls ms-auto ms-md-0 flex-shrink-0 d-flex align-items-center">
                      <button onClick={handlePrev} className="ctrl-btn"><FaStepBackward /></button>
                      
                      <button onClick={togglePlay} className="ctrl-btn play-pause-btn" disabled={isLoading}>
                        {isLoading ? (
                          <FaSpinner style={{ animation: "spin 1s linear infinite" }} />
                        ) : isPlaying ? (
                          <FaPause />
                        ) : (
                          <FaPlay />
                        )}
                      </button>

                      <button onClick={handleNext} className="ctrl-btn"><FaStepForward /></button>
                      
                      {/* NÚT 3 CHẤM BẢN MOBILE */}
                      <div className="options-container position-relative d-md-none ms-3">
                        <button 
                          className={`ctrl-btn ${showMenu ? "active-menu" : ""}`} 
                          onClick={(e) => {
                            e.stopPropagation();
                            setShowMenu(!showMenu)
                            }
                          }
                        >
                          <FaEllipsisV />
                        </button>
                        {showMenu && renderMenuPopup()}
                      </div>
                    </div>
                  </div>

                  <div className="player-center">
                    <div className="song-info">
                      <h5 className="song-name">{playlist[currentIndex].title}</h5>
                      <p className="song-artist">{playlist[currentIndex].artist}</p>
                    </div>
                    <div className="progress-container">
                      <span className="time-text">{formatTime(currentTime)}</span>
                      <input
                        type="range"
                        className="custom-range"
                        min="0"
                        max={duration || 0}
                        value={currentTime}
                        onChange={handleSeek}
                        style={{ background: `linear-gradient(to right, #c084fc ${progressPercent}%, rgba(255,255,255,0.1) ${progressPercent}%)` }}
                      />
                      <span className="time-text">{formatTime(duration)}</span>
                    </div>
                  </div>

                  <div className="player-right">
                    <div className="volume-control">
                      <button className="ctrl-btn" onClick={toggleMute}>
                        {isMuted ? <FaVolumeUp style={{color: '#666'}}/> : <FaVolumeUp />}
                      </button>
                      <input
                        type="range"
                        className="volume-slider"
                        min="0"
                        max="1"
                        step="0.1"
                        value={isMuted ? 0 : volume}
                        onChange={handleVolumeChange}
                        style={{ background: `linear-gradient(to right, #fff ${volPercent}%, rgba(255,255,255,0.1) ${volPercent}%)` }}
                      />
                    </div>

                    {/* NÚT 3 CHẤM BẢN PC */}
                    <div className="options-container position-relative d-none d-md-block">
                      <button 
                        className={`ctrl-btn ${showMenu ? "active-menu" : ""}`} 
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowMenu(!showMenu)
                        }}
                      >
                        <FaEllipsisV />
                      </button>
                      {showMenu && renderMenuPopup()}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default MusicCategory;