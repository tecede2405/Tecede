import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, FreeMode } from "swiper/modules";

import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/free-mode";

import "./index.scss";

export default function FilmCarousel({ items = [], renderItem }) {
  if (!items.length) return null;

  return (
    <div className="film-carousel">
      <Swiper
        slidesPerView={3.2}
        spaceBetween={12}

        speed={350}

        freeMode={{
          enabled: true,
          momentum: true,
          momentumRatio: 1,
          momentumVelocityRatio: 1,
        }}

        touchRatio={1.3}

        longSwipes={true}
        longSwipesRatio={0.3}

        navigation
        grabCursor={window.innerWidth > 768}

        breakpoints={{
          480: {
            slidesPerView: 3.5,
            spaceBetween: 14
          },
          640: {
            slidesPerView: 4.2,
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

        modules={[Navigation, FreeMode]}
      >
        {items.map((item, index) => (
          <SwiperSlide key={item?.path || index}>
            {renderItem(item)}
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}