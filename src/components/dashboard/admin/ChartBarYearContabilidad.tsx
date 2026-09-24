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
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";

import {
  AdminContabilidadData,
  AdminContext,
} from "@/contexts/AdminLoaderContext";

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

interface ChartBarYearContabilidadProps {
  chartYearData:
    | AdminContabilidadData["chart_anio"]
    | undefined;
}

// ============================================================================
// 2. CONFIGURACIÓN DEL GRÁFICO
// ============================================================================

const chartYearConfig: ChartConfig = {
  total: {
    label: "Recaudo",
  },
};

// ============================================================================
// 3. COMPONENTE
// ============================================================================

export default function ChartBarYearContabilidad({
  chartYearData,
}: ChartBarYearContabilidadProps) {
  const adminContextReceived = useContext(AdminContext);

  if (!adminContextReceived) {
    return null;
  }

  const {
    anoContabilidadSeleccionado,
    setAnoContabilidadSeleccionado,
  } = adminContextReceived.AdminContextValue;

  // ==========================================================================
  // 4. AÑOS DISPONIBLES
  // ==========================================================================

  const anoActual = new Date().getFullYear();

  const anos = Array.from(
    { length: 5 },
    (_, index) => anoActual - index,
  );

  // ==========================================================================
  // 5. MESES
  // ==========================================================================

  const meses = [
    {
      numero: 1,
      nombre: "Enero",
      abreviatura: "Ene",
    },
    {
      numero: 2,
      nombre: "Febrero",
      abreviatura: "Feb",
    },
    {
      numero: 3,
      nombre: "Marzo",
      abreviatura: "Mar",
    },
    {
      numero: 4,
      nombre: "Abril",
      abreviatura: "Abr",
    },
    {
      numero: 5,
      nombre: "Mayo",
      abreviatura: "May",
    },
    {
      numero: 6,
      nombre: "Junio",
      abreviatura: "Jun",
    },
    {
      numero: 7,
      nombre: "Julio",
      abreviatura: "Jul",
    },
    {
      numero: 8,
      nombre: "Agosto",
      abreviatura: "Ago",
    },
    {
      numero: 9,
      nombre: "Septiembre",
      abreviatura: "Sep",
    },
    {
      numero: 10,
      nombre: "Octubre",
      abreviatura: "Oct",
    },
    {
      numero: 11,
      nombre: "Noviembre",
      abreviatura: "Nov",
    },
    {
      numero: 12,
      nombre: "Diciembre",
      abreviatura: "Dic",
    },
  ];

  // ==========================================================================
  // 6. FORMATEADOR
  // ==========================================================================

  const formatearPesos = (valor: number) => {
    return `$ ${valor.toLocaleString("es-CO")}`;
  };

  // ==========================================================================
  // 7. COMPLETAMOS SIEMPRE LOS 12 MESES
  // ==========================================================================

  const datosGrafico = meses.map((mes) => {
    const datoExistente = chartYearData?.find(
      (item) => Number(item.numero_mes) === mes.numero,
    );

    if (datoExistente) {
      return {
        ...datoExistente,
        mes: mes.abreviatura,
        nombre_mes: mes.nombre,
        numero_mes: mes.numero,
      };
    }

    return {
      mes: mes.abreviatura,
      nombre_mes: mes.nombre,
      numero_mes: mes.numero,
      ano: anoContabilidadSeleccionado,
      total: 0,
    };
  });

  // ==========================================================================
  // 8. RENDER
  // ==========================================================================

  return (
    <Card className="w-full min-w-0 rounded-none py-2">
      {/* ================================================================== */}
      {/* HEADER */}
      {/* ================================================================== */}

      <CardHeader className="flex flex-col items-stretch border-b p-0! sm:flex-row">
        <div className="flex flex-1 flex-col justify-center gap-1 px-6 pt-4 pb-3 sm:py-0!">
          <div className="flex items-center justify-between gap-4">
            <CardTitle className="py-2 font-bold">
              Histórico del Año {anoContabilidadSeleccionado}
            </CardTitle>

            <Select
              value={String(
                anoContabilidadSeleccionado,
              )}
              onValueChange={(value) => {
                setAnoContabilidadSeleccionado(
                  Number(value),
                );
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
            Muestra el recaudo mensual del Centro de
            Diagnóstico Automotor durante el año
            seleccionado.
          </CardDescription>
        </div>
      </CardHeader>

      {/* ================================================================== */}
      {/* CONTENIDO */}
      {/* ================================================================== */}

      <CardContent className="px-2 sm:p-6">
        <div className="grid w-full grid-cols-1 gap-6 lg:grid-cols-2">

          {/* ================================================================ */}
          {/* GRÁFICO */}
          {/* ================================================================ */}

          <div className="min-w-0 overflow-x-auto">
            <div className="min-w-175">
              <ChartContainer
                config={chartYearConfig}
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
                    dataKey="mes"
                    tickLine={true}
                    axisLine={false}
                    tickMargin={8}
                    height={30}
                    interval={0}
                  />

                  <YAxis
                    width={"auto"}
                    tickFormatter={(value) => {
                      return `$ ${Number(value).toLocaleString(
                        "es-CO",
                      )}`;
                    }}
                  />

                  <ChartTooltip
                    content={
                      <ChartTooltipContent
                        className="w-45"
                        nameKey="total"
                        formatter={(value) => {
                          return formatearPesos(
                            Number(value),
                          );
                        }}
                        labelFormatter={(value) => {
                          const mes = datosGrafico.find(
                            (item) => item.mes === value,
                          );

                          return `${
                            mes?.nombre_mes ?? value
                          } ${anoContabilidadSeleccionado}`;
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

          {/* ================================================================ */}
          {/* CUADRO DE VALORES */}
          {/* ================================================================ */}

          <div className="min-w-0 overflow-hidden border border-border">
            <div className="border-b border-border px-4 py-3">
              <h3 className="font-bold">
                {anoContabilidadSeleccionado}
              </h3>

              <p className="mt-1 text-xs text-muted-foreground">
                Recaudo registrado durante cada mes del
                año seleccionado.
              </p>
            </div>

            <div className="max-h-62.5 overflow-y-auto">
              {datosGrafico.map((item) => (
                <div
                  key={`${item.ano}-${item.numero_mes}`}
                  className="flex items-center justify-between border-b border-border px-4 py-2 last:border-b-0"
                >
                  <span className="text-sm font-medium">
                    {item.nombre_mes}
                  </span>

                  <span className="text-sm font-bold tabular-nums">
                    {formatearPesos(item.total)}
                  </span>
                </div>
              ))}
            </div>
          </div>

        </div>
      </CardContent>
    </Card>
  );
}