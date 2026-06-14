import { useEffect, useState } from "react";
import "./style.scss";

export default function LoadingScreen({ onFinish }) {
  const [progress, setProgress] = useState(0);
  const [done, setDone] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        const next = prev + Math.random() * 8;

        if (next >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            setDone(true);
            setTimeout(() => {
              onFinish?.(); // callback khi xong loading
            }, 600);
          }, 300);
          return 100;
        }

        return next;
      });
    }, 80);

    return () => clearInterval(interval);
  }, [onFinish]);

  return (
    <div className="loading-screen">
      <div className={`logo ${done ? "zoom-in" : ""}`}>
        <img
          src="https://i.ibb.co/C3PLG9T9/2c06afde0ebca0c687b0d3add5f4b1f2.webp"
          alt="logo"
        />
        
      </div>
       <p className="loading-text2">Đang tải...</p>

      <div className="bar">
        <div
          className="progress"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}