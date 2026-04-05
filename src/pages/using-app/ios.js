// import { NavLink, Outlet } from "react-router-dom";
import Tabbar from '../../component/tabar';
import "./index.scss";


const UsingAppIos = () => {

    return(
        <>
            <div className="using-app">
                <Tabbar />
                <div className="using-app__main">
                    <div className="using-app__main-box">
                        <h3 className="using-app-title">Bước 1</h3>
                        <div className="using-app__main-content">
                            <img src="https://p16-sg.tiktokcdn.com/obj/tos-alisg-avt-0068/18a8f73b694a1236585cac93574c517e" alt="hướng dẫn" loading="lazy" />
                            <i className="using-app-desc">Đầu tiên truy cập vào trang web.</i>
                        </div>
                    </div>
                    <div className="using-app__main-box">
                        <h3 className="using-app-title">Bước 2</h3>
                        <div className="using-app__main-content">
                            <img src="https://p16-sg.tiktokcdn.com/obj/tos-alisg-avt-0068/7f6f688c6cf42ea0181ebe89091d0367" alt="hướng dẫn" loading="lazy" />
                            <i className="using-app-desc">Bạn sẽ thấy dấu 3 chấm ở góc phải màn hình. Sau đó click vào.</i>
                        </div>
                    </div>
                    <div className="using-app__main-box">
                        <h3 className="using-app-title">Bước 3</h3>
                        <div className="using-app__main-content">
                            <img src="https://p16-sg.tiktokcdn.com/obj/tos-alisg-avt-0068/0fd50e77939190dbfa4d96f1b6ecaa66" alt="hướng dẫn" loading="lazy" />
                        <i className="using-app-desc">Sau khi click vào thì sẽ hiện ra 1 box như thế này. Hãy click vào chữ "Chia sẻ".</i>
                        </div>                
                    </div>
                    <div className="using-app__main-box">
                        <h3 className="using-app-title">Bước 4</h3>
                        <div className="using-app__main-content">
                            <img src="https://p16-sg.tiktokcdn.com/obj/tos-alisg-avt-0068/bdca87509290e53f5d1ffe630a65bc98" alt="hướng dẫn" loading="lazy" />
                            <i className="using-app-desc">Hãy kéo lên bạn sẽ thấy 1 ô như này sẽ xuất hiện trên màn hình. Cuối cùng chỉ cần click "Thêm vào màn hình chính".</i>
                        </div>
                    </div>
                </div> 
            </div>
        </>
    )
}

export default UsingAppIos;