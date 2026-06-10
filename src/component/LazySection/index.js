import { useInView } from "react-intersection-observer";

export default function LazySection({
  children,
  height = 450,
}) {
  const { ref, inView } = useInView({
    triggerOnce: true,
    rootMargin: "600px",
  });

  return (
    <div
      ref={ref}
      style={{
        contentVisibility: "auto",
        containIntrinsicSize: `${height}px`,
      }}
    >
      {inView ? children : <div style={{ height }} />}
    </div>
  );
}