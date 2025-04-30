import Tabbar from '../../../component/tabar/index';
import music1 from '../../../audio/NhacEDM/Ahrix - Nova.mp3';
import music2 from '../../../audio/NhacEDM/Legends Never Die (ft. Against The Current)  Worlds 2017 - League of Legends.mp3';
import music3 from '../../../audio/NhacEDM/TheFatRat - Never Be Alone.mp3';
import music4 from '../../../audio/NhacEDM/Alan Walker - Alone.mp3';
import music5 from '../../../audio/NhacEDM/TheFatRat - Rise Up.mp3';
import music6 from '../../../audio/NhacEDM/Warriyo - Mortals (feat. Laura Brehm)  Future Trap  NCS - Copyright Free Music.mp3';
import music7 from '../../../audio/NhacEDM/Ampyx - Holo.mp3';
import music8 from '../../../audio/NhacEDM/Where We Started - Lost Sky ft. Jex (Lyrics  Vietsub).mp3';
import music9 from '../../../audio/NhacEDM/Jim Yosef - Firefly  Progressive House  NCS - Copyright Free Music.mp3';
import music10 from '../../../audio/NhacEDM/Tobu & Syndec - Dusk (Radio Edit).mp3';

function NhacTrung() {
  const songs = [
    {
      title: 'Nova',
      artist: 'Ahrix',
      image: 'https://tse4.mm.bing.net/th?id=OIP.Z9d57V4cTSv3LuuKElJboQHaEK&pid=Api&P=0&h=180',
      file: music1,
    },
    {
      title: 'Legends Never Die',
      artist: 'ft. Against The Current',
      image: 'https://tse2.mm.bing.net/th?id=OIP.b9GU1HhlZLEqsbYYVjMiPwHaEK&pid=Api&P=0&h=180',
      file: music2,
    },
    {
      title: 'Never be alone',
      artist: 'TheFatRat',
      image: 'https://tse2.mm.bing.net/th?id=OIP.uCXj9DR5jQs6vtKyfN6NAAHaEK&pid=Api&P=0&h=180',
      file: music3,
    },
    {
      title: 'Alone',
      artist: 'Alan Walker',
      image: 'https://tse1.mm.bing.net/th?id=OIP.86og3_3k2N4m68K-hc1kygHaHa&pid=Api&P=0&h=180',
      file: music4,
    },
    {
      title: 'Rise up',
      artist: 'The Fat Rat',
      image: 'https://tse1.mm.bing.net/th?id=OIP.BuWu7EBn0k-6ONt01GlwPAHaHa&pid=Api&P=0&h=180',
      file: music5,
    },
    {
      title: 'Mortals ',
      artist: 'Warriyo',
      image: 'https://tse2.mm.bing.net/th?id=OIP.fmB_vgxfsl00dRDA27U9GQHaEK&pid=Api&P=0&h=180',
      file: music6,
    },
    {
      title: 'Holo',
      artist: 'Ampyx',
      image: 'https://tse1.mm.bing.net/th?id=OIP.-kY6fYOdbtoq8UE7hQJ5aAAAAA&pid=Api&P=0&h=180',
      file: music7,
    },
    {
      title: 'Where we started',
      artist: 'Lost Sky ft. Jex',
      image: 'https://tse1.mm.bing.net/th?id=OIP.9YY82U4QzaqHQSGsi639LAHaEK&pid=Api&P=0&h=180',
      file: music8,
    },
    {
      title: 'Firefly',
      artist: 'Jim Yosef',
      image: 'https://tse3.mm.bing.net/th?id=OIP.G3zdnaOWM8vw_5xHONr4RwHaEK&pid=Api&P=0&h=180',
      file: music9,
    },
    {
      title: 'Dusk',
      artist: 'Tobu & Syndec',
      image: 'https://tse3.mm.bing.net/th?id=OIP.ue2x6WGwV9TEDhOk5zvgKQHaEK&pid=Api&P=0&h=180',
      file: music10,
    },


    // Thêm bài hát vào đây
  ];


  return(
    <>
    <div className="music-container-box"> 
      <Tabbar />
      <div className="music-container container mt-4">
            <h2 className="title-box-music text-center">🎵 Nhạc EDM</h2>
            <p className="text-center">Khi cảm xúc thăng hoa.</p>
            <div className="row">
              {songs.map((song, index) => (
                <div className="col-md-4 mb-4 border rounded " key={index}>
                  <div className="music-card d-flex align-items-center p-3 ">
                    <img src={song.image} className="rounded mr-3" alt={song.title} style={{ width: '60px', height: '60px', objectFit: 'cover' }} />
                    <div className="card-body d-flex flex-column">
                      <h5 className="card-title mb-1">{song.title}</h5>
                      <p className="card-text text-muted mb-2">{song.artist}</p>
                    </div>
                  </div>
                  <audio controls className="custom-audio" style={{ width: '100%', marginTop: '10px'}}>
                        <source src={song.file} type="audio/mpeg" />
                        Trình duyệt của bạn không hỗ trợ phát nhạc.
                      </audio>
                </div>
              ))}
            </div>
        </div>
      </div>
  </>
 )
}
export default NhacTrung;
