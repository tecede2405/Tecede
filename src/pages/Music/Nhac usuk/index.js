import React from "react";
import Tabbar from '../../../component/tabar/index';
import songs from '../../../data/usukSongs';
import useMusicPlayer from "../../../hooks/useMusicPlayer";
import SearchBar from "../../../component/SearchBox/SearchBox";
import SongList from "../../../component/SongList/SongList";
import usuk from '../../../img/music-thumnail/usuk.png';

function Nhacusuk() {
  const {
    playlist,      // <-- dùng playlist (đã có thể bị xáo trộn)
    currentIndex,
    audioRef,
    handleEnded,
    handlePlay,
    handlePrev,
    handleNext,
    handleShufflePlaylist, // Nút xáo trộn
  } = useMusicPlayer(songs);

  return (
    <>
      <div className="music-container-box">
        <Tabbar />
        <div className="music-container">
          <div
            className="profile d-flex flex-wrap flex-column flex-md-row align-items-center gap-3"
            style={{
              background: "linear-gradient(135deg, #232526, #414345)",
            }}
          >
            <img src={usuk} alt="" className="profile-image" />
            <div className="profile-info text-center text-md-start">
              <h4 className="profile-title">Nhạc Âu Mỹ 🎵</h4>
              <p className="profile-desc">
                Những bài này mình tự chọn lọc theo sở thích.
              </p>
              {/* Nút xáo trộn danh sách nhạc */}
            <button
              onClick={handleShufflePlaylist}
              className="shuffle"
            >
              🔀 Phát Ngẫu Nhiên
            </button>
            </div>
          </div>

          <div className="container mt-4">
            <h6>Tìm nhạc ở đây nè...</h6>
            <SearchBar songs={playlist} onSelectSong={handlePlay} />

            <SongList songs={playlist || []} currentIndex={currentIndex} onPlay={handlePlay} />

          </div>

          {currentIndex !== null && (
            <div className="audio-container">
              <div className="music-card d-flex align-items-center p-3">
                <img
                  src={playlist[currentIndex].image}
                  alt={playlist[currentIndex].title}
                  className="img-audio"
                  style={{ width: "40px", height: "40px", objectFit: "cover" }}
                />
                <button onClick={handlePrev} className="change-song">
                  ⏮
                </button>
                <div className="card-music-body d-flex flex-column">
                  <h5 className="card-render-title mb-1">
                    {playlist[currentIndex].title}
                  </h5>
                  <p className="card-render-text text-muted mb-2">
                    {playlist[currentIndex].artist}
                  </p>
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
                <source src={playlist[currentIndex].file} type="audio/mpeg" />
                Trình duyệt của bạn không hỗ trợ phát nhạc.
              </audio>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default Nhacusuk;
