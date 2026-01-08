import FilmCarousel from "../CoverflowCarousel/index";
import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { CiSearch } from "react-icons/ci";
import { GoChevronRight } from "react-icons/go";
import {Films} from "../../data/dataFilm";
import "./style.scss";
const filmData = Films;


function Film() {
  const [search, setSearch] = useState("");
  const inputRef = useRef(null);
  const navigate = useNavigate();

  function handleKeyPress(e) {
    if (e.key === "Enter") {
      const slug = search.trim().toLowerCase().replace(/\s+/g, "-");  
      navigate(`/search/${slug}`);
      setSearch("");
      inputRef.current.focus();
    }
  }

  const handleSearch = () => {
    if (search.trim() !== "") {
      const slug = search.trim().toLowerCase().replace(/\s+/g, "-");
      navigate(`/search/${slug}`);
      setSearch("");
      inputRef.current.focus();
    }
  }

  return (
    <>
      <div className="text-center">
          <div className="mb-1">
            <h2 className="music-box-title">Kho Phim </h2>
            <p className="music-box-desc">"Xem phim online Vietsub, thuyết minh, lồng tiếng full HD
              <br /> miễn phí. Bạn có thể tìm kiếm phim ở thanh bên dưới."</p>
          </div>
          <div className="input-search-film">
            <input
              type="text"
              ref={inputRef} 
              className="input-film fst-italic"
              placeholder="Tìm kiếm phim..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={handleKeyPress}
            />
            <CiSearch className="search-film-icon" onClick={handleSearch} />
          </div>
          
      </div>
      <div className="mb-1">
            <h2 className="film-category ms-3">Phim Nổi Bật 
              <GoChevronRight 
                onClick={() => navigate("/detail/films")}
                style={{ cursor: "pointer", border: "1px solid #ddd", borderRadius: "50%", marginLeft: '7px' }} 
              />

            </h2>
        </div>
      <div className="container mt-1 mb-1">
        <FilmCarousel
          items={filmData}
          renderItem={(film) => (
            <div
              className="film-card"
              onClick={() => navigate(`/film/${film.path}`)}
              alt={film.title}
              style={{
                backgroundImage: `url(${film.image})`
              }}
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
   )
}

export default Film;