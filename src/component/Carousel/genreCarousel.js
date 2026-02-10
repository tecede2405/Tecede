import { useNavigate } from "react-router-dom";
import { Swiper, SwiperSlide } from "swiper/react";
import { FreeMode } from "swiper/modules";
import "swiper/css";
import "swiper/css/free-mode";


const moods = [
  {
    id: 1,
    title: "Hàn Quốc",
    desc: "Dữ lắm à nghe :))",
    path: "/quoc-gia/han-quoc",
    color: "#5B3CC4"
  },
  {
    id: 2,
    title: "Trung Quốc",
    desc: "Cũng cũng :(",
    path: "/quoc-gia/trung-quoc",
    color: "#E91E63"
  },
  {
    id: 3,
    title: "Anime",
    desc: "Vài bộ điển hình",
    path: "/detail/anime",
    color: "#6C5CE7"
  },
    {
    id: 4,
    title: "Conan",
    desc: "Ghê ta Zzz",
    path: "/search/conan",
    color: "#FF9800"
  },
  
   {
    id: 5,
    title: "Phim Rạp",
    desc: "Bình tĩnh nồ!",
    path: "/detail/cinematic",
    color: "#6C5CE7"
  },
  {
    id: 6,
    title: "Doraemon",
    desc: "Chồn xanh hôi @",
    path: "/search/doraemon",
    color: "#6C5CE7"
  },
  {
    id: 7,
    title: "Tình Cảm",
    desc: "Biết ngay mà!",
    path: "/the-loai/tinh-cam",
    color: "#2196F3"
  },
  {
    id: 8,
    title: "Kinh Dị",
    desc: "Ê nha?",
    path: "/the-loai/kinh-di",
    color: "#4CAF50"
  },

  {
    id: 9,
    title: "Dragon Ball",
    desc: "7 viên bi rồng",
    path: "/search/dragon-ball",
    color: "#D63031"
  }
];

function GenreCarousel() {
  const navigate = useNavigate();

  return (
    <div className="genre-carousel">
      <h3 className="genre-carousel__title ms-3">
        Có Thể Bạn Quan Tâm
      </h3>

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
              style={{
                background: `linear-gradient(135deg, ${item.color}, #00000080)`
              }}
              onClick={() => navigate(item.path)}
            >
              <h3 className="genre-carousel__card-title">
                {item.title}
              </h3>
              <p className="genre-carousel__card-desc">
                {item.desc}
              </p>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}

export default GenreCarousel;
