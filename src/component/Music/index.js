import React, { useEffect, useState } from 'react';
import nhactet from '../../audio/nhactet.mp3';
import lofi from '../../audio/lofi.mp3';
import merry from '../../audio/merry.mp3';
import nhacTrung from '../../audio/nhacTrung.mp3';
const songs = [nhactet, lofi, merry, nhacTrung];

const BackgroundMusic = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentSong, setCurrentSong] = useState(null);

  useEffect(() => {
    const audio = document.getElementById('background-music');
    if (isPlaying && currentSong) {
      audio.play();
    } else {
      audio.pause();
    }

    const handleSongEnd = () => {
      const randomSong = songs[Math.floor(Math.random() * songs.length)];
      setCurrentSong(randomSong);
      audio.play();
    };

    audio.addEventListener('ended', handleSongEnd);

    return () => {
      audio.removeEventListener('ended', handleSongEnd);
    };
  }, [isPlaying, currentSong]);

  const togglePlay = () => {
    if (!isPlaying) {
      const randomSong = songs[Math.floor(Math.random() * songs.length)];
      setCurrentSong(randomSong);
    }
    setIsPlaying(!isPlaying);
  };

  return (
    <div>
      <audio id="background-music" loop className="hidden-audio">
        {currentSong && <source src={currentSong} type="audio/mpeg" />}
      </audio>
      <button onClick={togglePlay} className="toggle-button">
        {isPlaying ? 'Tắt nhạc' : 'Bật nhạc'}
      </button>
    </div>
  );
}

export default BackgroundMusic;

