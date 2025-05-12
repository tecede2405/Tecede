
import React, { useState, useRef, useEffect } from "react";
import Tabbar from '../../../component/tabar/index';
import music1 from '../../../audio/NhacTrung/VietsubLà Anh - Mộng Nhiên 是你 - 梦然.mp3';
import music2 from '../../../audio/NhacTrung/[Vietsub  Kara] Người Kế Nhiệm - Nhậm Nhiên  后继者 - 任然.mp3';
import music3 from '../../../audio/NhacTrung/Vietsub  Lyrics  Pinyin  Kiêu ngạo (嚣张) - en.mp3';
import music4 from '../../../audio/NhacTrung/[VietsubPinyin] Đảo không người (無人之島) - Nhậm Nhiên 任然.mp3';
import music5 from '../../../audio/NhacTrung/[Vietsub] Tháp Rơi Tự Do - LBI Lợi Bỉ  跳楼机 - LBI利比.mp3';
import music6 from '../../../audio/NhacTrung/[Vietsub] [Chinese Songs] Mang Chủng - Âm Khuyết Thi Thính  芒種 - 音闕詩聽.mp3';
import music7 from '../../../audio/NhacTrung/[Vietsub] Thiếu niên (少年) - Mộng Nhiên.mp3';
import music8 from '../../../audio/NhacTrung/你的答案 - 阿冗  Đáp án của bạn - A Nhũng  li ming de na dao guang hui.mp3';
import music9 from '../../../audio/NhacTrung/[VietsubPinyin] Đâu đâu cũng là em  YoungCaptain  哪里都是你 - YoungCaptain.mp3';
import music10 from '../../../audio/NhacTrung/[Vietsub  pinyin] Không biết phải làm sao 不知所措 - Vương Tĩnh Văn Không Mập 王靖雯不胖  TikTok.mp3';
import music11 from '../../../audio/NhacTrung/[Vietsub] Đông Miên - 2023 - A Nguyệt Nguyệt, Lưu Triệu Vũ  冬眠 - 2023 - 阿YueYue, 刘兆宇.mp3';
import music12 from '../../../audio/NhacTrung/[Vietsub  Pinyin] Sa Vào Nguy Hiểm - Cát Đông Kỳ  葛东琪 - 悬溺.mp3';
import music13 from '../../../audio/NhacTrung/[Vietsub] Có Thể Hay Không可不可以 - Trương Tử Hào張紫豪.mp3';
import music14 from '../../../audio/NhacTrung/[Vietsub  Kara] Một triệu khả năng  一百万个可能 ( Tik Tok ).mp3';
import music15 from '../../../audio/NhacTrung/[Vietsub] Gặp em đúng lúc - Luân Tang.mp3';


function NhacTrung() {
  const songs = [
    {
      title: 'Gặp em đúng lúc',
      artist: 'Luân Tang',
      image: 'https://tse4.mm.bing.net/th?id=OIP.4hwkujaoPQpJljpiAiR-_wHaEK&pid=Api&P=0&h=180',
      file: music15,
    },
    {
      title: 'Một triệu khả năng',
      artist: '一百万个可能 ',
      image: 'https://i.ytimg.com/vi/AL4CSiYoMqA/hqdefault.jpg',
      file: music14,
    },
    {
      title: 'Có Thể Hay Không',
      artist: 'Trương Tử Hào/張紫豪',
      image: 'https://tse2.mm.bing.net/th?id=OIP.8HvlO9bVfbZm-R1-eGOuCAHaEK&pid=Api&P=0&h=180',
      file: music13,
    },
    {
      title: 'Sa Vào Nguy Hiểm',
      artist: 'Cát Đông Kỳ',
      image: 'https://tse1.mm.bing.net/th?id=OIP.CGYW0x8ufamZsRstbtAc6gAAAA&pid=Api&P=0&h=180',
      file: music12,
    },
    {
      title: 'Đông Miên',
      artist: 'A Nguyệt Nguyệt, Lưu Triệu Vũ  冬眠',
      image: 'https://tse2.mm.bing.net/th?id=OIP.YDSEPLEDaHGkPo91W1V8OQHaEK&pid=Api&P=0&h=180',
      file: music11,
    },
    {
      title: 'Là Anh',
      artist: 'Mộng Nhiên |「是你 - 梦然」',
      image: 'https://tse2.mm.bing.net/th?id=OIP.LKcvKutiRwQ_yYvycGcmUgHaHa&pid=Api&P=0&h=180',
      file: music1,
    },
    {
      title: 'Người kế nhiệm',
      artist: ' Nhậm Nhiên | 后继者 - 任然',
      image: 'https://tse4.mm.bing.net/th?id=OIP.lRYlA8TBnASRc2-_aYCVEgHaEK&pid=Api&P=0&h=180',
      file: music2,
    },
    {
      title: 'Kiêu ngạo',
      artist: 'en',
      image: 'https://tse4.mm.bing.net/th?id=OIP.FWvRQsq-DMZC9vWNrlg2wgHaEK&pid=Api&P=0&h=180',
      file: music3,
    },
    {
      title: 'Đảo không người',
      artist: 'Nhậm Nhiên 任然',
      image: 'https://tse2.mm.bing.net/th?id=OIP.K4iJdFS_wNtlI-viCRfyGgHaEK&pid=Api&P=0&h=180',
      file: music4,
    },
    {
      title: 'Tháp rơi tự do',
      artist: 'LBI Lợi Bỉ  跳楼机',
      image: 'https://tse3.mm.bing.net/th?id=OIP.J0cMqhYHU3_zFfib3hEjNAHaEK&pid=Api&P=0&h=180',
      file: music5,
    },
    {
      title: 'Mang chủng',
      artist: 'Âm Khuyết Thi Thính',
      image: 'https://tse1.mm.bing.net/th?id=OIP.zaxirg4lFkQu7ZJMV3yhyAAAAA&pid=Api&P=0&h=180',
      file: music6,
    },
    {
      title: 'Thiếu niên',
      artist: 'Mộng Nhiên',
      image: 'https://tse2.mm.bing.net/th?id=OIP.e8WPtVl6PihypO3lAPa-FgHaEK&pid=Api&P=0&h=180',
      file: music7,
    },
    {
      title: 'Đáp án của bạn',
      artist: 'A Nhũng',
      image: 'https://tse3.mm.bing.net/th?id=OIP.5XlGjaUih_8fVxCsWA40rAHaEK&pid=Api&P=0&h=180',
      file: music8,
    },
    {
      title: 'Nơi đâu cũng là em',
      artist: 'YoungCaptain',
      image: 'https://tse2.mm.bing.net/th?id=OIP.4An7eZsIHHXC8DjbGaSuuwHaEK&pid=Api&P=0&h=180',
      file: music9,
    },
    {
      title: 'Không biết phải làm sao',
      artist: 'Vương Tĩnh Văn Không Mập',
      image: 'https://tse1.mm.bing.net/th?id=OIP.FnhgM14pFzq-Typ1cvLo9AHaEK&pid=Api&P=0&h=180',
      file: music10,
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
            <h2 className="title-box-music text-center">🎵 Nhạc Trung Quốc</h2>
            <p className="text-center">Nghe bao hay bao suy.</p>


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

export default NhacTrung;
