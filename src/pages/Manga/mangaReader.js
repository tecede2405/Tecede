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
import "./style.scss";

export default function ComicReader() {
  const { storySlug, chapterSlug, id } = useParams();
  const navigate = useNavigate();

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
  const [fontSize, setFontSize] = useState(18); // 16px - 26px
  const [themeMode, setThemeMode] = useState("dark"); // "dark" | "sepia" | "light"
  const [fontFamily, setFontFamily] = useState("sans"); // "sans" | "serif"
  const [showSettings, setShowSettings] = useState(false);

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

  return (
    <div className={`tecReader theme-${themeMode} ${isNovel ? "novel-reader-mode" : "manga-reader-mode"}`} ref={topRef}>
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
            onClick={() => navigate("/truyen")}
            title="Về kho truyện"
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
                onClick={() => setFontSize((s) => Math.max(14, s - 2))}
                disabled={fontSize <= 14}
              >
                A-
              </button>
              <button
                className="btn-size"
                onClick={() => setFontSize((s) => Math.min(28, s + 2))}
                disabled={fontSize >= 28}
              >
                A+
              </button>
            </div>
          </div>

          {/* Màu nền */}
          <div className="setting-row d-flex align-items-center justify-content-between mb-3">
            <span className="small text-secondary">Màu nền:</span>
            <div className="d-flex gap-2">
              <button
                className={`theme-dot dark ${themeMode === "dark" ? "active" : ""}`}
                onClick={() => setThemeMode("dark")}
                title="Nền tối"
              ></button>
              <button
                className={`theme-dot sepia ${themeMode === "sepia" ? "active" : ""}`}
                onClick={() => setThemeMode("sepia")}
                title="Nền vàng ấm (Sepia)"
              ></button>
              <button
                className={`theme-dot light ${themeMode === "light" ? "active" : ""}`}
                onClick={() => setThemeMode("light")}
                title="Nền sáng"
              ></button>
            </div>
          </div>

          {/* Phông chữ */}
          <div className="setting-row d-flex align-items-center justify-content-between">
            <span className="small text-secondary">Phông chữ:</span>
            <div className="d-flex gap-2">
              <button
                className={`font-btn ${fontFamily === "sans" ? "active" : ""}`}
                onClick={() => setFontFamily("sans")}
              >
                Sans
              </button>
              <button
                className={`font-btn ${fontFamily === "serif" ? "active" : ""}`}
                onClick={() => setFontFamily("serif")}
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
                <div className="novel-header-chapter text-center mb-4">
                  <h2 className="novel-chap-title">{chapterName}</h2>
                  {chapter.wordCount > 0 && (
                    <span className="novel-word-count small text-secondary">
                      ~{chapter.wordCount.toLocaleString()} chữ
                    </span>
                  )}
                </div>

                {chapter.bodyHtml ? (
                  <div
                    className="novel-body-text"
                    dangerouslySetInnerHTML={{ __html: chapter.bodyHtml }}
                  />
                ) : chapter.bodyText ? (
                  <div className="novel-body-text">
                    {chapter.bodyText.split("\n").map((para, i) => {
                      const pClean = para.trim();
                      if (!pClean) return null;
                      return <p key={i}>{pClean}</p>;
                    })}
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