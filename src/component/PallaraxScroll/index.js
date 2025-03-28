import React, { useState, useEffect } from "react";
import "./scroll.scss";

function Hero() {
  const [offsetY, setOffsetY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const scrollPos = window.scrollY;
      const maxOffset = 200; // Giới hạn di chuyển tối đa

      if (scrollPos < maxOffset) {
        setOffsetY(scrollPos);
      } else {
        setOffsetY(maxOffset - (scrollPos - maxOffset)); // Đảo chiều hiệu ứng
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="hero">
      <img
        src="https://tse1.mm.bing.net/th?id=OIP.hVVw7xU8cckAAwlRMMQ-_AHaD4&pid=Api&P=0&h=180"
        alt="left-img"
        className="hero__img hero__img-left"
        style={{ transform: `translateX(-${offsetY * 0.5}px)` }}
      />
      <img
        src="https://tse1.mm.bing.net/th?id=OIP.hVVw7xU8cckAAwlRMMQ-_AHaD4&pid=Api&P=0&h=180"
        alt="right-img"
        className="hero__img hero__img-right"
        style={{ transform: `translateX(${offsetY * 0.5}px)` }}
      />
    </div>
  );
}

export default Hero;
