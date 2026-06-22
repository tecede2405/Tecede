import { useState, useEffect, useRef, useCallback } from "react";
import React from "react";
import { useParams } from "react-router-dom";
import { Howler } from "howler"; 
import Tabbar from '../../../component/tabar/index';
import useMusicPlayer from "../../../hooks/useMusicPlayer";
import { FaStepBackward, FaStepForward, FaPlay, FaPause, FaRandom, FaVolumeUp, FaEllipsisV, FaSpinner, FaRegHeart, FaSearch, FaHeadphones } from "react-icons/fa";
import Loading from "../../../component/Loading";
import "./style.scss";

const CATEGORY_CONFIG = {
  "mood": { dbType: "nhackhongloi", title: "Nhạc Tâm Trạng 🎵", desc: "Chữa lành tâm hồn", img: "https://i.ibb.co/tpQF1yq5/85ea2a41bcba853ca1656f17b54d6a71.webp" },
  "nhac-douyin": { dbType: "nhacdouyin", title: "Nhạc Douyin 🎵", desc: "Trend TikTok Trung Quốc", img: "https://i.ibb.co/XZBqqxPT/bb95fae35b14b87ed5d6d2d15791e3f2.webp" },
  "nhac-tre": { dbType: "nhactre", title: "Nhạc Trẻ Remix 🎵", desc: "Quẩy tung nóc nhà 🔥", img: "https://i.ibb.co/KcWRC4Xr/f8067e4d176cf42261c0b2789a1a1035.webp" },
  "usuk": { dbType: "nhacusuk", title: "Nhạc US-UK 🗽", desc: "Tổng hợp hot hit", img: "https://i.ibb.co/V0Cc13KY/1a5d4aca0654d716f9ec965dbafc8bf2.webp" },
  "trung-quoc": { dbType: "nhactrungquoc", title: "Nhạc Trung Quốc 🎵", desc: "Nhạc Hoa Ngữ hay nhất", img: "https://i.ibb.co/20Jr4KNf/9cb9409ff6db5a3e70ca628f2be2b3ee.webp" },
  "nhactre-remix": { dbType: "nhactreremix", title: "Nhạc Trẻ Remix 🎵", desc: "Quẩy tung nóc nhà 🔥", img: "https://i.ibb.co/nNXDCBDW/z6742344336920-1eae53132a29744632a92d96486d4a9c.webp" },
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
    togglePlay, 
    handlePlay,
    handlePrev,
    handleNext,
    handleShufflePlaylist,
    updatePlaylist,
  } = useMusicPlayer([]);

  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");

  const [showMenu, setShowMenu] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1); 
  const [sleepTimer, setSleepTimer] = useState(null); 
  const menuRef = useRef(null);
  const sleepTimerRef = useRef(null);

  useEffect(() => {
    let interval;
    if (isPlaying && !isLoading) { 
      interval = setInterval(() => {
        if (soundRef.current) {
          setCurrentTime(soundRef.current.seek() || 0);
          setDuration(soundRef.current.duration() || 0);
        }
      }, 500); 
    }
    return () => clearInterval(interval);
  }, [isPlaying, isLoading, soundRef]);

  const toggleMute = () => {
    const newMute = !isMuted;
    Howler.mute(newMute);
    setIsMuted(newMute);
  };

  const handleVolumeChange = (e) => {
    const newVol = Number(e.target.value);
    Howler.volume(newVol);
    setVolume(newVol);
    setIsMuted(newVol === 0);
  };

  const enableStudioMastering = useCallback(() => {
    const audioEl = soundRef.current?._sounds[0]?._node;
    if (!audioEl || audioEl.isMastered) return;

    try {
      audioEl.crossOrigin = "anonymous"; 
      if (!window.globalAudioCtx) {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        window.globalAudioCtx = new AudioContext();
      }
      const audioCtx = window.globalAudioCtx;

      if (!audioEl._sourceNode) {
        audioEl._sourceNode = audioCtx.createMediaElementSource(audioEl);
      }
      const source = audioEl._sourceNode;

      const makeDistortionCurve = (amount) => {
        const k = amount;
        const n_samples = 44100;
        const curve = new Float32Array(n_samples);
        const deg = Math.PI / 180;
        for (let i = 0; i < n_samples; ++i) {
          const x = i * 2 / n_samples - 1;
          curve[i] = (3 + k) * x * 20 * deg / (Math.PI + k * Math.abs(x));
        }
        return curve;
      };
      const saturator = audioCtx.createWaveShaper();
      saturator.curve = makeDistortionCurve(1.2); 
      saturator.oversample = '4x'; 

      const punchEQ = audioCtx.createBiquadFilter();
      punchEQ.type = "peaking";
      punchEQ.frequency.value = 85;
      punchEQ.Q.value = 1.4; 
      punchEQ.gain.value = 4.5; 

      const mudCutEQ = audioCtx.createBiquadFilter();
      mudCutEQ.type = "peaking";
      mudCutEQ.frequency.value = 250;
      mudCutEQ.Q.value = 1.2;
      mudCutEQ.gain.value = -3.0; 

      const vocalEQ = audioCtx.createBiquadFilter();
      vocalEQ.type = "peaking";
      vocalEQ.frequency.value = 2500;
      vocalEQ.Q.value = 1.0;
      vocalEQ.gain.value = 1.5;

      const harshCutEQ = audioCtx.createBiquadFilter();
      harshCutEQ.type = "peaking";
      harshCutEQ.frequency.value = 4000;
      harshCutEQ.Q.value = 1.5;
      harshCutEQ.gain.value = -1.5; 

      const airEQ = audioCtx.createBiquadFilter();
      airEQ.type = "highshelf";
      airEQ.frequency.value = 12000;
      airEQ.gain.value = 2.0;

      const compressor = audioCtx.createDynamicsCompressor();
      compressor.threshold.value = -18; 
      compressor.knee.value = 20;       
      compressor.ratio.value = 3.5;     
      compressor.attack.value = 0.008; 
      compressor.release.value = 0.1;  

      const limiter = audioCtx.createDynamicsCompressor();
      limiter.threshold.value = -1.0; 
      limiter.knee.value = 0;         
      limiter.ratio.value = 20.0;     
      limiter.attack.value = 0.001;   
      limiter.release.value = 0.05;

      source.connect(saturator);
      saturator.connect(punchEQ);
      punchEQ.connect(mudCutEQ);
      mudCutEQ.connect(vocalEQ);
      vocalEQ.connect(harshCutEQ);
      harshCutEQ.connect(airEQ);
      airEQ.connect(compressor);
      compressor.connect(limiter); 
      limiter.connect(audioCtx.destination);
      
      audioEl.isMastered = true;
    } catch (error) {
      console.warn("Lỗi khởi tạo DSP Engine:", error);
    }
  }, [soundRef]);

  useEffect(() => {
    if (isPlaying) enableStudioMastering();
  }, [isPlaying, enableStudioMastering]);

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
    setCurrentTime(newTime);
  };

  const formatTime = (time) => {
    if (!time || isNaN(time)) return "0:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) setShowMenu(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
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
                
                {/* ---------- CỘT TRÁI ---------- */}
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
                        <span className="tab-item active">Tông quan</span>
                        <span className="tab-item active">Bài hát<span className="badge">{playlist.length}</span></span>
                        <span className="tab-item active">Nghệ sĩ</span>
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
                                      <span className="song-name-text text-truncate d-inline-block align-middle" style={{maxWidth: '85%'}}>{song.title}</span>
                                      <span className="song-badge flex-shrink-0 ms-2 align-middle">HQ</span>
                                    </div>
                                    {/* 🌟 HIỆN TÊN CA SĨ & VIEW TRÊN MOBILE (SẼ BỊ ẨN TRÊN PC BỞI d-md-none) */}
                                    <div className="d-md-none text-truncate mt-1" style={{fontSize: '11px', color: '#a0a0ab'}}>
                                      {song.artist} • {song.listens ? song.listens.toLocaleString() : "0"} lượt nghe
                                    </div>
                                  </div>
                                </div>
                              </td>
                              <td className="td-artist">
                                <div className="text-truncate" style={{maxWidth: '100%'}}>{song.artist}</div>
                              </td>
                              {/* 🌟 CĂN GIỮA NỘI DUNG CỘT LƯỢT NGHE */}
                              <td className="td-time text-center">
                                <div className="d-flex align-items-center justify-content-center gap-3">
                                  <FaRegHeart className="row-action-icon heart-icon d-none d-md-block" />
                                  <span>{song.listens ? song.listens.toLocaleString() : "0"}</span>
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

                {/* ---------- CỘT PHẢI ---------- */}
                <div className="right-column">
                  {playlist[currentIndex] && (
                    <div className="now-playing-section mb-4">
                      <h5 className="right-panel-title mb-3">Đang phát</h5>
                      <div className="now-playing-card">
                        <img 
                          src={playlist[currentIndex].image} 
                          alt="now-playing" 
                          className="np-large-img" 
                          onError={(e) => { e.target.onerror = null; e.target.src = currentInfo.img; }}
                        />
                        <div className="np-info d-flex justify-content-between align-items-center mt-3">
                          <div className="overflow-hidden pe-2">
                            <h6 className="np-title m-0 text-truncate">{playlist[currentIndex].title}</h6>
                            <p className="np-artist m-0 text-truncate">{playlist[currentIndex].artist}</p>
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
                          <span className="un-time flex-shrink-0"><FaHeadphones className="me-1"/> {song.listens ? song.listens.toLocaleString() : "0"}</span>
                        </div>
                      ))}
                      {currentIndex + 1 >= playlist.length && (
                        <p className="end-of-queue text-center mt-4">Hết bài hát để phát.</p>
                      )}
                    </div>
                  </div>

                </div>
              </div>

              {/* ================= THANH PHÁT NHẠC BOTTOM PLAYER ================= */}
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

                    <div className="audio-controls ms-auto ms-md-0 flex-shrink-0">
                      {/* 🌟 ĐÃ XÓA CLASS D-NONE: Luôn hiện Nút Back trên Mobile */}
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

                      {/* 🌟 ĐÃ XÓA CLASS D-NONE: Luôn hiện Nút Next trên Mobile */}
                      <button onClick={handleNext} className="ctrl-btn"><FaStepForward /></button>
                    </div>
                  </div>

                  <div className="player-center">
                    <div className="song-info text-center w-100 overflow-hidden">
                      <h5 className="song-name text-truncate w-100">{playlist[currentIndex].title}</h5>
                      <p className="song-artist text-truncate w-100">{playlist[currentIndex].artist}</p>
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

                    <div className="options-container position-relative" ref={menuRef}>
                      <button 
                        className={`ctrl-btn ${showMenu ? "active-menu" : ""}`} 
                        onClick={() => setShowMenu(!showMenu)}
                      >
                        <FaEllipsisV />
                      </button>

                      {showMenu && (
                        <div className="custom-options-popup">
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
                              {[0, 2, 30, 60, 180].map((mins) => (
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
                      )}
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