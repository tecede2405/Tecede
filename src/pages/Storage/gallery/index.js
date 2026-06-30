import { useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { 
  FaArrowRotateRight, 
  FaFileImage, 
  FaFileVideo, 
  FaLink, 
  FaCheck, 
  FaTrashCan 
} from "react-icons/fa6"; 
import "./style.scss";

function StorageGallery() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState(null);

  const DarkSwal = Swal.mixin({
    background: "#1f1f1f",
    color: "#fff",
    confirmButtonColor: "#e50914",
    cancelButtonColor: "#444",
    customClass: {
        popup: "swal-dark",
        title: "swal-title",
        htmlContainer: "swal-text",
        confirmButton: "swal-confirm",
    },
    });

  const fetchStorageData = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/storage`);
      setItems(res.data);
    } catch (error) {
      console.error("Lỗi lấy danh sách kho lưu trữ:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStorageData();
  }, []);

  const handleCopyLink = (id) => {
    const directLink = `${process.env.REACT_APP_API_URL}/api/storage/file/${id}`;
    
    navigator.clipboard.writeText(directLink);
    setCopiedId(id);
    
    setTimeout(() => {
      setCopiedId(null);
    }, 2000);
  };

  const handleDelete = async (id) => {
  const result = await DarkSwal.fire({
    icon: "warning",
    title: "Xóa file?",
    text: "File sau khi xóa sẽ không thể khôi phục lại.",
    showCancelButton: true,
    confirmButtonText: "Xóa ngay",
    cancelButtonText: "Hủy",
    reverseButtons: true,
  });

  if (!result.isConfirmed) return;

  try {
    await axios.delete(
      `${process.env.REACT_APP_API_URL}/api/storage/${id}`
    );

    // Xóa luôn trên giao diện, không cần gọi API lại
    setItems((prev) => prev.filter((item) => item._id !== id));

    DarkSwal.fire({
      icon: "success",
      title: "Đã xóa",
      text: "File đã được xóa khỏi kho lưu trữ.",
      timer: 1500,
      showConfirmButton: false,
    });
  } catch (error) {
    console.error(error);

    DarkSwal.fire({
      icon: "error",
      title: "Xóa thất bại",
      text: "Đã xảy ra lỗi khi xóa file.",
    });
  }
};

  //  Hàm phụ đổi Bytes sang định dạng dễ đọc (KB, MB)
  const formatFileSize = (bytes) => {
    if (!bytes || isNaN(bytes)) return "0 Bytes";
    if (bytes < 1024) return `${bytes} Bytes`;
    
    const kb = bytes / 1024;
    if (kb < 1024) return `${kb.toFixed(2)} KB`;
    
    const mb = kb / 1024;
    return `${mb.toFixed(2)} MB`;
  };

  return (
    <div className="gallery-page">
      <div className="gallery-header">
        <div>
          <h2>Kho tài nguyên dữ liệu</h2>
          <p>Quản lý toàn bộ hình ảnh, video đã upload</p>
        </div>
        <button onClick={fetchStorageData} className="refresh-btn" disabled={loading}>
          <FaArrowRotateRight className={loading ? "spin" : ""} style={{ marginRight: "6px" }} />
          {loading ? "Đang tải..." : "Làm mới"}
        </button>
      </div>

      {loading ? (
        <div className="gallery-loading">Đang tải danh sách tài nguyên...</div>
      ) : (
        <div className="gallery-grid">
          {items.map((item) => {
            const fileUrl = `${process.env.REACT_APP_API_URL}/api/storage/file/${item._id}`;
            
            return (
              <div key={item._id} className="gallery-card">
                <div className="media-preview-box">
                  {item.type === "image" ? (
                    <img src={fileUrl} alt={item.name} loading="lazy" />
                  ) : (
                    <video 
                      src={fileUrl} 
                      controls 
                      preload="metadata"
                      playsInline
                      webkit-playsinline="true"
                      type="video/mp4"
                    >
                      Trình duyệt của bạn không hỗ trợ xem video trực tuyến.
                    </video>
                  )}
                </div>

                <div className="card-info">
                  <h4 title={item.name}>{item.name}</h4>
                  
                  {/* Bọc cụm badge và dung lượng vào một hàng flex */}
                  <div className="card-meta-row">
                    <span className={`file-badge ${item.type}`}>
                      {item.type === "image" ? (
                        <>
                          <FaFileImage style={{ marginRight: "5px" }} /> IMAGE
                        </>
                      ) : (
                        <>
                          <FaFileVideo style={{ marginRight: "5px" }} /> VIDEO
                        </>
                      )}
                    </span>
                    
                    {/* 🔥 HIỂN THỊ DUNG LƯỢNG FILE TẠI ĐÂY */}
                    <span className="file-size-badge">
                      {formatFileSize(item.size)}
                    </span>
                  </div>
                </div>

                <div className="card-actions">
                  <button
                    onClick={() => handleCopyLink(item._id)}
                    className={`copy-btn ${copiedId === item._id ? "copied" : ""}`}
                  >
                    {copiedId === item._id ? (
                      <>
                        <FaCheck style={{ marginRight: "6px" }} /> Đã copy link
                      </>
                    ) : (
                      <>
                        <FaLink style={{ marginRight: "6px" }} /> Lấy Link Nhúng
                      </>
                    )}
                  </button>
                  
                  <button onClick={() => handleDelete(item._id)} className="delete-btn">
                    <FaTrashCan style={{ marginRight: "6px" }} /> Xóa file
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {!loading && items.length === 0 && (
        <div className="gallery-empty">
          <p>Kho dữ liệu đám mây của bạn hiện đang trống.</p>
        </div>
      )}
    </div>
  );
}

export default StorageGallery;