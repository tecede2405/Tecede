import React, { useEffect, useState } from 'react';
import allSongs from '../../data/vpopSongs';

const shuffleArray = (array) => array.sort(() => Math.random() - 0.5);

const BackgroundMusic = () => {
  const [isPlaying, setIsPlaying] = useState(false);  
  const [playlist, setPlaylist] = useState(shuffleArray([...allSongs]));
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const audio = document.getElementById('background-music');
    if (isPlaying) {
      audio.play();
    } else {
      audio.pause();
    }

    const handleSongEnd = () => {
      if (currentIndex < playlist.length - 1) {
        setCurrentIndex((prevIndex) => prevIndex + 1);
      } else {
        setPlaylist(shuffleArray([...allSongs]));
        setCurrentIndex(0);
      }
    };

    audio.addEventListener('ended', handleSongEnd);
    return () => {
      audio.removeEventListener('ended', handleSongEnd);
    };
  }, [isPlaying, currentIndex, playlist]);

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  return (
    <div>
      <audio id="background-music" src={playlist[currentIndex].file} autoPlay={isPlaying} />
      <button onClick={togglePlay} className="toggle-button">
        {isPlaying ? 'Tắt nhạc' : 'Bật nhạc'}
      </button>
    </div>
  );
};

export default BackgroundMusic;
