import React, { useState, useRef, useEffect } from "react";
import Tabbar from '../../../component/tabar/index';
import music1 from '../../../audio/Nhac Usuk/Ellie Goulding - Love Me Like You Do (Lyrics).mp3';
import music2 from '../../../audio/Nhac Usuk/Lady Gaga, Bruno Mars - Die With A Smile (Official Music Video).mp3';
import music3 from '../../../audio/Nhac Usuk/One Last Time x Coral Sea - Ariana Grande (Lyrics  Vietsub).mp3';
import music4 from '../../../audio/Nhac Usuk/VietsubLyrics Until I Found You (Juliet to your Romeo) - Stephen Sanchez ft. Em Beihold.mp3';
import music5 from '../../../audio/Nhac Usuk/we dont talk anymore.mp3';
import music6 from '../../../audio/Nhac Usuk/Taylor Swift - Enchanted.mp3';
import music7 from '../../../audio/Nhac Usuk/Unstoppable - Sia (Lyrics  Vietsub).mp3';
import music8 from '../../../audio/Nhac Usuk/Ed Sheeran - Shape Of You [LyricsVietsub].mp3';
import music9 from '../../../audio/Nhac Usuk/The Chainsmokers - Closer (Lyrics) ft. Halsey.mp3';
import music10 from '../../../audio/Nhac Usuk/Ava Max - Into Your Arms (NO RAP) [LyricsVietsub]  TikTok Hits.mp3';
import music11 from '../../../audio/Nhac Usuk/Trap Queen - Adriana Gomez  Eightfold X MKJ Remix (Lyrics  Vietsub).mp3';
import music12 from '../../../audio/Nhac Usuk/THE ONE THAT GOT AWAY  KATY PERRY  LYRICS.mp3';
import music13 from '../../../audio/Nhac Usuk/Why Not Me - Enrique Iglesias (Lyrics & Vietsub).mp3';
import music14 from '../../../audio/Nhac Usuk/I Do - 911 (Lyrics & Vietsub).mp3';
import music15 from '../../../audio/Nhac Usuk/Shadow Of The Sun - Professor Green [ Lyrics  Vietsub ].mp3';
import music16 from '../../../audio/Nhac Usuk/Hayd - Head In The Clouds (Official Video).mp3';
import music17 from '../../../audio/Nhac Usuk/[VietsubLyrics] A Thousand Years - Christina Perri.mp3';
import music18 from '../../../audio/Nhac Usuk/[Lyrics  Vietsub] double take - dhruv (slowed).mp3';
import music19 from '../../../audio/Nhac Usuk/I Miss You - Czarina (Lyrics & Vietsub).mp3';
import music20 from '../../../audio/Nhac Usuk/Send My Love  Sit Still, Look Pretty (Acoustic Mashup) (Nightcore Version).mp3';




