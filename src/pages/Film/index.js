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
            
            // HÀM XỬ LÝ ẢNH RIÊNG CHO TỪNG DATA TRẢ VỀ
            const extractItems = (data) => {
              // KK, OP, NC đều có cấu trúc items trong data.data.items
              let items = data?.data?.items || data?.items || data?.data || [];
              // Không cần xử lý og_image nữa, vì poster_url đã đầy đủ
              return items;
            };

            let allItems = extractItems(firstData);
            const totalPage = firstData?.data?.params?.pagination?.totalPages || firstData?.paginate?.total_page || firstData?.totalPages || 1;

            if (totalPage > 1) {
              const fetchPromises = [];
              for (let i = 2; i <= totalPage; i++) {
                fetchPromises.push(fetch(`${baseUrl}${hasQuery ? "&" : "?"}page=${i}`).then(res => res.ok ? res.json() : null).catch(() => null));
              }
              const remainingPagesData = await Promise.all(fetchPromises);
              remainingPagesData.forEach(data => {
                if (data) allItems = [...allItems, ...extractItems(data)];
              });
            }
            return allItems;
          } catch (error) {
            console.error(`[${sourceName}] Lỗi:`, error);
            return [];
          }
        };

        const urlKk = `${process.env.REACT_APP_FILM_API_URL}/v1/api/tim-kiem?keyword=${encodeURIComponent(keyword)}`;
        const urlOp = `${process.env.REACT_APP_FILM_API_URL_2}/v1/api/tim-kiem?keyword=${encodeURIComponent(keyword)}`;
        const urlNc = `${process.env.REACT_APP_FILM_API_URL_3}/api/films/search?keyword=${encodeURIComponent(keyword)}`;

        // Fetch song song 3 nguồn
        const [resKk, resOp, resNc] = await Promise.all([
          fetchAllPages(urlKk, "KK"),
          fetchAllPages(urlOp, "OP"),
          fetchAllPages(urlNc, "NC")
        ]);

        const getYearFromData = (f) => {
          if (f.year) return f.year; 
          if (f.category && typeof f.category === 'object') {
            const categories = Object.values(f.category);
            for (let cat of categories) {
              if (cat.list && Array.isArray(cat.list)) {
                for (let item of cat.list) {
                  const name = String(item.name);
                  if (/^\d{4}$/.test(name)) return name;
                }
              }
            }
          }
          return "N/A";
        };

        // Format data: Sử dụng full_image_path cho nguồn KK
        const normKk = resKk.map(f => ({
          ...f,
          sourceName: "KK",
          isKkphim: true,
          name: f.name,
          original_name: f.origin_name || f.original_name,
          poster_url: f.poster_url,   // Giữ nguyên, không thay bằng full_image_path
          thumb_url: f.thumb_url,     // Có thể dùng cho preview nếu cần
          slug: f.slug,
          path: f.slug,
          episode_total: f.episode_total,
          current_episode: f.episode_current,
          language: f.lang || "N/A",
          time: f.time || "N/A",
          quality: f.quality || "N/A",
          year: getYearFromData(f)
        }));

        const normOp = resOp.map(f => ({ 
          ...f, sourceName: "OP", isKkphim: false, 
          name: f.name, original_name: f.origin_name || f.original_name, 
          poster_url: f.thumb_url || f.poster_url, thumb_url: f.poster_url || f.thumb_url, 
          slug: f.slug, path: f.slug, 
          episode_total: f.episode_total, current_episode: f.episode_current, 
          language: f.lang || "N/A", time: f.time || "N/A", quality: f.quality || "N/A", year: getYearFromData(f) 
        }));

        const normNc = resNc.map(f => ({ 
          ...f, sourceName: "NC", isKkphim: false, 
          name: f.name, original_name: f.original_name || f.origin_name, 
          poster_url: f.thumb_url || f.poster_url, thumb_url: f.poster_url || f.thumb_url, 
          slug: f.slug, path: f.slug, 
          episode_total: f.total_episodes || f.episode_total, current_episode: f.current_episode || f.episode_current, 
          language: f.language || f.lang || "N/A", time: f.time || "N/A", quality: f.quality || "N/A", year: getYearFromData(f) 
        }));

        const combined = [...normKk, ...normOp, ...normNc];
        
        // Lọc trùng lặp bằng cách nối slug và sourceName
        const uniqueResults = Array.from(new Map(combined.map(item => [`${item.slug}-${item.sourceName}`, item])).values());

        setResults(uniqueResults);
      } catch (err) {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [keyword]);

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

  /* ================= UTILS ================= */
  function getPoster(url, sourceName) {
    if (!url) return "";
    
    // Nguồn C thường trả về link full sẵn
    if (url.startsWith("http")) return url;

    // Xử lý riêng cho OPhim
    if (sourceName === "OP") {
      return `https://img.ophim.live/uploads/movies/${url.startsWith("/") ? url.slice(1) : url}`;
    }

    // Xử lý cho KKPhim (phimapi) - đã có full path ở bước fetch
    return `https://phimimg.com/${url.startsWith("/") ? url.slice(1) : url}`;
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
          <Link to={`/chi-tiet/${film.slug}`} key={`${film.slug}-${film.sourceName}`} className="film-card" onMouseEnter={enablePreview ? () => handleMouseEnter(film) : undefined} onMouseLeave={enablePreview ? handleMouseLeave : undefined}>
            <div className="film-poster-wrapper">
              {/* LABEL HIỂN THỊ NGUỒN PHIM */}
              <div style={{
                position: "absolute", top: "5px", left: "5px", 
                backgroundColor: film.sourceName === "KK" ? "#e50914" : film.sourceName === "OP" ? "#ff9800" : "#2196f3", 
                color: "white", padding: "3px 8px", fontSize: "11px", fontWeight: "bold", 
                borderRadius: "4px", zIndex: 10, boxShadow: "0 2px 4px rgba(0,0,0,0.5)"
              }}>
                {film.sourceName}
              </div>

              <img src={getPoster(film.poster_url, film.sourceName)} alt={film.name} className="film-poster" loading="lazy" />
              <div className="film-overlay">
                <h6 className="film-name">{film.name}</h6>
                <span className="film-year">{film.year}</span>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {enablePreview && hoverFilm && (
        <div className="hover-preview-backdrop">
          <div className="hover-preview-card" onMouseLeave={() => setHoverFilm(null)} ref={previewRef} style={{ backgroundImage: `url(${getPoster(hoverFilm.thumb_url || hoverFilm.poster_url, hoverFilm.sourceName)})` }}>
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
                  <Link to={`/chi-tiet/${hoverFilm.path}`} className="btn-watch">▶ Xem ngay</Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}