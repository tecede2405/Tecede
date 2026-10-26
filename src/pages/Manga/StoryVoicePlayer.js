import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
  useImperativeHandle,
  forwardRef
} from "react";
import { Link } from "react-router-dom";
import {
  FaPlay,
  FaPause,
  FaStop,
  FaEllipsisV,
  FaArrowUp,
  FaArrowDown,
  FaTimes,
  FaHeadphones,
  FaSlidersH,
  FaSpinner,
  FaStepForward
} from "react-icons/fa";

/**
 * Ghép lại các từ bị tác giả/bên dịch cố tình chèn dấu chấm để lách kiểm duyệt
 * (ví dụ: c. h. ế. t -> chết; t. h. i t. h. ể . -> thi thể.)
 */
export const normalizeCensoredWords = (text) => {
  if (!text) return "";
  return text
    // 1. Ghép chữ "thi thể": t. h. i t. h. ể, t.h.i t.h.ể, t. h. i t. h. ể ., t.h.i.t.h.e...
    .replace(/(^|[^\p{L}])t[\s._-]*h[\s._-]*[iíìỉĩị][\s._-]*t[\s._-]*h[\s._-]*[eêếềểễệ](\s*\.)?(?!\p{L})/giu, (match, prefix, trailingDot) => {
      const isAllUpper = match.toUpperCase() === match;
      const isFirstUpper = /^[^\p{L}]*[T]/u.test(match);
      const replacement = isAllUpper ? "THI THỂ" : isFirstUpper ? "Thi thể" : "thi thể";
      return (prefix || "") + replacement + (trailingDot ? "." : "");
    })
    // 2. Ghép chữ "chết": c. h. ế. t, c.h.ế.t, c. h. e. t, c-h-ế-t...
    .replace(/(^|[^\p{L}])c[\s._-]*h[\s._-]*[eêếềểễệ][\s._-]*t(\s*\.)?(?!\p{L})/giu, (match, prefix, trailingDot) => {
      const isAllUpper = match.toUpperCase() === match;
      const isFirstUpper = /^[^\p{L}]*[C]/u.test(match);
      const replacement = isAllUpper ? "CHẾT" : isFirstUpper ? "Chết" : "chết";
      return (prefix || "") + replacement + (trailingDot ? "." : "");
    })
    // 3. Ghép chữ "giết": g. i. ế. t, g.i.ế.t, g. i. e. t...
    .replace(/(^|[^\p{L}])g[\s._-]*i[\s._-]*[eêếềểễệ][\s._-]*t(\s*\.)?(?!\p{L})/giu, (match, prefix, trailingDot) => {
      const isAllUpper = match.toUpperCase() === match;
      const isFirstUpper = /^[^\p{L}]*[G]/u.test(match);
      const replacement = isAllUpper ? "GIẾT" : isFirstUpper ? "Giết" : "giết";
      return (prefix || "") + replacement + (trailingDot ? "." : "");
    })
    // 4. Ghép chữ "xác": x. á. c, x.a.c...
    .replace(/(^|[^\p{L}])x[\s._-]*[aáàảãạâấầẩẫậăắằẳẵặ][\s._-]*c(\s*\.)?(?!\p{L})/giu, (match, prefix, trailingDot) => {
      const isAllUpper = match.toUpperCase() === match;
      const isFirstUpper = /^[^\p{L}]*[X]/u.test(match);
      const replacement = isAllUpper ? "XÁC" : isFirstUpper ? "Xác" : "xác";
      return (prefix || "") + replacement + (trailingDot ? "." : "");
    })
    // 5. Ghép chữ "ngực": n. g. ự. c, n.g.ự.c, n. g. u. c...
    .replace(/(^|[^\p{L}])n[\s._-]*g[\s._-]*[uưúùủũụứừửữự][\s._-]*c(\s*\.)?(?!\p{L})/giu, (match, prefix, trailingDot) => {
      const isAllUpper = match.toUpperCase() === match;
      const isFirstUpper = /^[^\p{L}]*[N]/u.test(match);
      const replacement = isAllUpper ? "NGỰC" : isFirstUpper ? "Ngực" : "ngực";
      return (prefix || "") + replacement + (trailingDot ? "." : "");
    });
};

/**
 * Loại bỏ các watermark nguồn/quảng cáo của TruyenFull (truyenfull, truyenfull.vn, v.v.)
 */
