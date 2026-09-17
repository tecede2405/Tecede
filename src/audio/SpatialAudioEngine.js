/**
 * SpatialAudioEngine.js
 * High-fidelity Web Audio API DSP Engine for Dolby Atmos & 3D Spatial Audio.
 * 
 * Professional Pipeline:
 *  Source ──┬──> [Bypass Gain] ─────────────────────────────────────────────────────────────────────────> Destination
 *           │
 *           └──> [Sub-Bass Filter (LowShelf 85Hz)]
 *                  │
 *                  ▼
 *                [Analog Warmth Filter (Peaking 280Hz, Q: 0.9)]  <-- Âm thanh ấm áp, dày dặn
 *                  │
 *                  ▼
 *                [Vocal Presence Filter (Peaking 2400Hz, Q: 1.1)] <-- Giọng ca trong trẻo
 *                  │
 *                  ▼
 *                [Spatial Air Filter (HighShelf 8500Hz)]          <-- Chi tiết thoáng đãng
 *                  │
 *                  ├───> [True Mid/Side (M/S) 3D Spatial Widener] ─┐
 *                  │                                               ├──> [Master DSP Gain] ──> [Compressor/Limiter] ──> Destination
 *                  └───> [Stereo Ambient Reverb & Feedback Loop] ──┘
 */

export const PRESETS = {
  atmos: {
    id: "atmos",
    name: "Dolby Atmos",
    icon: "🌌",
    desc: "Âm trường 3D vòm đa chiều, âm trầm ấm sâu, chi tiết chuẩn điện ảnh",
    bass: 8.5,     // dB sub-bass (85Hz)
    warmth: 4.5,   // dB analog body (280Hz)
    mid: 2.5,      // dB vocal clarity (2.4kHz)
    treble: 5.5,   // dB spatial air (8.5kHz)
    spatial: 85,   // % stereo width (Side boost)
    reverb: 38,    // % room reflection
  },
  cinema: {
    id: "cinema",
    name: "Rạp Phim",
    icon: "🎬",
    desc: "Không gian phòng chiếu hoành tráng, âm trầm bùng nổ uy lực",
    bass: 11.5,
    warmth: 5.0,
    mid: 3.0,
    treble: 4.5,
    spatial: 95,
    reverb: 55,
  },
  music: {
    id: "music",
    name: "Âm Nhạc Hi-Fi",
    icon: "🎵",
    desc: "Chất âm analog ấm áp tự nhiên, dải âm dày dặn và cân bằng",
    bass: 7.0,
    warmth: 4.5,
    mid: 2.0,
    treble: 4.5,
    spatial: 65,
    reverb: 22,
  },
  headphone: {
    id: "headphone",
    name: "Tai Nghe 3D",
    icon: "🎧",
    desc: "Âm trường mở rộng ngoài tai, bass căng và âm sắc trong trẻo",
    bass: 7.5,
    warmth: 3.5,
    mid: 2.5,
    treble: 6.5,
    spatial: 90,
    reverb: 28,
  },
  bass: {
    id: "bass",
    name: "Siêu Bass",
    icon: "🔊",
    desc: "Tăng cường âm bass cực căng và uy lực cho EDM, Vinahouse, Remix",
    bass: 13.5,
    warmth: 6.0,
    mid: -0.5,
    treble: 3.5,
    spatial: 55,
    reverb: 18,
  },
  vocal: {
    id: "vocal",
    name: "Giọng Hát",
    icon: "🎤",
    desc: "Làm nổi bật giọng ca sĩ dày ấm, lời hát rõ ràng và truyền cảm",
    bass: 2.5,
    warmth: 3.5,
    mid: 8.5,
    treble: 5.0,
    spatial: 50,
    reverb: 35,
  },
  studio: {
    id: "studio",
    name: "Phòng Thu",
    icon: "✨",
    desc: "Độ chuẩn xác âm học cao, giữ nguyên bản chất mộc của bản thu gốc",
    bass: 3.0,
    warmth: 2.0,
    mid: 1.0,
    treble: 2.5,
    spatial: 35,
    reverb: 10,
  },
  custom: {
    id: "custom",
    name: "Tùy Chỉnh",
    icon: "⚙️",
    desc: "Tự do điều chỉnh dải Bass, Mid, Treble, Độ rộng không gian và Vang phòng",
    bass: 6.5,
    warmth: 3.5,
    mid: 2.0,
    treble: 4.0,
    spatial: 70,
    reverb: 30,
  }
};

