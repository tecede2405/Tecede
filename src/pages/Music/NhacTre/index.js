import "./nhactre.scss";
import React, { useState, useRef, useEffect } from "react";
import Tabbar from '../../../component/tabar/index';
import music1 from '../../../audio/NhacViet/[Lyrics] Yêu Thương Ngày Đó - Soobin Hoàng Sơn  OST Yêu Em Bất Chấp.mp3';
import music2 from '../../../audio/NhacViet/Bình Yên Nơi Đâu  Sơn Tùng M-TP.mp3';
import music3 from '../../../audio/NhacViet/Chi Pu  ANH ƠI Ở LẠI - Official MV (Chuyện Cám Tấm) (치푸).mp3';
import music4 from '../../../audio/NhacViet/CÒN YÊU, ĐÂU AI RỜI ĐI - ĐỨC PHÚC  OFFICIAL MV.mp3';
import music5 from '../../../audio/NhacViet/Dù cho tận thế.mp3';
import music6 from '../../../audio/NhacViet/GHÉ QUA   OFFICIAL MV  Dick x PC x Tofu.mp3';
import music7 from '../../../audio/NhacViet/HOA VÔ SẮC  ICM x JACK  OFFICIAL MUSIC VIDEO.mp3';
import music8 from '../../../audio/NhacViet/HOAPROX x XESI - VÔ TÌNH  Official Lyric Video.mp3';
import music9 from '../../../audio/NhacViet/HOÀNG TÔN - YÊU EM RẤT NHIỀU (Lyrics Video).mp3';
import music10 from '../../../audio/NhacViet/NGÀY ĐẦU SAU CHIA TAY - ĐỨC PHÚC x THUỲ TIÊN x KHẮC HƯNG  OFFICIAL MUSIC VIDEO.mp3';
import music11 from '../../../audio/NhacViet/Noo Phước Thịnh - Mãi Mãi Bên Nhau.mp3';
import music12 from '../../../audio/NhacViet/Thêm Bao Nhiêu Lâu - Đạt G  OFFICIAL MV.mp3';
import music13 from '../../../audio/NhacViet/THẰNG ĐIÊN  JUSTATEE x PHƯƠNG LY  OFFICIAL MV.mp3';
import music14 from '../../../audio/NhacViet/Tìm Một Người Như Thế - Trungg I.U  OFFICIAL.mp3';
import music15 from '../../../audio/NhacViet/Tùng TeA - Già Cùng Nhau Là Được ft. PC ( Prod. VoVanDuc. )  Official MV.mp3';
import music16 from '../../../audio/NhacViet/Âm Thầm Bên Em.mp3';
import music17 from '../../../audio/NhacViet/Đom Đóm - Jack [Lyrics video].mp3';
import music18 from '../../../audio/NhacViet/suýt nữa thì.mp3';
import music19 from '../../../audio/NhacViet/MIN - ĐỪNG YÊU NỮA, EM MỆT RỒI  OFFICIAL MUSIC VIDEO.mp3';
import music20 from '../../../audio/NhacViet/CẢM GIÁC LÚC ẤY SẼ RA SAO  LOU HOÀNG  OFFICIAL AUDIO.mp3';

