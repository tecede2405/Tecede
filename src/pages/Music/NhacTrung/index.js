import React from "react";
import Tabbar from '../../../component/tabar/index';
import songs from '../../../data/chinaSongs';
import useMusicPlayer from "../../../hooks/useMusicPlayer";
import SearchBar from "../../../component/SearchBox/SearchBox";
import SongList from "../../../component/SongList/SongList";
import china from '../../../img/music-thumnail/china.png';
import { FaStepBackward, FaStepForward } from "react-icons/fa";
import { useEffect } from "react";


function NhacTrung() {
  
 const {
    playlist,     
    currentIndex,
    audioRef,
    handleEnded,
    handlePlay,
    handlePrev,
    handleNext,
    handleShufflePlaylist, 
  } = useMusicPlayer(songs);

  useEffect(() => {
  if (
    currentIndex !== null &&
    playlist &&
    playlist.length > currentIndex &&
    'mediaSession' in navigator
  ) {
    const song = playlist[currentIndex];

    navigator.mediaSession.metadata = new window.MediaMetadata({
      title: song.title,
      artist: song.artist,
      album: "EDM Playlist",
      artwork: [
        {
          src: song.image,
          sizes: "512x512",
          type: "image/jpeg",
        }
      ]
    });

    navigator.mediaSession.setActionHandler("play", () => {
      audioRef.current.play();
    });

    navigator.mediaSession.setActionHandler("pause", () => {
      audioRef.current.pause();
    });

    navigator.mediaSession.setActionHandler("previoustrack", handlePrev);
    navigator.mediaSession.setActionHandler("nexttrack", handleNext);
  }
}, [currentIndex, playlist, audioRef, handlePrev, handleNext]);


  return (
    <>
    <div className="music-container-box">
      <Tabbar />
      <div className="music-container">
        <div className="profile d-flex flex-wrap flex-column flex-md-row align-items-center gap-3">
                  <img src={china} alt="" className="profile-image" />
                  <div className="profile-info text-center text-md-start">
                    <h4 className="profile-title">Nhạc Trung Quốc 🎵</h4>
                    <p className="profile-desc">Nghe bao hay bao suy.</p>
                    <button
                      onClick={handleShufflePlaylist}
                      className="shuffle"
                    >
                      Phát Ngẫu Nhiên
                    </button>
                  </div>
                </div>
        <div className="container mt-4">
          <h6 className="search-song">Tìm nhạc ở đây nè... 🔍</h6>
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
      </div>
    </div>
    </>
  );
}

export default NhacTrung;
