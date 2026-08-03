"use client";

import { Activity, Info, Calendar as CalendarIcon, Check } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { DateRange } from "react-day-picker";
import { Bar, BarChart, CartesianGrid, LabelList, XAxis, YAxis } from "recharts"


import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"


// Componentes de Shadcn UI
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useState } from "react";
import {DayChartItem, MonthChartItem } from "@/app/[tenant]/(private)/dashboard/admin/layout";
import { CompleteDataRTMType } from "@/app/[tenant]/(private)/dashboard/admin/analitica/page";
//import { useSidebar } from "@/components/ui/sidebar";

























// ============================================================================
// 1. SUBCOMPONENTE REUTILIZABLE PARA LOS GRAFICOS DE BARRAS MENSUALES
// ============================================================================


// 2. Definimos la interfaz de las Props que va a recibir tu componente
interface ChartBarMonthInteractiveProps {
  chartMonthData: DayChartItem[] | undefined; // ◄ Aquí es donde le dices que es un Array
  isPorcentaje: boolean;
}


const chartMonthConfig = {
  total: {
    label: "Inspecciones RTM", // ◄ Este texto saldrá automáticamente en el Tooltip y la Leyenda
  },
  
} satisfies ChartConfig



export function ChartBarMonthInteractive({chartMonthData, isPorcentaje}: ChartBarMonthInteractiveProps) {
//const { state } = useSidebar()
   


  return (
    <Card className="py-2 rounded-none min-w-170">




      <CardHeader className="flex flex-col items-stretch border-b p-0! sm:flex-row">
        <div className="flex flex-1 flex-col justify-center gap-1 px-6 pt-4 pb-3 sm:py-0!">
          <CardTitle className="py-2 font-bold">Historico Del Mes de Julio - 2026</CardTitle>
          <CardDescription>
            Muestra el total de RTMs sin contar reinspecciones, solo RTMs por primera vez.
          </CardDescription>
        </div>
      </CardHeader>



      <CardContent className="px-2 sm:p-6 ">
        <ChartContainer
          
          config={chartMonthConfig}
          className="aspect-auto h-62.5"
         >
          <BarChart 
            
            accessibilityLayer
            data={chartMonthData} 
            margin={{
              left: 12,
              right: 12,
              top: 30,
              bottom: 12
            }}
           >
            

            <CartesianGrid vertical={false} />

            <XAxis
              dataKey="dia" 
              tickLine={true}
              axisLine={false}
              tickMargin={8}
              height={30}
            >
             
            </XAxis>

            <YAxis width={"auto"} >
              
            </YAxis>

              

            <ChartTooltip
              content={
                <ChartTooltipContent
                  className="w-37.5"
                  nameKey="total"
                  labelFormatter={(value) => {
        // 1. Obtenemos el nombre del mes actual en Colombia (ej: "julio")
        const mesActualRaw = new Date().toLocaleString("es-CO", { 
          timeZone: "America/Bogota", 
          month: "long" 
        });
        
        // 2. Capitalizamos el mes (ej: "Julio")
        const mesFormateado = mesActualRaw.charAt(0).toUpperCase() + mesActualRaw.slice(1);
        
        // 3. Retornamos el mes junto al número del día que trae la barra (value)
        return `${mesFormateado} ${value}`;
      }}
                />
              }
            />

             <ChartLegend content={<ChartLegendContent />} />
            <Bar dataKey={"total"} fill={`#62748E`}>
              <LabelList
                formatter={(label) => isPorcentaje? `${label}%` : label}
                dataKey="total"
                position="top"       // ◄ Lo ubica justo encima de la barra
                offset={8}           // ◄ Separación en píxeles para que no toque la barra
                className="fill-slate-500 text-[10px] font-medium" // ◄ Estilo sutil con Tailwind
              />
            </Bar>



          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}

























// ============================================================================
// 1. SUBCOMPONENTE REUTILIZABLE PARA LOS GRAFICOS DE BARRAS MENSUALES
// ============================================================================


// 1. Definición de la interfaz para el tipado anual
interface ChartBarYearInteractiveProps {
  chartYearData: MonthChartItem[] | undefined; // ◄ Aquí es donde le dices que es un Array
   isPorcentaje: boolean;
}


const chartYearConfig = {
  total: {
    label: "Inspecciones RTM", // ◄ Este texto saldrá automáticamente en el Tooltip y la Leyenda
  },
} satisfies ChartConfig



export function ChartBarYearInteractive({chartYearData, isPorcentaje}: ChartBarYearInteractiveProps) {
//const { state } = useSidebar()
   


  return (
    <Card className="py-2 rounded-none min-w-210">




      <CardHeader className="flex flex-col items-stretch border-b p-0! sm:flex-row">
        <div className="flex flex-1 flex-col justify-center gap-1 px-6 pt-4 pb-3 sm:py-0!">
          <CardTitle className="py-2 font-bold">Historico del año 2026</CardTitle>
          <CardDescription>
            Muestra el total de RTMs sin contar reinspecciones, solo RTMs por primera vez durante todo el año.
          </CardDescription>
        </div>
      </CardHeader>



      <CardContent className="px-2 sm:p-6 ">
        <ChartContainer
          
          config={chartYearConfig}
          className="aspect-auto h-62.5"
         >
          <BarChart 
           
            accessibilityLayer
            data={chartYearData} 
            margin={{
              left: 12,
              right: 12,
              top: 30,
              bottom: 12
            }}
           >
            

            <CartesianGrid vertical={false} />

            <XAxis
              dataKey="mes" 
              tickLine={true}
              axisLine={false}
              tickMargin={8}
              height={30}
            >
              
            </XAxis>

            <YAxis width={"auto"} >
              
            </YAxis>

              

            <ChartTooltip
              content={
                <ChartTooltipContent
                formatter={(label) => isPorcentaje? `Tasa de rechazo: ${label}%` : `Total de RTMs: ${label}`}
                  className="w-37.5"
                  nameKey="total"
                  
                />
              }
            />

             <ChartLegend content={<ChartLegendContent />} />
            <Bar dataKey={"total"} fill={`#62748E`}>
              <LabelList
              formatter={(label) => isPorcentaje? `${label}%` : label}
                dataKey="total"
                position="top"       // ◄ Lo ubica justo encima de la barra
                offset={8}           // ◄ Separación en píxeles para que no toque la barra
                className="fill-slate-500 text-[10px] font-medium" // ◄ Estilo sutil con Tailwind
              />
            </Bar>



          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}





















// ============================================================================
// 1. SUBCOMPONENTE REUTILIZABLE PARA LOS CUADROS 3D
// ============================================================================
interface CuadroMetricaProps {
  label: string;
  valor: string | number; // Cambiado a string | number para soportar el texto por defecto
  esPrimario?: boolean;
  isPorcentaje:boolean;
}
function CuadroMetrica({ label, valor, esPrimario = false, isPorcentaje = false }: CuadroMetricaProps) {
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
        className={`tracking-tighter text-center px-2 font-black ${
          typeof valor === "number" 
            ? esPrimario ? "text-blue-600 text-5xl" : "text-muted-900 text-5xl"
            : "text-sm text-muted-400 font-medium normal-case tracking-normal"
        } ${isPorcentaje && typeof valor === "number" ? "text-4xl" : ""}`} // ◄ Ajuste: un poco más pequeño si es % para que quepa el símbolo
        style={{
          textShadow: typeof valor === "number"
            ? esPrimario 
              ? '1px 1px 2px rgba(0,0,0,0.4), -1px -1px 1px rgba(255,255,255,0.3)'
              : '1px 1px 2px rgba(0,0,0,0.5), -1px -1px 1px rgba(255,255,255,0.25)'
            : 'none'
        }}
      >
        {/* Renderizado condicional del símbolo */}
        {valor}
        {isPorcentaje && typeof valor === "number" && (
          <span className="text-2xl ml-0.5">%</span>
        )}
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
  datos: CompleteDataRTMType | undefined
}

export default function AnaliticaPorCantidad({
  titulo,
  descripcion,
  datos,
}: AnaliticaPorCantidadProps) {
  
  // 🌟 Estado confirmado (el que realmente se usa para los cálculos/UI)
  const [date, setDate] = useState<DateRange | undefined>(undefined);
  // 🌟 Estado borrador (aísla los clics dentro del calendario)
  const [localDate, setLocalDate] = useState<DateRange | undefined>(undefined);
  const [isOpen, setIsOpen] = useState(false);

  console.log(`este es el date de: ${titulo}: `, date);


   const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (open) {
      // Al abrir, resincronizamos el borrador con la fecha confirmada
      setLocalDate(date);
    }
  };


  // Confirmar el rango seleccionado y cerrar el popover
  const handleApply = () => {
    setDate(localDate);
    setIsOpen(false);
  };

  // Si hay un rango completo, puedes simular o computar el valor (ej. 0 o fetch). 
  // Mientras falte un extremo, muestra el string por defecto.
  const valorRangoEspecial = localDate?.from && localDate?.to ? 0 : "Seleccione rango";

  const isPorcentaje = titulo === "Tasa de Rechazo";
  

  const datosSeparados = {
    total_hoy: 0,
    total_ayer: 0,
    total_mes: 0,
    total_anio: 0,
    chartMonthData: [] as DayChartItem[],
    chartYearData: [] as MonthChartItem[]
  }

  if (titulo === "Inspecciones Realizadas"){
    datosSeparados.total_hoy = datos?.total_rtm_hoy ?? 0;
    datosSeparados.total_ayer = datos?.total_rtm_ayer ?? 0;
    datosSeparados.total_mes = datos?.total_rtm_mes_actual ?? 0;
    datosSeparados.total_anio = datos?.total_rtm_anio_actual ?? 0;
    datosSeparados.chartMonthData = datos?.chart_mes_actual ?? [];
    datosSeparados.chartYearData = datos?.chart_anio_actual ?? [];
  }else if (titulo === "Cantidad RTM Reprobadas") { // ◄ Nueva condición para los rechazos
    datosSeparados.total_hoy = datos?.total_rtm_rechazados_hoy ?? 0;
    datosSeparados.total_ayer = datos?.total_rechazado_ayer ?? 0;
    datosSeparados.total_mes = datos?.total_rechazado_mes ?? 0;
    datosSeparados.total_anio = datos?.total_rechazado_anio ?? 0;
    datosSeparados.chartMonthData = datos?.chart_rechazado_mes ?? [];
    datosSeparados.chartYearData = datos?.chart_rechazado_anio ?? [];
  }else if (titulo === "Tasa de Rechazo") {

  datosSeparados.total_hoy = datos?.tasa_rechazo_hoy ?? 0;
  datosSeparados.total_ayer = datos?.tasa_rechazo_ayer ?? 0;
  datosSeparados.total_mes = datos?.tasa_rechazo_mes ?? 0;
  datosSeparados.total_anio = datos?.tasa_rechazo_anio ?? 0;
  datosSeparados.chartMonthData = datos?.chart_tasa_rechazo_mes ?? [];
  datosSeparados.chartYearData = datos?.chart_tasa_rechazo_anio ?? [];

}

  return (
    <div className="flex flex-col gap-6 pl-2 md:pl-4">
      
      {/* Encabezado con Iconos */}
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center gap-2">
          <Activity className="h-5 w-5 text-blue-600" />
          <h2 className="text-xl font-bold text-muted-800 tracking-tight">{titulo}</h2>
        </div>
        <div className="flex items-start gap-1.5">
          <Info className="h-4 w-4 text-muted-400 shrink-0 mt-0.5" />
          <p className="text-sm text-muted-500 leading-relaxed">{descripcion}</p>
        </div>
      </div>

      {/* Contenedor Flex Responsivo invocando el subcomponente */}
      <div className="flex flex-wrap gap-5 w-full items-center">
        <CuadroMetrica label="Hoy" valor={Number(datosSeparados.total_hoy)} esPrimario={true} isPorcentaje={isPorcentaje}/>
        <CuadroMetrica label="Ayer" valor={Number(datosSeparados.total_ayer)} isPorcentaje={isPorcentaje} />
        <CuadroMetrica label="Este Mes" valor={Number(datosSeparados.total_mes)} isPorcentaje={isPorcentaje}/>
        <CuadroMetrica label="Este Año" valor={Number(datosSeparados.total_anio)} isPorcentaje={isPorcentaje}/>

        {/* Nuevo bloque: Cuadro especial acoplado al seleccionador */}
        <div className="flex flex-col sm:flex-row items-center  gap-4">
          <CuadroMetrica 
          isPorcentaje={isPorcentaje}
            label="Por Rango" 
            valor={valorRangoEspecial} 
            esPrimario={typeof valorRangoEspecial === "number"} 
          />
          
          <div className="flex flex-col flex-wrap gap-2 min-w-60">
            <div className="flex flex-col">
              <h4 className="text-sm font-semibold text-muted-800">Filtrar por Fechas</h4>
              <p className="text-xs text-muted-400">Rango personalizado de análisis</p>
            </div>

            {/* Selector de Fecha de Shadcn */}
           {/* Selector de Fecha de Shadcn */}
            <Popover open={isOpen} onOpenChange={handleOpenChange}>
              <PopoverTrigger render={<Button
                  id="date"
                  variant={"outline"}
                  className={cn(
                    "w-full justify-start text-left font-normal border-slate-300",
                    !date && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4 text-muted-500" />

                  {date?.from ? (
                    date.to ? (
                      <>
                        {format(date.from, "dd LLL, yyyy", { locale: es })} -{" "}
                        {format(date.to, "dd LLL, yyyy", { locale: es })}
                      </>
                    ) : (
                      format(date.from, "dd LLL, yyyy", { locale: es })
                    )
                  ) : (
                    <span>Elegir periodo</span>
                  )}
                </Button>}>
                
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <div className="p-3">
                  <Calendar
                    autoFocus
                    mode="range"
                    defaultMonth={localDate?.from}
                    selected={localDate}
                    onSelect={setLocalDate}
                    numberOfMonths={2}
                    locale={es}
                    className="rounded-lg"
                    captionLayout="dropdown"
                    showOutsideDays={false}
                  />
                </div>
                
                {/* 🌟 Botón de Aplicar Rango aislado */}
                <div className="border-t border-border p-3 bg-muted/30 flex justify-end">
                  <Button
                    className="w-full sm:w-auto text-xs font-semibold h-9 shadow-sm bg-primary hover:bg-primary/90 text-primary-foreground flex items-center justify-center gap-2"
                    onClick={handleApply}
                    disabled={!localDate?.from || !localDate?.to}
                  >
                    <Check className="h-3.5 w-3.5" />
                    Aplicar Rango
                  </Button>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </div>
      </div>

      {/* ESPACIO PARA LAS GRÁFICAS */}
      <div className="  mt-6 flex flex-row flex-wrap gap-6">

        <div className="overflow-scroll ">
        <ChartBarMonthInteractive chartMonthData={datosSeparados.chartMonthData} isPorcentaje={isPorcentaje}></ChartBarMonthInteractive>
        </div>
        
        <div className="overflow-scroll ">
        <ChartBarYearInteractive chartYearData={datosSeparados.chartYearData} isPorcentaje={isPorcentaje}></ChartBarYearInteractive>
        </div>
      </div>

    </div>
  );
}