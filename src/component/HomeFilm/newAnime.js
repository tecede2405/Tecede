import FilmCarousel from "../Carousel/FilmCarousel";
import { GoChevronRight } from "react-icons/go";
import { useNavigate } from "react-router-dom";
import { useMovies } from "../../context/MoviesContext";
import { FaFilm } from "react-icons/fa";
import "animate.css";

function NewAnimes() {
  const navigate = useNavigate();

  const { grouped, loading } = useMovies();

  const filmData = (grouped["anime-moi"] || []).slice(0, 12);

  return (
    <>
      <div className="mb-1 d-flex justify-content-between align-items-center">
        <h2 className="film-category ms-3">
          <FaFilm className="film-category__icon" />
          <span>Anime Mới</span>
        </h2>
        <div className="watch-more" onClick={() => navigate("/detail/new-anime")}>
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
          <p>Đang tải...</p>
        ) : (
          <FilmCarousel items={filmData} />
        )}
      </div>
    </>
  );
}

export default NewAnimes;