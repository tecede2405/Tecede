import { useState, useEffect } from "react";
import React from "react";
import "./nhactre.scss";
import Tabbar from "../../../component/tabar/index";
import useMusicPlayer from "../../../hooks/useMusicPlayer";
import SearchBar from "../../../component/SearchBox/SearchBox";
import SongList from "../../../component/SongList/SongList";
import { FaStepBackward, FaStepForward } from "react-icons/fa";
import useAudioManager from "../../../hooks/useAudioManager";
import Loading from "../../../component/Loading";
import "../../../component/HomeMusic/homemusic.scss";
function NhacTre() {
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

  useEffect(() => {
    setLoading(true);
    fetch(`${process.env.REACT_APP_API_URL}/api/songs/category/nhactre`)
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

  useAudioManager({ currentIndex, playlist, audioRef, handleNext, handlePrev });

  return (
    <div className="music-container-box">
      <Tabbar />
      <div className="music-container d-flex">
        <div className="main-content-area flex-grow-1 position-relative">
          {loading ? (
            <div className="music-loading-wrapper">
              <Loading />
            </div>
          ) : (
            <>
              <div className="profile d-flex flex-wrap flex-md-row align-items-center gap-3">
                <img src="https://res.cloudinary.com/djzeqinsn/image/upload/v1768119883/vpop_ks3q1j.png" alt="nhạc trẻ" className="profile-image" />
                <div className="profile-info text-center text-md-start">
                  <h4 className="profile-title">Nhạc Trẻ Việt Nam 🎵</h4>
                  <p className="profile-desc">
                    Nhạc Việt thì còn chê vào đâu được.
                  </p>
                  <button
                    onClick={handleShufflePlaylist}
                    className="shuffle"
                  >
                    Phát Ngẫu Nhiên
                  </button>
                </div>
              </div>

              <div className="container mt-4">
                <SearchBar songs={playlist} onSelectSong={handlePlay} />
                <SongList
                  songs={playlist || []}
                  currentIndex={currentIndex}
                  onPlay={handlePlay}
                />
              </div>

              {playlist[currentIndex] && (
                <div className="audio-container">
                  <div className="music-card d-flex align-items-center p-3">
                    <img
                      src={playlist[currentIndex].image}
                      alt={playlist[currentIndex].title}
                      className="img-audio"
                      style={{
                        width: "40px",
                        height: "40px",
                        objectFit: "cover",
                      }}
                    />
                    <button onClick={handlePrev} className="change-song">
                      <FaStepBackward />
                    </button>
                    <div className="card-music-body d-flex flex-column">
                      <h5 className="card-render-title mb-1">
                        {playlist[currentIndex].title}
                      </h5>
                      <p className="card-render-text mb-2">
                        {playlist[currentIndex].artist}
                      </p>
                    </div>
                    <button onClick={handleNext} className="change-song">
                      <FaStepForward />
                    </button>
                  </div>

                  <audio
                    ref={audioRef}
                    controls
                    preload="none"
                    controlsList="nodownload"
                    className="custom-audio"
                    onEnded={handleEnded}
                  >
                    <source
                      src={playlist[currentIndex].file}
                      type="audio/mpeg"
                    />
                    Trình duyệt của bạn không hỗ trợ phát nhạc.
                  </audio>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default NhacTre;
