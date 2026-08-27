import { useEffect, useState, useRef } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { CiSearch } from "react-icons/ci";
import Swal from "sweetalert2";
import { GoChevronLeft } from "react-icons/go";
import "./style.scss";

const BLOCKED_KEYWORDS = ["18", "18+", "phim sex", "sex", "sexy", "adult", "xxx", "erotic", "porn", "hentai"];

const isBlockedKeyword = (text) => {
  if (!text || typeof text !== "string") return false;
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
  const keyword = filmSlug ? filmSlug.replace(/-/g, " ") : "";

  useEffect(() => {
    if (!keyword || isBlockedKeyword(keyword)) {
      setResults([]);
      setLoading(false);
      if (isBlockedKeyword(keyword)) {
        Swal.fire({ icon: "warning", title: "Từ khóa không được hỗ trợ", text: "Vui lòng tìm kiếm nội dung phù hợp.", confirmButtonText: "OK" });
      }
      return;
    }

    let isMounted = true;

    async function fetchData() {
      try {
        setLoading(true);

        const fetchAllPages = async (baseUrl, sourceName) => {
          try {
            if (!baseUrl) return [];
            const hasQuery = baseUrl.includes("?");
            const firstRes = await fetch(`${baseUrl}${hasQuery ? "&" : "?"}page=1`);
            if (!firstRes.ok) return [];
            const firstData = await firstRes.json();
            
            // HÀM XỬ LÝ DỮ LIỆU TỪ TỪNG NGUỒN (ĐẢM BẢO LUÔN TRẢ VỀ MẢNG)
            const extractItems = (data) => {
              if (!data) return [];
              if (Array.isArray(data?.data?.items)) return data.data.items;
              if (Array.isArray(data?.items)) return data.items;
              if (Array.isArray(data?.data)) return data.data;
              return [];
            };

            let allItems = extractItems(firstData);
            const totalPage = firstData?.data?.params?.pagination?.totalPages || 
                              firstData?.paginate?.total_page || 
                              firstData?.totalPages || 
                              firstData?.pagination?.totalPages || 1;

            // Giới hạn tối đa 5 trang mỗi nguồn để tránh nghẽn mạng và spam request
            const maxPages = Math.min(Number(totalPage) || 1, 5);

            if (maxPages > 1) {
              const fetchPromises = [];
              for (let i = 2; i <= maxPages; i++) {
                fetchPromises.push(
                  fetch(`${baseUrl}${hasQuery ? "&" : "?"}page=${i}`)
                    .then(res => (res.ok ? res.json() : null))
                    .catch(() => null)
                );
              }
              const remainingPagesData = await Promise.all(fetchPromises);
              remainingPagesData.forEach(data => {
                if (data) {
                  const items = extractItems(data);
                  if (items.length > 0) {
                    allItems = [...allItems, ...items];
                  }
                }
              });
            }
            return Array.isArray(allItems) ? allItems : [];
          } catch (error) {
            console.error(`[${sourceName}] Lỗi:`, error);
            return [];
          }
        };

        // 1. KKPhim
        const kkBase = process.env.REACT_APP_FILM_API_URL || "https://phimapi.com";
        const urlKk = `${kkBase}/v1/api/tim-kiem?keyword=${encodeURIComponent(keyword)}`;
        // 2. VSMOV (VM)
        const vmBase = process.env.REACT_APP_FILM_API_URL_2 || "https://vsmov.com";
        const urlVm = `${vmBase}/api/tim-kiem?keyword=${encodeURIComponent(keyword)}`;
        // 3. Nguồn C
        const ncBase = process.env.REACT_APP_FILM_API_URL_3 || "https://phim.nguonc.com";
        const urlNc = `${ncBase}/api/films/search?keyword=${encodeURIComponent(keyword)}`;

        // Fetch song song 3 nguồn: KK, VM, NC
        const [resKk, resVm, resNc] = await Promise.all([
          fetchAllPages(urlKk, "KK"),
          fetchAllPages(urlVm, "VM"),
          fetchAllPages(urlNc, "NC")
        ]);

        if (!isMounted) return;

        const getYearFromData = (f) => {
          if (!f) return "N/A";
          if (f.year) {
            if (typeof f.year === "string" || typeof f.year === "number") return String(f.year);
            if (typeof f.year === "object" && f.year?.name) return String(f.year.name);
          }
          if (f.category && typeof f.category === 'object') {
            const categories = Object.values(f.category);
            for (let cat of categories) {
              if (cat && cat.list && Array.isArray(cat.list)) {
                for (let item of cat.list) {
                  if (item && item.name) {
                    const name = String(item.name);
                    if (/^\d{4}$/.test(name)) return name;
                  }
                }
              }
            }
          }
          return "N/A";
        };

        const safeResKk = Array.isArray(resKk) ? resKk.filter(Boolean) : [];
        const safeResVm = Array.isArray(resVm) ? resVm.filter(Boolean) : [];
        const safeResNc = Array.isArray(resNc) ? resNc.filter(Boolean) : [];

        // Format data KKPhim: Giữ nguyên poster_url và thumb_url
        const normKk = safeResKk.map(f => {
          const poster = typeof f.poster_url === "string" ? f.poster_url : (typeof f.thumb_url === "string" ? f.thumb_url : "");
          const thumb = typeof f.thumb_url === "string" ? f.thumb_url : (typeof f.poster_url === "string" ? f.poster_url : "");
          return {
            ...f,
            sourceName: "KK",
            isKkphim: true,
            name: typeof f.name === "string" ? f.name : (f.name ? String(f.name) : "N/A"),
            original_name: typeof (f.origin_name || f.original_name) === "string" ? (f.origin_name || f.original_name) : "",
            poster_url: poster,
            thumb_url: thumb,
            slug: f.slug || f._id || "",
            path: f.slug || f._id || "",
            episode_total: f.episode_total || "",
            current_episode: f.episode_current || "",
            language: typeof f.lang === "string" ? f.lang : "N/A",
            time: typeof f.time === "string" ? f.time : "N/A",
            quality: typeof f.quality === "string" ? f.quality : "N/A",
            year: getYearFromData(f)
          };
        });

        // Format data VSMOV (VM): ĐẢO NGƯỢC (thumb_url làm poster đứng, poster_url làm thumb ngang)
        const normVm = safeResVm.map(f => {
          const rawPoster = typeof f.poster_url === "string" ? f.poster_url : "";
          const rawThumb = typeof f.thumb_url === "string" ? f.thumb_url : "";
          const poster = rawThumb || rawPoster;
          const thumb = rawPoster || rawThumb;
          return { 
            ...f, 
            sourceName: "VM", 
            isKkphim: false, 
            name: typeof f.name === "string" ? f.name : (f.name ? String(f.name) : "N/A"), 
            original_name: typeof (f.origin_name || f.original_name) === "string" ? (f.origin_name || f.original_name) : "", 
            poster_url: poster,
            thumb_url: thumb,
            slug: f.slug || f._id || "", 
            path: f.slug || f._id || "", 
            episode_total: f.episode_total || f.total_episodes || "", 
            current_episode: f.episode_current || f.current_episode || "", 
            language: typeof f.lang === "string" ? f.lang : "N/A", 
            time: typeof f.time === "string" ? f.time : "N/A", 
            quality: typeof f.quality === "string" ? f.quality : "N/A", 
            year: getYearFromData(f) 
          };
        });

        // Format data Nguồn C: ĐẢO NGƯỢC (thumb_url làm poster đứng, poster_url làm thumb ngang)
        const normNc = safeResNc.map(f => {
          const rawPoster = typeof f.poster_url === "string" ? f.poster_url : "";
          const rawThumb = typeof f.thumb_url === "string" ? f.thumb_url : "";
          const poster = rawThumb || rawPoster;
          const thumb = rawPoster || rawThumb;
          return { 
            ...f, 
            sourceName: "NC", 
            isKkphim: false, 
            name: typeof f.name === "string" ? f.name : (f.name ? String(f.name) : "N/A"), 
            original_name: typeof (f.original_name || f.origin_name) === "string" ? (f.original_name || f.origin_name) : "", 
            poster_url: poster, 
            thumb_url: thumb, 
            slug: f.slug || f.id || "", 
            path: f.slug || f.id || "", 
            episode_total: f.total_episodes || f.episode_total || "", 
            current_episode: f.current_episode || f.episode_current || "", 
            language: typeof (f.language || f.lang) === "string" ? (f.language || f.lang) : "N/A", 
            time: typeof f.time === "string" ? f.time : "N/A", 
            quality: typeof f.quality === "string" ? f.quality : "N/A", 
            year: getYearFromData(f) 
          };
        });

        const combined = [...normKk, ...normVm, ...normNc];
        
        // Lọc trùng lặp bằng cách nối slug và sourceName
        const uniqueResults = Array.from(
          new Map(
            combined
              .filter(item => item && item.slug)
              .map(item => [`${item.slug}-${item.sourceName}`, item])
          ).values()
        );

        setResults(uniqueResults);
      } catch (err) {
        console.error("Fetch search error:", err);
        setResults([]);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    fetchData();

    return () => {
      isMounted = false;
    };
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
    if (!url || typeof url !== "string") return "";
    const cleanUrl = url.trim();
    if (!cleanUrl) return "";
    
    // Nếu link đã là Full Path (http/https) -> Dùng trực tiếp
    if (cleanUrl.startsWith("http://") || cleanUrl.startsWith("https://")) return cleanUrl;
    if (cleanUrl.startsWith("//")) return `https:${cleanUrl}`;

    // Xử lý riêng cho VSMOV (nếu có relative path)
    if (sourceName === "VM") {
      return `https://vsmov.com/${cleanUrl.startsWith("/") ? cleanUrl.slice(1) : cleanUrl}`;
    }

    // Xử lý riêng cho KKPhim (nếu có relative path)
    if (sourceName === "KK") {
      return `https://phimimg.com/${cleanUrl.startsWith("/") ? cleanUrl.slice(1) : cleanUrl}`;
    }

    // Xử lý riêng cho NC (nếu có relative path)
    if (sourceName === "NC") {
      return `https://phim.nguonc.com/${cleanUrl.startsWith("/") ? cleanUrl.slice(1) : cleanUrl}`;
    }

    return cleanUrl;
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
        <input 
          type="text" 
          ref={inputRef} 
          className="input-film fst-italic" 
          placeholder="Tìm kiếm phim khác..." 
          value={search} 
          onChange={(e) => setSearch(e.target.value)} 
          onKeyDown={(e) => e.key === "Enter" && executeSearch()} 
        />
        <CiSearch className="search-film-icon" onClick={executeSearch} />
      </div>
      <h3 className="result-title fst-italic ms-3">
        <GoChevronLeft onClick={handleBack} style={{ cursor: "pointer", border: "1px solid #ddd", borderRadius: "50%" }} />
        <i className="ms-2">Kết quả cho: {keyword}</i>
      </h3>

      {results.length === 0 && (
        <p className="no-result">
          Không tìm thấy phim, hãy nhập lại đúng tên phim nhé, bạn có thể nhập một vài từ trong tên phim nếu bạn không nhớ rõ tên,
          lưu ý chỉ nhập tên phim và không viết tắt, không nhập các từ như phim, tập, mùa, phần, season, ss,... vào phần tìm kiếm vì thuật toán sẽ không hiểu được.
        </p>
      )}

      <div className={`film-grid ${hoverFilm ? "disable-hover" : ""}`}>
        {results.map((film) => (
          <Link 
            to={`/chi-tiet/${film.slug}`} 
            key={`${film.slug}-${film.sourceName}`} 
            className="film-card" 
            onMouseEnter={enablePreview ? () => handleMouseEnter(film) : undefined} 
            onMouseLeave={enablePreview ? handleMouseLeave : undefined}
          >
            <div className="film-poster-wrapper">
              {/* LABEL HIỂN THỊ NGUỒN PHIM */}
              <div style={{
                position: "absolute", top: "5px", left: "5px", 
                backgroundColor: film.sourceName === "KK" ? "#e50914" : film.sourceName === "VM" ? "#8e24aa" : "#2196f3", 
                color: "white", padding: "3px 8px", fontSize: "11px", fontWeight: "bold", 
                borderRadius: "4px", zIndex: 10, boxShadow: "0 2px 4px rgba(0,0,0,0.5)"
              }}>
                {film.sourceName}
              </div>

              <img 
                src={getPoster(film.poster_url, film.sourceName)} 
                alt={film.name} 
                className="film-poster" 
                loading="lazy" 
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = "https://placehold.co/300x450?text=No+Image";
                }}
              />
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
          <div 
            className="hover-preview-card" 
            onMouseLeave={() => setHoverFilm(null)} 
            ref={previewRef} 
            style={{ backgroundImage: `url(${getPoster(hoverFilm.thumb_url || hoverFilm.poster_url, hoverFilm.sourceName)})` }}
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
                  <Link to={`/chi-tiet/${hoverFilm.path || hoverFilm.slug}`} className="btn-watch">▶ Xem ngay</Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}