// import { NavLink, Outlet } from "react-router-dom";
import Tabbar from '../../component/tabar';
import "./index.scss";


const UsingApp = () => {

    return(
        <>
            <div className="using-app">
                <Tabbar />
                <div className="using-app__main">
                    <div className="using-app__main-box">
                        <h3 className="using-app-title">Bước 1</h3>
                        <div className="using-app__main-content">
                            <img src="https://p16-sg.tiktokcdn.com/obj/tos-alisg-avt-0068/4e027dbff762221bbea56f1d417b2be6" alt="hướng dẫn" loading="lazy" />
                            <i className="using-app-desc">Đầu tiên truy cập vào trang web.</i>
                        </div>
                    </div>
                    <div className="using-app__main-box">
                        <h3 className="using-app-title">Bước 2</h3>
                        <div className="using-app__main-content">
                            <img src="https://p16-sg.tiktokcdn.com/obj/tos-alisg-avt-0068/7a6a8f7dd1ee56d65fbb9899435955ce" alt="hướng dẫn" loading="lazy" />
                            <i className="using-app-desc">Bạn sẽ thấy dấu 3 chấm ở góc phải màn hình. Sau đó click vào.</i>
                        </div>
                    </div>
                    <div className="using-app__main-box">
                        <h3 className="using-app-title">Bước 3</h3>
                        <div className="using-app__main-content">
                            <img src="https://p16-sg.tiktokcdn.com/obj/tos-alisg-avt-0068/8511ca73917676824cbca26f331858e2" alt="hướng dẫn" loading="lazy" />
                        <i className="using-app-desc">Sau khi click vào thì sẽ hiện ra 1 box như thế này. Hãy click vào chữ "Thêm vào màn hình chính".</i>
                        </div>                
                    </div>
                    <div className="using-app__main-box">
                        <h3 className="using-app-title">Bước 4</h3>
                        <div className="using-app__main-content">
                            <img src="https://i.ibb.co/fdTzpvxF/1778084614562.jpg" alt="hướng dẫn" loading="lazy" />
                            <i className="using-app-desc">1 ô như này sẽ xuất hiện trên màn hình. Cuối cùng chỉ cần click "Cài đặt"</i>
                        </div>
                    </div>
                </div> 
            </div>
        </>
    )
}

export default UsingApp;