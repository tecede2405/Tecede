/**
 * Rút gọn chuỗi ngôn ngữ/phụ đề phim thành dạng viết tắt gọn gàng.
 * Ví dụ:
 * - "vietsub" -> "VS"
 * - "Vietsub+Thuyết minh" -> "VS+TM"
 * - "VietSub + lồng tiếng" -> "VS+LT"
 * - "Thuyết minh" -> "TM"
 * - "Lồng tiếng" -> "LT"
 */
export function formatLangBadge(lang) {
  if (!lang || typeof lang !== "string") return "VS";

  const trimmed = lang.trim();
  if (!trimmed) return "VS";

  const parts = trimmed
    .split(/[+,/&]+/)
    .map((p) => p.trim())
    .filter(Boolean);

  if (!parts.length) return "VS";

  const mapped = parts.map((part) => {
    const normalized = part
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/đ/g, "d")
      .trim();

    if (normalized.includes("vietsub") || normalized.includes("viet sub")) {
      return "VS";
    }
    if (normalized.includes("thuyet minh")) {
      return "TM";
    }
    if (normalized.includes("long tieng")) {
      return "LT";
    }
    if (normalized.includes("engsub") || normalized.includes("eng sub")) {
      return "EN";
    }
    return part;
  });

  return [...new Set(mapped)].join("+");
}
