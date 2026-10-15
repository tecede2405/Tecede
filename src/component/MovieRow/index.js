import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Swiper, SwiperSlide } from "swiper/react";
import FilmSearch from "../HomeFilm/FilmSearch";
import MovieSlide from "./MovieSlide";
import "swiper/css";
import "swiper/css/effect-fade";
import "swiper/css/effect-coverflow";
import { EffectFade, EffectCoverflow } from "swiper/modules";
import { useMovies } from "../../context/MoviesContext";
import { FaPlay, FaInfoCircle, FaFire } from "react-icons/fa"; 
import "./style.scss";

const MovieRow = () => {
  const { grouped, loading } = useMovies();
  const navigate = useNavigate();

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
  
  // Lấy thông tin phim đang active (chỉ dùng cho mobile)
  const activeMovie = movies[activeIndex];

  return (
    <section className="cinemaHeroRow">
      <div
        style={{
          position: "absolute",
          top: isMobile ? "25px" : "7%",
          left: isMobile ? "0px" : isTablet ? "16px" : "60px",
          width: isMobile ? "100%" : "600px",
          padding: isMobile ? "0 10px" : "0",
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
            {isMobile && activeMovie && (
              <div className="mobile-backdrop">
                <img 
                  src={activeMovie.thumb || activeMovie.image} 
                  alt="backdrop" 
                />
              </div>
            )}
            <Swiper
              key={isMobile ? "mobile" : "desktop"}
              className="cinemaHeroRow__swiper"
              modules={isMobile ? [EffectCoverflow] : [EffectFade]}
              slidesPerView={isMobile ? 1.6 : 1}
              centeredSlides={isMobile}
              effect={isMobile ? "coverflow" : "fade"}
              loop
              speed={400}
              grabCursor
              slideToClickedSlide={isMobile}
              observer={true}
              observeParents={true}
              coverflowEffect={{
                rotate: -28,
                stretch: 16,
                depth: 140,
                modifier: 1,
                scale: 0.85,
                slideShadows: false, 
              }}
              fadeEffect={{
                crossFade: true,
              }}
              onSlideChange={(swiper) => setActiveIndex(swiper.realIndex)}
            >
              {movies.map((movie, index) => (
                <SwiperSlide key={index}>
                {isMobile ? (
                  <div className="mobile-coverflow-card">
                    <img
                      src={movie.image}
                      alt={movie.title}
                    />
                  </div>
                ) : (
                  <MovieSlide movie={movie} />
                )}
              </SwiperSlide>
              ))}
            </Swiper>

            {/* HIỂN THỊ THÔNG TIN KHI Ở MOBILE (Nằm ngoài swiper) */}
            {isMobile && activeMovie && (
              <div className="mobile-active-info">
                {/* 1. Tên phim */}
                <h2 className="mobile-title">{activeMovie.title}</h2>
                {activeMovie.origin_name && (
                  <p className="mobile-origin">{activeMovie.origin_name}</p>
                )}

                {/* 2. Meta tags (Episode, Lang, Quality) đưa lên TRÊN nút bấm */}
                <div className="mobile-meta">
                  {activeMovie.episode_current && (
                    <span className="meta-tag episode-tag">
                      <FaFire className="tag-icon" /> {activeMovie.episode_current}
                    </span>
                  )}
                  {activeMovie.lang && (
                    <span className="meta-tag lang-tag">
                      {activeMovie.lang}
                    </span>
                  )}
                  {activeMovie.quality && (
                    <span className="meta-tag quality-tag">
                      {activeMovie.quality}
                    </span>
                  )}
                </div>

                {/* 3. Nút hành động: Xem ngay & Thông tin */}
                <div className="mobile-actions">
                  <button 
                    className="btn-play" 
                    onClick={() => navigate(`/chi-tiet/${activeMovie.path}`)}
                  >
                    <FaPlay /> Xem ngay
                  </button>
                  <button 
                    className="btn-info" 
                    onClick={() => navigate(`/chi-tiet/${activeMovie.path}`)}
                  >
                    <FaInfoCircle /> Thông tin
                  </button>
                </div>
              </div>
            )}

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