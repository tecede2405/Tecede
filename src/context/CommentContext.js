import { createContext, useContext, useState, useCallback } from "react";

const CommentContext = createContext();

const CACHE_KEY = "tecede_latest_comments_cache";
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 phút

let memoryCommentsCache = null;
let memoryFetchTime = 0;
let pendingCommentsPromise = null;

const readSessionComments = () => {
  try {
    const raw = sessionStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed && parsed.timestamp && Date.now() - parsed.timestamp < CACHE_TTL_MS) {
      if (Array.isArray(parsed.data)) {
        return parsed.data;
      }
    }
  } catch (e) {}
  return null;
};

const saveSessionComments = (data) => {
  try {
    sessionStorage.setItem(
      CACHE_KEY,
      JSON.stringify({ data, timestamp: Date.now() })
    );
  } catch (e) {}
};

export const CommentProvider = ({ children }) => {
  const [comments, setComments] = useState(() => {
    return memoryCommentsCache || readSessionComments() || [];
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Lazy fetch có cache 5 phút & deduplication, KHÔNG tự động chạy trên mọi trang
  const fetchLatestComments = useCallback(async (limit = 10, force = false) => {
    const now = Date.now();

    // 1. Kiểm tra memory cache
    if (!force && memoryCommentsCache && now - memoryFetchTime < CACHE_TTL_MS) {
      setComments(memoryCommentsCache);
      return memoryCommentsCache;
    }

    // 2. Kiểm tra sessionStorage cache
    if (!force) {
      const sessionData = readSessionComments();
      if (sessionData) {
        memoryCommentsCache = sessionData;
        memoryFetchTime = now;
        setComments(sessionData);
        return sessionData;
      }
    }

    // 3. In-flight request deduplication
    if (pendingCommentsPromise) {
      return pendingCommentsPromise;
    }

    pendingCommentsPromise = (async () => {
      try {
        setLoading(true);
        setError(null);
        const baseUrl = process.env.REACT_APP_SERVER_API_URL || "https://movie1-api-worker.nguyengiaminh532.workers.dev";
        const res = await fetch(`${baseUrl}/comments/latest?limit=${limit}`);
        const json = await res.json();

        let list = [];
        if (json && json.success && Array.isArray(json.data)) {
          list = json.data;
        }

        memoryCommentsCache = list;
        memoryFetchTime = Date.now();
        saveSessionComments(list);
        setComments(list);
        return list;
      } catch (err) {
        console.warn("Lỗi tải bình luận mới:", err);
        setError(err.message || "Failed to load comments");
        if (!memoryCommentsCache) {
          setComments([]);
        }
        return memoryCommentsCache || [];
      } finally {
        setLoading(false);
        pendingCommentsPromise = null;
      }
    })();

    return pendingCommentsPromise;
  }, []);

  return (
    <CommentContext.Provider
      value={{
        comments,
        latestComments: comments,
        loading,
        error,
        refreshComments: () => fetchLatestComments(10, true),
        fetchLatestComments,
      }}
    >
      {children}
    </CommentContext.Provider>
  );
};

export const useComments = () => useContext(CommentContext);
export const useComment = () => useContext(CommentContext);
export default CommentContext;
