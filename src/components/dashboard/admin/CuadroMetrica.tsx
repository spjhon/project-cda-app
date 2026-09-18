
"use client";

import { AdminContext } from "@/contexts/AdminLoaderContext";
import { useContext } from "react";

// ============================================================================
// 1. SUBCOMPONENTE REUTILIZABLE PARA LOS CUADROS 3D
// ============================================================================

interface CuadroMetricaProps {
  label: string;
  valor: number;
  esPrimario?: boolean;
  isPorcentaje: boolean;
}

export function CuadroMetrica({
  label,
  valor,
  esPrimario = false,
  isPorcentaje = false,
}: CuadroMetricaProps) {
  const adminContextReceived = useContext(AdminContext);

  const analyticsQuery = adminContextReceived?.AdminContextValue.analyticsQuery;

  return (
    <div
      className={`
        flex flex-col items-center justify-center aspect-square
        border border-slate-300 bg-card transition-all duration-300
        active:translate-x-2 active:translate-y-2
        active:shadow-[0px_0px_0px_0px_rgba(15,23,42,1)]
        w-44 h-44
      `}
    >
      <span className="text-15 font-bold text-muted-500 uppercase tracking-[0.2em] mb-2 text-center px-2">
        {label}
      </span>

      <span
        className={`
          tracking-tighter text-center px-2 font-black
          ${
            esPrimario
              ? "text-blue-600 text-5xl"
              : "text-muted-900 text-5xl"
          }
          ${isPorcentaje ? "text-4xl" : ""}
        `}
        style={{
          textShadow: esPrimario
            ? "1px 1px 2px rgba(0,0,0,0.4), -1px -1px 1px rgba(255,255,255,0.3)"
            : "1px 1px 2px rgba(0,0,0,0.5), -1px -1px 1px rgba(255,255,255,0.25)",
        }}
      >
        {analyticsQuery?.isLoading ? (
          <span className="inline-block w-8 h-8 border-4 border-muted-300 border-t-blue-600 rounded-full animate-spin" />
        ) : (
          <>
            {valor}

            {isPorcentaje && (
              <span className="text-2xl ml-0.5">%</span>
            )}
          </>
        )}
      </span>
    </div>
  );
}
