import { useEffect, useState, useRef } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { CiSearch } from "react-icons/ci";
import "./style.scss";

export default function FilmListBySlug() {
  const { filmSlug } = useParams(); // /:filmSlug
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const inputRef = useRef(null);

  const navigate = useNavigate();

  // convert slug thành keyword tìm kiếm ví dụ "attack on titan" → "attack-on-titan"
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
  }, [keyword]); // load lại khi đổi slug


  function getPoster(url) {
    if (!url) return "";
    if (url.startsWith("http")) return url;
    if (!url.startsWith("/")) url = "/" + url;
    return `https://phimimg.com${url}`;
  }

  function handleKeyPress(e) {
    if (e.key === "Enter") {
      const slug = search.trim().toLowerCase().replace(/\s+/g, "-");  
      navigate(`/${slug}`);
      setSearch("");
      inputRef.current.focus();
    }
  }

  const handleSearch = () => {
    if (search.trim() !== "") {
      const slug = search.trim().toLowerCase().replace(/\s+/g, "-");
      navigate(`/${slug}`);
    }
  }


  if (loading)
    return (
      <div className="container py-4">
        <h4 className="text-success">Đang tải kết quả: {keyword}...</h4>
      </div>
    );

  return (
    <div className="film-container">
      <div className="input-search-film">
        <input
          type="text"
          ref={inputRef} 
          className="input-film"
          placeholder="Tìm kiếm phim..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={handleKeyPress}
        />
        <CiSearch className="search-film-icon" onClick={handleSearch} />
      </div>
      <h3 className="result-title text-success">Kết quả cho: {keyword}</h3>

      {results.length === 0 && <p className="no-result">Không tìm thấy phim nào.</p>}

      <div className="film-grid">
        {results.map((film) => (
          <Link to={`/film/${film.slug}`} key={film.slug} className="film-card">
            <div className="film-poster-wrapper">
              <img src={getPoster(film.poster_url)} alt={film.name} className="film-poster" />
              <div className="film-overlay">
                <h6 className="film-name">{film.name}</h6>
                <span className="film-year">{film.year}</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>

  );
}
