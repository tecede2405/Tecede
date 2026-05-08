import { useEffect, useState } from "react";
import "./admin.scss";

export default function VisitLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${process.env.REACT_APP_API_URL}/api/stats/visits`)
      .then((res) => res.json())
      .then((data) => {
        setLogs(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const getDeviceClass = (device) => {
    if (device === "mobile") return "mobile";
    if (device === "tablet") return "tablet";
    return "desktop";
  };

  const getDeviceLabel = (device) => {
    if (device === "mobile") return "Mobile";
    if (device === "tablet") return "Tablet";
    return "Desktop";
  };

  return (
    <div className="visit-page">
      <div className="visit-header">
        <h2>Lịch sử truy cập website</h2>
        <p>Theo dõi hoạt động người dùng theo thời gian thực</p>
      </div>

      <div className="visit-table-wrapper">
        <table className="visit-table">
          <thead>
            <tr>
              <th>IP</th>
              <th>Thiết bị</th>
              <th>Trình duyệt</th>
              <th>Trang</th>
              <th>Thời gian</th>
            </tr>
          </thead>

          <tbody>
            {loading && (
              <tr>
                <td colSpan="5" className="empty-cell">
                  Đang tải dữ liệu...
                </td>
              </tr>
            )}

            {!loading && logs.length === 0 && (
              <tr>
                <td colSpan="5" className="empty-cell">
                  Chưa có dữ liệu
                </td>
              </tr>
            )}

            {!loading &&
              logs.map((log, index) => (
                <tr key={index}>
                  <td>{log.ip}</td>

                  <td>
                    <span
                      className={`device-badge ${getDeviceClass(
                        log.device
                      )}`}
                    >
                      {getDeviceLabel(log.device)}
                    </span>
                  </td>

                  <td>{log.browser || "Unknown"}</td>

                  <td className="page-url">
                    {log.page}
                  </td>

                  <td>
                    {new Date(
                      log.visitedAt
                    ).toLocaleString("vi-VN")}
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}