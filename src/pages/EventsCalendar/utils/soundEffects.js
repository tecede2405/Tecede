// Web Audio API Sound Synthesizer for UI micro-interactions
// Generates crisp mechanical click, soft hover pop, and subtle magical theme chime with 0 bytes downloaded

let audioCtx = null;
const STORAGE_KEY_SOUND = "tecede_events_sound";

function getAudioContext() {
  if (typeof window === "undefined") return null;
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === "suspended") {
    audioCtx.resume().catch(() => {});
  }
  return audioCtx;
}

export function getSoundPreference() {
  try {
    const val = localStorage.getItem(STORAGE_KEY_SOUND);
    if (val !== null) return val === "true";
  } catch (e) {
    // ignore
  }
  return true; // Default bật âm thanh phản hồi
}

export function setSoundPreference(enabled) {
  try {
    localStorage.setItem(STORAGE_KEY_SOUND, String(enabled));
  } catch (e) {
    // ignore
  }
}

/**
 * Tiếng "tạch" cơ học xúc giác (Mechanical / Tactile Click)
 * Sử dụng xung sóng tam giác giảm nhanh tần số từ 1500Hz -> 100Hz
 */
export function playClickSound() {
  if (!getSoundPreference()) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "triangle";
    osc.frequency.setValueAtTime(1500, now);
    osc.frequency.exponentialRampToValueAtTime(100, now + 0.035);

    gain.gain.setValueAtTime(0.16, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.035);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.035);
  } catch (e) {
    // ignore
  }
}

/**
 * Tiếng "tick / pop" nhẹ khi rê chuột (Hover Sound)
 * Âm lượng nhỏ êm dịu (0.04), có cơ chế throttle tránh dồn âm
 */
let lastHoverTime = 0;
export function playHoverSound() {
  if (!getSoundPreference()) return;
  const nowMs = Date.now();
  if (nowMs - lastHoverTime < 60) return; // giới hạn tần suất 60ms
  lastHoverTime = nowMs;

  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(800, now);
    osc.frequency.exponentialRampToValueAtTime(400, now + 0.022);

    gain.gain.setValueAtTime(0.04, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.022);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.022);
  } catch (e) {
    // ignore
  }
}

/**
 * Âm thanh chuông ngân huyền ảo khi chuyển đổi Theme (Theme Chime)
 * Hợp âm nhẹ Do - Mi - Sol - Do (C - E - G - C)
 */
export function playThemeChime() {
  if (!getSoundPreference()) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const now = ctx.currentTime;
    const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6

    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const startAt = now + idx * 0.04;
      const duration = 0.22;

      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, startAt);

      gain.gain.setValueAtTime(0.07, startAt);
      gain.gain.exponentialRampToValueAtTime(0.001, startAt + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(startAt);
      osc.stop(startAt + duration);
    });
  } catch (e) {
    // ignore
  }
}
