import FilmCarousel from "../CoverflowCarousel/index";
import { useNavigate } from "react-router-dom";
import { GoChevronRight } from "react-icons/go";
import { Films } from "../../data/dataFilm";
import "./style.scss";

const filmData = Films;

function Film() {
  const navigate = useNavigate();

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
        <FilmCarousel
          items={filmData}
          renderItem={(film) => (
            <div
              className="film-card"
              onClick={() => navigate(`/film/${film.path}`)}
              style={{ backgroundImage: `url(${film.image})` }}
            >
              <div className="film-card__overlay">
                <h6 className="film-card__title">{film.title}</h6>
                <p className="film-card__episode">
                  {film.episode_current || "?"}
                </p>
              </div>
            </div>
          )}
        />
      </div>
    </>
  );
}

export default Film;
