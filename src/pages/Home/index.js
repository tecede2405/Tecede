// import hOme from "../../img/hOme.png";
import Tabbar from '../../component/tabar';
import React, { useState, useEffect } from "react";
import Collapsed from "../../component/Collapse/index";
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
                      <img src="https://i.pinimg.com/736x/f5/d0/4e/f5d04ecb570d630d3dd7120738cdbe87.jpg" alt="" />
                      <div className="Home__feature-text">
                        <h2 className="Home__title">Tiêu đề</h2>
                        <p className="Home__desc">"Blog này là nơi lưu giữ kiến thức và kinh nghiệm lập trình thông qua các đoạn video ngắn và các project nhỏ."</p>
                      </div>
                      
                    </div>
                    <div className="Home__feature">
                      <img src="https://i.pinimg.com/736x/9c/d2/10/9cd21012fe34428af38953193c8e4397.jpg" alt="" />
                      <div className="Home__feature-text">
                        <h2 className="Home__title">Tiêu đề</h2>
                        <p className="Home__desc">"Mình muốn chia sẻ những bài viết về hành trình học của bản thân mình. Hành trình của mình bắt đầu với những dòng code đầu tiên trên giao diện front-end, từng bước khám phá HTML, CSS, JS, rồi đến React!"</p>
                      </div>
                      
                    </div>
                    <div className="Home__feature">
                      <img src="https://i.pinimg.com/originals/9d/1f/82/9d1f82cc324e498dd5127a6ed0296dac.gif" alt="" />
                      <div className="Home__feature-text">
                        <h2 className="Home__title">Tiêu đề</h2>
                        <p className="Home__desc">"Khi đã tự tin với front-end, mình tiếp tục dấn thân vào thế giới back-end với Node.js, Express và MongoDB. Mục tiêu cuối cùng? Trở thành một fullstack developer thực thụ, làm chủ cả giao diện lẫn hệ thống phía server"</p>
                      </div> 
                    </div>
              </div>
              <Collapsed />

              <div className="Home__music"> 
                <HomeMusic />
              </div>
              <div className="Home__note">
                <p className="Home__note-text">Lưu ý nhỏ: "Có 2 đường dẫn vào web này."</p>
                <ul>
                  <li className="Home__note-path"><i className="fas fa-mobile-alt">1. tecede.netlify.app</i></li>
                  <li className="Home__note-path"><i className="fas fa-mobile-alt">2. tecede-blog.vercel.app ( đường dẫn này có thể bị delay phải cần proxy như 1.1.1.1 mới vào được )</i></li>
                  <li className="Home__note-path"><i className="fas fa-mobile-alt">3. Nếu bạn đang sử dụng 4G thì nên cân nhắc trước khi nghe nhạc để tiết kiệm dữ liệu.</i></li>
                  <li className="Home__note-path"><i className="fas fa-mobile-alt">4. Nếu bạn không vào bằng link thì nên reload lại trang mỗi khi vào để nhận dữ liệu mới nhất.</i></li>
                  <li className="Home__note-path"><i className="fas fa-mobile-alt">5. Có thể sử dụng dạng app (không cần reload và tiện). Xem hướng dẫn <span onClick={handleAppClick}>ở đây</span>.</i></li>
                </ul>
              </div>
              <div className="admin-post" onClick={handleAdminClick}>
                      <img src="https://res.cloudinary.com/djzeqinsn/image/upload/v1751473418/412cf700-0b7a-4d14-b998-8ba88d1cf8d9.png" alt="" />
                      <div className="admin-post-text">
                        <h2 className="admin-post-title">Tính năng trang admin (2/7/2025)</h2>
                        <p className="admin-post-desc">"click vào để xem nội dung, video demo và source code"</p>
                      </div> 
              </div>
            </div>
        </div>
      </>
    )
}

export default Home;