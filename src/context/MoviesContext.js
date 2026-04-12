import { createContext, useContext, useEffect, useState } from "react";
import { fetchMovies, groupMoviesByCategory } from "../utils/groupMovies";

const MoviesContext = createContext();

export const MoviesProvider = ({ children }) => {
  const [grouped, setGrouped] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const data = await fetchMovies();
      setGrouped(groupMoviesByCategory(data));
      setLoading(false);
    };

    load();
  }, []);

  return (
    <MoviesContext.Provider value={{ grouped, loading }}>
      {children}
    </MoviesContext.Provider>
  );
};

export const useMovies = () => useContext(MoviesContext);