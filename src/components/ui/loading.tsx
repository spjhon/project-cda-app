export default function Loading() {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background/80 backdrop-blur-md transition-all duration-500">
      <div className="relative flex items-center justify-center">
        {/* Anillo exterior con gradiente y rotación suave */}
        <div className="h-16 w-16 animate-spin rounded-full border-2 border-transparent border-t-primary border-r-primary/30" />

        {/* Círculo interior con efecto de pulso */}
        <div className="absolute flex h-10 w-10 animate-pulse items-center justify-center rounded-full bg-primary/10">
          <div className="h-2 w-2 rounded-full bg-primary" />
        </div>
      </div>

      {/* Texto sutil con espaciado elegante */}
      <div className="mt-6 flex flex-col items-center space-y-2">
        <span className="animate-pulse text-sm font-medium uppercase tracking-widest text-muted-foreground">
          Cargando...⌚
        </span>

        <div className="h-px w-12 bg-linear-to-r from-transparent via-primary/50 to-transparent" />
      </div>
    </div>
  );
}