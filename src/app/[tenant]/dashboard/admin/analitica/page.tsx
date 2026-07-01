"use client";

import AnaliticaPorCantidad from "@/components/dashboard/admin/AnaliticaPorCantidad";


export default function AnaliticaPage() {
  return (
    // section proporciona la raíz semántica. px-4 o px-6 da el margen sutil para que nada toque los bordes.
    <section className="w-full px-6 py-4 flex flex-col gap-6 bg-[#FAFAFA]">
      
      {/* header agrupa el bloque de presentación de la página */}
      <header className="w-full border-b border-slate-100 pb-4">
        <h1 
          className="text-3xl font-black tracking-wider text-slate-800 uppercase select-none drop-shadow-sm"
          
        >
          Analítica
        </h1>

        <p className="mt-2 text-sm text-slate-500 max-w-2xl leading-relaxed">
          Monitor de rendimiento general y financiero. Supervisa el flujo de caja, las tasas de aprobación y el cumplimiento de los tiempos normativos (ISO 17020) en tiempo real.
        </p>
      </header>

      {/* 🌟 AQUÍ IRÁ EL CONTENEDOR PRINCIPAL DE LOS GRÁFICOS EN EL SIGUIENTE PASO */}
      <div className="flex flex-col gap-6 w-full">
        <AnaliticaPorCantidad 
          titulo="Inspecciones Realizadas" 
          descripcion="Volumen total de vehículos que han ingresado a la línea de revisión (Primeras entradas)."
          datos={{ hoy: 24, ayer: 31, mes: 450, anio: 5420 }} 
        />
      </div>

      <div className="flex flex-col gap-6 w-full">
        <AnaliticaPorCantidad 
          titulo="Tasa de Rechazo" 
          descripcion="Datos sobre la tasa de rechazo en diferentes rangos de tiempo."
          datos={{ hoy: 6, ayer: 3, mes: 125, anio: 1255 }} 
        />
      </div>


      <div className="flex flex-col gap-6 w-full">
        <AnaliticaPorCantidad 
          titulo="Soats Vendidos" 
          descripcion="Cantidad de ordenes de entrada marcadas con que se vendieron soats tambien."
          datos={{ hoy: 8, ayer: 9, mes: 90, anio: 150 }} 
        />
      </div>



    </section>
  );
}