import { useState, useEffect } from "react";
import React from "react";
import Tabbar from '../../../component/tabar/index';
import useMusicPlayer from "../../../hooks/useMusicPlayer";
import SearchBar from "../../../component/SearchBox/SearchBox";
import SongList from "../../../component/SongList/SongList";
import { FaStepBackward, FaStepForward, FaPlay, FaPause, FaRandom, FaVolumeUp, FaEllipsisV } from "react-icons/fa";
import useAudioManager from "../../../hooks/useAudioManager";
import Loading from "../../../component/Loading";

function Nhacusuk() {
  const {
    playlist,
    currentIndex,
    audioRef,
    handleEnded,
    handlePlay,
    handlePrev,
    handleNext,
    handleShufflePlaylist,
    updatePlaylist,
  } = useMusicPlayer([]);

  const [loading, setLoading] = useState(true);

  // Các state phục vụ cho thanh tiến trình (Timeline) Custom
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(1); // 1 = 100%

  // Hàm xử lý Mute
  const toggleMute = () => {
    if (!audioRef.current) return;
    const newMute = !isMuted;
    audioRef.current.muted = newMute;
    setIsMuted(newMute);
  };

  // Hàm xử lý thay đổi âm lượng
  const handleVolumeChange = (e) => {
    const newVol = Number(e.target.value);
    audioRef.current.volume = newVol;
    setVolume(newVol);
    setIsMuted(newVol === 0);
  };

  useEffect(() => {
    setLoading(true);
    fetch(`${process.env.REACT_APP_API_URL}/api/songs/category/nhacusuk`)
      .then((res) => res.json())
      .then((data) => {
        updatePlaylist(data);
        setTimeout(() => {
          setLoading(false);
        }, 3000);
      })
      .catch(() => {
        setTimeout(() => setLoading(false), 3000);
      });
  }, [updatePlaylist]);

  // 📦 Nơi duy nhất xử lý Audio và MediaSession ổn định, không lo giật lag
  useAudioManager({ currentIndex, playlist, audioRef, handleNext, handlePrev });

  // 🗑️ ĐÃ XÓA: Đoạn useEffect chứa Media Session API trùng lặp ở đây để hết giật giật!

  // ---- HÀM XỬ LÝ THANH TIMELINE ----
  const togglePlay = () => {
    if (!audioRef.current) return;
    if (audioRef.current.paused) {
      audioRef.current.play().catch(() => {});
    } else {
      audioRef.current.pause();
    }
  };

  const handleTimeUpdate = () => {
    setCurrentTime(audioRef.current.currentTime);
  };

  const handleLoadedData = () => {
    setDuration(audioRef.current.duration);
  };

  const handleSeek = (e) => {
    const newTime = Number(e.target.value);
    audioRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const formatTime = (time) => {
    if (!time || isNaN(time)) return "0:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  };

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
            <div className="music-scroll-area">
              <div className="profile d-flex flex-wrap flex-md-row align-items-center gap-3">
                <img src="https://p16-sg.tiktokcdn.com/obj/tos-alisg-avt-0068/1a5d4aca0654d716f9ec965dbafc8bf2" alt="nhạc âu mỹ" className="profile-image" />
                <div className="profile-info text-center text-md-start">
                  <h4 className="profile-title">Nhạc Âu Mỹ 🎵</h4>
                  <p className="profile-desc">
                    Những bài hát âu mỹ hay nhất.
                  </p>
                  <button onClick={handleShufflePlaylist} className="shuffle-btn">
                    <FaRandom className="me-2" /> Phát Ngẫu Nhiên
                  </button>
                </div>
              </div>

              <div className="container mt-4">
                <SearchBar songs={playlist} onSelectSong={handlePlay} />
                <div className="mt-3">
                  <SongList
                    songs={playlist || []}
                    currentIndex={currentIndex}
                    onPlay={handlePlay}
                  />
                </div>
              </div>

              {/* THANH PHÁT NHẠC (BOTTOM PLAYER) GIỐNG ẢNH CHUẨN */}
              {playlist[currentIndex] && (
                <div className="custom-bottom-player">
                  <div className="player-left">
                    <img
                      src={playlist[currentIndex].image}
                      alt={playlist[currentIndex].title}
                      className={`player-thumb ${isPlaying ? "spinning" : ""}`}
                    />
                    <button onClick={handlePrev} className="ctrl-btn"><FaStepBackward /></button>
                    <button onClick={togglePlay} className="ctrl-btn play-pause-btn">
                      {isPlaying ? <FaPause /> : <FaPlay />}
                    </button>
                    <button onClick={handleNext} className="ctrl-btn"><FaStepForward /></button>
                  </div>

                  <div className="player-center">
                    <div className="song-info text-center">
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
                      />
                    </div>
                    <button className="ctrl-btn"><FaEllipsisV /></button>
                  </div>

                  {/* THẺ AUDIO ẨN NẰM NGẦM BÊN DƯỚI */}
                  <audio
                    ref={audioRef}
                    playsInline
                    preload="auto"
                    onTimeUpdate={handleTimeUpdate}
                    onLoadedData={handleLoadedData}
                    onPlay={() => setIsPlaying(true)}
                    onPause={() => setIsPlaying(false)}
                    onEnded={handleEnded}
                    className="d-none" 
                  />
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Nhacusuk;