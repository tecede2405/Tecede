import { useState, useEffect } from "react";
import Tabbar from "../../../component/tabar/index";
import useMusicPlayer from "../../../hooks/useMusicPlayer";
import useAudioManager from "../../../hooks/useAudioManager";
import SearchBar from "../../../component/SearchBox/SearchBox";
import SongList from "../../../component/SongList/SongList";
import { FaStepBackward, FaStepForward } from "react-icons/fa";
import Loading from "../../../component/Loading";

function NhacMood() {
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
    fetch(`${process.env.REACT_APP_API_URL}/api/songs/category/nhackhongloi`)
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
                <img src="https://p16-sg.tiktokcdn.com/obj/tos-alisg-avt-0068/85ea2a41bcba853ca1656f17b54d6a71" alt="nhạc tâm trạng" className="profile-image" />
                <div className="profile-info text-center text-md-start">
                  <h4 className="profile-title">Nhạc Mood 🎵</h4>
                  <p className="profile-desc">
                    Nghe hết bài để cảm nhận.
                  </p>
                  <button onClick={handleShufflePlaylist} className="shuffle">
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
                      style={{ width: "40px", height: "40px", objectFit: "cover" }}
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
                    key={currentIndex}
                    ref={audioRef}
                    src={playlist[currentIndex]?.file}
                    controls
                    playsInline
                    autoPlay
                    preload="metadata"
                    controlsList="nodownload"
                    className="custom-audio"
                    onEnded={handleEnded}
                  />
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default NhacMood;
