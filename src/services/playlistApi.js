// src/services/playlistApi.js

const API_BASE =
  process.env.REACT_APP_API_URL ||
  "https://my-worker-backend.pqtmv2.workers.dev";

const PLAYLIST_ENDPOINT = `${API_BASE}/api/playlists`;

/**
 * 1. Tạo playlist mới
 * POST /api/playlists
 */
export const createPlaylist = async (token, { name, description = "", thumbnail = "" }) => {
  const payload = {
    name: name.trim(),
    description: (description || "").trim(),
  };
  if (thumbnail && thumbnail.trim()) {
    payload.thumbnail = thumbnail.trim();
  }

  const res = await fetch(PLAYLIST_ENDPOINT, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
  return res.json();
};

/**
 * 2. Lấy danh sách playlist của user
 * GET /api/playlists
 */
export const getMyPlaylists = async (token) => {
  const res = await fetch(PLAYLIST_ENDPOINT, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });
  return res.json();
};

/**
 * 3. Lấy chi tiết playlist & all bài hát trong playlist
 * GET /api/playlists/:id
 */
export const getPlaylistDetail = async (token, playlistId) => {
  const res = await fetch(`${PLAYLIST_ENDPOINT}/${playlistId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });
  return res.json();
};

/**
 * 4. Thêm bài hát vào playlist
 * POST /api/playlists/:id/songs
 */
export const addSongToPlaylist = async (token, playlistId, song) => {
  const bodyData = {
    song_id: String(song.song_id || song._id || song.id),
    title: song.title || "Bài hát không tên",
    artist: song.artist || "Nhiều nghệ sĩ",
    image:
      song.image ||
      "https://i.ibb.co/tpQF1yq5/85ea2a41bcba853ca1656f17b54d6a71.webp",
    file: song.file || "",
    category: song.category || song.dbType || "nhactre",
    duration: typeof song.duration === "number" ? song.duration : 0,
  };

  const res = await fetch(`${PLAYLIST_ENDPOINT}/${playlistId}/songs`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(bodyData),
  });
  return res.json();
};

/**
 * 5. Xóa 1 bài hát khỏi playlist
 * DELETE /api/playlists/:id/songs/:song_id
 */
export const removeSongFromPlaylist = async (token, playlistId, songId) => {
  const res = await fetch(`${PLAYLIST_ENDPOINT}/${playlistId}/songs/${songId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });
  return res.json();
};

/**
 * 6. Xóa toàn bộ playlist
 * DELETE /api/playlists/:id
 */
export const deletePlaylist = async (token, playlistId) => {
  const res = await fetch(`${PLAYLIST_ENDPOINT}/${playlistId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });
  return res.json();
};
