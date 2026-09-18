import { useMemo } from "react";;
import { Activity, Info } from "lucide-react";
import dynamic from "next/dynamic";



import { CuadroMetrica } from "./CuadroMetrica";
import { DayChartItem, MonthChartItem } from "@/contexts/AdminLoaderContext";
import { LazyChartOnScroll } from "./RenderWhenVisible";
import { usePathname } from "next/navigation";
import { CompleteDataRTM } from "@/app/[tenant]/(private)/dashboard/admin/analitica/page";
//import { useSidebar } from "@/components/ui/sidebar";

interface AnaliticaPorCantidadProps {
  titulo: string;
  descripcion: string;
  datos: CompleteDataRTM;
}

// Lazy load Chart component
const ChartBarMonthInteractive = dynamic(() => import("./ChartBarMonthInteractive"), {
  ssr: false,
});

// Lazy load Chart component
const ChartBarYearInteractive = dynamic(() => import("./ChartBarYearInteractive"), {
  ssr: false,
});

export default function AnaliticaPorCantidad({
  titulo,
  descripcion,
  datos,
}: AnaliticaPorCantidadProps) {

  
  const pathname = usePathname();

  const isPorcentaje = titulo === "Tasa de Rechazo";

  // Mapeo dinámico de datos estructurados según el tipo de métrica
  const datosSeparados = useMemo(() => {
    const base = {
      total_hoy: 0,
      total_ayer: 0,
      total_mes: 0,
      total_anio: 0,
      chartMonthData: [] as DayChartItem[],
      chartYearData: [] as MonthChartItem[],
    };

    if (!datos) return base;

    if (titulo === "Inspecciones Realizadas") {
      return {
        total_hoy: datos.total_rtm_hoy ?? 0,
        total_ayer: datos.total_rtm_ayer ?? 0,
        total_mes: datos.total_rtm_mes_actual ?? 0,
        total_anio: datos.total_rtm_anio_actual ?? 0,
        chartMonthData: datos.chart_mes_actual ?? [],
        chartYearData: datos.chart_anio_actual ?? [],
      };
    }

    if (titulo === "Cantidad RTM Reprobadas") {
      return {
        total_hoy: datos.total_rtm_rechazados_hoy ?? 0,
        total_ayer: datos.total_rechazado_ayer ?? 0,
        total_mes: datos.total_rechazado_mes ?? 0,
        total_anio: datos.total_rechazado_anio ?? 0,
        chartMonthData: datos.chart_rechazado_mes ?? [],
        chartYearData: datos.chart_rechazado_anio ?? [],
      };
    }

    if (titulo === "Tasa de Rechazo") {
      return {
        total_hoy: datos.tasa_rechazo_hoy ?? 0,
        total_ayer: datos.tasa_rechazo_ayer ?? 0,
        total_mes: datos.tasa_rechazo_mes ?? 0,
        total_anio: datos.tasa_rechazo_anio ?? 0,
        chartMonthData: datos.chart_tasa_rechazo_mes ?? [],
        chartYearData: datos.chart_tasa_rechazo_anio ?? [],
      };
    }

    return base;
  }, [titulo, datos]);

  return (
    
    <div className="flex flex-col gap-6 pl-2 md:pl-4" key={pathname}>{/* LA KEY ES PARA DESTRUIR EL COMPONENTE CADA VEZ QUE SE CAMBIA DE PAGE.TSX */}
      {/* Encabezado con Iconos */}
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center gap-2">
          <Activity className="h-5 w-5 text-blue-600" />
          <h2 className="text-xl font-bold text-muted-800 tracking-tight">
            {titulo}
          </h2>
        </div>
        <div className="flex items-start gap-1.5">
          <Info className="h-4 w-4 text-muted-400 shrink-0 mt-0.5" />
          <p className="text-sm text-muted-500 leading-relaxed">
            {descripcion}
          </p>
        </div>
      </div>

      {/* Contenedor Flex Responsivo para Métricas */}
      <div className="flex flex-wrap gap-5 w-full items-center">
        <CuadroMetrica
          label="Hoy"
          valor={Number(datosSeparados.total_hoy)}
          esPrimario={true}
          isPorcentaje={isPorcentaje}
        />
        <CuadroMetrica
          label="Ayer"
          valor={Number(datosSeparados.total_ayer)}
          isPorcentaje={isPorcentaje}
        />
        <CuadroMetrica
          label="Este Mes"
          valor={Number(datosSeparados.total_mes)}
          isPorcentaje={isPorcentaje}
        />
        <CuadroMetrica
          label="Este Año"
          valor={Number(datosSeparados.total_anio)}
          isPorcentaje={isPorcentaje}
        />
      </div>

      {/* ESPACIO PARA LAS GRÁFICAS */}
      <div className="mt-6 flex flex-row flex-wrap gap-6">
        <div className="overflow-scroll">
          <LazyChartOnScroll>
          <ChartBarMonthInteractive
            chartMonthData={datosSeparados.chartMonthData}
            isPorcentaje={isPorcentaje}
          />
          </LazyChartOnScroll>
        </div>

        <div className="overflow-scroll">
          <LazyChartOnScroll>
          <ChartBarYearInteractive
            chartYearData={datosSeparados.chartYearData}
            isPorcentaje={isPorcentaje}
          />
          </LazyChartOnScroll>
        </div>
      </div>

    </div>
  );
}
