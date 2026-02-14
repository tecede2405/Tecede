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
        <div className="Home">
            {/* tabbar */}
            <Tabbar />
            {/* main */}
            <div className="Home__main">
             

              <div className="Home__music"> 
                <PopularFilm />
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
              <div className="Home__note">
                <p className="Home__note-text">Lưu ý nhỏ:</p>
                <ul>
                  <li className="Home__note-path"><i className="fas fa-mobile-alt"> 1. Có 2 đường dẫn truy cập: tecede.netlify.app và tecede.vercel.app, bạn có thể truy cập nếu 1 trong 2 bị lỗi.</i></li>
                  <li className="Home__note-path"><i className="fas fa-mobile-alt"> 2. Nếu có thể cho mình xin 1 lượt theo dõi fanpage để nhận thông tin mới nhất về web và phim mới <a href="https://www.facebook.com/profile.php?id=100084710083595" target="_blank" rel="noopener noreferrer">tại đây</a> nha.</i></li>
                  <li className="Home__note-path"><i className="fas fa-mobile-alt"> 3. Nếu bạn không truy cập được vào web hãy bật 1.1.1.1 (Tải ở CH play, App store) và thử lại.</i></li>
                  <li className="Home__note-path"><i className="fas fa-mobile-alt"> 4. Có thể sử dụng dạng app, đối với android xem hướng dẫn <span onClick={handleAppClick}>ở đây</span>. Đối với IOS xem hướng dẫn <span onClick={handleIosClick}>ở đây</span>.</i></li>
                  <li className="Home__note-path"><i className="fas fa-mobile-alt"> 5. Vì trang này là trang miễn phí nên đôi lúc có sai sót các bạn hoan hỉ nhé.</i></li>
                  <li className="Home__note-path"><i className="fas fa-mobile-alt"> 6. Mình không phát triển tính năng đăng nhập cho khách nhưng lịch sử xem vẫn lưu ở trên nha.</i></li>
                </ul>
              </div>
              
            </div>
        </div>
      </>
    )
}

export default Home;