import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  Volume2,
  UploadCloud,
  FileText,
  Clock,
  Play,
  Pause,
  Download,
  CheckCircle2,
  Sparkles,
  HelpCircle,
  Trash2,
  Settings2,
  Sliders,
  Layers,
  Loader2
} from "lucide-react";
import Swal from "sweetalert2";
import PolicyModal from "./PolicyModal";
import {
  parseRandomText,
  parseTimestampedScript,
  parseSubtitleFile,
  exportToSrtString,
  secondsToTimeStr
} from "../../../utils/subParser";
import {
  TTS_VOICES,
  batchFetchCuesAudio,
  fetchTtsAudioBlob
} from "../../../services/ttsService";
import { renderTimelineAudio, trimAudioBuffer } from "../../../utils/audioTimelineEngine";
import "./index.scss";

// Mẫu thử nghiệm cho từng option
const SAMPLES = {
  random: `Chào mừng bạn đến với hệ thống chuyển văn bản thành giọng nói AI của Tecede.
Bạn có thể dán bất kỳ đoạn văn bản nào vào đây để tạo giọng đọc tự nhiên.
Tốc độ nói sẽ tuân theo đúng mức bạn đã lựa chọn mà không bị co kéo hay ép nhanh.`,
  timestamp: `[00:00:00 - 00:00:04] Xin chào các bạn đã quay trở lại với kênh Tecede!
[00:00:04 - 00:00:09] Hôm nay chúng ta cùng khám phá tính năng lồng tiếng theo kịch bản.
[00:00:09 - 00:00:15] Các khoảng lặng giữa những câu thoại sẽ được tự động chèn chuẩn xác.
[00:00:15 - 00:00:20] Chúc các bạn sáng tạo nên những video thật hấp dẫn!`
};

const SPEED_PRESETS = [0.8, 1.0, 1.2, 1.5];

