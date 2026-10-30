import { useEffect, useState, useCallback, useRef } from "react";
import { useOutletContext } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import Swal from "sweetalert2";
import { 
  FaSearch, 
  FaTimes, 
  FaShieldAlt, 
  FaCrown, 
  FaUser, 
  FaFilter,
  FaCalendarAlt,
  FaArrowLeft,
  FaSyncAlt
} from "react-icons/fa";
import { 
  fetchCachedPaginatedUsers, 
  clearUsersPageCache 
} from "../../services/adminUsersCache";
import "./style.scss";

const PAGE_LIMIT = 10;

const ROLE_OPTIONS = [
  { value: "user", label: "User", icon: FaUser, badgeClass: "user" },
  { value: "premium", label: "Premium", icon: FaCrown, badgeClass: "premium" },
  { value: "admin", label: "Admin", icon: FaShieldAlt, badgeClass: "admin" },
];

export default function ManageUsers() {
  const { user: currentUser } = useAuth();
  const outletCtx = useOutletContext();
  const parentTotal = outletCtx?.totalUsersCount;

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalUsers, setTotalUsers] = useState(0);
  const [localSystemTotal, setLocalSystemTotal] = useState(0);
  const systemTotal = parentTotal ?? localSystemTotal;

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Search & Filter state
  const [searchType, setSearchType] = useState("username"); // "username" | "id"
  const [activeSearchType, setActiveSearchType] = useState("username");
  const [searchInput, setSearchInput] = useState("");
  const [searchKeyword, setSearchKeyword] = useState("");
  const [selectedRole, setSelectedRole] = useState(""); // "" | "user" | "premium" | "admin"
  const [isSearching, setIsSearching] = useState(false);

  const searchDebounceRef = useRef(null);

  // 0. Fetch tổng số lượng user hệ thống từ API (chỉ gọi khi người dùng bấm nút Refresh thủ công)
  const fetchTotalUsersCount = useCallback(async () => {
    try {
      const res = await fetch(`${process.env.REACT_APP_SERVER_API_URL}/auth/users/count`);
      const data = await res.json();
      let total = 0;
      if (data && typeof data.total === "number") {
        total = data.total;
      } else if (data && typeof data.count === "number") {
        total = data.count;
      } else {
        const fallbackRes = await fetch(`${process.env.REACT_APP_SERVER_API_URL}/auth/total-users`);
        const fbData = await fallbackRes.json();
        if (fbData && typeof fbData.total === "number") {
          total = fbData.total;
        }
      }
      setLocalSystemTotal(total);
      outletCtx?.setTotalUsersCount?.(total);
    } catch (err) {
      console.warn("Lỗi lấy tổng số user từ API count:", err);
    }
  }, [outletCtx]);

  const DarkSwal = Swal.mixin({
    background: "#151a27",
    color: "#fff",
    confirmButtonColor: "#3b82f6",
    cancelButtonColor: "#334155",
    customClass: {
      popup: "swal-dark",
      title: "swal-title",
      htmlContainer: "swal-text",
      confirmButton: "swal-confirm",
    }
  });

  // 1. Fetch danh sách phân trang có Cache 2 phút & Deduplication (khi không tìm kiếm)
  const fetchPaginatedUsers = useCallback(async (page = 1, role = selectedRole, force = false) => {
    if (!currentUser?.token) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const data = await fetchCachedPaginatedUsers({
        page,
        limit: PAGE_LIMIT,
        role,
        token: currentUser.token,
        force,
      });

      if (data && data.success && Array.isArray(data.data)) {
        setUsers(data.data);
        if (data.pagination) {
          const total = data.pagination.total ?? data.data.length;
          setTotalUsers(total);
          setTotalPages(data.pagination.totalPages ?? 1);
          setCurrentPage(data.pagination.page ?? page);
          // Tận dụng luôn total từ kết quả phân trang để hiển thị tổng user hệ thống
          if (!role) {
            setLocalSystemTotal(total);
            outletCtx?.setTotalUsersCount?.(total);
          }
        }
      } else if (Array.isArray(data)) {
        // Fallback tương thích nếu backend trả về mảng trực tiếp
        setUsers(data.slice((page - 1) * PAGE_LIMIT, page * PAGE_LIMIT));
        setTotalUsers(data.length);
        setTotalPages(Math.max(1, Math.ceil(data.length / PAGE_LIMIT)));
        setCurrentPage(page);
        if (!role) {
          setLocalSystemTotal(data.length);
          outletCtx?.setTotalUsersCount?.(data.length);
        }
      } else {
        setUsers([]);
        setTotalUsers(0);
        setTotalPages(1);
      }
    } catch (err) {
      console.warn("Lỗi tải danh sách người dùng:", err);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, [currentUser?.token, selectedRole, outletCtx]);

  // 2. Tìm kiếm user theo ID hoặc Username qua dropdown
  const executeSearch = useCallback(async (keyword, type = searchType) => {
    const trimmed = String(keyword || "").trim();
    if (!trimmed) {
      setIsSearching(false);
      setSearchKeyword("");
      fetchPaginatedUsers(1, selectedRole);
      return;
    }

    if (!currentUser?.token) return;

    setLoading(true);
    setIsSearching(true);
    setSearchKeyword(trimmed);
    setActiveSearchType(type);

    try {
      const paramKey = type === "id" ? "id" : "username";
      const res = await fetch(
        `${process.env.REACT_APP_SERVER_API_URL}/auth/users/search?${paramKey}=${encodeURIComponent(trimmed)}`,
        {
          headers: {
            Authorization: `Bearer ${currentUser.token}`,
          },
        }
      );
      const data = await res.json();

      if (res.ok && data.success && Array.isArray(data.data)) {
        setUsers(data.data);
        setTotalUsers(data.data.length);
        setTotalPages(1);
        setCurrentPage(1);
      } else {
        setUsers([]);
        setTotalUsers(0);
        setTotalPages(1);
      }
    } catch (err) {
      console.error("Lỗi tìm kiếm người dùng:", err);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, [currentUser?.token, fetchPaginatedUsers, selectedRole, searchType]);

  // Load danh sách người dùng ban đầu hoặc khi đổi role / page (có cache & deduplication)
  useEffect(() => {
    if (!isSearching) {
      fetchPaginatedUsers(currentPage, selectedRole);
    }
  }, [currentPage, selectedRole, isSearching, fetchPaginatedUsers]);

  // Handle ô tìm kiếm (hỗ trợ nhập realtime hoặc nhấn Enter)
  const handleSearchInputChange = (e) => {
    const val = e.target.value;
    setSearchInput(val);

    if (searchDebounceRef.current) {
      clearTimeout(searchDebounceRef.current);
    }

    searchDebounceRef.current = setTimeout(() => {
      executeSearch(val, searchType);
    }, 450);
  };

  const handleSearchTypeChange = (e) => {
    const newType = e.target.value;
    setSearchType(newType);
    if (searchInput.trim()) {
      executeSearch(searchInput, newType);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchDebounceRef.current) {
      clearTimeout(searchDebounceRef.current);
    }
    executeSearch(searchInput, searchType);
  };

  const handleClearSearch = () => {
    setSearchInput("");
    setSearchKeyword("");
    setIsSearching(false);
    if (searchDebounceRef.current) {
      clearTimeout(searchDebounceRef.current);
    }
    fetchPaginatedUsers(1, selectedRole);
  };

  // 3. Đổi Role User (user ↔ premium ↔ admin)
  const handleRoleChange = async (targetUser, newRole) => {
    if (targetUser.role === newRole) return;

    const currentRoleObj = ROLE_OPTIONS.find((r) => r.value === targetUser.role);
    const newRoleObj = ROLE_OPTIONS.find((r) => r.value === newRole);
    const currentRoleName = currentRoleObj ? currentRoleObj.label : targetUser.role;
    const newRoleName = newRoleObj ? newRoleObj.label : newRole;

    const result = await DarkSwal.fire({
      icon: "question",
      title: "Xác nhận đổi quyền",
      html: `Bạn có chắc muốn đổi vai trò của <b>@${targetUser.username}</b> (ID: #${targetUser.id}) từ <b style="color:#94a3b8">${currentRoleName}</b> sang <b style="color:#facc15">${newRoleName}</b>?`,
      showCancelButton: true,
      confirmButtonText: "Đồng ý đổi",
      cancelButtonText: "Hủy bỏ",
    });

    if (!result.isConfirmed) return;

    try {
      DarkSwal.fire({
        title: "Đang cập nhật quyền...",
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading(),
      });

      const res = await fetch(
        `${process.env.REACT_APP_SERVER_API_URL}/auth/users/${targetUser.id}/role`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${currentUser.token}`,
          },
          body: JSON.stringify({ role: newRole }),
        }
      );

      const data = await res.json();

      if (res.ok && data.success) {
        clearUsersPageCache();
        setUsers((prev) =>
          prev.map((u) => (u.id === targetUser.id ? { ...u, role: newRole } : u))
        );

        DarkSwal.fire({
          icon: "success",
          title: "Thành công!",
          text: `Đã cập nhật vai trò của @${targetUser.username} thành "${newRoleName}".`,
          timer: 1600,
          showConfirmButton: false,
        });
      } else {
        throw new Error(data.message || "Cập nhật vai trò thất bại");
      }
    } catch (err) {
      DarkSwal.fire({
        icon: "error",
        title: "Lỗi",
        text: err.message || "Không thể đổi vai trò người dùng.",
      });
    }
  };

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
        <div className="users-header__left">
          <h2>Quản lý người dùng</h2>
          <p>
            {isSearching
              ? `Kết quả tìm kiếm cho "${searchKeyword}": ${totalUsers} người dùng • Tổng hệ thống: ${(systemTotal || totalUsers).toLocaleString()} tài khoản`
              : `Tổng cộng ${(systemTotal || totalUsers).toLocaleString()} tài khoản trong hệ thống`}
          </p>
        </div>

        <div className="users-count">
          {(systemTotal || totalUsers).toLocaleString()} {(systemTotal || totalUsers) === 1 ? "user" : "users"}
        </div>
      </div>

      {/* CONTROLS: TÌM KIẾM + LỌC VAI TRÒ */}
      <div className="users-controls">
        <form className="users-search-form" onSubmit={handleSearchSubmit}>
          <select
            className="users-search-type-select"
            value={searchType}
            onChange={handleSearchTypeChange}
            title="Chọn tìm theo ID hoặc Username"
          >
            <option value="username">Username</option>
            <option value="id">ID</option>
          </select>

          <div className="users-search-input-wrap">
            <FaSearch className="search-icon" />
            <input
              type={searchType === "id" ? "number" : "text"}
              className="users-search-input"
              placeholder={
                searchType === "id"
                  ? "Nhập ID người dùng (ví dụ: 15)..."
                  : "Nhập Username cần tìm (ví dụ: hoang)..."
              }
              value={searchInput}
              onChange={handleSearchInputChange}
            />
            {searchInput && (
              <button
                type="button"
                className="search-clear-btn"
                onClick={handleClearSearch}
                title="Xóa tìm kiếm"
              >
                <FaTimes />
              </button>
            )}
          </div>
          <button type="submit" className="search-submit-btn">
            Tìm kiếm
          </button>
        </form>

        <div className="users-filter-wrap">
          <FaFilter className="filter-icon" />
          <select
            className="users-role-select-filter"
            value={selectedRole}
            onChange={(e) => {
              setSelectedRole(e.target.value);
              setCurrentPage(1);
              if (isSearching) {
                setIsSearching(false);
                setSearchInput("");
                setSearchKeyword("");
              }
            }}
            title="Lọc theo vai trò"
          >
            <option value="">Tất cả vai trò</option>
            <option value="user">User</option>
            <option value="premium">Premium</option>
            <option value="admin">Admin</option>
          </select>

          <button
            type="button"
            className="users-refresh-btn"
            onClick={() => {
              clearUsersPageCache();
              fetchTotalUsersCount();
              outletCtx?.refreshUserCount?.();
              if (isSearching) {
                executeSearch(searchKeyword, searchType);
              } else {
                fetchPaginatedUsers(currentPage, selectedRole, true);
              }
            }}
            title="Làm mới dữ liệu"
          >
            <FaSyncAlt />
          </button>
        </div>
      </div>

      {/* SEARCH BANNER / RESULT NOTICE */}
      {isSearching && (
        <div className="search-results-banner">
          <span>
            Đang hiển thị kết quả tìm theo <strong>{activeSearchType === "id" ? "ID" : "Username"}</strong>:{" "}
            <strong>{activeSearchType === "id" ? `#${searchKeyword}` : `@${searchKeyword}`}</strong> ({totalUsers} kết quả)
          </span>
          <button
            type="button"
            className="btn-exit-search"
            onClick={handleClearSearch}
          >
            <FaArrowLeft /> Xem tất cả người dùng
          </button>
        </div>
      )}

      {/* TABLE */}
      <div className="users-table-wrapper">
        <table className="users-table">
          <thead>
            <tr>
              <th className="col-id">ID</th>
              <th className="col-avatar">Ảnh</th>
              <th className="col-username">Tài khoản</th>
              <th className="col-display-name">Biệt danh</th>
              <th className="col-role">Vai trò</th>
              <th className="col-created-at">Ngày tạo</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan="6" className="empty-cell">
                  Đang tải dữ liệu người dùng...
                </td>
              </tr>
            ) : users.length === 0 ? (
              <tr>
                <td colSpan="6" className="empty-cell">
                  {isSearching
                    ? `Không tìm thấy người dùng nào phù hợp với "${searchKeyword}"`
                    : "Chưa có dữ liệu người dùng"}
                </td>
              </tr>
            ) : (
              users.map((item) => (
                <tr key={item.id}>
                  <td className="user-id col-id">#{item.id}</td>

                  <td className="col-avatar">
                    <img
                      src={
                        item.avatar ||
                        "https://ui-avatars.com/api/?name=User&background=111827&color=fff"
                      }
                      alt={item.username || "avatar"}
                      className="user-avatar"
                      onError={(e) => {
                        e.target.src =
                          "https://ui-avatars.com/api/?name=User&background=111827&color=fff";
                      }}
                    />
                  </td>

                  <td className="user-username col-username">
                    <span className="at-sign">@</span>
                    <strong>{item.username || "Chưa có"}</strong>
                  </td>

                  <td className="user-display-name col-display-name">
                    {item.display_name || item.username || "Chưa đặt"}
                  </td>

                  <td className="user-role-cell col-role">
                    <select
                      className={`role-change-select role-${item.role || "user"}`}
                      value={item.role || "user"}
                      onChange={(e) => handleRoleChange(item, e.target.value)}
                      title={item.role === "admin" ? "Quản trị viên" : "Bấm để đổi vai trò (User / Premium)"}
                      disabled={item.role === "admin"}
                    >
                      {item.role === "admin" && (
                        <option value="admin" disabled>Admin</option>
                      )}
                      <option value="user">User</option>
                      <option value="premium">Premium</option>
                    </select>
                  </td>

                  <td className="user-created-at col-created-at">
                    {item.created_at ? (
                      <span title={item.created_at}>
                        <FaCalendarAlt className="me-1 opacity-75" />
                        {new Date(item.created_at.replace(" ", "T")).toLocaleDateString("vi-VN", {
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric"
                        })}
                      </span>
                    ) : (
                      <span className="text-secondary">-</span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* PAGINATION */}
      {!loading && !isSearching && totalPages >= 1 && users.length > 0 && (
        <div className="pagination">
          <button
            disabled={currentPage <= 1}
            onClick={() => changePage(currentPage - 1)}
          >
            ← Trước
          </button>

          <div className="page-number">
            Trang {currentPage} / {totalPages}
          </div>

          <button
            disabled={currentPage >= totalPages}
            onClick={() => changePage(currentPage + 1)}
          >
            Tiếp →
          </button>
        </div>
      )}
    </div>
  );
}
