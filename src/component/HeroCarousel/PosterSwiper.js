import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";

export default function PosterSwiper({
  data,
  active,
  setActive,
  isMobile,
  isTablet,
}) {
  return (
    <Swiper
      slidesPerView={isMobile ? 7 : isTablet ? 5 : 7}
      spaceBetween={isMobile ? 8 : 10}
    >
      {data.map((item, index) => (
        <SwiperSlide key={index}>
          <img
            src={item.image}
            alt={item.title}
            onClick={() => setActive(item)}
            style={{
              width: isMobile ? "35px" : "60px",
              height: isMobile ? "35px" : "80px",
              objectFit: "cover",
              borderRadius: isMobile ? "50%" : "6px",
              cursor: "pointer",
              border:
                active?.title === item.title
                  ? "2px solid #fff"
                  : "1px solid rgba(255,255,255,.25)",
              transition: "transform .2s ease, box-shadow .2s ease",
            }}
          />
        </SwiperSlide>
      ))}
    </Swiper>
  );
}
