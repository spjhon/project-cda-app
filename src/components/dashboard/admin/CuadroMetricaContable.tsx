"use client";

interface CuadroMetricaContableProps {
  label: string;
  valor: number;
  esPrimario?: boolean;
  isLoading: boolean;
}

export function CuadroMetricaContable({
  label,
  valor,
  esPrimario = false,
  isLoading,
}: CuadroMetricaContableProps) {
  return (
    <div
      className={`
        flex flex-col items-center justify-center
        border border-slate-300 bg-card transition-all duration-300
        active:translate-x-2 active:translate-y-2
        active:shadow-[0px_0px_0px_0px_rgba(15,23,42,1)]
        w-full min-w-56 h-40
        px-6
      `}
    >
      <span className="text-sm font-bold text-muted-foreground uppercase tracking-[0.2em] mb-3 text-center">
        {label}
      </span>

      <span
        className={`
          tracking-tighter text-center font-black whitespace-nowrap
          ${esPrimario ? "text-blue-600" : "text-foreground"}
          text-4xl
        `}
        style={{
          textShadow: esPrimario
            ? "1px 1px 2px rgba(0,0,0,0.4), -1px -1px 1px rgba(255,255,255,0.3)"
            : "1px 1px 2px rgba(0,0,0,0.5), -1px -1px 1px rgba(255,255,255,0.25)",
        }}
      >
        {isLoading ? (
          <span className="inline-block w-8 h-8 border-4 border-muted-300 border-t-blue-600 rounded-full animate-spin" />
        ) : (
          `$ ${valor.toLocaleString("es-CO")}`
        )}
      </span>
    </div>
  );
}