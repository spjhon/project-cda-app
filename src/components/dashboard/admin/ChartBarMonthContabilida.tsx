
"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
} from "recharts";

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

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { AdminContabilidadData } from "@/contexts/AdminLoaderContext";

// ============================================================================
// 1. PROPS
// ============================================================================

interface ChartBarMonthContabilidadProps {
  chartMonthData: AdminContabilidadData["chart_mes"] | undefined;
  mesSeleccionado: number;
  anoSeleccionado: number;
  setMesSeleccionado: (mes: number) => void;
  isLoading: boolean;
}

// ============================================================================
// 2. CONFIGURACIÓN DEL GRÁFICO
// ============================================================================

const chartMonthConfig = {
  total: {
    label: "Recaudo",
  },
} satisfies ChartConfig;

// ============================================================================
// 3. COMPONENTE
// ============================================================================

export default function ChartBarMonthContabilidad({
  chartMonthData,
  mesSeleccionado,
  anoSeleccionado,
  setMesSeleccionado,
  isLoading,
}: ChartBarMonthContabilidadProps) {
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
    meses.find(
      (mes) => Number(mes.value) === mesSeleccionado,
    )?.label ?? "";

  // ==========================================================================
  // Formato monetario
  // ==========================================================================

  const formatearPesos = (valor: number) => {
    return `$ ${valor.toLocaleString("es-CO")}`;
  };

  // ==========================================================================
  // Datos para el gráfico
  //
  // Siempre tendremos los días 1 al 31.
  // Los días que no existen en el mes seleccionado tendrán $0.
  // ==========================================================================

  const datosGrafico = Array.from(
    { length: 31 },
    (_, indice) => {
      const numeroDia = indice + 1;

      const datoExistente = chartMonthData?.find(
        (item) => Number(item.dia) === numeroDia,
      );

      if (datoExistente) {
        return datoExistente;
      }

      return {
        dia: String(numeroDia),
        mes: mesSeleccionado,
        ano: anoSeleccionado,
        total: 0,
      };
    },
  );

  return (
    <Card className="w-full rounded-none py-2">
      {/* ======================================================================
          HEADER
      ====================================================================== */}

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
                    <SelectItem
                      key={mes.value}
                      value={mes.value}
                    >
                      {mes.label}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>

          <CardDescription>
            Muestra el recaudo diario del Centro de Diagnóstico
            Automotor durante el mes seleccionado.
          </CardDescription>
        </div>
      </CardHeader>

      {/* ======================================================================
          CONTENIDO
      ====================================================================== */}

      <CardContent className="px-2 sm:p-6">
        {isLoading ? (
          <div className="flex h-62.5 items-center justify-center">
            <span className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-muted-300 border-t-blue-600" />
          </div>
        ) : (
          <div className="grid w-full grid-cols-1 gap-6 lg:grid-cols-2">
  {/* GRÁFICO */}
  <div className="min-w-0 overflow-x-auto">
    <div className="min-w-[900px]">
      <ChartContainer
        config={chartMonthConfig}
        className="aspect-auto h-62.5 w-full"
      >
        <BarChart
          accessibilityLayer
          data={datosGrafico}
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
            interval={0}
          />

          <YAxis
            width={"auto"}
            tickFormatter={(value) => {
              return `$ ${Number(value).toLocaleString("es-CO")}`;
            }}
          />

          <ChartTooltip
            content={
              <ChartTooltipContent
                className="w-45"
                nameKey="total"
                formatter={(value) => {
                  return formatearPesos(Number(value));
                }}
                labelFormatter={(value) => {
                  return `${nombreMes} ${value} - ${anoSeleccionado}`;
                }}
              />
            }
          />

          <ChartLegend
            content={<ChartLegendContent />}
          />

          <Bar
            dataKey="total"
            fill="#62748E"
          />
        </BarChart>
      </ChartContainer>
    </div>
  </div>

  {/* CUADRO */}
  <div className="min-w-0 overflow-hidden border border-border">
    <div className="border-b border-border px-4 py-3">
      <h3 className="font-bold">
        {nombreMes} {anoSeleccionado}
      </h3>

      <p className="mt-1 text-xs text-muted-foreground">
        Recaudo diario registrado durante el mes seleccionado.
      </p>
    </div>

    <div className="max-h-62.5 overflow-y-auto">
      {chartMonthData?.map((item) => (
        <div
          key={`${item.ano}-${item.mes}-${item.dia}`}
          className="flex items-center justify-between border-b border-border px-4 py-2 last:border-b-0"
        >
          <span className="text-sm font-medium">
            Día {item.dia}
          </span>

          <span className="text-sm font-bold tabular-nums">
            {formatearPesos(item.total)}
          </span>
        </div>
      ))}
    </div>
  </div>
</div>
        )}
      </CardContent>
    </Card>
  );
}
