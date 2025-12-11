import MusicCarousel from "../Carousel/FilmCarousel";
import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { CiSearch } from "react-icons/ci";
import "./style.scss";
const filmData = [
    {title: "Tết Ở Làng Địa Ngục", image: "https://ik.imagekit.io/yuki/20240113-1/bde8e52f94a9e35d8f993104d5bb86e2.jpg", path: "tet-o-lang-dia-nguc"},
    {title: "Tiệm Ăn Của Quỷ", image: "https://ik.imagekit.io/yuki/20250126-1/8da0fb28e2333a5602112cbcc04e8c14.jpg", path: "tiem-an-cua-quy"},
    {title: "Thập Tam Muội", image: "https://ik.imagekit.io/yuki/20231209-1/948cc6116cc96d5f9e0b3fb89789275b.jpg", path: "thap-tam-muoi"},
    {title: "Yêu Nhầm Bạn Thân", image: "https://ik.imagekit.io/yuki/20250523-1/9e90d5e45abb30f79b340985a2b16f14.jpg", path: "yeu-nham-ban-than"},
    {title: "Lật Mặt 6: Tấm Vé Định Mệnh", image: "https://ik.imagekit.io/yuki/20240919-1/5c666eeb1ce5b80a0140906109da9d2a.jpg", path: "lat-mat-6-tam-ve-dinh-menh"},
];


function Film() {
  const [search, setSearch] = useState("");
  const inputRef = useRef(null);
  const navigate = useNavigate();

  function handleKeyPress(e) {
    if (e.key === "Enter") {
      const slug = search.trim().toLowerCase().replace(/\s+/g, "-");  
      navigate(`/${slug}`);
      setSearch("");
      inputRef.current.focus();
    }
  }

  const handleSearch = () => {
    if (search.trim() !== "") {
      const slug = search.trim().toLowerCase().replace(/\s+/g, "-");
      navigate(`/${slug}`);
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
          <MusicCarousel items={filmData} />
      </div>  
    </>
   )
}

export default Film;