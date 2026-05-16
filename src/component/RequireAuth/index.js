import { Navigate } from "react-router-dom";

export default function RequireAuth({ children }) {
  const user = JSON.parse(localStorage.getItem("user"));

  if (!user || user.role !== "admin") {
    return <Navigate to="/" replace />;
  }
  return children;
}
