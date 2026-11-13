/**
 * Audio Timeline Engine:
 * Sử dụng Web Audio API (OfflineAudioContext) để:
 * 1. Decode các audio blob từng câu thoại.
 * 2. Căn vị trí từng câu theo đúng mốc startTime trong kịch bản (hoặc nối tiếp tự nhiên cho văn bản ngẫu nhiên).
 * 3. Chèn khoảng lặng (silence) chính xác theo kịch bản.
 * 4. Áp dụng tốc độ đọc cố định theo tùy chọn của người dùng (không tự ý ép tăng tốc).
 * 5. Xuất thành file âm thanh chuẩn định dạng MP3 (128 kbps).
 */

import { Mp3Encoder } from "@breezystack/lamejs";

/**
 * Chuyển đổi một AudioBuffer (Float32Array) thành file MP3 Blob chuẩn
 * Sử dụng thư viện Mp3Encoder để nén thành file .mp3 dung lượng nhẹ và tương thích mọi thiết bị
 */
export const audioBufferToMp3Blob = (audioBuffer, kbps = 128) => {
  const channels = audioBuffer.numberOfChannels;
  const sampleRate = audioBuffer.sampleRate;
  const mp3encoder = new Mp3Encoder(channels, sampleRate, kbps);
  const mp3Data = [];

  const sampleBlockSize = 1152;
  const numSamples = audioBuffer.length;
  const left = audioBuffer.getChannelData(0);
  const right = channels > 1 ? audioBuffer.getChannelData(1) : left;

  // Chuyển Float32 [-1.0, 1.0] sang Int16 [-32768, 32767]
  const leftInt16 = new Int16Array(numSamples);
  const rightInt16 = new Int16Array(numSamples);

  for (let i = 0; i < numSamples; i++) {
    let sL = Math.max(-1, Math.min(1, left[i]));
    leftInt16[i] = sL < 0 ? sL * 32768 : sL * 32767;

    if (channels > 1) {
      let sR = Math.max(-1, Math.min(1, right[i]));
      rightInt16[i] = sR < 0 ? sR * 32768 : sR * 32767;
    }
  }

  for (let i = 0; i < numSamples; i += sampleBlockSize) {
    const leftChunk = leftInt16.subarray(i, i + sampleBlockSize);
    let mp3buf;
    if (channels === 1) {
      mp3buf = mp3encoder.encodeBuffer(leftChunk);
    } else {
      const rightChunk = rightInt16.subarray(i, i + sampleBlockSize);
      mp3buf = mp3encoder.encodeBuffer(leftChunk, rightChunk);
    }
    if (mp3buf && mp3buf.length > 0) {
      mp3Data.push(mp3buf);
    }
  }

  const flushBuf = mp3encoder.flush();
  if (flushBuf && flushBuf.length > 0) {
    mp3Data.push(flushBuf);
  }

  return new Blob(mp3Data, { type: "audio/mp3" });
};

/**
 * Cắt bỏ hoàn toàn khoảng lặng thừa ở cả ĐẦU (leading silence) và ĐUÔI (trailing silence)
 * Edge-TTS luôn chèn khoảng ~220ms - 350ms khoảng lặng vô hình ở đầu câu (encoder priming + breath padding)
 * và ~900ms - 1000ms khoảng lặng ở đuôi câu.
 * Hàm này quét trực tiếp dữ liệu biên độ âm thanh PCM, loại bỏ sạch 2 khoảng lặng chết này,
 * trả về một AudioBuffer tinh khiết chỉ chứa đúng phần tiếng nói thực tế.
 */
