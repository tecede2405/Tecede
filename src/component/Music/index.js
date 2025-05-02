import React, { useEffect, useState } from 'react';
import music1 from '../../audio/NhacViet/[Lyrics] Yêu Thương Ngày Đó - Soobin Hoàng Sơn  OST Yêu Em Bất Chấp.mp3';
import music2 from '../../audio/NhacViet/Bình Yên Nơi Đâu  Sơn Tùng M-TP.mp3';
import music3 from '../../audio/NhacViet/Chi Pu  ANH ƠI Ở LẠI - Official MV (Chuyện Cám Tấm) (치푸).mp3';
import music4 from '../../audio/NhacViet/CÒN YÊU, ĐÂU AI RỜI ĐI - ĐỨC PHÚC  OFFICIAL MV.mp3';
import music5 from '../../audio/NhacViet/Dù cho tận thế.mp3';
import music6 from '../../audio/NhacViet/GHÉ QUA   OFFICIAL MV  Dick x PC x Tofu.mp3';
import music7 from '../../audio/NhacViet/HOA VÔ SẮC  ICM x JACK  OFFICIAL MUSIC VIDEO.mp3';
import music8 from '../../audio/NhacViet/HOAPROX x XESI - VÔ TÌNH  Official Lyric Video.mp3';
import music9 from '../../audio/NhacViet/HOÀNG TÔN - YÊU EM RẤT NHIỀU (Lyrics Video).mp3';
import music10 from '../../audio/NhacViet/NGÀY ĐẦU SAU CHIA TAY - ĐỨC PHÚC x THUỲ TIÊN x KHẮC HƯNG  OFFICIAL MUSIC VIDEO.mp3';
import music11 from '../../audio/NhacViet/Noo Phước Thịnh - Mãi Mãi Bên Nhau.mp3';
import music12 from '../../audio/NhacViet/Thêm Bao Nhiêu Lâu - Đạt G  OFFICIAL MV.mp3';
import music13 from '../../audio/NhacViet/THẰNG ĐIÊN  JUSTATEE x PHƯƠNG LY  OFFICIAL MV.mp3';
import music14 from '../../audio/NhacViet/Tìm Một Người Như Thế - Trungg I.U  OFFICIAL.mp3';
import music15 from '../../audio/NhacViet/Tùng TeA - Già Cùng Nhau Là Được ft. PC ( Prod. VoVanDuc. )  Official MV.mp3';
import music16 from '../../audio/NhacViet/Âm Thầm Bên Em.mp3';
import music17 from '../../audio/NhacViet/Đom Đóm - Jack [Lyrics video].mp3';
import music18 from '../../audio/NhacViet/suýt nữa thì.mp3';
import music19 from '../../audio/NhacViet/MIN - ĐỪNG YÊU NỮA, EM MỆT RỒI  OFFICIAL MUSIC VIDEO.mp3';
import music20 from '../../audio/NhacViet/CẢM GIÁC LÚC ẤY SẼ RA SAO  LOU HOÀNG  OFFICIAL AUDIO.mp3';
const allSongs = [music1, music2, music3, music4, music5,
  music6, music7, music8, music9, music10, music11, music12,
  music13, music14, music15, music16, music17, music18,music19,
  music20];

const shuffleArray = (array) => array.sort(() => Math.random() - 0.5);

const BackgroundMusic = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [playlist, setPlaylist] = useState(shuffleArray([...allSongs]));
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const audio = document.getElementById('background-music');
    if (isPlaying) {
      audio.play();
    } else {
      audio.pause();
    }

    const handleSongEnd = () => {
      if (currentIndex < playlist.length - 1) {
        setCurrentIndex((prevIndex) => prevIndex + 1);
      } else {
        setPlaylist(shuffleArray([...allSongs]));
        setCurrentIndex(0);
      }
    };

    audio.addEventListener('ended', handleSongEnd);
    return () => {
      audio.removeEventListener('ended', handleSongEnd);
    };
  }, [isPlaying, currentIndex, playlist]);

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  return (
    <div>
      <audio id="background-music" src={playlist[currentIndex]} autoPlay={isPlaying} />
      <button onClick={togglePlay} className="toggle-button">
        {isPlaying ? 'Tắt nhạc' : 'Bật nhạc'}
      </button>
    </div>
  );
};

export default BackgroundMusic;
