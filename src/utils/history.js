const HISTORY_KEY = "watch_history";

export const saveToHistory = (film) => {
  const history = JSON.parse(localStorage.getItem(HISTORY_KEY)) || [];

  // Nếu đã tồn tại thì xóa bản cũ (để đưa lên đầu)
  const filtered = history.filter(item => item.path !== film.path);

  const newHistory = [
    {
      ...film,
      watchedAt: Date.now(),
    },
    ...filtered,
  ];

  // Giới hạn 20 phim gần nhất
  localStorage.setItem(
    HISTORY_KEY,
    JSON.stringify(newHistory.slice(0, 20))
  );
};

export const getHistory = () => {
  return JSON.parse(localStorage.getItem(HISTORY_KEY)) || [];
};
