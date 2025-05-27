// import hOme from "../../img/hOme.png";
import Tabbar from '../../component/tabar';
import React, { useState, useEffect } from "react";
import Collapsed from "../../component/Collapse/index";
import HomeMusic from '../../component/HomeMusic';

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
            </div>
  

        </div>
      </>
    )
}

export default Home;