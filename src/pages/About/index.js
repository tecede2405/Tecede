import Image from '../../img/AboutIamge.png';
import Tabbar from '../../component/tabar';
import zhongli from '../../img/zhongli.png';
import project1 from '../../img/project1.png';
import project2 from '../../img/project2.png';
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
                <div className="about__project">
                    <img src={project1} alt="" />
                    <p>Ngoài ra tôi cũng có 1 số project nhỏ khác bạn có thể xem trên mọi thiết bị <a href="https://complete-xsk.vercel.app/" target="_blank" rel="noopener noreferrer">Tại đây</a>.</p>
                </div>
                <div className="about__project">
                    <img src={project2} alt="" />
                    <p>Đây là 1 project trong quá trình học chỉ có thể xem được ở màn hình laptop. Bạn cũng thể xem <a href="https://project-mini2-tecede.vercel.app/" target="_blank" rel="noopener noreferrer">Tại đây</a>.</p>
                </div>
            </div>
           </div>
        </>
    )
}

export default About;