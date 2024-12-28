
import Tabbar from '../../component/tabar';
import React, { useState, useEffect } from "react";



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
          <img src="https://i.pinimg.com/originals/ab/ff/54/abff54f67644a641d54ca6fb6cf0ce94.gif" alt="" className="gif-noel"/>
          <img src="https://i.pinimg.com/originals/e2/30/6b/e2306b311719bea3da13247ce174ae4f.gif" alt="" className="gif-noel-2" />
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
                      <img src="https://i.pinimg.com/736x/98/5e/c4/985ec4ad901e42c9373373278cb8447e.jpg" alt="" />
                      <h2 className="Home__title">Tiêu đề</h2>
                      <p className="Home__desc">"Nếu bạn yêu thích âm nhạc, đam mê game, hay đang tìm hiểu về lập trình, đây sẽ là góc nhỏ dành riêng cho bạn!"</p>
                    </div>
                    <div className="Home__feature col-xl-3 col-lg-3 col-md-6 col-sm-12">
                      <img src="https://i.pinimg.com/originals/9d/1f/82/9d1f82cc324e498dd5127a6ed0296dac.gif" alt="" />
                      <h2 className="Home__title">Tiêu đề</h2>
                      <p className="Home__desc">"Mình muốn chia sẻ những bài viết mang cảm hứng từ thế giới giải trí và công nghệ, từ những bài hát đang hot, các trò chơi đáng thử, đến những dòng code đầy mê hoặc."</p>
                    </div>
              </div>
              <div className="Home__history">
                <p>"Tại đây, bạn sẽ tìm thấy sự kết hợp độc đáo giữa niềm vui giải trí và sự sáng tạo của lập trình, mang đến trải nghiệm mới mẻ và khác biệt."</p>
                <img src="https://i.pinimg.com/736x/6f/6b/69/6f6b691aca3ed166a5be6e020968c8f1.jpg" alt="" />
              </div>
              <div className="Home__history">
                <p>"Nếu bạn yêu thích nội dung tại đây, đừng quên để lại bình luận hoặc chia sẻ với mình suy nghĩ của bạn nhé!"</p>
                <img src="https://i.pinimg.com/736x/ad/b7/8b/adb78be17ccda9d9b876091e27bebbcb.jpg" alt="" />
              </div>
              <div className="Home__history">
                <p>"Hy vọng mỗi bài viết sẽ giúp bạn vừa thư giãn vừa học hỏi, và mang đến chút cảm hứng cho những dự án hoặc trải nghiệm mới của bạn."</p>
                <img src="https://i.pinimg.com/736x/d2/83/1a/d2831a6df13e28dbad4fc1bd1b4cda37.jpg" alt="" />
              </div> 
            </div>
        </div>
        </>
    )
}

export default Home;