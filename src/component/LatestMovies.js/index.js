import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "./style.scss";

export default function LatestMoviesTable() {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const res = await fetch(
          `${process.env.REACT_APP_FILM_API_URL}/danh-sach/phim-moi-cap-nhat?page=${currentPage}`
        );
        const data = await res.json();

        const items = data.items || [];
        setMovies(items);

        // Xử lý phân trang: ưu tiên lấy từ pagination, nếu không có thì tính từ tổng item nếu có
        if (data.pagination && data.pagination.totalPages) {
          setTotalPages(data.pagination.totalPages);
        } else if (data.totalItems && data.totalItemsPerPage) {
          setTotalPages(Math.ceil(data.totalItems / data.totalItemsPerPage));
        } else {
          // Fallback: ước lượng nếu có đủ item, nếu không giữ nguyên trang hiện tại
          setTotalPages(items.length > 0 ? currentPage : 1);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [currentPage]);

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
    const element = document.getElementById("latest-movies");
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  /* ================= UTILS ================= */
  const getPoster = (url) => {
    if (!url) return "";
    if (url.startsWith("http")) return url; // URL tuyệt đối thì dùng luôn
    // Nếu là relative, ghép với CDN
    return `https://phimimg.com/${url.startsWith("/") ? url.slice(1) : url}`;
  };

  if (loading) return <p>Đang tải dữ liệu...</p>;

  return (
    <>
      <div className="mb-1">
        <h2 className="film-category pt-4 pb-2 border-top" id="latest-movies">
          Phim mới cập nhật (KK)
        </h2>
      </div>
      <div className="movie-table-wrapper">
        <table className="movie-table">
          <thead>
            <tr>
              <th className="col-name text-start">Tên phim</th>
              <th>Tình trạng</th>
              <th>Ngày cập nhật</th>
            </tr>
          </thead>
          <tbody>
            {movies.map((movie) => {
              // Lấy trạng thái hiển thị: ưu tiên episode_current, nếu không có thì dùng tmdb
              let status = movie.episode_current || "";
              if (!status) {
                // fallback về logic cũ
                status =
                  movie.tmdb?.type === "tv" && movie.tmdb?.season
                    ? `Tập ${movie.tmdb.season}`
                    : "Full";
              }

              return (
                <tr key={movie._id}>
                  {/* Cột tên + ảnh */}
                  <td className="col-name">
                    <img
                      // DÙNG POSTER_URL TRƯỚC, FALLBACK VỀ THUMB_URL
                      src={getPoster(movie.poster_url || movie.thumb_url)}
                      alt={movie.name}
                      loading="lazy"
                    />
                    <div>
                      <Link to={`/chi-tiet/${movie.slug}`} className="title">
                        {movie.name}
                      </Link>
                      <p className="origin">({movie.origin_name})</p>
                    </div>
                  </td>

                  {/* Tình trạng */}
                  <td>
                    <span
                      className={`status ${
                        status === "Full" ? "full" : "updating"
                      }`}
                    >
                      {status}
                    </span>
                  </td>

                  {/* Ngày cập nhật */}
                  <td className="date">
                    {movie.modified?.time?.replace("T", " ").slice(0, 19)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* PHÂN TRANG */}
      <div className="pagination-controls d-flex justify-content-center align-items-center gap-3 mt-4">
        <button
          className="btn btn-sm btn-outline-light"
          disabled={currentPage === 1}
          onClick={() => handlePageChange(currentPage - 1)}
        >
          Trang trước
        </button>

        <span className="text-white">
          Trang {currentPage} / {totalPages}
        </span>

        <button
          className="btn btn-sm btn-outline-light"
          disabled={currentPage >= totalPages}
          onClick={() => handlePageChange(currentPage + 1)}
        >
          Trang sau
        </button>
      </div>
    </>
  );
}