/**
 * Piped API Service - Multi-instance with Auto-Failover
 * Hỗ trợ tự động chuyển server nếu instance bị lỗi hoặc rate-limit
 */

const DEFAULT_INSTANCES = [
  process.env.REACT_APP_PIPED_API,
  process.env.PIPED_API,
  "https://api.piped.private.coffee",
  "https://pipedapi.ducks.party",
  "https://pipedapi.kavin.rocks",
].filter(Boolean);

// Loại bỏ trùng lặp
const UNIQUE_INSTANCES = [...new Set(DEFAULT_INSTANCES)];

const STORAGE_INSTANCE_KEY = "tecede_piped_instance";

export const getInstancesList = () => UNIQUE_INSTANCES;

export const getCurrentInstance = () => {
  if (typeof window !== "undefined") {
    const saved = localStorage.getItem(STORAGE_INSTANCE_KEY);
    if (saved) return saved;
  }
  return UNIQUE_INSTANCES[0] || "https://api.piped.private.coffee";
};

export const setCustomInstance = (url) => {
  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_INSTANCE_KEY, url);
  }
};

/**
 * Fetch với cơ chế tự động chuyển sang server fallback nếu instance hiện tại gặp sự cố
 */
export async function pipedFetch(endpoint, options = {}) {
  const current = getCurrentInstance();
  const instancesToTry = [
    current,
    ...UNIQUE_INSTANCES.filter((i) => i !== current),
  ];

  let lastError = null;

  for (const baseUrl of instancesToTry) {
    try {
      const cleanBase = baseUrl.replace(/\/+$/, "");
      const cleanEndpoint = endpoint.startsWith("/")
        ? endpoint
        : `/${endpoint}`;
      const url = `${cleanBase}${cleanEndpoint}`;

      const controller = new AbortController();
      const timeoutMs = options.timeout || 7500;
      const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

      const response = await fetch(url, {
        ...options,
        signal: options.signal || controller.signal,
        headers: {
          Accept: "application/json",
          ...(options.headers || {}),
        },
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`Instance ${baseUrl} returned HTTP ${response.status}`);
      }

      const data = await response.json();

      // Nếu Piped trả về object lỗi (như bot block hoặc IP block)
      if (data && (data.error || (data.message && !data.title && !data.items && !Array.isArray(data)))) {
        throw new Error(`Instance ${baseUrl} returned API error: ${data.message || data.error}`);
      }

      // Nếu thành công và khác current instance, lưu lại instance hoạt động
      if (baseUrl !== current && typeof window !== "undefined") {
        localStorage.setItem(STORAGE_INSTANCE_KEY, baseUrl);
      }

      return data;
    } catch (err) {
      lastError = err;
      console.warn(`[PipedAPI] Thử instance ${baseUrl} thất bại:`, err.message);
      // Tiếp tục thử instance tiếp theo
    }
  }

  throw (
    lastError || new Error("Tất cả các Piped instances đều không phản hồi.")
  );
}

/* ==========================================================================
   API ENDPOINTS
   ========================================================================== */

// 1. Trending
export const fetchTrending = async (region = "VN") => {
  try {
    const data = await pipedFetch(`/trending?region=${encodeURIComponent(region)}`);
    if (Array.isArray(data) && data.length > 0) return data;
  } catch (e) {
    console.warn("[PipedAPI] Piped trending failed, attempting Invidious fallback...", e.message);
  }

  // Invidious fallback cho trending
  const invidiousHosts = [
    "https://yt.chocolatemoo53.com/api/v1",
    "https://invidious.nerdvpn.de/api/v1",
    "https://inv.nadeko.net/api/v1"
  ];

  for (const host of invidiousHosts) {
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 4500);
      const res = await fetch(`${host}/trending?region=${encodeURIComponent(region)}`, {
        signal: controller.signal
      });
      clearTimeout(timer);
      if (!res.ok) continue;
      const list = await res.json();
      if (Array.isArray(list) && list.length > 0) {
        return list.map((item) => ({
          id: item.videoId,
          url: `/watch?v=${item.videoId}`,
          title: item.title,
          thumbnail: `https://i.ytimg.com/vi/${item.videoId}/hqdefault.jpg`,
          uploaderName: item.author,
          uploaderUrl: item.authorUrl,
          uploaderAvatar: item.authorThumbnails?.[item.authorThumbnails.length - 1]?.url || item.authorThumbnails?.[0]?.url,
          duration: item.lengthSeconds,
          views: item.viewCount !== undefined ? item.viewCount : item.viewCountText,
          uploadedDate: item.published ? new Date(item.published * 1000).toISOString() : (item.publishedText || "")
        }));
      }
    } catch (err) {}
  }

  return [];
};

