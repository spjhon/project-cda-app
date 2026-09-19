
"use client";

import { Bar, BarChart, CartesianGrid, LabelList, XAxis, YAxis } from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";

import { MonthChartItem, AdminContext } from "@/contexts/AdminLoaderContext";
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

// ============================================================================
// 1. PROPS
// ============================================================================

interface ChartBarYearInteractiveProps {
  chartYearData: MonthChartItem[] | undefined;
  isPorcentaje: boolean;
}

// ============================================================================
// 2. CONFIGURACIÓN DEL GRÁFICO
// ============================================================================

const chartYearConfig = {
  total: {
    label: "Inspecciones RTM",
  },
} satisfies ChartConfig;

// ============================================================================
// 3. COMPONENTE
// ============================================================================

export default function ChartBarYearInteractive({
  chartYearData,
  isPorcentaje,
}: ChartBarYearInteractiveProps) {

  const adminContextReceived = useContext(AdminContext);

  if (!adminContextReceived) {
    return null;
  }

  const {
    anoSeleccionado,
    setAnoSeleccionado,
  } = adminContextReceived.AdminContextValue;

  // Generamos los años disponibles para el selector.
  // Puedes aumentar/disminuir este rango según lo que necesites.
  const anoActual = new Date().getFullYear();

  const anos = Array.from(
    { length: 5 },
    (_, index) => anoActual - index
  );

  return (
    <Card className="py-2 rounded-none min-w-210">

      <CardHeader className="flex flex-col items-stretch border-b p-0! sm:flex-row">

        <div className="flex flex-1 flex-col justify-center gap-1 px-6 pt-4 pb-3 sm:py-0!">

          <div className="flex items-center justify-between gap-4">

            <CardTitle className="py-2 font-bold">
              Histórico del Año {anoSeleccionado}
            </CardTitle>

            <Select
              value={String(anoSeleccionado)}
              onValueChange={(value) => {
                setAnoSeleccionado(Number(value));
              }}
              items={anos.map((ano) => ({
                label: String(ano),
                value: String(ano),
              }))}
            >

              <SelectTrigger className="w-full max-w-48">
                <SelectValue />
              </SelectTrigger>

              <SelectContent>

                <SelectGroup>

                  <SelectLabel>Año</SelectLabel>

                  {anos.map((ano) => (
                    <SelectItem
                      key={ano}
                      value={String(ano)}
                    >
                      {ano}
                    </SelectItem>
                  ))}

                </SelectGroup>

              </SelectContent>

            </Select>

          </div>

          <CardDescription>
            Muestra el total de RTMs sin contar reinspecciones,
            solo RTMs por primera vez durante todo el año.
          </CardDescription>

        </div>

      </CardHeader>

      <CardContent className="px-2 sm:p-6">

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
              bottom: 12,
            }}
          >

            <CartesianGrid vertical={false} />

            <XAxis
              dataKey="mes"
              tickLine={true}
              axisLine={false}
              tickMargin={8}
              height={30}
            />

            <YAxis width={"auto"} />

            <ChartTooltip
              content={
                <ChartTooltipContent
                  formatter={(label) =>
                    isPorcentaje
                      ? `Tasa de rechazo: ${label}%`
                      : `Total de RTMs: ${label}`
                  }
                  className="w-37.5"
                  nameKey="total"
                />
              }
            />

            <ChartLegend content={<ChartLegendContent />} />

            <Bar dataKey={"total"} fill={`#62748E`}>

              <LabelList
                formatter={(label) =>
                  isPorcentaje ? `${label}%` : label
                }
                dataKey="total"
                position="top"
                offset={8}
                className="fill-slate-500 text-[10px] font-medium"
              />

            </Bar>

          </BarChart>

        </ChartContainer>

      </CardContent>

    </Card>
  );
}
