import { useState, useEffect } from "react";
import React from "react";
import { useParams } from "react-router-dom"; // Lấy đuôi URL
import Tabbar from '../../../component/tabar/index';
import useMusicPlayer from "../../../hooks/useMusicPlayer";
import SearchBar from "../../../component/SearchBox/SearchBox";
import SongList from "../../../component/SongList/SongList";
// Nhập thêm các icon cần thiết cho giao diện Bottom Player mới
import { FaStepBackward, FaStepForward, FaPlay, FaPause, FaRandom, FaVolumeUp, FaEllipsisV } from "react-icons/fa";
import useAudioManager from "../../../hooks/useAudioManager";
import Loading from "../../../component/Loading";
import "./style.scss";

// CẤU HÌNH GIAO DIỆN THEO URL
const CATEGORY_CONFIG = {
  "mood": { dbType: "nhackhongloi", title: "Nhạc Tâm Trạng 🎵", desc: "Chữa lành tâm hồn", img: "https://i.ibb.co/tpQF1yq5/85ea2a41bcba853ca1656f17b54d6a71.webp" },
  "nhac-douyin": { dbType: "nhacdouyin", title: "Nhạc Douyin 🎵", desc: "Trend TikTok Trung Quốc", img: "https://i.ibb.co/XZBqqxPT/bb95fae35b14b87ed5d6d2d15791e3f2.webp" },
  "nhac-tre": { dbType: "nhactre", title: "Nhạc Trẻ 🎧", desc: "Top Hits V-Pop", img: "https://i.ibb.co/KcWRC4Xr/f8067e4d176cf42261c0b2789a1a1035.webp" },
  "usuk": { dbType: "nhacusuk", title: "Nhạc US-UK 🗽", desc: "Bảng xếp hạng Billboard", img: "https://i.ibb.co/V0Cc13KY/1a5d4aca0654d716f9ec965dbafc8bf2.webp" },
  "trung-quoc": { dbType: "nhactrungquoc", title: "Nhạc Trung Quốc 🎵", desc: "Nhạc Hoa Ngữ hay nhất", img: "https://i.ibb.co/20Jr4KNf/9cb9409ff6db5a3e70ca628f2be2b3ee.webp" },
  "nhactre-remix": { dbType: "nhactreremix", title: "Nhạc Trẻ Remix 🎵", desc: "Quẩy tung nóc nhà", img: "https://i.ibb.co/nNXDCBDW/z6742344336920-1eae53132a29744632a92d96486d4a9c.webp" },
  "edm": { dbType: "nhacedm", title: "Nhạc EDM ⚡", desc: "Electronic Dance Music", img: "https://i.ibb.co/F4z8B0ST/6659861e5f2cb99d7a210d2b258ec8f5.webp" },
  "phonk": { dbType: "nhacphonk", title: "Nhạc Phonk 🎵", desc: "Nhạc cháy như FreeFire.", img: "https://i.ibb.co/YBKJGt8X/z6731791091720-ce92821376e7f43bbbf76879ac9f07e3.webp" },
  "nhac-lofi": { dbType: "nhac-lofi", title: "Nhạc Lofi 🎵", desc: "Chill and Study", img: "https://i.ibb.co/rjFJn7H/z7604161484626-99ee66797819706db71be74a68b02785.webp" },
};

