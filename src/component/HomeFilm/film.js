import FilmCarousel from "../CoverflowCarousel/index";
import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { CiSearch } from "react-icons/ci";
import { GoChevronRight } from "react-icons/go";
import "./style.scss";
const filmData = [
    {title: "Đại Chiến Người Và Thần 1", image: "https://phimimg.com/upload/vod/20251212-1/4d4cd441e2384ce7da04bb599d001d09.jpg", path: "dai-chien-nguoi-va-than-phan-1",episode_current: "Hoàn Tất (12/12)"},
    {title: "Đại Chiến Người Và Thần 2", image: "https://phimimg.com/upload/vod/20251212-1/f7e1bb3c9a084c4754c42f4758a68f65.jpg", path: "dai-chien-nguoi-va-than-phan-2",episode_current: "Hoàn Tất (15/15)"},
    {title: "Đại Chiến Người Và Thần 3", image: "https://phimimg.com/upload/vod/20251212-1/200f7ae86aa9473780bf77e559f94846.jpg", path: "dai-chien-nguoi-va-than-phan-3",episode_current: "Hoàn Tất (15/15)"},
    {title: "Song Quỹ", image: "https://phimimg.com/upload/vod/20251214-1/ce49bd08edb91c937516a7d27bb08ccd.jpg", path: "song-quy", episode_current: "Hoàn Tất (29/29)"},
    {title: "Tết Ở Làng Địa Ngục", image: "https://ik.imagekit.io/yuki/20240113-1/bde8e52f94a9e35d8f993104d5bb86e2.jpg", path: "tet-o-lang-dia-nguc", episode_current: "Hoàn Tất (12/12)"},
    {title: "Anh Hùng Tiền Mặt", image: "https://phimimg.com/upload/vod/20251226-1/2c8f6e0fff520fbe77bbdb731cf81f46.jpg", path: "anh-hung-tien-mat", episode_current: "Hoàn Tất (8/8)"},
    {title: "Tiệm Ăn Của Quỷ", image: "https://ik.imagekit.io/yuki/20250126-1/8da0fb28e2333a5602112cbcc04e8c14.jpg", path: "tiem-an-cua-quy", episode_current: "Hoàn Tất (6/6)"},
    {title: "Cậu Bé Mất Tích 5", image: "https://phimimg.com/upload/vod/20251127-1/88dfce03b997600f0a898945fe8facb2.jpg", path: "cau-be-mat-tich-phan-5", episode_current: "Hoàn Tất (7/7)"},
    {title: "Khó Dỗ Dành", image: "https://phimimg.com/upload/vod/20250218-1/7812aa97a4c6bfdd29e1bc33386b72e1.jpg", path: "kho-do-danh", episode_current: "Hoàn Tất (32/32)"},
    {title: "Lighter and Princess", image: "https://phimimg.com/upload/vod/20240331-1/38e0c5c60e6b48d51a71a59429d12ecb.jpg", path: "chiec-bat-lua-va-vay-cong-chua",episode_current: "Hoàn Tất (36/36)"},
    {title: "Hôn Lễ Của Em", image: "https://phimimg.com/upload/vod/20231209-1/ff4ebc9bc993697a594d5c1cc0a47793.jpg", path: "hon-le-cua-em",episode_current: "Full"},  
    {title: "Nụ Hôn Bùng Nổ", image: "https://phimimg.com/upload/vod/20251113-1/e1f3ffbc9759bc3bfaa1add317a477ce.jpg", path: "nu-hon-bung-no",episode_current: "Hoàn Tất (14/14)"},
    {title: "Khi Anh Chạy Về Phía Em", image: "https://phimimg.com/upload/vod/20230929-1/a6110983f8de490e116383020adc4662.jpg", path: "khi-anh-chay-ve-phia-em",episode_current: "Hoàn Tất (24/24)"},
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
            <p className="music-box-desc">"Xem phim online Vietsub, thuyết minh, lồng tiếng full HD
              <br /> miễn phí. Bạn có thể tìm kiếm phim ở thanh bên dưới."</p>
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
      <div className="mb-1">
            <h2 className="film-category ms-3">Phim Nổi Bật <GoChevronRight /></h2>
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