export const trimAudioBuffer = (audioCtx, originalBuffer, threshold = 0.003) => {
  if (!originalBuffer) return originalBuffer;

  const numChannels = originalBuffer.numberOfChannels;
  const length = originalBuffer.length;
  const sampleRate = originalBuffer.sampleRate;

  let firstIndex = length;
  let lastIndex = 0;

  for (let c = 0; c < numChannels; c++) {
    const data = originalBuffer.getChannelData(c);
    for (let i = 0; i < length; i++) {
      if (Math.abs(data[i]) > threshold) {
        if (i < firstIndex) firstIndex = i;
        break;
      }
    }
    for (let i = length - 1; i >= 0; i--) {
      if (Math.abs(data[i]) > threshold) {
        if (i > lastIndex) lastIndex = i;
        break;
      }
    }
  }

  // Nếu file hoàn toàn im lặng hoặc không tìm thấy âm thanh
  if (firstIndex >= length || lastIndex <= firstIndex) {
    return originalBuffer;
  }

  // Giữ lại 15ms đệm trước tiếng nói để âm bật đầu (attack) mượt mà, không bị giật tiếng
  const marginBefore = Math.floor(sampleRate * 0.015);
  // Giữ lại 40ms đệm sau tiếng nói để giữ trọn âm đuôi (decay) tự nhiên
  const marginAfter = Math.floor(sampleRate * 0.04);

  const startSample = Math.max(0, firstIndex - marginBefore);
  const endSample = Math.min(length, lastIndex + marginAfter);
  const trimmedLength = endSample - startSample;

  if (trimmedLength <= 0) return originalBuffer;

  const trimmedBuffer = audioCtx.createBuffer(numChannels, trimmedLength, sampleRate);
  for (let c = 0; c < numChannels; c++) {
    const channelData = originalBuffer.getChannelData(c).subarray(startSample, endSample);
    trimmedBuffer.getChannelData(c).set(channelData);
  }

  return trimmedBuffer;
};

/**
 * Tìm thời điểm kết thúc tiếng nói thực tế trong AudioBuffer (hỗ trợ tương thích ngược)
 */
export const getActiveAudioDuration = (audioBuffer, threshold = 0.003) => {
  if (!audioBuffer) return 0;
  const numChannels = audioBuffer.numberOfChannels;
  const length = audioBuffer.length;
  let lastSampleIndex = 0;

  for (let c = 0; c < numChannels; c++) {
    const data = audioBuffer.getChannelData(c);
    for (let i = length - 1; i >= 0; i--) {
      if (Math.abs(data[i]) > threshold) {
        if (i > lastSampleIndex) lastSampleIndex = i;
        break;
      }
    }
  }

  if (lastSampleIndex > 0) {
    return Math.min(audioBuffer.duration, (lastSampleIndex / audioBuffer.sampleRate) + 0.04);
  }
  return audioBuffer.duration;
};

/**
 * Thuật toán dựng timeline âm thanh Offline:
 * @param {Array} cuesWithBlobs Danh sách câu đã có blob âm thanh
 * @param {Object} config
 * @param {string} config.mode 'random' (nối tiếp văn bản ngẫu nhiên) hoặc 'script' (kịch bản có timestamp)
 * @param {number} config.speed Tốc độ đọc do người dùng chọn (mặc định 1.0)
 * @param {number} config.sampleRate Tần số lấy mẫu (44100Hz)
 * @param {Function} config.onProgress Báo tiến trình (0 - 100%)
 */
