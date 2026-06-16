import { useEffect } from "react";

export default function useAudioManager({
  currentIndex,
  playlist,
  audioRef,
  handleNext,
  handlePrev,
}) {
  // ✅ CHỈ DÙNG ĐỂ HIỂN THỊ MEDIA SESSION (KHÔNG GÁN SRC Ở ĐÂY NỮA)
  useEffect(() => {
    if (
      currentIndex !== null &&
      playlist?.[currentIndex] &&
      "mediaSession" in navigator
    ) {
      const song = playlist[currentIndex];

      navigator.mediaSession.metadata = new window.MediaMetadata({
        title: song.title,
        artist: song.artist,
        album: "EDM Playlist",
        artwork: [
          {
            src: song.image,
            sizes: "512x512",
            type: "image/png",
          },
        ],
      });

      navigator.mediaSession.setActionHandler("play", () => audioRef.current?.play());
      navigator.mediaSession.setActionHandler("pause", () => audioRef.current?.pause());
      navigator.mediaSession.setActionHandler("previoustrack", handlePrev);
      navigator.mediaSession.setActionHandler("nexttrack", handleNext);
    }
  }, [currentIndex, playlist, audioRef, handleNext, handlePrev]);

  // ✅ PRELOAD BÀI KẾ TIẾP (Tải ngầm sẵn)
  useEffect(() => {
    if (currentIndex !== null && playlist?.length > 1) {
      const nextIndex = (currentIndex + 1) % playlist.length;
      const nextSong = playlist[nextIndex];
      
      if (nextSong?._id) {
        // Dùng thẳng biến môi trường (nếu chưa deploy thì để localhost:5000)
        const baseUrl = process.env.REACT_APP_API_URL || "http://localhost:5000";
        const nextStreamUrl = `${baseUrl}/api/songs/stream/${nextSong._id}`;
        
        const nextAudio = new Audio(nextStreamUrl);
        nextAudio.preload = "auto";
      }
    }
  }, [currentIndex, playlist]);
}