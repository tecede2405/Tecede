import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "./style.scss";

export default function LatestMoviesTable() {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch(
          `${process.env.REACT_APP_FILM_API_URL}/danh-sach/phim-moi-cap-nhat?page=1`
        );
        const data = await res.json();
        setMovies(data.items || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  if (loading) return <p>Đang tải dữ liệu...</p>;

  return (
    <>
      <div className="mb-1">
        <h2 className="film-category pt-4 pb-2 border-top">Phim mới cập nhật</h2>
      </div>
      <div className="movie-table-wrapper">
        <table className="movie-table">
          <thead>
            <tr>
              <th>TÊN</th>
              <th>TÌNH TRẠNG</th>
              <th>NGÀY CẬP NHẬT</th>
            </tr>
          </thead>

          <tbody>
            {movies.map((movie) => {
              const status =
                movie.tmdb?.type === "tv" && movie.tmdb?.season
                  ? `Tập ${movie.tmdb.season}`
                  : "Full";

              return (
                <tr key={movie._id}>
                  {/* TÊN */}
                  <td className="col-name">
                    <img
                      src={movie.poster_url}
                      alt={movie.name}
                      loading="lazy"
                    />
                    <div>
                      <Link to={`/film/${movie.slug}`} className="title">
                        {movie.name}
                      </Link>
                      <p className="origin">({movie.origin_name})</p>
                    </div>
                  </td>

                  {/* TÌNH TRẠNG */}
                  <td>
                    <span
                      className={`status ${
                        status === "Full" ? "full" : "updating"
                      }`}
                    >
                      {status}
                    </span>
                  </td>

                  {/* NGÀY CẬP NHẬT */}
                  <td className="date">
                    {movie.modified?.time
                      ?.replace("T", " ")
                      .slice(0, 19)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
    
}
