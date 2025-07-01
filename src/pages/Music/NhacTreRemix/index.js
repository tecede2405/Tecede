import { useState, useEffect } from "react";
import Tabbar from '../../../component/tabar/index';
import useMusicPlayer from "../../../hooks/useMusicPlayer";
import SearchBar from "../../../component/SearchBox/SearchBox";
import SongList from "../../../component/SongList/SongList";
import nhactreremix from '../../../img/music-thumnail/nhactreremix.png';
import { FaStepBackward, FaStepForward } from "react-icons/fa";
import useAudioManager from "../../../hooks/useAudioManager";
import Loading from "../../../component/Loading";

function NhacTreRemix() {
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
    fetch(`${process.env.REACT_APP_API_URL}/api/songs/category/nhactreremix`)
      .then(res => res.json())
      .then(data => {
        updatePlaylist(data);
        setTimeout(() => setLoading(false), 3000); // đảm bảo ít nhất 3 giây
      })
      .catch(() => {
        setTimeout(() => setLoading(false), 3000); // kể cả khi lỗi
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
              <div className="profile d-flex flex-wrap flex-column flex-md-row align-items-center gap-3">
                <img src={nhactreremix} alt="" className="profile-image" />
                <div className="profile-info text-center text-md-start">
                  <h4 className="profile-title">Nhạc Remix 🎵</h4>
                  <p className="profile-desc">Nhạc bay như tiên cảnh.</p>
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
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default NhacTreRemix;
