import Image from '../../img/AboutIamge.png';
import Tabbar from '../../component/tabar';
import zhongli from '../../img/zhongli.png';

function About() {
    return (
        <>
           <div className="about">
            <Tabbar />
            <div className="about__content">
                <div className="about__produce">
                    <p>"Xin chào! Tôi là Thoại, một sinh viên yêu thích lập trình, game và âm nhạc. Đây chỉ là 1 project nho nhỏ ngẫu hứng của tôi."</p>
                    <img src={ Image } alt="" />
                </div>
                <div className="about__produce">
                    <img src={zhongli} alt="" />
                    <p>"Blog này là nơi tôi chia sẻ hành trình học lập trình, những cảm nhận về âm nhạc, cùng với các bài viết về game và giải trí."</p>
                </div>
            </div>
           </div>
        </>
    )
}

export default About;