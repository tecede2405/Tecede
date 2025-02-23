import React, { useEffect, useState } from 'react';
import music1 from '../../audio/[Lyrics] Yêu Thương Ngày Đó - Soobin Hoàng Sơn  OST Yêu Em Bất Chấp.mp3';
import music2 from '../../audio/Bình Yên Nơi Đâu  Sơn Tùng M-TP.mp3';
import music3 from '../../audio/Chi Pu  ANH ƠI Ở LẠI - Official MV (Chuyện Cám Tấm) (치푸).mp3';
import music4 from '../../audio/CÒN YÊU, ĐÂU AI RỜI ĐI - ĐỨC PHÚC  OFFICIAL MV.mp3';
import music5 from '../../audio/Dù cho tận thế.mp3';
import music6 from '../../audio/GHÉ QUA   OFFICIAL MV  Dick x PC x Tofu.mp3';
import music7 from '../../audio/HOA VÔ SẮC  ICM x JACK  OFFICIAL MUSIC VIDEO.mp3';
import music8 from '../../audio/HOAPROX x XESI - VÔ TÌNH  Official Lyric Video.mp3';
import music9 from '../../audio/HOÀNG TÔN - YÊU EM RẤT NHIỀU (Lyrics Video).mp3';
import music10 from '../../audio/NGÀY ĐẦU SAU CHIA TAY - ĐỨC PHÚC x THUỲ TIÊN x KHẮC HƯNG  OFFICIAL MUSIC VIDEO.mp3';
import music11 from '../../audio/Noo Phước Thịnh - Mãi Mãi Bên Nhau.mp3';
import music12 from '../../audio/Thêm Bao Nhiêu Lâu - Đạt G  OFFICIAL MV.mp3';
import music13 from '../../audio/THẰNG ĐIÊN  JUSTATEE x PHƯƠNG LY  OFFICIAL MV.mp3';
import music14 from '../../audio/Tìm Một Người Như Thế - Trungg I.U  OFFICIAL.mp3';
import music15 from '../../audio/Tùng TeA - Già Cùng Nhau Là Được ft. PC ( Prod. VoVanDuc. )  Official MV.mp3';
import music16 from '../../audio/Âm Thầm Bên Em.mp3';
import music17 from '../../audio/Đom Đóm - Jack [Lyrics video].mp3';

const songs = [music1,music2,music3,music4,music5,music6,music7,music8,music8,music9,music10,music11,music12,music13,music14,music15,music16,music17];

const BackgroundMusic = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentSong, setCurrentSong] = useState(null);

  useEffect(() => {
    const audio = document.getElementById('background-music');
    if (isPlaying && currentSong) {
      audio.play();
    } else {
      audio.pause();
    }

    const handleSongEnd = () => {
      const randomSong = songs[Math.floor(Math.random() * songs.length)];
      setCurrentSong(randomSong);
      audio.play();
    };

    audio.addEventListener('ended', handleSongEnd);

    return () => {
      audio.removeEventListener('ended', handleSongEnd);
    };
  }, [isPlaying, currentSong]);

  const togglePlay = () => {
    if (!isPlaying) {
      const randomSong = songs[Math.floor(Math.random() * songs.length)];
      setCurrentSong(randomSong);
    }
    setIsPlaying(!isPlaying);
  };

  return (
    <div>
      <audio id="background-music" loop className="hidden-audio">
        {currentSong && <source src={currentSong} type="audio/mpeg" />}
      </audio>
      <button onClick={togglePlay} className="toggle-button">
        {isPlaying ? 'Tắt nhạc' : 'Bật nhạc'}
      </button>
    </div>
  );
}

export default BackgroundMusic;

