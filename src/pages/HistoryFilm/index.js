import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { MdHistory, MdPlayCircleOutline } from "react-icons/md";
import { Helmet } from "react-helmet-async";
import Swal from "sweetalert2";
import "./style.scss";
export default function WatchHistory() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    if (!user?.token) {
      setLoading(false);
      return;
    }

    const fetchHistory = async () => {
      try {
        const res = await fetch(
          `${process.env.REACT_APP_SERVER_API_URL}/history`,
          {
            headers: {
              Authorization: `Bearer ${user.token}`,
            },
          }
        );

        const data = await res.json();
        setHistory(data.data || []);
      } catch (err) {
        console.log("Lỗi load history:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [user]);

  const deleteHistoryItem = async (id) => {
  const confirm = await Swal.fire({
    title: "Xóa lịch sử?",
    text: "Phim này sẽ bị xóa khỏi lịch sử xem",
    icon: "warning",

    background: "#111827",
    color: "#fff",

    confirmButtonColor: "#dc3545",
    cancelButtonColor: "#374151",

    confirmButtonText: "Xóa",
    cancelButtonText: "Hủy",

    showCancelButton: true,
  });

  if (!confirm.isConfirmed) return;

  try {
    const res = await fetch(
      `${process.env.REACT_APP_SERVER_API_URL}/history/${id}`,
      {
        method: "DELETE",

        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      }
    );

    if (!res.ok) {
      throw new Error();
    }

    setHistory((prev) =>
      prev.filter((item) => item.id !== id)
    );

    Swal.fire({
      icon: "success",
      title: "Đã xóa lịch sử",

      toast: true,
      position: "top-end",

      timer: 2000,
      showConfirmButton: false,

      background: "#111827",
      color: "#fff",
    });
  } catch (err) {
    console.log(err);

    Swal.fire({
      icon: "error",
      title: "Xóa thất bại",

      background: "#111827",
      color: "#fff",

      confirmButtonColor: "#dc3545",
    });
  }
};

const deleteAllHistory = async () => {
  const confirm = await Swal.fire({
    title: "Xóa toàn bộ lịch sử?",
    text: "Hành động này không thể hoàn tác",
    icon: "warning",

    background: "#111827",
    color: "#fff",

    confirmButtonColor: "#dc3545",
    cancelButtonColor: "#374151",

    confirmButtonText: "Xóa tất cả",
    cancelButtonText: "Hủy",

    showCancelButton: true,
  });

  if (!confirm.isConfirmed) return;

  try {
    const res = await fetch(
      `${process.env.REACT_APP_SERVER_API_URL}/history`,
      {
        method: "DELETE",

        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      }
    );

    if (!res.ok) {
      throw new Error();
    }

    setHistory([]);

    Swal.fire({
      icon: "success",
      title: "Đã xóa toàn bộ lịch sử",

      toast: true,
      position: "top-end",

      timer: 2000,
      showConfirmButton: false,

      background: "#111827",
      color: "#fff",
    });
  } catch (err) {
    console.log(err);

    Swal.fire({
      icon: "error",
      title: "Xóa thất bại",

      background: "#111827",
      color: "#fff",

      confirmButtonColor: "#dc3545",
    });
  }
};

if (!user?.token) {
  return (
    <div className="wh404-wrapper">
      <div className="wh404-overlay"></div>

      <div className="wh404-content">
        <div className="wh404-heading">
          <div className="wh404-icon">
            <MdHistory size={40} />
          </div>

          <h2 className="wh404-title">
            Lịch sử xem
          </h2>
        </div>

        <p className="wh404-desc">
          Bạn chưa đăng nhập. Hãy đăng nhập để lưu lại lịch sử xem phim nhé.
        </p>

        <div className="wh404-btn-group">
          <button
            className="wh404-action-btn wh404-login-btn"
            onClick={() => navigate("/login")}
          >
            <span>Đăng nhập ngay</span>
          </button>

          <button
            className="wh404-action-btn"
            onClick={() => navigate("/")}
          >
            <span>Về trang chủ</span>
          </button>
        </div>
      </div>
    </div>
  );
}

  if (loading) return (
    <div className="container py-5 text-center text-light">
      <div className="spinner-border text-danger" role="status">
        <span className="visually-hidden">Đang tải...</span>
      </div>
    </div>
  );

return (
    <>
    <Helmet>
      <title>Lịch sử xem phim - Tecede</title>
      <meta
        name="description"
        content="Xem lại các bộ phim bạn đã xem gần đây trên Tecede. Tiếp tục xem nhanh chóng và tiện lợi."
      />

      {/* Open Graph */}
      <meta property="og:title" content="Lịch sử xem phim - Tecede" />
      <meta
        property="og:description"
        content="Theo dõi và tiếp tục xem các bộ phim bạn yêu thích tại Tecede."
      />
    </Helmet>
      <div className="container py-4" style={{ minHeight: "80vh" }}>
      <div className="d-flex justify-content-between align-items-center mb-4 border-bottom border-secondary pb-3 flex-wrap gap-3">
      <div className="d-flex align-items-center">
        <MdHistory
          className="text-danger me-2"
          size={30}
        />

        <h3 className="text-light m-0 fw-bold">
          Lịch sử đã xem
        </h3>
      </div>

      {history.length > 0 && (
        <button
          className="btn btn-sm btn-outline-danger rounded-pill px-3"
          onClick={deleteAllHistory}
        >
          Xóa tất cả
        </button>
      )}
    </div>

      {history.length === 0 ? (
        <div className="text-center py-5" style={{ color: "#666" }}>
          <MdPlayCircleOutline size={60} className="mb-3" />
          <p>Nếu bạn không thấy lịch sử xem, hãy đăng xuất rồi đăng nhập lại nha.</p>
        </div>
      ) : (
        <div className="rounded-3 overflow-hidden shadow-lg" style={{ backgroundColor: "#111" }}>
          <table 
            className="table table-dark table-borderless align-middle m-0" 
            style={{ 
              backgroundColor: "transparent",
              color: "#ddd"
            }}
          >
            <thead style={{ backgroundColor: "rgba(255,255,255,0.05)" }}>
              <tr className="text-secondary small">
                <th className="ps-4 py-2" style={{ width: "100px", fontSize: "0.7rem" }}>PHIM</th>
                <th className="py-2" style={{ fontSize: "0.7rem" }}>THÔNG TIN</th>
                <th className="text-end pe-4 py-2" style={{ width: "150px",fontSize: "0.7rem" }}>HÀNH ĐỘNG</th>
              </tr>
            </thead>
            <tbody>
              {history.map((item) => {
                const safeServer = encodeURIComponent(item.server);
                const watchUrl = `/xem-phim/${item.movie_path}/${safeServer}/${item.episode}`;
                const displayImage = item.image?.startsWith("http")
                  ? item.image 
                  : `${process.env.REACT_APP_FILM_API_URL}/image.php?url=${encodeURIComponent(item.image)}`;

                return (
                  <tr
                    key={item.id}
                    style={{ 
                        cursor: "pointer", 
                        borderBottom: "1px solid rgba(255,255,255,0.05)",
                        background: "none" 
                    }}
                    onClick={() => navigate(watchUrl)}
                  >
                    <td className="ps-2 py-2">
                      <img
                        src={displayImage || "/default-poster.jpg"}
                        alt={item.title}
                        width="60"
                        height="85"
                        loading="lazy"
                        style={{ objectFit: "cover", borderRadius: "8px" }}
                        className="shadow"
                        onError={(e) => {
                          e.target.onerror = null; // Tránh loop vô hạn nếu ảnh default cũng lỗi
                          e.target.src = "/default-poster.jpg";
                        }}
                      />
                    </td>

                    <td className="py-3">
                      <div className="fw-bold text-white mb-1" style={{ fontSize: "0.9rem" }}>{item.movie_name}</div>
                      <div className="d-flex align-items-center gap-2 mb-1">
                        <span className="badge rounded-pill bg-danger" style={{ fontSize: "0.7rem", padding: "5px 10px" }}>
                          Tập: {item.episode}
                        </span>
                        <span className="text-secondary small">{item.server}</span>
                      </div>
                      <div className="small">
                        Ngày : {new Date(item.updated_at).toLocaleDateString('vi-VN', {
                              day: '2-digit',
                              month: '2-digit',
                              year: 'numeric'
                            })}
                      </div>
                    </td>

                    <td className="text-end">
                      <div className="d-flex justify-content-end gap-2">
                        <button
                          className="btn btn-sm btn-outline-light rounded-pill px-3 shadow-sm"
                          style={{
                            fontSize: "0.7rem",
                            borderColor: "rgba(255,255,255,0.2)",
                          }}
                        >
                          Xem tiếp
                        </button>

                        <button
                          className="btn btn-sm btn-outline-danger rounded-pill px-3"
                          style={{
                            fontSize: "0.7rem",
                          }}
                          onClick={(e) => {
                            e.stopPropagation();

                            deleteHistoryItem(item.id);
                          }}
                        >
                          Xóa
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <style>{`
        /* Đảm bảo table không bị dính màu trắng từ global CSS */
        .table-dark {
          --bs-table-bg: transparent !important;
          --bs-table-color: #ddd !important;
        }
        .table tbody tr:hover {
          background-color: #282c34 !important;
        }
      `}</style>
    </div>
    </>
  );
}