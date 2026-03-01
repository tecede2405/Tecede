import { useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { EffectFade } from "swiper/modules";

import MovieSlide from "./MovieSlide";

import "swiper/css";
import "swiper/css/effect-fade";
import "./style.scss";

import { HotFilm2 } from "../../data/dataFilm";

const movies = HotFilm2;

const MovieRow = () => {

  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <section className="cinemaHeroRow">

        <div className="cinemaHeroRow__viewport">
          <Swiper
            className="cinemaHeroRow__swiper"
            modules={[EffectFade]}
            slidesPerView={1}
            effect="fade"
            speed={600}
            fadeEffect={{ crossFade: true }}
            onSlideChange={(swiper) =>
              setActiveIndex(swiper.activeIndex)
            }
          >
            {movies.map((movie) => (
              <SwiperSlide key={movie.id}>
                <MovieSlide movie={movie} />
              </SwiperSlide>
            ))}
          </Swiper>

          <div className="cinemaHeroRow__progress">
            {movies.map((_, index) => (
              <span
                key={index}
                className={`cinemaHeroRow__progressDot ${
                  index === activeIndex ? "active" : ""
                }`}
              />
            ))}
          </div>
        </div>

      </section>
  );
};

export default MovieRow;