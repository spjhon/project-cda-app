"use client";

import { Activity, Info, Calendar as CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { DateRange } from "react-day-picker";
import { Bar, BarChart, CartesianGrid, Label, XAxis, YAxis } from "recharts"


import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartContainer,
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
//import { useSidebar } from "@/components/ui/sidebar";





// ============================================================================
// 1. SUBCOMPONENTE REUTILIZABLE PARA LOS GRAFICOS DE BARRAS MENSUALES
// ============================================================================
export interface AnaliticaMonthData {
  day: string;
  quantity: number;
}

// 2. Constante con los 31 días posibles y datos dummy
export const chartMonthData: AnaliticaMonthData[] = [
  { day: "01", quantity: 222 },
  { day: "02", quantity: 97 },
  { day: "03", quantity: 167 },
  { day: "04", quantity: 242 },
  { day: "05", quantity: 373 },
  { day: "06", quantity: 301 },
  { day: "07", quantity: 245 },
  { day: "08", quantity: 409 },
  { day: "09", quantity: 59 },
  { day: "10", quantity: 261 },
  { day: "11", quantity: 327 },
  { day: "12", quantity: 292 },
  { day: "13", quantity: 342 },
  { day: "14", quantity: 137 },
  { day: "15", quantity: 120 },
  { day: "16", quantity: 138 },
  { day: "17", quantity: 446 },
  { day: "18", quantity: 364 },
  { day: "19", quantity: 243 },
  { day: "20", quantity: 89 },
  { day: "21", quantity: 137 },
  { day: "22", quantity: 224 },
  { day: "23", quantity: 138 },
  { day: "24", quantity: 387 },
  { day: "25", quantity: 215 },
  { day: "26", quantity: 75 },
  { day: "27", quantity: 383 },
  { day: "28", quantity: 122 },
  { day: "29", quantity: 315 },
  { day: "30", quantity: 454 },
  { day: "31", quantity: 198 } // Agregado el día 31 faltante
];


const chartMonthConfig = {
  views: {
    label: "Page Views",
  },
} satisfies ChartConfig



export function ChartBarMonthInteractive() {
//const { state } = useSidebar()
   


  return (
    <Card className="py-2 rounded-none min-w-350">




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
            }}
           >
            

            <CartesianGrid vertical={false} />

            <XAxis
              dataKey="day" 
              tickLine={true}
              axisLine={false}
              tickMargin={8}
              height={60}
            >
              <Label
                value="Dias del Mes"
                position="insideBottom"
                offset={0}
                className="font-bold fill-slate-500 text-xs tracking-wide uppercase"
              />
            </XAxis>

            <YAxis width={"auto"} >
              
            </YAxis>

              

            <ChartTooltip
              content={
                <ChartTooltipContent
                  className="w-37.5"
                  nameKey="views"
                  labelFormatter={(value) => {
                    return new Date(value).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })
                  }}
                />
              }
            />

             
            <Bar dataKey={"quantity"} fill={`#62748E`} />



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
export interface AnaliticaYearData {
  month: string;
  quantity: number;
}

// 2. Constante con los 12 meses del año y datos dummy
export const chartYearData: AnaliticaYearData[] = [
  { month: "Enero", quantity: 222 },
  { month: "Febrero", quantity: 167 },
  { month: "Marzo", quantity: 242 },
  { month: "Abril", quantity: 373 },
  { month: "Mayo", quantity: 301 },
  { month: "Junio", quantity: 245 },
  { month: "Julio", quantity: 409 },
  { month: "Agosto", quantity: 261 },
  { month: "Septiembre", quantity: 327 },
  { month: "Octubre", quantity: 342 },
  { month: "Noviembre", quantity: 137 },
  { month: "Diciembre", quantity: 446 }
];

const chartYearConfig = {
  views: {
    label: "Page Views",
  },
} satisfies ChartConfig



