"use client";

import { Activity, Info } from "lucide-react";





// ============================================================================
// 1. SUBCOMPONENTE REUTILIZABLE PARA LOS CUADROS 3D
// ============================================================================
interface CuadroMetricaProps {
  label: string;
  valor: number;
  esPrimario?: boolean;
}

function CuadroMetrica({ label, valor, esPrimario = false }: CuadroMetricaProps) {
  return (
  <div 
      className={`
        flex flex-col items-center justify-center aspect-square rounded-2xl 
        border-3 shadow-2xl border-slate-900 bg-white transition-all duration-300
        /* Sombra sólida (Shade) */
        
        
        
       active:translate-x-2 active:translate-y-2
        active:shadow-[0px_0px_0px_0px_rgba(15,23,42,1)]
        
        w-44 h-44
      `/**
      shadow-[8px_8px_0px_0px_rgba(15,23,42,1)] 
      hover:shadow-[12px_12px_0px_0px_rgba(15,23,42,1)]  
      hover:-translate-y-1 hover:-translate-x-1 

      active:translate-y-1 active:translate-x-1
      active:shadow-[0px_0px_0px_0px_rgba(15,23,42,1)]
      */
    }
    >
     <span className="text-15 font-bold text-slate-500 uppercase tracking-[0.2em] mb-2">
  {label}
</span>
<span 
  className={`text-5xl font-black tracking-tighter ${
    esPrimario ? "text-blue-600" : "text-slate-900"
  }`}
  style={{
    textShadow: esPrimario 
      ? '1px 1px 2px rgba(0,0,0,0.4), -1px -1px 1px rgba(255,255,255,0.3)'
      : '1px 1px 2px rgba(0,0,0,0.5), -1px -1px 1px rgba(255,255,255,0.25)'
  }}
>
  {valor}
</span>
    </div>
  );
}





// ============================================================================
// 2. COMPONENTE PRINCIPAL
// ============================================================================
interface AnaliticaPorCantidadProps {
  titulo: string;
  descripcion: string;
  datos: {
    hoy: number;
    ayer: number;
    mes: number;
    anio: number;
  };
}

export default function AnaliticaPorCantidad({
  titulo,
  descripcion,
  datos,
}: AnaliticaPorCantidadProps) {
  return (
    <div className="flex flex-col gap-6 w-full pl-2 md:pl-4">
      
      {/* Encabezado con Iconos */}
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center gap-2">
          <Activity className="h-5 w-5 text-blue-600" />
          <h2 className="text-xl font-bold text-slate-800 tracking-tight">{titulo}</h2>
        </div>
        <div className="flex items-start gap-1.5">
          <Info className="h-4 w-4 text-slate-400 shrink-0 mt-0.5" />
          <p className="text-sm text-slate-500 leading-relaxed">{descripcion}</p>
        </div>
      </div>

      {/* Contenedor Flex Responsivo invocando el subcomponente */}
      <div className="flex flex-wrap gap-5 w-full">
        <CuadroMetrica label="Hoy" valor={datos.hoy} esPrimario={true} />
        <CuadroMetrica label="Ayer" valor={datos.ayer} />
        <CuadroMetrica label="Este Mes" valor={datos.mes} />
        <CuadroMetrica label="Este Año" valor={datos.anio} />
      </div>

      {/* ESPACIO PARA LAS GRÁFICAS */}
      <div className="w-full mt-6 flex flex-col gap-6">
        {/* Aquí integraremos Recharts */}
      </div>

    </div>
  );
}