// 2. Search
export const fetchSearch = async (query, filter = "all") => {
  const q = encodeURIComponent(query);
  try {
    const data = await pipedFetch(`/search?q=${q}&filter=${encodeURIComponent(filter)}`);
    if (data && (Array.isArray(data.items) || Array.isArray(data))) return data;
  } catch (e) {
    console.warn("[PipedAPI] Piped search failed, attempting Invidious fallback...", e.message);
  }

  // Invidious fallback cho search
  const invType = filter === "videos" ? "video" : filter === "channels" ? "channel" : filter === "playlists" ? "playlist" : "all";
  const invidiousHosts = [
    "https://yt.chocolatemoo53.com/api/v1",
    "https://invidious.nerdvpn.de/api/v1",
    "https://inv.nadeko.net/api/v1"
  ];

  for (const host of invidiousHosts) {
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 4500);
      const res = await fetch(`${host}/search?q=${q}&type=${invType}`, {
        signal: controller.signal
      });
      clearTimeout(timer);
      if (!res.ok) continue;
      const list = await res.json();
      if (Array.isArray(list)) {
        return {
          items: list.map((item) => ({
            id: item.videoId || item.authorId,
            url: item.videoId ? `/watch?v=${item.videoId}` : item.authorUrl,
            type: item.type,
            title: item.title || item.author,
            thumbnail: item.videoId ? `https://i.ytimg.com/vi/${item.videoId}/hqdefault.jpg` : (item.authorThumbnails?.[0]?.url || ""),
            uploaderName: item.author,
            uploaderUrl: item.authorUrl,
            uploaderAvatar: item.authorThumbnails?.[item.authorThumbnails.length - 1]?.url || item.authorThumbnails?.[0]?.url,
            duration: item.lengthSeconds,
            views: item.viewCount !== undefined ? item.viewCount : item.viewCountText,
            uploadedDate: item.published ? new Date(item.published * 1000).toISOString() : (item.publishedText || "")
          })),
          nextpage: null
        };
      }
    } catch (err) {}
  }

  return { items: [], nextpage: null };
};

// 3. Search Suggestions (Gợi ý tìm kiếm)
export const fetchSuggestions = async (query) => {
  if (!query || !query.trim()) return [];
  const q = encodeURIComponent(query);
  try {
    const data = await pipedFetch(`/suggestions?query=${q}`, { timeout: 3500 });
    return Array.isArray(data) ? data : [];
  } catch (e) {
    return [];
  }
};