const AdminTtsStudio = () => {
  // 3 Options: 'random' (Option 1) | 'timestamp' (Option 2) | 'file' (Option 3)
  const [optionMode, setOptionMode] = useState("timestamp");

  // Input văn bản theo option
  const [randomText, setRandomText] = useState(SAMPLES.random);
  const [timestampText, setTimestampText] = useState(SAMPLES.timestamp);
  const [uploadedFileName, setUploadedFileName] = useState("");
  const [uploadedFileContent, setUploadedFileContent] = useState("");

  // Cài đặt giọng đọc & tốc độ
  const [defaultVoice, setDefaultVoice] = useState("api_nam_minh");
  const [speed, setSpeed] = useState(1.0); // Tốc độ đọc cố định người dùng chọn

  // Danh sách câu thoại
  const [cues, setCues] = useState([]);

  // Modal hướng dẫn định dạng
  const [showGuideModal, setShowGuideModal] = useState(false);

  // Tiến trình render
  const [isProcessing, setIsProcessing] = useState(false);
  const [progressStage, setProgressStage] = useState("");
  const [progressPercent, setProgressPercent] = useState(0);

  // Kết quả Audio
  const [renderedAudio, setRenderedAudio] = useState(null);
  const [isPlayingFull, setIsPlayingFull] = useState(false);
  const [currentPlayTime, setCurrentPlayTime] = useState(0);

  // Nghe thử từng câu đơn
  const [previewingCueId, setPreviewingCueId] = useState(null);
  const [loadingCueId, setLoadingCueId] = useState(null);
  const previewAudioCtxRef = useRef(null);
  const previewSourceRef = useRef(null);
  const singleAudioRef = useRef(null);
  const fullAudioRef = useRef(null);
  const abortCtrlRef = useRef(null);
  const fileInputRef = useRef(null);
  const outputCardRef = useRef(null);

  // Dọn dẹp Web Audio khi unmount
  useEffect(() => {
    return () => {
      if (previewSourceRef.current) {
        try {
          previewSourceRef.current.stop();
        } catch (e) {}
      }
      if (previewAudioCtxRef.current && previewAudioCtxRef.current.state !== "closed") {
        previewAudioCtxRef.current.close().catch(() => {});
      }
    };
  }, []);

  // Hàm phân tích nội dung theo từng option
  const handleParseContent = useCallback((showWarning = false) => {
    let parsed = [];
    if (optionMode === "random") {
      parsed = parseRandomText(randomText);
    } else if (optionMode === "timestamp") {
      parsed = parseTimestampedScript(timestampText);
    } else if (optionMode === "file") {
      parsed = parseSubtitleFile(uploadedFileContent);
    }

    if (parsed.length === 0) {
      if (showWarning) {
        Swal.fire({
          icon: "warning",
          title: "Chưa có nội dung hợp lệ",
          text: "Vui lòng nhập văn bản hoặc tải file phụ đề để phân tích.",
          background: "#1e293b",
          color: "#fff",
          confirmButtonColor: "#3b82f6"
        });
      }
      return;
    }

    const withVoice = parsed.map((c) => ({
      ...c,
      voice: c.voice || defaultVoice,
      blob: null,
      blobUrl: null,
      status: "idle"
    }));

    setCues(withVoice);
    setRenderedAudio(null);
  }, [optionMode, randomText, timestampText, uploadedFileContent, defaultVoice]);

  // Khởi tạo ban đầu khi vào trang (chỉ chạy 1 lần lúc mount)
  const isInitialMounted = useRef(false);
  useEffect(() => {
    if (!isInitialMounted.current) {
      isInitialMounted.current = true;
      const initial = parseTimestampedScript(SAMPLES.timestamp).map((c) => ({
        ...c,
        voice: defaultVoice,
        blob: null,
        blobUrl: null,
        status: "idle"
      }));
      setCues(initial);
    }
  }, [defaultVoice]);

  // Đổi Option mode: tự động cập nhật danh sách câu của mode đó
  const handleSelectOptionMode = (mode) => {
    setOptionMode(mode);
    setRenderedAudio(null);
    let parsed = [];
    if (mode === "random") {
      parsed = parseRandomText(randomText);
    } else if (mode === "timestamp") {
      parsed = parseTimestampedScript(timestampText);
    } else if (mode === "file") {
      parsed = parseSubtitleFile(uploadedFileContent);
    }
    if (parsed.length > 0) {
      setCues(
        parsed.map((c) => ({
          ...c,
          voice: defaultVoice,
          blob: null,
          blobUrl: null,
          status: "idle"
        }))
      );
    }
  };

  // Upload file cho Option 3
  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadedFileName(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result;
      if (typeof text === "string") {
        setUploadedFileContent(text);
        const parsed = parseSubtitleFile(text);
        if (parsed.length > 0) {
          setCues(
            parsed.map((c) => ({
              ...c,
              voice: defaultVoice,
              blob: null,
              blobUrl: null,
              status: "idle"
            }))
          );
          setRenderedAudio(null);
        } else {
          Swal.fire({
            icon: "warning",
            title: "File không đúng định dạng",
            text: "Không tìm thấy nội dung phụ đề SRT/VTT trong file.",
            background: "#1e293b",
            color: "#fff"
          });
        }
      }
    };
    reader.readAsText(file);
  };

  // Đổi giọng mặc định
  const handleApplyVoiceToAll = (voiceId) => {
    setDefaultVoice(voiceId);
    setCues((prev) =>
      prev.map((c) => ({
        ...c,
        voice: voiceId,
        blob: null,
        blobUrl: null,
        status: "idle"
      }))
    );
  };

  // Đổi text 1 câu
  const handleCueTextChange = (id, newText) => {
    setCues((prev) =>
      prev.map((c) => (c.id === id ? { ...c, text: newText, blob: null } : c))
    );
  };

  // Đổi voice 1 câu
  const handleCueVoiceChange = (id, newVoice) => {
    setCues((prev) =>
      prev.map((c) => (c.id === id ? { ...c, voice: newVoice, blob: null } : c))
    );
  };

  // Xóa 1 câu
  const handleDeleteCue = (id) => {
    setCues((prev) => prev.filter((c) => c.id !== id));
  };

  const stopSinglePreview = useCallback(() => {
    if (previewSourceRef.current) {
      try {
        previewSourceRef.current.stop();
      } catch (e) {}
      previewSourceRef.current = null;
    }
    setPreviewingCueId(null);
    setLoadingCueId(null);
  }, []);

  // Nghe thử 1 câu tức thì (0ms trễ, tự động cắt bỏ sạch khoảng lặng vô hình)
  const handlePreviewSingleCue = async (cue) => {
    if (previewingCueId === cue.id || loadingCueId === cue.id) {
      stopSinglePreview();
      return;
    }

    stopSinglePreview();

    const targetVoice = cue.voice || defaultVoice;

    try {
      if (!previewAudioCtxRef.current || previewAudioCtxRef.current.state === "closed") {
        previewAudioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
      }
      const audioCtx = previewAudioCtxRef.current;
      if (audioCtx.state === "suspended") {
        await audioCtx.resume();
      }

      let cleanBuf =
        cue.loadedVoice === targetVoice && cue.trimmedBuffer ? cue.trimmedBuffer : null;

      if (!cleanBuf) {
        setLoadingCueId(cue.id);

        let blob = cue.loadedVoice === targetVoice && cue.blob ? cue.blob : null;
        if (!blob) {
          blob = await fetchTtsAudioBlob(cue.text, targetVoice);
        }

        const arrayBuf = await blob.arrayBuffer();
        const rawBuf = await audioCtx.decodeAudioData(arrayBuf);
        cleanBuf = trimAudioBuffer(audioCtx, rawBuf);

        // Lưu buffer sạch vào cue state để các lần nghe thử tiếp theo phát NGAY LẬP TỨC 0ms
        setCues((prev) =>
          prev.map((c) =>
            c.id === cue.id
              ? { ...c, blob, loadedVoice: targetVoice, trimmedBuffer: cleanBuf }
              : c
          )
        );
        setLoadingCueId(null);
      }

      // Bắt đầu phát tức thì 0ms bằng Web Audio API
      setPreviewingCueId(cue.id);

      const sourceNode = audioCtx.createBufferSource();
      sourceNode.buffer = cleanBuf;
      sourceNode.playbackRate.value = Math.max(0.5, Math.min(2.5, parseFloat(speed) || 1.0));
      sourceNode.connect(audioCtx.destination);
      sourceNode.onended = () => {
        setPreviewingCueId(null);
        previewSourceRef.current = null;
      };
      sourceNode.start(0);
      previewSourceRef.current = sourceNode;
    } catch (err) {
      console.error("Lỗi nghe thử:", err);
      stopSinglePreview();
      Swal.fire({
        icon: "error",
        title: "Lỗi nghe thử",
        text: err.message,
        background: "#1e293b",
        color: "#fff"
      });
    }
  };

  // Hủy tiến trình
  const handleCancelProcess = () => {
    if (abortCtrlRef.current) abortCtrlRef.current.abort();
    setIsProcessing(false);
    setProgressPercent(0);
    setProgressStage("Đã hủy quá trình.");
  };

  // Bắt đầu tạo âm thanh toàn bộ
  const handleStartRender = async () => {
    if (cues.length === 0) {
      Swal.fire({
        icon: "warning",
        title: "Chưa có câu thoại",
        text: "Vui lòng phân tích nội dung trước khi tạo âm thanh.",
        background: "#1e293b",
        color: "#fff"
      });
      return;
    }

    setIsProcessing(true);
    setProgressPercent(0);
    setProgressStage("Giai đoạn 1: Đang nạp giọng đọc AI từng câu...");

    const abortCtrl = new AbortController();
    abortCtrlRef.current = abortCtrl;

    try {
      // 1. Tải audio từng câu (đảm bảo đồng bộ giọng đang chọn)
      const cuesToProcess = cues.map((c) => ({
        ...c,
        voice: c.voice || defaultVoice
      }));

      const cuesWithAudio = await batchFetchCuesAudio(cuesToProcess, {
        concurrency: 3,
        signal: abortCtrl.signal,
        onProgress: (completed, total) => {
          const percent = Math.round((completed / total) * 50);
          setProgressPercent(percent);
          setProgressStage(`Giai đoạn 1: Đã tạo giọng AI ${completed}/${total} câu`);
        }
      });

      setCues(cuesWithAudio);

      // 2. Render bằng Web Audio OfflineAudioContext theo đúng tốc độ người dùng chọn
      setProgressStage("Giai đoạn 2: Đang ghép âm thanh theo tốc độ đã chọn...");

      const output = await renderTimelineAudio(cuesWithAudio, {
        mode: optionMode === "random" ? "random" : "script",
        speed: parseFloat(speed) || 1.0,
        sampleRate: 44100,
        onProgress: (renderPct) => {
          const overall = 50 + Math.round(renderPct * 0.5);
          setProgressPercent(overall);
          if (renderPct >= 85) {
            setProgressStage("Giai đoạn 3: Đang đóng gói file xuất...");
          }
        }
      });

      // Đồng bộ lịch phát chính xác từng câu và lưu trimmedBuffer để nghe thử tức thì 0ms
      if (output.cues) {
        setCues((prev) =>
          prev.map((c) => {
            const match = output.cues.find((oc) => oc.id === c.id);
            return match
              ? {
                  ...c,
                  scheduledStart: match.scheduledStart,
                  scheduledEnd: match.scheduledEnd,
                  trimmedBuffer: match.buffer,
                  loadedVoice: c.voice || defaultVoice
                }
              : c;
          })
        );
      }

      setRenderedAudio(output);
      setIsProcessing(false);
      setProgressStage("Hoàn thành! Bạn có thể nghe thử hoặc tải về file âm thanh.");

      // Tự động cuộn xuống khu vực nút phát và thanh nghe file âm thanh
      setTimeout(() => {
        outputCardRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "center"
        });
      }, 150);

      await Swal.fire({
        icon: "success",
        title: "Tạo âm thanh thành công!",
        text: `Đã hoàn tất ${cues.length} câu (${secondsToTimeStr(output.totalDuration)}) ở tốc độ ${speed}x.`,
        background: "#1e293b",
        color: "#fff",
        confirmButtonColor: "#3b82f6",
        confirmButtonText: "Nghe thử ngay"
      });

      // Đảm bảo cuộn chính xác vào tầm nhìn sau khi đóng modal thông báo
      setTimeout(() => {
        outputCardRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "center"
        });
      }, 100);
    } catch (err) {
      if (err.name !== "AbortError") {
        console.error("Lỗi tạo audio:", err);
        Swal.fire({
          icon: "error",
          title: "Có lỗi xảy ra",
          text: err.message,
          background: "#1e293b",
          color: "#fff"
        });
      }
      setIsProcessing(false);
    }
  };

  // Điều khiển Audio Player tổng
  const togglePlayFullAudio = () => {
    if (!fullAudioRef.current || !renderedAudio) return;
    if (isPlayingFull) {
      fullAudioRef.current.pause();
      setIsPlayingFull(false);
    } else {
      fullAudioRef.current.play();
      setIsPlayingFull(true);
    }
  };

  // Tải file về kèm SweetAlert xác nhận
  const handleDownloadAudio = async () => {
    if (!renderedAudio?.blobUrl) return;

    const defaultName = optionMode === "random" ? "doan-van-ai" : "kich-ban-ai";

    const { value: fileNameInput, isConfirmed } = await Swal.fire({
      title: "Tải file âm thanh MP3",
      html: `
        <div style="text-align: left; font-size: 13.5px; color: #cbd5e1; line-height: 1.6;">
          <p style="margin-bottom: 8px;">Xác nhận tải xuống file âm thanh đã lồng tiếng:</p>
          <ul style="padding-left: 20px; margin: 0; color: #94a3b8;">
            <li>Giọng đọc: <strong style="color: ${defaultVoice === "api_hoai_my" ? "#f472b6" : "#60a5fa"};">${defaultVoice === "api_hoai_my" ? "👩 Giọng Nữ AI (Hoài My)" : "👨 Giọng Nam AI (Nam Minh)"}</strong></li>
            <li>Định dạng: <strong style="color: #22c55e;">.MP3 (128 kbps)</strong></li>
            <li>Thời lượng: <strong style="color: #38bdf8;">${secondsToTimeStr(renderedAudio.totalDuration)}</strong></li>
            <li>Tốc độ đọc: <strong style="color: #f59e0b;">${speed}x</strong></li>
          </ul>
        </div>
      `,
      input: "text",
      inputValue: defaultName,
      inputLabel: "Tên file lưu (hệ thống sẽ tự thêm đuôi .mp3):",
      inputPlaceholder: "Nhập tên file...",
      showCancelButton: true,
      confirmButtonText: "Tải xuống MP3",
      cancelButtonText: "Hủy bỏ",
      confirmButtonColor: "#22c55e",
      cancelButtonColor: "#475569",
      background: "#0f172a",
      color: "#ffffff"
    });

    if (!isConfirmed) return;

    const finalName = (fileNameInput || "").trim() || defaultName;
    const a = document.createElement("a");
    a.href = renderedAudio.blobUrl;
    a.download = `${finalName}.mp3`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    Swal.fire({
      toast: true,
      position: "top-end",
      icon: "success",
      title: `Đang tải: ${finalName}.mp3`,
      showConfirmButton: false,
      timer: 2000,
      background: "#1e293b",
      color: "#fff"
    });
  };

  // Xuất SRT kèm SweetAlert xác nhận
  const handleExportSrt = async () => {
    if (cues.length === 0) return;

    const { value: srtNameInput, isConfirmed } = await Swal.fire({
      title: "Xuất file phụ đề SRT",
      html: `
        <div style="text-align: left; font-size: 13.5px; color: #cbd5e1;">
          <p>Tải xuống file phụ đề <strong>.srt</strong> gồm <strong>${cues.length} câu thoại</strong> đã chỉnh sửa?</p>
        </div>
      `,
      input: "text",
      inputValue: "kich-ban-hieu-chinh",
      inputLabel: "Tên file phụ đề (không cần gõ đuôi .srt):",
      inputPlaceholder: "Nhập tên file...",
      showCancelButton: true,
      confirmButtonText: "Tải file .SRT",
      cancelButtonText: "Hủy bỏ",
      confirmButtonColor: "#3b82f6",
      cancelButtonColor: "#475569",
      background: "#0f172a",
      color: "#ffffff"
    });

    if (!isConfirmed) return;

    const srtFileName = (srtNameInput || "").trim() || "kich-ban-hieu-chinh";
    const srtContent = exportToSrtString(cues);
    const blob = new Blob([srtContent], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${srtFileName}.srt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    Swal.fire({
      toast: true,
      position: "top-end",
      icon: "success",
      title: `Đang tải: ${srtFileName}.srt`,
      showConfirmButton: false,
      timer: 2000,
      background: "#1e293b",
      color: "#fff"
    });
  };

  return (
    <div className="admin-tts-studio">
      <audio ref={singleAudioRef} />
      {renderedAudio && (
        <audio
          ref={fullAudioRef}
          src={renderedAudio.blobUrl}
          onTimeUpdate={(e) => setCurrentPlayTime(e.currentTarget.currentTime)}
          onEnded={() => setIsPlayingFull(false)}
        />
      )}

      {/* HEADER SECTION */}
      <div className="studio-header">
        <div className="header-info">
          <div className="badge-ai-studio">
            <Sparkles size={14} className="text-warning" />
            <span>AI Voice Studio</span>
          </div>
          <h2>Chuyển Đổi Văn Bản & Lồng Tiếng Kịch Bản</h2>
        </div>

        <div className="header-actions">
          <button
            type="button"
            className="btn-policy-open"
            onClick={() => setShowGuideModal(true)}
            title="Xem hướng dẫn định dạng kịch bản"
          >
            <HelpCircle size={18} />
            <span>Hướng dẫn định dạng</span>
          </button>
        </div>
      </div>

      {/* MAIN GRID */}
      <div className="studio-main-grid">
        {/* CỘT TRÁI: 3 OPTIONS & TÙY CHỈNH TỐC ĐỘ */}
        <div className="studio-left-card">
          {/* 3 OPTIONS TABS */}
          <div className="three-options-tabs">
            <button
              type="button"
              className={`option-tab-btn ${optionMode === "random" ? "active" : ""}`}
              onClick={() => handleSelectOptionMode("random")}
            >
              <FileText size={15} />
              <span>1. Đoạn ngẫu nhiên</span>
            </button>
            <button
              type="button"
              className={`option-tab-btn ${optionMode === "timestamp" ? "active" : ""}`}
              onClick={() => handleSelectOptionMode("timestamp")}
            >
              <Clock size={15} />
              <span>2. Kèm thời gian</span>
            </button>
            <button
              type="button"
              className={`option-tab-btn ${optionMode === "file" ? "active" : ""}`}
              onClick={() => handleSelectOptionMode("file")}
            >
              <UploadCloud size={15} />
              <span>3. Nhập file</span>
            </button>
          </div>

          <div className="tab-content-area">
            {/* OPTION 1: NHẬP ĐOẠN NGẪU NHIÊN */}
            {optionMode === "random" && (
              <div className="textarea-wrap">
                <textarea
                  className="script-textarea"
                  value={randomText}
                  onChange={(e) => setRandomText(e.target.value)}
                  placeholder="Dán bất kỳ đoạn văn bản nào vào đây..."
                  rows={8}
                />
                <div className="textarea-footer">
                  <span className="textarea-char-count">
                    {randomText.length} ký tự
                  </span>
                  <div className="d-flex gap-2">
                    <button
                      type="button"
                      className="btn-pill-subtle"
                      onClick={() => {
                        setRandomText(SAMPLES.random);
                        const parsed = parseRandomText(SAMPLES.random);
                        setCues(
                          parsed.map((c) => ({
                            ...c,
                            voice: defaultVoice,
                            blob: null,
                            blobUrl: null,
                            status: "idle"
                          }))
                        );
                        setRenderedAudio(null);
                      }}
                    >
                      Dán mẫu
                    </button>
                    <button
                      type="button"
                      className="btn-pill-subtle"
                      onClick={() => {
                        setRandomText("");
                        setCues([]);
                        setRenderedAudio(null);
                      }}
                    >
                      Xóa
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* OPTION 2: NHẬP KỊCH BẢN KÈM THỜI GIAN */}
            {optionMode === "timestamp" && (
              <div className="textarea-wrap">
                <textarea
                  className="script-textarea"
                  value={timestampText}
                  onChange={(e) => setTimestampText(e.target.value)}
                  placeholder="Nhập kịch bản kèm mốc thời gian: [00:00:00 - 00:00:04] Lời thoại..."
                  rows={8}
                />
                <div className="textarea-footer">
                  <span className="textarea-char-count">
                    {timestampText.length} ký tự
                  </span>
                  <div className="d-flex gap-2">
                    <button
                      type="button"
                      className="btn-pill-subtle"
                      onClick={() => {
                        setTimestampText(SAMPLES.timestamp);
                        const parsed = parseTimestampedScript(SAMPLES.timestamp);
                        setCues(
                          parsed.map((c) => ({
                            ...c,
                            voice: defaultVoice,
                            blob: null,
                            blobUrl: null,
                            status: "idle"
                          }))
                        );
                        setRenderedAudio(null);
                      }}
                    >
                      Dán mẫu
                    </button>
                    <button
                      type="button"
                      className="btn-pill-subtle"
                      onClick={() => {
                        setTimestampText("");
                        setCues([]);
                        setRenderedAudio(null);
                      }}
                    >
                      Xóa
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* OPTION 3: NHẬP FILE CHỨA SUB */}
            {optionMode === "file" && (
              <div
                className="file-dropzone"
                onClick={() => fileInputRef.current?.click()}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  accept=".srt,.vtt,.txt"
                  className="d-none"
                  onChange={handleFileUpload}
                />
                <UploadCloud size={38} className="text-primary mb-2" />
                <h5>Kéo thả hoặc nhấp để chọn file</h5>
                <p className="dropzone-hint mb-0">
                  Hỗ trợ file <code>.srt</code>, <code>.vtt</code>, <code>.txt</code>
                </p>
                {uploadedFileName && (
                  <div className="badge-file-uploaded mt-2">
                    <FileText size={14} />
                    <span>{uploadedFileName}</span>
                  </div>
                )}
              </div>
            )}

            <button
              type="button"
              className="btn-parse-script w-100 mt-3"
              onClick={() => handleParseContent(true)}
            >
              <Layers size={18} />
              <span>Phân tích & Cập nhật danh sách câu</span>
            </button>
          </div>

          {/* CÀI ĐẶT GIỌNG ĐỌC & TÙY CHỌN TỐC ĐỘ */}
          <div className="studio-settings-box mt-3">
            <h6 className="settings-title">
              <Settings2 size={16} />
              <span>Cài đặt giọng đọc & Tốc độ</span>
            </h6>

            {/* Chọn giọng đọc AI */}
            <div className="setting-row">
              <label>Giọng đọc AI:</label>
              <div className="voice-simple-pills">
                {TTS_VOICES.map((v) => {
                  const isSelected = defaultVoice === v.id;
                  return (
                    <button
                      key={v.id}
                      type="button"
                      className={`voice-pill-btn ${isSelected ? "active" : ""}`}
                      onClick={() => handleApplyVoiceToAll(v.id)}
                    >
                      <span className="me-1">{v.gender === "male" ? "👨" : "👩"}</span>
                      <span>{v.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* TÙY CHỌN TỐC ĐỘ ĐỌC (SPEED CONTROL) */}
            <div className="setting-row speed-control-section">
              <div className="d-flex justify-content-between align-items-center mb-1">
                <label className="d-flex align-items-center gap-1">
                  <Sliders size={14} className="text-primary" />
                  <span>Tốc độ đọc:</span>
                </label>
                <span className="badge-speed-val">{speed}x</span>
              </div>

              <input
                type="range"
                min="0.6"
                max="1.8"
                step="0.1"
                value={speed}
                onChange={(e) => setSpeed(parseFloat(e.target.value))}
                className="speed-range-slider"
              />

              <div className="speed-pills-row">
                {SPEED_PRESETS.map((val) => (
                  <button
                    key={val}
                    type="button"
                    className={`speed-pill-btn ${speed === val ? "active" : ""}`}
                    onClick={() => setSpeed(val)}
                  >
                    {val}x
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* CỘT PHẢI: BẢNG DANH SÁCH CÂU THOẠI & TRÌNH XUẤT AUDIO */}
        <div className="studio-right-card">
          <div className="timeline-header">
            <div className="timeline-stats">
              <div className="stat-item">
                <span className="stat-label">Số câu:</span>
                <span className="stat-val">{cues.length}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Chế độ:</span>
                <span className="stat-val text-primary">
                  {optionMode === "random"
                    ? "Đoạn ngẫu nhiên"
                    : optionMode === "timestamp"
                    ? "Kịch bản thời gian"
                    : "File phụ đề"}
                </span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Giọng đọc:</span>
                <span
                  className="stat-val"
                  style={{ color: defaultVoice === "api_hoai_my" ? "#f472b6" : "#60a5fa" }}
                >
                  {defaultVoice === "api_hoai_my" ? "👩 Hoài My (Nữ)" : "👨 Nam Minh (Nam)"}
                </span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Tốc độ:</span>
                <span className="stat-val text-warning">{speed}x</span>
              </div>
            </div>

            {optionMode !== "random" && cues.length > 0 && (
              <button
                type="button"
                className="btn-export-srt"
                onClick={handleExportSrt}
                title="Tải về file phụ đề SRT"
              >
                <Download size={14} /> Xuất SRT
              </button>
            )}
          </div>

          {cues.length > 0 && (
            <div className="mobile-swipe-hint">
              <span>👉 Vuốt ngang bảng để xem đầy đủ mốc thời gian & thao tác</span>
            </div>
          )}

          {/* BẢNG CUES */}
          <div className="cues-table-wrapper">
            {cues.length === 0 ? (
              <div className="empty-cues-state">
                <Layers size={44} className="text-secondary opacity-50 mb-2" />
                <p>Chưa có câu thoại nào.</p>
                <span className="empty-cues-hint">
                  Hãy nhập văn bản ở cột bên trái và bấm "Phân tích" để hiển thị.
                </span>
              </div>
            ) : (
              <table className="cues-table">
                <thead>
                  <tr>
                    <th style={{ width: "50px" }}>#</th>
                    {optionMode !== "random" && (
                      <th style={{ width: "160px" }}>Mốc thời gian</th>
                    )}
                    <th>Nội dung câu thoại</th>
                    <th style={{ width: "150px" }}>Giọng đọc</th>
                    <th style={{ width: "80px" }} className="text-center">Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {cues.map((cue, index) => {
                    const isPreviewing = previewingCueId === cue.id;
                    const isActivePlaying = isPlayingFull &&
                      typeof cue.scheduledStart === "number" &&
                      currentPlayTime >= cue.scheduledStart &&
                      currentPlayTime < (cue.scheduledEnd || (cue.scheduledStart + 3));

                    return (
                      <tr
                        key={cue.id}
                        className={`${isPreviewing ? "row-previewing" : ""} ${
                          isActivePlaying ? "row-active-playing" : ""
                        }`}
                      >
                        <td className="cue-index-cell">{index + 1}</td>
                        {optionMode !== "random" && (
                          <td className="time-cell">
                            <span className="time-val">{secondsToTimeStr(cue.startTime)}</span>
                            <span className="time-arrow">→</span>
                            <span className="time-val">{secondsToTimeStr(cue.endTime)}</span>
                          </td>
                        )}
                        <td>
                          <input
                            type="text"
                            value={cue.text}
                            onChange={(e) => handleCueTextChange(cue.id, e.target.value)}
                            className="inline-text-edit"
                          />
                        </td>
                        <td>
                          <select
                            value={cue.voice || defaultVoice}
                            onChange={(e) => handleCueVoiceChange(cue.id, e.target.value)}
                            className="inline-voice-select"
                          >
                            {TTS_VOICES.map((v) => (
                              <option key={v.id} value={v.id}>
                                {v.gender === "male" ? "👨 Giọng Nam" : "👩 Giọng Nữ"}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="text-center">
                          <div className="d-flex justify-content-center gap-1">
                            <button
                              type="button"
                              className={`btn-action-icon ${isPreviewing ? "active" : ""}`}
                              onClick={() => handlePreviewSingleCue(cue)}
                              title={
                                loadingCueId === cue.id
                                  ? "Đang nạp giọng đọc..."
                                  : isPreviewing
                                  ? "Dừng"
                                  : "Nghe thử tức thì (0ms)"
                              }
                            >
                              {loadingCueId === cue.id ? (
                                <Loader2 size={13} className="spin-loader text-info" />
                              ) : isPreviewing ? (
                                <Pause size={13} />
                              ) : (
                                <Play size={13} />
                              )}
                            </button>
                            <button
                              type="button"
                              className="btn-action-icon text-danger"
                              onClick={() => handleDeleteCue(cue.id)}
                              title="Xóa câu"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>

          {/* FOOTER TIẾN TRÌNH & NÚT RENDER */}
          <div className="timeline-footer-controls">
            {isProcessing && (
              <div className="processing-progress-card">
                <div className="d-flex justify-content-between align-items-center mb-1">
                  <span className="stage-text">{progressStage}</span>
                  <span className="percent-text">{progressPercent}%</span>
                </div>
                <div className="progress-track">
                  <div
                    className="progress-fill"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
                <div className="text-end mt-2">
                  <button
                    type="button"
                    className="btn-cancel-process"
                    onClick={handleCancelProcess}
                  >
                    Hủy
                  </button>
                </div>
              </div>
            )}

            {!isProcessing && (
              <div className="d-flex gap-3 align-items-center flex-wrap w-100">
                <button
                  type="button"
                  className="btn-start-dubbing w-100"
                  onClick={handleStartRender}
                  disabled={cues.length === 0}
                >
                  <Volume2 size={18} />
                  <span>
                    Tạo File Âm Thanh ({defaultVoice === "api_hoai_my" ? "👩 Giọng Nữ" : "👨 Giọng Nam"} - Tốc độ {speed}x)
                  </span>
                </button>
              </div>
            )}

            {/* PLAYER KẾT QUẢ KHI XONG */}
            {renderedAudio && (
              <div className="rendered-output-card mt-3" ref={outputCardRef}>
                <div className="output-info">
                  <div className="d-flex align-items-center gap-2">
                    <CheckCircle2 size={20} className="text-success" />
                    <div>
                      <h6 className="output-title-text">
                        Đã Hoàn Tất File Âm Thanh
                      </h6>
                      <div className="output-meta-line">
                        <span>Thời lượng: <strong className="meta-duration">{secondsToTimeStr(renderedAudio.totalDuration)}</strong></span>
                        <span className="dot-sep">•</span>
                        <span>Tốc độ: <strong className="meta-speed">{speed}x</strong></span>
                        <span className="dot-sep">•</span>
                        <span className="meta-format">MP3 (128 kbps)</span>
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    className="btn-download-full"
                    onClick={handleDownloadAudio}
                  >
                    <Download size={17} />
                    <span>Tải File MP3</span>
                  </button>
                </div>

                <div className="output-player-bar mt-2">
                  <button
                    type="button"
                    className="btn-play-pause-output"
                    onClick={togglePlayFullAudio}
                  >
                    {isPlayingFull ? <Pause size={15} /> : <Play size={15} />}
                  </button>

                  <div className="time-display">
                    {secondsToTimeStr(currentPlayTime)} / {secondsToTimeStr(renderedAudio.totalDuration)}
                  </div>

                  <input
                    type="range"
                    min="0"
                    max={renderedAudio.totalDuration || 100}
                    step="0.1"
                    value={currentPlayTime}
                    onChange={(e) => {
                      const t = parseFloat(e.target.value);
                      setCurrentPlayTime(t);
                      if (fullAudioRef.current) fullAudioRef.current.currentTime = t;
                    }}
                    className="output-timeline-slider flex-grow-1"
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* MODAL HƯỚNG DẪN ĐỊNH DẠNG */}
      <PolicyModal
        isOpen={showGuideModal}
        onClose={() => setShowGuideModal(false)}
      />
    </div>
  );
};

export default AdminTtsStudio;
