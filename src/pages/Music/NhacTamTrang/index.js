
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
      title: 'Xuân hạ và chí minh',
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


    // Thêm bài hát vào đây
  ];


  return(
    <>
    <div className="music-container-box"> 
      <Tabbar />
      <div className="music-container container mt-4">
            <h2 className="title-box-music text-center">🎵 Nhạc Không Lời</h2>
            <p className="text-center">Hãy nghe hết bài nếu bạn muốn biết thật sự nó hay ở đâu. </p>
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
export default NhacMood;
