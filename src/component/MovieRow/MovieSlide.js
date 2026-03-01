import {useNavigate} from "react-router-dom";
import { FaPlay } from "react-icons/fa";
import "./style.scss";
const MovieSlide = ({ movie }) => {
  const navigate = useNavigate();

  return (
    <div className="cinemaHeroCard">

  <div
    className="cinemaHeroCard__backdrop"
    style={{
      backgroundImage: `url(${movie.thumb})`
    }}
  />

  <div className="cinemaHeroCard__layout">

    <div className="cinemaHeroCard__poster">
      <img src={movie.image} alt={movie.title} />
    </div>

    <div className="cinemaHeroCard__info">

      <h3 className="cinemaHeroCard__title">
        {movie.title}
      </h3>

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