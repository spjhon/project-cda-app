"use client";

import AnaliticaPorCantidad from "@/components/dashboard/admin/AnaliticaPorCantidad";
import { AdminContext } from "@/contexts/AdminLoaderContext";
import { useContext } from "react";
import { DayChartItem, MonthChartItem } from "../layout";





export type CompleteDataRTMType = {
  // ========================================================================
  // TOTALES DIARIOS
  // ========================================================================
  total_rtm_hoy: number;
  total_rtm_rechazados_hoy: number;
  tasa_rechazo_hoy: number;

  // ========================================================================
  // HISTÓRICOS
  // ========================================================================
  total_rtm_ayer: number;
  total_rechazado_ayer: number;
  tasa_rechazo_ayer: number;

  // ========================================================================
  // ACUMULADOS
  // ========================================================================
  total_rtm_mes_actual: number;
  total_rtm_anio_actual: number;

  total_rechazado_mes: number;
  total_rechazado_anio: number;

  tasa_rechazo_mes: number;
  tasa_rechazo_anio: number;

  // ========================================================================
  // GRÁFICOS BASE
  // ========================================================================
  chart_mes_actual: DayChartItem[];
  chart_anio_actual: MonthChartItem[];

  chart_rechazado_mes: DayChartItem[];
  chart_rechazado_anio: MonthChartItem[];

  // ========================================================================
  // GRÁFICOS DE TASAS
  // ========================================================================
  chart_tasa_rechazo_mes: DayChartItem[];

  chart_tasa_rechazo_anio: MonthChartItem[];
} | undefined;





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
const totalRechazadosHoy = analyticsDataDiary?.total_rtm_rechazados_hoy ?? 0;





