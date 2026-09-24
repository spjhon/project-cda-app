"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  LabelList,
  XAxis,
  YAxis,
} from "recharts";

import {
  Card,
  CardContent,
  
} from "@/components/ui/card";

import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

import { VehiclesByTypeData } from "@/contexts/AdminLoaderContext";

interface ChartBarVehiculosPorTipoProps {
  vehiclesByType: VehiclesByTypeData | undefined;
}

const chartConfig = {
  total: {
    label: "Inspecciones RTM",
  },
} satisfies ChartConfig;

const nombresVehiculos: Record<keyof VehiclesByTypeData, string> = {
  liviano: "Liviano",
  pesado: "Pesado",
  motocicleta_4t: "Motocicleta 4T",
  motocicleta_2t: "Motocicleta 2T",
  motocarro_4t: "Motocarro 4T",
  motocarro_2t: "Motocarro 2T",
  motocicleta_electrica: "Motocicleta eléctrica",
  motocarro_diesel: "Motocarro diésel",
};

export default function ChartBarVehiculosPorTipo({
  vehiclesByType,
}: ChartBarVehiculosPorTipoProps) {
  const chartData = vehiclesByType
    ? Object.entries(vehiclesByType).map(([tipo, total]) => ({
        tipo,
        nombre: nombresVehiculos[tipo as keyof VehiclesByTypeData],
        total,
      }))
    : [];

  return (
    <Card className="w-full min-w-225 py-2">
      
      <CardContent className="px-2 sm:p-6">
       <ChartContainer
            config={chartConfig}
            className="aspect-auto h-75 min-w-225"
            >
          <BarChart
            accessibilityLayer
            data={chartData}
            margin={{
              left: 12,
              right: 12,
              top: 30,
              bottom: 20,
            }}
          >
            <CartesianGrid vertical={false} />

            <XAxis
              dataKey="nombre"
              tickLine={true}
              axisLine={false}
              tickMargin={10}
              height={50}
            />

            <YAxis
              width="auto"
              allowDecimals={false}
            />

            <ChartTooltip
              content={
                <ChartTooltipContent
                  className="w-40"
                  nameKey="total"
                />
              }
            />

            <Bar
              dataKey="total"
              fill="#62748E"
              radius={4}
            >
              <LabelList
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