import { useInView } from "react-intersection-observer";

export function LazyChartOnScroll({ children }: { children: React.ReactNode }) {
  const { ref, inView } = useInView({
    triggerOnce: true, // Solo dispara la primera vez que se ve al regresar
    rootMargin: "100px 0px", // Comienza a cargar 100px antes de llegar
  });

  return (
    <div ref={ref} className="min-h-75 w-full">
      {inView ? (
        children
      ) : (
        <div className="h-75 w-full animate-pulse bg-muted/20 rounded-lg" />
      )}
    </div>
  );
}