export const removeWatermarks = (text) => {
  if (!text) return "";
  let cleaned = text;

  // 1. Cụm câu dẫn kèm truyenfull (vd: Bạn đang đọc truyện tại truyenfull.vn, Nguồn: truyenfull.vn...)
  cleaned = cleaned.replace(
    /(?:\(|\[)?\s*(?:nguồn|nguon|theo|tại|tai|xem tại|đọc tại|doc tai|bạn đang đọc(?:\s+truyện)?(?:\s+(?:tại|trên|ở|được copy tại))?|đọc truyện(?: online)?(?:\s+(?:tại|trên|ở))?|được lấy từ|copy tại)?\s*:?\s*t[\s._-]*r[\s._-]*u[\s._-]*y[\s._-]*[eêệ][\s._-]*n[\s._-]*f[\s._-]*u[\s._-]*l[\s._-]*l(?:\s*[._\s-]*\s*(?:v[\s._-]*n|c[\s._-]*o[\s._-]*m|n[\s._-]*e[\s._-]*t))?\s*(?:\)|\])?/giu,
    ""
  );

  // 2. Từ truyenfull / truyenfull.vn / truyenfull vn
  cleaned = cleaned.replace(
    /(?:https?:\/\/)?(?:www\.)?t[\s._-]*r[\s._-]*u[\s._-]*y[\s._-]*[eêệ][\s._-]*n[\s._-]*f[\s._-]*u[\s._-]*l[\s._-]*l(?:\s*[._\s-]*\s*(?:v[\s._-]*n|c[\s._-]*o[\s._-]*m|n[\s._-]*e[\s._-]*t))?/giu,
    ""
  );

  return cleaned
    .replace(/\(\s*\)/g, "")
    .replace(/\[\s*\]/g, "")
    .replace(/\s{2,}/g, " ")
    .replace(/\s+([.,!?:;])/g, "$1")
    .trim();
};

/**
 * Chuẩn hóa và làm sạch văn bản trước khi gửi đến TTS API:
 * - Khử watermark truyenfull, truyenfull vn
 * - Ghép lại các từ bị chấm tách như c. h. ế. t
 * - Loại bỏ các loại dấu ngoặc kép (", “,”, «, »), nháy đơn (', ‘, ’) tránh làm ngưng hoặc lỗi API
 * - Tránh lỗi thẻ SSML/XML của Microsoft Edge TTS
 */
