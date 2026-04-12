import FilmCarousel from "../CoverflowCarousel/index";
import { useNavigate } from "react-router-dom";
import { GoChevronRight } from "react-icons/go";
import { useMovies } from "../../context/MoviesContext";
import "animate.css/animate.min.css";
import "./style.scss";

function Film() {
  const navigate = useNavigate();

  const { grouped, loading } = useMovies();

  const filmData = grouped["phim-noi-bat"] || [];

  function FilmSkeleton() {
    return (
      <div className="film-card skeleton">
        <div className="film-card__img skeleton-img"></div>

        <div className="film-card__overlay">
          <div className="skeleton-text title"></div>
          <div className="skeleton-text episode"></div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="mb-1">
        <h2 className="film-category ms-3">
          Phim Nổi Bật
          <GoChevronRight
            onClick={() => navigate("/detail/films")}
            style={{
              cursor: "pointer",
              border: "1px solid #ddd",
              borderRadius: "50%",
              marginLeft: "7px",
            }}
          />
        </h2>
      </div>

      <div className="container container-film mt-1 mb-1">
        {loading ? (
          <FilmCarousel
            items={[...Array(10)]}
            renderItem={(_, index) => <FilmSkeleton key={index} />}
          />
        ) : (
          <FilmCarousel
            items={filmData}
            renderItem={(film) => (
              <div
                className="film-card"
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/chi-tiet/${film.path}`);
                }}
              >
                <img
                  src={`${process.env.REACT_APP_FILM_API_URL}/image.php?url=${encodeURIComponent(film.image)}`}
                  alt={film.title}
                  loading="lazy"
                  className="film-card__img"
                />

                <div className="film-card__overlay">
                  <h6 className="film-card__title">{film.title}</h6>
                  <p className="film-card__episode">
                    {film.episode_current || "?"}
                  </p>
                </div>
              </div>
            )}
          />
        )}
      </div>
    </>
  );
}

export default Film;