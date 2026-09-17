"use client";

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



import DynamicYear from "@/components/landingPage/DynamicYear";
import { MonthChartItem } from "@/contexts/AdminLoaderContext";







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
          <CardTitle className="py-2 font-bold">Historico del año <DynamicYear></DynamicYear></CardTitle>
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





