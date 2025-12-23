import FilmCarousel from "../CoverflowCarousel/index";
import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { CiSearch } from "react-icons/ci";
import "./style.scss";
const filmData = [
    {title: "Hôn Lễ Của Em", image: "https://phimimg.com/upload/vod/20231209-1/ff4ebc9bc993697a594d5c1cc0a47793.jpg", path: "hon-le-cua-em",episode_current: "Full"},
    {title: "Song Quỹ", image: "https://phimimg.com/upload/vod/20251214-1/ce49bd08edb91c937516a7d27bb08ccd.jpg", path: "song-quy", episode_current: "Hoàn Tất (29/29)"},
    {title: "Tết Ở Làng Địa Ngục", image: "https://ik.imagekit.io/yuki/20240113-1/bde8e52f94a9e35d8f993104d5bb86e2.jpg", path: "tet-o-lang-dia-nguc", episode_current: "Hoàn Tất (12/12)"},
    {title: "Tiệm Ăn Của Quỷ", image: "https://ik.imagekit.io/yuki/20250126-1/8da0fb28e2333a5602112cbcc04e8c14.jpg", path: "tiem-an-cua-quy", episode_current: "Hoàn Tất (6/6)"},
    {title: "Khó Dỗ Dành", image: "https://phimimg.com/upload/vod/20250218-1/7812aa97a4c6bfdd29e1bc33386b72e1.jpg", path: "kho-do-danh", episode_current: "Hoàn Tất (32/32)"},
    {title: "Lighter and Princess", image: "https://phimimg.com/upload/vod/20240331-1/38e0c5c60e6b48d51a71a59429d12ecb.jpg", path: "chiec-bat-lua-va-vay-cong-chua",episode_current: "Hoàn Tất (36/36)"},
    {title: "Thập Tam Muội", image: "https://ik.imagekit.io/yuki/20231209-1/948cc6116cc96d5f9e0b3fb89789275b.jpg", path: "thap-tam-muoi",episode_current: "Hoàn Tất (3/3"},
    {title: "Yêu Nhầm Bạn Thân", image: "https://ik.imagekit.io/yuki/20250523-1/9e90d5e45abb30f79b340985a2b16f14.jpg", path: "yeu-nham-ban-than",episode_current: "Full"},
    {title: "Lật Mặt 6: Tấm Vé Định Mệnh", image: "https://ik.imagekit.io/yuki/20240919-1/5c666eeb1ce5b80a0140906109da9d2a.jpg", path: "lat-mat-6-tam-ve-dinh-menh",episode_current: "Full"},
];


function Film() {
  const [search, setSearch] = useState("");
  const inputRef = useRef(null);
  const navigate = useNavigate();

  function handleKeyPress(e) {
    if (e.key === "Enter") {
      const slug = search.trim().toLowerCase().replace(/\s+/g, "-");  
      navigate(`/search/${slug}`);
      setSearch("");
      inputRef.current.focus();
    }
  }

  const handleSearch = () => {
    if (search.trim() !== "") {
      const slug = search.trim().toLowerCase().replace(/\s+/g, "-");
      navigate(`/search/${slug}`);
      setSearch("");
      inputRef.current.focus();
    }
  }

  return (
    <>
      <div className="text-center">
          <div className="mb-1">
            <h2 className="music-box-title">Kho Phim </h2>
          </div>
          <div className="input-search-film">
            <input
              type="text"
              ref={inputRef} 
              className="input-film fst-italic"
              placeholder="Tìm kiếm phim..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={handleKeyPress}
            />
            <CiSearch className="search-film-icon" onClick={handleSearch} />
          </div>
          
      </div>
      <div className="container mt-1 mb-1">
        <FilmCarousel
          items={filmData}
          renderItem={(film) => (
            <div
              className="film-card"
              onClick={() => navigate(`/film/${film.path}`)}
              alt={film.title}
              style={{
                backgroundImage: `url(${film.image})`
              }}
            >
              <div className="film-card__overlay">
                <h6 className="film-card__title">{film.title}</h6>
                <p className="film-card__episode">
                {film.episode_current || "?"}
                </p>
              </div>
            </div>
          )}
        />
      </div>

    </>
   )
}

export default Film;