import { useEffect, useState, useRef } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { CiSearch } from "react-icons/ci";
import Swal from "sweetalert2";
import { GoChevronLeft } from "react-icons/go";
import "./style.scss";

const BLOCKED_KEYWORDS = ["18", "18+", "phim sex", "sex", "sexy", "adult", "xxx", "erotic", "porn", "hentai"];

const isBlockedKeyword = (text) => {
  if (!text) return false;
  return BLOCKED_KEYWORDS.some((k) => text.toLowerCase().includes(k));
};

export default function FilmListBySlug() {
  const { filmSlug } = useParams();
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [hoverFilm, setHoverFilm] = useState(null);
  const [enablePreview, setEnablePreview] = useState(window.innerWidth >= 775);
  const inputRef = useRef(null);
  const previewRef = useRef(null);
  const hoverTimerRef = useRef(null);
  const navigate = useNavigate();

  const handleBack = () => navigate(-1);
  const keyword = filmSlug.replace(/-/g, " ");

  useEffect(() => {
    if (isBlockedKeyword(keyword)) {
      setResults([]);
      setLoading(false);
      Swal.fire({ icon: "warning", title: "Từ khóa không được hỗ trợ", text: "Vui lòng tìm kiếm nội dung phù hợp.", confirmButtonText: "OK" });
      return;
    }

    async function fetchData() {
      try {
        setLoading(true);

        const fetchAllPages = async (baseUrl, sourceName) => {
          try {
            const hasQuery = baseUrl.includes("?");
            const firstRes = await fetch(`${baseUrl}${hasQuery ? "&" : "?"}page=1`);
            if (!firstRes.ok) return [];
            const firstData = await firstRes.json();
            const items = firstData?.data?.items || firstData?.items || [];
            const totalPage = firstData?.data?.params?.pagination?.totalPages || firstData?.paginate?.total_page || firstData?.totalPages || 1;

            let allItems = [...items];
            if (totalPage > 1) {
              const fetchPromises = [];
              for (let i = 2; i <= totalPage; i++) {
                fetchPromises.push(fetch(`${baseUrl}${hasQuery ? "&" : "?"}page=${i}`).then(res => res.ok ? res.json() : null).catch(() => null));
              }
              const remainingPagesData = await Promise.all(fetchPromises);
              remainingPagesData.forEach(data => {
                if (data) allItems = [...allItems, ...(data?.data?.items || data?.items || [])];
              });
            }
            return allItems;
          } catch (error) {
            console.error(`[${sourceName}] Lỗi:`, error);
            return [];
          }
        };

        const url1 = `${process.env.REACT_APP_FILM_API_URL}/v1/api/tim-kiem?keyword=${encodeURIComponent(keyword)}`;
        const url2 = `${process.env.REACT_APP_FILM_API_URL_2}/api/films/search?keyword=${encodeURIComponent(keyword)}`;

        // Fetch song song cả 2 nguồn
        const [res1, res2] = await Promise.all([
          fetchAllPages(url1, "KKPhim"),
          fetchAllPages(url2, "NguonC")
        ]);

        // Hàm helper dùng chung để lấy năm từ cả 2 nguồn
const getYearFromData = (f) => {
  if (f.year) return f.year; // Nếu có sẵn thì lấy luôn

  // Quét toàn bộ object category
  if (f.category && typeof f.category === 'object') {
    const categories = Object.values(f.category);
    for (let cat of categories) {
      if (cat.list && Array.isArray(cat.list)) {
        for (let item of cat.list) {
          // Kiểm tra nếu name là số có 4 chữ số (ví dụ: "2025")
          const name = String(item.name);
          if (/^\d{4}$/.test(name)) {
            return name;
          }
        }
      }
    }
  }
  return "N/A";
};

// Áp dụng cho cả 2 nguồn
const norm1 = res1.map(f => ({ 
  ...f, 
  isKkphim: true, 
  name: f.name, 
  original_name: f.origin_name || f.original_name, 
  poster_url: f.poster_url, 
  thumb_url: f.thumb_url, 
  slug: f.slug, 
  path: f.slug, 
  episode_total: f.episode_total, 
  current_episode: f.episode_current, 
  language: f.lang || "N/A", 
  time: f.time || "N/A", 
  quality: f.quality || "N/A", 
  year: getYearFromData(f) // Dùng hàm lấy năm
}));

const norm2 = res2.map(f => ({ 
  ...f, 
  isKkphim: false, 
  name: f.name, 
  original_name: f.original_name, 
  poster_url: f.thumb_url || f.poster_url, 
  thumb_url: f.poster_url || f.thumb_url, 
  slug: f.slug, 
  path: f.slug, 
  episode_total: f.total_episodes || f.episode_total, 
  current_episode: f.current_episode || f.episode_current, 
  language: f.language || f.lang || "N/A", 
  time: f.time || "N/A", 
  quality: f.quality || "N/A", 
  year: getYearFromData(f) // Dùng hàm lấy năm
}));

        // Gộp và loại bỏ trùng lặp dựa trên slug
        const combined = [...norm1, ...norm2];
        const uniqueResults = Array.from(new Map(combined.map(item => [item.slug, item])).values());

        setResults(uniqueResults);
      } catch (err) {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [keyword]);

  // Các useEffect xử lý Preview, Resize, Search... (giữ nguyên logic cũ của bạn)
  useEffect(() => {
    function handleClickOutside(e) { if (previewRef.current && !previewRef.current.contains(e.target)) setHoverFilm(null); }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
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
    let fullUrl = url.startsWith("http") ? url : `https://phimimg.com/${url.startsWith("/") ? url.slice(1) : url}`;
    return isKkphim ? `${process.env.REACT_APP_FILM_API_URL}/image.php?url=${encodeURIComponent(fullUrl)}` : fullUrl;
  }

  const executeSearch = () => {
    if (search.trim() !== "") {
      if (isBlockedKeyword(search)) {
        Swal.fire({ icon: "warning", title: "Từ khóa không hợp lệ", text: "Không hỗ trợ tìm kiếm 18+.", confirmButtonText: "OK" });
        setSearch("");
        return;
      }
      navigate(`/search/${search.trim().toLowerCase().replace(/\s+/g, "-")}`);
      setSearch("");
    }
  };

  const handleMouseEnter = (film) => { if (enablePreview) hoverTimerRef.current = setTimeout(() => setHoverFilm(film), 5000); };
  const handleMouseLeave = () => { if (enablePreview && hoverTimerRef.current) { clearTimeout(hoverTimerRef.current); hoverTimerRef.current = null; } };

  if (loading) return <div className="container py-4"><h4 className="result-title fst-italic">Đang tải kết quả: {keyword}...</h4></div>;

  return (
    <div className="film-container">
      <div className="input-search-film">
        <input type="text" ref={inputRef} className="input-film fst-italic" placeholder="Tìm kiếm phim khác..." value={search} onChange={(e) => setSearch(e.target.value)} onKeyDown={(e) => e.key === "Enter" && executeSearch()} />
        <CiSearch className="search-film-icon" onClick={executeSearch} />
      </div>
      <h3 className="result-title fst-italic ms-3">
        <GoChevronLeft onClick={handleBack} style={{ cursor: "pointer", border: "1px solid #ddd", borderRadius: "50%" }} />
        <i className="ms-2">Kết quả cho: {keyword}</i>
      </h3>

      {results.length === 0 && <p className="no-result">Không tìm thấy phim, hãy nhập lại đúng tên phim nhé, bạn có thể nhập một vài từ trong tên phim nếu bạn không nhớ rõ tên,
          lưu ý chỉ nhập tên phim và không viết tắt, không nhập các từ như phim, tập, mùa, phần, season, ss,... vào phần tìm kiếm vì thuật toán sẽ không hiểu được.</p>}

      <div className={`film-grid ${hoverFilm ? "disable-hover" : ""}`}>
        {results.map((film) => (
          <Link to={`/chi-tiet/${film.slug}`} key={film.slug} className="film-card" onMouseEnter={enablePreview ? () => handleMouseEnter(film) : undefined} onMouseLeave={enablePreview ? handleMouseLeave : undefined}>
            <div className="film-poster-wrapper">
              <img src={getPoster(film.poster_url, film.isKkphim)} alt={film.name} className="film-poster" loading="lazy" />
              <div className="film-overlay"><h6 className="film-name">{film.name}</h6><span className="film-year">{film.year}</span></div>
            </div>
          </Link>
        ))}
      </div>

      {/* Phần Preview giữ nguyên cấu trúc cũ của bạn */}
      {enablePreview && hoverFilm && (
        <div className="hover-preview-backdrop">
          <div className="hover-preview-card" onMouseLeave={() => setHoverFilm(null)} ref={previewRef} style={{ backgroundImage: `url(${getPoster(hoverFilm.thumb_url || hoverFilm.poster_url, hoverFilm.isKkphim)})` }}>
            <div className="preview-info">
              <div className="preview-left">
                <h5 className="preview-name">{hoverFilm.name}</h5>
                <div className="preview-origin">{hoverFilm.original_name}</div>
                <div className="preview-meta"><span className="preview-tag">{hoverFilm.quality}</span><span className="preview-tag">{hoverFilm.language}</span><span className="preview-tag">{hoverFilm.year}</span></div>
                <div className="preview-actions"><Link to={`/chi-tiet/${hoverFilm.path}`} className="btn-watch">▶ Xem ngay</Link></div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}