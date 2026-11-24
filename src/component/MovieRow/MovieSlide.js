import { useState, useEffect } from "react"; 
import { useNavigate } from "react-router-dom";
import { FaPlay, FaInfoCircle, FaHeart, FaRegHeart, FaClosedCaptioning, FaLayerGroup } from "react-icons/fa";
import { useFavoriteToggle } from "../../hooks/useFavorites";
import { formatLangBadge } from "../../utils/formatLang";
import "./style.scss";

const MovieSlide = ({ movie }) => {
  const navigate = useNavigate();

  // state kiểm tra video load xong chưa
  const [videoLoaded, setVideoLoaded] = useState(false);

  // Hook quản lý yêu thích
  const { isFavorited, loading: favLoading, init: initFav, toggle: toggleFav } =
    useFavoriteToggle(movie?.path, movie?.title, movie?.image);

  useEffect(() => {
    if (movie?.path) initFav();
  }, [movie?.path, initFav]);

  function Tag({ text, type }) {
    if (!text) return null;
    const isLang = type === "lang";
    return (
      <span className={`film-info-tag tag-${type}`}>
        {isLang ? (
          <FaClosedCaptioning className="tag-cc-icon" />
        ) : (
          <FaLayerGroup className="tag-ep-icon" />
        )}
        <span className="tag-text">{isLang ? formatLangBadge(text) : text}</span>
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

        <div className="cinemaHeroCard__left">
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
              <Tag text={movie.episode_current} type="episode" />
              <Tag text={movie.lang} type="lang" />
            </div>

            <p className="cinemaHeroCard__overview">
              {movie.content}
            </p>
          </div>
        </div>

        {/* NÚT XEM NGAY TÁCH RIÊNG & CỤM CHI TIẾT + TRÁI TIM DÍNH NHAU */}
        <div className="cinemaHeroCard__actions">
          <button
            className="cinemaHeroCard__playBtn"
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/chi-tiet/${movie.path}`);
            }}
          >
            <FaPlay />
            <span>XEM NGAY</span>
          </button>

          <div className="cinemaHeroCard__iconGroup">
            <button
              className="cinemaHeroCard__infoBtn"
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/chi-tiet/${movie.path}`);
              }}
              title="Chi tiết phim"
            >
              <FaInfoCircle />
            </button>

            <button
              className={`cinemaHeroCard__favBtn ${isFavorited ? "active" : ""}`}
              onClick={(e) => {
                e.stopPropagation();
                toggleFav();
              }}
              disabled={favLoading || isFavorited === null}
              title={isFavorited ? "Bỏ yêu thích" : "Yêu thích"}
            >
              {isFavorited ? (
                <FaHeart className="heart-active" />
              ) : (
                <FaRegHeart />
              )}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default MovieSlide;