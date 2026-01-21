import MusicCarousel from "../Carousel/MusicCarousel";
import { MdLibraryMusic } from "react-icons/md";
import "./homemusic.scss";

const musicData = [
    {title: "mood", image: "https://res.cloudinary.com/djzeqinsn/image/upload/v1768119861/mood_flxfii.png", path: "mood"},
    {title: "nhacdouyin", image: "https://res.cloudinary.com/djzeqinsn/image/upload/v1756970021/Picsart_25-09-04_14-09-56-125_qy6tua.jpg", path: "nhac-douyin"},
    {title: "nhactre", image: "https://res.cloudinary.com/djzeqinsn/image/upload/v1768119861/nhactre_owqjpc.png", path: "nhac-tre"},
    {title: "usuk", image: "https://res.cloudinary.com/djzeqinsn/image/upload/v1768119862/usuk_i6ji2d.png", path: "usuk"},
    {title: "china", image: "https://res.cloudinary.com/djzeqinsn/image/upload/v1768119864/china_bv9coi.png", path: "trung-quoc"},
    {title: "nhactreremix", image: "https://res.cloudinary.com/djzeqinsn/image/upload/v1768119860/nhactreremix_qr4zfl.png", path: "nhactre-remix"},
    {title: "edm", image: "https://res.cloudinary.com/djzeqinsn/image/upload/v1768119861/edm_dd12g9.png", path: "edm"},
    {title: "phonk", image: "https://res.cloudinary.com/djzeqinsn/image/upload/v1768119861/phonk_pngw79.png", path: "phonk"},
];

function HomeMusic() {

  return (
    <>
        <div className="mb-1">
        <h2 className="film-category ms-3">
          Trạm Phát Nhạc <MdLibraryMusic />
        </h2>
      </div>
        <div className="container container-film mt-4 mb-2">
            <MusicCarousel items={musicData} />
        </div>  
    </>
   )
}

export default HomeMusic;