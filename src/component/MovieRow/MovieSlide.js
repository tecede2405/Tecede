import { useState } from "react"; 
import { useNavigate } from "react-router-dom";
import { FaPlay } from "react-icons/fa";
import "./style.scss";

const MovieSlide = ({ movie }) => {
  const navigate = useNavigate();

  // state kiểm tra video load xong chưa
  const [videoLoaded, setVideoLoaded] = useState(false);

  function Tag({ text, color }) {
  if (!text) return null;
  return (
    <span
      className="film-info-tag"
      style={{ borderLeft: color ? `5px solid ${color}` : "1px solid #444" }}
    >
      {text}
    </span>
  );
}
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
            <Tag text={movie.episode_current} color="#d31709" />
            <Tag text={movie.lang} color="#09d31a" />
          </div>

          <p className="cinemaHeroCard__overview">
            {movie.content}
          </p>

          <button
            className="cinemaHeroCard__playBtn"
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/chi-tiet/${movie.path}`);
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