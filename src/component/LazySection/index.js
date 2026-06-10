import { useInView } from "react-intersection-observer";
import { useState, useEffect } from "react";

export default function LazySection({ children }) {
  const { ref, inView } = useInView({
    triggerOnce: true,
    rootMargin: "300px",
  });

  const [shouldRender, setShouldRender] = useState(false);

  useEffect(() => {
    if (inView) {
      setShouldRender(true);
    }
  }, [inView]);

  return (
    <div ref={ref}>
      {shouldRender ? (
        children
      ) : (
        <div
          style={{
            height: 350,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <div className="spinner-border text-light" />
        </div>
      )}
    </div>
  );
}