function MusicCategory() {
  const { categorySlug } = useParams(); 
  
  const currentInfo = CATEGORY_CONFIG[categorySlug] || {
    dbType: categorySlug,
    title: "Danh sách phát 🎵",
    desc: "Cùng thưởng thức âm nhạc",
    img: "https://i.ibb.co/YBKJGt8X/z6731791091720-ce92821376e7f43bbbf76879ac9f07e3.webp"
  };

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

  // Các state phục vụ cho thanh tiến trình (Timeline) Custom độc lập với trình duyệt
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

  // VŨ KHÍ BÍ MẬT: HÀM KÍCH BASS (WEB AUDIO API)
  const enableBassBoost = () => {
    const audioEl = audioRef.current;
    
    // Nếu chưa có thẻ audio hoặc đã gắn Bass rồi thì bỏ qua để tránh lỗi đè luồng
    if (!audioEl || audioEl.bassBoosted) return;

    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      const audioCtx = new AudioContext();
      
      // Lấy luồng âm thanh từ thẻ <audio>
      const source = audioCtx.createMediaElementSource(audioEl);
      
      // Tạo bộ lọc Bass (Lowshelf)
      const bassFilter = audioCtx.createBiquadFilter();
      bassFilter.type = "lowshelf";
      bassFilter.frequency.value = 150; // Tập trung kích các âm trầm dưới 150Hz
      bassFilter.gain.value = 6; // Tăng lên 6-12 dB (Đủ đập mạnh mà không bị rè)

      // Nối dây: Nguồn Audio -> Bộ lọc Bass -> Loa đầu ra
      source.connect(bassFilter);
      bassFilter.connect(audioCtx.destination);
      
      // Đánh dấu là đã gắn Bass để lần sau không chạy lại hàm này nữa
      audioEl.bassBoosted = true;
    } catch (error) {
      console.warn("Không thể khởi tạo Web Audio API:", error);
    }
  };

  //  GIỮ MÀN HÌNH LUÔN SÁNG NGAY KHI VÀO TRANG (KHÔNG PHỤ THUỘC TRẠNG THÁI PLAY)
  useEffect(() => {
    let wakeLock = null;

    const requestWakeLock = async () => {
      try {
        if ("wakeLock" in navigator) {
          wakeLock = await navigator.wakeLock.request("screen");
          console.log("💡 Wake Lock đã kích hoạt: Màn hình luôn sáng!");
        }
      } catch (err) {
        console.warn(`⚠️ Wake Lock không thành công: ${err.message}`);
      }
    };

    // Khi component mount, xin quyền giữ sáng màn hình
    requestWakeLock();

    // Lắng nghe sự kiện để xin lại quyền nếu người dùng chuyển tab rồi quay lại
    const handleVisibilityChange = () => {
      if (wakeLock !== null && document.visibilityState === 'visible') {
        requestWakeLock();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      if (wakeLock !== null) {
        wakeLock.release();
        wakeLock = null;
      }
    };
  }, []); // Chỉ chạy 1 lần duy nhất khi vào trang

  useEffect(() => {
    setLoading(true);
    const baseUrl = process.env.REACT_APP_API_URL || "http://localhost:5000";
    
    // Gọi API động theo dbType lấy từ Từ điển
    fetch(`${baseUrl}/api/songs/category/${currentInfo.dbType}`)
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
  }, [categorySlug, currentInfo.dbType, updatePlaylist]);

  useAudioManager({ currentIndex, playlist, audioRef, handleNext, handlePrev });

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
              {/* HEADER PROFILE GIỐNG ẢNH MẪU */}
              <div className="profile d-flex flex-wrap flex-md-row align-items-center gap-3">
                <img src={currentInfo.img} alt={currentInfo.title} className="profile-image" />
                <div className="profile-info text-center text-md-start">
                  <h4 className="profile-title">{currentInfo.title}</h4>
                  <p className="profile-desc">{currentInfo.desc}</p>
                  <button onClick={handleShufflePlaylist} className="shuffle-btn">
                    <FaRandom className="me-2" /> Phát Ngẫu Nhiên
                  </button>
                </div>
              </div>

              {/* KHU VỰC DANH SÁCH BÀI HÁT CHIA LƯỚI GRID */}
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

              {/* THANH PHÁT NHẠC CUSTOM ĐẸP BO GÓC Ở DƯỚI CÙNG MÀN HÌNH */}
              {playlist[currentIndex] && (
                <div className="custom-bottom-player">
                  <div className="player-left">
                    <img
                      src={playlist[currentIndex].image}
                      alt={playlist[currentIndex].title}
                      className={`player-thumb ${isPlaying ? "spinning" : ""}`}
                    />
                    <div className="audio-controls">
                      <button onClick={handlePrev} className="ctrl-btn"><FaStepBackward /></button>
                      <button onClick={togglePlay} className="ctrl-btn play-pause-btn">
                        {isPlaying ? <FaPause /> : <FaPlay />}
                      </button>
                      <button onClick={handleNext} className="ctrl-btn"><FaStepForward /></button>
                    </div>
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

                  {/* THẺ AUDIO ẨN NẰM NGẦM BÊN DƯỚI ĐỂ HOOK TỰ ĐIỀU KHIỂN CHẠY NỀN */}
                  <audio
                    ref={audioRef}
                    crossOrigin="anonymous" /* BẮT BUỘC CÓ DÒNG NÀY ĐỂ KÍCH BASS KHÔNG BỊ LỖI BẢO MẬT CORS */
                    playsInline
                    preload="auto"
                    onTimeUpdate={handleTimeUpdate}
                    onLoadedData={handleLoadedData}
                    onPlay={() => {
                      setIsPlaying(true);
                      enableBassBoost(); // GỌI KÍCH BASS NGAY KHI BẮT ĐẦU HÁT
                    }}
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

export default MusicCategory;