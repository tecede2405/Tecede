import { useNavigate } from "react-router-dom";
import { Swiper, SwiperSlide } from "swiper/react";
import { FreeMode } from "swiper/modules";
import { FaFilm } from "react-icons/fa";
import "swiper/css";
import "swiper/css/free-mode";


const moods = [
  {
    id: 1,
    title: "Hàn Quốc",
    desc: "Dữ lắm à nghe :))",
    path: "/quoc-gia/han-quoc",
    image: "https://phimimg.com/upload/vod/20260116-1/92ad3288f61736574a2a2dd3c4ee5df1.jpg"
  },
  {
    id: 2,
    title: "Trung Quốc",
    desc: "Cũng cũng :(",
    path: "/quoc-gia/trung-quoc",
    image: "https://phimimg.com/upload/vod/20260307-1/81572d43eddf1dc784f3f53f6323f46d.jpg"
  },
   {
    id: 3,
    title: "Phim Rạp",
    desc: "Bình tĩnh ní!",
    path: "/detail/cinematic",
    image: "https://phimimg.com/upload/vod/20260601-1/a93bfd52980655de0571d55d9c9f2440.jpg"
  },
  {
    id: 4,
    title: "Anime",
    desc: "Vài bộ điển hình",
    path: "/detail/anime",
    image: "https://phimimg.com/upload/vod/20240310-1/d61250d0c1670917fd783a1b48cbb29c.jpg"
  },
    {
    id: 5,
    title: "Conan",
    desc: "Ghê ta Zzz",
    path: "/search/conan",
    image : "https://phimimg.com/upload/vod/20240310-1/2a39971cc29c2802259b918eb437a45b.jpg"
  },
  {
    id: 6,
    title: "Doraemon",
    desc: "Chồn xanh hôi @",
    path: "/search/doraemon",
    image: "https://phimimg.com/upload/vod/20250521-1/0514f6f2eef84b1340afd31c42574a2d.jpg"
  },
  {
    id: 7,
    title: "Tình Cảm",
    desc: "Biết ngay mà!",
    path: "/the-loai/tinh-cam",
    image: "https://phimimg.com/upload/vod/20251214-1/a1eeff4565e08bb8e8f31599d8cd266c.jpg"
  },
  {
    id: 8,
    title: "Kinh Dị",
    desc: "Ê nha?",
    path: "/the-loai/kinh-di",
    image: "https://phimimg.com/upload/vod/20240113-1/c67512bfff50710dce3edd058e23b9aa.jpg"
  },

  {
    id: 9,
    title: "Dragon Ball",
    desc: "7 viên bi rồng",
    path: "/search/dragon-ball",
    image: "https://phimimg.com/upload/vod/20240827-1/bb3064e92aa97d20827be521bc6da879.jpg"
  }
];

function GenreCarousel() {
  const navigate = useNavigate();

  return (
    <div className="genre-carousel mb-3">
      <h2 className="film-category ms-3 mb-3">
        <FaFilm className="film-category__icon" />
        <span>Có thể bạn quan tâm</span>
      </h2>

      <Swiper
        modules={[FreeMode]}
        spaceBetween={12}
        slidesPerView="auto"
        freeMode
      >
        {moods.map(item => (
          <SwiperSlide key={item.id}>
            <div
              className="genre-carousel__card"
              onClick={() => navigate(item.path)}
            >
              <div className="genre-carousel__bg">
                <img src={item.image} alt={item.title} />
              </div>
              <div className="genre-carousel__overlay" />
              
              <div className="genre-carousel__content">
                <h3 className="genre-carousel__card-title">
                  {item.title}
                </h3>
                <p className="genre-carousel__card-desc">
                  {item.desc}
                </p>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}

export default GenreCarousel;
