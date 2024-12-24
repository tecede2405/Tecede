import React, { useEffect, useState } from 'react';
import nhactet from '../../audio/nhactet.mp3';

const BackgroundMusic = () => {
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    const audio = document.getElementById('background-music');
    if (isPlaying) {
      audio.play();
    } else {
      audio.pause();
    }
  }, [isPlaying]);

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  return (
    <div>
      <audio id="background-music" loop className="hidden-audio">
        <source src={ nhactet } type="audio/mpeg" />
        Your browser does not support the audio tag.
      </audio>
      <button onClick={togglePlay} className="toggle-button">
        {isPlaying ? 'Tắt nhạc' : 'Bật nhạc'}
      </button>
    </div>
  );
}

export default BackgroundMusic;
