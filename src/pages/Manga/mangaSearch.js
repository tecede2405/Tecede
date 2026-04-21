import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import ComicCard from "../../component/MangaCard";
import MangaSearch from "../../component/SearchComic/index";
import { IoIosArrowDropleft } from "react-icons/io";

export default function SearchResult() {
  const { slug } = useParams();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {
    const keyword = slug.replace(/-/g, " ");

    setLoading(true);

    fetch(`${process.env.REACT_APP_TRUYEN_API}/tim-kiem?keyword=${keyword}`)
      .then((res) => res.json())
      .then((res) => {
        setData(res.data?.items || []);
      })
      .catch(() => {
        setData([]);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [slug]);

  return (
    <div className="searchResult mb-3 ps-3 pe-3">
      <MangaSearch />

      <h3 className="text-light mb-3 mt-3 d-flex align-items-center gap-2">
        <IoIosArrowDropleft
          style={{ cursor: "pointer", fontSize: "24px" }}
          onClick={() => navigate("/truyen")}
        />
        Kết quả tìm cho: <span className="text-warning">{slug}</span>
      </h3>

      {/* Loading */}
      {loading && (
        <div className="text-center text-light mt-4">
          Đang tìm kiếm...
        </div>
      )}

      {/* Không có kết quả */}
      {!loading && data.length === 0 && (
        <div className="text-center text-light mt-4">
          Không tìm thấy truyện phù hợp
        </div>
      )}

      {/* Có dữ liệu */}
      {!loading && data.length > 0 && (
        <div className="comicGrid">
          {data.map((item) => (
            <ComicCard key={item._id} comic={item} />
          ))}
        </div>
      )}
    </div>
  );
}