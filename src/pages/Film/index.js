import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";

export default function FilmListBySlug() {
  const { filmSlug } = useParams(); // /:filmSlug
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);

  // convert slug thành keyword tìm kiếm
  // ví dụ "attack-on-titan" → "attack on titan"
  const keyword = filmSlug.replace(/-/g, " ");

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);

        const url = `https://phimapi.com/v1/api/tim-kiem?keyword=${encodeURIComponent(
          keyword
        )}&limit=50`;

        const res = await fetch(url);
        const data = await res.json();

        setResults(data.data.items || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [keyword]); // load lại khi đổi slug

  if (loading)
    return (
      <div className="container py-4">
        <h4>Đang tải kết quả: {keyword}...</h4>
      </div>
    );

  return (
    <div className="container py-4">
      <h3 className="mb-4">Kết quả: {keyword}</h3>

      {results.length === 0 && <p>Không tìm thấy phim nào.</p>}

      <div className="row g-3">
        {results.map((film) => (
          <div className="col-6 col-md-3 col-lg-2" key={film.slug}>
            <Link
              to={`/phim/${film.slug}`}
              className="text-decoration-none text-dark"
            >
              <div className="card h-100 shadow-sm">
                <img
                  src={film.poster_url}
                  className="card-img-top"
                  alt={film.name}
                />
                <div className="card-body p-2">
                  <h6 className="mb-1 text-truncate">{film.name}</h6>
                  <small className="text-muted">{film.year}</small>
                </div>
              </div>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
