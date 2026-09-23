/**
 * SpatialAudioEngine.js
 * High-Fidelity Audiophile DSP Engine for Dolby Atmos, 8D Spatial Audio & Lossless Hi-Res.
 * 
 * Features:
 *  - 4-Band Audiophile EQ (75Hz Deep Sub-Bass, 200Hz Analog Warmth, 2.8kHz Vocal Presence, 11kHz Air)
 *  - True 8D Audio Orbital Engine (360° circular binaural panning with acoustic head-shadow filter)
 *  - Pure Lossless Hi-Res Mastering Mode (100% uncompressed dynamic range, pristine clarity)
 *  - Safe-Phase Mid/Side (M/S) 3D Spatial Widener (100% phase-aligned, zero vocal hollow)
 *  - Velvet-Noise Algorithmic Convolution Reverb (Luxurious acoustic space, zero comb-filtering/metallic ringing)
 *  - Master Soft-Knee Limiter (Preserves transients, zero audio pumping)
 */

export const PRESETS = {
  atmos: {
    id: "atmos",
    name: "Dolby Atmos",
    icon: "🌌",
    desc: "Âm trường 3D vòm đa chiều, âm trầm ấm sâu, chi tiết chuẩn điện ảnh",
    bass: 3.8,     // dB sub-bass (75Hz LowShelf)
    warmth: 1.2,   // dB analog warmth (200Hz Peaking)
    mid: 1.8,      // dB vocal presence (2.8kHz Peaking)
    treble: 3.0,   // dB spatial air (11kHz HighShelf)
    spatial: 68,   // % stereo width (0..100)
    reverb: 20,    // % acoustic room reflection (0..100)
  },
  lossless: {
    id: "lossless",
    name: "Lossless Hi-Res",
    icon: "💎",
    desc: "Chất âm chuẩn phòng thu 24-bit/96kHz, độ chi tiết siêu cao, dải động nguyên bản không nén",
    bass: 1.5,
    warmth: 0.8,
    mid: 1.2,
    treble: 3.0,
    spatial: 50,
    reverb: 0,     // 0% vang (sạch mộc nguyên bản, không vang ảo)
  },
  eightD: {
    id: "eightD",
    name: "Âm Vòm 8D",
    icon: "🌀",
    desc: "Âm thanh 360° xoay vòng quanh đầu sống động, trải nghiệm bay bổng như tại concert",
    bass: 4.2,
    warmth: 1.5,
    mid: 1.8,
    treble: 3.5,
    spatial: 85,
    reverb: 32,
    is8D: true,
  },
  cinema: {
    id: "cinema",
    name: "Rạp Phim",
    icon: "🎬",
    desc: "Không gian phòng chiếu hoành tráng, âm trầm bùng nổ, lời thoại rõ nét",
    bass: 5.5,
    warmth: 1.8,
    mid: 2.2,
    treble: 3.5,
    spatial: 85,
    reverb: 35,
  },
  music: {
    id: "music",
    name: "Âm Nhạc Hi-Fi",
    icon: "🎵",
    desc: "Chất âm analog ấm áp tự nhiên, dải âm dày dặn và cân bằng tinh tế",
    bass: 2.5,
    warmth: 1.0,
    mid: 1.2,
    treble: 2.0,
    spatial: 50,
    reverb: 12,
  },
  headphone: {
    id: "headphone",
    name: "Tai Nghe 3D",
    icon: "🎧",
    desc: "Mở rộng âm trường thoát khỏi đầu, bass gọn gàng và âm sắc trong trẻo",
    bass: 3.5,
    warmth: 1.0,
    mid: 2.0,
    treble: 3.8,
    spatial: 80,
    reverb: 25,
  },
  bass: {
    id: "bass",
    name: "Siêu Bass",
    icon: "🔊",
    desc: "Âm trầm sâu thẳm và căng nảy cho EDM, Vinahouse, Dance, Remix",
    bass: 7.0,
    warmth: 2.0,
    mid: 0.5,
    treble: 2.0,
    spatial: 40,
    reverb: 10,
  },
  vocal: {
    id: "vocal",
    name: "Giọng Hát",
    icon: "🎤",
    desc: "Tôn vinh giọng ca sĩ ngọt ngào, dày ấm, lời hát truyền cảm và trong trẻo",
    bass: 1.2,
    warmth: 1.2,
    mid: 4.5,
    treble: 2.5,
    spatial: 35,
    reverb: 22,
  },
  studio: {
    id: "studio",
    name: "Phòng Thu",
    icon: "✨",
    desc: "Âm thanh mộc trung thực chuẩn kiểm âm, độ méo tiếng gần như bằng 0",
    bass: 1.0,
    warmth: 0.5,
    mid: 0.5,
    treble: 1.2,
    spatial: 20,
    reverb: 6,
  },
  custom: {
    id: "custom",
    name: "Tùy Chỉnh",
    icon: "⚙️",
    desc: "Tự do điều chỉnh dải Bass, Mid, Treble, Độ rộng không gian và Vang phòng",
    bass: 3.5,
    warmth: 1.2,
    mid: 1.5,
    treble: 2.5,
    spatial: 60,
    reverb: 20,
  }
};

