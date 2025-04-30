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

function NhacTrung() {
  const songs = [
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


  return(
    <>
    <div className="music-container-box"> 
      <Tabbar />
      <div className="music-container container mt-4">
            <h2 className="title-box-music text-center">🎵 Nhạc Trung Quốc</h2>
            <p className="text-center">Nghe bao hay bao suy.</p>
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
