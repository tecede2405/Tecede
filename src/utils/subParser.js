/**
 * Utility phân tích và xử lý 3 tùy chọn:
 * Option 1: Nhập đoạn ngẫu nhiên (Plain Text)
 * Option 2: Nhập kịch bản kèm thời gian (Timestamped Script)
 * Option 3: Nhập file phụ đề (.srt, .vtt, .txt)
 */

/**
 * Chuyển chuỗi thời gian SRT/VTT (hh:mm:ss,ms hoặc hh:mm:ss.ms) thành giây (Float)
 */
export const timeStrToSeconds = (timeStr) => {
  if (!timeStr) return 0;
  const cleaned = timeStr.trim().replace(",", ".");
  const parts = cleaned.split(":");

  if (parts.length === 3) {
    const hours = parseFloat(parts[0]) || 0;
    const minutes = parseFloat(parts[1]) || 0;
    const seconds = parseFloat(parts[2]) || 0;
    return hours * 3600 + minutes * 60 + seconds;
  } else if (parts.length === 2) {
    const minutes = parseFloat(parts[0]) || 0;
    const seconds = parseFloat(parts[1]) || 0;
    return minutes * 60 + seconds;
  } else {
    return parseFloat(cleaned) || 0;
  }
};

/**
 * Chuyển số giây (Float) thành định dạng chuẩn SRT (hh:mm:ss,ms)
 */