// 4. Video Streams Details (Chi tiết video & luồng phát có Invidious fallback cho metadata)
export const fetchStreams = async (videoId) => {
  try {
    const pipedData = await pipedFetch(`/streams/${encodeURIComponent(videoId)}`);
    if (pipedData && (pipedData.title || pipedData.videoStreams)) {
      return pipedData;
    }
  } catch (pipedErr) {
    console.warn("[PipedAPI] pipedFetch stream failed, fetching Invidious metadata fallback...", pipedErr.message);
  }

  // Fallback Invidious lấy metadata (lượt xem, lượt thích, ngày đăng, mô tả, avatar)
  const invidiousHosts = [
    "https://yt.chocolatemoo53.com/api/v1",
    "https://invidious.nerdvpn.de/api/v1",
    "https://inv.nadeko.net/api/v1"
  ];

  for (const host of invidiousHosts) {
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 5000);
      const res = await fetch(`${host}/videos/${encodeURIComponent(videoId)}`, {
        signal: controller.signal
      });
      clearTimeout(timer);
      if (!res.ok) continue;

      const d = await res.json();
      if (d && (d.title || d.author)) {
        const authorThumb = d.authorThumbnails?.[d.authorThumbnails.length - 1]?.url || d.authorThumbnails?.[0]?.url || "";
        const uploadDate = d.published ? new Date(d.published * 1000).toISOString() : "";

        return {
          id: videoId,
          title: d.title,
          description: d.description || d.descriptionHtml?.replace(/<[^>]*>/g, "") || "",
          uploadDate: uploadDate || d.publishedText || "",
          uploader: d.author || "YouTube Creator",
          uploaderUrl: d.authorUrl || (d.authorId ? `/channel/${d.authorId}` : ""),
          uploaderId: d.authorId || d.author,
          uploaderAvatar: authorThumb,
          thumbnailUrl: `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
          duration: d.lengthSeconds || 0,
          views: d.viewCount || 0,
          likes: d.likeCount || 0,
          relatedStreams: Array.isArray(d.recommendedVideos) ? d.recommendedVideos.map((r) => ({
            id: r.videoId,
            url: `/watch?v=${r.videoId}`,
            title: r.title,
            thumbnail: `https://i.ytimg.com/vi/${r.videoId}/hqdefault.jpg`,
            uploaderName: r.author,
            uploaderUrl: r.authorUrl,
            uploaderAvatar: r.authorThumbnails?.[0]?.url || "",
            duration: r.lengthSeconds,
            views: r.viewCount !== undefined ? r.viewCount : (r.viewCountText || r.views),
            viewCountText: r.viewCountText,
            uploadedDate: r.published ? (typeof r.published === "number" ? new Date(r.published * 1000).toISOString() : r.published) : (r.publishedText || "")
          })) : []
        };
      }
    } catch (e) {}
  }

  throw new Error("Không thể tải thông tin video.");
};

// 5. Comments (Bình luận)
export const fetchComments = async (videoId) => {
  return pipedFetch(`/comments/${encodeURIComponent(videoId)}`);
};

// 6. Next Page Comments
export const fetchNextComments = async (videoId, nextpage) => {
  const enc = encodeURIComponent(nextpage);
  return pipedFetch(
    `/nextpage/comments/${encodeURIComponent(videoId)}?nextpage=${enc}`,
  );
};