export const sanitizeTtsText = (rawText) => {
  if (!rawText) return "";
  const cleaned = removeWatermarks(rawText);
  const normalized = normalizeCensoredWords(cleaned);
  return normalized
    .replace(/["“”„‟«»'‘’]/g, " ")
    .replace(/[<>]/g, " ")
    .replace(/&/g, " và ")
    .replace(/[\r\n\t]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
};

export const hasSpokenWords = (text) => {
  return /[a-zA-Z0-9\p{L}]/u.test(text || "");
};

/**
 * Trình phát âm thanh truyện chữ đa luồng (Multi-worker Preload Queue)
 * - Tải trước toàn bộ chương truyện ngầm bằng 3 luồng song song vào RAM (Blob URL)
 * - Phát tức thì 0ms giữa các câu từ bộ nhớ đệm, hoàn toàn liền mạch không khựng
 * - Hiển thị tiến trình đệm trực quan (Bộ đệm: X/Y câu)
 * - Tự động phát ngay khi câu đang chờ nạp xong
 * - Cố định tốc độ đọc không bị reset
 */
const StoryVoicePlayer = forwardRef(
  (
    {
      sentences = [],
      chapterTitle = "",
      onTtsStateChange,
      hasNextChapter = false,
      autoPlayNext = false,
      onToggleAutoPlayNext,
      onNextChapter
    },
    ref
  ) => {
    // Mặc định chọn Giọng Nam AI Nam Minh
    const [selectedVoiceId, setSelectedVoiceId] = useState(() => {
      try {
        return localStorage.getItem("tecede_tts_voice_id") || "api_nam_minh";
      } catch {
        return "api_nam_minh";
      }
    });

    const [isPlaying, setIsPlaying] = useState(false);
    const [isPaused, setIsPaused] = useState(false);
    const [speed, setSpeed] = useState(() => {
      try {
        const saved = parseFloat(localStorage.getItem("tecede_tts_speed"));
        return !isNaN(saved) && saved >= 0.5 && saved <= 2.0 ? saved : 1.0;
      } catch {
        return 1.0;
      }
    });
    const [activeSentenceIndex, setActiveSentenceIndex] = useState(-1);
    const [showModal, setShowModal] = useState(false);
    const [scrollOutDirection, setScrollOutDirection] = useState(null); // null | 'up' | 'down'

    // Trạng thái đệm âm thanh
    const [bufferedCount, setBufferedCount] = useState(0);
    const [isWaitingBuffer, setIsWaitingBuffer] = useState(false);

    const currentIndexRef = useRef(-1);
    const isPlayingRef = useRef(false);
    const isPausedRef = useRef(false);
    const speedRef = useRef(speed);
    const selectedVoiceIdRef = useRef(selectedVoiceId);
    const sentencesRef = useRef([]);

    // HTML5 Audio instance duy nhất chạy xuyên suốt
    const audioRef = useRef(null);

    // Bộ nhớ đệm Blob Cache (Map: index -> { blobUrl, voiceId })
    const blobCacheRef = useRef(new Map());
    // AbortController để hủy các luồng tải khi chuyển chương hoặc đổi giọng
    const abortControllerRef = useRef(null);
    const queueActiveRef = useRef(false);
    const isWaitingBufferRef = useRef(false);
    const wasOutOfViewRef = useRef(false);

    const autoPlayNextRef = useRef(autoPlayNext);
    const hasNextChapterRef = useRef(hasNextChapter);
    const onNextChapterRef = useRef(onNextChapter);

    useEffect(() => {
      autoPlayNextRef.current = autoPlayNext;
    }, [autoPlayNext]);

    useEffect(() => {
      hasNextChapterRef.current = hasNextChapter;
    }, [hasNextChapter]);

    useEffect(() => {
      onNextChapterRef.current = onNextChapter;
    }, [onNextChapter]);

    // Utterance cho Web Speech API
    const utteranceRef = useRef(null);
    const browserVoicesRef = useRef([]);

    // Ref cho speakSentence
    const speakSentenceRef = useRef(null);

    // Đồng bộ sentencesRef
    useEffect(() => {
      sentencesRef.current = sentences;
    }, [sentences]);

    useEffect(() => {
      isPlayingRef.current = isPlaying;
    }, [isPlaying]);

    useEffect(() => {
      isPausedRef.current = isPaused;
      if (audioRef.current) {
        audioRef.current.defaultPlaybackRate = speed;
        audioRef.current.playbackRate = speed;
      }
    }, [isPaused, speed]);

    useEffect(() => {
      speedRef.current = speed;
      if (audioRef.current) {
        audioRef.current.defaultPlaybackRate = speed;
        audioRef.current.playbackRate = speed;
      }
      try {
        localStorage.setItem("tecede_tts_speed", String(speed));
      } catch {}
    }, [speed]);

    useEffect(() => {
      selectedVoiceIdRef.current = selectedVoiceId;
      if (selectedVoiceId) {
        try {
          localStorage.setItem("tecede_tts_voice_id", selectedVoiceId);
        } catch {}
      }
    }, [selectedVoiceId]);

    // Báo trạng thái ra component cha
    useEffect(() => {
      if (typeof onTtsStateChange === "function") {
        onTtsStateChange({
          activeSentenceIndex,
          isPlaying,
          isPaused,
          currentText:
            activeSentenceIndex >= 0 && sentences[activeSentenceIndex]
              ? sentences[activeSentenceIndex]
              : "",
          totalSentences: sentences.length
        });
      }
    }, [activeSentenceIndex, isPlaying, isPaused, sentences, onTtsStateChange]);

    // Danh sách tùy chọn giọng
    const voiceOptions = useMemo(
      () => [
        {
          id: "api_nam_minh",
          label: "👨 Giọng Nam AI (Nam Minh)",
          type: "api",
          voiceName: "vi-VN-NamMinhNeural"
        },
        {
          id: "api_hoai_my",
          label: "👩 Giọng Nữ AI (Hoài My)",
          type: "api",
          voiceName: "vi-VN-HoaiMyNeural"
        },
        {
          id: "browser_voice",
          label: "🌐 Giọng Trình Duyệt (Web Speech)",
          type: "browser",
          voiceName: "browser"
        }
      ],
      []
    );

    // Giải phóng toàn bộ Blob URL trong RAM
    const clearBlobCache = useCallback(() => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      queueActiveRef.current = false;
      blobCacheRef.current.forEach(({ blobUrl }) => {
        try {
          URL.revokeObjectURL(blobUrl);
        } catch {}
      });
      blobCacheRef.current.clear();
      setBufferedCount(0);
      isWaitingBufferRef.current = false;
      setIsWaitingBuffer(false);
    }, []);

    // 1. Quét giọng Web Speech API dự phòng và dọn dẹp âm thanh khi thoát trang
    useEffect(() => {
      if (typeof window === "undefined") return;

      const loadBrowserVoices = () => {
        if ("speechSynthesis" in window) {
          const all = window.speechSynthesis.getVoices() || [];
          browserVoicesRef.current = all.filter((v) => {
            const lang = (v.lang || "").toLowerCase();
            const name = (v.name || "").toLowerCase();
            return (
              lang.startsWith("vi") ||
              lang.includes("vietnam") ||
              name.includes("vietnam") ||
              name.includes("tiếng việt")
            );
          });
        }
      };

      loadBrowserVoices();
      if ("speechSynthesis" in window) {
        window.speechSynthesis.onvoiceschanged = loadBrowserVoices;
      }

      const stopAllOnLeave = () => {
        isPlayingRef.current = false;
        isPausedRef.current = false;
        currentIndexRef.current = -1;
        if (audioRef.current) {
          audioRef.current.pause();
          audioRef.current.removeAttribute("src");
        }
        if ("speechSynthesis" in window) {
          window.speechSynthesis.cancel();
        }
        clearBlobCache();
      };

      window.addEventListener("beforeunload", stopAllOnLeave);
      window.addEventListener("pagehide", stopAllOnLeave);

      return () => {
        stopAllOnLeave();
        window.removeEventListener("beforeunload", stopAllOnLeave);
        window.removeEventListener("pagehide", stopAllOnLeave);
      };
    }, [clearBlobCache]);

    // 2. Khởi tạo một HTMLAudioElement duy nhất chạy xuyên suốt
    useEffect(() => {
      if (typeof window === "undefined") return;

      const audio = new Audio();
      audio.preload = "auto";
      audio.defaultPlaybackRate = speedRef.current;
      audio.playbackRate = speedRef.current;
      audioRef.current = audio;

      // Cố định tốc độ đọc khi nạp src mới
      const applySpeed = () => {
        if (audio) {
          audio.defaultPlaybackRate = speedRef.current;
          audio.playbackRate = speedRef.current;
        }
      };

      audio.addEventListener("loadedmetadata", applySpeed);
      audio.addEventListener("canplay", applySpeed);
      audio.addEventListener("play", applySpeed);

      // Khi đọc xong 1 câu -> tự động chuyển sang câu tiếp theo
      const onEnded = () => {
        if (!isPlayingRef.current || isPausedRef.current) return;
        currentIndexRef.current++;
        setActiveSentenceIndex(currentIndexRef.current);
        if (typeof speakSentenceRef.current === "function") {
          speakSentenceRef.current();
        }
      };

      const onError = (e) => {
        if (!isPlayingRef.current || isPausedRef.current) return;
        if (!audio.src || audio.src === window.location.href) return;

        console.warn("Lỗi audio phát câu hiện tại:", audio.src);
        setTimeout(() => {
          if (isPlayingRef.current && !isPausedRef.current) {
            currentIndexRef.current++;
            setActiveSentenceIndex(currentIndexRef.current);
            if (typeof speakSentenceRef.current === "function") {
              speakSentenceRef.current();
            }
          }
        }, 300);
      };

      audio.addEventListener("ended", onEnded);
      audio.addEventListener("error", onError);

      return () => {
        audio.removeEventListener("loadedmetadata", applySpeed);
        audio.removeEventListener("canplay", applySpeed);
        audio.removeEventListener("play", applySpeed);
        audio.removeEventListener("ended", onEnded);
        audio.removeEventListener("error", onError);
        audio.pause();
        audio.removeAttribute("src");
      };
    }, []);

    // 3. Quản lý Hàng đợi tải ngầm toàn bộ chương (3 luồng tải song song)
    const startPreloadQueue = useCallback(
      (startFromIndex = 0, voiceName, voiceId) => {
        if (abortControllerRef.current) {
          abortControllerRef.current.abort();
        }
        const abortCtrl = new AbortController();
        abortControllerRef.current = abortCtrl;
        queueActiveRef.current = true;

        const list = sentencesRef.current;
        if (!list || list.length === 0) return;

        let nextIndexToLoad = startFromIndex;
        const CONCURRENT_WORKERS = 3;

        const runWorker = async () => {
          while (queueActiveRef.current && nextIndexToLoad < list.length) {
            const idx = nextIndexToLoad++;
            if (abortCtrl.signal.aborted) break;

            // Bỏ qua nếu đã tải rồi và khớp giọng
            const cached = blobCacheRef.current.get(idx);
            if (cached && cached.voiceId === voiceId) {
              continue;
            }

            const rawText = (list[idx] || "").trim();
            const text = sanitizeTtsText(rawText);

            // Bỏ qua nếu câu không có chữ cái/số nào để đọc (toàn dấu câu/dấu ngoặc kép)
            if (!text || !hasSpokenWords(text)) {
              blobCacheRef.current.set(idx, { blobUrl: null, voiceId, skip: true });
              continue;
            }

            try {
              const url = `https://tranvanhung203-edge-tts-api.hf.space/tts?text=${encodeURIComponent(
                text
              )}&voice=${encodeURIComponent(voiceName)}`;

              const res = await fetch(url, { signal: abortCtrl.signal });
              if (res.ok) {
                const blob = await res.blob();
                const blobUrl = URL.createObjectURL(blob);
                blobCacheRef.current.set(idx, { blobUrl, voiceId });
                setBufferedCount(blobCacheRef.current.size);

                // Nếu đây là câu người dùng đang chờ phát tức thì
                if (
                  currentIndexRef.current === idx &&
                  isPlayingRef.current &&
                  isWaitingBufferRef.current
                ) {
                  isWaitingBufferRef.current = false;
                  setIsWaitingBuffer(false);
                  if (typeof speakSentenceRef.current === "function") {
                    speakSentenceRef.current();
                  }
                }
              } else {
                // Nếu server báo lỗi (ví dụ 502), đánh dấu bỏ qua câu này để không bị đứng tiếng
                console.warn(`TTS API error ${res.status} chunk ${idx}, skipping.`);
                blobCacheRef.current.set(idx, { blobUrl: null, voiceId, skip: true });
                if (
                  currentIndexRef.current === idx &&
                  isPlayingRef.current &&
                  isWaitingBufferRef.current
                ) {
                  isWaitingBufferRef.current = false;
                  setIsWaitingBuffer(false);
                  currentIndexRef.current++;
                  setActiveSentenceIndex(currentIndexRef.current);
                  if (typeof speakSentenceRef.current === "function") {
                    speakSentenceRef.current();
                  }
                }
              }
            } catch (err) {
              if (err.name !== "AbortError") {
                console.warn(`Preload error chunk ${idx}:`, err);
                blobCacheRef.current.set(idx, { blobUrl: null, voiceId, skip: true });
              }
            }
          }
        };

        for (let i = 0; i < CONCURRENT_WORKERS; i++) {
          runWorker();
        }
      },
      []
    );

    // 4. Hàm cốt lõi phát từng câu
    const speakSentence = useCallback(() => {
      if (typeof window === "undefined") return;

      const currentList = sentencesRef.current;
      const curIdx = currentIndexRef.current;

      if (
        !isPlayingRef.current ||
        curIdx < 0 ||
        curIdx >= currentList.length
      ) {
        // Kiểm tra xem có phải vừa đọc xong câu cuối cùng của chương không
        const reachedEnd =
          isPlayingRef.current &&
          curIdx >= currentList.length &&
          currentList.length > 0;

        if (
          reachedEnd &&
          autoPlayNextRef.current &&
          hasNextChapterRef.current &&
          typeof onNextChapterRef.current === "function"
        ) {
          onNextChapterRef.current();
          return;
        }

        setIsPlaying(false);
        setIsPaused(false);
        isPlayingRef.current = false;
        isPausedRef.current = false;
        currentIndexRef.current = -1;
        setActiveSentenceIndex(-1);
        isWaitingBufferRef.current = false;
        setIsWaitingBuffer(false);
        if (audioRef.current) {
          audioRef.current.pause();
          audioRef.current.removeAttribute("src");
        }
        return;
      }

      const rawText = (currentList[curIdx] || "").trim();
      const currentText = sanitizeTtsText(rawText);

      // Nếu câu trống hoặc chỉ toàn dấu câu/dấu ngoặc kép -> tự động nhảy sang câu tiếp theo
      if (!currentText || !hasSpokenWords(currentText)) {
        currentIndexRef.current++;
        setActiveSentenceIndex(currentIndexRef.current);
        speakSentence();
        return;
      }

      // Nếu câu này đã được đánh dấu skip (ví dụ bị lỗi API) -> tự động lướt qua
      const cachedEntry = blobCacheRef.current.get(curIdx);
      if (cachedEntry && cachedEntry.skip) {
        currentIndexRef.current++;
        setActiveSentenceIndex(currentIndexRef.current);
        speakSentence();
        return;
      }

      const selectedOpt =
        voiceOptions.find((v) => v.id === selectedVoiceIdRef.current) ||
        voiceOptions[0];

      // ====== CÁCH 1: PHÁT BẰNG API NEURAL (Nam Minh / Hoài My) ======
      if (selectedOpt.type === "api") {
        const audio = audioRef.current;
        if (!audio) return;

        // Kiểm tra xem câu này đã có trong bộ đệm RAM chưa
        const cached = blobCacheRef.current.get(curIdx);

        if (cached && cached.voiceId === selectedOpt.id) {
          // ✅ ĐÃ TẢI SẴN: Phát tức thì 0ms không độ trễ!
          isWaitingBufferRef.current = false;
          setIsWaitingBuffer(false);

          audio.defaultPlaybackRate = speedRef.current;
          audio.src = cached.blobUrl;
          audio.playbackRate = speedRef.current;

          const playPromise = audio.play();
          if (playPromise !== undefined) {
            playPromise.catch((err) => {
              if (err.name !== "AbortError") {
                console.warn("Audio play error:", err);
              }
            });
          }
        } else {
          // ⏳ CHƯA TẢI XONG: Đặt cờ chờ buffer tải xong sẽ tự động phát
          isWaitingBufferRef.current = true;
          setIsWaitingBuffer(true);
          // Đảm bảo hàng đợi đang ưu tiên tải từ vị trí này
          startPreloadQueue(curIdx, selectedOpt.voiceName, selectedOpt.id);
        }
        return;
      }

      // ====== CÁCH 2: PHÁT BẰNG WEB SPEECH API TRÌNH DUYỆT (Offline) ======
      if ("speechSynthesis" in window) {
        try {
          window.speechSynthesis.cancel();
          const utterance = new SpeechSynthesisUtterance(currentText);
          utteranceRef.current = utterance;

          if (browserVoicesRef.current.length > 0) {
            utterance.voice = browserVoicesRef.current[0];
          }
          utterance.lang = "vi-VN";
          utterance.rate = speedRef.current;

          utterance.onend = () => {
            if (!isPlayingRef.current || isPausedRef.current) return;
            currentIndexRef.current++;
            setActiveSentenceIndex(currentIndexRef.current);
            speakSentence();
          };

          utterance.onerror = (e) => {
            if (
              e.error === "canceled" ||
              e.error === "interrupted" ||
              !isPlayingRef.current ||
              isPausedRef.current
            ) {
              isPlayingRef.current = false;
              return;
            }
            console.warn("SpeechSynthesis error:", e);
            currentIndexRef.current++;
            setActiveSentenceIndex(currentIndexRef.current);
            speakSentence();
          };

          window.speechSynthesis.speak(utterance);
        } catch (err) {
          console.error("Lỗi Web Speech:", err);
          setIsPlaying(false);
          setIsPaused(false);
        }
      }
    }, [voiceOptions, startPreloadQueue]);

    // Gán ref cho speakSentence
    useEffect(() => {
      speakSentenceRef.current = speakSentence;
    }, [speakSentence]);

    // Bắt đầu tải ngầm trước toàn bộ chương ngay khi trang truyện đã sẵn sàng
    useEffect(() => {
      const selectedOpt =
        voiceOptions.find((v) => v.id === selectedVoiceId) || voiceOptions[0];

      if (selectedOpt.type === "api" && sentences.length > 0) {
        clearBlobCache();
        startPreloadQueue(0, selectedOpt.voiceName, selectedOpt.id);
      }
    }, [chapterTitle, selectedVoiceId, sentences.length, voiceOptions, clearBlobCache, startPreloadQueue]);

    // 5. Quản lý cuộn màn hình & Khối nút quay lại:
    // - Chỉ căn giữa khi đoạn đọc đang XUẤT HIỆN trong khung màn hình
    // - Nếu đoạn đọc ở ngoài khung màn hình -> TUYỆT ĐỐI KHÔNG tự ý cuộn, chỉ hiện nút lên/xuống
    // - Khi user tự cuộn màn hình về tới đoạn đó -> Tự động căn giữa và ẩn nút
    useEffect(() => {
      if (!isPlaying || activeSentenceIndex < 0) {
        setScrollOutDirection(null);
        wasOutOfViewRef.current = false;
        return;
      }

      const checkAndHandleScroll = (isFromSentenceChange = false) => {
        const el = document.getElementById(`tts-sentence-${activeSentenceIndex}`);
        if (!el) {
          setScrollOutDirection(null);
          return;
        }

        const rect = el.getBoundingClientRect();
        const topThreshold = 75; // Header
        const bottomThreshold = window.innerHeight - 85; // Footer

        // Kiểm tra xem đoạn đang đọc có đang nằm trong khung màn hình hay không
        const isCurrentlyInView = rect.top < bottomThreshold && rect.bottom > topThreshold;

        if (isCurrentlyInView) {
          // Đoạn đọc ĐANG XUẤT HIỆN trong khung hình
          setScrollOutDirection(null);

          // Căn giữa nếu là câu mới hoặc vừa từ ngoài cuộn vào
          if (isFromSentenceChange || wasOutOfViewRef.current) {
            wasOutOfViewRef.current = false;
            el.scrollIntoView({ behavior: "smooth", block: "center" });
          }
        } else {
          // Đoạn đọc KHÔNG NẰM trong khung hình -> ĐỪNG CUỘN! Chỉ hiện nút quay về
          wasOutOfViewRef.current = true;
          if (rect.bottom < topThreshold) {
            // Đang đọc ở phía TRÊN (user đã cuộn xuống dưới)
            setScrollOutDirection("up");
          } else {
            // Đang đọc ở phía DƯỚI (user đang ở phía trên)
            setScrollOutDirection("down");
          }
        }
      };

      // Khi chuyển câu mới
      checkAndHandleScroll(true);

      // Khi user cuộn màn hình
      const onWindowScroll = () => {
        checkAndHandleScroll(false);
      };

      window.addEventListener("scroll", onWindowScroll, { passive: true });
      return () => window.removeEventListener("scroll", onWindowScroll);
    }, [isPlaying, activeSentenceIndex]);

    // Cuộn về câu đang đọc khi user chủ động bấm nút nổi
    const handleScrollToActive = () => {
      const el = document.getElementById(`tts-sentence-${activeSentenceIndex}`);
      if (el) {
        wasOutOfViewRef.current = false;
        el.scrollIntoView({ behavior: "smooth", block: "center" });
        setTimeout(() => setScrollOutDirection(null), 350);
      }
    };

    // Bắt đầu nghe
    const handleStart = () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }

      if (!sentences || sentences.length === 0) {
        alert("Chưa có nội dung chương chữ để đọc.");
        return;
      }

      const startIndex = activeSentenceIndex >= 0 ? activeSentenceIndex : 0;
      currentIndexRef.current = startIndex;
      setActiveSentenceIndex(startIndex);

      isPlayingRef.current = true;
      isPausedRef.current = false;
      setIsPlaying(true);
      setIsPaused(false);

      const selectedOpt =
        voiceOptions.find((v) => v.id === selectedVoiceIdRef.current) ||
        voiceOptions[0];

      // Đảm bảo hàng đợi nạp từ vị trí này trở đi
      if (selectedOpt.type === "api") {
        startPreloadQueue(startIndex, selectedOpt.voiceName, selectedOpt.id);
      }

      speakSentence();
    };

    // Tạm dừng / Tiếp tục
    const handlePauseToggle = () => {
      if (isPaused) {
        setIsPaused(false);
        isPausedRef.current = false;
        const selectedOpt =
          voiceOptions.find((v) => v.id === selectedVoiceIdRef.current) ||
          voiceOptions[0];

        if (selectedOpt.type === "api") {
          if (audioRef.current && audioRef.current.src) {
            audioRef.current.defaultPlaybackRate = speedRef.current;
            audioRef.current.playbackRate = speedRef.current;
            audioRef.current.play().catch((err) => {
              console.warn("Resume audio play catch:", err);
              speakSentence();
            });
          } else {
            speakSentence();
          }
        } else if ("speechSynthesis" in window) {
          window.speechSynthesis.resume();
          if (!window.speechSynthesis.speaking) {
            speakSentence();
          }
        }
      } else {
        setIsPaused(true);
        isPausedRef.current = true;
        if (audioRef.current) {
          audioRef.current.pause();
        }
        if ("speechSynthesis" in window) {
          window.speechSynthesis.pause();
        }
      }
    };

    // Dừng hẳn
    const handleStop = () => {
      isPlayingRef.current = false;
      isPausedRef.current = false;
      currentIndexRef.current = -1;
      isWaitingBufferRef.current = false;
      setIsWaitingBuffer(false);

      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.removeAttribute("src");
      }
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
      setIsPlaying(false);
      setIsPaused(false);
      setActiveSentenceIndex(-1);
      setScrollOutDirection(null);
    };

    // Đổi giọng đọc
    const handleVoiceChange = (e) => {
      const newId = e.target.value;
      setSelectedVoiceId(newId);
      selectedVoiceIdRef.current = newId;

      clearBlobCache();

      if (isPlaying && !isPaused) {
        if (audioRef.current) {
          audioRef.current.pause();
          audioRef.current.removeAttribute("src");
        }
        if (typeof window !== "undefined" && "speechSynthesis" in window) {
          window.speechSynthesis.cancel();
        }
        const opt = voiceOptions.find((v) => v.id === newId) || voiceOptions[0];
        if (opt.type === "api") {
          startPreloadQueue(currentIndexRef.current >= 0 ? currentIndexRef.current : 0, opt.voiceName, opt.id);
        }
        speakSentence();
      }
    };

    // Đổi tốc độ đọc
    const handleSpeedChange = (newSpeed) => {
      const val = parseFloat(newSpeed);
      setSpeed(val);
      speedRef.current = val;
      if (audioRef.current) {
        audioRef.current.defaultPlaybackRate = val;
        audioRef.current.playbackRate = val;
      }
      if (isPlaying && !isPaused && selectedVoiceId.startsWith("browser")) {
        window.speechSynthesis.cancel();
        speakSentence();
      }
    };

    // Nhảy tới câu cụ thể
    const jumpToSentence = (index) => {
      if (index < 0 || index >= sentences.length) return;
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.removeAttribute("src");
      }
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
      currentIndexRef.current = index;
      setActiveSentenceIndex(index);
      isPlayingRef.current = true;
      isPausedRef.current = false;
      setIsPlaying(true);
      setIsPaused(false);

      const selectedOpt =
        voiceOptions.find((v) => v.id === selectedVoiceIdRef.current) ||
        voiceOptions[0];
      if (selectedOpt.type === "api") {
        startPreloadQueue(index, selectedOpt.voiceName, selectedOpt.id);
      }

      speakSentence();
    };

    useImperativeHandle(ref, () => ({
      jumpToSentence,
      handleStop,
      handleStart,
      handlePauseToggle,
      start: (idx = 0) => {
        jumpToSentence(idx);
      },
      stop: handleStop
    }));

    const total = sentences.length;
    const progressPercent =
      total > 0 && activeSentenceIndex >= 0
        ? Math.min(100, Math.round(((activeSentenceIndex + 1) / total) * 100))
        : 0;

    const bufferPercent =
      total > 0 ? Math.min(100, Math.round((bufferedCount / total) * 100)) : 0;

    const currentSentencePreview =
      activeSentenceIndex >= 0 && sentences[activeSentenceIndex]
        ? sentences[activeSentenceIndex]
        : "";

    return (
      <>
        {/* ================= KHỐI GỌN NẰM CÙNG DÒNG TÊN CHƯƠNG ================= */}
        <div className="tecede-tts-compact">
          {/* Nút Play / Pause / Loading */}
          {!isPlaying ? (
            <button
              type="button"
              onClick={handleStart}
              className="tts-compact-btn tts-compact-btn-play"
              title="Nghe đọc chương này"
            >
              <FaPlay className="btn-icon" />
              <span className="btn-label">Nghe</span>
            </button>
          ) : isWaitingBuffer ? (
            <button
              type="button"
              className="tts-compact-btn tts-compact-btn-loading"
              title="Đang nạp âm thanh câu hiện tại..."
              disabled
            >
              <FaSpinner className="btn-icon fa-spin" />
              <span className="btn-label">Đang nạp...</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={handlePauseToggle}
              className={`tts-compact-btn ${
                isPaused ? "tts-compact-btn-resume" : "tts-compact-btn-pause"
              }`}
              title={isPaused ? "Tiếp tục đọc" : "Tạm dừng"}
            >
              {isPaused ? (
                <>
                  <FaPlay className="btn-icon" />
                  <span className="btn-label">Tiếp tục</span>
                </>
              ) : (
                <>
                  <FaPause className="btn-icon" />
                  <span className="btn-label">Tạm dừng</span>
                </>
              )}
            </button>
          )}

          {/* Dropdown chọn giọng: Giọng Nam AI, Giọng Nữ AI và Giọng máy */}
          <div className="tts-compact-voice-wrap">
            <select
              value={selectedVoiceId}
              onChange={handleVoiceChange}
              className="tts-compact-voice-select"
              title="Chọn giọng đọc truyện"
              aria-label="Chọn giọng đọc"
            >
              {voiceOptions.map((opt) => (
                <option key={opt.id} value={opt.id}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* Nút 3 chấm mở modal chi tiết */}
          <button
            type="button"
            onClick={() => setShowModal(true)}
            className={`tts-compact-more-btn ${showModal ? "active" : ""}`}
            title="Cài đặt tốc độ và tùy chọn đọc"
            aria-label="Tùy chọn đọc audio"
          >
            <FaEllipsisV />
          </button>
        </div>

        {/* ================= MODAL CÀI ĐẶT TỐC ĐỘ VÀ TÙY CHỌN ================= */}
        {showModal && (
          <div
            className="tts-modal-overlay"
            onClick={() => setShowModal(false)}
          >
            <div
              className="tts-modal-dialog"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="tts-modal-header">
                <div className="tts-modal-title">
                  <FaHeadphones className="text-primary me-2" />
                  <span>Cài đặt Audio</span>
                </div>
                <button
                  type="button"
                  className="tts-modal-close"
                  onClick={() => setShowModal(false)}
                  title="Đóng"
                >
                  <FaTimes />
                </button>
              </div>

              <div className="tts-modal-body">
                {/* Tốc độ đọc */}
                <div className="tts-modal-setting mb-4">
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <span className="setting-label">
                      <FaSlidersH className="me-1 small" /> Tốc độ đọc:
                    </span>
                    <span className="setting-badge-speed">{speed}x</span>
                  </div>

                  <input
                    type="range"
                    min="0.6"
                    max="1.8"
                    step="0.1"
                    value={speed}
                    onChange={(e) => handleSpeedChange(e.target.value)}
                    className="tts-speed-slider w-100"
                  />

                  {/* Nút mốc tốc độ nhanh */}
                  <div className="tts-speed-quick-buttons mt-2">
                    {[0.8, 1.0, 1.2, 1.5].map((val) => (
                      <button
                        key={val}
                        type="button"
                        className={`speed-pill ${speed === val ? "active" : ""}`}
                        onClick={() => handleSpeedChange(val)}
                      >
                        {val}x
                      </button>
                    ))}
                  </div>
                </div>

                {/* Tự động đọc tiếp chương sau */}
                <div className="tts-modal-setting mb-4 pb-3 border-bottom border-secondary border-opacity-25">
                  <label className="tts-switch-label">
                    <span className="d-flex align-items-center gap-2">
                      <FaStepForward className="text-primary small" />
                      <span>Tự động đọc tiếp chương sau</span>
                    </span>
                    <input
                      type="checkbox"
                      checked={autoPlayNext}
                      onChange={(e) => onToggleAutoPlayNext?.(e.target.checked)}
                      className="tts-switch-input"
                    />
                  </label>
                  <div
                    className="small text-secondary mt-1"
                    style={{ fontSize: "11.5px" }}
                  >
                    {hasNextChapter
                      ? "Tải ngầm chương kế tiếp và tự động phát liên tục cho đến hết truyện."
                      : "Hiện đang ở chương cuối cùng của bộ truyện này."}
                  </div>
                </div>

                {/* Trạng thái bộ đệm RAM */}
                {total > 0 && (
                  <div className="tts-modal-setting mb-3">
                    <div className="d-flex justify-content-between small text-secondary mb-1">
                      <span>Bộ đệm tải trước:</span>
                      <span className="text-success fw-bold">
                        {bufferedCount} / {total} câu ({bufferPercent}%)
                      </span>
                    </div>
                    <div className="progress-bar-track">
                      <div
                        className="progress-bar-bar bg-success"
                        style={{ width: `${bufferPercent}%`, transition: "width 0.4s ease" }}
                      />
                    </div>
                  </div>
                )}

                {/* Tiến trình đọc hiện tại */}
                {total > 0 && (
                  <div className="tts-modal-progress mb-3">
                    <div className="d-flex justify-content-between small text-secondary mb-1">
                      <span>Tiến trình đang đọc:</span>
                      <span>
                        {activeSentenceIndex >= 0 ? activeSentenceIndex + 1 : 0} /{" "}
                        {total} câu ({progressPercent}%)
                      </span>
                    </div>
                    <div className="progress-bar-track">
                      <div
                        className="progress-bar-bar"
                        style={{ width: `${progressPercent}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Nút dừng hẳn */}
                {isPlaying && (
                  <button
                    type="button"
                    onClick={() => {
                      handleStop();
                      setShowModal(false);
                    }}
                    className="tts-btn-modal-stop w-100"
                  >
                    <FaStop className="me-2" /> Dừng đọc hoàn toàn
                  </button>
                )}

                {/* Gợi ý nghe kèm nhạc nền không lời */}
                <div className="tts-modal-bgm-note mt-3 pt-2 text-center">
                  <p className="fst-italic small mb-0">
                    💡 <em>Gợi ý:</em> Vào{" "}
                    <Link
                      to="/music/mood"
                      onClick={() => setShowModal(false)}
                      className="text-decoration-underline"
                    >
                      trang nhạc không lời
                    </Link>{" "}
                    chọn 1 bài hát mà bạn thích và bật chế độ phát lặp để tận hưởng audio tốt hơn.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ================= KHỐI NỔI: QUAY VỀ ĐOẠN ĐANG ĐỌC KHI CUỘN ĐI XA ================= */}
        {isPlaying && scrollOutDirection && (
          <div
            className="tts-floating-return"
            onClick={handleScrollToActive}
            role="button"
            tabIndex={0}
            title="Bấm để cuộn màn hình về đoạn đang đọc"
          >
            <div className="tts-floating-info">
              <span className="tts-wave-dot" />
              <span className="tts-floating-text text-truncate">
                {currentSentencePreview
                  ? `"${currentSentencePreview}"`
                  : "Đang phát âm thanh..."}
              </span>
            </div>

            <button type="button" className="tts-floating-btn">
              {scrollOutDirection === "up" ? (
                <>
                  <FaArrowUp /> <span>Cuộn lên đoạn đọc</span>
                </>
              ) : (
                <>
                  <FaArrowDown /> <span>Cuộn xuống đoạn đọc</span>
                </>
              )}
            </button>
          </div>
        )}
      </>
    );
  }
);

export default StoryVoicePlayer;
