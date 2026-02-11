import React, { useEffect, useState } from "react";
import "./loading.scss";

const Loading = () => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 3500);

    return () => clearTimeout(timer);
  }, []);

  if (!loading) return null;

  return (
    <div className="tetloading-screen">
      <div className="tet-box">
        <img
          src="https://thammylinhanh.vn/wp-content/uploads/2025/12/tai-hinh-anh-chuc-tet-2026.jpg"
          alt="Happy New Year"
        />
        <p className="loading-text">Đợi tí nhé bạn iu <span className="spinner-loading"></span></p>
        <p>Chúc bạn có 1 cái tết <b>đầm ấm và hạnh phúc bên gia đình</b> nhé!</p>
      </div>
    </div>
  );
};

export default Loading;
