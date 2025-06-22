import { useEffect } from "react";

export default function useAudioManager({
  currentIndex,
  playlist,
  audioRef,
  handleNext,
  handlePrev,
}) {
  // ✅ MEDIA SESSION API
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

      navigator.mediaSession.setActionHandler("play", () =>
        audioRef.current?.play()
      );
      navigator.mediaSession.setActionHandler("pause", () =>
        audioRef.current?.pause()
      );
      navigator.mediaSession.setActionHandler("previoustrack", handlePrev);
      navigator.mediaSession.setActionHandler("nexttrack", handleNext);
    }
  }, [currentIndex, playlist, audioRef, handleNext, handlePrev]);

  // ✅ PHÁT NHẠC CHỈ KHI ĐÃ LOAD ĐỦ
  useEffect(() => {
    if (
      currentIndex !== null &&
      playlist?.[currentIndex] &&
      audioRef.current
    ) {
      const audio = audioRef.current;
      const song = playlist[currentIndex];

      audio.src = song.file;
      audio.load();

      const handleCanPlay = () => {
        audio
          .play()
          .catch((err) => {
            console.warn("Không thể phát:", err);
            handleNext();
          });
      };

      audio.addEventListener("canplaythrough", handleCanPlay);

      return () => {
        audio.removeEventListener("canplaythrough", handleCanPlay);
      };
    }
  }, [currentIndex, playlist, audioRef, handleNext]);

  // ✅ PRELOAD BÀI HÁT TIẾP THEO
  useEffect(() => {
    if (currentIndex !== null && playlist?.length > 1) {
      const nextIndex = (currentIndex + 1) % playlist.length;
      const nextAudio = new Audio(playlist[nextIndex].file);
      nextAudio.preload = "auto";
    }
  }, [currentIndex, playlist]);
}
