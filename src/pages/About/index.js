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
                    <p>"Xin chào! Tôi là một sinh viên yêu thích lập trình, game và âm nhạc. Đây là 1 project nho nhỏ ngẫu hứng của tôi trong quá trình học lập trình."</p>
                    <img src={ Image } alt="" />
                </div>
                <div className="about__produce">
                    <img src={zhongli} alt="" />
                    <p>"Blog này là nơi tôi chia sẻ hành trình học lập trình."</p>
                </div>
                <div className="about__skill text-center">
                    <h1>Skill cơ bản</h1>
                    <div className="row">
                         <div className="col-xxl-2 col-xl-2 col-lg-2 col-md-2 col-sm-3 col-3 about__skill-img">
                            <img src="https://logospng.org/download/html-5/logo-html-5-768.png" alt="HTML" />
                        </div>
                        <div className="col-xxl-2 col-xl-2 col-lg-2 col-md-2 col-sm-3 col-3 about__skill-img">
                            <img src="https://logospng.org/download/css-3/logo-css-3-1536.png" alt="CSS" />
                        </div>
                        <div className="col-xxl-2 col-xl-2 col-lg-2 col-md-2 col-sm-3 col-3 about__skill-img">
                            <img src="https://static.vecteezy.com/system/resources/previews/027/127/463/original/javascript-logo-javascript-icon-transparent-free-png.png" alt="JavaScript" />
                        </div>
                        <div className="col-xxl-2 col-xl-2 col-lg-2 col-md-2 col-sm-3 col-3 about__skill-img">
                            <img src="https://pluspng.com/img-png/react-logo-png-img-react-logo-png-react-js-logo-png-transparent-png-1142x1027.png" alt="React" />
                        </div>
                        <div className="col-xxl-2 col-xl-2 col-lg-2 col-md-2 col-sm-3 col-3 about__skill-img">
                            <img src="https://cdn3.iconfinder.com/data/icons/social-media-2169/24/social_media_social_media_logo_git-512.png" alt="Git" />
                        </div>
                    </div>
                </div>
                <div className="about__project">
                    <img src={project1} alt="" />
                    <p>Ngoài ra tôi cũng có 1 số project nhỏ khác bạn có thể xem trên mọi thiết bị <a href="https://complete-xsk.vercel.app/" target="_blank" rel="noopener noreferrer">Tại đây</a>.</p>
                </div>
                <div className="about__project">
                    <img src={project2} alt="" />
                    <p>Đây là 1 project trong quá trình học, chỉ có thể xem được ở màn hình laptop. Bạn cũng thể xem <a href="https://project-mini2-tecede.vercel.app/" target="_blank" rel="noopener noreferrer">Tại đây</a>.</p>
                </div>
            </div>
           </div>
        </>
    )
}

export default About;