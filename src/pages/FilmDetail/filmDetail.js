import { useEffect, useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FaPlay } from "react-icons/fa";
import { Helmet } from "react-helmet-async";
import "./style.scss";

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
    fetch(`${process.env.REACT_APP_SERVER_API_URL}/movie-detail/${slug}`)
      .then(res => res.json())
      .then(data => {
        const m = data.data?.movie || {};
        setMovie(m);
        
        // Khôi phục logic đảo poster/thumb cũ
        const isKk = m.poster_url?.includes("phimimg.com");
        let p = isKk ? m.poster_url : m.thumb_url;
        let t = isKk ? m.thumb_url : m.poster_url;
        if (!p) p = t;
        if (!t) t = p;

        setImgConfig({ poster: p, thumb: t });
        setSources(data.data?.episodes || []);
      })
      .finally(() => setLoading(false));
  }, [slug]);

  // GỘP TẤT CẢ SERVER VÀO 1 DANH SÁCH DUY NHẤT
  const allServers = useMemo(() => {
    let list = [];
    sources.forEach(src => {
      (src.episodes || []).forEach(srv => {
        list.push({
          ...srv,
          sourceName: src.source
        });
      });
    });
    return list;
  }, [sources]);

  const currentServerObj = allServers[currentServer];
  const episodes = currentServerObj?.server_data || currentServerObj?.items || [];
  const currentServerName = currentServerObj?.server_name || "";

  function getImageUrl(url) {
    if (!url) return "";
    // Nếu là domain của KKPhim thì nối proxy
    if (url.includes("phimimg.com")) {
      return `${process.env.REACT_APP_FILM_API_URL}/image.php?url=${encodeURIComponent(url)}`;
    }
    return url;
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
                  {/* CÁC TAG BỊ THIẾU ĐÃ ĐƯỢC KHÔI PHỤC */}
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
                      {s.server_name} <small style={{opacity: 0.6}}>({s.sourceName.toUpperCase()})</small>
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