import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "./index.scss";

export default function FilmCarousel({ items = [], renderItem }) {
  if (!items.length) return null;

  return (
    <div className="film-carousel">
      <Swiper
        slidesPerView={3.2}
        spaceBetween={12}
        loop
        navigation
        grabCursor
        breakpoints={{
          480: {
            slidesPerView: 2.5,
            spaceBetween: 14
          },
          640: {
            slidesPerView: 3.2,
            spaceBetween: 16
          },
          768: {
            slidesPerView: 4,
            spaceBetween: 20
          },
          1024: {
            slidesPerView: 5,
            spaceBetween: 24
          },
          1280: {
            slidesPerView: 6,
            spaceBetween: 28
          }
        }}
        modules={[Navigation]}
      >
        {items.map((item, index) => (
          <SwiperSlide key={index}>
            {renderItem(item)}
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}
