import React from "react";
import { useNavigate } from "react-router-dom";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";
import "swiper/css";
import "animate.css";



const AutoSlideInfinite = ({ items }) => {
  const navigate = useNavigate();

  return (
    <div style={{ maxWidth: '100vw', overflow: 'hidden', margin: 'auto',
     paddingLeft: '30px', paddingRight: '30px' }}>
      <Swiper
        modules={[Autoplay]}
        spaceBetween={15}
        slidesPerView={8}
        loop={true}               // Vô tận
        autoplay={{
          delay: 2000,            // 2 giây tự chuyển slide
          disableOnInteraction: false, // Tương tác vẫn chạy tiếp
          pauseOnMouseEnter: true,      // Hover tạm dừng
        }}
        speed={800}               // Tốc độ chuyển slide mượt
        breakpoints={{
          1170: { slidesPerView: 4.5 },
          960: { slidesPerView: 4.5 },
          768: { slidesPerView: 4.5 },
          540: { slidesPerView: 3.5 },
          430: { slidesPerView: 3.5 },
          0: { slidesPerView: 2.5 },
        }} 
      >
        {items.map((items ) => (
          <SwiperSlide key={items.image} className="card-music">
            <img
              src={items.image}
              alt={items.title}
              style={{
                width: "100%",
                aspectRatio: "1 / 1",
                objectFit: "cover",
              }}
              className="card-img animate__animated animate__fadeIn"
              onClick={() => navigate(`/music/${items.path}`)}
            />
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
};

export default AutoSlideInfinite;