// 7. Channel (Hỗ trợ Channel ID chuẩn UC..., Handle @..., hoặc tên kênh)
export const fetchChannel = async (channelIdOrHandle) => {
  if (!channelIdOrHandle) throw new Error("Mã kênh không hợp lệ.");

  const clean = decodeURIComponent(channelIdOrHandle).trim().replace(/^\/+/, "").replace(/^channel\//, "");

  // Nếu là UC... chuẩn 24 ký tự
  if (/^UC[a-zA-Z0-9_-]{22}$/.test(clean)) {
    try {
      const data = await pipedFetch(`/channel/${encodeURIComponent(clean)}`);
      if (data && (data.name || data.id)) return data;
    } catch (e) {
      console.warn("[PipedAPI] Direct /channel/ fetch failed, trying search fallback...", e.message);
    }
  }

  // Nếu là handle @... hoặc tên kênh hoặc direct fetch thất bại
  try {
    const searchRes = await fetchSearch(clean, "channels");
    if (searchRes && Array.isArray(searchRes.items) && searchRes.items.length > 0) {
      const match = searchRes.items[0];
      const realId = (match.url || "").replace("/channel/", "").replace("/c/", "").replace("/user/", "").trim();
      
      if (/^UC[a-zA-Z0-9_-]{22}$/.test(realId)) {
        try {
          const chData = await pipedFetch(`/channel/${encodeURIComponent(realId)}`);
          if (chData && (chData.name || chData.id)) return chData;
        } catch (e) {}
      }

      // Trả về dữ liệu chuẩn từ kết quả search channel
      return {
        id: realId || clean,
        name: match.name || clean,
        avatarUrl: match.thumbnail,
        subscriberCount: match.subscribers || 0,
        verified: match.verified || false,
        description: match.description || "",
        relatedStreams: []
      };
    }
  } catch (err) {}

  // Fallback gọi trực tiếp
  return pipedFetch(`/channel/${encodeURIComponent(clean)}`);
};

// 8. Channel Tab (Shorts, Playlists, Livestreams)
export const fetchChannelTab = async (tabData) => {
  if (!tabData) return { content: [] };
  const encoded = encodeURIComponent(tabData);
  return pipedFetch(`/channels/tabs?data=${encoded}`);
};

// 9. Playlist Details with Invidious Multi-Source Fallback
export const fetchPlaylist = async (playlistId) => {
  if (!playlistId) throw new Error("Mã danh sách phát không hợp lệ.");
  const cleanId = String(playlistId).trim();

  // Helper fetch từ Invidious dự phòng
  const fetchFromInvidious = async (pId) => {
    const invidiousHosts = [
      "https://yt.chocolatemoo53.com/api/v1",
      "https://invidious.nerdvpn.de/api/v1",
      "https://inv.nadeko.net/api/v1"
    ];

    for (const host of invidiousHosts) {
      try {
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), 6000);
        const res = await fetch(`${host}/playlists/${encodeURIComponent(pId)}`, {
          signal: controller.signal
        });
        clearTimeout(timer);
        if (!res.ok) continue;

        const data = await res.json();
        if (data && Array.isArray(data.videos) && data.videos.length > 0) {
          const relatedStreams = data.videos.map((v, idx) => ({
            id: v.videoId,
            url: `/watch?v=${v.videoId}`,
            title: v.title || `Video #${idx + 1}`,
            thumbnail: (v.videoThumbnails && v.videoThumbnails[0]?.url?.startsWith("http"))
              ? v.videoThumbnails[0].url
              : `https://i.ytimg.com/vi/${v.videoId}/hqdefault.jpg`,
            uploaderName: v.author || data.author || "",
            uploaderUrl: v.authorUrl || data.authorUrl || "",
            uploaderAvatar: (data.authorThumbnails && data.authorThumbnails[0]?.url) || "",
            duration: v.lengthSeconds || 0,
            views: v.viewCount,
            index: typeof v.index === "number" ? v.index : idx
          }));

          return {
            name: data.title || "Danh sách phát",
            uploader: data.author || "YouTube Creator",
            uploaderUrl: data.authorUrl || (data.authorId ? `/channel/${data.authorId}` : ""),
            uploaderAvatar: (data.authorThumbnails && data.authorThumbnails[0]?.url) || "",
            description: data.description || "",
            videos: data.videoCount || relatedStreams.length,
            relatedStreams
          };
        }
      } catch (err) {
        console.warn(`[PipedAPI] Invidious fallback ${host} error:`, err.message);
      }
    }
    return null;
  };

  try {
    const pipedData = await pipedFetch(`/playlists/${encodeURIComponent(cleanId)}`);
    // Nếu pipedData có danh sách video thì trả về luôn
    if (pipedData && Array.isArray(pipedData.relatedStreams) && pipedData.relatedStreams.length > 0) {
      return pipedData;
    }

    // Nếu Piped trả về nhưng relatedStreams rỗng (do YouTube thay đổi), lấy từ Invidious
    const invData = await fetchFromInvidious(cleanId);
    if (invData) {
      return {
        ...pipedData,
        ...invData,
        name: pipedData?.name || invData.name,
        uploader: pipedData?.uploader || invData.uploader,
        videos: invData.videos || pipedData?.videos || invData.relatedStreams.length,
        relatedStreams: invData.relatedStreams
      };
    }

    return pipedData || { name: "Danh sách phát YouTube", relatedStreams: [] };
  } catch (pipedErr) {
    console.warn("[PipedAPI] pipedFetch playlist failed, falling back to Invidious:", pipedErr.message);
    const invData = await fetchFromInvidious(cleanId);
    if (invData) return invData;
    throw pipedErr;
  }
};

// 10. SponsorBlock segments
export const fetchSponsors = async (videoId) => {
  try {
    const data = await pipedFetch(
      `/sponsors/${encodeURIComponent(videoId)}?category=%5B%22sponsor%22%5D`,
      { timeout: 4000 },
    );
    return data?.segments || [];
  } catch (e) {
    return [];
  }
};

/* ==========================================================================
   FORMAT HELPER UTILITIES
   ========================================================================== */