export const secondsToTimeStr = (totalSec, separator = ",") => {
  if (isNaN(totalSec) || totalSec < 0) totalSec = 0;
  const hours = Math.floor(totalSec / 3600);
  const minutes = Math.floor((totalSec % 3600) / 60);
  const seconds = Math.floor(totalSec % 60);
  const ms = Math.floor((totalSec % 1) * 1000);

  const pad = (n, width = 2) => String(n).padStart(width, "0");
  return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}${separator}${pad(ms, 3)}`;
};

/**
 * Làm sạch văn bản kịch bản trước khi TTS đọc
 */
export const cleanSubtitleText = (text) => {
  if (!text) return "";
  return text
    .replace(/<[^>]+>/g, " ")
    .replace(/\{[^}]+\}/g, " ")
    .replace(/["“”«»]/g, " ")
    .replace(/[\r\n]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
};

/**
 * OPTION 1: Phân tích đoạn văn bản ngẫu nhiên (chia thành các câu tự nhiên)
 */
export const parseRandomText = (content) => {
  if (!content || !content.trim()) return [];
  const paragraphs = content.split(/\n+/).map((p) => p.trim()).filter(Boolean);
  const cues = [];

  paragraphs.forEach((p) => {
    // Tách câu theo dấu chấm, hỏi, than
    const matches = p.match(/[^.!?\n]+[.!?\n]?/g) || [p];
    matches.forEach((sentence) => {
      const cleaned = cleanSubtitleText(sentence);
      if (cleaned && /[a-zA-Z0-9\p{L}]/u.test(cleaned)) {
        cues.push({
          id: cues.length + 1,
          startTime: 0,
          endTime: 0,
          duration: 0,
          text: cleaned
        });
      }
    });
  });

  return cues;
};

/**
 * OPTION 2: Phân tích kịch bản kèm thời gian
 * Hỗ trợ các định dạng:
 * 1. [00:00:01 - 00:00:05] Lời thoại hoặc [00:00:01 --> 00:00:05] Lời thoại
 * 2. 00:00:01 - 00:00:05: Lời thoại hoặc 00:00:01 --> 00:00:05: Lời thoại
 * 3. [00:00:01] Lời thoại hoặc 00:00:01: Lời thoại
 * 4. Định dạng file phụ đề SRT dán trực tiếp
 */
export const parseTimestampedScript = (content) => {
  if (!content || !content.trim()) return [];

  // Nếu người dùng dán nguyên khối SRT chuẩn (chứa '-->' và số thứ tự)
  if (content.includes("-->") && /^\s*\d+\s*[\r\n]+\d{1,2}:\d{2}/m.test(content)) {
    const srtCues = parseSubtitleFile(content);
    if (srtCues.length > 0) return srtCues;
  }

  const lines = content.replace(/\r\n/g, "\n").split("\n").map((l) => l.trim()).filter(Boolean);
  const cues = [];

  // Khớp dải thời gian: có hoặc không có dấu ngoặc vuông []
  const timeRangeRegex = /^\[?\s*([0-9]{1,2}:[0-9]{2}:[0-9]{2}(?:[.,][0-9]{1,3})?|[0-9]{1,2}:[0-9]{2})\s*(?:-->|-|đến)\s*([0-9]{1,2}:[0-9]{2}:[0-9]{2}(?:[.,][0-9]{1,3})?|[0-9]{1,2}:[0-9]{2})\s*\]?[:\s-]*(.*)$/i;
  // Khớp mốc thời gian đơn: [00:00:01] hoặc 00:00:01:
  const singleTimeRegex = /^\[?\s*([0-9]{1,2}:[0-9]{2}:[0-9]{2}(?:[.,][0-9]{1,3})?|[0-9]{1,2}:[0-9]{2})\s*\]?[:\s-]*(.*)$/i;

  let lastEndTime = 0;

  lines.forEach((line) => {
    // 1. Khớp dải thời gian [00:00:01 - 00:00:05] Lời thoại
    let match = line.match(timeRangeRegex);
    if (match) {
      const startTime = timeStrToSeconds(match[1]);
      const endTime = timeStrToSeconds(match[2]);
      const text = cleanSubtitleText(match[3]);

      if (text && endTime > startTime) {
        cues.push({
          id: cues.length + 1,
          startTime,
          endTime,
          duration: parseFloat((endTime - startTime).toFixed(3)),
          text
        });
        lastEndTime = endTime;
        return;
      }
    }

    // 2. Khớp mốc thời gian đơn [00:00:01] Lời thoại
    match = line.match(singleTimeRegex);
    if (match) {
      const startTime = timeStrToSeconds(match[1]);
      const text = cleanSubtitleText(match[2]);
      if (text) {
        const wordCount = text.split(/\s+/).filter(Boolean).length;
        const estimatedDuration = Math.max(2, Math.round(wordCount / 2.8));
        const endTime = startTime + estimatedDuration;

        cues.push({
          id: cues.length + 1,
          startTime,
          endTime,
          duration: estimatedDuration,
          text
        });
        lastEndTime = endTime;
        return;
      }
    }

    // 3. Nếu là dòng văn bản thông thường
    const cleanedText = cleanSubtitleText(line);
    if (cleanedText && /[a-zA-Z0-9\p{L}]/u.test(cleanedText)) {
      const wordCount = cleanedText.split(/\s+/).filter(Boolean).length;
      const estimatedDuration = Math.max(2, Math.round(wordCount / 2.8));
      const startTime = lastEndTime > 0 ? parseFloat((lastEndTime + 0.5).toFixed(3)) : 0;
      const endTime = parseFloat((startTime + estimatedDuration).toFixed(3));

      cues.push({
        id: cues.length + 1,
        startTime,
        endTime,
        duration: estimatedDuration,
        text: cleanedText
      });
      lastEndTime = endTime;
    }
  });

  return cues;
};

/**
 * OPTION 3: Phân tích file phụ đề (.srt hoặc .vtt)
 */
export const parseSubtitleFile = (content) => {
  if (!content || !content.trim()) return [];
  const cleanContent = content.replace(/^WEBVTT[^\n]*\n/i, "");
  const blocks = cleanContent.replace(/\r\n/g, "\n").replace(/\r/g, "\n").split(/\n\s*\n/);
  const cues = [];

  blocks.forEach((block) => {
    const lines = block.split("\n").map((l) => l.trim()).filter(Boolean);
    if (lines.length < 2) return;

    const timeLineIndex = lines.findIndex((l) => l.includes("-->"));
    if (timeLineIndex === -1) return;

    const timeLine = lines[timeLineIndex];
    const textLines = lines.slice(timeLineIndex + 1).join(" ");
    const [startStr, endStr] = timeLine.split("-->").map((s) => s.trim());

    const startTime = timeStrToSeconds(startStr);
    const endTime = timeStrToSeconds(endStr);
    const cleanedText = cleanSubtitleText(textLines);

    if (cleanedText && endTime > startTime) {
      cues.push({
        id: cues.length + 1,
        startTime,
        endTime,
        duration: parseFloat((endTime - startTime).toFixed(3)),
        text: cleanedText
      });
    }
  });

  return cues;
};

/**
 * Xuất danh sách Cues ra file SRT
 */
export const exportToSrtString = (cues) => {
  return cues
    .map((cue, idx) => {
      const start = secondsToTimeStr(cue.startTime, ",");
      const end = secondsToTimeStr(cue.endTime, ",");
      return `${idx + 1}\n${start} --> ${end}\n${cue.text}\n`;
    })
    .join("\n");
};
