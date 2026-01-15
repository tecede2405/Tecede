import React from "react";
import { useNavigate } from "react-router-dom";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";
import "swiper/css";
import "./style.scss";

const CinemaHeroCarousel = ({ items = [] }) => {
  const navigate = useNavigate();

  return (
    <div className="hero-carousel">
      <Swiper
        modules={[Autoplay]}
        loop
        autoplay={{ delay: 3500, pauseOnMouseEnter: true }}
        speed={900}
        spaceBetween={16}
        breakpoints={{
          0: { slidesPerView: 2.5 },
          768: { slidesPerView: 3.2 },
          1024: { slidesPerView: 4 },
        }}
      >
        {items.map((item, idx) => (
          <SwiperSlide key={idx}>
            <div
              className="hero-card"
              onClick={() => navigate(`/film/${item.path}`)}
            >
              {/* THUMB 3:4 */}
              <div className="hero-card__thumb-wrap">
                <img
                  src={item.thumb || item.image}
                  alt={item.title}
                  className="hero-card__thumb"
                />
              </div>

              {/* POSTER 2:3 ĐÈ */}
              <img
                src={item.poster || item.image}
                alt={item.title}
                className="hero-card__poster"
              />

              {/* TITLE */}
              <div className="hero-card__detail">
                <h6 className="film-card__title">{item.title}</h6>
                <p className="film-card__episode">
                {item.time || item.episode_current}
                </p>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
};

export default CinemaHeroCarousel;
