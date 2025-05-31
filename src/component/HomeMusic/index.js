
import MusicCarousel from "../Carousel/MusicCarousel";
import "./homemusic.scss";
import nhactre from "../../img/musics-thumbnail/nhactre.png";
import usuk from "../../img/musics-thumbnail/usuk.png";
import china from "../../img/musics-thumbnail/china.png";
import edm from "../../img/musics-thumbnail/edm.png";
import mood from "../../img/musics-thumbnail/mood.png";
import 'animate.css';
const musicData = [
    {title: "nhactre", image: nhactre, path: "nhac-tre"},
    {title: "usuk", image: usuk, path: "usuk"},
    {title: "china", image: china, path: "trung-quoc"},
    {title: "edm", image: edm, path: "edm"},
    {title: "mood", image: mood, path: "mood"},
];

function HomeMusic() {


  return (
    <>
        <div>
            <h2 className="music-box-title">Trạm phát nhạc</h2>
            <p className="music-box-desc">"Nhạc sẽ luôn được cập nhật thường xuyên. <br />Click vào để xem chi tiết"</p>
        </div>
        <div className="container mt-4 mb-5">
            <MusicCarousel items={musicData} />
        </div>  
    </>
   )
}

export default HomeMusic;