import FilmCarousel from "../CoverflowCarousel/index";
import { useNavigate } from "react-router-dom";
import { GoChevronRight } from "react-icons/go";
import {AnimeFilm} from "../../data/dataFilm";

const filmData = AnimeFilm;

function HomeFilm() {
const navigate = useNavigate();

  return (
    <>
        <div className="mb-1">
            <h2 className="film-category ms-3">Anime + Tokusatsu 
              <GoChevronRight 
                onClick={() => navigate("/detail/anime")}
                style={{ cursor: "pointer", border: "1px solid #ddd", borderRadius: "50%", marginLeft: '7px' }}
              />

            </h2>
        </div>
        <div className="container container-film mt-1 mb-1">
        <FilmCarousel
          items={filmData}
          renderItem={(item) => (
            <div
              className="film-card"
              alt={item.title}
              onClick={() => navigate(`/film/${item.path}`)}
              style={{
                backgroundImage: `url(${item.image})`
              }}
            >
              <div className="film-card__overlay">
                <h6 className="film-card__title">{item.title}</h6>
                <p className="film-card__episode">
                {item.episode_current || "?"}
                </p>
              </div>
            </div>
          )}
        />
      </div>  
    </>
   )
}

export default HomeFilm;