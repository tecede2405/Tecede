import { useState, useEffect } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { EffectFade } from "swiper/modules";
import FilmSearch from "../HomeFilm/FilmSearch";
import MovieSlide from "./MovieSlide";
import "swiper/css";
import "swiper/css/effect-fade";

import { useMovies } from "../../context/MoviesContext";
import "./style.scss";


const MovieRow = () => {
  const { grouped, loading } = useMovies();

  const [activeIndex, setActiveIndex] = useState(0);
  const [width, setWidth] = useState(window.innerWidth);

  const movies = grouped["phim-hot"] || [];

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
          zIndex: 9999,
        }}
      >
        <FilmSearch fullWidth />
      </div>

      <div className="cinemaHeroRow__viewport">
       {loading ? (
            <div className="cinemaHeroSkeletonReal">
              {/* backdrop */}
              <div className="skeleton-backdrop" />

              <div className="skeleton-layout">
                {/* poster */}
                <div className="skeleton-poster shimmer" />

                {/* content */}
                <div className="skeleton-content">
                  <div className="skeleton-title shimmer" />

                  <div className="skeleton-tags">
                    <div className="tag shimmer" />
                    <div className="tag shimmer" />
                  </div>

                  <div className="skeleton-desc">
                    <div className="line shimmer" />
                    <div className="line shimmer" />
                    <div className="line shimmer short" />
                  </div>

                  <div className="skeleton-btn shimmer" />
                </div>
              </div>
            </div>
          ) : (
          <>
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
              {movies.map((movie, index) => (
                <SwiperSlide key={index}>
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
          </>
        )}
      </div>
    </section>
  );
};

export default MovieRow;