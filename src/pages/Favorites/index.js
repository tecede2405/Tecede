import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaHeart, FaTrash } from "react-icons/fa";
import { MdMovieFilter } from "react-icons/md";
import Swal from "sweetalert2";
import { fetchFavorites, removeFavorite } from "../../hooks/useFavorites";
import { useAuth } from "../../context/AuthContext";
import "./style.scss";

export default function FavoritesPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingSlug, setDeletingSlug] = useState(null);

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }
    (async () => {
      setLoading(true);
      const list = await fetchFavorites();
      setFavorites(list);
      setLoading(false);
    })();
  }, [user, navigate]);

  const handleRemove = async (movie_path, movie_name) => {
    const result = await Swal.fire({
      title: "Xóa khỏi yêu thích?",
      html: `Bạn có chắc muốn xóa <strong>${movie_name}</strong> khỏi danh sách yêu thích không?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Xóa",
      cancelButtonText: "Hủy",
      confirmButtonColor: "#e50914",
      cancelButtonColor: "rgba(255,255,255,0.08)",
      background: "#1a1a2e",
      color: "#e0e0e0",
      customClass: {
        popup: "swal-dark-popup",
        confirmButton: "swal-confirm-red",
        cancelButton: "swal-cancel-ghost",
      },
    });

    if (!result.isConfirmed) return;

    setDeletingSlug(movie_path);
    await removeFavorite(movie_path);
    setFavorites((prev) => prev.filter((f) => f.movie_path !== movie_path));
    setDeletingSlug(null);

    Swal.fire({
      icon: "success",
      title: "Đã xóa!",
      text: `${movie_name} đã được xóa khỏi yêu thích.`,
      timer: 1800,
      showConfirmButton: false,
      background: "#1a1a2e",
      color: "#e0e0e0",
    });
  };

  /* ──── RENDER ──── */
  if (!user) return null;

  return (
    <div className="fav-page">
      {/* ── HEADER ── */}
      <div className="fav-header">
        <div className="fav-header-inner">
          <FaHeart className="fav-header-icon" />
          <h1 className="fav-header-title">Phim Yêu Thích</h1>
          {!loading && (
            <span className="fav-count">{favorites.length} phim</span>
          )}
        </div>
      </div>

      {/* ── LOADING ── */}
      {loading && (
        <div className="fav-grid">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="fav-card skeleton">
              <div className="fav-skeleton-img" />
              <div className="fav-skeleton-text" />
            </div>
          ))}
        </div>
      )}

      {/* ── EMPTY ── */}
      {!loading && favorites.length === 0 && (
        <div className="fav-empty">
          <MdMovieFilter className="fav-empty-icon" />
          <h3>Chưa có phim yêu thích</h3>
          <p>Hãy nhấn nút ❤️ trên trang phim để lưu lại nhé!</p>
          <button className="fav-browse-btn" onClick={() => navigate("/")}>
            Khám phá phim ngay
          </button>
        </div>
      )}

      {/* ── GRID ── */}
      {!loading && favorites.length > 0 && (
        <div className="fav-grid">
          {favorites.map((film) => (
            <div key={film.id ?? film.movie_path} className="fav-card">
              {/* Poster */}
              <Link to={`/chi-tiet/${film.movie_path}`} className="fav-poster-link">
                <div className="fav-poster-wrapper">
                  <img
                    src={film.image || ""}
                    alt={film.movie_name}
                    className="fav-poster-img"
                    loading="lazy"
                    onError={(e) => {
                      e.target.style.display = "none";
                    }}
                  />
                  <div className="fav-poster-overlay">
                    <span className="fav-play-icon">▶</span>
                  </div>
                </div>
              </Link>

              {/* Info */}
              <div className="fav-card-info">
                <Link to={`/chi-tiet/${film.movie_path}`} className="fav-movie-name">
                  {film.movie_name}
                </Link>
                <span className="fav-movie-date">
                  {film.created_at
                    ? new Date(film.created_at).toLocaleDateString("vi-VN")
                    : ""}
                </span>
              </div>

              {/* Remove button */}
              <button
                className="fav-remove-btn"
                disabled={deletingSlug === film.movie_path}
                onClick={() => handleRemove(film.movie_path, film.movie_name)}
                title="Xóa khỏi yêu thích"
              >
                {deletingSlug === film.movie_path ? (
                  <span className="fav-remove-spinner" />
                ) : (
                  <FaTrash />
                )}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
