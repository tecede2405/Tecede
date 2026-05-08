import "./index.scss";
import { useState, useEffect } from "react";
import socket from "../../utils/socket";
import { useLocation } from "react-router-dom";

const OverView = () => {
  const [counts, setCounts] = useState({});
  const [totalListens, setTotalListens] = useState(0);

  // USERS
  const [user, setUser] = useState(null);

  // ONLINE
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [onlineCount, setOnlineCount] = useState(0);

  const location = useLocation();

  /* ===== FETCH OVERVIEW ===== */
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

    /* ===== RESET USER ===== */
    setUser(null);

    /* ===== TOTAL SONGS ===== */
    Promise.all(
      categories.map((cat) =>
        fetch(
          `${process.env.REACT_APP_API_URL}/api/songs/category/${cat}`
        )
          .then((res) => res.json())
          .then((data) => ({
            [cat]: data.length,
          }))
      )
    ).then((results) => {
      setCounts(Object.assign({}, ...results));
    });

    /* ===== TOTAL LISTENS ===== */
    fetch(
      `${process.env.REACT_APP_API_URL}/api/songs/stats/total-listens`
    )
      .then((res) => res.json())
      .then((data) => {
        setTotalListens(data.total || 0);
      });

    /* ===== TOTAL USERS ===== */
    /* ===== USER MỚI NHẤT ===== */
fetch(
  `${process.env.REACT_APP_SERVER_API_URL}/auth/users`
)
  .then((res) => res.json())
  .then((data) => {
    console.log("USERS API:", data);

    let users = [];

    if (Array.isArray(data)) {
      users = data;
    } else if (Array.isArray(data.users)) {
      users = data.users;
    }

    if (users.length > 0) {
      // lấy user cuối cùng
      const latestUser =
        users[0];

      // lấy id
      setUser(latestUser.id);
    } else {
      setUser(0);
    }
  })
  .catch((err) => {
    console.log("Fetch users error:", err);
    setUser(0);
  });
  }, [location.pathname]);

  /* ===== SOCKET ===== */
  useEffect(() => {
    socket.on("online:list", (users) => {
      setOnlineUsers(users);
      setOnlineCount(users.length);
    });

    return () => {
      socket.off("online:list");
    };
  }, []);

  const totalSongs = Object.values(counts).reduce(
    (s, v) => s + v,
    0
  );

  const avgListen =
    totalSongs > 0
      ? Math.round(totalListens / totalSongs)
      : 0;

  const stats = [
    {
      title: "Số bài hát",
      value: totalSongs,
    },
    {
      title: "Playlist",
      value: 9,
    },
    {
      title: "Tổng lượt nghe",
      value: totalListens,
    },
    {
      title: "Trung bình lượt / bài",
      value: avgListen,
    },
    {
      title: "Người dùng đã đăng ký",
      value: user === null ? "..." : user,
    },
    {
      title: "Đang online",
      value: onlineCount,
    },
  ];

  return (
    <div className="overview-page">
      {/* Stats */}
      <div className="stats-grid">
        {stats.map((item, index) => (
          <div className="stat-card" key={index}>
            <div className="stat-title">
              {item.title}
            </div>

            <div className="stat-value">
              {typeof item.value === "number"
                ? item.value.toLocaleString()
                : item.value}
            </div>
          </div>
        ))}
      </div>

      {/* Online users */}
      <div className="online-wrapper">
        <div className="online-title">
          <span className="dot"></span>
          Người đang online

          <div className="online-badge">
            {onlineCount} online
          </div>
        </div>

        <div className="table-card">
          <table className="dashboard-table">
            <thead>
              <tr>
                <th>IP</th>
                <th>Trang đang xem</th>
                <th>Hoạt động lúc</th>
              </tr>
            </thead>

            <tbody>
              {onlineUsers.length === 0 ? (
                <tr>
                  <td
                    colSpan="3"
                    className="empty-row"
                  >
                    Không có ai online
                  </td>
                </tr>
              ) : (
                onlineUsers.map((u) => (
                  <tr key={u.visitorId}>
                    <td>{u.ip}</td>

                    <td>{u.page}</td>

                    <td>
                      {new Date(
                        u.lastActive
                      ).toLocaleTimeString("vi-VN")}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default OverView;