import React from "react";
import {
  HelpCircle,
  X,
  CheckCircle2,
  Copy,
  Clock,
  FileText,
  UploadCloud
} from "lucide-react";
import Swal from "sweetalert2";

const PolicyModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const copySample = (text) => {
    navigator.clipboard.writeText(text);
    Swal.fire({
      toast: true,
      position: "top-end",
      icon: "success",
      title: "Đã sao chép mẫu!",
      showConfirmButton: false,
      timer: 1500,
      background: "#1e293b",
      color: "#fff"
    });
  };

  const sampleScript = `[00:00:00 - 00:00:04] Xin chào các bạn đã quay trở lại kênh!
[00:00:04 - 00:00:09] Hôm nay chúng ta cùng tìm hiểu về công nghệ AI.
[00:00:09 - 00:00:14] Chúc các bạn có những trải nghiệm thật thú vị!`;

  return (
    <div className="admin-tts-modal-overlay" onClick={onClose}>
      <div
        className="admin-tts-modal-dialog"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <div className="modal-header-custom">
          <div className="d-flex align-items-center gap-2">
            <div className="icon-shield-wrap">
              <HelpCircle className="text-info" size={22} />
            </div>
            <div>
              <h4 className="mb-0 text-white font-weight-bold">
                Hướng Dẫn Định Dạng Kịch Bản
              </h4>
              <p className="modal-header-desc mb-0">
                Cách viết và nhập liệu chuẩn cho 3 tùy chọn
              </p>
            </div>
          </div>
          <button
            type="button"
            className="btn-close-custom"
            onClick={onClose}
            aria-label="Đóng"
          >
            <X size={20} />
          </button>
        </div>

        <div className="modal-body-custom">
          {/* Option 1 */}
          <div className="guide-option-card">
            <div className="d-flex align-items-center gap-2 mb-1">
              <FileText size={16} className="text-primary" />
              <strong className="text-white">Option 1: Đoạn ngẫu nhiên</strong>
            </div>
            <p className="guide-desc mb-0">
              Dán văn bản thông thường không có mốc giờ. Hệ thống tự động tách câu theo dấu câu (<code>.</code> <code>!</code> <code>?</code>) và đọc nối tiếp theo tốc độ bạn chọn.
            </p>
          </div>

          {/* Option 2 */}
          <div className="guide-option-card">
            <div className="d-flex justify-content-between align-items-center mb-1">
              <div className="d-flex align-items-center gap-2">
                <Clock size={16} className="text-warning" />
                <strong className="text-white">Option 2: Kịch bản kèm thời gian</strong>
              </div>
              <button
                type="button"
                className="btn-copy-code"
                onClick={() => copySample(sampleScript)}
                title="Sao chép mẫu"
              >
                <Copy size={12} className="me-1" /> Copy mẫu
              </button>
            </div>
            <p className="guide-desc mb-2">
              Dùng cú pháp <code>[hh:mm:ss - hh:mm:ss] Lời thoại</code>. Giữa các câu có khoảng trống thời gian, hệ thống sẽ tự động chèn khoảng lặng (im lặng) chuẩn xác.
            </p>
            <pre className="code-example-box">{sampleScript}</pre>
          </div>

          {/* Option 3 */}
          <div className="guide-option-card">
            <div className="d-flex align-items-center gap-2 mb-1">
              <UploadCloud size={16} className="text-success" />
              <strong className="text-white">Option 3: Nhập file phụ đề</strong>
            </div>
            <p className="guide-desc mb-0">
              Tải trực tiếp file phụ đề <code>.srt</code>, <code>.vtt</code> hoặc <code>.txt</code>. Hệ thống sẽ đọc toàn bộ mốc thời gian và câu thoại từ file của bạn.
            </p>
          </div>

          {/* Mẹo ngắt nhịp */}
          <div className="tip-box">
            <span className="tip-highlight">💡 Mẹo nhỏ:</span> Hãy dùng dấu phẩy (<code>,</code>) và dấu chấm (<code>.</code>) đầy đủ để giọng đọc AI ngắt nhịp và lấy hơi tự nhiên nhất.
          </div>
        </div>

        <div className="modal-footer-custom">
          <button type="button" className="btn-confirm-policy" onClick={onClose}>
            <CheckCircle2 size={16} />
            <span>Đã hiểu</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default PolicyModal;
