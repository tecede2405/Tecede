import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";
import "swiper/css";
import "animate.css";

// Đã xóa import useNavigate ở trên và dòng const navigate = useNavigate(); ở dưới
const AutoSlideInfinite = ({ items, onItemClick }) => {
  return (
    <div style={{ maxWidth: '100vw', overflow: 'hidden', margin: 'auto', paddingLeft: '10px', paddingRight: '0px' }}>
      <Swiper
        modules={[Autoplay]}
        spaceBetween={15}
        slidesPerView={8}
        loop={true}
        autoplay={{
          delay: 2000,
          disableOnInteraction: false,
          pauseOnMouseEnter: true,
        }}
        speed={800}
        breakpoints={{
          1170: { slidesPerView: 5.5 },
          960: { slidesPerView: 4.5 },
          768: { slidesPerView: 3.5 },
          540: { slidesPerView: 3.5 },
          430: { slidesPerView: 3.5 },
          0: { slidesPerView: 2.5 },
        }} 
      >
        {items.map((item) => (
          <SwiperSlide key={item.image} className="card-music">
            <img
              src={item.image}
              alt={item.title}
              loading="lazy"
              style={{ width: "100%", aspectRatio: "1 / 1", objectFit: "cover", cursor: "pointer" }}
              className="card-img animate__animated animate__fadeIn"
              onClick={() => onItemClick?.(item.path)}
            />
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
};

export default AutoSlideInfinite;