const completeDataRTM: CompleteDataRTMType | undefined = analyticsData 
  ? {
      ...analyticsData, 
      
      // =======================================================================
      // 1. TOTALES DIARIOS Y TASAS
      // =======================================================================
      total_rtm_hoy: totalHoy,
      total_rtm_rechazados_hoy: totalRechazadosHoy, 
      
      // Tasa Hoy: (Rechazos Hoy / Total Hoy) * 100
      tasa_rechazo_hoy: totalHoy > 0 
        ? Number(((totalRechazadosHoy / totalHoy) * 100).toFixed(2)) 
        : 0,

      // =======================================================================
      // 2. HISTÓRICOS Y TASAS (Ayer)
      // =======================================================================
      total_rtm_ayer: analyticsData.total_rtm_ayer,
      total_rechazado_ayer: analyticsData.total_rechazado_ayer,
      
      // Tasa Ayer: (Rechazos Ayer / Total Ayer) * 100
      tasa_rechazo_ayer: analyticsData.total_rtm_ayer > 0 
        ? Number(((analyticsData.total_rechazado_ayer / analyticsData.total_rtm_ayer) * 100).toFixed(2)) 
        : 0,

      // =======================================================================
      // 3. ACUMULADOS Y TASAS (Mes y Año)
      // =======================================================================
      total_rtm_mes_actual: analyticsData.total_rtm_mes_actual + totalHoy,
      total_rtm_anio_actual: analyticsData.total_rtm_anio_actual + totalHoy,

      total_rechazado_mes: analyticsData.total_rechazado_mes + totalRechazadosHoy,
      total_rechazado_anio: analyticsData.total_rechazado_anio + totalRechazadosHoy,

      // Tasa Mes: (Acumulado Rechazos Mes / Acumulado Total Mes) * 100
      tasa_rechazo_mes: (analyticsData.total_rtm_mes_actual + totalHoy) > 0 
        ? Number((((analyticsData.total_rechazado_mes + totalRechazadosHoy) / (analyticsData.total_rtm_mes_actual + totalHoy)) * 100).toFixed(2)) 
        : 0,

      // Tasa Año: (Acumulado Rechazos Año / Acumulado Total Año) * 100
      tasa_rechazo_anio: (analyticsData.total_rtm_anio_actual + totalHoy) > 0 
        ? Number((((analyticsData.total_rechazado_anio + totalRechazadosHoy) / (analyticsData.total_rtm_anio_actual + totalHoy)) * 100).toFixed(2)) 
        : 0,

      // =======================================================================
      // 4. ACTUALIZACIÓN DE GRÁFICOS (Cantidades)
      // =======================================================================
      chart_mes_actual: analyticsData.chart_mes_actual?.map((item) => {
        if (item.dia === diaActualStr) return { ...item, total: (item.total?item.total:0) + totalHoy }; 
        return item; 
      }) ?? [],

      chart_anio_actual: analyticsData.chart_anio_actual?.map((item) => {
        if (item.mes === mesFormateado) return { ...item, total: (item.total?item.total:0) + totalHoy }; 
        return item; 
      }) ?? [],

      chart_rechazado_mes: analyticsData.chart_rechazado_mes?.map((item) => {
        if (item.dia === diaActualStr) return { ...item, total: (item.total?item.total:0) + totalRechazadosHoy }; 
        return item; 
      }) ?? [],

      chart_rechazado_anio: analyticsData.chart_rechazado_anio?.map((item) => {
        if (item.mes === mesFormateado) return { ...item, total: (item.total?item.total:0) + totalRechazadosHoy }; 
        return item; 
      }) ?? [],

      // =======================================================================
      // 5. NUEVOS GRÁFICOS DE TASAS DE RECHAZO (Calculados al vuelo)
      // =======================================================================
      // Combinamos el array base del mes con el array de rechazos del mes usando el índice (index)
      chart_tasa_rechazo_mes: analyticsData.chart_mes_actual?.map((item, index) => {
        const rechazoItem = analyticsData.chart_rechazado_mes?.[index];
        
        // Verificamos si es el día de hoy para inyectarle el polling en tiempo real a ambos valores
        const isToday = item.dia === diaActualStr;
        const currentTotal = isToday ? (item.total || 0) + totalHoy : (item.total || 0);
        const currentRechazo = isToday ? (rechazoItem?.total || 0) + totalRechazadosHoy : (rechazoItem?.total || 0);

        return {
          dia: item.dia,
          total: currentTotal > 0 ? Number(((currentRechazo / currentTotal) * 100).toFixed(2)) : 0
        };
      }) ?? [],

      chart_tasa_rechazo_anio: analyticsData.chart_anio_actual?.map((item, index) => {
        const rechazoItem = analyticsData.chart_rechazado_anio?.[index];
        
        const isThisMonth = item.mes === mesFormateado;
        const currentTotal = isThisMonth ? (item.total || 0) + totalHoy : (item.total || 0);
        const currentRechazo = isThisMonth ? (rechazoItem?.total || 0) + totalRechazadosHoy : (rechazoItem?.total || 0);

        return {
          mes: item.mes,
          total: currentTotal > 0 ? Number(((currentRechazo / currentTotal) * 100).toFixed(2)) : 0
        };
      }) ?? [],

    }
  : undefined;



return (
  // section proporciona la raíz semántica. px-4 o px-6 da el margen sutil para que nada toque los bordes.
  <section className="w-full px-6 py-4 flex flex-col gap-6 bg-background">

    {/* header agrupa el bloque de presentación de la página */}
    <header className="w-full border-b border-border pb-4">
      <h1
        className="text-3xl font-black tracking-wider text-foreground uppercase select-none drop-shadow-sm"
      >
        Analítica
      </h1>

      <p className="mt-2 text-sm text-muted-foreground max-w-2xl leading-relaxed">
        Monitor de rendimiento general y financiero. Supervisa el flujo de caja,
        las tasas de aprobación y el cumplimiento de los tiempos normativos (ISO
        17020) en tiempo real.
      </p>
    </header>

    {/* 🌟 AQUÍ IRÁ EL CONTENEDOR PRINCIPAL DE LOS GRÁFICOS EN EL SIGUIENTE PASO */}
    <div className="flex flex-col gap-6 w-full">
      <AnaliticaPorCantidad
        titulo="Inspecciones Realizadas"
        descripcion="Volumen total de vehículos que han ingresado a la línea de revisión (Primeras entradas)."
        datos={completeDataRTM}
      />

      <AnaliticaPorCantidad
        titulo="Cantidad RTM Reprobadas"
        descripcion="RTMs reprobadas."
        datos={completeDataRTM}
      />

      <AnaliticaPorCantidad
        titulo="Tasa de Rechazo"
        descripcion="Porcentaje de reprobadas con respecto a todas la placas por primera vez (no se cuentan reinspecciones reprobadas)"
        datos={completeDataRTM}
      />
    </div>

  </section>
);
}