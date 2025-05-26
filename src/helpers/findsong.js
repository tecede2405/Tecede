// helpers.js
export function filterSongsByKeyword(list, keyword) {
  if (!keyword.trim()) return [];

  return list.filter((song) =>
    song.title.toLowerCase().startsWith(keyword.toLowerCase()) ||
    song.artist.toLowerCase().startsWith(keyword.toLowerCase())
  );
}
