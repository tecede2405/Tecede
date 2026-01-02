import { useEffect, useState } from "react";

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

  return (
    <div style={{ padding: 20 }}>
      <h2 className="text-light">Lịch sử truy cập website</h2>

      <table className="dashboard-visitor small" style={{ marginTop: 20 }}>
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
              <td colSpan="6">Đang tải dữ liệu...</td>
            </tr>
          )}

          {!loading && logs.length === 0 && (
            <tr>
              <td colSpan="6">Chưa có dữ liệu</td>
            </tr>
          )}

          {!loading &&
            logs.map((log, index) => (
              <tr key={index}>
                <td>{log.ip}</td>

                <td>
                  {log.device === "mobile"
                    ? "Mobile"
                    : log.device === "tablet"
                    ? "Tablet"
                    : "Desktop"}
                </td>

                <td>{log.browser || "Unknown"}</td>

                <td>{log.page}</td>

                <td>
                  {new Date(log.visitedAt).toLocaleString("vi-VN")}
                </td>
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  );
}
