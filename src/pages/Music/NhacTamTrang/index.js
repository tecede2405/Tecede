import React, { useState, useRef, useEffect } from "react";
import Tabbar from '../../../component/tabar/index';
import music1 from '../../../audio/NhacTamTrang/Date 2.mp3';
import music2 from '../../../audio/NhacTamTrang/This Love Instrumental (이 사랑 Instrumental).mp3';
import music3 from '../../../audio/NhacTamTrang/Because I Miss You.mp3';
import music4 from '../../../audio/NhacTamTrang/Nop.mp3';
import music5 from '../../../audio/NhacTamTrang/180 Degree.mp3';
import music6 from '../../../audio/NhacTamTrang/Fall rain - July.mp3';
import music7 from '../../../audio/NhacTamTrang/Xuân kiều và chí minh.mp3';
import music8 from '../../../audio/NhacTamTrang/the SUNset.mp3';
import music9 from '../../../audio/NhacTamTrang/Seredris - Daylight日光Slowed by xxxCr3 - DouYin 抖音bgm 2022.mp3';
import music10 from '../../../audio/NhacTamTrang/Epic Music VN - LAST REUNION (Peter Roe).mp3';
import music11 from '../../../audio/NhacTamTrang/Call of SilenceClear Sky Remix 伴奏(Nhạc đệm)  Clear Sky.mp3';
import music12 from '../../../audio/NhacTamTrang/因为不能见所以很想念 (Beat宿命版).mp3';






function NhacMood() {
  const songs = [
    {
      title: 'Date 2',
      artist: 'Anime Your Name',
      image: 'https://tse1.mm.bing.net/th?id=OIP.59vLJC5R4F6-FGNpqAuQGAHaE4&pid=Api&P=0&h=180',
      file: music1,
    },
    {
      title: 'This Love',
      artist: 'Davichi',
      image: 'https://tse2.mm.bing.net/th?id=OIP.Z5gaIx5StFwlGF6YZ2f9xgHaHa&pid=Api&P=0&h=180',
      file: music2,
    },
    {
      title: 'Because i miss you',
      artist: 'Ariana Grande',
      image: 'https://tse3.mm.bing.net/th?id=OIP.PVFxFdB4l1s6y_D1_66xMgHaHa&pid=Api&P=0&h=180',
      file: music3,
    },
    {
      title: 'Nop',
      artist: 'ChenYueLong',
      image: 'https://tse2.mm.bing.net/th?id=OIP.xijxrqqDfahyBoz__mFR8gHaEK&pid=Api&P=0&h=180',
      file: music4,
    },
    {
      title: '180도 (180 Degrees)',
      artist: '벤 (Ben)',
      image: 'https://tse1.mm.bing.net/th?id=OIP.jP6cxTLmeDtdCnDemSDYhwHaEK&pid=Api&P=0&h=180',
      file: music5,
    },
    {
      title: 'Fall Rain',
      artist: 'July',
      image: 'https://tse1.mm.bing.net/th?id=OIP._rBfuIgpN34tItEGCFIJrgHaEo&pid=Api&P=0&h=180',
      file: music6,
    },
    {
      title: 'Xuân kiều và chí minh',
      artist: 'Nhai Đạo Biện, Âu Dương Diệu Oánh',
      image: 'https://tse1.mm.bing.net/th?id=OIP.1fH6vbZ3Nr-rJuoqL0G_lwHaEK&pid=Api&P=0&h=180',
      file: music7,
    },
    {
      title: 'the SUNset( nếu dự báo lúc đó mưa )',
      artist: '2pillz',
      image: 'https://tse4.mm.bing.net/th?id=OIP.iaY1KKMT9HI7Pe2Lo0lYXwHaEK&pid=Api&P=0&h=180',
      file: music8,
    },
    {
      title: 'Daylight 日光',
      artist: 'Seredris',
      image: 'https://tse1.mm.bing.net/th?id=OIP.SWWqZDBuFMcKBhiNQOsf4gHaEK&pid=Api&P=0&h=180',
      file: music9,
    },
    {
      title: 'Last reunion',
      artist: 'Peter Roe',
      image: 'https://tse1.mm.bing.net/th?id=OIP.dkesrdjFk-vE9MYZAqLs7AAAAA&pid=Api&P=0&h=180',
      file: music10,
    },
    {
      title: 'Call of silence',
      artist: 'Anime AOT',
      image: 'https://tse4.mm.bing.net/th?id=OIP.UqWDJqrPQKN0kDVueEXpGQHaEK&pid=Api&P=0&h=180',
      file: music11,
    },
    {
      title: '因为不能见所以很想念 ',
      artist: ' zy',
      image: 'https://tse3.mm.bing.net/th?id=OIP.GwC0CKBUb2y1XQ5d1tn79AHaHa&pid=Api&P=0&h=180',
      file: music12,
    },

    // Thêm bài hát vào đây
  ];


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
            <h2 className="title-box-music text-center">🎵 Nhạc Không Lời</h2>
            <p className="text-center">Hãy nghe hết bài nếu bạn muốn biết thật sự nó hay ở đâu. </p>

              <div className="row">
                {songs.map((song, index) => (
                  <div className="col-md-5 mb-4" key={index}>
                    <div key={index} className={`music-card d-flex align-items-center p-3 song-item ${currentIndex === index ? "active" : ""}`} onClick={() => handlePlay(index)}>
                      <img src={song.image} className="rounded mr-3" alt={song.title} style={{ width: '50px', height: '50px', objectFit: 'cover' }} />
                      <div className="card-body d-flex flex-column">
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
                          <div className="card-body d-flex flex-column">
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
export default NhacMood;
