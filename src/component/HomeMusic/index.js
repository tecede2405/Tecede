import { useNavigate } from "react-router-dom"; 

import "./homemusic.scss";
import nhactre from "../../img/musics-thumbnail/nhactre.png";
import usuk from "../../img/musics-thumbnail/usuk.png";
import china from "../../img/musics-thumbnail/china.png";
import edm from "../../img/musics-thumbnail/edm.png";
import mood from "../../img/musics-thumbnail/mood.png";
import 'animate.css';
const musicData = [
    { image: nhactre, path: "nhac-tre"},
    { image: usuk, path: "usuk"},
    {image: china , path: "trung-quoc"},
    {image: edm, path: "edm"},
    {image: mood, path: "mood"},
];

function HomeMusic() {
    const navigate = useNavigate();


  return (
    <>
        <div>
            <h2 className="music-box-title">Trạm phát nhạc</h2>
            <p className="music-box-desc">"Nhạc sẽ luôn được cập nhật thường xuyên. <br />Click vào để xem chi tiết"</p>
        </div>
        <div className="container">
            <div className="row row-card">
                {musicData.map((item, index) => (
                <div className="card-music col-xl-2 col-lg-3 col-md-3 col-sm-4 col-5 mb-3 animate__animated animate__flip"
                 data-wow-duration="1.5s" data-wow-delay="0.3s" key={index} onClick={() => navigate(`/music/${item.path}`)}>
                    <div className="card">
                        <img src={item.image} className="card-img-top" alt={item.title} />
                        
                    </div>
                </div>
                ))}    
            </div>
        </div>
    </>
   )
}

export default HomeMusic;