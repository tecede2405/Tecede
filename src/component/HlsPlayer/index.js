import { useEffect, useRef } from "react";
import Hls from "hls.js";
import Plyr from "plyr";
import "plyr/dist/plyr.css";
import "./style.scss";

export default function HlsPlayer({ src, onEnded, title, episode, thumbnail }) {
  const videoRef = useRef(null);
  const plyrRef = useRef(null);
  const hlsRef = useRef(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !src) return;

    // Init Plyr ONCE
    if (!plyrRef.current) {
  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

  plyrRef.current = new Plyr(video, {
    controls: isMobile
      ? [
          "play-large",
          "play",
          "progress",      // thanh tua chiếm phần lớn
          "current-time",
          "mute",          // chỉ có nút bật/tắt tiếng
          "fullscreen",
        ]
      : [
          "play-large",
          "play",
          "progress",
          "current-time",
          "mute",
          "volume",        // desktop có thanh volume
          "settings",
          "fullscreen",
        ],
  });
}

    if (hlsRef.current) {
      hlsRef.current.detachMedia();
      hlsRef.current.destroy();
      hlsRef.current = null;
    }

    if (Hls.isSupported()) {
      const hls = new Hls();
      hlsRef.current = hls;

      hls.loadSource(src);
      hls.attachMedia(video);

      hls.once(Hls.Events.MANIFEST_PARSED, () => {
        video.play().catch(() => {});
      });
    } else {
      video.src = src;
      video.play().catch(() => {});
    }

    video.onended = () => onEnded?.();

    return () => {
      if (hlsRef.current) {
        hlsRef.current.detachMedia();
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [src, onEnded]);

  useEffect(() => {
  const video = videoRef.current;
  if (!video || !src) return;

  const savedTime = localStorage.getItem(`progress-${src}`);
  if (savedTime) {
    video.currentTime = parseFloat(savedTime);
  }

  const saveProgress = () => {
    localStorage.setItem(`progress-${src}`, video.currentTime.toString());
  };

  video.addEventListener("timeupdate", saveProgress);

  return () => {
    video.removeEventListener("timeupdate", saveProgress);
  };
}, [src]);

  useEffect(() => {
  const video = videoRef.current;
  if (!video || !src) return;

  // Cập nhật Media Session
  if ("mediaSession" in navigator) {
    navigator.mediaSession.metadata = new MediaMetadata({
      title: title,
      artist: episode,
      artwork: [{ src: thumbnail, sizes: "512x512", type: "image/jpeg" }],
    });


    navigator.mediaSession.setActionHandler("play", () => video.play());
    navigator.mediaSession.setActionHandler("pause", () => video.pause());
    navigator.mediaSession.setActionHandler("seekto", (details) => {
      if (details.fastSeek && "fastSeek" in video) {
        video.fastSeek(details.seekTime);
      } else {
        video.currentTime = details.seekTime;
      }
    });
  }
}, [src, title, episode, thumbnail]);

  return(
    <>
    <div className="video-wrapper">
      <video
        ref={videoRef}
        className="movie-video"
        playsInline
        preload="metadata"
      />
    </div>
    </>
  )
}