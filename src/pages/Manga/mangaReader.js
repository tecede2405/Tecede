import { useEffect, useState, useMemo, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  FaArrowLeft,
  FaHome,
  FaChevronLeft,
  FaChevronRight,
  FaArrowUp,
  FaFont,
  FaExclamationTriangle,
  FaInfoCircle
} from "react-icons/fa";
import { fetchChapter, fetchStoryDetail, getCoverUrl } from "../../utils/truyenApi";
import StoryVoicePlayer, { normalizeCensoredWords, removeWatermarks } from "./StoryVoicePlayer";
import "./style.scss";

export default function ComicReader() {
  const { storySlug, chapterSlug, id } = useParams();
  const navigate = useNavigate();

  const chapterCacheRef = useRef(new Map());
  const shouldAutoPlayNextRef = useRef(false);
  const ttsPlayerRef = useRef(null);

  // Dừng phát mọi âm thanh TTS ngay khi rời hẳn khỏi trang đọc truyện (/truyen/doc)
  useEffect(() => {
    return () => {
      shouldAutoPlayNextRef.current = false;
      // eslint-disable-next-line react-hooks/exhaustive-deps
      const player = ttsPlayerRef.current;
      if (player?.stop) {
        player.stop();
      }
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // Nếu chuyển sang bộ truyện khác, dừng phát truyện cũ
  useEffect(() => {
    shouldAutoPlayNextRef.current = false;
    if (ttsPlayerRef.current?.stop) {
      ttsPlayerRef.current.stop();
    }
  }, [storySlug, id]);

  // Giải mã slug truyện và slug chương từ URL params một cách an toàn và chính xác
  const { resolvedStorySlug, resolvedChapterSlug } = useMemo(() => {
    if (storySlug && chapterSlug) {
      return { resolvedStorySlug: storySlug, resolvedChapterSlug: chapterSlug };
    }
    if (storySlug) {
      return { resolvedStorySlug: storySlug, resolvedChapterSlug: "" };
    }
    if (id) {
      // Hỗ trợ link cũ dạng compound (vd: storySlug-chap-1 hoặc storySlug-chuong-1)
      const chapMatch = id.match(/^(.*?)-(chap(?:ter)?|chuong)-(.+)$/i);
      if (chapMatch) {
        return {
          resolvedStorySlug: chapMatch[1],
          resolvedChapterSlug: `${chapMatch[2]}-${chapMatch[3]}`
        };
      }
      return { resolvedStorySlug: id, resolvedChapterSlug: "" };
    }
    return { resolvedStorySlug: "", resolvedChapterSlug: "" };
  }, [storySlug, chapterSlug, id]);

  const [story, setStory] = useState(null);
  const [chapter, setChapter] = useState(null);
  const [allChapters, setAllChapters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  // Tùy chỉnh chế độ đọc truyện chữ (Novel)
  const [fontSize, setFontSize] = useState(() => {
    try {
      return Number(localStorage.getItem("novel_fontSize")) || 18;
    } catch {
      return 18;
    }
  });
  const [themeMode, setThemeMode] = useState(() => {
    try {
      return localStorage.getItem("novel_themeMode") || "dark";
    } catch {
      return "dark";
    }
  });
  const [fontFamily, setFontFamily] = useState(() => {
    try {
      return localStorage.getItem("novel_fontFamily") || "sans";
    } catch {
      return "sans";
    }
  });
  const [showSettings, setShowSettings] = useState(false);

  // Tùy chọn tự động đọc tiếp chương sau (Đọc liên tục)
  const [autoPlayNext, setAutoPlayNext] = useState(() => {
    try {
      return localStorage.getItem("tecede_tts_autoplay_next") === "true";
    } catch {
      return false;
    }
  });

  const handleToggleAutoPlayNext = (val) => {
    setAutoPlayNext(val);
    try {
      localStorage.setItem("tecede_tts_autoplay_next", String(val));
    } catch {}
  };

  const handleSelectTheme = (mode) => {
    setThemeMode(mode);
    try {
      localStorage.setItem("novel_themeMode", mode);
    } catch (e) {}
  };

  const handleSelectFontSize = (setter) => {
    setFontSize((prev) => {
      const next = typeof setter === "function" ? setter(prev) : setter;
      try {
        localStorage.setItem("novel_fontSize", next);
      } catch (e) {}
      return next;
    });
  };

  const handleSelectFontFamily = (fam) => {
    setFontFamily(fam);
    try {
      localStorage.setItem("novel_fontFamily", fam);
    } catch (e) {}
  };

  const storyCoverUrl = useMemo(() => {
    const raw =
      story?.cover ||
      story?.thumb_url ||
      chapter?.story?.cover ||
      chapter?.story?.thumb_url;
    return raw ? getCoverUrl(raw) : "";
  }, [story, chapter]);

  const topRef = useRef(null);

  // 0. Điều hướng nếu truy cập /truyen/doc mà không có slug
  useEffect(() => {
    if (!resolvedStorySlug) {
      try {
        const history = JSON.parse(localStorage.getItem("readingHistory")) || [];
        if (history.length > 0 && history[0]?.slug) {
          const last = history[0];
          navigate(`/truyen/doc/${last.slug}/${last.chapterSlug || last.chapterId || ""}`, { replace: true });
          return;
        }
      } catch (e) {}
      navigate("/truyen", { replace: true });
    }
  }, [resolvedStorySlug, navigate]);

  // 1. Tải danh sách tất cả các chương của bộ truyện để làm dropdown và prev/next
  useEffect(() => {
    if (!resolvedStorySlug) return;
    let isMounted = true;

    fetchStoryDetail(resolvedStorySlug)
      .then((data) => {
        if (!isMounted || !data) return;
        setStory(data);
        if (Array.isArray(data.chapters) && data.chapters.length > 0) {
          // Sắp xếp theo số chương tăng dần: Chương 1, Chương 2...
          const sorted = [...data.chapters].sort((a, b) => {
            const numA = parseFloat(a.num);
            const numB = parseFloat(b.num);
            if (!isNaN(numA) && !isNaN(numB)) return numA - numB;
            return (a.title || a.slug || "").localeCompare(b.title || b.slug || "", undefined, { numeric: true });
          });
          setAllChapters(sorted);
        }
      })
      .catch((err) => {
        console.error("Lỗi lấy chi tiết truyện:", err);
      });

    return () => {
      isMounted = false;
    };
  }, [resolvedStorySlug]);

  // 2. Tải nội dung chương hiện tại
  useEffect(() => {
    if (!resolvedStorySlug) return;

    let targetChapterSlug = resolvedChapterSlug;

    // Nếu allChapters đã có, giải quyết targetChapterSlug nếu chưa có hoặc khớp số
    if (allChapters.length > 0) {
      if (!targetChapterSlug) {
        // Chưa có chapterSlug, chọn chương đầu tiên
        targetChapterSlug = allChapters[0].slug;
      } else {
        // Khớp chương: theo slug chính xác, theo num, hoặc slug kết thúc bằng targetChapterSlug
        const matched = allChapters.find(
          (c) =>
            c.slug === targetChapterSlug ||
            String(c.num) === targetChapterSlug ||
            c.slug.endsWith(`-${targetChapterSlug}`) ||
            c.slug.endsWith(targetChapterSlug)
        );
        if (matched) {
          targetChapterSlug = matched.slug;
        }
      }
    }

    if (!targetChapterSlug) return;

    const cacheKey = `${resolvedStorySlug}/${targetChapterSlug}`;
    if (chapterCacheRef.current.has(cacheKey)) {
      const cached = chapterCacheRef.current.get(cacheKey);
      setChapter(cached.chapter);
      if (cached.story) setStory((prev) => prev || cached.story);
      setLoading(false);
      setErrorMsg("");
      return;
    }

    setLoading(true);
    setErrorMsg("");

    let isMounted = true;

    fetchChapter(resolvedStorySlug, targetChapterSlug)
      .then((res) => {
        if (!isMounted) return;
        if (!res || !res.chapter) {
          setErrorMsg("Không tìm thấy nội dung chương hoặc chương đang được cập nhật.");
          return;
        }
        chapterCacheRef.current.set(cacheKey, res);
        setChapter(res.chapter);

        // Đồng bộ dữ liệu truyện nếu story chưa có
        if (res.story) {
          setStory((prev) => prev || res.story);
          // Dự phòng nếu allChapters rỗng
          setAllChapters((prev) => {
            if (prev.length === 0) {
              if (Array.isArray(res.story.chapters) && res.story.chapters.length > 0) {
                return [...res.story.chapters].sort((a, b) => {
                  const numA = parseFloat(a.num);
                  const numB = parseFloat(b.num);
                  if (!isNaN(numA) && !isNaN(numB)) return numA - numB;
                  return (a.title || a.slug || "").localeCompare(b.title || b.slug || "", undefined, { numeric: true });
                });
              }
              return [res.chapter];
            }
            return prev;
          });
        }
      })
      .catch((err) => {
        if (!isMounted) return;
        console.error("Lỗi tải chương:", err);
        setErrorMsg("Có lỗi xảy ra khi tải chương truyện.");
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [resolvedStorySlug, resolvedChapterSlug, allChapters]);

  // Cuộn lên đầu khi chương thay đổi
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [chapter]);

  // 3. Lưu lịch sử đọc vào localStorage
  useEffect(() => {
    if (!chapter || !resolvedStorySlug) return;

    try {
      const history = JSON.parse(localStorage.getItem("readingHistory")) || [];
      const storyTitle = story?.title || story?.name || "Truyện";
      const cover = getCoverUrl(story?.cover || story?.thumb_url);

      const newItem = {
        slug: resolvedStorySlug,
        comicName: storyTitle,
        chapter: chapter.num || "",
        chapterText: chapter.numberText || chapter.title || (chapter.num !== undefined ? `Chương ${chapter.num}` : "Đang đọc"),
        chapterSlug: chapter.slug || resolvedChapterSlug,
        chapterId: chapter.slug || resolvedChapterSlug,
        thumb: cover,
        time: Date.now()
      };

      const filtered = history.filter((item) => item.slug !== resolvedStorySlug);
      const updatedHistory = [newItem, ...filtered].slice(0, 25);

      localStorage.setItem("readingHistory", JSON.stringify(updatedHistory));
    } catch (e) {
      console.warn("Lỗi lưu lịch sử đọc:", e);
    }
  }, [chapter, story, resolvedStorySlug, resolvedChapterSlug]);

  // 4. Tìm vị trí chương trước và chương sau
  const { prevChapter, nextChapter, currentIndex } = useMemo(() => {
    if (!allChapters.length || !chapter) {
      return { prevChapter: null, nextChapter: null, currentIndex: -1 };
    }
    let idx = allChapters.findIndex(
      (c) =>
        c.slug === chapter.slug ||
        String(c.id) === String(chapter.id) ||
        (chapter.num !== undefined && String(c.num) === String(chapter.num))
    );
    if (idx === -1 && chapter.slug) {
      idx = allChapters.findIndex((c) => c.slug && (chapter.slug.endsWith(c.slug) || c.slug.endsWith(chapter.slug)));
    }

    const prev = idx > 0 ? allChapters[idx - 1] : null;
    const next = idx >= 0 && idx < allChapters.length - 1 ? allChapters[idx + 1] : null;
    return { prevChapter: prev, nextChapter: next, currentIndex: idx };
  }, [allChapters, chapter]);

  const goToChapter = useCallback(
    (targetChap) => {
      if (!targetChap || !targetChap.slug) return;
      window.scrollTo({ top: 0, behavior: "smooth" });
      navigate(`/truyen/doc/${resolvedStorySlug}/${targetChap.slug}`);
    },
    [navigate, resolvedStorySlug]
  );

  // Điều hướng bằng phím mũi tên Trái / Phải
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (["INPUT", "TEXTAREA", "SELECT"].includes(e.target?.tagName)) return;
      if (e.key === "ArrowLeft" && prevChapter) {
        goToChapter(prevChapter);
      } else if (e.key === "ArrowRight" && nextChapter) {
        goToChapter(nextChapter);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [prevChapter, nextChapter, goToChapter]);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Xác định chế độ đọc chính xác dựa trên dữ liệu chương thực tế
  const hasPages = Array.isArray(chapter?.pages) && chapter.pages.length > 0;
  const hasText = Boolean(chapter?.bodyHtml || chapter?.bodyText);

  // Ưu tiên ảnh tuyệt đối: Nếu có mảng ảnh pages -> Chế độ đọc tranh (Manga)
  // Chỉ dùng chế độ truyện chữ (Novel) nếu KHÔNG CÓ ẢNH VÀ (có text body HOẶC mediaType === "text" HOẶC story.type === "novel" và không phải mediaType "image")
  const isNovel = !hasPages && (hasText || chapter?.mediaType === "text" || (story?.type === "novel" && chapter?.mediaType !== "image"));

  const chapterName = chapter?.numberText || chapter?.title || (chapter?.num !== undefined ? `Chương ${chapter.num}` : "Đang đọc");
  const storyName = story?.title || story?.name || "Kho Truyện";

  // Quản lý trạng thái đọc Audio TTS
  const [ttsState, setTtsState] = useState({
    activeSentenceIndex: -1,
    isPlaying: false
  });

  // Tải ngầm nội dung chương tiếp theo khi bật tính năng đọc liên tục
  useEffect(() => {
    if (!autoPlayNext || !nextChapter || !resolvedStorySlug) return;
    const nextKey = `${resolvedStorySlug}/${nextChapter.slug}`;
    if (chapterCacheRef.current.has(nextKey)) return;

    fetchChapter(resolvedStorySlug, nextChapter.slug)
      .then((res) => {
        if (res && res.chapter) {
          chapterCacheRef.current.set(nextKey, res);
        }
      })
      .catch((err) => {
        console.warn("Lỗi tải ngầm chương kế tiếp:", err);
      });
  }, [autoPlayNext, nextChapter, resolvedStorySlug, ttsState.isPlaying]);

  // Hàm chuyển chương tự động khi đọc hết câu cuối
  const handleAutoPlayNextChapter = useCallback(() => {
    if (!nextChapter) {
      alert("Đã đọc xong toàn bộ các chương của bộ truyện!");
      return;
    }
    shouldAutoPlayNextRef.current = true;
    goToChapter(nextChapter);
  }, [nextChapter, goToChapter]);

  // Phân tách nội dung truyện chữ thành đoạn văn và từng câu có index duy nhất để highlight & auto-scroll
  const parsedNovel = useMemo(() => {
    if (!isNovel) return { paragraphs: [], allSentences: [] };
    const raw = chapter?.bodyHtml || chapter?.bodyText || "";
    if (!raw) return { paragraphs: [], allSentences: [] };

    const isHtml = typeof raw === "string" && /<[a-z][\s\S]*>/i.test(raw);
    let rawParagraphs = [];

    if (isHtml) {
      try {
        const parser = new DOMParser();
        const doc = parser.parseFromString(raw, "text/html");
        const blockEls = doc.querySelectorAll("p, div, li, h1, h2, h3, h4, h5, h6");
        if (blockEls.length > 0) {
          blockEls.forEach((el) => {
            const t = (el.textContent || el.innerText || "").trim();
            if (t) rawParagraphs.push(t);
          });
        } else {
          const text = doc.body.textContent || doc.body.innerText || "";
          rawParagraphs = text.split("\n").map((s) => s.trim()).filter(Boolean);
        }
      } catch {
        rawParagraphs = raw.replace(/<[^>]+>/g, "\n").split("\n").map((s) => s.trim()).filter(Boolean);
      }
    } else {
      rawParagraphs = raw.split("\n").map((s) => s.trim()).filter(Boolean);
    }

    let globalIndex = 0;
    const allSentences = [];
    const paragraphs = rawParagraphs
      .map((rawPText) => {
        // 1. Loại bỏ các watermark nguồn như truyenfull, truyenfull vn
        const cleanedWatermarks = removeWatermarks(rawPText);
        if (!cleanedWatermarks) return null;

        // 2. Khử các từ bị chấm tách lách kiểm duyệt (ví dụ: c. h. ế. t -> chết) để tránh cắt vụn câu
        const pText = normalizeCensoredWords(cleanedWatermarks);
        if (!pText) return null;

        const matches = pText.match(/[^.!?\n]+[.!?\n]?/g) || [pText];
        const sentenceObjs = [];
        matches.forEach((sentenceText) => {
          const trimmed = sentenceText.trim();
          if (!trimmed) return;

          // Kiểm tra xem đoạn này có chứa từ ngữ đọc được không (chữ cái hoặc số)
          const hasWords = /[a-zA-Z0-9\p{L}]/u.test(trimmed);

          if (!hasWords) {
            // Nếu đoạn này chỉ toàn là dấu ngoặc kép, nháy đơn, gạch nối, dấu chấm (vd: '"', '“', '”', '...')
            // thì gộp luôn vào câu trước đó để không tạo câu rỗng làm khựng / ngưng TTS
            if (sentenceObjs.length > 0) {
              const lastObj = sentenceObjs[sentenceObjs.length - 1];
              lastObj.text += sentenceText;
              allSentences[allSentences.length - 1] += " " + trimmed;
            }
            return;
          }

          const idx = globalIndex++;
          allSentences.push(trimmed);
          sentenceObjs.push({
            index: idx,
            text: sentenceText
          });
        });
        return sentenceObjs;
      })
      .filter((p) => p && p.length > 0);

    return { paragraphs, allSentences };
  }, [isNovel, chapter?.bodyHtml, chapter?.bodyText]);

  // Tự động phát âm thanh khi chương mới nạp xong nếu đang ở chế độ đọc liên tục
  useEffect(() => {
    if (shouldAutoPlayNextRef.current && isNovel && parsedNovel.allSentences.length > 0) {
      shouldAutoPlayNextRef.current = false;
      const timer = setTimeout(() => {
        if (ttsPlayerRef.current?.start) {
          ttsPlayerRef.current.start(0);
        }
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [chapter?.slug, isNovel, parsedNovel.allSentences.length]);

  return (
    <div
      className={`tecReader theme-${themeMode} ${isNovel ? "novel-reader-mode" : "manga-reader-mode"}`}
      style={
        themeMode === "image" && storyCoverUrl
          ? { "--novel-bg-cover": `url("${storyCoverUrl}")` }
          : {}
      }
      ref={topRef}
    >
      {/* 🧭 HEADER ĐIỀU KHIỂN */}
      <div className="tecReaderHeader">
        <div className="readerLeft d-flex align-items-center gap-2">
          <button
            className="reader-btn-icon"
            onClick={() => navigate(`/truyen/chi-tiet/${resolvedStorySlug}`)}
            title="Quay lại chi tiết truyện"
          >
            <FaArrowLeft />
          </button>
          <button
            className="reader-btn-icon d-none d-md-flex"
            onClick={() => {
              try {
                const lastListUrl = sessionStorage.getItem("lastMangaListUrl");
                if (
                  lastListUrl &&
                  !lastListUrl.includes("/chi-tiet/") &&
                  !lastListUrl.includes("/doc/")
                ) {
                  navigate(lastListUrl);
                  return;
                }
              } catch (e) {}
              navigate("/truyen");
            }}
            title="Về danh sách truyện"
          >
            <FaHome />
          </button>
        </div>

        <div className="readerTitle">
          <h4 className="text-truncate" title={storyName}>
            {storyName}
          </h4>
          <span className="text-truncate">{chapterName}</span>
        </div>

        <div className="readerRight d-flex align-items-center gap-2">
          {/* Menu chọn chương nhanh */}
          {allChapters.length > 0 && (
            <div className="reader-chapter-dropdown">
              <select
                value={chapter?.slug || resolvedChapterSlug || ""}
                onChange={(e) => {
                  const target = allChapters.find((c) => c.slug === e.target.value);
                  if (target) goToChapter(target);
                }}
                className="chapter-select"
                aria-label="Chọn chương"
              >
                {allChapters.map((c, i) => (
                  <option key={c.id || c.slug || i} value={c.slug}>
                    {c.numberText || c.title || `Chương ${c.num}`}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Nút cài đặt cho truyện chữ */}
          {isNovel && (
            <button
              className={`reader-btn-icon ${showSettings ? "active" : ""}`}
              onClick={() => setShowSettings((prev) => !prev)}
              title="Tùy chỉnh cỡ chữ & giao diện"
            >
              <FaFont />
            </button>
          )}
        </div>
      </div>

      {/* ⚙️ BẢNG CÀI ĐẶT TRUYỆN CHỮ (NOVEL) */}
      {isNovel && showSettings && (
        <div className="novel-settings-panel">
          <div className="d-flex align-items-center justify-content-between mb-3">
            <span className="settings-title fw-bold small">Cài đặt đọc truyện</span>
            <button className="btn-close-settings" onClick={() => setShowSettings(false)}>
              ✕
            </button>
          </div>

          {/* Cỡ chữ */}
          <div className="setting-row d-flex align-items-center justify-content-between mb-3">
            <span className="small text-secondary">Cỡ chữ ({fontSize}px):</span>
            <div className="d-flex gap-2 align-items-center">
              <button
                className="btn-size"
                onClick={() => handleSelectFontSize((s) => Math.max(14, s - 2))}
                disabled={fontSize <= 14}
              >
                A-
              </button>
              <button
                className="btn-size"
                onClick={() => handleSelectFontSize((s) => Math.min(28, s + 2))}
                disabled={fontSize >= 28}
              >
                A+
              </button>
            </div>
          </div>

          {/* Màu nền */}
          <div className="setting-row d-flex align-items-center justify-content-between mb-3">
            <span className="small text-secondary">Màu nền:</span>
            <div className="d-flex gap-2 align-items-center">
              <button
                className={`theme-dot dark ${themeMode === "dark" ? "active" : ""}`}
                onClick={() => handleSelectTheme("dark")}
                title="Nền tối"
              ></button>
              <button
                className={`theme-dot sepia ${themeMode === "sepia" ? "active" : ""}`}
                onClick={() => handleSelectTheme("sepia")}
                title="Nền vàng ấm (Sepia)"
              ></button>
              <button
                className={`theme-dot light ${themeMode === "light" ? "active" : ""}`}
                onClick={() => handleSelectTheme("light")}
                title="Nền sáng"
              ></button>
              <button
                className={`theme-dot image ${themeMode === "image" ? "active" : ""}`}
                onClick={() => handleSelectTheme("image")}
                title="Nền ảnh truyện (Làm mờ & dịu mắt)"
                style={
                  storyCoverUrl
                    ? {
                        backgroundImage: `url("${storyCoverUrl}")`,
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                      }
                    : {
                        background: "linear-gradient(135deg, #6366f1, #06b6d4)",
                      }
                }
              ></button>
            </div>
          </div>

          {/* Phông chữ */}
          <div className="setting-row d-flex align-items-center justify-content-between">
            <span className="small text-secondary">Phông chữ:</span>
            <div className="d-flex gap-2">
              <button
                className={`font-btn ${fontFamily === "sans" ? "active" : ""}`}
                onClick={() => handleSelectFontFamily("sans")}
              >
                Sans
              </button>
              <button
                className={`font-btn ${fontFamily === "serif" ? "active" : ""}`}
                onClick={() => handleSelectFontFamily("serif")}
              >
                Serif
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 📖 NỘI DUNG CHƯƠNG */}
      <div className="tecReaderContent">
        {loading ? (
          <div className="reader-loading text-center py-5">
            <div className="spinner-border text-primary mb-3" role="status"></div>
            <p className="text-secondary small">Đang tải nội dung {chapterName}...</p>
          </div>
        ) : errorMsg ? (
          <div className="reader-error text-center py-5 px-3">
            <FaExclamationTriangle className="text-warning mb-3" size={40} />
            <h5>{errorMsg}</h5>
            <p className="text-secondary small">Hãy thử tải lại hoặc chọn chương khác nhé.</p>
            <button
              className="btnPrimary mt-2"
              onClick={() => navigate(`/truyen/chi-tiet/${resolvedStorySlug}`)}
            >
              Về trang chi tiết truyện
            </button>
          </div>
        ) : (
          <>
            {/* Thông báo rõ ràng khi bộ truyện chỉ có duy nhất 1 chương trên kho */}
            {allChapters.length === 1 && (
              <div className="single-chapter-notice text-center mb-4 p-3 mx-auto" style={{ maxWidth: 640 }}>
                <div className="d-flex align-items-center justify-content-center gap-2 mb-1">
                  <FaInfoCircle className="text-info" />
                  <span className="fw-bold">Bộ truyện này hiện có 1 chương phát hành ({chapterName}) trên hệ thống kho truyện.</span>
                </div>
                <p className="text-secondary small mb-2">
                  Chưa có thêm tập trước hoặc tập sau trên nguồn dữ liệu này.
                </p>
                {storyName && storyName !== "Kho Truyện" && (
                  <button
                    className="btnDark btn-sm py-1 px-3 mt-1"
                    style={{ fontSize: 12.5 }}
                    onClick={() => navigate(`/truyen/tim-kiem/${encodeURIComponent(storyName)}`)}
                  >
                    🔍 Tìm các phiên bản khác của "{storyName}"
                  </button>
                )}
              </div>
            )}

            {isNovel ? (
              /* ================= CHẾ ĐỘ ĐỌC TRUYỆN CHỮ (NOVEL) ================= */
              <div
                className={`novel-content-wrapper font-${fontFamily}`}
                style={{ fontSize: `${fontSize}px` }}
              >
                {/* Tiêu đề chương + Trình phát audio gọn gàng góc phải cùng dòng */}
                <div className="novel-header-chapter mb-4">
                  <div className="novel-header-main">
                    <div className="novel-header-title-wrap">
                      <h2 className="novel-chap-title">{chapterName}</h2>
                      {chapter.wordCount > 0 && (
                        <span className="novel-word-count small text-secondary">
                          ~{chapter.wordCount.toLocaleString()} chữ
                        </span>
                      )}
                    </div>

                    {/* 🎧 Trình phát Audio gọn gàng góc phải */}
                    <StoryVoicePlayer
                      ref={ttsPlayerRef}
                      sentences={parsedNovel.allSentences}
                      chapterTitle={chapterName}
                      onTtsStateChange={setTtsState}
                      hasNextChapter={Boolean(nextChapter)}
                      autoPlayNext={autoPlayNext}
                      onToggleAutoPlayNext={handleToggleAutoPlayNext}
                      onNextChapter={handleAutoPlayNextChapter}
                    />
                  </div>
                </div>

                {parsedNovel.paragraphs.length > 0 ? (
                  <div className="novel-body-text">
                    {parsedNovel.paragraphs.map((para, pIdx) => (
                      <p key={pIdx}>
                        {para.map((s) => (
                          <span
                            key={s.index}
                            id={`tts-sentence-${s.index}`}
                            className={`tts-sentence ${
                              ttsState.activeSentenceIndex === s.index && ttsState.isPlaying
                                ? "tts-active"
                                : ""
                            }`}
                            onClick={() => {
                              if (ttsPlayerRef.current?.jumpToSentence) {
                                ttsPlayerRef.current.jumpToSentence(s.index);
                              }
                            }}
                            title="Bấm để nghe từ câu này"
                          >
                            {s.text}{" "}
                          </span>
                        ))}
                      </p>
                    ))}
                  </div>
                ) : (
                  <div className="text-center text-secondary py-5">
                    Nội dung chương chữ đang được cập nhật.
                  </div>
                )}
              </div>
            ) : (
              /* ================= CHẾ ĐỘ ĐỌC TRUYỆN TRANH (MANGA) ================= */
              <div className="tecReaderImages">
                {Array.isArray(chapter.pages) && chapter.pages.length > 0 ? (
                  chapter.pages.map((p, idx) => {
                    const rawUrl = typeof p === "string" ? p : (p?.url || p?.src || p?.image || p?.path || "");
                    const imgUrl = getCoverUrl(rawUrl);
                    return (
                  <img
                    key={p.id || idx}
                    src={imgUrl}
                    alt={`Trang ${idx + 1}`}
                    loading={idx > 3 ? "lazy" : "eager"}
                    onError={(e) => {
                      e.target.style.opacity = "0.7";
                    }}
                  />
                );
              })
            ) : (
              <div className="text-center text-secondary py-5">
                Chương truyện tranh này chưa có trang ảnh.
              </div>
            )}
          </div>
        )}
      </>
    )}
  </div>

      {/* 🧭 THANH ĐIỀU KHIỂN CỐ ĐỊNH PHÍA DƯỚI */}
      <div className="tecReaderFooter">
        <button
          className="prevBtn"
          disabled={!prevChapter}
          onClick={() => prevChapter && goToChapter(prevChapter)}
          title={prevChapter ? `Chương trước: ${prevChapter.numberText || prevChapter.num}` : "Không có chương trước"}
        >
          <FaChevronLeft />
          <span className="d-none d-sm-inline ms-1">Tập trước</span>
        </button>

        <div className="currentChap text-truncate px-2" title={chapterName}>
          <span>{chapterName}</span>
          {allChapters.length > 1 && currentIndex >= 0 && (
            <span className="chap-count-hint text-secondary small ms-1">
              ({currentIndex + 1}/{allChapters.length})
            </span>
          )}
        </div>

        <button
          className="nextBtn"
          disabled={!nextChapter}
          onClick={() => nextChapter && goToChapter(nextChapter)}
          title={nextChapter ? `Chương tiếp: ${nextChapter.numberText || nextChapter.num}` : "Không có chương tiếp theo"}
        >
          <span className="d-none d-sm-inline me-1">Tập tiếp</span>
          <FaChevronRight />
        </button>

        <button className="btn-scroll-top" onClick={scrollToTop} title="Lên đầu trang">
          <FaArrowUp />
        </button>
      </div>
    </div>
  );
}