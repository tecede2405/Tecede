import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import YouTubeHeader from "../components/YouTubeHeader";
import VideoCard from "../components/VideoCard";
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
  FaCheckCircle, 
  FaHeart, 
  FaExternalLinkAlt, 
  FaSpinner,
  FaClone,
  FaExpand
} from "react-icons/fa";
import { useTecedeYtPlayer } from "../../../context/TecedeYtPlayerContext";
import Swal from "sweetalert2";
import "../style.scss";

export default function YouTubeWatch() {
  const { videoId } = useParams();

  // Video stream state
  const [streamData, setStreamData] = useState(null);
  const [playerMode, setPlayerMode] = useState("direct"); // "direct" | "embed"

  // Details state
  const [isDescExpanded, setIsDescExpanded] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [isSubscribed, setIsSubscribed] = useState(false);

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
    if (!videoId) return;

    let isMounted = true;
    setStreamData(null);
    setIsLiked(false);
    setIsDescExpanded(false);
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
            setStreamData({
              title: oembed.title,
              uploader: oembed.author_name,
              uploaderUrl: oembed.author_url,
              uploaderId: rawAuthor || oembed.author_name,
              thumbnailUrl: oembed.thumbnail_url,
              views: 0,
              likes: 0
            });
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
  }, [videoId]);

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
  const uploaderVerified = streamData?.uploaderVerified;
  const description = streamData?.description || "";

  const rawChannel = streamData?.uploaderId || (streamData?.uploaderUrl && streamData.uploaderUrl.replace("https://www.youtube.com/", "").replace("/channel/", "").replace("/c/", "").replace("/user/", "").trim()) || uploader;
  const channelUrl = rawChannel ? `/tecede-yt/channel/${encodeURIComponent(rawChannel)}` : `/tecede-yt/search?q=${encodeURIComponent(uploader)}&filter=videos`;

  const { isMini, setActiveVideo, maximizePlayer } = useTecedeYtPlayer();

  // Đồng bộ activeVideo khi vào trang watch
  useEffect(() => {
    if (videoId && streamData?.title) {
      setActiveVideo((prev) => ({
        videoId,
        title: streamData.title,
        uploader: streamData.uploader || "YouTube Creator",
        thumbnailUrl: streamData.thumbnailUrl || `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
        playerMode,
        currentTime: prev?.videoId === videoId ? (prev.currentTime || 0) : 0
      }));
    }
  }, [videoId, streamData, playerMode, setActiveVideo]);

  return (
    <div className="yt-page yt-theme-dark">
      <YouTubeHeader />

      <main className="yt-watch-container">
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

            {/* VIDEO TITLE */}
            <h1 className="yt-watch-title">{title}</h1>

            {/* CHANNEL & ACTION BUTTONS ROW */}
            <div className="yt-watch-info-row">
              <div className="yt-watch-channel">
                <Link to={channelUrl} className="channel-link-wrap" title={`Kênh ${uploader}`}>
                  <img 
                    src={uploaderAvatar} 
                    alt={uploader} 
                    className="channel-avatar" 
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(uploader)}&background=27272a&color=f4f4f5&size=80`;
                    }}
                  />
                  <div className="channel-meta">
                    <span className="channel-name">
                      {uploader}
                      {uploaderVerified && <FaCheckCircle className="channel-verified" />}
                    </span>
                    <span className="channel-sub-count">Kênh đã xác minh</span>
                  </div>
                </Link>
                <button
                  className={`btn-subscribe ${isSubscribed ? "subscribed" : ""}`}
                  onClick={() => setIsSubscribed(!isSubscribed)}
                >
                  {isSubscribed ? "Đã đăng ký" : "Đăng ký"}
                </button>
              </div>

              <div className="yt-watch-actions">
                {/* LIKE & DISLIKE GROUPED SEAMLESS PILL */}
                <div className="yt-like-dislike-group">
                  <button
                    type="button"
                    className={`action-btn btn-like ${isLiked ? "active" : ""}`}
                    onClick={handleLikeToggle}
                    title="Thích"
                  >
                    <FaThumbsUp className="me-1" />
                    <span>{likeCount > 0 ? formatViews(likeCount).replace(" lượt xem", "") : "Thích"}</span>
                  </button>
                  <div className="like-dislike-divider" />
                  <button 
                    type="button" 
                    className="action-btn btn-dislike" 
                    title="Không thích"
                  >
                    <FaThumbsDown />
                  </button>
                </div>

                <button 
                  type="button"
                  className="action-btn" 
                  onClick={handleShare} 
                  title="Chia sẻ video"
                >
                  <FaShare className="me-1" />
                  <span>Chia sẻ</span>
                </button>

                <a
                  href={`https://www.youtube.com/watch?v=${videoId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="action-btn btn-yt-link"
                  title="Mở trên YouTube gốc"
                >
                  <FaExternalLinkAlt className="me-1" />
                  <span className="d-none d-sm-inline">YouTube</span>
                </a>
              </div>
            </div>

            {/* COLLAPSIBLE DESCRIPTION */}
            <div 
              className={`yt-watch-desc-box ${isDescExpanded ? "expanded" : ""}`}
              onClick={() => !isDescExpanded && setIsDescExpanded(true)}
            >
              <div className="desc-stats-line">
                <span>{formatViews(views)}</span>
                {uploadDate && (
                  <>
                    <span className="dot">•</span>
                    <span>{formatTimeAgo(uploadDate)}</span>
                  </>
                )}
              </div>

              <div className="desc-content">
                {description || "Không có mô tả cho video này."}
              </div>

              {description && description.length > 150 && (
                <button
                  className="btn-toggle-desc"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsDescExpanded(!isDescExpanded);
                  }}
                >
                  {isDescExpanded ? "Ẩn bớt" : "...thêm"}
                </button>
              )}
            </div>

            {/* COMMENTS SECTION */}
            <section className="yt-comments-section">
              <h3 className="comments-heading">
                Bình luận ({comments.length > 0 ? comments.length : 0})
              </h3>

              {loadingComments ? (
                <div className="comments-loading">
                  <FaSpinner className="spinner-icon spinning" />
                  <span>Đang tải bình luận...</span>
                </div>
              ) : comments.length === 0 ? (
                <div className="comments-empty">
                  <span>Chưa có bình luận nào hoặc bình luận bị tắt cho video này.</span>
                </div>
              ) : (
                <div className="comments-list">
                  {(showAllComments ? comments : comments.slice(0, 3)).map((comment, index) => (
                    <div key={comment.commentId || index} className="comment-item">
                      <img
                        src={cleanImageUrl(comment.thumbnail) || `https://ui-avatars.com/api/?name=${encodeURIComponent(comment.author || "User")}&background=27272a&color=f4f4f5`}
                        alt={comment.author}
                        className="comment-author-avatar"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(comment.author || "User")}&background=27272a&color=f4f4f5`;
                        }}
                      />
                      <div className="comment-body">
                        <div className="comment-header">
                          <span className="comment-author">{comment.author}</span>
                          {comment.verified && <FaCheckCircle className="author-verified" />}
                          <span className="comment-time">{comment.commentedTime}</span>
                        </div>
                        <p className="comment-text">{comment.commentText}</p>
                        <div className="comment-footer">
                          <button className="btn-comment-action">
                            <FaThumbsUp />
                            {comment.likeCount > 0 && <span className="ms-1">{comment.likeCount}</span>}
                          </button>
                          {comment.hearted && (
                            <span className="comment-heart" title="Người tạo đã thả tim">
                              <FaHeart />
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* NÚT XEM THÊM (NẾU DÀI HƠN 3 COMMENT) HOẶC THU GỌN */}
                  {comments.length > 3 && (
                    <div className="comments-expand-wrap">
                      <button
                        type="button"
                        className="btn-expand-comments"
                        onClick={() => setShowAllComments(!showAllComments)}
                      >
                        {showAllComments 
                          ? "Thu gọn bình luận" 
                          : `Xem thêm (${comments.length - 3} bình luận khác)`
                        }
                      </button>
                    </div>
                  )}

                  {/* LOAD MORE COMMENTS TỪ API KHI ĐÃ MỞ RỘNG */}
                  {showAllComments && commentNextPage && (
                    <div className="comments-load-more">
                      <button
                        className="btn-load-more-comments"
                        onClick={handleLoadMoreComments}
                        disabled={loadingMoreComments}
                      >
                        {loadingMoreComments ? (
                          <>
                            <FaSpinner className="me-2 spinning" /> Đang tải thêm...
                          </>
                        ) : (
                          "Xem thêm bình luận"
                        )}
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
