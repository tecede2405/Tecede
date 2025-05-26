import React from "react";
import Tabbar from '../../../component/tabar/index';
import songs from '../../../data/edmSongs';
import useMusicPlayer from "../../../hooks/useMusicPlayer";
import SearchBar from "../../../component/SearchBox/SearchBox";
import SongList from "../../../component/SongList/SongList";
import edm from '../../../img/music-thumnail/edm.png';

function NhacEdm() {
 const {
    currentIndex,
    audioRef,
    handleEnded,
    handlePlay,
    handlePrev,
    handleNext,
  } = useMusicPlayer(songs);

  return (
    <>
    <div className="music-container-box">
      <Tabbar />
      <div className="music-container">
        <div className="profile d-flex flex-wrap flex-column flex-md-row align-items-center gap-3" style={{
                background: "linear-gradient(135deg, #000428, #004e92)"
                }}>
                          <img src={edm} alt="" className="profile-image" />
                          <div className="profile-info text-center text-md-start">
                            <h4 className="profile-title">🎵 Nhạc EDM</h4>
                            <p className="profile-desc">Khi cảm xúc thăng hoa.</p>
                          </div>
                </div>
        <div className="container mt-4">

          {/* Thanh tìm kiếm */}
          <h6>Tìm nhạc ở đây nè...</h6>
          <SearchBar songs={songs} onSelectSong={handlePlay} />

          {/* Danh sách bài hát */}
          <SongList songs={songs} currentIndex={currentIndex} onPlay={handlePlay} />
        </div>

        {/* Audio player */}
        {currentIndex !== null && (
          <div className="audio-container">
            <div className="music-card d-flex align-items-center p-3">
              <img
                src={songs[currentIndex].image}
                alt={songs[currentIndex].title}
                className="img-audio"
                style={{ width: "40px", height: "40px", objectFit: "cover" }}
              />
              <button onClick={handlePrev} className="change-song">
                ⏮
              </button>
              <div className="card-music-body d-flex flex-column">
                <h5 className="card-render-title mb-1">{songs[currentIndex].title}</h5>
                <p className="card-render-text text-muted mb-2">{songs[currentIndex].artist}</p>
              </div>
              <button onClick={handleNext} className="change-song">
                ⏭
              </button>
            </div>

            <audio
              ref={audioRef}
              controls
              className="custom-audio"
              onEnded={handleEnded}
            >
              <source src={songs[currentIndex].file} type="audio/mpeg" />
              Trình duyệt của bạn không hỗ trợ phát nhạc.
            </audio>
          </div>
        )}
      </div>
    </div>
    </>
  );
}
export default NhacEdm;