export const renderTimelineAudio = async (cuesWithBlobs = [], config = {}) => {
  const {
    mode = "script",
    speed = 1.0,
    sampleRate = 44100,
    onProgress = () => {}
  } = config;

  if (!cuesWithBlobs || cuesWithBlobs.length === 0) {
    throw new Error("Không có đoạn âm thanh nào để tạo.");
  }

  const decodeCtx = new (window.AudioContext || window.webkitAudioContext)();
  onProgress(10);

  // 1. Giải mã và khử sạch khoảng lặng thừa ở đầu và đuôi của Edge-TTS
  const decodedCues = [];
  let processedDecode = 0;

  for (const cue of cuesWithBlobs) {
    if (!cue.blob) continue;
    try {
      const arrayBuf = await cue.blob.arrayBuffer();
      const rawBuffer = await decodeCtx.decodeAudioData(arrayBuf);
      // Loại bỏ sạch khoảng lặng đầu (~300ms) và đuôi (~950ms)
      const cleanBuffer = trimAudioBuffer(decodeCtx, rawBuffer);

      decodedCues.push({
        ...cue,
        buffer: cleanBuffer,
        rawDuration: rawBuffer.duration,
        cleanDuration: cleanBuffer.duration
      });
    } catch (err) {
      console.warn(`Lỗi giải mã audio câu #${cue.id}:`, err);
    }
    processedDecode++;
    onProgress(10 + Math.round((processedDecode / cuesWithBlobs.length) * 35));
  }

  if (decodedCues.length === 0) {
    if (decodeCtx.state !== "closed") decodeCtx.close().catch(() => {});
    throw new Error("Không giải mã được dữ liệu âm thanh nào.");
  }

  // 2. Tính toán lịch phát (schedule) chuẩn xác từng mili-giây
  let totalDurationSeconds = 0;
  const playbackSpeed = Math.max(0.5, Math.min(2.5, parseFloat(speed) || 1.0));

  if (mode === "random") {
    // Chế độ văn bản ngẫu nhiên: phát nối tiếp tự nhiên
    // Đã loại bỏ sạch độ trễ của Edge-TTS, chỉ nghỉ nhẹ 0.15s giữa các câu
    let cursor = 0;
    decodedCues.forEach((c) => {
      c.scheduledStart = cursor;
      const playDuration = c.cleanDuration / playbackSpeed;
      c.scheduledEnd = cursor + playDuration;
      cursor += playDuration + (0.15 / playbackSpeed);
    });
    totalDurationSeconds = cursor + 0.2;
  } else {
    // Chế độ kịch bản thời gian: đặt chuẩn xác theo startTime trong kịch bản
    // Giọng nói bắt đầu NGAY LẬP TỨC tại mốc giây chỉ định, độ trễ = 0ms
    let maxTime = 0;
    let prevEnd = 0;

    decodedCues.forEach((c) => {
      const targetStart = typeof c.startTime === "number" ? c.startTime : prevEnd;
      // Đảm bảo không bị chồng lấn âm thanh nếu câu trước dài hơn mốc tiếp theo
      c.scheduledStart = Math.max(targetStart, prevEnd > 0 ? (prevEnd + 0.05) : targetStart);
      const playDuration = c.cleanDuration / playbackSpeed;
      c.scheduledEnd = c.scheduledStart + playDuration;
      prevEnd = c.scheduledEnd;

      if (c.scheduledEnd > maxTime) maxTime = c.scheduledEnd;
    });
    totalDurationSeconds = maxTime + 0.4;
  }

  const totalLengthSamples = Math.ceil(sampleRate * Math.max(2, totalDurationSeconds));

  // 3. Khởi tạo OfflineAudioContext để render timeline âm thanh
  const offlineCtx = new (window.OfflineAudioContext || window.webkitOfflineAudioContext)(
    2, // Stereo
    totalLengthSamples,
    sampleRate
  );

  onProgress(50);

  // 4. Xếp các BufferSource sạch vào offlineCtx tại đúng mốc thời gian
  decodedCues.forEach((c) => {
    const source = offlineCtx.createBufferSource();
    source.buffer = c.buffer;
    source.playbackRate.value = playbackSpeed;
    source.connect(offlineCtx.destination);
    source.start(c.scheduledStart);
  });

  onProgress(70);

  // 5. Render toàn bộ âm thanh
  const renderedBuffer = await offlineCtx.startRendering();

  onProgress(85);

  // 6. Chuyển thành MP3 Blob chuẩn
  const mp3Blob = audioBufferToMp3Blob(renderedBuffer, 128);

  onProgress(100);

  if (decodeCtx.state !== "closed") {
    decodeCtx.close().catch(() => {});
  }

  return {
    blob: mp3Blob,
    blobUrl: URL.createObjectURL(mp3Blob),
    totalDuration: totalDurationSeconds,
    format: "mp3",
    cues: decodedCues.map((c) => ({
      id: c.id,
      scheduledStart: c.scheduledStart,
      scheduledEnd: c.scheduledEnd,
      duration: c.cleanDuration / playbackSpeed,
      buffer: c.buffer
    }))
  };
};
