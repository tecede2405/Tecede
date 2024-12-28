import Image from '../../img/AboutIamge.png';
import Tabbar from '../../component/tabar';
import zhongli from '../../img/zhongli.png';
import meme from '../../img/meme.png';
function About() {
    return (
        <>
           <div className="about">
            <Tabbar />
            <div className="about__content">
                <div className="about__produce">
                    <p>"Xin chào! Tôi là Phan Quang Thoại, một sinh viên yêu thích lập trình, game và âm nhạc. Tôi hiện tại đang là sinh viên năm 2 ngành IT. Đây chỉ là 1 project nho nhỏ ngẫu hứng của tôi."</p>
                    <img src={ Image } alt="" />
                </div>
                <div className="about__produce">
                    <img src={zhongli} alt="" />
                    <p>"Blog này là nơi tôi chia sẻ hành trình học lập trình, những cảm nhận về âm nhạc, cùng với các bài viết về game và giải trí mà tôi yêu thích."</p>
                </div>
                <div className="about__produce about__produce--size">
                    <div className="about__title">
                        <p className="about__produce--desc">"Có thể sẽ có bạn thắc mắc cái tên Thoại Xayda và biệt danh "Tecede" có ý nghĩa gì đúng không?"</p>
                        <p>Thực ra tên Thoại Xayda cũng chỉ được đặt ngẫu hứng từ nhiều năm về trước được lấy cảm hứng từ phim Dragon Ball.
                        Còn biệt danh "Tecede" từ những kí tự đầu của cái tên đó.</p>
                    </div>
                    <img className="about__display" src={ meme } alt="" />
                </div>
            </div>
           </div>
        </>
    )
}

export default About;