import { useEffect, useState, useMemo, useCallback } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { FaPlay, FaHeart, FaRegHeart, FaSyncAlt } from "react-icons/fa";
import { Helmet } from "react-helmet-async";
import { useFavoriteToggle } from "../../hooks/useFavorites";
import { useAuth } from "../../context/AuthContext";
import "./style.scss";

// TỪ ĐIỂN ĐỂ ĐỒNG BỘ TÊN SERVER VỚI TRANG XEM PHIM (FilmDetail)
const SOURCE_NAMES = {
  kk: "KK",
  kkphim: "KK",
  op: "OP",
  nc: "NC",
  nguonc: "NC"
};

export default function MovieDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const sourceFromSearch = location.state?.sourceName;
  const isRefreshParam = new URLSearchParams(location.search).get("refresh") === "true";

  const [movie, setMovie] = useState(null);
  const [sources, setSources] = useState([]);
  const [currentServer, setCurrentServer] = useState(0); 
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [imgConfig, setImgConfig] = useState({ poster: "", thumb: "" });

  const fetchMovieDetail = useCallback(async (forceRefresh = false) => {
    setLoading(true);
    setCurrentServer(0);
    try {
      const baseUrl = `${process.env.REACT_APP_SERVER_API_URL}/movie-detail/${slug}`;
      const shouldRefresh = forceRefresh || isRefreshParam;
      const firstUrl = shouldRefresh ? `${baseUrl}?refresh=true` : baseUrl;

      let res = await fetch(firstUrl);
      let data = await res.json();

      let m = data.data?.movie;
      let epList = data.data?.episodes || [];

      const checkHasM3u8 = (list) => {
        if (!Array.isArray(list) || list.length === 0) return false;
        return list.some(src => 
          (src.episodes || []).some(srv => 
            (srv.server_data || srv.items || []).some(ep => Boolean(ep.link_m3u8 || ep.m3u8))
          )
        );
      };

      const checkNcHasM3u8 = (list) => {
        if (!Array.isArray(list) || list.length === 0) return false;
        const nc = list.find(s => s.source?.toLowerCase() === "nc" || s.source?.toLowerCase() === "nguonc");
        if (!nc) return true;
        return (nc.episodes || []).some(srv => 
          (srv.server_data || srv.items || []).some(ep => Boolean(ep.link_m3u8 || ep.m3u8))
        );
      };

      const isNc = sourceFromSearch === "NC" || sourceFromSearch === "nguonc" || epList.some(s => s.source?.toLowerCase() === "nc" || s.source?.toLowerCase() === "nguonc");
      const lacksM3u8 = !checkHasM3u8(epList) || (isNc && !checkNcHasM3u8(epList));

      // Nếu chưa gọi refresh mà data thiếu m3u8 hoặc không có tập -> tự động gọi ?refresh=true
      if (!shouldRefresh && (!data.success || !m || epList.length === 0 || lacksM3u8)) {
        console.log(`[FilmDetail] Phim ${slug} chưa có m3u8 (NC: ${isNc}), đang tự động gọi ?refresh=true...`);
        setIsRefreshing(true);
        try {
          const refRes = await fetch(`${baseUrl}?refresh=true`);
          const refData = await refRes.json();
          if (refData.success && refData.data?.movie) {
            m = refData.data.movie;
            epList = refData.data.episodes || [];
          }
        } catch (refErr) {
          console.warn("[FilmDetail] Lỗi refresh phim:", refErr);
        } finally {
          setIsRefreshing(false);
        }
      }

      m = m || {};
      setMovie(m);

      // KIỂM TRA NGUỒN C VÀ OPHIM ĐỂ ĐẢO CHIỀU ẢNH NGAY TỪ LÚC FETCH
      const isNguonC_or_OPhim = 
        m.poster_url?.includes("phim.nguonc.com") || 
        m.thumb_url?.includes("phim.nguonc.com") ||
        m.poster_url?.includes("ophim") ||
        m.thumb_url?.includes("ophim");

      let p = isNguonC_or_OPhim ? m.thumb_url : m.poster_url;
      let t = isNguonC_or_OPhim ? m.poster_url : m.thumb_url;
      
      if (!p) p = t;
      if (!t) t = p;

      setImgConfig({ poster: p, thumb: t });
      setSources(epList);
    } catch (err) {
      console.error("Lỗi fetch chi tiết phim:", err);
    } finally {
      setLoading(false);
    }
  }, [slug, isRefreshParam, sourceFromSearch]);

  useEffect(() => {
    fetchMovieDetail();
  }, [fetchMovieDetail]);

  // GỘP, ĐỔI TÊN SERVER VÀ SẮP XẾP ƯU TIÊN (OP -> KK -> NC)
  const allServers = useMemo(() => {
    let list = [];
    sources.forEach(src => {
      const sourceLabel = SOURCE_NAMES[src.source] || src.source?.toUpperCase() || "Server";
      
      (src.episodes || []).forEach(srv => {
        // Lấy danh sách tập phim của server này
        const epList = srv.server_data || srv.items || [];
        
        // Kiểm tra xem server có data thực sự không (phải có ít nhất 1 tập chứa slug hợp lệ)
        const hasValidData = epList.some(ep => ep.slug && ep.slug.trim() !== "");

        // Chỉ đưa vào danh sách nếu server có dữ liệu
        if (hasValidData) {
          const episodeCount = epList.length;

          list.push({
            ...srv,
            server_name: `${sourceLabel} - ${srv.server_name}`, // giữ nguyên để URL không lỗi
            display_name: `${sourceLabel} - ${srv.server_name} (${episodeCount} tập)`, // chỉ để hiển thị
            original_name: srv.server_name,
            sourceName: sourceLabel,
            episodeCount
          });
        }
      });
    });

    // Mức độ ưu tiên càng nhỏ càng được xếp lên đầu
    const priority = {
      "KK": 1,
      "OP": 2,
      "NC": 3
    };

    list.sort((a, b) => {
      const rankA = priority[a.sourceName] || 99;
      const rankB = priority[b.sourceName] || 99;
      return rankA - rankB;
    });

    return list;
  }, [sources]);

  useEffect(() => {
    if (sourceFromSearch && allServers.length > 0) {
      const idx = allServers.findIndex(s => s.sourceName === sourceFromSearch);
      if (idx !== -1) {
        setCurrentServer(idx);
      }
    }
  }, [sourceFromSearch, allServers]);

  const currentServerObj = allServers[currentServer];
  const episodes = currentServerObj?.server_data || currentServerObj?.items || [];
  const currentServerName = currentServerObj?.server_name || "";

  // ĐÃ XÓA BỎ CONFIG PROXY HÌNH ẢNH VÀ ĐUÔI WEB P - TRẢ VỀ LINK GỐC TRỰC TIẾP
  function getImageUrl(url) {
    if (!url) return "";
    return url; // Trả thẳng link ảnh sạch từ API gốc
  }

  const posterUrl = getImageUrl(imgConfig.poster);
  const thumbUrl = getImageUrl(imgConfig.thumb);

  // ── FAVORITES ──
  const { isFavorited, loading: favLoading, init: initFav, toggle: toggleFav } = useFavoriteToggle(
    slug,
    movie?.name,
    posterUrl
  );

  useEffect(() => {
    if (movie && slug) initFav();
  }, [movie, slug, initFav]);

  return (
    <>
      <Helmet>
        <title>{movie?.name ? `${movie.name} Vietsub HD | Xem phim miễn phí - Tecede` : "Đang tải phim... - Tecede"}</title>
      </Helmet>

      {loading ? (
        <div className="movie-detail-container skeleton-mode">
          <div className="hero-section">
            <div className="hero-bg skeleton-animate" style={{ backgroundImage: 'none', background: '#1a1a1a' }} />
            <div className="hero-overlay" />
            <div className="hero-content">
              <div className="poster-wrapper"><div className="sk-poster skeleton-animate"></div></div>
              <div className="info-wrapper">
                <div className="sk-title-vn skeleton-animate"></div>
                <div className="sk-title-en skeleton-animate"></div>
                <div className="tag-container" style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '20px' }}>
                  {[...Array(5)].map((_, i) => <div key={i} className="sk-tag skeleton-animate"></div>)}
                </div>
                <div className="action-buttons mb-4"><div className="sk-btn-play skeleton-animate"></div></div>
              </div>
            </div>
          </div>

          <div className="episodes-section mt-3">
            <h5 className="mt-3 mb-3 fst-italic">Danh Sách Server</h5>
            <div className="server-tabs d-flex gap-2"><div className="sk-server-tab skeleton-animate"></div></div>
            <h5 className="mt-3 mb-3 fst-italic">Danh Sách Tập</h5>
            <div className="episode-grid">
              {[...Array(10)].map((_, i) => <div key={i} className="sk-ep-btn skeleton-animate"></div>)}
            </div>
          </div>
        </div>
      ) : !movie ? (
        <div className="error-screen">Không tải được dữ liệu phim!</div>
      ) : (
        <div className="movie-detail-container">
          <div className="hero-section">
            <div className="hero-bg" style={{ backgroundImage: `url(${thumbUrl})` }} />
            <div className="hero-overlay" />
            <div className="hero-content">
              <div className="poster-wrapper"><img src={posterUrl} alt={movie.name} loading="lazy" /></div>
              <div className="info-wrapper">
                <h1 className="title-vn">{movie.name}</h1>
                {movie.origin_name && <h2 className="title-en">{movie.origin_name} {movie.year ? `(${movie.year})` : ""}</h2>}
                <div className="tag-container">
                  <Tag text={movie.quality} color="#e50914" />
                  <Tag text={movie.lang} color="#007bff" />
                  <Tag text={movie.time} color="#9D4EDD" />
                  {movie.episode_current && (
                    <Tag text={`Trạng thái: ${movie.episode_current}`} color="#FF8500" />
                  )}
                  {movie.episode_total && (
                    <Tag text={`Tổng: ${movie.episode_total} tập`} color="#28a745" />
                  )}
                  {Array.isArray(movie.country) && movie.country.map(c => (
                    <Tag key={c.id} text={`Quốc gia: ${c.name}`} color="#ffc107" />
                  ))}
                  
                </div>
                <div className="action-buttons">
                  <button className="btn-play" onClick={() => {
                    if (!episodes.length) return;
                    navigate(`/xem-phim/${slug}/${encodeURIComponent(currentServerName)}/${episodes[0].slug}`,
                      { state: { movieData: movie, sourcesData: sources } });
                  }}>
                    <FaPlay className="me-1 mb-1" /> XEM NGAY
                  </button>

                  {user?.role === "admin" && (
                    <button 
                      className="btn-refresh" 
                      onClick={() => fetchMovieDetail(true)}
                      disabled={isRefreshing || loading}
                      title="Làm mới nguồn và cập nhật m3u8 (Chỉ dành cho Admin)"
                    >
                      <FaSyncAlt className={`me-1 ${isRefreshing ? "spin" : ""}`} /> 
                      {isRefreshing ? "Đang làm mới..." : "Làm mới nguồn"}
                    </button>
                  )}

                  {user && (
                    <button
                      className={`btn-favorite ${isFavorited ? "active" : ""}`}
                      onClick={toggleFav}
                      disabled={favLoading || isFavorited === null}
                      title={isFavorited ? "Bỏ yêu thích" : "Thêm vào yêu thích"}
                    >
                      {isFavorited ? <FaHeart /> : <FaRegHeart />}
                      <span>{isFavorited ? "Đã yêu thích" : "Yêu thích"}</span>
                    </button>
                  )}
                </div>
                <p className="movie_description">{movie.content?.replace(/<\/?[^>]+(>|$)/g, "") || "Đang cập nhật..."}</p>
              </div>
            </div>
          </div>

          <div className="episodes-section mt-3">
            {allServers.length > 0 && (
              <>
                <h5 className="mt-3 mb-3 fst-italic">Danh Sách Server</h5>
                <div className="server-tabs">
                  {allServers.map((s, i) => (
                    <button key={i} className={i === currentServer ? "active" : ""} onClick={() => setCurrentServer(i)}>
                      {s.display_name}
                    </button>
                  ))}
                </div>
              </>
            )}

            {episodes.length > 0 && (
              <>
                <h5 className="mt-3 mb-3 fst-italic">Danh Sách Tập</h5>
                <div className="episode-grid">
                  {episodes.map(ep => (
                    <button
                      key={ep.slug}
                      className="episode-card"
                      onClick={() => {
                        if (!ep?.slug) return;
                        navigate(`/xem-phim/${slug}/${encodeURIComponent(currentServerName)}/${ep.slug}`, 
                          { state: { movieData: movie, sourcesData: sources } });
                      }}
                    >
                      <div className="ep-info">
                        <span className="ep-name">{ep.name}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}

function Tag({ text, color }) {
  if (!text) return null;
  return <span className="info-tag" style={{ borderLeft: `3px solid ${color || '#444'}` }}>{text}</span>;
}