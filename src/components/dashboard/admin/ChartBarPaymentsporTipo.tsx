
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

import { PaymentsByMethodData } from "@/contexts/AdminLoaderContext";

// ============================================================================
// 1. PROPS
// ============================================================================

interface ChartBarPagosPorMetodoProps {
  paymentsByMethod: PaymentsByMethodData | undefined;
}

// ============================================================================
// 2. CONFIGURACIÓN DEL GRÁFICO
// ============================================================================

const chartConfig = {
  total: {
    label: "Pagos",
  },
} satisfies ChartConfig;

// ============================================================================
// 3. NOMBRES PARA MOSTRAR EN EL GRÁFICO
// ============================================================================

const nombresMetodosPago: Record<
  keyof PaymentsByMethodData,
  string
> = {
  efectivo: "Efectivo",
  tarjeta_debito: "Tarjeta débito",
  tarjeta_credito: "Tarjeta crédito",
  sistecredito: "Sistecrédito",
  addi: "Addi",
  transferencia: "Transferencia",
  qr: "QR",
};

// ============================================================================
// 4. COMPONENTE
// ============================================================================

export default function ChartBarPagosPorMetodo({
  paymentsByMethod,
}: ChartBarPagosPorMetodoProps) {

  // ==========================================================================
  // Transformamos el objeto recibido por el RPC al formato que necesita
  // Recharts.
  // ==========================================================================

  const chartData = paymentsByMethod
    ? Object.entries(paymentsByMethod).map(
        ([metodo, total]) => ({
          metodo,
          nombre:
            nombresMetodosPago[
              metodo as keyof PaymentsByMethodData
            ],
          total,
        }),
      )
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
                  formatter={(value) =>
                    `${Number(value).toLocaleString("es-CO")} pagos`
                  }
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
