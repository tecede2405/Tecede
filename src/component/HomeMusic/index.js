import { useNavigate } from "react-router-dom"; 
import usuk from "../../img/usuk.png";
import "./homemusic.scss";
const musicData = [
    { title: "Nhạc Việt Nam", image: "https://i.pinimg.com/736x/86/c7/dc/86c7dcaa9beb798a43053bf6df6b25e5.jpg", path: "nhac-tre",desc: "Nhạc vui buồn lẫn lộn,cực kì đa dạng thể loại từ thời tối cổ đến hiện đại." },
    { title: "Nhạc USUK", image: usuk, path: "usuk",desc: "Khi âm nhạc là liều thuốc chữa lành, nghe bao chill." },
    { title: "Nhạc Trung Quốc", image: "https://i.pinimg.com/736x/2e/45/6f/2e456fd2c073b5e60f67c8eaf8ff6970.jpg", path: "trung-quoc",desc: "Giai điệu và lời nhạc cực kì hay dù nghe chả hiểu gì." },
    { title: "Nhạc EDM", image: "https://i.pinimg.com/originals/56/3a/56/563a56b106ea38b20d29c33a0cfe184d.jpg", path: "edm",desc: "Nhạc điện tử sôi động, cực kì thích hợp để nghe khi tập thể thao hoặc chiến game." },
    { title: "Nhạc Không Lời", image: "https://i.pinimg.com/736x/64/61/3e/64613e8d9d8c234ce4265ae13874b08d.jpg", path: "mood",desc: "Nhạc không lời giúp bạn thư giãn và tập trung hơn trong công việc." },
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
            <div className="row">
                {musicData.map((item, index) => (
                <div className="card-music col-xl-3 col-lg-4 col-md-3 col-sm-12 col-12 mb-4" key={index} onClick={() => navigate(`/music/${item.path}`)}>
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