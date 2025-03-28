import { useState, useEffect } from "react";

function CustomCursor() {
  const [position, setPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const moveCursor = (e) => {
      requestAnimationFrame(() => {
        setPosition({ x: e.clientX, y: e.clientY });
      });
    };

    window.addEventListener("mousemove", moveCursor);
    return () => window.removeEventListener("mousemove", moveCursor);
  }, []);

  return (
    <div
      className="custom-cursor"
      style={{
        transform: `translate(${position.x}px, ${position.y}px)`,
      }}
    />
  );
}

export default CustomCursor;
