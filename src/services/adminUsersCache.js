// Bộ nhớ đệm (Cache) và chống trùng lặp request (Deduplication) cho Admin & Quản lý User
// Bảo vệ hạn mức D1 5.000.000 row reads / ngày

const COUNT_TTL = 5 * 60 * 1000; // 5 phút cho tổng số user
const USERS_PAGE_TTL = 2 * 60 * 1000; // 2 phút cho danh sách phân trang

let cachedUserCount = null;
let lastCountFetchTime = 0;
let pendingCountPromise = null;

const usersPageCache = new Map();
const pendingPagePromises = new Map();

/**
 * Lấy tổng số user có Cache và In-flight deduplication
 */
export const fetchCachedUserCount = async (force = false) => {
  const now = Date.now();
  if (!force && cachedUserCount !== null && now - lastCountFetchTime < COUNT_TTL) {
    return cachedUserCount;
  }

  if (pendingCountPromise) {
    return pendingCountPromise;
  }

  pendingCountPromise = (async () => {
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
      cachedUserCount = total;
      lastCountFetchTime = Date.now();
      return total;
    } catch (err) {
      console.warn("Lỗi lấy tổng user, dùng cache cũ hoặc fallback:", err);
      if (cachedUserCount !== null) return cachedUserCount;
      return 0;
    } finally {
      pendingCountPromise = null;
    }
  })();

  return pendingCountPromise;
};

/**
 * Cập nhật thủ công tổng user vào cache (ví dụ khi API phân trang đã trả về pagination.total)
 */
export const setCachedUserCount = (count) => {
  if (typeof count === "number") {
    cachedUserCount = count;
    lastCountFetchTime = Date.now();
  }
};

/**
 * Lấy danh sách phân trang người dùng có Cache & Deduplication
 */
export const fetchCachedPaginatedUsers = async ({ page = 1, limit = 10, role = "", token = "", force = false }) => {
  const cacheKey = `${page}_${role || "all"}`;
  const now = Date.now();

  if (!force) {
    const cached = usersPageCache.get(cacheKey);
    if (cached && now - cached.timestamp < USERS_PAGE_TTL) {
      return cached.data;
    }
  }

  if (pendingPagePromises.has(cacheKey)) {
    return pendingPagePromises.get(cacheKey);
  }

  const promise = (async () => {
    try {
      let url = `${process.env.REACT_APP_SERVER_API_URL}/auth/users?page=${page}&limit=${limit}`;
      if (role) {
        url += `&role=${encodeURIComponent(role)}`;
      }
      if (force) {
        url += `&refresh=true`;
      }

      const headers = {};
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      const res = await fetch(url, { headers });
      const data = await res.json();

      usersPageCache.set(cacheKey, {
        data,
        timestamp: Date.now(),
      });

      // Nếu không lọc theo role và có pagination.total thì tự động cập nhật cache tổng user
      if (!role && data?.pagination?.total !== undefined) {
        setCachedUserCount(data.pagination.total);
      }

      return data;
    } catch (err) {
      console.warn("Lỗi tải danh sách người dùng phân trang:", err);
      throw err;
    } finally {
      pendingPagePromises.delete(cacheKey);
    }
  })();

  pendingPagePromises.set(cacheKey, promise);
  return promise;
};

/**
 * Xóa cache người dùng khi có hành động update (đổi quyền, refresh...)
 */
export const clearUsersPageCache = () => {
  usersPageCache.clear();
};
