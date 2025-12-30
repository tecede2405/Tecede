import "./index.scss";
import { useState, useEffect } from "react";
import socket from "../../utils/socket";

const OverView = () => {
  const [counts, setCounts] = useState({});
  const [totalListens, setTotalListens] = useState(0);

  // analytics
  const [totalVisits, setTotalVisits] = useState(0);
  const [todayVisits, setTodayVisits] = useState(0);

  // socket
  const [onlineCount, setOnlineCount] = useState(0);
  const [onlineUsers, setOnlineUsers] = useState([]);

  /* ================= FETCH STATS ================= */
  useEffect(() => {
    const categories = [
      "nhactre",
      "nhacphonk",
      "nhacusuk",
      "nhactrungquoc",
      "nhacedm",
      "nhackhongloi",
      "nhactreremix",
    ];

    Promise.all(
      categories.map((cat) =>
        fetch(`${process.env.REACT_APP_API_URL}/api/songs/category/${cat}`)
          .then((res) => res.json())
          .then((data) => ({ [cat]: data.length }))
      )
    ).then((results) => {
      setCounts(Object.assign({}, ...results));
    });

    fetch(`${process.env.REACT_APP_API_URL}/api/songs/stats/total-listens`)
      .then((res) => res.json())
      .then((data) => setTotalListens(data.total || 0));

    fetch(`${process.env.REACT_APP_API_URL}/api/stats/visits-total`)
      .then((res) => res.json())
      .then((data) => setTotalVisits(data.total || 0));

    fetch(`${process.env.REACT_APP_API_URL}/api/stats/visits-today`)
      .then((res) => res.json())
      .then((data) => setTodayVisits(data.total || 0));
  }, []);

  /* ================= SOCKET: ONLINE COUNT ================= */
  useEffect(() => {
    socket.on("online-count", setOnlineCount);
    return () => socket.off("online-count");
  }, []);

  /* ================= SOCKET: ONLINE LIST ================= */
  useEffect(() => {
    socket.on("online:list", setOnlineUsers);
    return () => socket.off("online:list");
  }, []);

  const totalSongs = Object.values(counts).reduce((s, v) => s + v, 0);
  const avgListen =
    totalSongs > 0 ? Math.round(totalListens / totalSongs) : 0;

  return (
    <>
      <h2 className="overview-title">Tổng quan hệ thống</h2>

      <table className="dashboard">
        <tbody>
          <tr>
            <th>Thông số</th>
            <th>Nội dung hiển thị</th>
          </tr>

          <tr>
            <td>Số bài hát hiện có</td>
            <td>{totalSongs}</td>
          </tr>
          <tr>
            <td>Playlist được tạo</td>
            <td>9 playlist</td>
          </tr>
          <tr>
            <td>Tổng số lượt nghe</td>
            <td>{totalListens}</td>
          </tr>
          <tr>
            <td>Trung bình lượt nghe / bài</td>
            <td>{avgListen}</td>
          </tr>

          <tr>
            <td>Tổng lượt truy cập website</td>
            <td>{totalVisits}</td>
          </tr>
          <tr>
            <td>Lượt truy cập hôm nay</td>
            <td>{todayVisits}</td>
          </tr>
          <tr>
            <td>Người đang online</td>
            <td>{onlineCount}</td>
          </tr>
        </tbody>
      </table>

      <h3 className="text-light" style={{ marginTop: 30 }}>
        🟢 Người đang online
      </h3>

      <table className="dashboard small">
        <thead>
          <tr>
            <th>IP</th>
            <th>Trang</th>
            <th>Kết nối lúc</th>
          </tr>
        </thead>
        <tbody>
          {onlineUsers.length === 0 && (
            <tr>
              <td colSpan="3">Không có ai online</td>
            </tr>
          )}

          {onlineUsers.map((u) => (
            <tr key={u.visitorId}>
              <td>{u.ip}</td>
              <td>{u.page}</td>
              <td>{new Date(u.connectedAt).toLocaleTimeString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
};

export default OverView;
