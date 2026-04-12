import FilmCarousel from "../Carousel/FilmCarousel";
import { GoChevronRight } from "react-icons/go";
import { useNavigate } from "react-router-dom";
import { useMovies } from "../../context/MoviesContext";
import "animate.css";

function CinematicFilm() {
  const navigate = useNavigate();

  const { grouped, loading } = useMovies();

  const filmData = grouped["phim-chieu-rap"] || [];

  return (
    <>
      <div className="mb-1">
        <h2 className="film-category ms-3">
          Phim Chiếu Rạp
          <GoChevronRight
            onClick={() => navigate("/detail/cinematic")}
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
          <p>Đang tải...</p>
        ) : (
          <FilmCarousel items={filmData} />
        )}
      </div>
    </>
  );
}

export default CinematicFilm;