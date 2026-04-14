import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FaPlay } from "react-icons/fa";
import { Helmet } from "react-helmet-async";
import "./style.scss"; 

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
                <div className="skeleton-tag"></div>
                <div className="skeleton-tag"></div>
              </div>

              {/* BUTTON */}
              <div className="skeleton-btn"></div>

              {/* DESCRIPTION */}
              <div className="skeleton-text desc"></div>
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
  

  const episodes = servers[currentServer]?.server_data || [];
  

  return (
  <>
    <Helmet>
      <title>
        {movie?.name
          ? `${movie.name} Vietsub HD | Xem phim miễn phí - Tecede`
          : "Đang tải phim... - Tecede"}
      </title>

      <meta
        name="description"
        content={
          movie?.content
            ?.replace(/<\/?[^>]+(>|$)/g, "")
            ?.slice(0, 150) ||
          "Xem phim miễn phí, cập nhật nhanh tại Tecede"
        }
      />

      {/* Open Graph */}
      <meta
        property="og:title"
        content={
          movie?.name
            ? `${movie.name} - Xem phim miễn phí`
            : "Tecede - Xem phim miễn phí"
        }
      />

      <meta
        property="og:description"
        content={
          movie?.content
            ?.replace(/<\/?[^>]+(>|$)/g, "")
            ?.slice(0, 150) ||
          "Xem phim miễn phí tại Tecede"
        }
      />

      <meta
        property="og:image"
        content={
          movie?.poster_url
            ? `${process.env.REACT_APP_FILM_API_URL}/image.php?url=${encodeURIComponent(
                movie.poster_url
              )}`
            : ""
        }
      />
    </Helmet>

    {loading ? (
      <MovieDetailSkeleton />
    ) : !movie ? (
      <div className="error-screen">Không tải được dữ liệu phim!</div>
    ) : (
      <div className="movie-detail-container">
        {/* HERO SECTION */}
        <div className="hero-section">
          <div
            className="hero-bg"
            style={{
              backgroundImage: `url(${process.env.REACT_APP_FILM_API_URL}/image.php?url=${encodeURIComponent(
                movie.thumb_url
              )})`,
            }}
          />
          <div className="hero-overlay" />

          <div className="hero-content">
            <div className="poster-wrapper">
              <img
                src={`${process.env.REACT_APP_FILM_API_URL}/image.php?url=${encodeURIComponent(
                  movie.poster_url
                )}`}
                alt={movie.name}
                loading="lazy"
              />
            </div>

            <div className="info-wrapper">
              <h1 className="title-vn">{movie.name}</h1>
              <h2 className="title-en">
                {movie.origin_name} ({movie.year})
              </h2>

              <div className="tag-container">
                <Tag text={movie.quality} color="#e50914" />
                <Tag text={movie.lang} color="#007bff" />
                <Tag text={movie.time} color="#9D4EDD" />
                <Tag
                  text={`Trạng thái: ${movie.episode_current}`}
                  color="#FF8500"
                />
                <Tag
                  text={`Tổng : ${movie.episode_total} tập`}
                  color="#28a745"
                />

                {movie.country?.map((c) => (
                  <Tag
                    key={c.id}
                    text={`Quốc gia: ${c.name}`}
                    color="#ffc107"
                  />
                ))}
              </div>

              <div className="action-buttons">
                <button
                  className="btn-play"
                  onClick={() => {
                    if (!servers.length || !episodes.length) return;

                    const firstServer =
                      servers[currentServer]?.server_name;
                    const firstEp = episodes[0]?.slug;

                    if (!firstServer || !firstEp) return;

                    navigate(
                      `/xem-phim/${slug}/${encodeURIComponent(
                        firstServer
                      )}/${firstEp}`
                    );
                  }}
                >
                  <FaPlay className="me-1 mb-1" /> XEM NGAY
                </button>
              </div>

              <p className="movie_description">
                {movie.content
                  ?.replace(/<\/?[^>]+(>|$)/g, "")
                  ?.replace(/&quot;/g, '"') ||
                  "Đang cập nhật nội dung..."}
              </p>
            </div>
          </div>
        </div>

        {/* EPISODES */}
        <div className="episodes-section mt-3">
          <h3 className="mb-3 fst-italic">Danh Sách Tập</h3>

          <div className="section-header">
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
                      `/xem-phim/${slug}/${encodeURIComponent(
                        currentServerName
                      )}/${ep.slug}`
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
    )}
  </>
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