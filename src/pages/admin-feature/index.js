// import { NavLink, Outlet } from "react-router-dom";
import Tabbar from '../../component/tabar';
import "./index.scss";
import Login from "../../component/CodeBlock/login";
import AddSong from "../../component/CodeBlock/addsong";
import ManageSong from "../../component/CodeBlock/managesong";

const AdminFeature = () => {

    return(
        <>
            <div className="admin__feature">
                <Tabbar />
                <div className="admin__feature-abc">
                    <div className="admin__feature-parent">
                        <h3 className="admin__feature-title">Video và source code tính năng trang admin</h3> 
                        <video className="admin__feature-video" controls
                        src="https://res.cloudinary.com/djzeqinsn/video/upload/v1751470591/lv_0_20250702222657_dhju9g.mp4"
                        poster="https://res.cloudinary.com/djzeqinsn/image/upload/v1751473418/412cf700-0b7a-4d14-b998-8ba88d1cf8d9.png"
                        ></video>

                        {/* admin feature box */}
                        <div className="admin__feature-box">
                            <Login className="admin__feature-code"/>
                            <i className="admin__feature-desc">
                                Đây là source code file đăng nhập Admin.
                                Mình khởi tạo các State như userName, passWord, Message.
                                Đó là các biến tên đăng nhập, mật khẩu và thông báo "đăng nhập thành công/thất bại."
                                mình có tạo 1 form HTMl cho phép admin nhập tài khoản mật khẩu và khi ấn đăng nhập sẽ thực hiện chạy vào fuction
                                handleSubmit. khi submit lên sẽ khởi chạy fetch api, đây là cách xác thực vì tài khoản này mình đã tạo trong api,
                                nếu thông tin mình nhập là đúng thì nó sẽ so sánh với dữ liệu api và in ra đăng nhập thành công và ngược lại.
                                Ở đây mình dùng thương thức là POST là để đẩy thông tin mình nhập lên và chuyển nó thành chuối json.
                            </i>
                        </div>
                        <div className="admin__feature-box">
                            <AddSong/>
                            <i className="admin__feature-desc">
                                Đây là source code file thêm bài hát.
                                Mình cũng tạo 1 form gồm các thẻ input như tên bài hát, ca sĩ ,... Để admin nhập vào sau đó ấn thêm thì sẽ submit 
                                dữ liệu lên api. Vì là thêm bài hát nên mình tạo 1 thẻ input có type là file mục đích là để up mp3 lên và lưu vào 
                                cloud. Và tính năg này mình cũng dùng phương thức là POST. Nếu up thành công/thất bại sẽ có thông báo sau 3 giây vì mình có
                                dùng setTimeout sau 3 giây như trên code.
                            </i>
                        </div>
                        <div className="admin__feature-box">
                            <ManageSong/>
                            <i className="admin__feature-desc">
                                Đây là source code file quản lì bài hát.
                                Mục đích là để show là danh sách các bài hát của từng thể loại, ý tưởng ở đây là mình dùng tab để dễ quản lý hơn.
                                Khi chọn Tab của thể loại nào thì sẽ fetch api của thể loại đó và innerHTML để tạo ra danh sách. Hiện tại thì nó để
                                dùng quản lý danh sách sau khi thêm bài hát và trong tương lai mình sẽ có thể phát triển thêm tính năng xóa hoặc chỉnh
                                sửa bài hát ở file này.
                            </i>
                        </div>
                    </div>
                </div> 
            </div>
        </>
    )
}

export default AdminFeature;