export function ChartBarYearInteractive() {
//const { state } = useSidebar()
   


  return (
    <Card className="py-2 rounded-none min-w-350">




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
            }}
           >
            

            <CartesianGrid vertical={false} />

            <XAxis
              dataKey="month" 
              tickLine={true}
              axisLine={false}
              tickMargin={8}
              height={60}
            >
              <Label
                value="Dias del Mes"
                position="insideBottom"
                offset={0}
                className="font-bold fill-slate-500 text-xs tracking-wide uppercase"
              />
            </XAxis>

            <YAxis width={"auto"} >
              
            </YAxis>

              

            <ChartTooltip
              content={
                <ChartTooltipContent
                  className="w-37.5"
                  nameKey="views"
                  labelFormatter={(value) => {
                    return new Date(value).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })
                  }}
                />
              }
            />

             
            <Bar dataKey={"quantity"} fill={`#62748E`} />



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
}

function CuadroMetrica({ label, valor, esPrimario = false }: CuadroMetricaProps) {
  return (
    <div 
      className={`
        flex flex-col items-center justify-center aspect-square
        border border-slate-300 bg-white transition-all duration-300
        active:translate-x-2 active:translate-y-2
        active:shadow-[0px_0px_0px_0px_rgba(15,23,42,1)]
        w-44 h-44
      `}
    >
      <span className="text-15 font-bold text-slate-500 uppercase tracking-[0.2em] mb-2 text-center px-2">
        {label}
      </span>
      <span 
        className={`tracking-tighter text-center px-2 font-black ${
          typeof valor === "number" 
            ? esPrimario ? "text-blue-600 text-5xl" : "text-slate-900 text-5xl"
            : "text-sm text-slate-400 font-medium normal-case tracking-normal"
        }`}
        style={{
          textShadow: typeof valor === "number"
            ? esPrimario 
              ? '1px 1px 2px rgba(0,0,0,0.4), -1px -1px 1px rgba(255,255,255,0.3)'
              : '1px 1px 2px rgba(0,0,0,0.5), -1px -1px 1px rgba(255,255,255,0.25)'
            : 'none'
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
  // Estado local para almacenar el rango seleccionado
  const [date, setDate] = useState<DateRange | undefined>(undefined);

  // Si hay un rango completo, puedes simular o computar el valor (ej. 0 o fetch). 
  // Mientras falte un extremo, muestra el string por defecto.
  const valorRangoEspecial = date?.from && date?.to ? 0 : "Seleccione rango";

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
      <div className="flex flex-wrap gap-5 w-full items-start">
        <CuadroMetrica label="Hoy" valor={datos.hoy} esPrimario={true} />
        <CuadroMetrica label="Ayer" valor={datos.ayer} />
        <CuadroMetrica label="Este Mes" valor={datos.mes} />
        <CuadroMetrica label="Este Año" valor={datos.anio} />

        {/* Nuevo bloque: Cuadro especial acoplado al seleccionador */}
        <div className="flex items-center  gap-4">
          <CuadroMetrica 
            label="Por Rango" 
            valor={valorRangoEspecial} 
            esPrimario={typeof valorRangoEspecial === "number"} 
          />
          
          <div className="flex flex-col flex-wrap gap-2 min-w-60">
            <div className="flex flex-col">
              <h4 className="text-sm font-semibold text-slate-800">Filtrar por Fechas</h4>
              <p className="text-xs text-slate-400">Rango personalizado de análisis</p>
            </div>

            {/* Selector de Fecha de Shadcn */}
            <Popover>
              <PopoverTrigger render={<Button
                  id="date"
                  variant={"outline"}
                  className={cn(
                    "w-full justify-start text-left font-normal border-slate-300",
                    !date && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4 text-slate-500" />
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
                <Calendar
                autoFocus
                  mode="range"
                  defaultMonth={date?.from}
                  selected={date}
                  onSelect={setDate}
                  numberOfMonths={2}
                  locale={es}
                  className="rounded-lg"
                captionLayout="dropdown"
                showOutsideDays={false}
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>
      </div>

      {/* ESPACIO PARA LAS GRÁFICAS */}
      <div className=" border border-slate-300  overflow-scroll mt-6 flex flex-col gap-6">
        <ChartBarMonthInteractive></ChartBarMonthInteractive>
        <ChartBarYearInteractive></ChartBarYearInteractive>
      </div>

    </div>
  );
}