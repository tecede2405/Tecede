import { useState } from "react";
import axios from "axios";
import { FaTrashCan, FaPlus, FaFileImage, FaFileVideo } from "react-icons/fa6";
import "./style.scss";

function UploadStorage() {
  const [files, setFiles] = useState([]);
  const [totalSizeMB, setTotalSizeMB] = useState(0);

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  const MAX_FILE_SIZE = 52428800; // 50MB per file
  const isSizeError = files.some(item => item.file.size > MAX_FILE_SIZE);

  const calculateTotalSize = (currentFiles) => {
    const totalBytes = currentFiles.reduce((acc, item) => acc + item.file.size, 0);
    setTotalSizeMB(Number((totalBytes / (1024 * 1024)).toFixed(2)));
  };

  // Hàm gom nhóm xử lý file chung cho cả Click chọn và Kéo thả
  const processSelectedFiles = (selectedFiles) => {
    if (selectedFiles.length === 0) return;

    const newItems = selectedFiles.map((file) => ({
      id: crypto.randomUUID(),
      file: file,
      customName: file.name.replace(/\.[^/.]+$/, ""),
      extension: file.name.substring(file.name.lastIndexOf("."))
    }));

    const updatedFiles = [...files, ...newItems];
    setFiles(updatedFiles);
    calculateTotalSize(updatedFiles);
    setMessage("");
  };

  // 1. Xử lý khi chọn file qua click nút truyền thống
  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    processSelectedFiles(selectedFiles);
    e.target.value = ""; 
  };

  // 🔥 2. NGĂN TRÌNH DUYỆT TỰ MỞ TAB MỚI KHI ĐANG KÉO FILE QUA VÙNG THẢ
  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  // 🔥 3. XỬ LÝ LẤY FILE KHI NGƯỜI DÙNG THẢ CHUỘT
  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (loading) return; // Nếu đang upload thì không nhận thêm file kéo thả

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFiles = Array.from(e.dataTransfer.files);
      
      // Chỉ lọc lấy các file là ảnh hoặc video
      const validFiles = droppedFiles.filter(
        file => file.type.startsWith("image/") || file.type.startsWith("video/")
      );

      if (validFiles.length === 0) {
        setMessage("❌ Hệ thống chỉ hỗ trợ kéo thả file Hình ảnh hoặc Video!");
        return;
      }

      processSelectedFiles(validFiles);
    }
  };

  const handleNameChange = (id, value) => {
    const updated = files.map((item) => 
      item.id === id ? { ...item, customName: value } : item
    );
    setFiles(updated);
  };

  const handleRemoveFile = (id) => {
    const updated = files.filter((item) => item.id !== id);
    setFiles(updated);
    calculateTotalSize(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (files.length === 0 || isSizeError) return;

    const formData = new FormData();
    files.forEach((item) => {
      const finalName = `${item.customName.trim()}${item.extension}`;
      //  Bọc encodeURIComponent quanh tên file để ép dữ liệu về chuỗi ký tự ASCII an toàn
      const safeHeaderName = encodeURIComponent(finalName);
      formData.append("files", item.file, safeHeaderName);
    });

    try {
      setLoading(true);
      setMessage("");
      setProgress(0);

      const res = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/storage/upload`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
          onUploadProgress: (event) => {
            const percent = Math.round((event.loaded * 100) / event.total);
            setProgress(percent >= 100 ? 99 : percent);
          },
        }
      );

      if (res.status === 201) {
        setProgress(100);
        setMessage(`✅ Tải lên kho dữ liệu thành công ${files.length} file!`);
        setFiles([]);
        setTotalSizeMB(0);

        setTimeout(() => {
          setMessage("");
          setProgress(0);
        }, 4000);
      }
    } catch (err) {
      console.error(err);
      setMessage("❌ Upload dữ liệu thất bại");
      setProgress(0);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="storage-page">
      <div className="storage-header">
        <h2>Lưu trữ đám mây</h2>
        <p> Upload hình ảnh/ video (Tối đa 50MB/file)</p>
      </div>

      <form onSubmit={handleSubmit} className="storage-form">
        
        {/* VÙNG CHỌN / KÉO THẢ FILE BAN ĐẦU (Đã thêm sự kiện chặn mở tab mới) */}
        {files.length === 0 && (
          <div 
            className="storage-upload-box"
            onDragOver={handleDragOver} // 🔥 Chặn mở tab mới khi rà chuột qua
            onDrop={handleDrop}         // 🔥 Hứng file khi thả chuột
          >
            <label htmlFor="storage-file-upload" className="storage-upload-area">
              <div className="storage-upload-text">
                Kéo thả hoặc nhấn để chọn nhiều file cùng lúc
              </div>
              <span>Hệ thống tự động phân loại và tối ưu nén ảnh dạng .webp</span>
            </label>
          </div>
        )}

        {/* DANH SÁCH FILE ĐÃ CHỌN ĐỂ HIỂN THỊ VÀ SỬA TÊN */}
        {files.length > 0 && (
          <div className="storage-file-list-wrapper">
            <div className="list-header">
              <h3>Danh sách hàng chờ ({files.length} file)</h3>
              <span className={`total-size-badge ${isSizeError ? "danger" : ""}`}>
                Tổng dung lượng: {totalSizeMB} MB
              </span>
            </div>

            <div className="storage-file-list">
              {files.map((item) => {
                const isOverSize = item.file.size > MAX_FILE_SIZE;
                const sizeMB = (item.file.size / (1024 * 1024)).toFixed(2);

                return (
                  <div key={item.id} className={`file-item-card ${isOverSize ? "error" : ""}`}>
                    <div className="file-icon">
                      {item.file.type.startsWith("image/") ? (
                        <FaFileImage className="icon-img" />
                      ) : (
                        <FaFileVideo className="icon-video" />
                      )}
                    </div>

                    <div className="file-info-inputs">
                      <div className="input-group-name">
                        <input
                          type="text"
                          value={item.customName}
                          onChange={(e) => handleNameChange(item.id, e.target.value)}
                          placeholder="Nhập tên lưu trữ cho file..."
                          disabled={loading}
                        />
                        <span className="ext-label">{item.extension}</span>
                      </div>
                      <span className="file-raw-info">
                        Gốc: {item.file.name} • <strong className={isOverSize ? "text-danger" : ""}>{sizeMB} MB</strong>
                        {isOverSize && " (Vượt quá 50MB!)"}
                      </span>
                    </div>

                    <button
                      type="button"
                      className="remove-item-btn"
                      onClick={() => handleRemoveFile(item.id)}
                      disabled={loading}
                    >
                      <FaTrashCan />
                    </button>
                  </div>
                );
              })}
            </div>

            {/* VÙNG CHỌN THÊM CŨNG HỖ TRỢ KÉO THẢ THÊM FILE */}
            {!loading && (
              <div 
                onDragOver={handleDragOver}
                onDrop={handleDrop}
              >
                <label htmlFor="storage-file-upload-more" className="add-more-files-btn">
                  <FaPlus style={{ marginRight: "6px" }} /> Kéo thả hoặc bấm vào đây để chọn thêm file...
                </label>
              </div>
            )}
          </div>
        )}

        <input id="storage-file-upload" type="file" accept="image/*,video/*" multiple onChange={handleFileChange} hidden />
        <input id="storage-file-upload-more" type="file" accept="image/*,video/*" multiple onChange={handleFileChange} hidden />

        {/* PROGRESS BAR */}
        {progress > 0 && (
          <div className="storage-progress-wrapper">
            <div className="storage-progress-info">
              <span>
                {progress === 99 
                  ? "⚡ Server đang nén WebP và đồng bộ sang Telegram Cloud..." 
                  : "Đang tải dữ liệu từ máy lên Server..."}
              </span>
              <span>{progress}%</span>
            </div>
            <div className="storage-progress-bar">
              <div className={`storage-progress-fill ${progress === 99 ? "processing" : ""}`} style={{ width: `${progress}%` }} />
            </div>
          </div>
        )}

        <button type="submit" className="storage-submit-btn" disabled={loading || isSizeError || files.length === 0}>
          {loading 
            ? progress === 99 ? "Đang cấu hình mây..." : `Đang tải lên (${progress}%)`
            : isSizeError ? "Có file vượt dung lượng" : files.length > 0 ? `Bắt đầu tải lên ${files.length} file` : "Tải lên kho lưu trữ"
          }
        </button>

        {message && (
          <div className={`storage-message ${message.includes("✅") ? "success" : "error"}`}>
            {message}
          </div>
        )}
      </form>
    </div>
  );
}

export default UploadStorage;