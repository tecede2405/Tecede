import { useState, useEffect } from "react"; 
import { Link } from "react-router-dom";

import "./style.scss";
function TrendingAnime() {
  const [anime, setAnime] = useState([]);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    fetch("https://kitsu.io/api/edge/trending/anime")
      .then((res) => res.json())
      .then((data) => {
        setAnime(data.data); // trong Kitsu API, kết quả nằm trong data.data
        setSelected(data.data[0]);
      })
      .catch((err) => {
        console.error("Error fetching trending anime:", err);
   
      });
  }, []);

  if (!selected) return <p>Loading...</p>;

  const attr = selected.attributes;
  return (
    <>
    <h1 className="trending-title">Anime phổ biến hiện nay</h1>
    <div
      className="banner"
      style={{
        backgroundImage: `url(${attr.coverImage?.original || attr.posterImage?.large})`,
      }}
    >
      <div className="banner__overlay">
        <div className="banner__content">
          <h1 className="banner__title">{attr.canonicalTitle}</h1>
          <div className="banner__meta">
            ⭐ {attr.averageRating || "N/A"} | {attr.episodeCount || "??"} tập
          </div>
          <Link to={`/anime/${selected.id}`}>
          <button className="banner__btn">▶ Xem ngay</button>
          </Link>
        </div>

        <div className="banner__thumbs">
          {anime.map((item) => (
            <img
              key={item.id}
              src={item.attributes.posterImage?.small}
              alt={item.attributes.canonicalTitle}
              className={`banner__thumb ${
                item.id === selected.id ? "active" : ""
              }`}
              onClick={() => setSelected(item)}
            />
          ))}
        </div>
      </div>
    </div>
    </>

  );
}

export default TrendingAnime;
