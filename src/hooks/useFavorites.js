import { useState, useCallback } from "react";

const API = process.env.REACT_APP_SERVER_API_URL;

function getToken() {
  try {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    return user?.token || null;
  } catch {
    return null;
  }
}

function buildHeaders() {
  const token = getToken();
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

/* ──────────────────────────────────────────
   Single-call helpers (dùng trực tiếp)
────────────────────────────────────────── */

/** Kiểm tra 1 phim có trong yêu thích hay chưa */
export async function checkFavorite(movie_path) {
  const token = getToken();
  if (!token) return false;
  try {
    const res = await fetch(`${API}/favorites/${encodeURIComponent(movie_path)}`, {
      headers: buildHeaders(),
    });
    if (!res.ok) return false;
    const data = await res.json();
    return data?.isFavorited === true;
  } catch {
    return false;
  }
}

/** Thêm phim vào yêu thích */
export async function addFavorite({ movie_path, movie_name, image }) {
  const res = await fetch(`${API}/favorites`, {
    method: "POST",
    headers: buildHeaders(),
    body: JSON.stringify({ movie_path, movie_name, image }),
  });
  return res.json();
}

/** Xóa phim khỏi yêu thích */
export async function removeFavorite(movie_path) {
  const res = await fetch(`${API}/favorites/${encodeURIComponent(movie_path)}`, {
    method: "DELETE",
    headers: buildHeaders(),
  });
  return res.json();
}

/** Lấy danh sách yêu thích */
export async function fetchFavorites() {
  const token = getToken();
  if (!token) return [];
  const res = await fetch(`${API}/favorites`, { headers: buildHeaders() });
  if (!res.ok) return [];
  const data = await res.json();
  return data?.data || [];
}

/* ──────────────────────────────────────────
   Hook tích hợp cho trang chi tiết phim
────────────────────────────────────────── */

export function useFavoriteToggle(movie_path, movie_name, image) {
  const [isFavorited, setIsFavorited] = useState(null); // null = chưa biết
  const [loading, setLoading] = useState(false);

  /** Gọi 1 lần khi component mount */
  const init = useCallback(async () => {
    if (!movie_path || !getToken()) {
      setIsFavorited(false);
      return;
    }
    const result = await checkFavorite(movie_path);
    setIsFavorited(result);
  }, [movie_path]);

  const toggle = useCallback(async () => {
    if (!getToken()) return; // chưa login → bỏ qua
    setLoading(true);
    try {
      if (isFavorited) {
        await removeFavorite(movie_path);
        setIsFavorited(false);
      } else {
        await addFavorite({ movie_path, movie_name, image });
        setIsFavorited(true);
      }
    } catch {
      /* ignore */
    } finally {
      setLoading(false);
    }
  }, [isFavorited, movie_path, movie_name, image]);

  return { isFavorited, loading, init, toggle };
}
