import React, { useState, useEffect, useRef } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import YouTubeHeader from "../components/YouTubeHeader";
import VideoCard from "../components/VideoCard";
import { useAuth } from "../../../context/AuthContext";
import { DarkSwal } from "../utils/watchAuth";
import { 
  fetchStreams, 
  fetchComments, 
  fetchNextComments, 
  fetchTrending,
  fetchSearch,
  fetchOEmbed,
  saveWatchHistory,
  extractVideoId,
  formatViews, 
  formatTimeAgo,
  cleanImageUrl
} from "../../../services/pipedApi";
import { 
  FaThumbsUp, 
  FaThumbsDown, 
  FaShare, 
  FaSpinner,
  FaClone,
  FaExpand,
  FaEllipsisH
} from "react-icons/fa";
import { useTecedeYtPlayer } from "../../../context/TecedeYtPlayerContext";
import Swal from "sweetalert2";
import "../style.scss";

export default function YouTubeWatch() {
  const { videoId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isAllowed = Boolean(user && (user.role === "premium" || user.role === "admin"));

  useEffect(() => {
    if (!user) {
      navigate("/tecede-yt", { replace: true });
      DarkSwal.fire({
        icon: "warning",
        title: "Yêu cầu đăng nhập",
        text: "Vui lòng đăng nhập tài khoản để sử dụng tính năng xem YouTube không quảng cáo!",
        showCancelButton: true,
        confirmButtonText: "Đăng nhập ngay",
        cancelButtonText: "Để sau",
        confirmButtonColor: "#f59e0b",
        cancelButtonColor: "#334155",
      }).then((result) => {
        if (result.isConfirmed) {
          navigate("/login");
        }
      });
      return;
    }

    if (user.role !== "premium" && user.role !== "admin") {
      navigate("/tecede-yt", { replace: true });
      DarkSwal.fire({
        icon: "info",
        title: "Đặc quyền Premium",
        text: "Tính năng này chỉ dành cho thành viên Premium!",
        confirmButtonText: "Đóng",
        confirmButtonColor: "#f59e0b",
      });
      return;
    }
  }, [user, navigate]);

  // Video stream state
  const [streamData, setStreamData] = useState(null);
  const [playerMode, setPlayerMode] = useState("direct"); // "direct" | "embed"

  // Details state
  const [isTitleExpanded, setIsTitleExpanded] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);

  // Related videos state
  const [relatedVideos, setRelatedVideos] = useState([]);
  const [loadingRelated, setLoadingRelated] = useState(false);

  // Comments state
  const [comments, setComments] = useState([]);
  const [commentNextPage, setCommentNextPage] = useState(null);
  const [loadingComments, setLoadingComments] = useState(false);
  const [loadingMoreComments, setLoadingMoreComments] = useState(false);
  const [showAllComments, setShowAllComments] = useState(false);

  // Tự động tìm kiếm video liên quan dự phòng khi Piped stream không trả relatedStreams
  const loadFallbackRelated = async (currentVid, title, author) => {
    setLoadingRelated(true);
    try {
      let items = [];
      if (author || title) {
        const queryTerm = (author || title).slice(0, 35);
        const searchRes = await fetchSearch(queryTerm, "videos");
        items = searchRes?.items || [];
      }
      if (!items || items.length === 0) {
        items = await fetchTrending("VN");
      }
      const filtered = (items || []).filter((v) => {
        const vidId = v.id || extractVideoId(v.url);
        return vidId && vidId !== currentVid;
      });
      setRelatedVideos(filtered);
    } catch (e) {
      console.warn("Lỗi tải fallback video liên quan:", e);
    } finally {
      setLoadingRelated(false);
    }
  };


  // Load video stream data & SponsorBlock
  useEffect(() => {
    if (!videoId || !isAllowed) return;

    let isMounted = true;
    setStreamData(null);
    setIsLiked(false);
    setIsTitleExpanded(false);
    setShowAllComments(false);

    // Scroll to top
    window.scrollTo({ top: 0, behavior: "smooth" });

    // 1. Fetch Streams & Related
    setRelatedVideos([]);
    setLoadingRelated(true);

    fetchStreams(videoId)
      .then((data) => {
        if (!isMounted) return;

        if (data.error || (!data.videoStreams && !data.hls && !data.title)) {
          throw new Error(data.message || data.error || "Không thể tải luồng phát video.");
        }

        setStreamData(data);
        setLikeCount(data.likes || 0);

        // Lưu vào lịch sử xem để đề xuất cá nhân hóa ở trang chủ
        saveWatchHistory({
          id: videoId,
          title: data.title,
          uploader: data.uploader,
          uploaderAvatar: data.uploaderAvatar,
          thumbnail: data.thumbnailUrl,
          duration: data.duration,
          views: data.views || data.likes || 0
        });

        // Cập nhật video liên quan nếu có
        if (data.relatedStreams && data.relatedStreams.length > 0) {
          setRelatedVideos(data.relatedStreams);
          setLoadingRelated(false);
        } else {
          loadFallbackRelated(videoId, data.title, data.uploader);
        }
      })
      .catch((err) => {
        if (!isMounted) return;
        console.warn("[YouTubeWatch] Lỗi tải stream trực tiếp:", err.message);
        // Tự động chuyển sang chế độ embed nếu stream bị chặn bot check
        setPlayerMode("embed");

        // Lấy thông tin oEmbed để hiện tiêu đề, tên kênh và nạp video liên quan
        fetchOEmbed(videoId).then((oembed) => {
          if (!isMounted) return;
          if (oembed) {
            const rawAuthor = (oembed.author_url || "")
              .replace("https://www.youtube.com/", "")
              .replace("/channel/", "")
              .replace("/c/", "")
              .replace("/user/", "")
              .trim();
            const fallbackAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(oembed.author_name || "Creator")}&background=dc2626&color=ffffff&size=100`;

            setStreamData({
              title: oembed.title,
              uploader: oembed.author_name,
              uploaderUrl: oembed.author_url,
              uploaderId: rawAuthor || oembed.author_name,
              uploaderAvatar: fallbackAvatar,
              thumbnailUrl: oembed.thumbnail_url,
              views: 0,
              likes: 0
            });

            // Tìm kiếm avatar thực của kênh ngầm
            fetchSearch(rawAuthor || oembed.author_name, "channels")
              .then((chRes) => {
                if (isMounted && chRes?.items?.[0]?.thumbnail) {
                  const chAvatar = cleanImageUrl(chRes.items[0].thumbnail);
                  setStreamData((prev) => (prev ? { ...prev, uploaderAvatar: chAvatar } : prev));
                }
              })
              .catch(() => {});

            saveWatchHistory({
              id: videoId,
              title: oembed.title,
              uploader: oembed.author_name,
              thumbnail: oembed.thumbnail_url,
              duration: 0,
              views: 0
            });
            loadFallbackRelated(videoId, oembed.title, oembed.author_name);
          } else {
            loadFallbackRelated(videoId);
          }
        });
      });

    // 2. Fetch Comments
    setLoadingComments(true);
    fetchComments(videoId)
      .then((res) => {
        if (!isMounted) return;
        setComments(res.comments || []);
        setCommentNextPage(res.nextpage || null);
        setLoadingComments(false);
      })
      .catch((e) => {
        if (!isMounted) return;
        setComments([]);
        setLoadingComments(false);
      });

    return () => {
      isMounted = false;
    };
  }, [videoId, isAllowed]);

  // Load more comments
  const handleLoadMoreComments = async () => {
    if (!commentNextPage || loadingMoreComments) return;
    setLoadingMoreComments(true);
    try {
      const res = await fetchNextComments(videoId, commentNextPage);
      if (res.comments && res.comments.length > 0) {
        setComments((prev) => [...prev, ...res.comments]);
        setCommentNextPage(res.nextpage || null);
      } else {
        setCommentNextPage(null);
      }
    } catch (e) {
      setCommentNextPage(null);
    } finally {
      setLoadingMoreComments(false);
    }
  };

  const handleShare = () => {
    const url = window.location.href;
    navigator.clipboard?.writeText(url);
    Swal.fire({
      toast: true,
      position: "bottom-end",
      icon: "success",
      title: "Đã sao chép liên kết video!",
      showConfirmButton: false,
      timer: 2000,
      background: "#212121",
      color: "#fff"
    });
  };

  const handleLikeToggle = () => {
    setIsLiked(!isLiked);
    setLikeCount(prev => isLiked ? prev - 1 : prev + 1);
  };

  const title = streamData?.title || "Video";
  const views = streamData?.views || 0;
  const uploadDate = streamData?.uploadDate;
  const uploader = streamData?.uploader || "YouTube Creator";
  const rawAvatar = streamData?.uploaderAvatar;
  const uploaderAvatar = rawAvatar 
    ? cleanImageUrl(rawAvatar) 
    : `https://ui-avatars.com/api/?name=${encodeURIComponent(uploader)}&background=27272a&color=f4f4f5&size=80`;
  const description = streamData?.description || "";

  const rawChannel = streamData?.uploaderId || (streamData?.uploaderUrl && streamData.uploaderUrl.replace("https://www.youtube.com/", "").replace("/channel/", "").replace("/c/", "").replace("/user/", "").trim()) || uploader;
  const channelUrl = rawChannel ? `/tecede-yt/channel/${encodeURIComponent(rawChannel)}` : `/tecede-yt/search?q=${encodeURIComponent(uploader)}&filter=videos`;

  const { isMini, setActiveVideo, maximizePlayer, minimizePlayer, setDragProgress } = useTecedeYtPlayer();

  const handleMinimize = () => {
    minimizePlayer({
      videoId,
      title: streamData?.title || "Video",
      uploader: streamData?.uploader || "YouTube Creator",
      thumbnailUrl: streamData?.thumbnailUrl || `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
      playerMode
    });
  };

  // Gesture vuốt xuống từ khu vực player hoặc đầu trang trên Mobile để thu nhỏ thành miniplayer
  const touchStartY = useRef(0);
  const touchStartX = useRef(0);
  const isDraggingDown = useRef(false);

  const handleTouchStart = (e) => {
    // Chỉ kích hoạt khi đang ở đầu trang (window.scrollY <= 30px) để không tranh chấp với cuộn trang tự nhiên
    if (window.scrollY > 30 || isMini) return;
    const touch = e.touches[0];
    touchStartY.current = touch.clientY;
    touchStartX.current = touch.clientX;
    isDraggingDown.current = false;
  };

  const handleTouchMove = (e) => {
    if (isMini || window.scrollY > 30) return;
    const touch = e.touches[0];
    const deltaY = touch.clientY - touchStartY.current;
    const deltaX = Math.abs(touch.clientX - touchStartX.current);

    // Người dùng vuốt xuống rõ rệt (deltaY > 15px và thẳng đứng hơn nằm ngang)
    if (deltaY > 15 && deltaY > deltaX * 1.2) {
      isDraggingDown.current = true;
      const progress = Math.min(Math.max(deltaY / 220, 0), 1);
      if (setDragProgress) {
        setDragProgress(progress);
      }
    } else if (deltaY < 0 && isDraggingDown.current) {
      if (setDragProgress) setDragProgress(0);
      isDraggingDown.current = false;
    }
  };

  const handleTouchEnd = (e) => {
    if (!isDraggingDown.current) return;
    const touch = e.changedTouches[0];
    const deltaY = touch.clientY - touchStartY.current;

    if (setDragProgress) setDragProgress(0);
    isDraggingDown.current = false;

    // Ngưỡng vuốt qua 80px -> Tự động thu nhỏ thành miniplayer
    if (deltaY > 80) {
      handleMinimize();
    }
  };

  // Đồng bộ activeVideo khi vào trang watch
  useEffect(() => {
    if (videoId && isAllowed) {
      setActiveVideo((prev) => ({
        ...(prev || {}),
        videoId,
        title: streamData?.title || prev?.title || "Video",
        uploader: streamData?.uploader || prev?.uploader || "YouTube Creator",
        thumbnailUrl: streamData?.thumbnailUrl || prev?.thumbnailUrl || `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
        playerMode,
        currentTime: prev?.videoId === videoId ? (prev.currentTime || 0) : 0
      }));
    }
  }, [videoId, isAllowed, streamData, playerMode, setActiveVideo]);

  if (!isAllowed) {
    return null;
  }

  return (
    <div 
      className="yt-page yt-theme-dark yt-watch-swipeable"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <YouTubeHeader />

      <main className="yt-watch-container">
        {/* Nút vuốt / thu nhỏ nhanh trên Mobile giống YouTube App */}
        {!isMini && (
          <div 
            className="yt-mobile-swipe-indicator" 
            onClick={handleMinimize}
            title="Chạm hoặc vuốt để thu nhỏ video"
          >
            <div className="swipe-bar" />
          </div>
        )}

        <div className="yt-watch-grid">
          {/* CỘT TRÁI: VIDEO PLAYER + DETAILS + COMMENTS */}
          <div className="yt-watch-left">
            {/* VIDEO PLAYER SECTION (DOCK SLOT) */}
            <div className="yt-player-box">
              <div id="yt-watch-slot" className="yt-watch-slot">
                {isMini && (
                  <div className="yt-player-minimized-placeholder">
                    <div className="placeholder-content">
                      <FaClone className="placeholder-icon" />
                      <div className="placeholder-text">
                        <h4>Video đang phát ở góc màn hình</h4>
                        <p>Bấm vào biểu tượng phóng to ở khung thu nhỏ để mở lại toàn màn hình</p>
                      </div>
                      <button
                        type="button"
                        className="yt-btn-restore-full"
                        onClick={maximizePlayer}
                      >
                        <FaExpand className="me-2" /> Phóng to lại
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* 1. KHỐI TITLE VÀ THÔNG SỐ (GIỐNG APP YOUTUBE TRONG ẢNH) */}
            <div className={`yt-watch-title-card ${isTitleExpanded ? "expanded" : ""}`}>
              <h1 className="yt-watch-title">
                {title}
              </h1>

              <div className="yt-watch-meta-inline">
                {likeCount > 0 && (
                  <>
                    <span className="stat-text">
                      {formatViews(likeCount).replace(" lượt xem", "")} lượt thích
                    </span>
                    <span className="dot">•</span>
                  </>
                )}
                {views > 0 && (
                  <span className="stat-text">
                    {formatViews(views)}
                  </span>
                )}
                {uploadDate && (
                  <>
                    {views > 0 && <span className="dot">•</span>}
                    <span className="stat-text">
                      {formatTimeAgo(uploadDate)}
                    </span>
                  </>
                )}
                <button
                  type="button"
                  className="btn-toggle-title-more"
                  onClick={() => setIsTitleExpanded(!isTitleExpanded)}
                  title={isTitleExpanded ? "Ẩn bớt mô tả" : "Xem thêm"}
                >
                  {isTitleExpanded ? "...ẩn bớt" : "...thêm"}
                </button>
              </div>

              {/* PHẦN MÔ TẢ ĐẦY ĐỦ KHI BẤM ...THÊM */}
              {isTitleExpanded && (
                <div className="yt-watch-expanded-desc">
                  <div className="desc-full-stats">
                    <span>{formatViews(views)}</span>
                    {uploadDate && (
                      <>
                        <span className="dot">•</span>
                        <span>{formatTimeAgo(uploadDate)}</span>
                      </>
                    )}
                  </div>
                  <div className="desc-text-full">
                    {description || "Không có mô tả cho video này."}
                  </div>
                </div>
              )}
            </div>

            {/* 2. KHỐI KÊNH VÀ CÁC NÚT ACTION (BĂNG NGANG THU GỌN CHUẨN APP) */}
            <div className="yt-watch-channel-action-row">
              <div className="yt-channel-pill-group">
                <Link to={channelUrl} className="channel-avatar-link" title={`Kênh ${uploader}`}>
                  <img 
                    src={uploaderAvatar} 
                    alt={uploader} 
                    className="channel-avatar-round" 
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(uploader)}&background=dc2626&color=ffffff&size=80`;
                    }}
                  />
                </Link>
                <Link to={channelUrl} className="channel-name-link" title={`Kênh ${uploader}`}>
                  <span className="channel-name-text">{uploader}</span>
                </Link>
              </div>

              <div className="yt-actions-pill-group">
                {/* LIKE & DISLIKE GROUP */}
                <div className="action-like-dislike">
                  <button
                    type="button"
                    className={`btn-act ${isLiked ? "active" : ""}`}
                    onClick={handleLikeToggle}
                    title="Thích"
                  >
                    <FaThumbsUp />
                    {likeCount > 0 && <span className="ms-1">{formatViews(likeCount).replace(" lượt xem", "")}</span>}
                  </button>
                  <div className="div-bar" />
                  <button 
                    type="button" 
                    className="btn-act" 
                    title="Không thích"
                  >
                    <FaThumbsDown />
                  </button>
                </div>

                {/* SHARE */}
                <button 
                  type="button"
                  className="btn-circle-act" 
                  onClick={handleShare} 
                  title="Chia sẻ video"
                >
                  <FaShare />
                </button>

                {/* MORE OPTIONS */}
                <button 
                  type="button"
                  className="btn-circle-act" 
                  onClick={() => {
                    if (navigator.clipboard) {
                      navigator.clipboard.writeText(`https://www.youtube.com/watch?v=${videoId}`);
                      Swal.fire({
                        toast: true,
                        position: "bottom-end",
                        icon: "success",
                        title: "Đã copy link YouTube!",
                        showConfirmButton: false,
                        timer: 1800,
                        background: "#212121",
                        color: "#fff"
                      });
                    }
                  }}
                  title="Tùy chọn khác"
                >
                  <FaEllipsisH />
                </button>
              </div>
            </div>

            {/* 3. KHỐI BÌNH LUẬN BOX (BO TRÒN ĐEN, HIỆN 1 COMMENT + AVATAR CHỮ VK ĐÚNG Y NHƯ ẢNH) */}
            <section className="yt-comments-box-app">
              <div 
                className="comments-box-header" 
                onClick={() => setShowAllComments(!showAllComments)}
                role="button"
                tabIndex={0}
              >
                <div className="header-left">
                  <span className="title">Bình luận</span>
                  <span className="count">{comments.length > 0 ? formatViews(comments.length).replace(" lượt xem", "") : "0"}</span>
                </div>
                <div className="header-right-dots">
                  <span className="dot-pill" />
                </div>
              </div>

              {loadingComments ? (
                <div className="comments-loading-box">
                  <FaSpinner className="spinner-icon spinning" />
                  <span>Đang tải bình luận...</span>
                </div>
              ) : comments.length === 0 ? (
                <div className="comments-empty-box">
                  Chưa có bình luận nào cho video này.
                </div>
              ) : (
                <div className="comments-box-content">
                  {/* BÌNH LUẬN ĐẦU TIÊN (HOẶC TẤT CẢ KHI SHOW FULL) */}
                  {(showAllComments ? comments : comments.slice(0, 1)).map((comment, index) => {
                    const cleanAuthor = (comment.author || "").replace(/^@+/, "");
                    const authorInitials = cleanAuthor
                      .split(" ")
                      .map((n) => n[0])
                      .slice(0, 2)
                      .join("")
                      .toUpperCase() || "VK";

                    const avatarUrl = comment.thumbnail 
                      ? cleanImageUrl(comment.thumbnail) 
                      : null;

                    return (
                      <div 
                        key={comment.commentId || index} 
                        className="comment-row-app"
                        onClick={() => !showAllComments && setShowAllComments(true)}
                      >
                        {avatarUrl ? (
                          <img
                            src={avatarUrl}
                            alt={comment.author}
                            className="author-avatar-img"
                            onError={(e) => {
                              e.target.style.display = "none";
                              if (e.target.nextSibling) e.target.nextSibling.style.display = "flex";
                            }}
                          />
                        ) : null}
                        <div 
                          className="author-badge-circle"
                          style={{ display: avatarUrl ? "none" : "flex" }}
                        >
                          {authorInitials}
                        </div>

                        <div className="comment-text-app">
                          <div className="comment-author-line">
                            <span className="author-name">{comment.author || "Người dùng"}</span>
                            {comment.commentedTime && (
                              <span className="comment-time">{comment.commentedTime}</span>
                            )}
                          </div>
                          <p className={`text-content ${!showAllComments ? "line-clamp-2" : ""}`}>
                            {comment.commentText}
                          </p>
                        </div>
                      </div>
                    );
                  })}

                  {/* NÚT THU GỌN / XEM THÊM KHI ĐÃ MỞ RỘNG */}
                  {comments.length > 1 && (
                    <div className="comments-footer-toggle">
                      <button
                        type="button"
                        className="btn-toggle-comments-state"
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowAllComments(!showAllComments);
                        }}
                      >
                        {showAllComments 
                          ? "Ẩn bớt bình luận" 
                          : `Xem thêm ${comments.length - 1} bình luận khác...`
                        }
                      </button>
                    </div>
                  )}

                  {showAllComments && commentNextPage && (
                    <div className="comments-load-more-btn-wrap">
                      <button
                        className="btn-load-more-api"
                        onClick={handleLoadMoreComments}
                        disabled={loadingMoreComments}
                      >
                        {loadingMoreComments ? <FaSpinner className="spinning" /> : "Tải thêm bình luận"}
                      </button>
                    </div>
                  )}
                </div>
              )}
            </section>
          </div>

          {/* CỘT PHẢI: RELATED VIDEOS */}
          <aside className="yt-watch-right">
            <h4 className="related-title">Video liên quan</h4>

            {loadingRelated && relatedVideos.length === 0 && (
              <div className="related-skeletons">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="yt-compact-skeleton mb-3">
                    <div className="compact-thumb-skel" />
                    <div className="compact-meta-skel">
                      <div className="skeleton-line line-1" />
                      <div className="skeleton-line line-2" />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {!loadingRelated && relatedVideos.length === 0 && (
              <div className="related-empty text-secondary small py-3">
                Không tìm thấy video liên quan.
              </div>
            )}

            <div className="related-videos-list">
              {relatedVideos.map((item, idx) => (
                <VideoCard
                  key={item.id || item.url || idx}
                  video={item}
                  layout="compact"
                />
              ))}
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}
