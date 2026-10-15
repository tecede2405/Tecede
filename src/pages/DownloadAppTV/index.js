import { useState } from "react";
import { 
  FaTv, 
  FaDownload, 
  FaCopy, 
  FaCheck, 
  FaExternalLinkAlt, 
  FaAndroid, 
  FaGooglePlay, 
  FaBolt, 
  FaShieldAlt, 
  FaMobileAlt, 
  FaFolderOpen 
} from "react-icons/fa";
import { Helmet } from "react-helmet-async";
import Swal from "sweetalert2";
import "./style.scss";

const TV_CODE = "5196013";
const SHORT_URL = "https://aftv.news/5196013";
const DESTINATION_URL = "https://github.com/tecede2405/tecede2405/releases/download/v1.0.3/TecedeTV-V1.0.3.1.apk";
const APP_SCREENSHOT = "https://i.ibb.co/WWshyKxG/Anh-chup-man-hinh-2026-07-27-143100.webp";

export default function DownloadAppTV() {
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState(false);

  const copyToClipboard = (text, type) => {
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(text);
    } else {
      const textarea = document.createElement("textarea");
      textarea.value = text;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
    }

    if (type === "code") {
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    } else {
      setCopiedUrl(true);
      setTimeout(() => setCopiedUrl(false), 2000);
    }

    const Toast = Swal.mixin({
      toast: true,
      position: "top-end",
      showConfirmButton: false,
      timer: 2000,
      background: "#181e2e",
      color: "#fff",
      timerProgressBar: true,
    });
    Toast.fire({
      icon: "success",
      title: type === "code" ? `Đã sao chép mã: ${text}` : `Đã sao chép link: ${text}`,
    });
  };

  const handleDownloadClick = (e) => {
    e.preventDefault();
    Swal.fire({
      title: "Tải TecedeTV cho Android TV",
      html: `
        <div style="font-size: 14px; color: #cbd5e1; text-align: left; line-height: 1.6;">
          <p><strong>Ứng dụng:</strong> TecedeTV</p>
          <p><strong>Dung lượng:</strong> ~25 MB</p>
          <p><strong>Link tải rút gọn:</strong> <code style="color: #38bdf8;">aftv.news/5196013</code></p>
          <p style="margin-top: 10px; color: #94a3b8; font-size: 13px;">Bạn sẽ được chuyển hướng trực tiếp đến link tải an toàn.</p>
        </div>
      `,
      icon: "info",
      background: "#131722",
      color: "#fff",
      showCancelButton: true,
      confirmButtonText: "Tải ngay",
      cancelButtonText: "Đóng",
      confirmButtonColor: "#e50914",
      cancelButtonColor: "#334155",
      customClass: { popup: "dark-swal-popup" },
    }).then((res) => {
      if (res.isConfirmed) {
        window.open(SHORT_URL, "_blank");
      }
    });
  };

  return (
    <div className="download-tv-wrapper">
      <Helmet>
        <title>Tải TecedeTV - Ứng dụng xem phim chuyên biệt cho Android TV & Smart TV</title>
        <meta 
          name="description" 
          content="Cài đặt TecedeTV trên Android TV qua ứng dụng Downloader với mã 5196013 hoặc tải trực tiếp file APK mượt mà, chất lượng cao, tối ưu Remote." 
        />
      </Helmet>

      {/* Ambient glows */}
      <div className="download-tv__bg-glow download-tv__bg-glow--top" />
      <div className="download-tv__bg-glow download-tv__bg-glow--bottom" />

      <div className="container download-tv__container">
        
        {/* ================= HERO HEADER ================= */}
        <div className="download-tv-hero">
          <div className="hero-pill-badge">
            <span className="pulse-dot" />
            <FaTv className="badge-icon" />
            <span>TecedeTV • Android TV</span>
          </div>

          <h1 className="download-tv-hero__title">
            Trải Nghiệm Điện Ảnh Đỉnh Cao Trên <span className="highlight-text">Android TV</span>
          </h1>

          <p className="download-tv-hero__desc">
            Ứng dụng <strong>TecedeTV</strong> được thiết kế chuyên biệt cho màn hình lớn, 
            tối ưu hoàn hảo cho điều khiển Remote TV, tốc độ truyền phát cực nhanh và miễn phí.
          </p>

          <div className="download-tv-hero__specs">
            <div className="spec-item">
              <FaAndroid className="spec-icon" />
              <span>Android TV / Google TV</span>
            </div>
            <div className="spec-dot">•</div>
            <div className="spec-item">
              <FaShieldAlt className="spec-icon" />
              <span>An toàn &amp; Không mã độc</span>
            </div>
            <div className="spec-dot">•</div>
            <div className="spec-item">
              <FaBolt className="spec-icon" />
              <span>Hoàn toàn miễn phí</span>
            </div>
          </div>
        </div>

        {/* ================= SHOWCASE 2-COLUMN SECTION ================= */}
        {/* PC/Laptop: Ảnh bên trái, Downloader Card bên phải | Mobile: Ảnh trên, Card dưới */}
        <div className="tv-showcase-split" id="quick-guide">
          
          {/* CỘT TRÁI (PC) / TRÊN (MOBILE): ẢNH MINH HỌA APP */}
          <div className="tv-mockup-col">
            <div className="tv-frame">
              <div className="tv-frame__bezel">
                <div className="tv-frame__screen">
                  <img 
                    src={APP_SCREENSHOT} 
                    alt="Giao diện TecedeTV trên Android TV" 
                    className="tv-screenshot-img"
                    loading="lazy"
                  />
                  <div className="tv-screen-glare" />
                </div>
              </div>
              <div className="tv-frame__stand" />
              <div className="tv-frame__base" />
            </div>
            <div className="tv-mockup-caption">
              <FaTv className="caption-icon" />
              <span>Giao diện thực tế <strong>TecedeTV</strong> trên màn hình TV</span>
            </div>
          </div>

          {/* CỘT PHẢI (PC) / DƯỚI (MOBILE): DOWNLOADER CARD */}
          <div className="tv-downloader-col">
            <div className="downloader-card">
              
              <div className="downloader-card__header">
                <div>
                  <div className="downloader-card__tag">CÁCH CÀI ĐẶT NHANH NHẤT TRÊN TV</div>
                  <h2 className="downloader-card__title">Cài qua app Downloader</h2>
                </div>
              </div>

              <div className="downloader-card__body">
                {/* BIG CODE BOX */}
                <div className="code-box-wrapper">
                  <div className="code-box-header">
                    <span className="code-box-label">MÃ NHẬP TRÊN APP DOWNLOADER</span>
                    <span className="code-box-sublabel">Mở app và gõ mã số này</span>
                  </div>
                  <div className="code-box-display">
                    <div className="code-number">{TV_CODE}</div>
                    <button 
                      className={`btn-copy-code ${copiedCode ? "copied" : ""}`}
                      onClick={() => copyToClipboard(TV_CODE, "code")}
                      title="Sao chép mã cài đặt"
                    >
                      {copiedCode ? <FaCheck className="icon" /> : <FaCopy className="icon" />}
                      <span>{copiedCode ? "Đã chép!" : "Sao chép mã"}</span>
                    </button>
                  </div>
                </div>

                {/* SHORT URL ROW */}
                <div className="shorturl-row">
                  <div className="shorturl-info">
                    <span className="shorturl-label">HOẶC NHẬP LINK RÚT GỌN:</span>
                    <code className="shorturl-code">aftv.news/{TV_CODE}</code>
                  </div>
                  <div className="shorturl-actions">
                    <button 
                      className={`btn-copy-link ${copiedUrl ? "copied" : ""}`}
                      onClick={() => copyToClipboard(SHORT_URL, "url")}
                      title="Sao chép liên kết"
                    >
                      {copiedUrl ? <FaCheck className="icon" /> : <FaCopy className="icon" />}
                      <span>{copiedUrl ? "Đã chép" : "Copy URL"}</span>
                    </button>
                    <a 
                      href={SHORT_URL} 
                      target="_blank" 
                      rel="noreferrer" 
                      className="btn-open-link"
                      title="Mở liên kết"
                    >
                      <FaExternalLinkAlt className="icon" />
                      <span>Mở link</span>
                    </a>
                  </div>
                </div>

                {/* DESTINATION ROW */}
                <div className="destination-row">
                  <div className="destination-meta">
                    <span className="destination-label">Tên app:</span>
                    <span className="destination-value">TecedeTV</span>
                  </div>
                  <a 
                    href={DESTINATION_URL} 
                    target="_blank" 
                    rel="noreferrer"
                    className="btn-direct-apk"
                  >
                    <FaDownload className="icon" />
                    <span>Tải trực tiếp file APK</span>
                  </a>
                </div>

                {/* PRIMARY ACTION BUTTON */}
                <button className="btn-tv-download-main" onClick={handleDownloadClick}>
                  <FaDownload className="btn-icon" />
                  <span>Tải TecedeTV (aftv.news/{TV_CODE})</span>
                </button>

              </div>

            </div>
          </div>

        </div>

        {/* ================= 3-STEP INSTALLATION ================= */}
        <div className="install-steps-section">
          <div className="section-title-wrap text-center">
            <h3 className="section-title">Hướng Dẫn Cài Đặt 3 Bước</h3>
            <p className="section-subtitle">Chỉ mất chưa đầy 1 phút để cài đặt TecedeTV lên chiếc Smart TV của bạn</p>
          </div>

          <div className="steps-grid">
            
            {/* BƯỚC 1 */}
            <div className="step-card">
              <div className="step-card__badge">BƯỚC 1</div>
              <div className="step-card__icon-box step-card__icon-box--orange">
                <FaGooglePlay className="step-icon" />
              </div>
              <h4 className="step-card__title">Cài app Downloader</h4>
              <p className="step-card__desc">
                Mở <strong>CH Play (Google Play Store)</strong> trên TV, tìm kiếm 
                từ khóa <strong>"Downloader"</strong> (logo cam của AFTVnews) và bấm <strong>Cài đặt</strong>.
              </p>
            </div>

            {/* BƯỚC 2 */}
            <div className="step-card">
              <div className="step-card__badge">BƯỚC 2</div>
              <div className="step-card__icon-box step-card__icon-box--cyan">
                <FaTv className="step-icon" />
              </div>
              <h4 className="step-card__title">Nhập mã {TV_CODE}</h4>
              <p className="step-card__desc">
                Mở app Downloader, tại ô nhập URL bạn gõ chính xác mã số 
                <strong> {TV_CODE} </strong> rồi bấm phím <strong>Go</strong>.
              </p>
            </div>

            {/* BƯỚC 3 */}
            <div className="step-card">
              <div className="step-card__badge">BƯỚC 3</div>
              <div className="step-card__icon-box step-card__icon-box--green">
                <FaCheck className="step-icon" />
              </div>
              <h4 className="step-card__title">Cài đặt &amp; Mở TecedeTV</h4>
              <p className="step-card__desc">
                Ứng dụng tự động tải về <strong>TecedeTV</strong>. Khi hoàn tất, 
                chọn <strong>Install (Cài đặt)</strong> &rarr; <strong>Mở</strong> để thưởng thức phim ngay!
              </p>
            </div>

          </div>

          {/* NOTE CHO ANDROID TV */}
          <div className="install-note-card">
            <div className="note-icon">💡</div>
            <div className="note-content">
              <strong>Lưu ý cho lần cài đầu tiên:</strong> Nếu TV hiển thị cảnh báo chặn cài ứng dụng từ nguồn ngoài, vào <em>Cài đặt TV &rarr; Ứng dụng &rarr; Quyền truy cập đặc biệt &rarr; Cài đặt ứng dụng không rõ nguồn gốc &rarr; Bật Cho phép cho app Downloader</em>.
            </div>
          </div>
        </div>

        {/* ================= CÁCH CÀI ĐẶT THỦ CÔNG ================= */}
        <div className="alt-methods-section">
          <h3 className="alt-section-title">Các Phương Pháp Cài Đặt Khác</h3>
          
          <div className="alt-methods-grid">
            
            <div className="alt-method-card">
              <div className="alt-method-header">
                <FaFolderOpen className="alt-icon alt-icon--purple" />
                <h4 className="alt-title">Cài bằng USB / Ổ cứng ngoài</h4>
              </div>
              <ul className="alt-steps">
                <li>Bấm tải <strong>TecedeTV</strong> về máy tính.</li>
                <li>Chép file vừa tải vào USB rồi cắm USB vào cổng TV.</li>
                <li>Dùng ứng dụng quản lý tệp tin (File Commander hoặc AnExplorer) trên TV mở file để cài đặt.</li>
              </ul>
            </div>

            <div className="alt-method-card">
              <div className="alt-method-header">
                <FaMobileAlt className="alt-icon alt-icon--blue" />
                <h4 className="alt-title">Truyền từ điện thoại (Send Files to TV)</h4>
              </div>
              <ul className="alt-steps">
                <li>Cài app <strong>Send Files to TV</strong> trên cả điện thoại Android và TV (chung Wi-Fi).</li>
                <li>Tải file <strong>TecedeTV</strong> về điện thoại, mở app chọn <strong>Send</strong> &rarr; chọn file.</li>
                <li>Trên TV mở app chọn <strong>Receive</strong>, sau khi nhận xong mở file để cài đặt.</li>
              </ul>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
