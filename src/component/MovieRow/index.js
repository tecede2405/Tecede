import { useState, useEffect } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { EffectFade } from "swiper/modules";
import FilmSearch from "../HomeFilm/FilmSearch";
import MovieSlide from "./MovieSlide";
import "swiper/css";
import "swiper/css/effect-fade";
import "./style.scss";

import { HotFilm } from "../../data/dataFilm";

const movies = HotFilm;

const MovieRow = () => {

  const [activeIndex, setActiveIndex] = useState(0);
  const [width, setWidth] = useState(window.innerWidth);



  useEffect(() => {
    const onResize = () => setWidth(window.innerWidth);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);


  const isMobile = width < 525;
  const isTablet = width >= 525 && width < 1024;

  return (
    <section className="cinemaHeroRow">
        <div
          style={{
            position: "absolute",
            top: "7%",
            left: isMobile ? "0px" : isTablet ? "16px" : "60px",
            width: isMobile ? "100%" : "600px",
            zIndex: 9999
          }}
        >
          <FilmSearch fullWidth/>
        </div>
        <div className="cinemaHeroRow__viewport">
          <Swiper
            className="cinemaHeroRow__swiper"
            modules={[EffectFade]}
            slidesPerView={1}
            effect="fade"
            loop={true}
            speed={600}
            fadeEffect={{ crossFade: true }}
            onSlideChange={(swiper) =>
              setActiveIndex(swiper.realIndex)
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