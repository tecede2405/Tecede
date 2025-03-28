import React, { useEffect, useState } from "react";
import "./loading.scss"; // Import file CSS

const Loading = () => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 3000); // Loading sẽ biến mất sau 3 giây hoặc khi trang tải xong

    return () => clearTimeout(timer);
  }, []);

  if (!loading) return null; // Ẩn component nếu đã load xong

  return (
    <div className="loading-screen">
      <div className="terminal-loader">
        <div className="terminal-header">
          <div className="terminal-title">Hey Bro :</div>
          <div className="terminal-controls">
            <div className="control close"></div>
            <div className="control minimize"></div>
            <div className="control maximize"></div>
          </div>
        </div>
        <div className="text">Chờ Xíu...</div>
      </div>
    </div>
  );
};

export default Loading;
