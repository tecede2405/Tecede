import FilmCarousel from "../CoverflowCarousel/index";
import { useNavigate } from "react-router-dom";
import { GoChevronRight } from "react-icons/go";
import { useMovies } from "../../context/MoviesContext";
import "animate.css/animate.min.css";
import { FaFilm, FaClosedCaptioning, FaLayerGroup } from "react-icons/fa";
import { formatLangBadge } from "../../utils/formatLang";
import "./style.scss";

function Film() {
  const navigate = useNavigate();

  const { grouped, loading } = useMovies();

  const filmData = (grouped["phim-noi-bat"] || []).slice(0, 12);

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
      <div className="mb-1 d-flex justify-content-between align-items-center">
        <h2 className="film-category ms-3">
          <FaFilm className="film-category__icon" />
          <span>Phim Nổi Bật</span>
        </h2>
      
        <div className="watch-more" onClick={() => navigate("/detail/films")}>
          <span style={{ cursor: "pointer", fontWeight: "bold" }}>Xem Thêm</span>
          <GoChevronRight
            style={{
              cursor: "pointer",
              border: "1px solid #ddd",
              color: "#fff",
              borderRadius: "50%",
              marginLeft: "7px",
            }}
          />
        </div>
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
                <div className="film-card__poster">
                  <img
                    // Đã loại bỏ proxy image.php, sử dụng trực tiếp link gốc từ API
                    src={film.image}
                    alt={film.title}
                    loading="lazy"
                    className="film-card__img"
                  />

                  <div className="film-card__episode">
                    <FaLayerGroup className="film-card__episode-icon" />
                    <span>{film.episode_current || "?"}</span>
                  </div>

                  <div className="film-card__lang">
                    <FaClosedCaptioning className="film-card__lang-icon" />
                    <span>{formatLangBadge(film.lang)}</span>
                  </div>
                </div>

                <div className="film-card__info">
                  <h6 className="film-card__title">{film.title}</h6>
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