import { useInView } from "react-intersection-observer";

export function LazyChartOnScroll({
  children,
}: {
  children: React.ReactNode;
}) {
  const { ref, inView } = useInView({
    triggerOnce: true,
    rootMargin: "100px 0px",
  });

  return (
    <div ref={ref}>
      {inView && children}
    </div>
  );
}