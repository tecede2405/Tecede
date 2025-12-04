// import hOme from "../../img/hOme.png";
import Tabbar from '../../component/tabar';
import { useState, useEffect } from "react";
// import Collapsed from "../../component/Collapse/index";
import HomeMusic from '../../component/HomeMusic';
import { useNavigate } from "react-router-dom";
import HomeFilm from '../../component/HomeFilm/index';
import CinematicFilm from '../../component/HomeFilm/cinematic';
import Film from '../../component/HomeFilm/film';

function Home() {
  const [text, setText] = useState("Cảm ơn bạn đã ghé vào trang web này...");
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsVisible(false); // Ẩn chữ hiện tại
      setTimeout(() => {
        // Đổi chữ sau khi ẩn
        setText((prevText) =>
          prevText === "Cảm ơn bạn đã ghé vào trang web này..."
            ? "Đây là website do Thoại Xayda coding!"
            : "Cảm ơn bạn đã ghé vào trang web này..."
        );
        setIsVisible(true); // Hiện lại chữ mới
      }, 500); // Thời gian chờ ẩn chữ hoàn toàn (khớp với CSS animation)
    }, 3000); // Lặp lại mỗi 3 giây

    return () => clearInterval(interval);
  }, []);

    const navigate = useNavigate();

  const handleAppClick = () => {
    navigate("/using-app");
  };

    return (
        <>
        <div className="Home">
            {/* tabbar */}
            <Tabbar />
            {/* main */}
            <div className="Home__main">
              <div className="text-container">
                  <p className={`animated-text ${isVisible ? "visible" : "hidden"}`}>
                      {text}
                  </p>
              </div>
            
              {/* Container */}

              
              <div className="container">
                    <div className="Home__feature">
                      <img src="https://www.unsell.design/wp-content/uploads/2023/08/633617353_Template-Featured-image.jpg" alt="admin features" />
                      <div className="Home__feature-text">
                        <i><h2 className="Home__title">Blog này là gì</h2></i>
                        <p className="Home__desc">"Blog này là nơi lưu giữ kiến thức và kinh nghiệm lập trình thông qua các đoạn video ngắn và các project nhỏ."</p>
                      </div>
                      
                    </div>
                    <div className="Home__feature">
                      <img src="https://i.pinimg.com/1200x/b4/07/3a/b4073ae822c46bc169e18a42f49bba08.jpg" alt="admin features" />
                      <div className="Home__feature-text">
                        <i><h2 className="Home__title">Mục đích</h2></i>
                        <p className="Home__desc">"Mình muốn chia sẻ những bài viết về hành trình học của bản thân mình. Hành trình của mình bắt đầu với những dòng code đầu tiên trên giao diện front-end, từng bước khám phá HTML, CSS, JS, rồi đến React!"</p>
                      </div>
                      
                    </div>
                    <div className="Home__feature">
                      <img src="https://i.pinimg.com/originals/9d/1f/82/9d1f82cc324e498dd5127a6ed0296dac.gif" alt="admin features" />
                      <div className="Home__feature-text">
                        <i><h2 className="Home__title">Mục tiêu</h2></i>
                        <p className="Home__desc">"Khi đã tự tin với front-end, mình tiếp tục học thêm back-end với Node.js, Express và MongoDB. Mục tiêu cuối cùng? Trở thành một fullstack developer thực thụ, làm chủ cả giao diện lẫn hệ thống phía server."</p>
                      </div> 
                    </div>
              </div>
              {/* <Collapsed /> */}

              <div className="Home__music"> 
                <HomeMusic />
              </div>
              <div className="Home__music"> 
                <Film />
              </div>
              <div className="Home__music"> 
                <HomeFilm />
              </div>
              <div className="Home__music"> 
                <CinematicFilm />
              </div>
              <div className="Home__note">
                <p className="Home__note-text">Lưu ý nhỏ:</p>
                <ul>
                  <li className="Home__note-path"><i className="fas fa-mobile-alt"> 1. Có 2 đường dẫn: tecede.netlify.app và tecede-blog.vercel.app, bạn có thể truy cập nếu 1 trong 2 bị lỗi.</i></li>
                  <li className="Home__note-path"><i className="fas fa-mobile-alt"> 2. Nếu bạn đang sử dụng 4G thì nên cân nhắc để tiết kiệm dữ liệu.</i></li>
                  <li className="Home__note-path"><i className="fas fa-mobile-alt"> 3. Hãy bật thông báo để nhận thông báo mới nhất nha. Phim và nhạc luôn được cập nhật thường xuyên.</i></li>
                  <li className="Home__note-path"><i className="fas fa-mobile-alt"> 4. Có thể sử dụng dạng app. Xem hướng dẫn <span onClick={handleAppClick}>ở đây</span>.</i></li>
                </ul>
              </div>
              
            </div>
        </div>
      </>
    )
}

export default Home;