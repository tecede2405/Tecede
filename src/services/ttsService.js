/**
 * Service quản lý gọi Edge-TTS API, cache âm thanh và xử lý hàng đợi tải song song
 */

export const TTS_VOICES = [
  {
    id: "api_nam_minh",
    label: "Nam Minh",
    voiceName: "vi-VN-NamMinhNeural",
    gender: "male"
  },
  {
    id: "api_hoai_my",
    label: "Hoài My",
    voiceName: "vi-VN-HoaiMyNeural",
    gender: "female"
  }
];

// Bộ nhớ đệm Audio Blob lưu trên RAM trong phiên làm việc (Key: `${voiceId}_${text}`)
const audioCache = new Map();

/**
 * Lấy voiceName từ voiceId
 */
export const getVoiceName = (voiceId) => {
  const v = TTS_VOICES.find((item) => item.id === voiceId);
  return v ? v.voiceName : "vi-VN-NamMinhNeural";
};

/**
 * Gọi API TTS lấy audio Blob của 1 câu văn bản
 */
export const fetchTtsAudioBlob = async (text, voiceId = "api_nam_minh", signal = null) => {
  const trimmed = (text || "").trim();
  if (!trimmed) {
    throw new Error("Văn bản rỗng");
  }

  const cacheKey = `${voiceId}_${trimmed}`;
  if (audioCache.has(cacheKey)) {
    return audioCache.get(cacheKey);
  }

  const voiceName = getVoiceName(voiceId);
  const url = `https://tranvanhung203-edge-tts-api.hf.space/tts?text=${encodeURIComponent(
    trimmed
  )}&voice=${encodeURIComponent(voiceName)}`;

  let attempts = 0;
  const maxAttempts = 3;

  while (attempts < maxAttempts) {
    attempts++;
    try {
      const res = await fetch(url, { signal });
      if (!res.ok) {
        throw new Error(`TTS API phản hồi mã lỗi ${res.status}`);
      }
      const blob = await res.blob();
      // Lưu cache
      audioCache.set(cacheKey, blob);
      return blob;
    } catch (err) {
      if (err.name === "AbortError") {
        throw err;
      }
      if (attempts >= maxAttempts) {
        throw new Error(`Thất bại sau ${maxAttempts} lần thử: ${err.message}`);
      }
      // Đợi một khoảng ngắn rồi thử lại
      const backoffMs = 800 * attempts;
      await new Promise((resolve) => {
        setTimeout(resolve, backoffMs);
      });
    }
  }
};

/**
 * Tải hàng loạt danh sách cues với giới hạn số luồng tải đồng thời (Concurrency Control)
 * @param {Array} cues Danh sách các câu kịch bản
 * @param {Object} options
 * @param {number} options.concurrency Số luồng tải cùng lúc (mặc định 3)
 * @param {Function} options.onProgress Callback báo tiến trình: (completed, total, currentItem) => void
 * @param {AbortSignal} options.signal Hủy luồng nếu cần
 */
export const batchFetchCuesAudio = async (cues = [], options = {}) => {
  const {
    concurrency = 3,
    onProgress = () => {},
    signal = null
  } = options;

  const total = cues.length;
  let completed = 0;
  const results = new Array(total);

  let nextIndex = 0;

  const worker = async () => {
    while (nextIndex < total) {
      if (signal?.aborted) throw new Error("Thao tác bị hủy");

      const idx = nextIndex++;
      const item = cues[idx];
      const itemVoice = item.voice || "api_nam_minh";

      try {
        // Nếu đã có blob nhưng giọng bị đổi thì phải tải lại giọng mới
        const blob = (item.blob && item.loadedVoice === itemVoice)
          ? item.blob
          : await fetchTtsAudioBlob(item.text, itemVoice, signal);

        results[idx] = {
          ...item,
          voice: itemVoice,
          loadedVoice: itemVoice,
          blob,
          blobUrl: URL.createObjectURL(blob),
          error: null
        };
      } catch (err) {
        console.warn(`Lỗi tải câu #${idx + 1}:`, err);
        results[idx] = {
          ...item,
          blob: null,
          blobUrl: null,
          error: err.message
        };
      }

      completed++;
      onProgress(completed, total, results[idx]);
    }
  };

  const pool = [];
  const workerCount = Math.min(concurrency, total);
  for (let i = 0; i < workerCount; i++) {
    pool.push(worker());
  }

  await Promise.all(pool);
  return results;
};

/**
 * Xóa cache nếu người dùng muốn giải phóng RAM
 */
export const clearAudioCache = () => {
  audioCache.clear();
};
