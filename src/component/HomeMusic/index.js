import { useNavigate } from "react-router-dom"; 

import "./homemusic.scss";
import vpop from "../../img/music-thumnail/vpop.png";
import usuk from "../../img/music-thumnail/usuk.png";
import china from "../../img/music-thumnail/china.png";
import edm from "../../img/music-thumnail/edm.png";
import sad from "../../img/music-thumnail/sad.png";
import 'animate.css';
const musicData = [
    { title: "Nhạc Việt Nam", image: vpop, path: "nhac-tre",desc: "Nhạc vui buồn lẫn lộn,cực kì đa dạng thể loại từ thời tối cổ đến hiện đại." },
    { title: "Nhạc Âu Mĩ", image: usuk, path: "usuk",desc: "Khi âm nhạc là liều thuốc chữa lành, nghe bao chill." },
    { title: "Nhạc Trung Quốc", image: china , path: "trung-quoc",desc: "Giai điệu và lời nhạc cực kì hay dù nghe chả hiểu gì." },
    { title: "Nhạc EDM", image: edm, path: "edm",desc: "Nhạc điện tử sôi động, cực kì thích hợp để nghe khi chơi thể thao,..." },
    { title: "Nhạc chill", image: sad, path: "mood",desc: "Nhạc không lời giúp bạn thư giãn và tập trung hơn trong công việc." },
];

function HomeMusic() {
    const navigate = useNavigate();


  return (
    <>
        <div>
            <h2 className="music-box-title">Trạm phát nhạc</h2>
            <p className="music-box-desc">"Click vào để xem chi tiết"</p>
        </div>
        <div className="container">
            <div className="row row-card">
                {musicData.map((item, index) => (
                <div className="card-music col-xl-2 col-lg-3 col-md-3 col-sm-5 col-5 mb-4 animate__animated animate__flip"
                 data-wow-duration="1.5s" data-wow-delay="0.3s" key={index} onClick={() => navigate(`/music/${item.path}`)}>
                    <div className="card">
                        <img src={item.image} className="card-img-top" alt={item.title} />
                        <div className="card-body">
                            <h5 className="card-title">{item.title}</h5>
                            <p className="card-desc">{item.desc}</p>
                        </div>
                    </div>
                </div>
                ))}
            </div>
        </div>
    </>
   )
}

export default HomeMusic;