import FilmCarousel from "../CoverflowCarousel/index";
import { useNavigate } from "react-router-dom";
import { GoChevronRight } from "react-icons/go";
import { useMovies } from "../../context/MoviesContext";

function HighRateFilms() {
  const navigate = useNavigate();

  const { grouped, loading } = useMovies();

  const filmData = grouped["high-rate-film"] || [];

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
          Phim Hot
          <GoChevronRight
            onClick={() => navigate("/detail/high-rate-film")}
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
            renderItem={(item) => (
              <div
                className="film-card animate__animated animate__fadeInLeft"
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/chi-tiet/${item.path}`);
                }}
              >
                <img
                  src={`${process.env.REACT_APP_FILM_API_URL}/image.php?url=${encodeURIComponent(item.image)}`}
                  alt={item.title}
                  loading="lazy"
                  className="film-card__img"
                />

                <div className="film-card__overlay">
                  <h6 className="film-card__title">{item.title}</h6>
                  <p className="film-card__episode">
                    {item.episode_current || "?"}
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

export default HighRateFilms;