import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaPlay } from "react-icons/fa";
import "./style.scss";

const MovieSlide = ({ movie }) => {
  const navigate = useNavigate();

  // state kiểm tra video load xong chưa
  const [videoLoaded, setVideoLoaded] = useState(false);

  return (
    <div className="cinemaHeroCard">

      {/* BACKGROUND */}
      <div className="cinemaHeroCard__backdrop">

        {/* VIDEO nếu có */}
        {movie.video && (
          <video
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
            className="cinemaHeroCard__video"
            poster={movie.thumb}
            onLoadedData={() => setVideoLoaded(true)}
            onError={() => setVideoLoaded(false)}
          >
            <source src={movie.video} type="video/mp4" />
          </video>
        )}

        {/* IMAGE fallback (giữ logic cũ) */}
        <img
          src={movie.thumb}
          alt={movie.title}
          loading="lazy"
          className="cinemaHeroCard__image"
          style={{
            opacity: videoLoaded ? 0 : 1
          }}
        />

      </div>

      {/* CONTENT */}
      <div className="cinemaHeroCard__layout">

        <div className="cinemaHeroCard__poster">
          <img src={movie.image} alt={movie.title} />
        </div>

        <div className="cinemaHeroCard__info">

          <h3 className="cinemaHeroCard__title">
            {movie.title}
          </h3>

          <p className="cinemaHeroCard__origin_name">
            {movie.origin_name}
          </p>

          <div className="cinemaHeroCard__meta">
            <span className="cinemaHeroCard__tag">
              {movie.episode_current}
            </span>

            <span className="cinemaHeroCard__lang">
              {movie.lang}
            </span>
          </div>

          <p className="cinemaHeroCard__overview">
            {movie.content}
          </p>

          <button
            className="cinemaHeroCard__playBtn"
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/film/${movie.path}`);
            }}
          >
            <FaPlay />
            <span>Xem ngay</span>
          </button>

        </div>
      </div>
    </div>
  );
};

export default MovieSlide;