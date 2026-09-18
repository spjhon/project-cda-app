"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  LabelList,
  XAxis,
  YAxis,
} from "recharts";

// ============================================================================
// 1. SUBCOMPONENTE REUTILIZABLE PARA LOS GRAFICOS DE BARRAS MENSUALES
// ============================================================================

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

import { AdminContext, DayChartItem } from "@/contexts/AdminLoaderContext";
import { useContext } from "react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";


// 2. Definimos la interfaz de las Props que va a recibir tu componente
interface ChartBarMonthInteractiveProps {
  chartMonthData: DayChartItem[] | undefined; // ◄ Aquí es donde le dices que es un Array
  isPorcentaje: boolean;
}

const chartMonthConfig = {
  total: {
    label: "Inspecciones RTM", // ◄ Este texto saldrá automáticamente en el Tooltip y la Leyenda
  },
} satisfies ChartConfig;

export default function ChartBarMonthInteractive({
  chartMonthData,
  isPorcentaje,
}: ChartBarMonthInteractiveProps) {
  //const { state } = useSidebar()




  const adminContextReceived = useContext(AdminContext);

  if (!adminContextReceived) {
    return null;
  }

  const { mesSeleccionado, setMesSeleccionado, anoSeleccionado } =
    adminContextReceived.AdminContextValue;

  const meses = [
    { label: "Enero", value: "1" },
    { label: "Febrero", value: "2" },
    { label: "Marzo", value: "3" },
    { label: "Abril", value: "4" },
    { label: "Mayo", value: "5" },
    { label: "Junio", value: "6" },
    { label: "Julio", value: "7" },
    { label: "Agosto", value: "8" },
    { label: "Septiembre", value: "9" },
    { label: "Octubre", value: "10" },
    { label: "Noviembre", value: "11" },
    { label: "Diciembre", value: "12" },
  ];

  const nombreMes =
    meses.find((mes) => Number(mes.value) === mesSeleccionado)?.label ?? "";

  return (
    <Card className="py-2 rounded-none min-w-170">
      <CardHeader className="flex flex-col items-stretch border-b p-0! sm:flex-row">
        <div className="flex flex-1 flex-col justify-center gap-1 px-6 pt-4 pb-3 sm:py-0!">
          <div className="flex items-center justify-between gap-4">
            <CardTitle className="py-2 font-bold">
              Histórico del Mes de {nombreMes} - {anoSeleccionado}
            </CardTitle>

            <Select
              value={String(mesSeleccionado)}
              onValueChange={(value) => {
                setMesSeleccionado(Number(value));
                
              }}
              items={meses}
            >
              <SelectTrigger className="w-full max-w-48">
                <SelectValue />
              </SelectTrigger>

              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Mes</SelectLabel>

                  {meses.map((mes) => (
                    <SelectItem key={mes.value} value={mes.value}>
                      {mes.label}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>

          <CardDescription>
            Muestra el total de RTMs sin contar reinspecciones, solo RTMs por
            primera vez.
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
              bottom: 12,
            }}
          >
            <CartesianGrid vertical={false} />

            <XAxis
              dataKey="dia"
              tickLine={true}
              axisLine={false}
              tickMargin={8}
              height={30}
            ></XAxis>

            <YAxis width={"auto"}></YAxis>

            <ChartTooltip
              content={
                <ChartTooltipContent
                  className="w-37.5"
                  nameKey="total"
                  labelFormatter={(value) => {
                    // 1. Obtenemos el nombre del mes actual en Colombia (ej: "julio")
                    const mesActualRaw = new Date().toLocaleString("es-CO", {
                      timeZone: "America/Bogota",
                      month: "long",
                    });

                    // 2. Capitalizamos el mes (ej: "Julio")
                    const mesFormateado =
                      mesActualRaw.charAt(0).toUpperCase() +
                      mesActualRaw.slice(1);

                    // 3. Retornamos el mes junto al número del día que trae la barra (value)
                    return `${mesFormateado} ${value}`;
                  }}
                />
              }
            />

            <ChartLegend content={<ChartLegendContent />} />
            <Bar dataKey={"total"} fill={`#62748E`}>
              <LabelList
                formatter={(label) => (isPorcentaje ? `${label}%` : label)}
                dataKey="total"
                position="top" // ◄ Lo ubica justo encima de la barra
                offset={8} // ◄ Separación en píxeles para que no toque la barra
                className="fill-slate-500 text-[10px] font-medium" // ◄ Estilo sutil con Tailwind
              />
            </Bar>
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
