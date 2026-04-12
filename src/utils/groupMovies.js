const API_URL = `${process.env.REACT_APP_SERVER_API_URL}/movies`

export const fetchMovies = async () => {
  const res = await fetch(API_URL)
  if (!res.ok) throw new Error("Failed to fetch movies")

  return res.json()
}

// group theo category
export const groupMoviesByCategory = (movies = []) => {
  return {
    "phim-hot": movies.filter(m => m.category === "phim-hot"),
    "high-rate-film": movies.filter(m => m.category === "high-rate-film"),
    "phim-moi": movies.filter(m => m.category === "phim-moi"),
    "anime-moi": movies.filter(m => m.category === "anime-moi"),
    "phim-hot-2": movies.filter(m => m.category === "phim-hot-2"),
    "korea-film": movies.filter(m => m.category === "korea-film"),
    "china-film": movies.filter(m => m.category === "china-film"),
    "china3d": movies.filter(m => m.category === "china3d"),
    "anime": movies.filter(m => m.category === "anime"),
    "phim-noi-bat": movies.filter(m => m.category === "phim-noi-bat"),
    "phim-chieu-rap": movies.filter(m => m.category === "phim-chieu-rap"),
    "tokusatsu": movies.filter(m => m.category === "tokusatsu"),
  }
}