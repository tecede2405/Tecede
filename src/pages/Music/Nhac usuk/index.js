
import Tabbar from '../../../component/tabar/index';
import music1 from '../../../audio/Nhac Usuk/Ellie Goulding - Love Me Like You Do (Lyrics).mp3';
import music2 from '../../../audio/Nhac Usuk/Lady Gaga, Bruno Mars - Die With A Smile (Official Music Video).mp3';
import music3 from '../../../audio/Nhac Usuk/One Last Time x Coral Sea - Ariana Grande (Lyrics  Vietsub).mp3';
import music4 from '../../../audio/Nhac Usuk/VietsubLyrics Until I Found You (Juliet to your Romeo) - Stephen Sanchez ft. Em Beihold.mp3';
import music5 from '../../../audio/Nhac Usuk/we dont talk anymore.mp3';
import music6 from '../../../audio/Nhac Usuk/Taylor Swift - Enchanted.mp3';
import music7 from '../../../audio/Nhac Usuk/Unstoppable - Sia (Lyrics  Vietsub).mp3';
import music8 from '../../../audio/Nhac Usuk/Ed Sheeran - Shape Of You [LyricsVietsub].mp3';
import music9 from '../../../audio/Nhac Usuk/Ed Sheeran - Shape Of You [LyricsVietsub].mp3';


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


    // Thêm bài hát vào đây
  ];


  return(
    <>
    <div className="music-container-box"> 
      <Tabbar />
      <div className="music-container container mt-4">
            <h2 className="text-center mb-4">🎵 Nhạc Nước Ngoài Hot Tiktok</h2>
            <div className="row">
              {songs.map((song, index) => (
                <div className="col-md-4 mb-4" key={index}>
                  <div className="music-card d-flex align-items-center p-3 border rounded">
                    <img src={song.image} className="rounded mr-3" alt={song.title} style={{ width: '80px', height: '80px', objectFit: 'cover' }} />
                    <div className="card-body d-flex flex-column">
                      <h5 className="card-title mb-1">{song.title}</h5>
                      <p className="card-text text-muted mb-2">{song.artist}</p>
                      <audio controls style={{ width: '100%' }}>
                        <source src={song.file} type="audio/mpeg" />
                        Trình duyệt của bạn không hỗ trợ phát nhạc.
                      </audio>
                    </div>
                  </div>
                </div>
              ))}
            </div>
        </div>
      </div>
  </>
 )
}
export default Nhacusuk;
