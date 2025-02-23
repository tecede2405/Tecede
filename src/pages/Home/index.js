import hOme from "../../img/hOme.png";
import Tabbar from '../../component/tabar';
import React, { useState, useEffect } from "react";
import video from "../../video/videoredux.mp4";


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
          {/* <img src="https://i.pinimg.com/originals/ab/ff/54/abff54f67644a641d54ca6fb6cf0ce94.gif" alt="" className="gif-noel"/>
          <img src="https://i.pinimg.com/originals/e2/30/6b/e2306b311719bea3da13247ce174ae4f.gif" alt="" className="gif-noel-2" /> */}
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
                    <div className="Home__feature col-xl-3 col-lg-3 col-md-6 col-sm-12">
                      <img src="https://i.pinimg.com/736x/f5/d0/4e/f5d04ecb570d630d3dd7120738cdbe87.jpg" alt="" />
                      <h2 className="Home__title">Tiêu đề</h2>
                      <p className="Home__desc">"Blog này là nơi giao thoa giữa những giai điệu âm nhạc cuốn hút, thế giới giải trí sống động, những tựa game hấp dẫn, và hành trình khám phá lập trình đầy thú vị."</p>
                    </div>
                    <div className="Home__feature col-xl-3 col-lg-3 col-md-6 col-sm-12">
                      <img src="https://i.pinimg.com/736x/9c/d2/10/9cd21012fe34428af38953193c8e4397.jpg" alt="" />
                      <h2 className="Home__title">Tiêu đề</h2>
                      <p className="Home__desc">"Nếu bạn yêu thích âm nhạc, đam mê game, hay đang tìm hiểu về lập trình, đây sẽ là góc nhỏ dành riêng cho bạn!"</p>
                    </div>
                    <div className="Home__feature col-xl-3 col-lg-3 col-md-6 col-sm-12">
                      <img src="https://i.pinimg.com/originals/9d/1f/82/9d1f82cc324e498dd5127a6ed0296dac.gif" alt="" />
                      <h2 className="Home__title">Tiêu đề</h2>
                      <p className="Home__desc">"Mình muốn chia sẻ những bài viết mang cảm hứng từ thế giới giải trí và công nghệ, từ những bài hát đang hot, các trò chơi đáng thử, đến những dòng code."</p>
                    </div>
              </div>
              <div className="Home__history">
                <p>"Tại đây, bạn sẽ tìm thấy sự kết hợp độc đáo giữa niềm vui giải trí và sự sáng tạo của lập trình, mang đến trải nghiệm mới mẻ và khác biệt."</p>
                <img src="https://i.pinimg.com/736x/27/24/79/272479b13b8a22f6d447260074c4de3d.jpg" alt="" />
              </div>
              <div className="Home__history">
                <p>"Nếu bạn yêu thích nội dung tại đây, đừng quên để lại bình luận hoặc chia sẻ với mình suy nghĩ của bạn nhé!"</p>
                <img src="https://i.pinimg.com/736x/c7/0c/a1/c70ca13c156ed0aa977dedca195ca6ab.jpg" alt="" />
              </div>
              <div className="Home__history">
                <p>"Hy vọng mỗi bài viết sẽ giúp bạn vừa thư giãn vừa học hỏi, và mang đến chút cảm hứng cho những dự án hoặc trải nghiệm mới của bạn."</p>
                <img src={hOme} alt="" />
              </div>
              <div className="Home__video">
                <h1>#1 Bắt đầu hành trình trong năm 2025</h1>
                <p>"Ngày 22/2/2025, Học Redux trong React. Làm todoList p1."</p>
                <video src={video} controls></video>
              </div> 
            </div>
        </div>
        </>
    )
}

export default Home;