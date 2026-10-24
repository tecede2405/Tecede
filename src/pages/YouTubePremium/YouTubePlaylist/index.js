import React, { useState, useEffect, useRef, useMemo } from "react";
import { useParams, useSearchParams, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import YouTubeHeader from "../components/YouTubeHeader";
import { useTecedeYtPlayer } from "../../../context/TecedeYtPlayerContext";
import {
  fetchPlaylist,
  formatDuration,
  extractVideoId,
  saveWatchHistory,
  cleanImageUrl
} from "../../../services/pipedApi";
import {
  FaPlay,
  FaStepForward,
  FaStepBackward,
  FaListUl,
  FaUser,
  FaShareAlt,
  FaSpinner,
  FaExternalLinkAlt,
  FaSearch,
  FaTimes,
  FaClone,
  FaExpand
} from "react-icons/fa";
import Swal from "sweetalert2";
import "../style.scss";

export default function YouTubePlaylist() {
  const { playlistId } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const queryVideoId = searchParams.get("v");

  const { isMini, setIsMini, setActiveVideo, maximizePlayer } = useTecedeYtPlayer();

  const [playlistData, setPlaylistData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedVideoId, setSelectedVideoId] = useState(queryVideoId || null);
  const [filterKeyword, setFilterKeyword] = useState("");

  const activeItemRef = useRef(null);

  // Đảm bảo khi vào hoặc zoom về trang playlist, miniplayer luôn được dock vào khung phát chính
  useEffect(() => {
    setIsMini(false);
  }, [playlistId, setIsMini]);

  useEffect(() => {
    window.scrollTo(0, 0);
    if (!playlistId) return;

    let isMounted = true;
    setIsLoading(true);

    fetchPlaylist(playlistId)
      .then((data) => {
        if (!isMounted) return;
        setPlaylistData(data);
        setIsLoading(false);

        // Nếu chưa có selectedVideoId từ query params, mặc định chọn video đầu tiên
        if (Array.isArray(data?.relatedStreams) && data.relatedStreams.length > 0) {
          const firstVidId = data.relatedStreams[0].id || extractVideoId(data.relatedStreams[0].url);
          if (!queryVideoId && firstVidId) {
            setSelectedVideoId(firstVidId);
          }
        }
      })
      .catch((err) => {
        if (!isMounted) return;
        console.warn("Lỗi tải thông tin playlist:", err);
        setPlaylistData({
          name: "Danh sách phát YouTube",
          uploader: "YouTube Creator",
          relatedStreams: []
        });
        setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [playlistId, queryVideoId]);

  // Đồng bộ query parameter khi query thay đổi
  useEffect(() => {
    if (queryVideoId && queryVideoId !== selectedVideoId) {
      setSelectedVideoId(queryVideoId);
    }
  }, [queryVideoId, selectedVideoId]);

  // Tự động cuộn đến video đang phát trong danh sách khi đổi bài
  useEffect(() => {
    if (activeItemRef.current) {
      activeItemRef.current.scrollIntoView({
        behavior: "smooth",
        block: "nearest"
      });
    }
  }, [selectedVideoId]);

  const handleSharePlaylist = () => {
    const shareUrl = window.location.href;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(shareUrl);
      Swal.fire({
        toast: true,
        position: "bottom-end",
        icon: "success",
        title: "Đã sao chép liên kết danh sách phát!",
        showConfirmButton: false,
        timer: 2000,
        background: "#212121",
        color: "#fff"
      });
    }
  };

  const name = playlistData?.name || "Danh sách phát";
  const uploader = playlistData?.uploader || "YouTube Creator";
  const uploaderId = playlistData?.uploaderUrl ? playlistData.uploaderUrl.replace("/channel/", "") : null;
  const channelUrl = uploaderId ? `/tecede-yt/channel/${uploaderId}` : null;
  const videos = useMemo(() => {
    return Array.isArray(playlistData?.relatedStreams) ? playlistData.relatedStreams : [];
  }, [playlistData?.relatedStreams]);
  const videosCount = playlistData?.videos || videos.length;

  // Lọc video theo từ khóa tìm kiếm trong danh sách phát
  const filteredVideos = useMemo(() => {
    if (!filterKeyword.trim()) return videos;
    const lower = filterKeyword.toLowerCase();
    return videos.filter(
      (v) =>
        (v.title && v.title.toLowerCase().includes(lower)) ||
        (v.uploaderName && v.uploaderName.toLowerCase().includes(lower))
    );
  }, [videos, filterKeyword]);

  // Xác định video hiện đang phát
  const activeIndex = videos.findIndex(
    (v) => (v.id || extractVideoId(v.url)) === selectedVideoId
  );
  const currentPlaying = activeIndex >= 0 ? videos[activeIndex] : (videos[0] || null);
  const currentVideoId = selectedVideoId || (currentPlaying?.id || extractVideoId(currentPlaying?.url));

  // Đồng bộ phát đè lên Master Player & Lưu lịch sử xem khi video thay đổi
  useEffect(() => {
    if (currentVideoId && currentPlaying) {
      // 1. Ghi đè video lên Master Player (phát đè lên video đang phát, không phát 2 video cùng lúc)
      setActiveVideo((prev) => {
        if (prev?.videoId === currentVideoId && prev?.playlistId === playlistId) {
          return prev;
        }
        return {
          videoId: currentVideoId,
          title: currentPlaying.title || name,
          uploader: currentPlaying.uploaderName || uploader,
          thumbnailUrl: currentPlaying.thumbnail || `https://i.ytimg.com/vi/${currentVideoId}/hqdefault.jpg`,
          playlistId: playlistId,
          currentTime: 0
        };
      });
      setIsMini(false);

      // 2. Lưu vào lịch sử xem
      saveWatchHistory({
        id: currentVideoId,
        title: currentPlaying.title || name,
        uploader: currentPlaying.uploaderName || uploader,
        uploaderAvatar: playlistData?.uploaderAvatar,
        thumbnail: currentPlaying.thumbnail || `https://i.ytimg.com/vi/${currentVideoId}/hqdefault.jpg`,
        duration: currentPlaying.duration,
        views: currentPlaying.views || 0
      });
    }
  }, [currentVideoId, currentPlaying, playlistId, name, uploader, playlistData, setActiveVideo, setIsMini]);

  const handleSelectVideo = (vidId) => {
    if (!vidId) return;
    setSelectedVideoId(vidId);
    setSearchParams({ v: vidId }, { replace: true });

    // Cuộn mượt lên player trên điện thoại
    if (typeof window !== "undefined" && window.innerWidth <= 1024) {
      const playerBox = document.getElementById("yt-playlist-player-wrapper");
      if (playerBox) {
        playerBox.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }
  };

  const handlePrevVideo = () => {
    if (activeIndex > 0) {
      const prevVid = videos[activeIndex - 1];
      const prevId = prevVid.id || extractVideoId(prevVid.url);
      handleSelectVideo(prevId);
    }
  };

  const handleNextVideo = () => {
    if (activeIndex >= 0 && activeIndex < videos.length - 1) {
      const nextVid = videos[activeIndex + 1];
      const nextId = nextVid.id || extractVideoId(nextVid.url);
      handleSelectVideo(nextId);
    }
  };

  return (
    <div className="yt-page yt-theme-dark yt-playlist-page">
      <Helmet>
        <title>
          {currentPlaying?.title
            ? `${currentPlaying.title} | ${name} - TecedeYT`
            : `${name} - Danh sách phát TecedeYT`}
        </title>
        <meta
          name="description"
          content={`Xem trọn bộ danh sách phát ${name} của ${uploader} không quảng cáo trên TecedeYT.`}
        />
      </Helmet>

      <YouTubeHeader />

      <main className="yt-playlist-main">
        <div className="yt-playlist-container">
          {/* CỘT TRÁI: KHUNG PHÁT VIDEO CHÍNH VÀ THÔNG TIN PLAYLIST */}
          <div className="yt-playlist-player-col" id="yt-playlist-player-wrapper">
            <div id="yt-playlist-slot" className="yt-playlist-embed-box yt-watch-slot">
              {isMini && (
                <div className="yt-player-minimized-placeholder">
                  <div className="placeholder-content">
                    <FaClone className="placeholder-icon" />
                    <div className="placeholder-text">
                      <h4>Video đang phát ở góc màn hình</h4>
                      <p>Bấm vào biểu tượng phóng to ở khung thu nhỏ để xem lại tại đây</p>
                    </div>
                    <button
                      type="button"
                      className="btn-restore-player"
                      onClick={maximizePlayer}
                    >
                      <FaExpand className="me-1" /> Phóng to lên đây
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* THANH ĐIỀU KHIỂN CHUYỂN VIDEO PLAYLIST */}
            {videos.length > 1 && (
              <div className="yt-playlist-controls-bar">
                <button
                  type="button"
                  className="btn-pl-nav"
                  onClick={handlePrevVideo}
                  disabled={activeIndex <= 0}
                  title="Video trước"
                >
                  <FaStepBackward className="me-1" /> Video trước
                </button>

                <div className="pl-now-playing-info">
                  <span className="now-label">Đang phát:</span>
                  <span className="now-title" title={currentPlaying?.title}>
                    {currentPlaying?.title || `Video #${activeIndex + 1}`}
                  </span>
                </div>

                <button
                  type="button"
                  className="btn-pl-nav"
                  onClick={handleNextVideo}
                  disabled={activeIndex >= videos.length - 1}
                  title="Video tiếp theo"
                >
                  Tiếp theo <FaStepForward className="ms-1" />
                </button>
              </div>
            )}

            {/* THÔNG TIN CHI TIẾT DANH SÁCH PHÁT & VIDEO */}
            <div className="yt-playlist-info-card">
              <div className="playlist-title-row">
                <div>
                  <h1 className="playlist-title">{name}</h1>
                  {currentPlaying?.title && (
                    <h2 className="current-video-subtitle">
                      <FaPlay className="me-2 text-danger" />
                      {currentPlaying.title}
                    </h2>
                  )}
                </div>

                <div className="playlist-action-btns">
                  {currentVideoId && (
                    <Link
                      to={`/tecede-yt/watch/${currentVideoId}`}
                      className="btn-open-watch"
                      title="Mở xem riêng tại trang xem video đầy đủ"
                    >
                      <FaExternalLinkAlt className="me-1" /> Xem trang video
                    </Link>
                  )}
                  {currentVideoId && (
                    <a
                      href={`https://www.youtube.com/watch?v=${currentVideoId}&list=${playlistId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-open-watch btn-open-yt"
                      title="Mở trực tiếp trên YouTube"
                    >
                      <FaExternalLinkAlt className="me-1" /> YouTube
                    </a>
                  )}
                </div>
              </div>

              <div className="playlist-meta-row">
                {channelUrl ? (
                  <Link to={channelUrl} className="playlist-author-link">
                    <FaUser className="me-1" />
                    <span>{uploader}</span>
                  </Link>
                ) : (
                  <span className="playlist-author-text">
                    <FaUser className="me-1" />
                    <span>{uploader}</span>
                  </span>
                )}

                {videosCount > 0 && (
                  <>
                    <span className="dot">•</span>
                    <span className="videos-count">
                      <FaListUl className="me-1" />
                      {videosCount} video
                    </span>
                  </>
                )}

                <button
                  type="button"
                  className="btn-share-pl"
                  onClick={handleSharePlaylist}
                  title="Chia sẻ danh sách phát"
                >
                  <FaShareAlt className="me-1" /> Chia sẻ
                </button>
              </div>

              {playlistData?.description && (
                <p className="playlist-desc">{playlistData.description}</p>
              )}
            </div>
          </div>

          {/* CỘT PHẢI: DANH SÁCH TẤT CẢ VIDEO ĐỂ NGƯỜI DÙNG CHỌN */}
          <div className="yt-playlist-items-col">
            {isLoading ? (
              <div className="yt-playlist-loading">
                <FaSpinner className="yt-spin-icon" />
                <p>Đang tải danh sách phát...</p>
              </div>
            ) : (
              <>
                <div className="playlist-sidebar-header">
                  <div className="title-and-badge">
                    <h3 className="list-title">Danh sách video</h3>
                    <span className="count-pill">
                      {activeIndex >= 0 ? `${activeIndex + 1}/` : ""}
                      {videos.length || videosCount} video
                    </span>
                  </div>

                  {/* Tìm kiếm nhanh trong danh sách phát nếu có nhiều video */}
                  {videos.length > 5 && (
                    <div className="playlist-filter-bar">
                      <FaSearch className="filter-icon" />
                      <input
                        type="text"
                        placeholder="Tìm video trong danh sách..."
                        value={filterKeyword}
                        onChange={(e) => setFilterKeyword(e.target.value)}
                        className="filter-input"
                      />
                      {filterKeyword && (
                        <button
                          type="button"
                          className="btn-clear-filter"
                          onClick={() => setFilterKeyword("")}
                          title="Xoá tìm kiếm"
                        >
                          <FaTimes />
                        </button>
                      )}
                    </div>
                  )}
                </div>

                {filteredVideos.length === 0 ? (
                  <div className="empty-playlist-msg">
                    {filterKeyword ? "Không tìm thấy video phù hợp." : "Danh sách chưa có video."}
                  </div>
                ) : (
                  <div className="yt-playlist-videos-list">
                    {filteredVideos.map((vid, idx) => {
                      const vidId = vid.id || extractVideoId(vid.url);
                      const isActive = vidId === currentVideoId;
                      const originalIndex = videos.findIndex((v) => (v.id || extractVideoId(v.url)) === vidId);
                      const displayIndex = originalIndex >= 0 ? originalIndex + 1 : idx + 1;

                      return (
                        <div
                          key={vidId || idx}
                          ref={isActive ? activeItemRef : null}
                          className={`yt-playlist-video-row ${isActive ? "active" : ""}`}
                          onClick={() => handleSelectVideo(vidId)}
                          role="button"
                          tabIndex={0}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === " ") {
                              handleSelectVideo(vidId);
                            }
                          }}
                        >
                          <span className="row-index">
                            {isActive ? <FaPlay className="playing-pulse-icon" /> : displayIndex}
                          </span>

                          <div className="row-thumb-box">
                            <img
                              src={cleanImageUrl(vid.thumbnail, vidId)}
                              alt={vid.title}
                              className="row-thumb"
                              loading="lazy"
                              onError={(e) => {
                                e.target.onerror = null;
                                if (vidId) {
                                  e.target.src = `https://i.ytimg.com/vi/${vidId}/hqdefault.jpg`;
                                }
                              }}
                            />
                            {vid.duration ? (
                              <span className="row-duration">
                                {formatDuration(vid.duration)}
                              </span>
                            ) : null}
                          </div>

                          <div className="row-details">
                            <h4 className="row-title" title={vid.title}>
                              {vid.title}
                            </h4>
                            <span className="row-author">{vid.uploaderName || uploader}</span>
                            {isActive && (
                              <span className="active-badge">
                                <span className="pulse-dot"></span> Đang phát
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
