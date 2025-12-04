import Image from '../../img/AboutIamge.png';
import Tabbar from '../../component/tabar';
import zhongli from '../../img/zhongli.png';
import project1 from '../../img/project1.png';
import project2 from '../../img/project2.png';
import { useNavigate } from "react-router-dom";
import Marquee from "react-fast-marquee";

function About() {
    const navigate = useNavigate();

    const handleAdminClick = () => {
        navigate("/admin-post");
    };

    const handleAnimeClick = () => {
        navigate("/anime");
    };
    
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
                    <p>"Skill và project nằm ở phía dưới. Nếu bạn quan tâm có thể xem."</p>
                </div>
                 
                <div className="about__skill">
                    <Marquee speed={50} gradient={false}>
                        <div className="about__skill-img">
                            <img src="https://logospng.org/download/html-5/logo-html-5-768.png" alt="HTML" />
                        </div>
                        <div className="about__skill-img">
                            <img src="https://logospng.org/download/css-3/logo-css-3-1536.png" alt="CSS" />
                        </div>
                        <div className="about__skill-img">
                            <img src="https://static.vecteezy.com/system/resources/previews/027/127/463/original/javascript-logo-javascript-icon-transparent-free-png.png" alt="JavaScript" />
                        </div>
                        <div className="about__skill-img">
                            <img src="https://pluspng.com/img-png/react-logo-png-img-react-logo-png-react-js-logo-png-transparent-png-1142x1027.png" alt="React" />
                        </div>
                        <div className="about__skill-img">
                            <img src="https://cdn3.iconfinder.com/data/icons/social-media-2169/24/social_media_social_media_logo_git-512.png" alt="Git" />
                        </div>
                
                    </Marquee>
                </div>
                <div className="about__project">
                    <img src={project1} alt="project1" />
                    <p>Trang web code thuần đầu tiên của mình lúc mới bắt đầu học lập trình. Xem<a href="https://complete-xsk.vercel.app/" target="_blank" rel="noopener noreferrer">Tại đây</a>.</p>
                </div>
                <div className="about__project">
                    <img src={project2} alt="project2" />
                    <p>Đây cũng là project code thuần trong quá trình học, chỉ có thể xem được ở màn hình laptop. Bạn cũng thể xem <a href="https://project-mini2-tecede.vercel.app/" target="_blank" rel="noopener noreferrer">Tại đây</a>.</p>
                </div>
                <div className="about__project">
                    <img src="https://res.cloudinary.com/djzeqinsn/image/upload/v1764407944/%E1%BA%A2nh_ch%E1%BB%A5p_m%C3%A0n_h%C3%ACnh_2025-11-29_161827_krnxnn.png" alt="shop-mobile" />
                    <p>Đây là dự án web thương mại điện tử bán thiết bị di động đã bao gồm back-end và responsive. Xem <a href="https://uthmobileshop.vercel.app/" target="_blank" rel="noopener noreferrer">Tại đây</a>.</p>
                </div>
                <div className="admin-post" onClick={handleAdminClick}>
                      <img src="https://res.cloudinary.com/djzeqinsn/image/upload/v1751473418/412cf700-0b7a-4d14-b998-8ba88d1cf8d9.png" alt="admin post" />
                      <div className="admin-post-text">
                        <h2 className="admin-post-title">Tính năng trang admin (2/7/2025)</h2>
                        <p className="admin-post-desc">"click vào để xem nội dung, video demo và source code"</p>
                      </div> 
              </div>
              <div className="admin-post" onClick={handleAnimeClick}>
                      <img src="https://res.cloudinary.com/djzeqinsn/image/upload/v1754931345/2fdd6074-e842-43b1-8351-8cee247ec7af.png" alt="admin post" />
                      <h2 className="admin-post-title">Trang Demo Anime (11/8/2025)</h2>
                      <p className="admin-post-desc">"click vào để xem demo"</p>
              </div>
            </div>
           </div>
        </>
    )
}

export default About;