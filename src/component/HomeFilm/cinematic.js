import MusicCarousel from "../Carousel/FilmCarousel";
import 'animate.css';
const filmData = [
    {title: "Mai", image: "https://ik.imagekit.io/yuki/20240423-1/7b281d88350fd638d84dc9abb5b6b0a6.jpg", path: "mai-2024"},
    {title: "Cám", image: "https://ik.imagekit.io/yuki/20250302-1/95297d8023e0e6cca061455cdc22cef0.jpg", path: "cam"},
    {title: "Ma Da", image: "https://ik.imagekit.io/yuki/20241116-1/e851bfbfc2dc5b2f9463571e5fba6734.jpg", path: "ma-da"},
    {title: "Doraemon", image: "https://phimimg.com/upload/vod/20250827-1/f4c07090d886ae98ebfb1f9222ace35f.jpg", path: "doraemon-nobita-va-cuoc-phieu-luu-vao-the-gioi-trong-tranh"},
    {title: "Làm Giàu Với Ma", image: "https://ik.imagekit.io/yuki/20250323-1/1b5a22c27996cde1f32b19c449853063.jpg", path: "lam-giau-voi-ma"},
    {title: "Quỷ Cẩu", image: "https://ik.imagekit.io/yuki/20240322-1/58433028cb27b24a08795cce603c8a36.jpg", path: "quy-cau"},
    {title: "Nhà Gia Tiên", image: "https://ik.imagekit.io/yuki/20250710-1/5af1cd558e89eb88b67d72181906edac.jpg", path: "nha-gia-tien"},
    {title: "Kẻ Ăn Hồn", image: "https://ik.imagekit.io/yuki/20240315-1/ae6b750d852646a5c94eb3873d5e7c78.jpg", path: "ke-an-hon"},
    {title: "Doraemon", image: "https://phimimg.com/upload/vod/20250521-1/3b5ed51c3fb1dca303cfedbbfd59c904.jpg", path: "doraemon-nobita-va-ban-giao-huong-dia-cau"},
    {title: "Bộ Tứ Báo Thủ", image: "https://ik.imagekit.io/yuki/20250901-1/4094cc857ac6a13df6eef22ad8b1ae1d.jpg", path: "bo-tu-bao-thu"},
    {title: "Âm Dương Lộ", image: "https://ik.imagekit.io/yuki/20250627-1/8db220cf033fde5a5929b285fe3789ba.jpg", path: "am-duong-lo"},
    {title: "Na Tra 2", image: "https://phimimg.com/upload/vod/20250206-1/064c6f42c1fccb7ef286ec367ff95212.jpg", path: "na-tra-2-ma-dong-nao-hai"},
    {title: "Thám Tử Kiên: Kỳ Án Không Đầu", image: "https://ik.imagekit.io/yuki/20251010-1/d5236005ee6df744aa5417cf5231f167.jpg", path: "tham-tu-kien-ky-an-khong-dau"},
    {title: "Đèn Âm Hồn", image: "https://ik.imagekit.io/yuki/20250811-1/8ca2d150e780388fe74689641e4e12b2.jpg", path: "den-am-hon"},
    {title: "Bố Già", image: "https://ik.imagekit.io/yuki/20250119-1/78ea9e50373b3ac2e51a8fa6b147984f.jpg", path: "bo-gia-2021"},
    {title: "Thám Tử Lừng Danh Conan 28: Dư Ảnh Của Độc Nhãn", image: "https://ik.imagekit.io/yuki/20250827-1/aabb76a70d8afd21ddf2be37381c7587.jpg", path: "tham-tu-lung-danh-conan-28-du-anh-cua-doc-nhan"},
    {title: "attack on titan", image: "https://ik.imagekit.io/yuki/20250419-1/50cf359f6ed6307597fc160044132ac3.jpg", path: "dai-chien-nguoi-khong-lo-lan-tan-cong-cuoi-cung"},
    {title: "Thanh Gươm Diệt Quỷ", image: "https://ik.imagekit.io/yuki/20250722-1/66ee196318069c6ede9450a5f76a4648.jpg", path: "thanh-guom-diet-quy-vo-han-thanh"},
];

function CinematicFilm() {


  return (
    <>
        <div className="mb-1">
            <h2 className="music-box-title">Phim Chiếu Rạp</h2>
        </div>
        <div className="container mt-1 mb-5">
            <MusicCarousel items={filmData} />
        </div>  
    </>
   )
}

export default CinematicFilm;