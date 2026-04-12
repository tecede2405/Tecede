import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./style.scss"; // Xem file CSS ở dưới

export default function MovieDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();

  const [movie, setMovie] = useState(null);
  const [servers, setServers] = useState([]);
  const [currentServer, setCurrentServer] = useState(0);
  const [loading, setLoading] = useState(true);
  const currentServerName = servers[currentServer]?.server_name || "";
  

  useEffect(() => {
    setLoading(true);
    fetch(`${process.env.REACT_APP_SERVER_API_URL}/movie-detail/${slug}`)
      .then(res => res.json())
      .then(data => {
        setMovie(data.movie || null);
        setServers(data.episodes || []);
      })
      .catch(() => setMovie(null))
      .finally(() => setLoading(false));
  }, [slug]);


  function MovieDetailSkeleton() {
    return (
      <div className="movie-detail-container skeleton">
        {/* HERO */}
        <div className="hero-section">

          <div className="hero-bg skeleton-bg"></div>
          <div className="hero-overlay" />

          <div className="hero-content">

            {/* POSTER */}
            <div className="poster-wrapper">
              <div className="skeleton-poster"></div>
            </div>

            {/* INFO */}
            <div className="info-wrapper">

              <div className="skeleton-text title"></div>
              <div className="skeleton-text subtitle"></div>

              {/* TAG */}
              <div className="tag-container">
                <div className="skeleton-tag"></div>
                <div className="skeleton-tag"></div>
                <div className="skeleton-tag"></div>
                <div className="skeleton-tag"></div>
              </div>

              {/* BUTTON */}
              <div className="skeleton-btn"></div>

              {/* DESCRIPTION */}
              <div className="skeleton-text desc"></div>
              <div className="skeleton-text desc"></div>
              <div className="skeleton-text desc short"></div>

            </div>
          </div>
        </div>

        {/* EPISODES */}
        <div className="episodes-section">

          <div className="section-header">
            <div className="skeleton-text header"></div>

            <div className="server-tabs">
              <div className="skeleton-pill"></div>
              <div className="skeleton-pill"></div>
            </div>
          </div>

          <div className="episode-grid">
            {[...Array(18)].map((_, i) => (
              <div key={i} className="episode-card skeleton-episode"></div>
            ))}
          </div>

        </div>
      </div>
    );
  }
  
  if (loading) return <MovieDetailSkeleton />;
  if (!movie) return <div className="error-screen">Không tải được dữ liệu phim!</div>;

  const episodes = servers[currentServer]?.server_data || [];
  

  return (
    <div className="movie-detail-container">
      {/* HERO SECTION */}
      <div className="hero-section">
        <div
          className="hero-bg"
          style={{
            backgroundImage: `url(${process.env.REACT_APP_FILM_API_URL}/image.php?url=${encodeURIComponent(movie.thumb_url)})`
          }}
        />
        <div className="hero-overlay" />
        
        <div className="hero-content">
          <div className="poster-wrapper">
            <img
              src={`${process.env.REACT_APP_FILM_API_URL}/image.php?url=${encodeURIComponent(movie.poster_url)}`}
              alt={movie.name}
              loading="lazy"
            />
          </div>

          <div className="info-wrapper">
            <h1 className="title-vn">{movie.name}</h1>
            <h2 className="title-en">{movie.origin_name} ({movie.year})</h2>

            <div className="tag-container">
              <Tag text={movie.quality} color="#e50914" />
              <Tag text={movie.lang} color="#007bff" />
              <Tag text={movie.time} />
              <Tag text={movie.episode_current} />
            </div>

            <div className="action-buttons">
              <button 
                className="btn-play"
                onClick={() => {
                    if (!servers.length || !episodes.length) return;

                    const firstServer = servers[currentServer]?.server_name;
                    const firstEp = episodes[0]?.slug;

                    if (!firstServer || !firstEp) return;

                    navigate(
                      `/xem-phim/${slug}/${encodeURIComponent(firstServer)}/${firstEp}`,
                    );
                  }}
              >
                ▶ XEM NGAY
              </button>
            </div>

            <p className="description">
              {movie.content?.replace(/<\/?[^>]+(>|$)/g, "") || "Đang cập nhật nội dung..."}
            </p>
          </div>
        </div>
      </div>

      {/* EPISODES SECTION */}
      <div className="episodes-section mt-3">
        <div className="section-header">
          <h3 className="title-vn">Danh sách tập</h3>
          <div className="server-tabs">
            {servers.map((s, i) => (
              <button
                key={i}
                className={i === currentServer ? "active" : ""}
                onClick={() => setCurrentServer(i)}
              >
                {s.server_name}
              </button>
            ))}
          </div>
        </div>

        <div className="episode-grid">
          {episodes.length === 0 ? (
            <p className="empty-msg">Sắp ra mắt...</p>
          ) : (
            episodes.map((ep) => (
              <button
                key={ep.slug}
                className="episode-card"
                onClick={() => {
                  if (!ep?.slug) return;
                  navigate(
                    `/xem-phim/${slug}/${encodeURIComponent(currentServerName)}/${ep.slug}`
                  );
                }}
              >
                <div className="ep-info">
                  <span className="ep-name">{ep.name}</span>
                </div>
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

function Tag({ text, color }) {
  if (!text) return null;
  return (
    <span
      className="info-tag"
      style={{ borderLeft: color ? `3px solid ${color}` : "1px solid #444" }}
    >
      {text}
    </span>
  );
}