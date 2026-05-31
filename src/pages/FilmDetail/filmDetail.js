import { useEffect, useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FaPlay } from "react-icons/fa";
import { Helmet } from "react-helmet-async";
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

  const [movie, setMovie] = useState(null);
  const [sources, setSources] = useState([]);
  const [currentServer, setCurrentServer] = useState(0); 
  const [loading, setLoading] = useState(true);
  const [imgConfig, setImgConfig] = useState({ poster: "", thumb: "" });

  useEffect(() => {
    setLoading(true);
    // Reset server về 0 khi chuyển phim khác
    setCurrentServer(0);
    fetch(`${process.env.REACT_APP_SERVER_API_URL}/movie-detail/${slug}`)
      .then(res => res.json())
      .then(data => {
        const m = data.data?.movie || {};
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
        setSources(data.data?.episodes || []);
      })
      .finally(() => setLoading(false));
  }, [slug]);

  // GỘP, ĐỔI TÊN SERVER VÀ SẮP XẾP ƯU TIÊN (OP -> KK -> NC)
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
          list.push({
            ...srv,
            // Đặt tên server giống hệt logic bên FilmDetail để URL map trúng 100%
            server_name: `${sourceLabel} - ${srv.server_name}`,
            original_name: srv.server_name, // Giữ lại tên gốc nếu cần
            sourceName: sourceLabel
          });
        }
      });
    });

    // Mức độ ưu tiên càng nhỏ càng được xếp lên đầu
    const priority = {
      "OP": 1,
      "KK": 2,
      "NC": 3
    };

    list.sort((a, b) => {
      const rankA = priority[a.sourceName] || 99;
      const rankB = priority[b.sourceName] || 99;
      return rankA - rankB;
    });

    return list;
  }, [sources]);

  const currentServerObj = allServers[currentServer];
  const episodes = currentServerObj?.server_data || currentServerObj?.items || [];
  const currentServerName = currentServerObj?.server_name || "";

  // KHÔNG CHẠY PROXY CHO OPHIM VÀ NGUỒN C
  function getImageUrl(url) {
    if (!url) return "";
    if (url.includes("phim.nguonc.com") || url.includes("ophim")) {
      return url;
    }
    return `${process.env.REACT_APP_FILM_API_URL}/image.php?url=${encodeURIComponent(url)}`;
  }

  const posterUrl = getImageUrl(imgConfig.poster);
  const thumbUrl = getImageUrl(imgConfig.thumb);

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
                <button className="btn-play" onClick={() => {
                  if (!episodes.length) return;
                  // Truyền đúng tên Server đã được nối chữ và có mức độ ưu tiên sang URL
                  navigate(`/xem-phim/${slug}/${encodeURIComponent(currentServerName)}/${episodes[0].slug}`, 
                    { state: { movieData: movie, sourcesData: sources } });
                }}>
                  <FaPlay className="me-1 mb-1" /> XEM NGAY
                </button>
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
                      {s.server_name}
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