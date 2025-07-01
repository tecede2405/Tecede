    import logo from '../../img/home-image.png';
    import {NavLink, Outlet } from 'react-router-dom';
    import './layout.scss';
    import BackgroundMusic from '../../component/Music/index';
    import { useState,useEffect } from "react";
    import LoginForm from "../../component/ShowForm/showForm.js";
    import { useNavigate, useLocation } from "react-router-dom";

    function Layout(){
    const [showForm, setShowForm] = useState(false);
    const location = useLocation();
    const [showDropdown, setShowDropdown] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const loggedIn = localStorage.getItem("isLoggedIn") === "true";
        setIsLoggedIn(loggedIn);
    }, []);

    const handleLogoClick = () => {
    if (isLoggedIn) {
        setShowDropdown(!showDropdown); // chỉ toggle dropdown thôi
    } else {
        setShowForm(true); // mở form đăng nhập nếu chưa đăng nhập
    }
    };

    const handleLogout = () => {
        localStorage.removeItem("isLoggedIn");
        setIsLoggedIn(false);
        setShowDropdown(false);
        navigate("/"); // Quay về trang chủ sau khi logout
    };
        return (
            <>
                <header className="header">
                    <div className="header__logo">                        
                        <img
                        src={logo}
                        alt="logo-Page"
                        className="header__image"
                        onClick={handleLogoClick}
                        />

                        {showForm && (
                        <LoginForm
                            onClose={() => setShowForm(false)}
                            onLoginSuccess={() => {
                            setIsLoggedIn(true);
                            }}
                        />
                        )}

                        {showDropdown && (
                        <div className="dropdown-logout">
                            {/* Nếu KHÔNG ở trang /admin thì hiện thêm nút quay lại */}
                            {!location.pathname.startsWith("/admin") && (
                            <button onClick={() => navigate("/admin")}>Trang Admin</button>
                            )}
                            <button onClick={handleLogout}>Đăng xuất</button>
                        </div>
                        )}
                    <BackgroundMusic />
                    </div>
                    
                    <div className="header__menu">
                        <ul>
                            <li>
                                <NavLink to="/" className="menu__page">
                                    Trang Chủ 
                                </NavLink>
                            </li>
                            <li>
                                <NavLink to="/about" className="menu__page">
                                    Về chúng tôi 
                                </NavLink>
                            </li>
                            <li>
                                <NavLink to="/contact" className="menu__page">
                                    Liên hệ 
                                </NavLink>
                            </li>
                        </ul>
                    </div>
                </header>
                <div className="layout-main">
                    <Outlet />
                </div>
                

                <footer>
                    <div className="footer-contact">
                        <ul>
                            <li>Số điện thoại: 0384577121</li>
                            <li>Email: thoaixd123@gmail.com</li>
                            <li>Hashtag: #tecede, #tecede blog</li>
                        </ul>
                    </div>
                    <p>Copyright &copy; 2024 by Tecede. All right reserved.</p>
                </footer>
            </>
        )
    }

    export default Layout;