// import hOme from "../../img/hOme.png";
import Tabbar from '../../component/tabar';
import { useState, useEffect } from "react";
// import Collapsed from "../../component/Collapse/index";
import HomeMusic from '../../component/HomeMusic';
import { useNavigate } from "react-router-dom";


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

  const handleAdminClick = () => {
    navigate("/admin-post");
  };
  const handleAnimeClick = () => {
    navigate("/anime");
  };
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
                      <img src="https://s3-alpha.figma.com/hub/file/2756242010/25c6912f-5dd2-4801-8f94-b752e9930134-cover.png" alt="" />
                      <div className="Home__feature-text">
                        <i><h2 className="Home__title">Blog này là gì</h2></i>
                        <p className="Home__desc">"Blog này là nơi lưu giữ kiến thức và kinh nghiệm lập trình thông qua các đoạn video ngắn và các project nhỏ."</p>
                      </div>
                      
                    </div>
                    <div className="Home__feature">
                      <img src="https://i.pinimg.com/1200x/b4/07/3a/b4073ae822c46bc169e18a42f49bba08.jpg" alt="" />
                      <div className="Home__feature-text">
                        <i><h2 className="Home__title">Mục đích</h2></i>
                        <p className="Home__desc">"Mình muốn chia sẻ những bài viết về hành trình học của bản thân mình. Hành trình của mình bắt đầu với những dòng code đầu tiên trên giao diện front-end, từng bước khám phá HTML, CSS, JS, rồi đến React!"</p>
                      </div>
                      
                    </div>
                    <div className="Home__feature">
                      <img src="https://i.pinimg.com/originals/9d/1f/82/9d1f82cc324e498dd5127a6ed0296dac.gif" alt="" />
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
              <div className="Home__note">
                <p className="Home__note-text">Lưu ý nhỏ:</p>
                <ul>
                  <li className="Home__note-path"><i className="fas fa-mobile-alt"> 1. Có 2 đường dẫn vào web này: tecede.netlify.app và tecede-blog.vercel.app</i></li>
                  <li className="Home__note-path"><i className="fas fa-mobile-alt"> 2. Nếu bạn đang sử dụng 4G thì nên cân nhắc trước khi nghe nhạc để tiết kiệm dữ liệu.</i></li>
                  <li className="Home__note-path"><i className="fas fa-mobile-alt"> 3. Nếu bạn không vào bằng link thì nên reload lại trang mỗi khi vào để nhận dữ liệu mới nhất.</i></li>
                  <li className="Home__note-path"><i className="fas fa-mobile-alt"> 4. Có thể sử dụng dạng app (không cần reload và tiện). Xem hướng dẫn <span onClick={handleAppClick}>ở đây</span>.</i></li>
                </ul>
              </div>
              <div className="admin-post" onClick={handleAdminClick}>
                      <img src="https://res.cloudinary.com/djzeqinsn/image/upload/v1751473418/412cf700-0b7a-4d14-b998-8ba88d1cf8d9.png" alt="" />
                      <div className="admin-post-text">
                        <h2 className="admin-post-title">Tính năng trang admin (2/7/2025)</h2>
                        <p className="admin-post-desc">"click vào để xem nội dung, video demo và source code"</p>
                      </div> 
              </div>
              <div className="admin-post" onClick={handleAnimeClick}>
                      <img src="https://res.cloudinary.com/djzeqinsn/image/upload/v1754931345/2fdd6074-e842-43b1-8351-8cee247ec7af.png" alt="" />
                      <h2 className="admin-post-title">Trang Demo Anime (11/8/2025)</h2>
                      <p className="admin-post-desc">"click vào để xem demo"</p>
              </div>
            </div>
        </div>
      </>
    )
}

export default Home;