export const parseYouTubeInput = (input) => {
  if (!input || typeof input !== "string") return null;
  const str = input.trim();

  // 1. Trực tiếp mã video ID 11 ký tự (VD: OlJJ0Uh1XOk)
  if (/^[a-zA-Z0-9_-]{11}$/.test(str)) {
    return { type: "video", id: str };
  }

  // 2. Link youtu.be/<id>
  const youtuBeMatch = str.match(/youtu\.be\/([a-zA-Z0-9_-]{11})/i);
  if (youtuBeMatch) {
    return { type: "video", id: youtuBeMatch[1] };
  }

  // 3. Link youtube.com/watch?v=<id>
  const watchMatch = str.match(/[?&]v=([a-zA-Z0-9_-]{11})/i);
  if (watchMatch) {
    return { type: "video", id: watchMatch[1] };
  }

  // 4. Link youtube.com/shorts/<id>
  const shortsMatch = str.match(/shorts\/([a-zA-Z0-9_-]{11})/i);
  if (shortsMatch) {
    return { type: "video", id: shortsMatch[1] };
  }

  // 5. Link youtube.com/embed/<id>
  const embedMatch = str.match(/embed\/([a-zA-Z0-9_-]{11})/i);
  if (embedMatch) {
    return { type: "video", id: embedMatch[1] };
  }

  return null;
};

export const extractVideoId = (url) => {
  if (!url) return "";
  const parsed = parseYouTubeInput(url);
  if (parsed && parsed.id) return parsed.id;
  if (url.includes("v=")) {
    return url.split("v=")[1].split("&")[0];
  }
  if (url.startsWith("/watch?v=")) {
    return url.replace("/watch?v=", "");
  }
  return url;
};

/**
 * Chuẩn hóa URL hình ảnh:
 * Xử lý proxy Piped (proxy.piped... trả về 502/chặn) -> Trực tiếp trích xuất host gốc YouTube CDN (i.ytimg.com, yt3.ggpht.com)
 * Hoặc fallback sang https://i.ytimg.com/vi/<videoId>/hqdefault.jpg
 */