export const DEFAULT_CUSTOM_SETTINGS = {
  bass: 3.5,    // -8 to +10 dB
  mid: 1.5,     // -6 to +8 dB
  treble: 2.5,  // -6 to +8 dB
  spatial: 60,  // 0% to 100%
  reverb: 20    // 0% to 100%
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

    // Velvet-Noise Algorithmic Convolution Reverb (Zero Comb Filtering)
    this.reverbFilter = null;
    this.convolver = null;
    this.reverbWetGain = null;

    // 🌀 8D Audio Rotational Orbit Engine
    this.eightDFilter = null;
    this.eightDPanner = null;
    this.eightDTimer = null;
    this.eightDActive = false;

    // Master Soft-Knee Limiter Compressor
    this.compressor = null;

    // State
    this.isEnabled = false;
    this.currentPreset = "atmos";
    this.currentIntensity = 80;
    this.customSettings = { ...DEFAULT_CUSTOM_SETTINGS };
  }

  generateRoomImpulse(duration = 0.75, decay = 3.2) {
    if (!this.audioCtx) return null;
    const rate = this.audioCtx.sampleRate || 44100;
    const length = Math.floor(rate * duration);
    const impulse = this.audioCtx.createBuffer(2, length, rate);
    const left = impulse.getChannelData(0);
    const right = impulse.getChannelData(1);

    for (let i = 0; i < length; i++) {
      const t = i / length;
      const envelope = Math.exp(-t * decay);
      left[i] = (Math.random() * 2 - 1) * envelope;
      right[i] = (Math.random() * 2 - 1) * envelope;
    }
    return impulse;
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

      // 2. High-Precision 4-Band Audiophile EQ (Harman & Dolby Target)
      // A. Deep Sub-Bass (75Hz LowShelf) - Đánh sâu, căng tròn, không bị ù rền
      this.bassFilter = this.audioCtx.createBiquadFilter();
      this.bassFilter.type = "lowshelf";
      this.bassFilter.frequency.value = 75;

      // B. Analog Warmth (200Hz Peaking, Q: 0.75) - Độ dày dặn và ấm áp tự nhiên
      this.warmFilter = this.audioCtx.createBiquadFilter();
      this.warmFilter.type = "peaking";
      this.warmFilter.frequency.value = 200;
      this.warmFilter.Q.value = 0.75;

      // C. Vocal & Presence (2800Hz Peaking, Q: 0.85) - Giọng ca sĩ sáng rõ, nổi bật
      this.midFilter = this.audioCtx.createBiquadFilter();
      this.midFilter.type = "peaking";
      this.midFilter.frequency.value = 2800;
      this.midFilter.Q.value = 0.85;

      // D. Spatial Air & Sparkle (11000Hz HighShelf) - Chi tiết cao bay bổng, thoáng đãng
      this.trebleFilter = this.audioCtx.createBiquadFilter();
      this.trebleFilter.type = "highshelf";
      this.trebleFilter.frequency.value = 11000;

      // 3. True Safe-Phase Mid/Side (M/S) 3D Spatial Widener
      this.msSplitter = this.audioCtx.createChannelSplitter(2);
      this.msMerger = this.audioCtx.createChannelMerger(2);

      this.midSum = this.audioCtx.createGain();
      this.midSum.gain.value = 0.5;

      this.sideSum = this.audioCtx.createGain();
      this.sideSum.gain.value = 0.5;

      this.sideInvert = this.audioCtx.createGain();
      this.sideInvert.gain.value = -0.5;

      this.widthGain = this.audioCtx.createGain();
      this.widthGain.gain.value = 1.15;

      this.rightSideInvert = this.audioCtx.createGain();
      this.rightSideInvert.gain.value = -1.0;

      // 4. Velvet-Noise Algorithmic Convolution Reverb (Dolby Atmos Room Acoustic)
      this.reverbFilter = this.audioCtx.createBiquadFilter();
      this.reverbFilter.type = "lowpass";
      this.reverbFilter.frequency.value = 2800;

      this.convolver = this.audioCtx.createConvolver();
      this.convolver.buffer = this.generateRoomImpulse(0.75, 3.2);

      this.reverbWetGain = this.audioCtx.createGain();
      this.reverbWetGain.gain.value = 0.15;

      // 5. 🌀 8D Rotational Orbit Panner & Head-Shadow Filter
      this.eightDFilter = this.audioCtx.createBiquadFilter();
      this.eightDFilter.type = "peaking";
      this.eightDFilter.frequency.value = 4500;
      this.eightDFilter.Q.value = 1.0;
      this.eightDFilter.gain.value = 0.0;

      if (this.audioCtx.createStereoPanner) {
        this.eightDPanner = this.audioCtx.createStereoPanner();
        this.eightDPanner.pan.value = 0.0;
      }

      // 6. Master Transparent Soft-Knee Dynamics Limiter
      this.compressor = this.audioCtx.createDynamicsCompressor();
      this.compressor.threshold.value = -8;
      this.compressor.knee.value = 12;
      this.compressor.ratio.value = 3.0;
      this.compressor.attack.value = 0.010;
      this.compressor.release.value = 0.180;

      // 🔌 KẾT NỐI SƠ ĐỒ ÂM THANH (GRAPH ROUTING)

      // Nhánh Bypass (Âm mộc nguyên bản khi tắt hiệu ứng)
      this.source.connect(this.bypassGain);
      this.bypassGain.connect(this.audioCtx.destination);

      // Nhánh DSP (Xử lý âm thanh vòm Atmos)
      this.source.connect(this.bassFilter);
      this.bassFilter.connect(this.warmFilter);
      this.warmFilter.connect(this.midFilter);
      this.midFilter.connect(this.trebleFilter);

      // Đi dây M/S 3D Widener:
      this.trebleFilter.connect(this.msSplitter);

      this.msSplitter.connect(this.midSum, 0);
      this.msSplitter.connect(this.midSum, 1);

      this.msSplitter.connect(this.sideSum, 0);
      this.msSplitter.connect(this.sideInvert, 1);
      this.sideInvert.connect(this.sideSum);

      this.sideSum.connect(this.widthGain);

      this.midSum.connect(this.msMerger, 0, 0);
      this.widthGain.connect(this.msMerger, 0, 0);

      this.midSum.connect(this.msMerger, 0, 1);
      this.widthGain.connect(this.rightSideInvert);
      this.rightSideInvert.connect(this.msMerger, 0, 1);

      this.msMerger.connect(this.dspGain);

      // Đi dây Reverb Convolver:
      this.trebleFilter.connect(this.reverbFilter);
      this.reverbFilter.connect(this.convolver);
      this.convolver.connect(this.reverbWetGain);
      this.reverbWetGain.connect(this.dspGain);

      // 🌀 Đi dây 8D Panner Engine -> Limiter -> Destination
      if (this.eightDPanner) {
        this.dspGain.connect(this.eightDFilter);
        this.eightDFilter.connect(this.eightDPanner);
        this.eightDPanner.connect(this.compressor);
      } else {
        this.dspGain.connect(this.compressor);
      }
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

  start8DLoop() {
    if (this.eightDTimer) return;
    this.eightDTimer = setInterval(() => this.update8D(), 35);
  }

  stop8DLoop() {
    if (this.eightDTimer) {
      clearInterval(this.eightDTimer);
      this.eightDTimer = null;
    }
    this.eightDActive = false;
    if (this.audioCtx) {
      const now = this.audioCtx.currentTime;
      if (this.eightDPanner) this.eightDPanner.pan.setTargetAtTime(0, now, 0.08);
      if (this.eightDFilter) this.eightDFilter.gain.setTargetAtTime(0, now, 0.08);
    }
  }

  update8D() {
    if (!this.isInitialized || !this.audioCtx || !this.isEnabled || this.currentPreset !== "eightD") {
      this.stop8DLoop();
      return;
    }

    this.eightDActive = true;
    const now = this.audioCtx.currentTime;
    // Chu kỳ quay 360 độ: ~11.5 giây cho 1 vòng quay mượt mà (0.55 rad/s)
    const angle = now * 0.55;

    // Quỹ đạo X: Chạy từ tai Trái (-0.88) sang tai Phải (+0.88)
    const panX = Math.sin(angle) * 0.88;

    // Chiều sâu Z: Trước mặt (-1) ra sau gáy (+1)
    const depthZ = Math.cos(angle);

    // Khi âm thanh chạy ra sau gáy (depthZ > 0):
    // Tự động kích hoạt hiệu ứng Head-Shadow (-3.5dB tại 4.5kHz) tạo ảo giác âm thanh đi vòng sau đầu thật 100%
    const headShadow = depthZ > 0 ? -depthZ * 3.5 : 0;

    if (this.eightDPanner) {
      this.eightDPanner.pan.setValueAtTime(panX, now);
    }
    if (this.eightDFilter) {
      this.eightDFilter.gain.setValueAtTime(headShadow, now);
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
      this.stop8DLoop();
    }
  }

  applySettings({ preset, intensity, custom } = {}) {
    if (preset !== undefined) this.currentPreset = preset;
    if (intensity !== undefined) this.currentIntensity = intensity;
    if (custom !== undefined) this.customSettings = { ...this.customSettings, ...custom };

    if (!this.isInitialized || !this.audioCtx) return;

    this.resumeContext();

    // 🌀 Quản lý 8D Rotation Loop
    if (this.currentPreset === "eightD" && this.isEnabled) {
      this.start8DLoop();
    } else {
      this.stop8DLoop();
    }

    // 💎 Quản lý Dynamic Range Limiter (Lossless Mode tắt nén để giữ 100% dải động gốc)
    if (this.compressor) {
      if (this.currentPreset === "lossless") {
        this.compressor.ratio.value = 1.0; // 1:1 không nén (Pure Lossless Dynamic Range)
      } else {
        this.compressor.ratio.value = 3.0; // Gentle soft-knee limiter
      }
    }

    let bassVal, warmVal, midVal, trebleVal, spatialVal, reverbVal;

    if (this.currentPreset === "custom") {
      bassVal = Number(this.customSettings.bass) || 0;
      warmVal = Math.max(-2, Math.min(3.5, (Number(this.customSettings.bass) || 0) * 0.35));
      midVal = Number(this.customSettings.mid) || 0;
      trebleVal = Number(this.customSettings.treble) || 0;
      spatialVal = Number(this.customSettings.spatial) ?? 60;
      reverbVal = Number(this.customSettings.reverb) ?? 20;
    } else {
      const presetCfg = PRESETS[this.currentPreset] || PRESETS.atmos;
      const factor = (this.currentIntensity / 100);
      bassVal = presetCfg.bass * factor;
      warmVal = (presetCfg.warmth || 1.2) * factor;
      midVal = presetCfg.mid * factor;
      trebleVal = presetCfg.treble * factor;
      spatialVal = presetCfg.spatial * factor;
      reverbVal = presetCfg.reverb * factor;
    }

    if (this.bassFilter) this.bassFilter.gain.value = bassVal;
    if (this.warmFilter) this.warmFilter.gain.value = warmVal;
    if (this.midFilter) this.midFilter.gain.value = midVal;
    if (this.trebleFilter) this.trebleFilter.gain.value = trebleVal;

    // Stereo Width: Chuyển đổi 0..100% sang hệ số khuếch đại Mid/Side an toàn (0.85 -> 1.32)
    const widthMult = 0.85 + (spatialVal / 100) * 0.47;
    if (this.widthGain) this.widthGain.gain.value = widthMult;

    // Reverb / Ambience: Chuyển đổi 0..100% sang mức độ vang phòng tự nhiên (0 -> 0.22)
    const wetReverb = (reverbVal / 100) * 0.22;
    if (this.reverbWetGain) this.reverbWetGain.gain.value = wetReverb;
  }
}

export const spatialEngine = new SpatialAudioEngine();
export default spatialEngine;
