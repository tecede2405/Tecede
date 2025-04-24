import { useNavigate } from "react-router-dom"; 
import usuk from "../../img/usuk.png";
import "./homemusic.scss";
const musicData = [
    { title: "Nhạc Việt Nam", image: "https://i.ytimg.com/vi/MNmbt2akaBI/maxresdefault.jpg", path: "nhac-tre" },
    { title: "Nhạc USUK", image: usuk, path: "usuk" },
    { title: "Nhạc Trung Quốc", image: "https://tse3.mm.bing.net/th?id=OIP.r0YpMLDCgGWLAtTXxK4GdgAAAA&pid=Api&P=0&h=180", path: "trung-quoc" },
    { title: "Nhạc EDM", image: "https://i.pinimg.com/originals/56/3a/56/563a56b106ea38b20d29c33a0cfe184d.jpg", path: "edm" },
];

function HomeMusic() {
    const navigate = useNavigate();

  return (
    <>
        <div>
            <h2 className="music-box-title">Trạm phát nhạc</h2>
            <p className="music-box-desc">"Click vào để xem chi tiết"</p>
        </div>
        
        <div className="row">
            {musicData.map((item, index) => (
            <div className="col-xl-2 col-lg-3 col-md-3 col-sm-12 col-12 " key={index} onClick={() => navigate(`/music/${item.path}`)}>
                <div className="card">
                    <img src={item.image} className="card-img-top" alt={item.title} />
                    <div className="card-body">
                        <h5 className="card-title">{item.title}</h5>
                    </div>
                </div>
            </div>
            ))}
        </div>
    </>
   )
}

export default HomeMusic;