export const cleanImageUrl = (url, fallbackVideoId = null) => {
  if (!url || typeof url !== "string") {
    return fallbackVideoId ? `https://i.ytimg.com/vi/${fallbackVideoId}/hqdefault.jpg` : "";
  }
  const trimmed = url.trim();

  // 1. Nếu URL chứa ?host=... hoặc &host=... từ Piped proxy (ví dụ ?host=i.ytimg.com hay ?host=yt3.ggpht.com)
  if (trimmed.includes("host=")) {
    try {
      const parsed = new URL(trimmed.startsWith("http") ? trimmed : `https://dummy.com${trimmed}`);
      const host = parsed.searchParams.get("host");
      if (host) {
        return `https://${host}${parsed.pathname}`;
      }
    } catch (e) {}
  }

  // 2. Nếu là đường dẫn tương đối Invidious dạng /vi/ID/xxx.jpg
  if (trimmed.startsWith("/vi/")) {
    return `https://i.ytimg.com${trimmed}`;
  }

  // 3. Nếu là đường dẫn chứa /vi/VIDEO_ID/ từ proxy
  const matchVi = trimmed.match(/\/vi\/([a-zA-Z0-9_-]{11})\//);
  if (matchVi) {
    return `https://i.ytimg.com/vi/${matchVi[1]}/hqdefault.jpg`;
  }

  return trimmed;
};

export const formatViews = (views) => {
  if (views === null || views === undefined) return "";

  // Nếu là chuỗi đã có định dạng hoặc chứa text
  if (typeof views === "string") {
    const trimmed = views.trim();
    if (!trimmed) return "";

    // Xử lý các hậu tố viết tắt: B (Tỷ), M (Triệu), K (Nghìn) từ YouTube/Invidious
    const matchSuffix = trimmed.match(/^([\d.,]+)\s*([bBmMkK]|tr|tỷ|n)?/i);
    if (matchSuffix && matchSuffix[2]) {
      const val = parseFloat(matchSuffix[1].replace(/,/g, "."));
      const suffix = matchSuffix[2].toUpperCase();
      if (!isNaN(val)) {
        if (suffix === "B" || suffix === "TỶ") return `${val} Tỷ lượt xem`;
        if (suffix === "M" || suffix === "TR") return `${val} Tr lượt xem`;
        if (suffix === "K" || suffix === "N") return `${val} N lượt xem`;
      }
    }

    // Nếu chuỗi chứa số phân cách bằng dấu phẩy vd: "1,234,567 views"
    const cleanNum = Number(trimmed.replace(/[^\d.-]/g, ""));
    if (!isNaN(cleanNum) && cleanNum > 0) {
      views = cleanNum;
    } else if (trimmed.includes("lượt xem") || trimmed.includes("views")) {
      return trimmed.replace(/views?/gi, "lượt xem");
    }
  }

  const num = Number(views);
  if (isNaN(num) || num < 0) return "";
  if (num === 0) return "0 lượt xem";
  if (num >= 1_000_000_000) {
    return (num / 1_000_000_000).toFixed(1).replace(/\.0$/, "").replace(".", ",") + " Tỷ lượt xem";
  }
  if (num >= 1_000_000) {
    return (num / 1_000_000).toFixed(1).replace(/\.0$/, "").replace(".", ",") + " Tr lượt xem";
  }
  if (num >= 1_000) {
    return (num / 1_000).toFixed(1).replace(/\.0$/, "").replace(".", ",") + " N lượt xem";
  }
  return num.toLocaleString("vi-VN") + " lượt xem";
};

export const formatDuration = (seconds) => {
  const sec = Math.floor(Number(seconds) || 0);
  if (sec <= 0) return "0:00";
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = sec % 60;
  const pad = (n) => (n < 10 ? `0${n}` : `${n}`);
  if (h > 0) {
    return `${h}:${pad(m)}:${pad(s)}`;
  }
  return `${m}:${pad(s)}`;
};

export const formatTimeAgo = (dateInput) => {
  if (!dateInput) return "";

  // Nếu là số hoặc chuỗi số thuần (timestamp)
  if (typeof dateInput === "number" || (!isNaN(Number(dateInput)) && !String(dateInput).includes("-") && !String(dateInput).includes("/") && !String(dateInput).includes(" "))) {
    let num = Number(dateInput);
    if (num > 0) {
      // Unix timestamp tính bằng giây (thường < 10_000_000_000) -> đổi sang ms
      if (num < 10_000_000_000) {
        num = num * 1000;
      }
      dateInput = new Date(num);
    }
  }

  // Nếu là đối tượng Date hoặc chuỗi Date hợp lệ
  try {
    let parseTarget = dateInput;
    if (typeof dateInput === "string") {
      let str = dateInput.trim();
      // Nếu có đuôi Z từ API phim Việt Nam (như phimapi.com lưu giờ VN nhưng gắn Z)
      if (str.endsWith("Z")) {
        str = str.replace(/\.\d+Z$/, "").replace(/Z$/, "") + "+07:00";
      } else if (!str.includes("+") && !str.includes("-", 10)) {
        str = str.replace(" ", "T") + "+07:00";
      }
      parseTarget = str;
    }

    const date = parseTarget instanceof Date ? parseTarget : new Date(parseTarget);
    if (!isNaN(date.getTime())) {
      const now = new Date();
      const diffSec = Math.floor((now - date) / 1000);
      if (diffSec < 60) return "Vừa xong";
      const diffMin = Math.floor(diffSec / 60);
      if (diffMin < 60) return `${diffMin} phút trước`;
      const diffHour = Math.floor(diffMin / 60);
      if (diffHour < 24) return `${diffHour} giờ trước`;
      const diffDay = Math.floor(diffHour / 24);
      if (diffDay < 7) return `${diffDay} ngày trước`;
      const diffWeek = Math.floor(diffDay / 7);
      if (diffWeek < 4) return `${diffWeek} tuần trước`;
      const diffMonth = Math.floor(diffDay / 30);
      if (diffMonth < 12) return `${diffMonth} tháng trước`;
      const diffYear = Math.floor(diffDay / 365);
      return `${diffYear} năm trước`;
    }
  } catch (e) {}

  // Nếu là chuỗi text sẵn (vd: "2 days ago", "1 year ago", "3 tháng trước")
  if (typeof dateInput === "string") {
    let text = dateInput.trim();
    if (text.includes("trước") || text.includes("Vừa xong")) return text;

    // Dịch các cụm từ tiếng Anh sang tiếng Việt chuẩn
    const enMatch = text.match(/(\d+)\s*(second|sec|minute|min|hour|hr|day|week|month|year)s?\s*ago/i);
    if (enMatch) {
      const count = Number(enMatch[1]);
      const unit = enMatch[2].toLowerCase();
      if (unit.startsWith("sec")) return "Vừa xong";
      if (unit.startsWith("min")) return `${count} phút trước`;
      if (unit.startsWith("hour") || unit.startsWith("hr")) return `${count} giờ trước`;
      if (unit.startsWith("day")) return `${count} ngày trước`;
      if (unit.startsWith("week")) return `${count * 7} ngày trước`;
      if (unit.startsWith("month")) return `${count} tháng trước`;
      if (unit.startsWith("year")) return `${count} năm trước`;
    }

    if (/streamed|live/i.test(text)) {
      return text.replace(/streamed/i, "Đã phát trực tiếp").replace(/ago/i, "trước");
    }

    return text;
  }

  return "";
};

// 9. YouTube oEmbed (Dùng khi Piped instance bị chặn bot check để lấy title, author)
export const fetchOEmbed = async (videoId) => {
  try {
    const res = await fetch(`https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`);
    if (res.ok) {
      return await res.json();
    }
  } catch (e) {}
  return null;
};

/* ==========================================================================
   WATCH HISTORY & RECOMMENDATION UTILITIES
   ========================================================================== */

const STORAGE_HISTORY_KEY = "tecede_yt_history";

export const getWatchHistory = () => {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_HISTORY_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    return [];
  }
};

