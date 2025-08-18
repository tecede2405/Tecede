import { useState, useEffect } from "react";
import "./index.scss";
import PopularAnime from "../../component/PolularAnime/index";
import {Link } from "react-router-dom";
import SearchBar from "../../component/SearchAnime/index";


function KitsuAnime() { 
  const [data, setData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const itemsPerPage = 10;

 useEffect(() => {
  const offset = (currentPage - 1) * itemsPerPage;

  let url = `https://kitsu.io/api/edge/anime?page[limit]=${itemsPerPage}&page[offset]=${offset}`;

  // nếu có searchTerm thì gọi API filter[text]
  if (searchTerm.trim() !== "") {
    url = `https://kitsu.io/api/edge/anime?filter[text]=${encodeURIComponent(
      searchTerm
    )}&page[limit]=${itemsPerPage}&page[offset]=${offset}`;
  }

  fetch(url)
    .then((res) => res.json())
    .then((data) => {
      setData(data.data);
      setTotal(data.meta?.count || 0);
    })
    .catch((err) => console.error("Error:", err));
}, [currentPage, searchTerm]);

  const totalPages = Math.ceil(total / itemsPerPage);
  const paginationData = data;

  const filteredData = paginationData.filter((anime) =>
  anime.attributes.canonicalTitle &&
  anime.attributes.canonicalTitle.toLowerCase().includes(searchTerm.toLowerCase())
);


  return (
    <div className="kitsu-anime">
      <h1 className="kitsu-anime__title">Demo Trang Xem Anime</h1>
      <PopularAnime />
      <SearchBar onSearch={setSearchTerm} />
      <div className="kitsu-anime__grid">
        {filteredData.map((anime) => (
          <Link to={`/anime/${anime.id}`} key={anime.id}>
          <div className="anime-card">
            <img
              className="anime-card__thumb"
              src={anime.attributes.posterImage.small}
              alt={anime.attributes.canonicalTitle}
            />
            <div className="anime-card__content">
              <h2 className="anime-card__name">{anime.attributes.canonicalTitle}</h2>
              <p className="anime-card__synopsis">{anime.attributes.synopsis}</p>
            </div>
          </div>
        </Link>
        ))}
      </div>

      <div className="kitsu-anime__pagination">
        <button
          className="kitsu-anime__btn kitsu-anime__btn--prev"
          onClick={() => setCurrentPage(currentPage - 1)}
          disabled={currentPage === 1}
        >
          Quay lại
        </button>
        <button
          className="kitsu-anime__btn kitsu-anime__btn--next"
          onClick={() => setCurrentPage(currentPage + 1)}
          disabled={currentPage === totalPages}
        >
          Tiếp theo
        </button>
      </div>
    </div>
  );
}

export default KitsuAnime;
