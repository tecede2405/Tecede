import React, { useEffect, useState } from "react";
import "./loading.scss";

const Loading = () => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  if (!loading) return null;

  return (
    <div className="tetloading-screen">
      <div className="tet-box">
        <img
          src="https://cdn-media.sforum.vn/storage/app/media/giakhanh/h%C3%ACnh%20%C4%91%E1%BB%99ng%20ch%C3%BAc%20m%E1%BB%ABng%20n%C4%83m%20m%E1%BB%9Bi/hinh-dong-chuc-mung-nam-moi-31.gif"
          alt="Happy New Year"
        />
        <p>Đợi tí nhé bạn iu...</p>
        <p>Chúc bạn có 1 cái tết <b>đầm ấm và hạnh phúc bên gia đình</b> nhé!</p>
      </div>
    </div>
  );
};

export default Loading;
