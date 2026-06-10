import React, { useState, useEffect } from 'react';
import './style.scss'; 

const PwaInstallButton = () => {
  // Trạng thái lưu trữ sự kiện prompt từ trình duyệt
  const [installPrompt, setInstallPrompt] = useState(null);
  // Trạng thái hiển thị của button (Mặc định ẩn)
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e) => {
      // Chặn banner cài đặt mặc định của trình duyệt
      e.preventDefault();
      // Lưu sự kiện lại vào state
      setInstallPrompt(e);
      // Kích hoạt hiển thị nút bấm
      setIsVisible(true);
    };

    const handleAppInstalled = () => {
      // Ẩn nút nếu app đã được cài đặt thành công bằng cách khác
      setInstallPrompt(null);
      setIsVisible(false);
      console.log('Tecede PWA đã được cài đặt thành công!');
    };

    // Đăng ký các sự kiện với hệ thống
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    // Hủy đăng ký sự kiện khi component bị unmount để tránh rò rỉ bộ nhớ
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!installPrompt) return;

    // Gọi showbox (hộp thoại cài đặt gốc) của trình duyệt lên
    installPrompt.prompt();

    // Chờ phản hồi từ người dùng (Hủy hoặc Đồng ý cài)
    const { outcome } = await installPrompt.userChoice;
    console.log(`Người dùng chọn: ${outcome}`);

    // Xóa sự kiện cũ vì mỗi prompt chỉ xài được 1 lần
    setInstallPrompt(null);
    // Ẩn nút đi sau khi tương tác xong
    setIsVisible(false);
  };

  // Nếu trình duyệt chưa sẵn sàng cài đặt, component không render gì cả
  if (!isVisible) return null;

  return (
    <div className="tecede-pwa-container">
      <button onClick={handleInstallClick} className="tecede-btn-pwa">
        {/* Icon Tải xuống (SVG thuần gọn nhẹ) */}
        <svg 
          className="pwa-icon"
          viewBox="0 0 24 24" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
        >
          <path 
            d="M12 15V3M12 15L8 11M12 15L16 11M19 17V19H5V17" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          />
        </svg>
        <span className="btn-text">Tải App Tecede</span>
      </button>
    </div>
  );
};

export default PwaInstallButton;