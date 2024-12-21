import Image from '../../img/AboutIamge.png';
import Tabbar from '../../component/tabar';
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
                    <img src="https://i.pinimg.com/474x/c8/a0/cd/c8a0cd8fd311deb72133c682252602d5.jpg" alt="" />
                    <p>"Blog này là nơi tôi chia sẻ hành trình học lập trình, những cảm nhận về âm nhạc, cùng với các bài viết về game và giải trí mà tôi yêu thích."</p>
                </div>
                <div className="about__produce about__produce--size">
                    <div className="about__title">
                        <p className="about__produce--desc">"Có thể sẽ có bạn thắc mắc cái tên Thoại Xayda và biệt danh "Tecede" có ý nghĩa gì đúng không?"</p>
                        <p>Thực ra tên Thoại Xayda cũng chỉ được đặt ngẫu hứng từ nhiều năm về trước được lấy cảm hứng từ tên 1 chủng tộc trong phim 7 viên ngọc rồng.
                        Còn biệt danh "Tecede" từ những kí tự đầu của cái tên đó mà ra. Te là 'T', ce là 'X', con de là "D".</p>
                    </div>
                    <img className="about__display" src="https://i.pinimg.com/236x/ed/3b/8d/ed3b8d9dd0c84d11832528e2f339d8ea.jpg" alt="" />
                </div>
            </div>
           </div>
        </>
    )
}

export default About;