const HISTORY_KEY = "watch_history";

export const saveToHistory = (movie) => {
  if (!movie?.title || !movie?.image) return; // ❗ chặn luôn

  let history = JSON.parse(localStorage.getItem("history")) || [];

  history = history.filter((item) => item.path !== movie.path);

  history.unshift(movie);

  localStorage.setItem("history", JSON.stringify(history));
};

export const getHistory = () => {
  return JSON.parse(localStorage.getItem(HISTORY_KEY)) || [];
};