export const DEFAULT_CUSTOM_SETTINGS = {
  bass: 6.5,    // -10 to +14 dB
  mid: 2.0,     // -8 to +10 dB
  treble: 4.0,  // -8 to +10 dB
  spatial: 70,  // 0% to 100%
  reverb: 30    // 0% to 100%
};

class SpatialAudioEngine {
  constructor() {
    this.audioCtx = null;
    this.source = null;
    this.isInitialized = false;

    // Routing gains
    this.bypassGain = null;
    this.dspGain = null;

    // 4-Band Mastering EQ
    this.bassFilter = null;
    this.warmFilter = null;
    this.midFilter = null;
    this.trebleFilter = null;

    // Mid/Side (M/S) 3D Stereo Widener Nodes
    this.msSplitter = null;
    this.msMerger = null;
    this.midSum = null;
    this.sideSum = null;
    this.sideInvert = null;
    this.widthGain = null;
    this.rightSideInvert = null;

    // Stereo Room Reflection & Ambience Nodes
    this.reverbFilter = null;
    this.roomDelayL = null;
    this.roomDelayR = null;
    this.roomFeedbackL = null;
    this.roomFeedbackR = null;
    this.reverbWetGain = null;

    // Master Limiter Compressor
    this.compressor = null;

    // State
    this.isEnabled = false;
    this.currentPreset = "atmos";
    this.currentIntensity = 80;
    this.customSettings = { ...DEFAULT_CUSTOM_SETTINGS };
  }

