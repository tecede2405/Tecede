import { FaTv, FaCheckCircle, FaCloudDownloadAlt, FaMobileAlt } from "react-icons/fa";
import Swal from "sweetalert2";
import "./style.scss";

const APK_DOWNLOAD_URL = "https://docs.google.com/uc?export=download&id=1gOswY7cW5KhSkkcOcZBkxf-cU99VdcAv";

function DownloadAppTV() {
  const DarkSwal = Swal.mixin({
    background: "#1f1f1f",
    color: "#fff",
    confirmButtonColor: "#3ddc84",
    cancelButtonColor: "#444",
    customClass: {
      popup: "swal-dark",
      title: "swal-title",
      htmlContainer: "swal-text",
      confirmButton: "swal-confirm",
    }
  });

  const handleDownload = () => {
    DarkSwal.fire({
      title: 'Bạn có chắc chắn muốn tải?',
      text: "File APK (25.1 MB) sẽ được tải xuống thiết bị của bạn.",
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Tải xuống',
      cancelButtonText: 'Hủy'
    }).then((result) => {
      if (result.isConfirmed) {
        window.open(APK_DOWNLOAD_URL, "_blank");
      }
    });
  };



  return (
    <div className="download-page download-tv-page">
      {/* Hero */}
      <div className="download-hero">
        <div className="download-hero__glow" />
        <div className="download-hero__content">
          <div className="download-hero__icon">
            <FaTv />
          </div>
          <h1 className="download-hero__title">Tải App Android TV</h1>
          <p className="download-hero__subtitle">
            Trải nghiệm xem phim mượt mà trên màn hình lớn của Android TV
          </p>

          <div className="download-hero__badge">
            <FaCheckCircle /> File APK • 25.1 MB
          </div>

          <button className="download-hero__btn" onClick={handleDownload}>
            <FaCloudDownloadAlt className="btn-icon" />
            <span>Tải ngay</span>
          </button>

          <p className="download-hero__note">
            Phiên bản mới nhất • Dành riêng cho Android TV
          </p>
        </div>
      </div>



      {/* Instructions Grid */}
      <div className="download-instructions-tv">
        <h2 className="download-instructions-tv__title">Hướng dẫn cài đặt lên TV</h2>
        
        <div className="tv-instructions-grid">
          {/* CÁCH 1 */}
          <div className="tv-method-col">
            <div className="method-header">
              <h3><FaMobileAlt style={{color: '#c084fc'}}/> Cài bằng điện thoại (Khuyên dùng)</h3>
            </div>
            
            <div className="method-meta">
              <p className="method-require"><strong>Yêu cầu:</strong> Điện thoại Android và TV cùng mạng Wi-Fi.</p>
            </div>

            <ul className="method-steps">
              <li><strong>Bước 1:</strong> Trên điện thoại, mở liên kết tải APK của chúng tôi (Google Drive) và tải file APK về máy.</li>
              <li><strong>Bước 2:</strong> Sau khi tải xong, mở ứng dụng <strong>Send Files to TV</strong> trên cả điện thoại và TV.</li>
              <li><strong>Bước 3:</strong> Trên TV chọn <strong>Receive (Nhận)</strong>, trên điện thoại chọn <strong>Send (Gửi)</strong> rồi chọn file APK vừa tải.</li>
              <li><strong>Bước 4:</strong> Trên TV chọn file APK vừa nhận để mở.</li>
              <li><strong>Bước 5:</strong> Chọn <strong>Install (Cài đặt)</strong> &rarr; <strong>Open (Mở)</strong> để sử dụng ứng dụng.</li>
            </ul>
          </div>

          {/* CÁCH 2 */}
          <div className="tv-method-col">
            <div className="method-header">
              <h3><FaTv style={{color: '#3b82f6'}}/> Tải trực tiếp trên TV</h3>
            </div>
            
            <div className="method-meta">
              <p className="method-require"><strong>Yêu cầu:</strong> TV có Internet.</p>
            </div>

            <ul className="method-steps">
              <li><strong>Bước 1:</strong> Mở trình duyệt trên TV (Chrome, TV Bro hoặc Downloader).</li>
              <li><strong>Bước 2:</strong> Truy cập liên kết tải APK của chúng tôi.</li>
              <li><strong>Bước 3:</strong> Nhấn <strong>Tải xuống (Download)</strong> và chờ TV tải xong.</li>
              <li><strong>Bước 4:</strong> Khi tải hoàn tất, chọn <strong>Mở (Open)</strong> hoặc mở file trong mục <strong>Downloads</strong> nếu được hỏi.</li>
              <li><strong>Bước 5:</strong> Chọn <strong>Install (Cài đặt)</strong> &rarr; <strong>Open (Mở)</strong> để sử dụng ứng dụng.</li>
            </ul>
          </div>
        </div>
      </div>

    </div>
  );
}

export default DownloadAppTV;
