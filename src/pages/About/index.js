    import Tabbar from '../../component/tabar'; // Giữ nguyên nếu bạn vẫn dùng
    import { useNavigate } from "react-router-dom";
    import Marquee from "react-fast-marquee";
    import "./style.scss";

    function About() {
    const navigate = useNavigate();

    const handleAdminClick = () => navigate("/admin-post");
    const handleAnimeClick = () => navigate("/anime");

    return (
        <div className="about-page">
        <Tabbar /> {/* Nếu không dùng nữa thì xóa dòng này */}

        <div className="container about__content">
            {/* Intro Section - Hero-like */}
            <section className="about__intro">
            <div className="about__profile">
                <img
                src="https://p16-sg.tiktokcdn.com/obj/tos-alisg-avt-0068/b93311238c15e779587306509b218c6a"
                alt="avatar"
                loading="lazy"
                className="about__avatar"
                />
                <div className="about__bio">
                <h1 className="feature-title">Xin chào! Mình là Thoại</h1>
                <p className="feature-desc">
                    Sinh viên đam mê lập trình, game và âm nhạc. Đây là project trong hành trình học code của mình.
                </p>
                </div>
            </div>
            </section>

            {/* Features / Mục đích */}
            <section className="about__features">
            <h2 className="section-title">Về blog </h2>
            <div className="features-grid mt-5">
                <div className="feature-card">
                    <img
                        src="https://www.unsell.design/wp-content/uploads/2023/08/633617353_Template-Featured-image.jpg"
                        loading="lazy"
                        alt="Blog là gì"
                    />
                    <h3 className="feature-title">Blog này là gì</h3>
                    <p className="feature-desc">Nơi lưu giữ kiến thức, kinh nghiệm lập trình qua video ngắn & project nhỏ.</p>
                </div>

                <div className="feature-card">
                    <img
                        src="https://i.pinimg.com/1200x/b4/07/3a/b4073ae822c46bc169e18a42f49bba08.jpg"
                        loading="lazy"
                        alt="Mục đích"
                    />
                    <h3 className="feature-title">Mục đích</h3>
                    <p className="feature-desc">Chia sẻ hành trình học code: từ front-end (HTML/CSS/JS/React) đến back-end (Node.js, Express, MongoDB).</p>
                </div>

                <div className="feature-card">
                    <img
                        src="https://i.pinimg.com/originals/9d/1f/82/9d1f82cc324e498dd5127a6ed0296dac.gif"
                        loading="lazy"
                        alt="Mục tiêu"
                    />
                    <h3 className="feature-title">Mục tiêu</h3>
                    <p className="feature-desc">Trở thành fullstack developer thực thụ, làm chủ cả giao diện lẫn server.</p>
                </div>
            </div>
            </section>

            {/* Skills */}
            <section className="about__skills">
            <h2 className="section-title">Kỹ năng</h2>
            <Marquee speed={60} gradient={false} className="mt-5">
                <div className="about__skill-img">
                <img src="https://logospng.org/download/html-5/logo-html-5-768.png" alt="HTML" loading="lazy" />
                </div>
                <div className="about__skill-img">
                <img src="https://logospng.org/download/css-3/logo-css-3-1536.png" alt="CSS" loading="lazy" />
                </div>
                <div className="about__skill-img">
                <img src="https://static.vecteezy.com/system/resources/previews/027/127/463/original/javascript-logo-javascript-icon-transparent-free-png.png" alt="JavaScript" loading="lazy" />
                </div>
                <div className="about__skill-img">
                <img src="https://pluspng.com/img-png/react-logo-png-img-react-logo-png-react-js-logo-png-transparent-png-1142x1027.png" alt="React" loading="lazy" />
                </div>
                <div className="about__skill-img">
                <img src="https://cdn3.iconfinder.com/data/icons/social-media-2169/24/social_media_social_media_logo_git-512.png" alt="Git" loading="lazy" />
                </div>
            </Marquee>
            </section>

            {/* Projects */}
            <section className="about__projects">
            <h2 className="section-title">Dự án nổi bật</h2>
            <div className="projects-grid mt-5">
                <div className="project-card">
                <img
                    src="https://p16-sg.tiktokcdn.com/obj/tos-alisg-avt-0068/e4ecdb70daa43da816a240f392b6a18b"
                    loading="lazy"
                    alt="Project 1"
                />
                <div className="project-info">
                    <h3 className="project-title">Trang web code thuần đầu tiên</h3>
                    <p className="project-desc">Xem tại <a href="https://complete-xsk.vercel.app/" target="_blank" rel="noopener noreferrer">đây</a></p>
                </div>
                </div>

                <div className="project-card">
                <img
                    src="https://p16-sg.tiktokcdn.com/obj/tos-alisg-avt-0068/3abe38eef45c9d050cb1e04c9c209076"
                    loading="lazy"
                    alt="Project 2"
                />
                <div className="project-info">
                    <h3 className="project-title">Project code thuần (laptop only)</h3>
                    <p className="project-desc">Xem tại <a href="https://project-mini2-tecede.vercel.app/" target="_blank" rel="noopener noreferrer">đây</a></p>
                </div>
                </div>

                <div className="project-card">
                <img
                    src="https://p16-sg.tiktokcdn.com/obj/tos-alisg-avt-0068/f6ab0350815711c96fef0654e5006a8f"
                    alt="Shop Mobile"
                    loading="lazy"
                />
                <div className="project-info">
                    <h3 className="project-title">Web thương mại điện tử (Fullstack + Responsive)</h3>
                    <p className="project-desc">Xem tại <a href="https://uthmobileshop.vercel.app/" target="_blank" rel="noopener noreferrer">đây</a></p>
                </div>
                </div>

                <div className="project-card clickable" onClick={handleAdminClick}>
                <img
                    src="https://p16-sg.tiktokcdn.com/obj/tos-alisg-avt-0068/8512e1327f293c12245b17162fb0dbeb"
                    alt="Admin Post"
                    loading="lazy"
                />
                <div className="project-info">
                    <h3 className="project-title">Tính năng trang Admin (2/7/2025)</h3>
                    <p className="project-desc">Click để xem nội dung, video demo & source code</p>
                </div>
                </div>

                <div className="project-card clickable" onClick={handleAnimeClick}>
                <img
                    src="https://p16-sg.tiktokcdn.com/obj/tos-alisg-avt-0068/5116123bdcb63015bd107b03d0e72f87"
                    alt="Anime Demo"
                    loading="lazy"
                />
                <div className="project-info">
                    <h3 className="project-title">Trang Demo Anime (11/8/2025)</h3>
                    <p className="project-desc">Click để xem demo</p>
                </div>
                </div>
            </div>
            </section>
        </div>
        </div>
    );
    }

    export default About;