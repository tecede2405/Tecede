import FilmCarousel from "../Carousel/FilmCarousel";
import { GoChevronRight } from "react-icons/go";
import 'animate.css';
const filmData = [
    {title: "Mai", image: "https://ik.imagekit.io/yuki/20240423-1/7b281d88350fd638d84dc9abb5b6b0a6.jpg",thumb:"https://phimimg.com/upload/vod/20240423-1/afb71c134b82ad08f21b8d9127c70fc6.jpg", path: "mai-2024",time: "131 phút"},
    {title: "Cám", image: "https://ik.imagekit.io/yuki/20250302-1/95297d8023e0e6cca061455cdc22cef0.jpg",thumb:"https://phimimg.com/upload/vod/20250302-1/887291d6f943171d2815f048130232dd.jpg",  path: "cam",time: "122 phút"},
    {title: "Ma Da", image: "https://ik.imagekit.io/yuki/20241116-1/e851bfbfc2dc5b2f9463571e5fba6734.jpg", thumb:"https://phimimg.com/upload/vod/20241116-1/3747ec0cb2bbc3679512ef163621eefc.jpg", path: "ma-da",time: "195 phút"},
    {title: "Zootopia 2", image: "https://phimimg.com/upload/vod/20251223-1/6bc1d549b86e490274d93bab66a3654d.jpg",thumb:"https://phimimg.com/upload/vod/20251223-1/7154384c306c73664e46942f2477e574.jpg", path: "phi-vu-dong-troi-2",time: "107 phút"},
    {title: "Năm Đêm Kinh Hoàng 2", image: "https://phimimg.com/upload/vod/20251224-1/19bd1d17add0685b3a437160f5406c46.jpg", thumb:"https://phimimg.com/upload/vod/20251224-1/4e07f16d1802064c5170b4ec4d55432d.jpg", path: "nam-dem-kinh-hoang-2",time: "104 phút"},
    {title: "Doraemon Movie 44", image: "https://phimimg.com/upload/vod/20250827-1/f4c07090d886ae98ebfb1f9222ace35f.jpg", thumb:"https://phimimg.com/upload/vod/20250827-1/94183f061625e5155a274c0394d5cafb.jpg", path: "doraemon-nobita-va-cuoc-phieu-luu-vao-the-gioi-trong-tranh",time: "131 phút"},
    {title: "Avatar: Lửa và Tro Tàn", image: "https://phimimg.com/upload/vod/20251221-1/687373bb9894616507f27c74c0eaa598.jpg", thumb:"https://phimimg.com/upload/vod/20251221-1/6ac9fcafbe963ce8fbae6aaffb3d642e.jpg", path: "avatar-lua-va-tro-tan",time: "198 phút"},
    {title: "Làm Giàu Với Ma", image: "https://ik.imagekit.io/yuki/20250323-1/1b5a22c27996cde1f32b19c449853063.jpg", thumb:"https://phimimg.com/upload/vod/20250323-1/5c8b4a2c724d8cbee887c0b90767633d.jpg", path: "lam-giau-voi-ma",time: "105 phút"},
    {title: "Quỷ Cẩu", image: "https://ik.imagekit.io/yuki/20240322-1/58433028cb27b24a08795cce603c8a36.jpg", thumb:"https://phimimg.com/upload/vod/20240322-1/fc17321c17a27bd34865d93ac404e22f.jpg", path: "quy-cau",time: "99 phút"},
    {title: "Nhà Gia Tiên", image: "https://ik.imagekit.io/yuki/20250710-1/5af1cd558e89eb88b67d72181906edac.jpg", thumb:"https://phimimg.com/upload/vod/20250710-1/3024e503f4c8cecdb0578c20c77e4cdf.jpg", path: "nha-gia-tien",time: "117 phút"},
    {title: "Kẻ Ăn Hồn", image: "https://ik.imagekit.io/yuki/20240315-1/ae6b750d852646a5c94eb3873d5e7c78.jpg", thumb:"https://phimimg.com/upload/vod/20240315-1/2c151504adb279ed692b550c7b7bb94b.jpg", path: "ke-an-hon",time: "109 phút"},
    {title: "Doraemon Movie 43", image: "https://phimimg.com/upload/vod/20250521-1/3b5ed51c3fb1dca303cfedbbfd59c904.jpg", thumb:"https://phimimg.com/upload/vod/20250521-1/0514f6f2eef84b1340afd31c42574a2d.jpg", path: "doraemon-nobita-va-ban-giao-huong-dia-cau",time: "115 phút"},
    {title: "Bộ Tứ Báo Thủ", image: "https://ik.imagekit.io/yuki/20250901-1/4094cc857ac6a13df6eef22ad8b1ae1d.jpg", thumb:"https://phimimg.com/upload/vod/20250901-1/40e4f404d92151d8d44fc878fd20cf64.jpg", path: "bo-tu-bao-thu",time: "133 phút"},
    {title: "Chainsaw Man: Reze", image: "https://phimimg.com/upload/vod/20251209-1/69d2d97349877280293f7c1ccc9efdb4.jpg", thumb:"https://phimimg.com/upload/vod/20251209-1/c3096886a37e19947c1b6758f7b8829f.jpg", path: "chainsaw-man-the-movie-chuong-reze",time: "100 phút"},
    {title: "Âm Dương Lộ", image: "https://ik.imagekit.io/yuki/20250627-1/8db220cf033fde5a5929b285fe3789ba.jpg", thumb:"https://phimimg.com/upload/vod/20250627-1/2cb1650856ea766b21df3d6f86ccdd07.jpg", path: "am-duong-lo",time: "119 phút"},
    {title: "Na Tra 2", image: "https://phimimg.com/upload/vod/20250206-1/064c6f42c1fccb7ef286ec367ff95212.jpg", thumb:"https://phimimg.com/upload/vod/20250206-1/51d98f9d8a4bdc053173b0925924c616.jpg", path: "na-tra-2-ma-dong-nao-hai",time: "144 phút"},
    {title: "Thám Tử Kiên", image: "https://ik.imagekit.io/yuki/20251010-1/d5236005ee6df744aa5417cf5231f167.jpg", thumb:"https://phimimg.com/upload/vod/20251010-1/3c95bc59bc3c37fc3fb76e27b156d1bf.jpg", path: "tham-tu-kien-ky-an-khong-dau",time: "131 phút"},
    {title: "Đèn Âm Hồn", image: "https://ik.imagekit.io/yuki/20250811-1/8ca2d150e780388fe74689641e4e12b2.jpg", thumb:"https://phimimg.com/upload/vod/20250811-1/4fa0782db6f3b1e89c270e38d90b9b00.jpg", path: "den-am-hon",time: "101 phút"},
    {title: "Bố Già", image: "https://ik.imagekit.io/yuki/20250119-1/78ea9e50373b3ac2e51a8fa6b147984f.jpg", thumb:"https://phimimg.com/upload/vod/20250119-1/f42aefe12ee48db50ee7c465efb85798.jpg", path: "bo-gia-2021",time: "128 phút"},
    {title: "Conan Movie 28", image: "https://ik.imagekit.io/yuki/20250827-1/aabb76a70d8afd21ddf2be37381c7587.jpg", thumb:"https://phimimg.com/upload/vod/20250827-1/eddefbf4813488f89a6f0c766f69f82f.jpg", path: "tham-tu-lung-danh-conan-28-du-anh-cua-doc-nhan",time: "109 phút"},
    {title: "The Last Attack", image: "https://ik.imagekit.io/yuki/20250419-1/50cf359f6ed6307597fc160044132ac3.jpg", thumb:"https://phimimg.com/upload/vod/20250419-1/5592e992bf3e556c9660f30d058dce71.jpg", path: "dai-chien-nguoi-khong-lo-lan-tan-cong-cuoi-cung",time: "145 phút"},
    {title: "Vô Hạn Thành", image: "https://ik.imagekit.io/yuki/20250722-1/66ee196318069c6ede9450a5f76a4648.jpg", thumb:"https://phimimg.com/upload/vod/20250722-1/16ea0557ca40cd54a3d25c6750a65c0b.jpg", path: "thanh-guom-diet-quy-vo-han-thanh",time: "155 phút"},
];

function CinematicFilm() {


  return (
    <>
        <div className="mb-1">
            <h2 className="film-category ms-3">Phim Chiếu Rạp <GoChevronRight /></h2>
        </div>
        <div className="container mt-1 mb-1">
            <FilmCarousel items={filmData} />
        </div>  
    </>
   )
}

export default CinematicFilm;