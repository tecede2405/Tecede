import { useEffect, useState, useRef } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { CiSearch } from "react-icons/ci";
import { GoChevronLeft} from "react-icons/go";
import { useMovies } from "../../context/MoviesContext";
import "./style.scss";
export default function FilmListByType() {
  const { type } = useParams();

  const [search, setSearch] = useState("");
  const [hoverFilm, setHoverFilm] = useState(null);
  const [enablePreview, setEnablePreview] = useState(
    window.innerWidth >= 775
  );

  const inputRef = useRef(null);
  const previewRef = useRef(null);
  const hoverTimerRef = useRef(null);
  const navigate = useNavigate();

  /* ===================== MAP DATA THEO TYPE ===================== */
const { grouped, loading } = useMovies();

const typeMap = {
  cinematic: "phim-chieu-rap",
  films: "phim-noi-bat",
  anime: "anime",
  "new-film": "phim-moi",
  "new-anime": "anime-moi",
  "sieu-nhan": "tokusatsu",
  "high-rate-film": "high-rate-film",
  "korea-film": "korea-film",
  "china-film": "china-film",
  "china3d-film": "china3d",
};

  const category = typeMap[type] || "phim-noi-bat";
  const results = grouped?.[category] || [];    

  /* ===================== RESPONSIVE PREVIEW ===================== */
  useEffect(() => {
    const handleResize = () => {
      const enabled = window.innerWidth >= 775;
      setEnablePreview(enabled);
      if (!enabled) setHoverFilm(null);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  /* ===================== SEARCH ===================== */
  const handleSearch = () => {
    if (!search.trim()) return;
    const slug = search.trim().toLowerCase().replace(/\s+/g, "-");
    navigate(`/search/${slug}`);
    setSearch("");
    inputRef.current.focus();
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") handleSearch();
  };

  /* ===================== HOVER PREVIEW ===================== */
  const handleMouseEnter = (film) => {
    if (!enablePreview) return;
    hoverTimerRef.current = setTimeout(() => {
      setHoverFilm(film);
    }, 5000);
  };

  const handleMouseLeave = () => {
    if (hoverTimerRef.current) {
      clearTimeout(hoverTimerRef.current);
      hoverTimerRef.current = null;
    }
  };

  useEffect(() => {
    if (hoverFilm && hoverTimerRef.current) {
      clearTimeout(hoverTimerRef.current);
      hoverTimerRef.current = null;
    }
  }, [hoverFilm]);

  return (
    <div className="film-container">

      {/* SEARCH */}
      <div className="input-search-film">
        <input
          ref={inputRef}
          type="text"
          className="input-film fst-italic"
          placeholder="Tìm kiếm phim khác..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={handleKeyPress}
        />
        <CiSearch className="search-film-icon" onClick={handleSearch} />
      </div>
      <div className="d-flex align-items-center mb-3 ms-2">
         <GoChevronLeft 
          size={25} 
          onClick={() => navigate(-1)}
          style={{ cursor: "pointer", border: "1px solid #ddd", borderRadius: "50%", color: "#fff" }} 
          />
        <h4 className="text-light ms-2 mb-0">
          {type === "cinematic"
            ? "Phim Chiếu Rạp"
            : type === "films"
            ? "Phim Nổi Bật"
            : type === "anime"
            ? "Anime"
            : type === "new-film"
            ? "Phim Mới"
            : type === "new-anime"
            ? "Anime Mới"
            : type === "sieu-nhan"
            ? "Siêu Nhân"
            : type === "high-rate-film"
            ? "Phim Hot"
            : type === "korea-film"
            ? "Series Hàn Quốc"
            : type === "china-film"
            ? "Series Trung Quốc"
            : type === "china3d-film"
            ? "Hoạt Hình 3D Trung Quốc"
            : "Danh sách phim"
            }
        </h4>

      </div>
      {/* GRID */}
      {loading ? (
        <div className="text-light p-4">Loading...</div>
      ) : (
        <>
          <div className={`film-grid ${hoverFilm ? "disable-hover" : ""}`}>
            {results.map((film) => (
              <Link
                to={`/chi-tiet/${film.path}`}
                key={film.path}
                className="film-card"
                onMouseEnter={() => handleMouseEnter(film)}
                onMouseLeave={handleMouseLeave}
              >
                <div className="film-poster-wrapper">
                  <img
                    src={`${process.env.REACT_APP_FILM_API_URL}/image.php?url=${encodeURIComponent(
                      film.image || film.thumb || ""
                    )}`}
                    alt={film.title}
                    loading="lazy"
                    className="film-poster"
                  />

                  <span className="film-episodes">
                    {film.time || film.episode_current}
                  </span>

                  <div className="film-overlay">
                    <h6 className="film-name">{film.title}</h6>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* PREVIEW */}
          {enablePreview && hoverFilm && (
            <div className="hover-preview-backdrop">
              <div
                className="hover-preview-card"
                ref={previewRef}
                onMouseLeave={() => setHoverFilm(null)}
                style={{
                  backgroundImage: `url(${hoverFilm.thumb || hoverFilm.image})`,
                }}
              >
                <div className="previews-info">
                  <h5 className="previews-name">{hoverFilm.title}</h5>

                  <div className="previews-action mt-2">
                    <Link
                      to={`/chi-tiet/${hoverFilm.path}`}
                      className="btn-watch btn btn-info me-2"
                    >
                      ▶ Xem ngay
                    </Link>
                    <Link
                      to={`/chi-tiet/${hoverFilm.path}`}
                      className="btn-detail btn btn-outline-info"
                    >
                      Chi tiết
                    </Link>
                  </div>

                  <div className="film-detail-info mt-2">
                    {hoverFilm.time && <span>{hoverFilm.time}</span>}
                    {hoverFilm.episode_current && (
                      <span>{hoverFilm.episode_current}</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* PREVIEW */}

      {enablePreview && hoverFilm && (
        <div className="hover-preview-backdrop">
          <div
            className="hover-preview-card"
            ref={previewRef}
            onMouseLeave={() => setHoverFilm(null)}
            style={{
              backgroundImage: `url(${hoverFilm.thumb || hoverFilm.image})`,
            }}
          >
            <div className="previews-info">
              <h5 className="previews-name">{hoverFilm.title}</h5>

              <div className="previews-action mt-2">
                <Link
                  to={`/chi-tiet/${hoverFilm.path}`}
                  className="btn-watch btn btn-info me-2"
                >
                  ▶ Xem ngay
                </Link>
                <Link
                  to={`/chi-tiet/${hoverFilm.path}`}
                  className="btn-detail btn btn-outline-info"
                >
                  Chi tiết
                </Link>
              </div>

              <div className="film-detail-info mt-2">
                {hoverFilm.time && <span>{hoverFilm.time}</span>}
                {hoverFilm.episode_current && (
                  <span>{hoverFilm.episode_current}</span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
