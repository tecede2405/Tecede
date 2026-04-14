import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { MdHistory, MdPlayCircleOutline } from "react-icons/md";
import { Helmet } from "react-helmet-async";
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

  if (!user?.token) {
    return (
      <div className="container py-5">
        <div 
          className="mx-auto text-center p-5 shadow-lg" 
          style={{
            maxWidth: "600px",
            background: "#121212",
            backdropFilter: "blur(15px)",
            borderRadius: "24px",
            border: "1px solid rgba(255, 255, 255, 0.08)",
            marginTop: "50px"
          }}
        >
          <div className="mb-4">
            <div 
              className="d-inline-flex align-items-center justify-content-center bg-danger bg-opacity-10 text-danger rounded-circle mb-3"
              style={{ width: "90px", height: "90px" }}
            >
              <MdHistory size={50} />
            </div>
          </div>
          
          <h4 className="text-light fw-bold mb-3">Lịch Sử Xem</h4>
          <p className="text-secondary mb-4 mx-auto" style={{ maxWidth: "420px", lineHeight: "1.6" }}>
            Bạn chưa đăng nhập. Hãy đăng nhập để lưu lại lịch sử xem nha.
          </p>
          
          <div className="d-grid gap-3 d-sm-flex justify-content-sm-center">
            <button
              className="btn btn-danger btn-lg shadow-sm"
              style={{ borderRadius: "50px", fontSize : "1rem" }}
              onClick={() => navigate("/login")}
            >
              Đăng nhập ngay
            </button>
            <button
              className="btn btn-outline-light btn-lg px-4"
              style={{ borderRadius: "50px", fontSize : "1rem" }}
              onClick={() => navigate("/")}
            >
              Về Trang chủ
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
      <div className="d-flex align-items-center mb-4 border-bottom border-secondary pb-3">
        <MdHistory className="text-danger me-2" size={30} />
        <h3 className="text-light m-0 fw-bold">Lịch sử đã xem</h3>
      </div>

      {history.length === 0 ? (
        <div className="text-center py-5" style={{ color: "#666" }}>
          <MdPlayCircleOutline size={60} className="mb-3" />
          <p>Bạn chưa xem bộ phim nào gần đây.</p>
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
                        src={
                          displayImage
                            ? `${process.env.REACT_APP_FILM_API_URL}/image.php?url=${encodeURIComponent(displayImage)}`
                            : "/default-poster.jpg"
                        }
                        alt={item.title}
                        width="60"
                        height="85"
                        loading="lazy"
                        style={{ objectFit: "cover", borderRadius: "8px" }}
                        className="shadow"
                        onError={(e) => {
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

                    <td className="text-end pe-4 py-3">
                      <button className="btn btn-sm btn-outline-light rounded-pill px-3 shadow-sm" style={{ fontSize: "0.8rem", borderColor: "rgba(255,255,255,0.2)" }}>
                        Xem tiếp
                      </button>
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