import { useEffect, useState, useRef } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { CiSearch } from "react-icons/ci";
import Swal from "sweetalert2";
import { GoChevronLeft } from "react-icons/go";
import "./style.scss";

/* ====== BLOCK KEYWORDS ====== */
const BLOCKED_KEYWORDS = [
  "18",
  "18+",
  "phim sex",
  "sex",
  "sexy",
  "adult",
  "xxx",
  "erotic",
  "porn",
  "hentai"
];

const isBlockedKeyword = (text) => {
  if (!text) return false;
  return BLOCKED_KEYWORDS.some((k) =>
    text.toLowerCase().includes(k)
  );
};

export default function FilmListBySlug() {
  const { filmSlug } = useParams();
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [hoverFilm, setHoverFilm] = useState(null);
  const [enablePreview, setEnablePreview] = useState(
    window.innerWidth >= 775
  );
  const inputRef = useRef(null);
  const previewRef = useRef(null);
  const hoverTimerRef = useRef(null);

  const navigate = useNavigate();

  const handleBack = () => {
    navigate(-1);
  };

  const keyword = filmSlug.replace(/-/g, " ");

  useEffect(() => {
    if (isBlockedKeyword(keyword)) {
      setResults([]);
      setLoading(false);

      Swal.fire({
        icon: "warning",
        title: "Từ khóa không được hỗ trợ",
        text: "Vui lòng tìm kiếm nội dung phù hợp.",
        confirmButtonText: "OK"
      });

      return; 
    }

    async function fetchData() {
      try {
        setLoading(true);

        const fetchAllPages = async (baseUrl) => {
          try {
            const firstUrl = `${baseUrl}&page=1`;
            const firstRes = await fetch(firstUrl);
            const firstData = await firstRes.json();

            const items = firstData?.data?.items || firstData?.items || [];
            const totalPage = firstData?.data?.params?.pagination?.totalPages || firstData?.paginate?.total_page || 1;

            let allItems = [...items];

            if (totalPage > 1) {
              const fetchPromises = [];
              for (let i = 2; i <= totalPage; i++) {
                fetchPromises.push(fetch(`${baseUrl}&page=${i}`).then(res => res.json()));
              }
              const remainingPagesData = await Promise.all(fetchPromises);
              
              remainingPagesData.forEach(data => {
                const pageItems = data?.data?.items || data?.items || [];
                allItems = [...allItems, ...pageItems];
              });
            }
            return allItems;
          } catch (error) {
            console.error("Lỗi khi fetch nguồn:", baseUrl, error);
            return []; 
          }
        };

        // 1. GỌI API 1 (KKPhim)
        const nguon1url = `${process.env.REACT_APP_FILM_API_URL}/v1/api/tim-kiem?keyword=${encodeURIComponent(keyword)}`;
        let rawResults = await fetchAllPages(nguon1url);
        let isKkphim = true;

        // 2. FALLBACK API 2 (Nguồn C)
        if (rawResults.length === 0) {
          const nguon2url = `${process.env.REACT_APP_FILM_API_URL_2}/api/films/search?keyword=${encodeURIComponent(keyword)}`;
          rawResults = await fetchAllPages(nguon2url);
          isKkphim = false; 
        }

        // 3. XỬ LÝ DATA
        const normalizedResults = rawResults.map(film => {
          if (isKkphim) {
            return {
              ...film,
              isKkphim: true,
              name: film.name,
              original_name: film.origin_name || film.original_name, 
              poster_url: film.poster_url, 
              thumb_url: film.thumb_url,   
              slug: film.slug,
              path: film.slug,
              episode_total: film.episode_total,
              current_episode: film.episode_current, 
              language: film.lang || "N/A",
              time: film.time || "N/A",
              quality: film.quality || "N/A",
              year: film.year || "N/A"
            };
          } else {
            return {
              ...film,
              isKkphim: false,
              name: film.name,
              original_name: film.original_name,
              poster_url: film.thumb_url,  
              thumb_url: film.poster_url,  
              slug: film.slug,
              path: film.slug,
              episode_total: film.total_episodes, 
              current_episode: film.current_episode, 
              language: film.language || "N/A",
              time: film.time || "N/A",
              quality: film.quality || "N/A",
              year: film.year || "N/A"
            };
          }
        });

        setResults(normalizedResults);

      } catch (err) {
        console.error("Lỗi tổng quát:", err);
        setResults([]);
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
    return () =>
      document.removeEventListener("mousedown", handleClickOutside);
  }, [hoverFilm]);

  useEffect(() => {
    const handleResize = () => {
      const enabled = window.innerWidth >= 775;
      setEnablePreview(enabled);
      if (!enabled && hoverFilm) setHoverFilm(null);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [hoverFilm]);

  function getPoster(url, isKkphim) {
    if (!url) return ""; 

    let fullUrl = url;

    if (!url.startsWith("http")) {
      const cleanUrl = url.startsWith("/") ? url.slice(1) : url;
      fullUrl = `https://phimimg.com/${cleanUrl}`;
    }

    // Proxy ảnh bằng biến môi trường nếu là của KKPhim
    if (isKkphim) {
      return `${process.env.REACT_APP_FILM_API_URL}/image.php?url=${encodeURIComponent(fullUrl)}`;
    }

    return fullUrl;
  }

  /* ====== SEARCH ====== */
  function handleKeyPress(e) {
    if (e.key === "Enter") {
      if (isBlockedKeyword(search)) {
        Swal.fire({
          icon: "warning",
          title: "Từ khóa không hợp lệ",
          text: "Không hỗ trợ tìm kiếm nội dung 18+.",
          confirmButtonText: "OK"
        });
        setSearch("");
        return;
      }

      const slug = search.trim().toLowerCase().replace(/\s+/g, "-");
      navigate(`/search/${slug}`);
      setSearch("");
      inputRef.current.focus();
    }
  }

  const handleSearch = () => {
    if (search.trim() !== "") {
      if (isBlockedKeyword(search)) {
        Swal.fire({
          icon: "warning",
          title: "Từ khóa không hợp lệ",
          text: "Không hỗ trợ tìm kiếm nội dung 18+.",
          confirmButtonText: "OK"
        });
        setSearch("");
        return;
      }

      const slug = search.trim().toLowerCase().replace(/\s+/g, "-");
      navigate(`/search/${slug}`);
      setSearch("");
      inputRef.current.focus();
    }
  };
  /* ================================== */

  const handleMouseEnter = (film) => {
    if (!enablePreview) return;
    hoverTimerRef.current = setTimeout(() => {
      setHoverFilm(film);
    }, 5000); 
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

      <h3 className="result-title fst-italic ms-3">
        <GoChevronLeft 
          onClick={handleBack} 
          style={{ cursor: "pointer", border: "1px solid #ddd", borderRadius: "50%" }} 
        />
        <i className="ms-2">Kết quả cho: {keyword}</i>
      </h3>

      {results.length === 0 && (
        <p className="no-result">
          Không tìm thấy phim, hãy nhập lại đúng tên phim nhé, bạn có thể nhập một vài từ trong tên phim nếu bạn không nhớ rõ tên,
           lưu ý chỉ nhập tên phim và không viết tắt, không nhập các từ như phim, tập, mùa, phần, season, ss,... vào phần tìm kiếm vì thuật toán sẽ không hiểu được.
        </p>
      )}

      {/* GRID */}
      <div className={`film-grid ${hoverFilm ? "disable-hover" : ""}`}>
        {results.map((film) => (
          <Link
            to={`/chi-tiet/${film.slug}`}
            key={film.slug}
            className="film-card"
            onMouseEnter={enablePreview ? () => handleMouseEnter(film) : undefined}
            onMouseLeave={enablePreview ? handleMouseLeave : undefined}
          >
            <div className="film-poster-wrapper">
              <img
                src={film.poster_url ? getPoster(film.poster_url, film.isKkphim) : ""}
                alt={film.name}
                className="film-poster"
                loading="lazy"
              />

              <div className="film-overlay">
                <h6 className="film-name">{film.name}</h6>
                <span className="film-year">{film.year}</span>
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
            onMouseLeave={() => setHoverFilm(null)}
            ref={previewRef}
            style={{
              backgroundImage: `url(${getPoster(
                hoverFilm.thumb_url || hoverFilm.poster_url, 
                hoverFilm.isKkphim
              )})`
            }}
          >
            <div className="preview-info">
              <div className="preview-left">
                <h5 className="preview-name">{hoverFilm.name}</h5>
                <div className="preview-origin">{hoverFilm.original_name}</div>

                <div className="preview-meta">
                  <span className="preview-tag">{hoverFilm.quality}</span>
                  <span className="preview-tag">{hoverFilm.language}</span>
                  <span className="preview-tag">{hoverFilm.year}</span>
                </div>

                <div className="preview-actions">
                  <Link to={`/chi-tiet/${hoverFilm.path}`} className="btn-watch">
                    ▶ Xem ngay
                  </Link>
                  <Link to={`/chi-tiet/${hoverFilm.slug}`} className="btn-detail">
                    Chi tiết
                  </Link>
                </div>
              </div>

              <div className="preview-right">
                <div className="preview-box blue">
                  <b>Tập:</b> {hoverFilm.current_episode || "N/A"}
                </div>

                <div className="preview-box yellow">
                  <b>Thời lượng:</b> {hoverFilm.time || "N/A"}
                </div>

                <div className="preview-box green">
                  <b>Ngôn ngữ:</b> {hoverFilm.language || "N/A"}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}