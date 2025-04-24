import React from 'react';

function NhacTre() {
  const songs = [
    { title: 'Bài hát 1', file: '/audio/song1.mp3' },
    { title: 'Bài hát 2', file: '/audio/song2.mp3' },
    // Thêm bài hát vào đây
  ];

  return (
    <div>
      <h1>Nhạc Trung</h1>
      <ul>
        {songs.map((song, index) => (
          <li key={index}>
            <a href={song.file} target="_blank" rel="noopener noreferrer">{song.title}</a>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default NhacTre;
