"use client";

import AnaliticaPorCantidad from "@/components/dashboard/admin/AnaliticaPorCantidad";
import { AdminContext } from "@/contexts/AdminLoaderContext";
import { useContext } from "react";


export default function AnaliticaPage() {





const adminContextReceived = useContext(AdminContext);

const analyticsData = adminContextReceived?.AdminContextValue.analyticsData
const analyticsDataDiary = adminContextReceived?.AdminContextValue.analyticsDataDiary






// 1. Obtener el día actual forzando la zona horaria de Colombia
const diaActualStr = new Date()
  .toLocaleString("es-CO", { timeZone: "America/Bogota", day: "2-digit" }); 
  // '2-digit' ya nos entrega automáticamente el string con el cero a la izquierda (ej: '04')

// 2. Obtener el mes actual forzando la zona horaria de Colombia
const mesActualRaw = new Date()
  .toLocaleString("es-CO", { timeZone: "America/Bogota", month: "long" });

// Capitalizamos la primera letra (ej: 'julio' -> 'Julio')
const mesFormateado = mesActualRaw.charAt(0).toUpperCase() + mesActualRaw.slice(1);



// Guardamos el valor en una constante segura (si es undefined, vale 0)
const totalHoy = analyticsDataDiary?.total_rtm_hoy ?? 0;






const completeDataRTM = analyticsData 
  ? {
      ...analyticsData, // Copia todas las propiedades originales (totales y gráficos)
      
      // Inyectamos la nueva propiedad con el dato fresco del polling
      total_rtm_hoy: totalHoy,
      
      // Mantenemos el total de ayer intacto (viene directo del RPC histórico)
      total_rtm_ayer: analyticsData.total_rtm_ayer,
      
      // Le sumamos lo de hoy al acumulado del mes y del año en tiempo real
      total_rtm_mes_actual: analyticsData.total_rtm_mes_actual + totalHoy,
      total_rtm_anio_actual: analyticsData.total_rtm_anio_actual + totalHoy,


// 1. ACTUALIZAR GRÁFICO DEL MES (Eje X: Días '01', '02'...)
      chart_mes_actual: analyticsData.chart_mes_actual?.map((item) => {
        if (item.dia === diaActualStr) {
          return { ...item, total: item.total + totalHoy }; // Suma en tiempo real al día de hoy
        }
        return item; // Los demás días se quedan intactos
      }) ?? [],

      // 2. ACTUALIZAR GRÁFICO DEL AÑO (Eje X: Meses 'Enero', 'Febrero'...)
      chart_anio_actual: analyticsData.chart_anio_actual?.map((item) => {
        if (item.mes === mesFormateado) {
          return { ...item, total: item.total + totalHoy }; // Suma en tiempo real al mes actual
        }
        return item; // Los demás meses se quedan intactos
      }) ?? [],


    }
  : undefined;






  console.log(completeDataRTM)


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
          datos={completeDataRTM} 
        />
      </div>





      






    </section>
  );
}