  init(audioElement, initialEnabled = false) {
    if (this.isInitialized) {
      this.resumeContext();
      return;
    }

    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return;
      this.audioCtx = new AudioContext();
      this.source = this.audioCtx.createMediaElementSource(audioElement);

      // 1. Bypass & DSP Master Gains
      this.bypassGain = this.audioCtx.createGain();
      this.dspGain = this.audioCtx.createGain();

      this.bypassGain.gain.value = initialEnabled ? 0.0 : 1.0;
      this.dspGain.gain.value = initialEnabled ? 1.0 : 0.0;

      // 2. High-Precision 4-Band Mastering EQ
      // A. Deep Sub-Bass Filter (85Hz LowShelf) - Lực bass đánh sâu, căng
      this.bassFilter = this.audioCtx.createBiquadFilter();
      this.bassFilter.type = "lowshelf";
      this.bassFilter.frequency.value = 85;

      // B. Analog Warmth Filter (280Hz Peaking, Q: 0.9) - Dày dặn, ấm áp
      this.warmFilter = this.audioCtx.createBiquadFilter();
      this.warmFilter.type = "peaking";
      this.warmFilter.frequency.value = 280;
      this.warmFilter.Q.value = 0.9;

      // C. Vocal & Presence Filter (2400Hz Peaking, Q: 1.1) - Giọng hát rõ nét
      this.midFilter = this.audioCtx.createBiquadFilter();
      this.midFilter.type = "peaking";
      this.midFilter.frequency.value = 2400;
      this.midFilter.Q.value = 1.1;

      // D. Spatial Air Filter (8500Hz HighShelf) - Chi tiết cao, bay bổng
      this.trebleFilter = this.audioCtx.createBiquadFilter();
      this.trebleFilter.type = "highshelf";
      this.trebleFilter.frequency.value = 8500;

      // 3. True Mid/Side (M/S) 3D Spatial Widener
      // Mid = 0.5 * (L + R)
      // Side = 0.5 * (L - R)
      // Out L = Mid + Width * Side
      // Out R = Mid - Width * Side
      this.msSplitter = this.audioCtx.createChannelSplitter(2);
      this.msMerger = this.audioCtx.createChannelMerger(2);

      this.midSum = this.audioCtx.createGain();
      this.midSum.gain.value = 0.5;

      this.sideSum = this.audioCtx.createGain();
      this.sideSum.gain.value = 0.5;

      this.sideInvert = this.audioCtx.createGain();
      this.sideInvert.gain.value = -0.5;

      this.widthGain = this.audioCtx.createGain();
      this.widthGain.gain.value = 1.2;

      this.rightSideInvert = this.audioCtx.createGain();
      this.rightSideInvert.gain.value = -1.0;

      // 4. Stereo Ambient Reflection Network (Dolby Atmos Room Acoustic)
      this.reverbFilter = this.audioCtx.createBiquadFilter();
      this.reverbFilter.type = "lowpass";
      this.reverbFilter.frequency.value = 3200; // Tiêu âm tần số cao tự nhiên

      this.roomDelayL = this.audioCtx.createDelay();
      this.roomDelayL.delayTime.value = 0.024; // 24ms left

      this.roomDelayR = this.audioCtx.createDelay();
      this.roomDelayR.delayTime.value = 0.038; // 38ms right

      this.roomFeedbackL = this.audioCtx.createGain();
      this.roomFeedbackL.gain.value = 0.22;

      this.roomFeedbackR = this.audioCtx.createGain();
      this.roomFeedbackR.gain.value = 0.22;

      this.reverbWetGain = this.audioCtx.createGain();
      this.reverbWetGain.gain.value = 0.25;

      // 5. Master Dynamics Compressor & Limiter
      this.compressor = this.audioCtx.createDynamicsCompressor();
      this.compressor.threshold.value = -16;
      this.compressor.knee.value = 10;
      this.compressor.ratio.value = 3.5;
      this.compressor.attack.value = 0.006;
      this.compressor.release.value = 0.12;

      // 🔌 KẾT NỐI SƠ ĐỒ ÂM THANH (GRAPH ROUTING)

      // Nhánh Bypass (Âm mộc nguyên bản khi tắt hiệu ứng)
      this.source.connect(this.bypassGain);
      this.bypassGain.connect(this.audioCtx.destination);

      // Nhánh DSP (Xử lý âm thanh vòm Atmos)
      // Source -> Bass -> Warmth -> Mid -> Treble
      this.source.connect(this.bassFilter);
      this.bassFilter.connect(this.warmFilter);
      this.warmFilter.connect(this.midFilter);
      this.midFilter.connect(this.trebleFilter);

      // Đi dây M/S 3D Widener:
      this.trebleFilter.connect(this.msSplitter);

      // Mid = 0.5 * L + 0.5 * R
      this.msSplitter.connect(this.midSum, 0); // L -> midSum
      this.msSplitter.connect(this.midSum, 1); // R -> midSum

      // Side = 0.5 * L - 0.5 * R
      this.msSplitter.connect(this.sideSum, 0);      // L -> sideSum (+0.5)
      this.msSplitter.connect(this.sideInvert, 1);   // R -> sideInvert (-0.5)
      this.sideInvert.connect(this.sideSum);

      // Side -> widthGain (điều chỉnh độ rộng âm trường)
      this.sideSum.connect(this.widthGain);

      // Tái tạo stereo ra msMerger:
      // Kênh Trái (Input 0): Mid + (Width * Side)
      this.midSum.connect(this.msMerger, 0, 0);
      this.widthGain.connect(this.msMerger, 0, 0);

      // Kênh Phải (Input 1): Mid - (Width * Side)
      this.midSum.connect(this.msMerger, 0, 1);
      this.widthGain.connect(this.rightSideInvert);
      this.rightSideInvert.connect(this.msMerger, 0, 1);

      // M/S Widener kết nối vào dspGain
      this.msMerger.connect(this.dspGain);

      // Đi dây Ambient Reverb Network:
      this.trebleFilter.connect(this.reverbFilter);

      // Trái:
      this.reverbFilter.connect(this.roomDelayL);
      this.roomDelayL.connect(this.roomFeedbackL);
      this.roomFeedbackL.connect(this.roomDelayL);
      this.roomDelayL.connect(this.reverbWetGain);

      // Phải:
      this.reverbFilter.connect(this.roomDelayR);
      this.roomDelayR.connect(this.roomFeedbackR);
      this.roomFeedbackR.connect(this.roomDelayR);
      this.roomDelayR.connect(this.reverbWetGain);

      // Reverb wet kết nối vào dspGain
      this.reverbWetGain.connect(this.dspGain);

      // Master DSP -> Compressor -> Loa/Tai nghe
      this.dspGain.connect(this.compressor);
      this.compressor.connect(this.audioCtx.destination);

      this.isInitialized = true;
      this.isEnabled = !!initialEnabled;
      this.resumeContext();

      if (this.isEnabled) {
        this.dspGain.gain.value = 1.0;
        this.bypassGain.gain.value = 0.0;
        this.applySettings({
          preset: this.currentPreset,
          intensity: this.currentIntensity,
          custom: this.customSettings
        });
      } else {
        this.dspGain.gain.value = 0.0;
        this.bypassGain.gain.value = 1.0;
      }
    } catch (err) {
      console.warn("SpatialAudioEngine init error:", err);
    }
  }

  resumeContext() {
    if (this.audioCtx && this.audioCtx.state === "suspended") {
      this.audioCtx.resume().catch(() => {});
    }
  }

  setEnabled(enabled) {
    this.isEnabled = !!enabled;
    if (!this.isInitialized || !this.audioCtx) return;

    this.resumeContext();

    if (this.isEnabled) {
      this.dspGain.gain.value = 1.0;
      this.bypassGain.gain.value = 0.0;
      this.applySettings({
        preset: this.currentPreset,
        intensity: this.currentIntensity,
        custom: this.customSettings
      });
    } else {
      this.dspGain.gain.value = 0.0;
      this.bypassGain.gain.value = 1.0;
    }
  }

  applySettings({ preset, intensity, custom } = {}) {
    if (preset !== undefined) this.currentPreset = preset;
    if (intensity !== undefined) this.currentIntensity = intensity;
    if (custom !== undefined) this.customSettings = { ...this.customSettings, ...custom };

    if (!this.isInitialized || !this.audioCtx) return;

    this.resumeContext();

    let bassVal, warmVal, midVal, trebleVal, spatialVal, reverbVal;

    if (this.currentPreset === "custom") {
      bassVal = Number(this.customSettings.bass) || 0;
      // Analog warmth scales with bass to give rich body ("ấm hơn")
      warmVal = (Number(this.customSettings.bass) || 0) * 0.45;
      midVal = Number(this.customSettings.mid) || 0;
      trebleVal = Number(this.customSettings.treble) || 0;
      spatialVal = Number(this.customSettings.spatial) ?? 70;
      reverbVal = Number(this.customSettings.reverb) ?? 30;
    } else {
      const presetCfg = PRESETS[this.currentPreset] || PRESETS.atmos;
      const factor = (this.currentIntensity / 100);
      bassVal = presetCfg.bass * factor;
      warmVal = (presetCfg.warmth || 4.5) * factor;
      midVal = presetCfg.mid * factor;
      trebleVal = presetCfg.treble * factor;
      spatialVal = presetCfg.spatial * factor;
      reverbVal = presetCfg.reverb * factor;
    }

    // Gán trực tiếp giá trị AudioParam để hiệu ứng áp dụng NGAY LẬP TỨC mà không có độ trễ
    if (this.bassFilter) this.bassFilter.gain.value = bassVal;
    if (this.warmFilter) this.warmFilter.gain.value = warmVal;
    if (this.midFilter) this.midFilter.gain.value = midVal;
    if (this.trebleFilter) this.trebleFilter.gain.value = trebleVal;

    // Stereo Width: Chuyển đổi 0..100% sang hệ số khuếch đại Mid/Side (0.7 -> 2.2)
    // 0% -> 0.7 (thu hẹp)
    // 50% -> 1.0 (chuẩn stereo)
    // 70% -> 1.4 (âm trường 3D rộng mở)
    // 100% -> 2.2 (vòm đa chiều siêu rộng Dolby Atmos)
    const widthMult = 0.7 + (spatialVal / 100) * 1.5;
    if (this.widthGain) this.widthGain.gain.value = widthMult;

    // Reverb / Ambience: Chuyển đổi 0..100% sang mức độ vang phòng tự nhiên
    const wetReverb = (reverbVal / 100) * 0.42;
    if (this.reverbWetGain) this.reverbWetGain.gain.value = wetReverb;
    const feedbackVal = 0.12 + (reverbVal / 100) * 0.22;
    if (this.roomFeedbackL) this.roomFeedbackL.gain.value = feedbackVal;
    if (this.roomFeedbackR) this.roomFeedbackR.gain.value = feedbackVal;
  }
}

export const spatialEngine = new SpatialAudioEngine();
export default spatialEngine;
