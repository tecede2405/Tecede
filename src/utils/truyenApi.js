/**
 * KhoTruyện API Service & Hentai Content Blocker
 * Cung cấp dịch vụ lấy dữ liệu truyện tranh & truyện chữ sạch,
 * bảo vệ tuyệt đối không để lộ bất kỳ nội dung hentai / 18+ / adult nào.
 */

export const TRUYEN_API_BASE = process.env.REACT_APP_TRUYEN_API || "https://api.khotruyen.site";

// Danh sách từ khóa cấm liên quan đến hentai / 18+ / nội dung nhạy cảm
const BANNED_KEYWORDS = [
  "hentai",
  "18+",
  "adult",
  "ecchi",
  "smut",
  "loan luan",
  "loạn luân",
  "dâm",
  "khiêu dâm",
  "khieu dam",
  "tình dục",
  "tinh duc",
  "sex",
  "sayhentai",
  "mehentai",
  "doujinshi"
];

/**
 * Chuẩn hóa URL ảnh bìa hoặc ảnh chương truyện từ API
 */
export function getCoverUrl(coverPath) {
  if (!coverPath) {
    return "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=500&auto=format&fit=crop&q=60";
  }

  let pathStr = coverPath;
  // Hỗ trợ trường hợp truyền vào là object (ví dụ: { url: "...", src: "...", image: "..." })
  if (typeof pathStr === "object") {
    pathStr = pathStr.url || pathStr.src || pathStr.image || pathStr.path || pathStr.link || "";
  }

  if (typeof pathStr !== "string" || !pathStr.trim()) {
    return "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=500&auto=format&fit=crop&q=60";
  }

  const cleanPath = pathStr.trim();
  if (cleanPath.startsWith("http://") || cleanPath.startsWith("https://")) {
    return cleanPath;
  }
  if (cleanPath.startsWith("/")) {
    return `${TRUYEN_API_BASE}${cleanPath}`;
  }
  return `${TRUYEN_API_BASE}/${cleanPath}`;
}

/**
 * Kiểm tra tuyệt đối xem truyện có an toàn (SAFE) không.
 * Nếu là hentai, 18+, adult, ecchi -> Trả về FALSE để loại bỏ ngay lập tức.
 */
export function isSafeStory(story) {
  if (!story) return false;

  // 1. Kiểm tra cờ adult từ hệ thống kho
  if (story.isAdult === true) return false;
  if (story.type === "hentai") return false;
  if (story.contentType === "hentai") return false;
  if (story.sync?.contentType === "hentai") return false;
  if (story.sync?.contentRating === "adult") return false;

  // 2. Kiểm tra chuỗi slug, title, description
  const textToCheck = `${story.slug || ""} ${story.title || ""} ${story.description || ""}`.toLowerCase();
  for (const kw of BANNED_KEYWORDS) {
    if (textToCheck.includes(kw)) {
      return false;
    }
  }

  // 3. Kiểm tra mảng thể loại (genres)
  if (Array.isArray(story.genres)) {
    for (const g of story.genres) {
      const gStr = (typeof g === "string" ? g : g?.name || g?.slug || "").toLowerCase();
      for (const kw of BANNED_KEYWORDS) {
        if (gStr.includes(kw)) return false;
      }
    }
  }

  // 4. Kiểm tra taxonomies nếu có
  if (Array.isArray(story.taxonomies)) {
    for (const t of story.taxonomies) {
      const tStr = `${t?.name || ""} ${t?.slug || ""}`.toLowerCase();
      for (const kw of BANNED_KEYWORDS) {
        if (tStr.includes(kw)) return false;
      }
    }
  }

  return true;
}

/**
 * Lấy danh sách truyện có hỗ trợ lọc, phân trang, và đảm bảo rating=safe
 */