function Nhacusuk() {
  const songs = [
    {
      title: 'Love Me Like You Do',
      artist: 'Ellie Goulding',
      image: 'https://tse4.mm.bing.net/th?id=OIP.6LUYDO_GeW71Y86RQ05zkwHaEK&pid=Api&P=0&h=180',
      file: music1,
    },
    {
      title: 'Die With A Smile',
      artist: 'Lady Gaga, Bruno Mars',
      image: 'https://tse4.mm.bing.net/th?id=OIP.GBvpstTHiNPv8YSUUBU8TgHaER&pid=Api&P=0&h=180',
      file: music2,
    },
    {
      title: 'One Last Time x Coral Sea',
      artist: 'Ariana Grande',
      image: 'https://tse3.mm.bing.net/th?id=OIP.gK5QctpoMzKUAqcZ1YmWXgHaEK&pid=Api&P=0&h=180',
      file: music3,
    },
    {
      title: 'Until i found you',
      artist: 'Stephen Sanchez ft. Em Beihold',
      image: 'https://tse4.mm.bing.net/th?id=OIP.wUGDBiuCuhXLIFtqndTvpAHaEK&pid=Api&P=0&h=180',
      file: music4,
    },
    {
      title: 'We dont talk anymore',
      artist: 'Charlie Puth',
      image: 'https://tse1.mm.bing.net/th?id=OIP.wHq7pPQU9qx5utiVbIajSQHaHa&pid=Api&P=0&h=180',
      file: music5,
    },
    {
      title: 'Enchanted',
      artist: 'Taylor Swift',
      image: 'https://tse1.mm.bing.net/th?id=OIP.FI3k8VCKwUZ_aU0P1TL2_gHaDt&pid=Api&P=0&h=180',
      file: music6,
    },
    {
      title: 'Unstoppable',
      artist: 'Sia',
      image: 'https://tse4.mm.bing.net/th?id=OIP.GXwD1V-Iu4Gyf1-vgaqBrwHaEK&pid=Api&P=0&h=180',
      file: music7,
    },
    {
      title: 'Shape of You',
      artist: 'Ed Sheeran',
      image: 'https://tse1.mm.bing.net/th?id=OIP.vKdrt3iDSMBmyHZnlFgVswAAAA&pid=Api&P=0&h=180',
      file: music8,
    },
    {
      title: 'Closer',
      artist: 'The Chainsmokers',
      image: 'https://tse3.mm.bing.net/th?id=OIP.L1XSugG-T_CMJYFem9rvBwHaHa&pid=Api&P=0&h=180',
      file: music9,
    },
    {
      title: 'Into Tour Arms',
      artist: 'Ava Max',
      image: 'https://tse4.mm.bing.net/th?id=OIP.95ex0rS7HUQrj_h7QKYoDgHaEK&pid=Api&P=0&h=180',
      file: music10,
    },
    {
      title: 'Trap Queen',
      artist: 'Adriana Gomez',
      image: 'https://tse3.mm.bing.net/th?id=OIP.V-LjLrOAAOt0VP_zL8VvAgHaHa&pid=Api&P=0&h=180',
      file: music11,
    },
    {
      title: 'The one that got away',
      artist: 'Katy Perry',
      image: 'https://tse4.mm.bing.net/th?id=OIP.ByrciggbiGDD204bBzCQ8QHaEK&pid=Api&P=0&h=180',
      file: music12,
    },
    {
      title: 'Why Not Me',
      artist: 'Enrique Iglesias',
      image: 'https://tse4.mm.bing.net/th?id=OIP.G3vMvcHv38ctVo9PIU0K6QHaEK&pid=Api&P=0&h=180',
      file: music13,
    },
    {
      title: 'I Do',
      artist: '911',
      image: 'https://tse1.mm.bing.net/th?id=OIP.tHdlo1DMg4eiiZ9RomjpLAHaEK&pid=Api&P=0&h=180',
      file: music14,
    },
    {
      title: 'Shadow of the sun',
      artist: 'Max Elto',
      image: 'https://tse1.mm.bing.net/th?id=OIP.ZzCvQjEaEAgdC9IzdVRAOwHaEK&pid=Api&P=0&h=180',
      file: music15,
    },
    {
      title: 'Head in the clouds',
      artist: 'Hayd',
      image: 'https://tse1.mm.bing.net/th?id=OIP.TSGT_Lgb6KRCwhueHoCJKwHaEK&pid=Api&P=0&h=180',
      file: music16,
    },
    {
      title: 'A thousand years',
      artist: 'Christina Perri',
      image: 'https://musicaroo.com/wp-content/uploads/2023/03/A-Thousand-Years-Lyrics-Meaning.png',
      file: music17,
    },
    {
      title: 'Double Take',
      artist: 'dhruv',
      image: 'https://tse3.mm.bing.net/th?id=OIP.HIrxMOJQux2dkC8CI6EAOAHaEK&pid=Api&P=0&h=180',
      file: music18,
    },
    {
      title: 'I miss you',
      artist: 'Czarina',
      image: 'https://tse1.mm.bing.net/th?id=OIP.k3oa9Px5MlMMqsrOgFgSYgHaFj&pid=Api&P=0&h=180',
      file: music19,
    },
    {
      title: 'Send my love',
      artist: 'Sit Still, Look Pretty ',
      image: 'https://tse4.mm.bing.net/th?id=OIP.Vs1tJpR_kfKVH8sSWEQuJgHaEK&pid=Api&P=0&h=180',
      file: music20,
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
              <h2 className="title-box-music text-center">🎵 Nhạc Trẻ Việt Nam</h2>
              <p className="text-center">Những bài này mình tự chọn lọc theo sở thích.</p>
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
export default Nhacusuk;
