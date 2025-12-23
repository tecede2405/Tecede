import { useEffect, useState, useRef } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { CiSearch } from "react-icons/ci";
import "./style.scss";

export default function FilmListBySlug() {
  const { filmSlug } = useParams();
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [hoverFilm, setHoverFilm] = useState(null); // ⭐ THÊM
  const [enablePreview, setEnablePreview] = useState(
    window.innerWidth >= 775
  );
  const inputRef = useRef(null);
  const previewRef = useRef(null);
  const hoverTimerRef = useRef(null);

  const navigate = useNavigate();

  const keyword = filmSlug.replace(/-/g, " ");

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const url = `${process.env.REACT_APP_FILM_API_URL}/v1/api/tim-kiem?keyword=${encodeURIComponent(
          keyword
        )}&limit=50`;
        const res = await fetch(url);
        const data = await res.json();
        setResults(data.data.items || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [keyword]);

  useEffect(() => {
    if (!hoverFilm) return;

    function handleClickOutside(e) {
      if (
        previewRef.current &&
        !previewRef.current.contains(e.target)
      ) {
        setHoverFilm(null);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [hoverFilm]);

  useEffect(() => {
    const handleResize = () => {
      const enabled = window.innerWidth >= 775;
      setEnablePreview(enabled);

      // nếu đang mở preview mà resize xuống mobile → đóng ngay
      if (!enabled && hoverFilm) {
        setHoverFilm(null);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [hoverFilm]);



  function getPoster(url) {
    if (!url) return "";
    if (url.startsWith("http")) return url;
    if (!url.startsWith("/")) url = "/" + url;
    return `https://phimimg.com${url}`;
  }

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
  };

  const handleMouseEnter = (film) => {
    if (!enablePreview) return;
    hoverTimerRef.current = setTimeout(() => {
      setHoverFilm(film);
    }, 500); //  1 giây
  };

  const handleMouseLeave = () => {
     if (!enablePreview) return;

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

  if (loading)
    return (
      <div className="container py-4">
        <h4 className="result-title fst-italic">
          Đang tải kết quả: {keyword}...
        </h4>
      </div>
    );

  return (
    <div className="film-container">
      <div className="input-search-film">
        <input
          type="text"
          ref={inputRef}
          className="input-film fst-italic"
          placeholder="Tìm kiếm phim khác..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={handleKeyPress}
        />
        <CiSearch className="search-film-icon" onClick={handleSearch} />
      </div>

      <h3 className="result-title fst-italic">
        Kết quả cho: {keyword}
      </h3>

      {results.length === 0 && (
        <p className="no-result">Không tìm thấy phim nào.</p>
      )}

      {/* GRID */}
      <div className={`film-grid ${hoverFilm ? "disable-hover" : ""}`}>
        {results.map((film) => (
          <Link
            to={`/film/${film.slug}`}
            key={film.slug}
            className="film-card"
            onMouseEnter={enablePreview ? () => handleMouseEnter(film) : undefined}
            onMouseLeave={enablePreview ? handleMouseLeave : undefined}
          >
            <div className="film-poster-wrapper">
              <img
                src={getPoster(film.poster_url)}
                alt={film.name}
                className="film-poster"
              />

              <span className="film-episodes">
                {film.episode_total === 1
                  ? "Full"
                  : film.episode_total && film.episode_current
                  ? film.status?.toLowerCase().includes("hoàn tất") &&
                    film.episode_total === film.episode_current
                    ? `${film.episode_total}`
                    : `${film.episode_current}/${film.episode_total}`
                  : film.episode_current
                  ? `${film.episode_current}`
                  : null}
              </span>

              <div className="film-overlay">
                <h6 className="film-name">{film.name}</h6>
                <span className="film-year">{film.year}</span>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* ⭐ PREVIEW CARD TO Ở GIỮA */}
      {enablePreview && hoverFilm &&  (
        <div
          className="hover-preview-backdrop"
        >
          <div className="hover-preview-card" 
            onMouseLeave={() => setHoverFilm(null)} ref={previewRef}
            style={{
                backgroundImage: `url(${getPoster(
                  hoverFilm.thumb_url || hoverFilm.poster_url
                )})`
              }}
          >
            <div className="preview-info">
              <h5 className="preview-name">{hoverFilm.name}</h5>
              <span className="film-year">{hoverFilm.origin_name}</span>

              <div className="preview-actions">
                <Link
                  to={`/film/${hoverFilm.slug}`}
                  className="btn-watch btn btn-info"
                >
                  ▶ Xem ngay
                </Link>
                <Link
                  to={`/film/${hoverFilm.slug}`}
                  className="btn-detail btn btn-outline-info"
                >
                  Chi tiết
                </Link>
              </div>
               <div className="film-detail-info mt-2">
                  <span className="detail-year me-2 mt-2">Chất lượng: {hoverFilm.quality}</span>
                  <span className="detail-year me-2 mt-2">Số tập: {hoverFilm.episode_current}</span>
                  <span className="detail-year me-2 mt-2">Thời lượng : {hoverFilm.time}</span>
                  <p className="detail-year mt-2" style={{width: "50%"}}>Ngôn ngữ phụ đề: {hoverFilm.lang}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