function NhacTre() {
  const songs = [
    {
      title: 'Yêu thương ngày đó',
      artist: 'Soobin Hoàng Sơn',
      image: 'https://tse4.mm.bing.net/th?id=OIP.EGW2Hn7R8N1Ths8GJomXvAHaEK&pid=Api&P=0&h=180',
      file: music1,
    },
    {
      title: 'Bình yên nơi đâu',
      artist: 'Sơn Tùng M-TP',
      image: 'https://tse4.mm.bing.net/th?id=OIP.KFdRlDnFRNJ9TP3doLVVggHaEK&pid=Api&P=0&h=180',
      file: music2,
    },
    {
      title: 'Anh ơi ở lại',
      artist: 'Chi Pu',
      image: 'https://tse3.mm.bing.net/th?id=OIP.N7ydPkdw-S6FDgknC0QmwwHaEK&pid=Api&P=0&h=180',
      file: music3,
    },
    {
      title: 'Còn yêu đâu ai rời đi',
      artist: 'Đức Phúc',
      image: 'https://tse1.mm.bing.net/th?id=OIP.LNVYiWX_spX_SGD6i-D3gAHaEK&pid=Api&P=0&h=180',
      file: music4,
    },
    {
      title: 'Dù cho tận thế',
      artist: 'Erik',
      image: 'https://tse2.mm.bing.net/th?id=OIP.QhRkCVd03c98LJY-OL9slQHaEK&pid=Api&P=0&h=180',
      file: music5,
    },
    {
      title: 'GHÉ QUA',
      artist: 'Dick x PC x Tofu',
      image: 'https://tse4.mm.bing.net/th?id=OIP.wOX6u2kqWZ8dquE4bUsfjQHaEK&pid=Api&P=0&h=180',
      file: music6,
    },
    {
      title: 'HOA VÔ SẮC',
      artist: 'jack - J97',
      image: 'https://tse2.mm.bing.net/th?id=OIP.r6OdERak7dvkQDSRDTDXzgHaIl&pid=Api&P=0&h=180',
      file: music7,
    },
    {
      title: 'VÔ TÌNH',
      artist: 'HOAPROX x XESI',
      image: 'https://tse2.mm.bing.net/th?id=OIP.kEmhLf3sUwZqcZ7oXJ7PigHaEK&pid=Api&P=0&h=180',
      file: music8,
    },
    {
      title: 'YÊU EM RẤT NHIỀU',
      artist: 'Hoàng Tôn',
      image: 'https://tse1.mm.bing.net/th?id=OIP.jA_hDtaiVJ8JIBj_UeaoZwHaEK&pid=Api&P=0&h=180',
      file: music9,
    },
    {
      title: 'NGÀY ĐẦU SAU CHIA TAY',
      artist: 'ĐỨC PHÚC x THUỲ TIÊN x KHẮC HƯNG',
      image: 'https://tse1.mm.bing.net/th?id=OIP.F1ruQMgYWLE9HARop5_0qgHaEK&pid=Api&P=0&h=180',
      file: music10,
    },
    {
      title: 'Mãi Mãi Bên Nhau',
      artist: 'Noo Phước Thịnh',
      image: 'https://tse4.mm.bing.net/th?id=OIP.7uVWmOLs_MNocmJKgocYoAHaFj&pid=Api&P=0&h=180',
      file: music11,
    },
    {
      title: 'Thêm bao nhiêu lâu',
      artist: 'Đạt G',
      image: 'https://tse3.mm.bing.net/th?id=OIP.MxCZsY0YJ-7qCnGoy6W8gAHaEK&pid=Api&P=0&h=180',
      file: music12,
    },
    {
      title: 'Thằng Điên',
      artist: 'JUSTATEE x PHƯƠNG LY',
      image: 'https://tse1.mm.bing.net/th?id=OIP.pzZmv7gHPp3kBmBCcTQlyQHaEK&pid=Api&P=0&h=180',
      file: music13,
    },
    {
      title: 'Tìm Một Người Như Thế',
      artist: 'Trungg I.U',
      image: 'https://tse4.mm.bing.net/th?id=OIP.RefvCYH7FDjoD13h1bKcyAHaFj&pid=Api&P=0&h=180',
      file: music14,
    },
    {
      title: 'Già Cùng Nhau Là Được',
      artist: 'Tùng TeA ft PC',
      image: 'https://tse2.mm.bing.net/th?id=OIP.8re2DHAK9z6Ea_6D3mBtHgHaEK&pid=Api&P=0&h=180',
      file: music15,
    },
    {
      title: 'Âm Thầm Bên Em',
      artist: 'Sơn Tùng M-TP',
      image: 'https://tse2.mm.bing.net/th?id=OIP.LUzHFHm6pCh6Y7Uz5kaK2AAAAA&pid=Api&P=0&h=180',
      file: music16,
    },
    {
      title: 'Đom Đóm',
      artist: 'Jack - J97',
      image: 'https://tse4.mm.bing.net/th?id=OIP.xHMVpAMmJDmT8FIEZkJpyAHaEK&pid=Api&P=0&h=180',
      file: music17,
    },
    {
      title: 'Suýt nữa thì',
      artist: 'ANDIEZ',
      image: 'https://tse2.mm.bing.net/th?id=OIP.df-kdKU3-6fnmnkUd-vNxAHaHa&pid=Api&P=0&h=180',
      file: music18,
    },
    {
      title: 'Đừng yêu nữa, em mệt rồi',
      artist: 'MIN',
      image: 'https://tse1.mm.bing.net/th?id=OIP.Ne58V1BFG6driYe9Lz3dawHaFj&pid=Api&P=0&h=180',
      file: music19,
    },
    {
      title: 'Cảm giác lúc ấy sẽ ra sao',
      artist: 'Lou Hoàng',
      image: 'https://tse1.mm.bing.net/th?id=OIP.j8cTvXjNTs6zKl0zBKwbPwHaHa&pid=Api&P=0&h=180',
      file: music20,
    },
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
              <h2 className="title-box-music text-center">🎵 Nhạc Trẻ Việt Nam</h2>
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



export default NhacTre;
