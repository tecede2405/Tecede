import Tabbar from '../../component/tabar';
import { useNavigate } from "react-router-dom";
import HomeFilm from '../../component/HomeFilm/index';
import CinematicFilm from '../../component/HomeFilm/cinematic';
import Film from '../../component/HomeFilm/film';
import NewFilm from '../../component/HomeFilm/newfilm';
import NewAnimes from '../../component/HomeFilm/newAnime';
import SieuNhan from '../../component/HomeFilm/tokusatsu';
import PopularFilm from '../../component/HeroCarousel/index';
import HighRateFilm from '../../component/HomeFilm/highRate';
import KoreaFilms from "../../component/HomeFilm/koreaFilm";
import ChinaFilms from "../../component/HomeFilm/chinaFilm";
import GenreCarousel from "../../component/Carousel/genreCarousel";
import HomeMusic from "../../component/HomeMusic/index";
import China3dFilms from "../../component/HomeFilm/china3dFilm";
// import MovieCarousel from "../../component/MovieCarousel/index";
import MovieRow from "../../component/MovieRow/index";
import ComicHero from "../../component/Banner/mangaBanner";
import AnnouncementBar from "../../component/Marquee/AnnouncementBar";
import { Helmet } from "react-helmet-async";
import "./style.scss";

function Home() {
  const navigate = useNavigate();

  const handleAppClick = () => {
    navigate("/using-app");
  };
  const handleIosClick = () => {
    navigate("/using-app-ios");
  };
    return (
        <>
        <Helmet>
          <title>
            Tecede - Xem phim miễn phí, Vietsub HD, Anime, Phim mới cập nhật
          </title>

          <meta
            name="description"
            content="Xem phim miễn phí chất lượng cao tại Tecede. Cập nhật phim mới mỗi ngày: phim lẻ, phim bộ, anime, phim Hàn, Trung Quốc, 3D, vietsub đầy đủ."
          />

          <meta
            name="keywords"
            content="xem phim miễn phí, phim vietsub, phim hd, anime, phim hàn quốc, phim trung quốc, phim mới, tecede"
          />

          {/* Open Graph (share Facebook) */}
          <meta
            property="og:title"
            content="Tecede - Xem phim miễn phí HD"
          />

          <meta
            property="og:description"
            content="Kho phim miễn phí chất lượng cao, cập nhật liên tục mỗi ngày."
          />

          <meta property="og:type" content="website" />
          <meta property="og:url" content={window.location.href} />

          {/* nếu có logo thì thêm */}
          <meta
            property="og:image"
            content="../../../public/home-image.png"
          />
        </Helmet>

        <div className="Home">
            {/* tabbar */}
            <Tabbar />
            {/* main */}
            <div className="Home__main">
              <AnnouncementBar />
               <div className="Home__music"> 
                <MovieRow />
              </div>
              
              <div className="Home__music"> 
                <GenreCarousel />
              </div>
              <div className="Home__music"> 
                <HighRateFilm />
              </div>
              <div className="Home__music"> 
                <KoreaFilms />
              </div>

              <div className="Home__music"> 
                <ChinaFilms />
              </div>
              
              <div className="Home__music"> 
                <PopularFilm />
              </div>
              
              <div className="Home__music"> 
                <China3dFilms />
              </div>
              
              {/* <div className="Home__music"> 
                <MovieCarousel />
              </div> */}
              <div className="Home__music"> 
                <Film />
              </div>

              <div className="Home__music"> 
                <NewAnimes />
              </div>
              <div className="Home__music"> 
                <NewFilm />
              </div>
              <div className="Home__music"> 
                <HomeFilm />
              </div>
              <div className="Home__music"> 
                <CinematicFilm />
              </div>
              <div className="Home__music"> 
                <SieuNhan />
              </div>
              <div className="Home__music"> 
                <HomeMusic />
              </div>
              <ComicHero />
              <div className="Home__note">
                <p className="Home__note-text">Lưu ý nhỏ:</p>
                <ul>
                  <li className="Home__note-path"><i className="fas fa-mobile-alt"> 1. Có 2 đường dẫn truy cập: tecede.netlify.app và tecede.vercel.app, bạn có thể truy cập nếu 1 trong 2 bị lỗi.</i></li>
                  <li className="Home__note-path"><i className="fas fa-mobile-alt"> 2. Nếu có thể cho mình xin 1 lượt theo dõi fanpage để nhận thông tin mới nhất về web và phim mới <a href="https://www.facebook.com/profile.php?id=100084710083595" target="_blank" rel="noopener noreferrer">tại đây</a> nha.</i></li>
                  <li className="Home__note-path"><i className="fas fa-mobile-alt"> 3. Nếu bạn không truy cập được vào web hãy bật 1.1.1.1 (Tải ở CH play, App store) và thử lại.</i></li>
                  <li className="Home__note-path"><i className="fas fa-mobile-alt"> 4. Có thể sử dụng dạng app, đối với android xem hướng dẫn <span onClick={handleAppClick}>ở đây</span>. Đối với IOS xem hướng dẫn <span onClick={handleIosClick}>ở đây</span>.</i></li>
                  <li className="Home__note-path"><i className="fas fa-mobile-alt"> 5. Nếu bạn không cài web ở lưu ý số 4 thì nên reload lại trang chủ ở mỗi lần truy cập nhé! Tại mình thường xuyên update trang.</i></li>
                </ul>
              </div>
              
            </div>
        </div>
      </>
    )
}

export default Home;