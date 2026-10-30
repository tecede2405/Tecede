// Centralized Cache & Request Deduplication for Premium Users List
// Ngăn chặn spam gọi API /auth/users?role=premium làm chạm quota Cloudflare D1

export const PRESET_PREMIUM_USERS = [
  {
    id: 1,
    username: "tecede_vip",
    display_name: "Tecede VIP Supporter",
    role: "premium",
    avatar: "https://ui-avatars.com/api/?name=Tecede+VIP&background=eab308&color=fff",
    created_at: "2026-09-01 10:00:00",
  },
  {
    id: 15,
    username: "hoang123",
    display_name: "Minh Hoàng",
    role: "premium",
    avatar: "https://ui-avatars.com/api/?name=Minh+Hoang&background=f59e0b&color=fff",
    created_at: "2026-10-25 14:20:00",
  },
  {
    id: 20,
    username: "user_vip",
    display_name: "VIP Member",
    role: "premium",
    avatar: "https://ui-avatars.com/api/?name=VIP+Member&background=d97706&color=fff",
    created_at: "2026-10-28 09:15:00",
  },
];

const CACHE_TTL_MS = 10 * 60 * 1000; // 10 phút

// Cache theo page (key: p1_l6)
const pageCache = new Map();
const pendingPagePromises = new Map();

const getSessionCache = (page, limit) => {
  try {
    const key = `tecede_prem_users_p${page}_l${limit}`;
    const raw = sessionStorage.getItem(key);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed && parsed.timestamp && Date.now() - parsed.timestamp < CACHE_TTL_MS) {
      return parsed.data;
    }
  } catch (e) {}
  return null;
};

const setSessionCache = (page, limit, data) => {
  try {
    const key = `tecede_prem_users_p${page}_l${limit}`;
    sessionStorage.setItem(key, JSON.stringify({ data, timestamp: Date.now() }));
  } catch (e) {}
};

/**
 * Xóa toàn bộ cache ở Frontend (cả RAM và sessionStorage)
 */
export const clearPremiumUsersCache = () => {
  pageCache.clear();
  try {
    const keysToRemove = [];
    for (let i = 0; i < sessionStorage.length; i++) {
      const k = sessionStorage.key(i);
      if (k && k.startsWith("tecede_prem_users_")) {
        keysToRemove.push(k);
      }
    }
    keysToRemove.forEach((k) => sessionStorage.removeItem(k));
  } catch (e) {}
};

/**
 * Lấy danh sách Premium Users theo từng trang nhỏ (limit=6) có Cache 10p và In-flight Deduplication.
 * Hỗ trợ forceRefresh=true để Admin cưỡng chế làm mới từ Database (bỏ qua cả frontend cache lẫn Cloudflare Edge cache).
 */
export const fetchCachedPremiumUsersPage = async (page = 1, limit = 6, forceRefresh = false) => {
  const cacheKey = `p${page}_l${limit}`;
  const now = Date.now();

  if (!forceRefresh) {
    // 1. Kiểm tra RAM cache
    const inMemory = pageCache.get(cacheKey);
    if (inMemory && now - inMemory.timestamp < CACHE_TTL_MS) {
      return inMemory.data;
    }

    // 2. Kiểm tra sessionStorage
    const inSession = getSessionCache(page, limit);
    if (inSession) {
      pageCache.set(cacheKey, { data: inSession, timestamp: now });
      return inSession;
    }

    // 3. In-flight Deduplication
    if (pendingPagePromises.has(cacheKey)) {
      return pendingPagePromises.get(cacheKey);
    }
  }

  const promise = (async () => {
    try {
      const refreshParam = forceRefresh ? "&refresh=true" : "";
      const res = await fetch(
        `${process.env.REACT_APP_SERVER_API_URL}/auth/users?role=premium&page=${page}&limit=${limit}${refreshParam}`
      );
      const data = await res.json();

      let users = [];
      let pagination = {
        page,
        limit,
        total: PRESET_PREMIUM_USERS.length,
        totalPages: Math.max(1, Math.ceil(PRESET_PREMIUM_USERS.length / limit)),
      };

      if (res.ok && data.success && Array.isArray(data.data)) {
        users = data.data.length > 0 ? data.data : PRESET_PREMIUM_USERS;
        if (data.pagination) {
          pagination = data.pagination;
        } else {
          pagination.total = users.length;
          pagination.totalPages = Math.max(1, Math.ceil(users.length / limit));
        }
      } else if (Array.isArray(data) && data.length > 0) {
        const filtered = data.filter((u) => u.role === "premium");
        users = filtered.length > 0 ? filtered : PRESET_PREMIUM_USERS;
        pagination.total = users.length;
        pagination.totalPages = Math.max(1, Math.ceil(users.length / limit));
      } else {
        users = PRESET_PREMIUM_USERS;
      }

      const result = {
        users,
        pagination,
        userIds: new Set(users.map((u) => u.id)),
      };

      pageCache.set(cacheKey, { data: result, timestamp: Date.now() });
      setSessionCache(page, limit, result);
      return result;
    } catch (err) {
      console.warn("Lỗi tải danh sách premium page:", err);
      // Fallback an toàn với preset
      const result = {
        users: PRESET_PREMIUM_USERS,
        pagination: {
          page: 1,
          limit,
          total: PRESET_PREMIUM_USERS.length,
          totalPages: 1,
        },
        userIds: new Set(PRESET_PREMIUM_USERS.map((u) => u.id)),
      };
      return result;
    } finally {
      pendingPagePromises.delete(cacheKey);
    }
  })();

  if (!forceRefresh) {
    pendingPagePromises.set(cacheKey, promise);
  }
  return promise;
};

// Giữ lại alias để tương thích ngược nếu còn component gọi
export const fetchCachedPremiumUsers = () => fetchCachedPremiumUsersPage(1, 6);
