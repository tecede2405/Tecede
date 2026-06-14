import MusicCarousel from "../Carousel/MusicCarousel";
import { MdLibraryMusic } from "react-icons/md";
import "./homemusic.scss";
// 1. Import useAuth và Swal để chặn quyền truy cập
import { useAuth } from "../../context/AuthContext";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";

const musicData = [
    {title: "mood", image: "https://i.ibb.co/tpQF1yq5/85ea2a41bcba853ca1656f17b54d6a71.webp", path: "mood"},
    {title: "nhacdouyin", image: "https://i.ibb.co/XZBqqxPT/bb95fae35b14b87ed5d6d2d15791e3f2.webp", path: "nhac-douyin"},
    {title: "nhactre", image: "https://i.ibb.co/KcWRC4Xr/f8067e4d176cf42261c0b2789a1a1035.webp", path: "nhac-tre"},
    {title: "usuk", image: "https://i.ibb.co/V0Cc13KY/1a5d4aca0654d716f9ec965dbafc8bf2.webp", path: "usuk"},
    {title: "china", image: "https://i.ibb.co/20Jr4KNf/9cb9409ff6db5a3e70ca628f2be2b3ee.webp", path: "trung-quoc"},
    {title: "nhactreremix", image: "https://i.ibb.co/nNXDCBDW/z6742344336920-1eae53132a29744632a92d96486d4a9c.webp", path: "nhactre-remix"},
    {title: "edm", image: "https://i.ibb.co/F4z8B0ST/6659861e5f2cb99d7a210d2b258ec8f5.webp", path: "edm"},
    {title: "phonk", image: "https://i.ibb.co/YBKJGt8X/z6731791091720-ce92821376e7f43bbbf76879ac9f07e3.webp", path: "phonk"},
    {title: "nhac-lofi", image: "https://i.ibb.co/rjFJn7H/z7604161484626-99ee66797819706db71be74a68b02785.webp", path: "nhac-lofi"},
];

function HomeMusic() {
  const { user } = useAuth();
  const navigate = useNavigate();

  // 2. Cấu hình DarkSwal với icon warning (!) và nút "OK sếp"
  const DarkSwal = Swal.mixin({
    background: "#1f1f1f",
    color: "#fff",
    confirmButtonColor: "#e50914",
    confirmButtonText: "OK sếp", 
    cancelButtonColor: "#444",
    customClass: {
      popup: "swal-dark",
      title: "swal-title",
      htmlContainer: "swal-text",
      confirmButton: "swal-confirm",
    },
    showClass: {
      popup: "animate__animated animate__fadeInDown"
    },
    hideClass: {
      popup: "animate__animated animate__fadeOutUp"
    }
  });

  // 3. Hàm xử lý khi người dùng click vào một item nhạc trên Carousel
  const handleMusicClick = (path) => {
    if (!user || user.role !== "admin") {
      // Nếu không phải admin, hiện thông báo chấm than vàng (!)
      DarkSwal.fire({
        icon: "error",
        title: "Oh no!",
        text: "Chỉ có Admin truy cập được trang này.",
        confirmButtonText: "OK sếp !",
        timer: 5000,
        showConfirmButton: true
      });
    } else {
      // Nếu là admin, cho phép chuyển hướng đến trang nhạc tương ứng
      navigate(`/music/${path}`);
    }
  };

  return (
    <>
      <div className="mb-1">
        <h2 className="film-category ms-3">
          Trạm Phát Nhạc <MdLibraryMusic />
        </h2>
      </div>
      <div className="container container-film mt-4 mb-2">
        {/* 4. Truyền hàm xử lý click xuống Carousel */}
        <MusicCarousel items={musicData} onItemClick={handleMusicClick} />
      </div>  
    </>
  );
}

export default HomeMusic;