export const saveWatchHistory = (videoItem) => {
  if (typeof window === "undefined" || !videoItem) return;
  const id = videoItem.id || extractVideoId(videoItem.url);
  if (!id) return;

  try {
    let history = getWatchHistory();
    // Loại bỏ nếu đã có trong danh sách
    history = history.filter((item) => (item.id || item.videoId) !== id);
    // Thêm mới lên đầu
    history.unshift({
      id,
      title: videoItem.title || "Video",
      uploader: videoItem.uploader || videoItem.uploaderName || "YouTube Creator",
      uploaderAvatar: videoItem.uploaderAvatar,
      thumbnail: videoItem.thumbnail || videoItem.thumbnailUrl || `https://i.ytimg.com/vi/${id}/hqdefault.jpg`,
      duration: videoItem.duration,
      views: videoItem.views,
      watchedAt: Date.now()
    });
    // Giữ tối đa 30 video
    if (history.length > 30) history = history.slice(0, 30);
    localStorage.setItem(STORAGE_HISTORY_KEY, JSON.stringify(history));
  } catch (e) {}
};

export const clearWatchHistory = () => {
  if (typeof window !== "undefined") {
    localStorage.removeItem(STORAGE_HISTORY_KEY);
  }
};

/**
 * Trích xuất các từ khóa và kênh từ lịch sử xem để xây dựng đề xuất cá nhân hóa
 */
export const getRecommendationKeywords = () => {
  const history = getWatchHistory();
  if (!history || history.length === 0) return [];

  const keywords = [];
  const seen = new Set();

  // 1. Thêm các kênh người dùng đã xem gần đây
  history.slice(0, 5).forEach((h) => {
    if (h.uploader && !seen.has(h.uploader.toLowerCase())) {
      seen.add(h.uploader.toLowerCase());
      keywords.push(h.uploader);
    }
  });

  // 2. Trích xuất các cụm từ ý nghĩa từ tiêu đề
  history.slice(0, 4).forEach((h) => {
    if (h.title) {
      const cleanTitle = h.title
        .replace(/[[\]()|#\-_–—]/g, " ")
        .replace(/\s+/g, " ")
        .trim();
      const words = cleanTitle.split(" ").filter(w => w.length > 2);
      if (words.length >= 2) {
        const phrase = words.slice(0, 3).join(" ");
        if (!seen.has(phrase.toLowerCase())) {
          seen.add(phrase.toLowerCase());
          keywords.push(phrase);
        }
      }
    }
  });

  return keywords.slice(0, 6);
};
