import { useEffect, useMemo, useState } from "react";
import "./style.scss";

const PER_PAGE = 50;

export default function ManageUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalUsers, setTotalUsers] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
  fetch(`${process.env.REACT_APP_SERVER_API_URL}/auth/users`)
    .then((res) => res.json())
    .then((data) => {
      if (Array.isArray(data) && data.length > 0) {
        // sắp xếp: Mới nhất lên đầu (ID cao nhất lên đầu)
        const sorted = [...data].sort((a, b) => b.id - a.id);
        setUsers(sorted);


        const latestId = sorted[0].id;
        setTotalUsers(latestId);
      } else {
        setUsers([]);
        setTotalUsers(0);
      }
      setLoading(false);
    })
    .catch((err) => {
      console.log(err);
      setLoading(false);
    });
}, []);

  const totalPages = Math.ceil(users.length / PER_PAGE);

  const paginatedUsers = useMemo(() => {
    const start = (currentPage - 1) * PER_PAGE;
    const end = start + PER_PAGE;

    return users.slice(start, end);
  }, [users, currentPage]);

  const changePage = (page) => {
  setCurrentPage(page);

  window.scrollTo({
    top: 0,
    behavior: "smooth",
  });
};
  return (
    <div className="users-page">
      {/* HEADER */}
      <div className="users-header">
        <div>
          <h2>Quản lý người dùng</h2>

          <p>
            Tổng cộng {totalUsers.toLocaleString()} tài khoản
          </p>
        </div>

        <div className="users-count">
          {totalUsers} users
        </div>
      </div>

      {/* TABLE */}
      <div className="users-table-wrapper">
        <table className="users-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Ảnh</th>
              <th>Biệt danh</th>
              <th>Vai trò</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan="5" className="empty-cell">
                  Đang tải dữ liệu...
                </td>
              </tr>
            ) : paginatedUsers.length === 0 ? (
              <tr>
                <td colSpan="5" className="empty-cell">
                  Không có dữ liệu
                </td>
              </tr>
            ) : (
              paginatedUsers.map((user) => (
                <tr key={user.id}>
                  <td className="user-id">
                    {user.id}
                  </td>

                  <td>
                    <img
                      src={
                        user.avatar ||
                        "https://ui-avatars.com/api/?name=User&background=111827&color=fff"
                      }
                      alt={user.username}
                      className="user-avatar"
                    />
                  </td>


                  <td>
                    {user.display_name || "Chưa đặt"}
                  </td>

                  <td>
                    <span
                      className={`role-badge ${user.role}`}
                    >
                      {user.role}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* PAGINATION */}
      {!loading && totalPages > 1 && (
        <div className="pagination">
          <button
            disabled={currentPage === 1}
            onClick={() => changePage(currentPage - 1)}
            >
            ← Trước
            </button>

            <div className="page-number">
            Trang {currentPage} / {totalPages}
            </div>

            <button
            disabled={currentPage === totalPages}
            onClick={() => changePage(currentPage + 1)}
            >
            Tiếp →
            </button>
        </div>
      )}
    </div>
  );
}