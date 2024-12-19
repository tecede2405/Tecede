
import Tabbar from '../../component/tabar';
import React, { useState, useEffect } from "react";



function Home() {
    const [text, setText] = useState("Chào mừng đến với trang web của chúng tôi ...");
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsVisible(false); // Ẩn chữ hiện tại
      setTimeout(() => {
        // Đổi chữ sau khi ẩn
        setText((prevText) =>
          prevText === "Chào mừng đến với trang web của chúng tôi ..."
            ? "Đây là website do Tecede team coding!"
            : "Chào mừng đến với trang web của chúng tôi ..."
        );
        setIsVisible(true); // Hiện lại chữ mới
      }, 500); // Thời gian chờ ẩn chữ hoàn toàn (khớp với CSS animation)
    }, 3500); // Lặp lại mỗi 3 giây

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
                      <img src="https://i.pinimg.com/236x/1d/a8/23/1da82325c3690ab14fbf1c9384c0681b.jpg" alt="" />
                      <h2 className="Home__title">Tiêu đề</h2>
                      <p className="Home__desc">"Blog này là nơi giao thoa giữa những giai điệu âm nhạc cuốn hút, thế giới giải trí sống động, những tựa game hấp dẫn, và hành trình khám phá lập trình đầy thú vị."</p>
                    </div>
                    <div className="Home__feature">
                      <img src="https://i.pinimg.com/736x/c3/ec/92/c3ec92c47e57acd2d0f4e0f5674f8049.jpg" alt="" />
                      <h2 className="Home__title">Tiêu đề</h2>
                      <p className="Home__desc">"Nếu bạn yêu thích âm nhạc, đam mê game, hay đang tìm hiểu về lập trình, đây sẽ là góc nhỏ dành riêng cho bạn!"</p>
                    </div>
                    <div className="Home__feature">
                      <img src="https://i.pinimg.com/236x/c9/0c/01/c90c01e561cb7b8cd2d2922505798750.jpg" alt="" />
                      <h2 className="Home__title">Tiêu đề</h2>
                      <p className="Home__desc">"Mình muốn chia sẻ những bài viết mang cảm hứng từ thế giới giải trí và công nghệ, từ những bài hát đang hot, các trò chơi đáng thử, đến những dòng code đầy mê hoặc."</p>
                    </div>
              </div>
              <div className="Home__history">
                <p>"Tại đây, bạn sẽ tìm thấy sự kết hợp độc đáo giữa niềm vui giải trí và sự sáng tạo của lập trình, mang đến trải nghiệm mới mẻ và khác biệt."</p>
                <img src="https://i.pinimg.com/474x/26/dd/c6/26ddc657d8f3165817b3313ea715277e.jpg" alt="" />
              </div>
              <div className="Home__history">
                <p>"Tại đây, bạn sẽ tìm thấy sự kết hợp độc đáo giữa niềm vui giải trí và sự sáng tạo của lập trình, mang đến trải nghiệm mới mẻ và khác biệt."</p>
                <img src="https://i.pinimg.com/originals/35/27/1c/35271c195d4848a87daf62881b03ee69.gif" alt="" />
              </div>
              <div className="Home__history">
                <p>"Hy vọng mỗi bài viết sẽ giúp bạn vừa thư giãn vừa học hỏi, và mang đến chút cảm hứng cho những dự án hoặc trải nghiệm mới của bạn."</p>
                <img src="https://i.pinimg.com/236x/06/e8/70/06e8707d0c1826a76f7929656354c7e6.jpg" alt="" />
              </div> 
            </div>
        </div>
        </>
    )
}

export default Home;