const API_BASE_URL = process.env.REACT_APP_API_URL || "https://my-worker-backend.pqtmv2.workers.dev";

/**
 * 1. Lưu / Cập nhật tiến trình xem video (Upsert) vào D1 database
 * POST /youtube/history
 */
export const saveYoutubeHistory = async (token, videoData) => {
  if (!token || !videoData) return null;
  const videoId = videoData.videoId || videoData.video_id || videoData.id;
  if (!videoId) return null;

  try {
    const res = await fetch(`${API_BASE_URL}/youtube/history`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        video_id: videoId,
        title: videoData.title || "Video",
        thumbnail: videoData.thumbnail || videoData.thumbnailUrl || `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
        channel_title: videoData.channelTitle || videoData.channel_title || videoData.uploader || "YouTube Creator",
        duration: Number(videoData.duration) || 0,
        current_time: Number(videoData.currentTime ?? videoData.current_time) || 0
      })
    });
    return await res.json();
  } catch (err) {
    console.warn("[saveYoutubeHistory] Error:", err);
    return null;
  }
};

/**
 * 2. Lấy danh sách video đã xem (Có phân trang) từ D1 database
 * GET /youtube/history?page=1&limit=12
 */
export const getYoutubeHistoryList = async (token, page = 1, limit = 12) => {
  if (!token) return { success: false, data: [], hasMore: false };
  try {
    const res = await fetch(`${API_BASE_URL}/youtube/history?page=${page}&limit=${limit}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return await res.json();
  } catch (err) {
    console.warn("[getYoutubeHistoryList] Error:", err);
    return { success: false, data: [], hasMore: false };
  }
};

/**
 * 3. Lấy thời gian xem của 1 video cụ thể (để tiếp tục phát)
 * GET /youtube/history/:video_id
 */
export const getYoutubeVideoProgress = async (token, videoId) => {
  if (!token || !videoId) return null;
  try {
    const res = await fetch(`${API_BASE_URL}/youtube/history/${encodeURIComponent(videoId)}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return await res.json();
  } catch (err) {
    console.warn("[getYoutubeVideoProgress] Error:", err);
    return null;
  }
};

/**
 * 4. Xóa 1 video khỏi lịch sử xem
 * DELETE /youtube/history/:video_id
 */
export const deleteYoutubeHistoryItem = async (token, videoId) => {
  if (!token || !videoId) return { success: false };
  try {
    const res = await fetch(`${API_BASE_URL}/youtube/history/${encodeURIComponent(videoId)}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return await res.json();
  } catch (err) {
    console.warn("[deleteYoutubeHistoryItem] Error:", err);
    return { success: false };
  }
};

/**
 * 5. Xóa toàn bộ lịch sử xem của tài khoản
 * DELETE /youtube/history
 */
export const clearAllYoutubeHistory = async (token) => {
  if (!token) return { success: false };
  try {
    const res = await fetch(`${API_BASE_URL}/youtube/history`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return await res.json();
  } catch (err) {
    console.warn("[clearAllYoutubeHistory] Error:", err);
    return { success: false };
  }
};

/**
 * 6. Lấy danh sách chip đã ẩn từ D1 database
 * GET /youtube/chips/hidden
 */
export const getYoutubeHiddenChips = async (token) => {
  if (!token) return { success: false, data: [] };
  try {
    const res = await fetch(`${API_BASE_URL}/youtube/chips/hidden`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    const json = await res.json();
    if (json?.success && Array.isArray(json.data)) {
      // Tự động làm sạch các chip rỗng hoặc khoảng trắng nếu DB trước đó lưu
      json.data = json.data
        .filter((k) => typeof k === "string" && k.trim().length > 0)
        .map((k) => k.trim());
    }
    return json;
  } catch (err) {
    console.warn("[getYoutubeHiddenChips] Error:", err);
    return { success: false, data: [] };
  }
};

/**
 * 7. Ẩn một chip (Khi bấm nút ❌ trên chip)
 * POST /youtube/chips/hide
 */
export const hideYoutubeChip = async (token, keyword) => {
  const cleanKeyword = typeof keyword === "string" ? keyword.trim() : "";
  if (!token || !cleanKeyword) return { success: false };
  try {
    const res = await fetch(`${API_BASE_URL}/youtube/chips/hide`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ keyword: cleanKeyword })
    });
    return await res.json();
  } catch (err) {
    console.warn("[hideYoutubeChip] Error:", err);
    return { success: false };
  }
};

/**
 * 8. Bỏ ẩn / Khôi phục 1 chip
 * DELETE /youtube/chips/hide/:keyword
 */
export const unhideYoutubeChip = async (token, keyword) => {
  const cleanKeyword = typeof keyword === "string" ? keyword.trim() : "";
  if (!token || !cleanKeyword) return { success: false };
  try {
    const res = await fetch(`${API_BASE_URL}/youtube/chips/hide/${encodeURIComponent(cleanKeyword)}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return await res.json();
  } catch (err) {
    console.warn("[unhideYoutubeChip] Error:", err);
    return { success: false };
  }
};

/**
 * 9. Reset tất cả chip đã ẩn về mặc định
 * DELETE /youtube/chips/hide
 */
export const resetYoutubeHiddenChips = async (token) => {
  if (!token) return { success: false };
  try {
    const res = await fetch(`${API_BASE_URL}/youtube/chips/hide`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return await res.json();
  } catch (err) {
    console.warn("[resetYoutubeHiddenChips] Error:", err);
    return { success: false };
  }
};

/**
 * 10. Lấy danh sách tối đa 5 chip gợi ý đang hoạt động (FIFO)
 * GET /youtube/chips/active
 */
export const getYoutubeActiveChips = async (token) => {
  if (!token) return { success: false, data: [] };
  try {
    const res = await fetch(`${API_BASE_URL}/youtube/chips/active`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    const json = await res.json();
    if (json?.success && Array.isArray(json.data)) {
      json.data = json.data
        .filter((k) => typeof k === "string" && k.trim().length > 0)
        .map((k) => k.trim());
    }
    return json;
  } catch (err) {
    console.warn("[getYoutubeActiveChips] Error:", err);
    return { success: false, data: [] };
  }
};

/**
 * 11. Thêm/Cập nhật thể loại mới khi user xem video (Tối đa 5, FIFO)
 * POST /youtube/chips/active
 */
export const recordYoutubeActiveChip = async (token, keyword) => {
  const cleanKeyword = typeof keyword === "string" ? keyword.trim() : "";
  if (!token || !cleanKeyword) return { success: false };
  try {
    const res = await fetch(`${API_BASE_URL}/youtube/chips/active`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ keyword: cleanKeyword })
    });
    return await res.json();
  } catch (err) {
    console.warn("[recordYoutubeActiveChip] Error:", err);
    return { success: false };
  }
};


