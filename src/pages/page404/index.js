
  import { useEffect, useState } from "react";
  import "./style.scss";

  function NotFound() {

    const [show, setShow] = useState(false);

    useEffect(() => {
      // delay để tạo hiệu ứng
      setTimeout(() => setShow(true), 200);
    }, []);

    const handleGoHome = () => {
      window.location.href = "/"; // reload + về trang chủ
    };

    if (!show) return null;

    return (
      <div className="modal-overlay">
        <div className="modal-box">
          <h2>Trang không tồn tại</h2>
          <p>
            Trang này có thể đã bị thay đổi đường dẫn hoặc không còn tồn tại hoặc đang được phát triển.
          </p>

          <button onClick={handleGoHome}>
            Quay về trang chủ
          </button>
        </div>
      </div>
    );
  }

  export default NotFound;