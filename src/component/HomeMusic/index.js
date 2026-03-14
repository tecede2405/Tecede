import MusicCarousel from "../Carousel/MusicCarousel";
import { MdLibraryMusic } from "react-icons/md";
import "./homemusic.scss";

const musicData = [
    {title: "mood", image: "https://res.cloudinary.com/djzeqinsn/image/upload/v1768119861/mood_flxfii.png", path: "mood"},
    {title: "nhacdouyin", image: "https://res.cloudinary.com/dx4nlqvvk/image/upload/v1773493340/Picsart_25-09-04_14-09-56-125_qy6tua_juryss.jpg", path: "nhac-douyin"},
    {title: "nhactre", image: "https://res.cloudinary.com/dx4nlqvvk/image/upload/v1773493341/nhactre_owqjpc_a2dp6s.png", path: "nhac-tre"},
    {title: "usuk", image: "https://res.cloudinary.com/dx4nlqvvk/image/upload/v1773493341/usuk_i6ji2d_vz1dib.png", path: "usuk"},
    {title: "china", image: "https://res.cloudinary.com/dx4nlqvvk/image/upload/v1773493343/china_bv9coi_yuixxd.png", path: "trung-quoc"},
    {title: "nhactreremix", image: "https://res.cloudinary.com/dx4nlqvvk/image/upload/v1773493339/nhactreremix_qr4zfl_dfuc77.png", path: "nhactre-remix"},
    {title: "edm", image: "https://res.cloudinary.com/dx4nlqvvk/image/upload/v1773493343/edm_dd12g9_cy8qzu.png", path: "edm"},
    {title: "phonk", image: "https://res.cloudinary.com/dx4nlqvvk/image/upload/v1773493341/phonk_pngw79_nszgll.png", path: "phonk"},
    {title: "nhac-lofi", image: "https://res.cloudinary.com/dx4nlqvvk/image/upload/v1773493342/jelly-lofi2_ipmoiv_uu3pp5.jpg", path: "nhac-lofi"},
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