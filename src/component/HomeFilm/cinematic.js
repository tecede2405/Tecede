import MusicCarousel from "../Carousel/FilmCarousel";
import 'animate.css';
const musicData = [
    {title: "Quỷ Cẩu", image: "https://ik.imagekit.io/yuki/20240322-1/58433028cb27b24a08795cce603c8a36.jpg", path: "quy-cau"},
    {title: "Kẻ Ăn Hồn", image: "https://ik.imagekit.io/yuki/20240315-1/ae6b750d852646a5c94eb3873d5e7c78.jpg", path: "ke-an-hon"},
    {title: "Bộ Tứ Báo Thủ", image: "https://ik.imagekit.io/yuki/20250901-1/4094cc857ac6a13df6eef22ad8b1ae1d.jpg", path: "bo-tu-bao-thu"},
    {title: "Thám Tử Kiên: Kỳ Án Không Đầu", image: "https://ik.imagekit.io/yuki/20251010-1/d5236005ee6df744aa5417cf5231f167.jpg", path: "tham-tu-kien-ky-an-khong-dau"},
    {title: "Thám Tử Lừng Danh Conan 28: Dư Ảnh Của Độc Nhãn", image: "https://ik.imagekit.io/yuki/20250827-1/aabb76a70d8afd21ddf2be37381c7587.jpg", path: "tham-tu-lung-danh-conan-28-du-anh-cua-doc-nhan"},
    {title: "attack on titan", image: "https://ik.imagekit.io/yuki/20250419-1/50cf359f6ed6307597fc160044132ac3.jpg", path: "dai-chien-nguoi-khong-lo-lan-tan-cong-cuoi-cung"},
    {title: "Thanh Gươm Diệt Quỷ", image: "https://ik.imagekit.io/yuki/20250722-1/66ee196318069c6ede9450a5f76a4648.jpg", path: "thanh-guom-diet-quy-vo-han-thanh"},
];

function CinematicFilm() {


  return (
    <>
        <div>
            <h2 className="music-box-title">Phim Chiếu Rạp</h2>
        </div>
        <div className="container mt-4 mb-5">
            <MusicCarousel items={musicData} />
        </div>  
    </>
   )
}

export default CinematicFilm;