export async function fetchStories({
  type = "",          // "manga" | "novel" | "" (tất cả)
  sort = "updated_desc", // "updated_desc" | "views_desc" | "rating_desc" | "chapter_desc"
  filter = "",        // "ongoing" | "completed" | "manga" | "novel"
  genres = "",        // thể loại (csv slug)
  q = "",             // tìm kiếm
  page = 1,
  perPage = 24
} = {}) {
  try {
    const params = new URLSearchParams();
    params.set("rating", "safe");
    params.set("paginated", "1");
    params.set("page", String(page));
    params.set("perPage", String(perPage));
    if (sort) params.set("sort", sort);
    if (type) params.set("type", type);
    if (filter) params.set("filter", filter);
    if (genres) params.set("genres", genres);
    if (q) params.set("q", q);

    const res = await fetch(`${TRUYEN_API_BASE}/api/stories?${params.toString()}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();

    const rawList = Array.isArray(json.data) ? json.data : (Array.isArray(json) ? json : []);
    const safeList = rawList.filter(isSafeStory);

    return {
      data: safeList,
      meta: json.meta || { page, perPage, total: safeList.length, totalPages: 1 }
    };
  } catch (err) {
    console.error("Lỗi tải danh sách truyện:", err);
    return { data: [], meta: { page: 1, perPage, total: 0, totalPages: 1 } };
  }
}

/**
 * Lấy chi tiết một bộ truyện
 */
export async function fetchStoryDetail(slug) {
  if (!slug) return null;
  try {
    const res = await fetch(`${TRUYEN_API_BASE}/api/stories/${encodeURIComponent(slug)}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const story = await res.json();

    // Kiểm tra an toàn: Nếu là hentai/18+ -> chặn ngay lập tức
    if (!isSafeStory(story)) {
      console.warn("Truyện bị chặn do không đạt tiêu chuẩn an toàn:", slug);
      return null;
    }

    return story;
  } catch (err) {
    console.error("Lỗi tải chi tiết truyện:", err);
    return null;
  }
}

/**
 * Lấy nội dung một chương truyện (ảnh hoặc chữ)
 */
export async function fetchChapter(storySlug, chapterSlug) {
  if (!storySlug || !chapterSlug) return null;
  try {
    const res = await fetch(
      `${TRUYEN_API_BASE}/api/stories/${encodeURIComponent(storySlug)}/chapters/${encodeURIComponent(chapterSlug)}`
    );
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();

    // Kiểm tra an toàn
    if (!isSafeStory(data)) {
      console.warn("Chương truyện bị chặn do không đạt tiêu chuẩn an toàn");
      return null;
    }

    // Tìm đúng chương đã yêu cầu trong mảng data.chapters
    let currentChapter = null;
    if (Array.isArray(data.chapters)) {
      currentChapter = data.chapters.find(
        (c) =>
          c.slug === chapterSlug ||
          String(c.id) === String(chapterSlug) ||
          String(c.num) === String(chapterSlug) ||
          c.slug.endsWith(`-${chapterSlug}`) ||
          c.slug.endsWith(chapterSlug)
      );
      // Nếu không khớp theo slug, tìm chương có dữ liệu ảnh/chữ được populate
      if (!currentChapter) {
        currentChapter = data.chapters.find(
          (c) => (Array.isArray(c.pages) && c.pages.length > 0) || Boolean(c.bodyHtml || c.bodyText)
        );
      }
      // Dự phòng cuối cùng
      if (!currentChapter) {
        currentChapter = data.chapters[0] || null;
      }
    }

    return {
      story: data,
      chapter: currentChapter
    };
  } catch (err) {
    console.error("Lỗi tải nội dung chương:", err);
    return null;
  }
}

/**
 * Lấy danh sách thể loại public sạch
 */
export async function fetchGenres() {
  try {
    const res = await fetch(`${TRUYEN_API_BASE}/api/genres`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    const list = Array.isArray(json.data) ? json.data : (Array.isArray(json) ? json : []);

    // Loại bỏ các thể loại 18+/hentai nếu có trong metadata
    return list.filter((g) => {
      const name = (g?.name || g?.slug || "").toLowerCase();
      for (const kw of BANNED_KEYWORDS) {
        if (name.includes(kw)) return false;
      }
      return true;
    });
  } catch (err) {
    console.error("Lỗi lấy danh sách thể loại:", err);
    return [];
  }
}

/**
 * Tìm kiếm truyện an toàn
 */
export async function searchStories(keyword, page = 1, perPage = 24) {
  if (!keyword || !keyword.trim()) {
    return { data: [], meta: { page: 1, perPage, total: 0, totalPages: 1 } };
  }

  const cleanKeyword = keyword.trim().toLowerCase();
  // Kiểm tra từ khóa cấm
  for (const kw of BANNED_KEYWORDS) {
    if (cleanKeyword.includes(kw)) {
      return { data: [], meta: { page: 1, perPage, total: 0, totalPages: 1 }, blocked: true };
    }
  }

  try {
    const params = new URLSearchParams();
    params.set("q", cleanKeyword);
    params.set("rating", "safe");
    params.set("paginated", "1");
    params.set("page", String(page));
    params.set("perPage", String(perPage));

    const res = await fetch(`${TRUYEN_API_BASE}/api/search?${params.toString()}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();

    const rawList = Array.isArray(json.data) ? json.data : (Array.isArray(json) ? json : []);
    const safeList = rawList.filter(isSafeStory);

    return {
      data: safeList,
      meta: json.meta || { page, perPage, total: safeList.length, totalPages: 1 }
    };
  } catch (err) {
    console.error("Lỗi tìm kiếm truyện:", err);
    return { data: [], meta: { page: 1, perPage, total: 0, totalPages: 1 } };
  }
}
