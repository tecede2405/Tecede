import React, { useState, useRef, useEffect } from "react";
import Tabbar from '../../../component/tabar/index';
import songs from '../../../data/usukSongs';


function Nhacusuk() {


  const [currentIndex, setCurrentIndex] = useState(null);
  const audioRef = useRef(null);

  useEffect(() => {
    if (currentIndex !== null && audioRef.current) {
      audioRef.current.load();
      audioRef.current.play().catch((err) => {
        console.log("Không thể phát tự động:", err);
      });
    }
  }, [currentIndex]);
  
  const handleEnded = () => {
    const nextIndex = currentIndex + 1;
    if (nextIndex < songs.length) {
      setCurrentIndex(nextIndex);
    } else {
      setCurrentIndex(null); // Dừng khi hết danh sách
    }
  };

  const handlePlay = (index) => {
    setCurrentIndex(index);
  };

    const handlePrev = () => {
      if (songs.length === 0) return;
      setCurrentIndex((prev) => (prev - 1 + songs.length) % songs.length);
  };

  const handleNext = () => {
      if (songs.length === 0) return;
      setCurrentIndex((prev) => (prev + 1) % songs.length);
  };

  return (
    <>
    <div className="music-container-box"> 
      <Tabbar />
      <div className="music-container">
        {/* music card  */}
        <div className="container mt-4">
              <h2 className="title-box-music text-center">🎵 Nhạc Âu Mĩ</h2>
              <p className="text-center">Những bài này mình tự chọn lọc theo sở thích.</p>
              <div className="row">
                {songs.map((song, index) => (
                  <div className="col-md-5 mb-4" key={index}>
                    <div key={index} className={`music-card d-flex align-items-center p-3 song-item ${currentIndex === index ? "active" : ""}`} onClick={() => handlePlay(index)}>
                      <img src={song.image} className="rounded mr-3" alt={song.title} style={{ width: '50px', height: '50px', objectFit: 'cover' }} />
                      <div className="card-music-body d-flex flex-column">
                        <h5 className="card-title mb-1">{song.title}</h5>
                        <p className="card-text text-muted mb-2">{song.artist}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
          </div>
          {/* music render */}
          {currentIndex !== null && (
                  <div className="audio-container">
                      <div className="music-card d-flex align-items-center p-3">
                          <img
                              src={songs[currentIndex].image}
                              alt={songs[currentIndex].title}
                              className="img-audio"
                              style={{ width: '40px', height: '40px', objectFit: 'cover' }}
                          />
                          <button onClick={handlePrev} className="change-song">⏮</button>
                          <div className="card-music-body d-flex flex-column">
                              <h5 className="card-render-title mb-1">{songs[currentIndex].title}</h5>
                              <p className="card-render-text text-muted mb-2">{songs[currentIndex].artist}</p>
                          </div>
                          <button onClick={handleNext} className="change-song">⏭</button>
                      </div>

                      <audio
                          ref={audioRef}
                          controls
                          className="custom-audio"
                          onEnded={handleEnded}  // Gọi khi bài hát kết thúc
                      >
                          <source src={songs[currentIndex].file} type="audio/mpeg" />
                          Trình duyệt của bạn không hỗ trợ phát nhạc.
                      </audio>
                  </div>
              )}
      </div>
    </div>
  </>
 )
}
export default Nhacusuk;
