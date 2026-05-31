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
        
        setMovies(data.items || []);
        // Lấy tổng số trang từ API (điều chỉnh key dựa trên cấu trúc API thực tế của bạn)
        setTotalPages(data.pagination?.totalPages || 10); 
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [currentPage]);

  const handlePageChange = (newPage) => {
    // 1. Cập nhật trang
    setCurrentPage(newPage);

    // 2. Cuộn ngay lập tức về tiêu đề
    const element = document.getElementById("latest-movies");
    if (element) {
      // Cách cuộn đơn giản và hiệu quả nhất
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
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
          {/* ... (Phần thead và tbody giữ nguyên như cũ) ... */}
          <tbody>
            {movies.map((movie) => {
              // Khôi phục logic status gốc của bạn
              const status =
                movie.tmdb?.type === "tv" && movie.tmdb?.season
                  ? `Tập ${movie.tmdb.season}`
                  : "Full";

              return (
                <tr key={movie._id}>
                  {/* TÊN - Khôi phục cột Tên + Origin Name */}
                  <td className="col-name">
                    <img
                      src={`${process.env.REACT_APP_FILM_API_URL}/image.php?url=${encodeURIComponent(movie.poster_url)}`}
                      alt={movie.name}
                      loading="lazy"
                    />
                    <div>
                      <Link to={`/chi-tiet/${movie.slug}`} className="title">
                        {movie.name}
                      </Link>
                      {/* Khôi phục Origin Name */}
                      <p className="origin">({movie.origin_name})</p>
                    </div>
                  </td>

                  {/* TÌNH TRẠNG - Khôi phục logic status */}
                  <td>
                    <span className={`status ${status === "Full" ? "full" : "updating"}`}>
                      {status}
                    </span>
                  </td>

                  {/* NGÀY CẬP NHẬT */}
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
        
        <span className="text-white">Trang {currentPage} / {totalPages}</span>
        
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