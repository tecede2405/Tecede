import logo from '../../img/home-image.png';
import {NavLink, Outlet } from 'react-router-dom';
import { FaBars } from "react-icons/fa";
import './layout.scss';
import BackgroundMusic from '../../component/Music/index';
function Layout(){
    return (
        <>
            <header className="header">
                <div className="header__logo">
                    <a href="https://www.facebook.com/profile.php?id=100084710083595" target="_blank" >
                    <img src={logo} alt="logo-Page" className="header__image"/>
                    </a> 
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
                            <NavLink to="about" className="menu__page">
                                Về chúng tôi 
                            </NavLink>
                        </li>
                        <li>
                            <NavLink to="contact" className="menu__page">
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
                        <li>Địa chỉ: Tp.Quảng Ngãi</li>
                    </ul>
                </div>
                <p>Copyright &copy; 2024 by Tecede. All right reserved</p>
            </footer>
        </>
    )
}

export default Layout;