import { createContext, useContext, useEffect, useState, useCallback } from "react";

const CommentContext = createContext();

export const CommentProvider = ({ children }) => {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchLatestComments = useCallback(async (limit = 10) => {
    try {
      setLoading(true);
      setError(null);
      const baseUrl = process.env.REACT_APP_SERVER_API_URL || "https://movie1-api-worker.nguyengiaminh532.workers.dev";
      const res = await fetch(`${baseUrl}/comments/latest?limit=${limit}`);
      const json = await res.json();

      if (json && json.success && Array.isArray(json.data)) {
        setComments(json.data);
      } else {
        setComments([]);
      }
    } catch (err) {
      console.error("Error fetching latest comments:", err);
      setError(err.message || "Failed to load comments");
      setComments([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLatestComments();
  }, [fetchLatestComments]);

  return (
    <CommentContext.Provider
      value={{
        comments,
        latestComments: comments,
        loading,
        error,
        refreshComments: fetchLatestComments,
      }}
    >
      {children}
    </CommentContext.Provider>
  );
};

export const useComments = () => useContext(CommentContext);
export const useComment = () => useContext(CommentContext);
export default CommentContext;
