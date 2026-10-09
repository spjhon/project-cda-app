"use client";

import { useState } from "react";
import type { DateRange } from "react-day-picker";
import { CalendarDays, Filter } from "lucide-react";

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Database } from "../../../../supabase/types/database.types";
import { DateRangePicker } from "../_shared/DateRangePicker";
import { Button } from "@/components/ui/button";
import { useAnaliticaPersonalizada } from "@/lib/client-actions/fetch_analitica_personalizada";
import { CuadroMetrica } from "./CuadroMetrica";

// Tipos obtenidos de los enums generados por Supabase.
type VehicleType = Database["public"]["Enums"]["vehicle_type_enum"];

type ServiceType = Database["public"]["Enums"]["service_type_enum"];

type InspectionResult = "aprobado" | "rechazado";
type SoatPurchased = "si" | "no";

// Estado centralizado de todos los filtros.
export interface AnaliticaFilters {
  dateRange: DateRange | undefined;
  vehicleType: VehicleType | "todos";
  result: InspectionResult | "todos";
  serviceType: ServiceType | "todos";
  soatPurchased: SoatPurchased | "todos";
}

// Opciones de los selects.
const vehicleTypeItems: {
  label: string;
  value: VehicleType | "todos";
}[] = [
  { label: "Todos los vehículos", value: "todos" },
  { label: "Liviano", value: "liviano" },
  { label: "Pesado", value: "pesado" },
  { label: "Motocicleta 4T", value: "motocicleta_4t" },
  { label: "Motocicleta 2T", value: "motocicleta_2t" },
  { label: "Motocarro 4T", value: "motocarro_4t" },
  { label: "Motocarro 2T", value: "motocarro_2t" },
  { label: "Motocicleta eléctrica", value: "motocicleta_electrica" },
  { label: "Motocarro diésel", value: "motocarro_diesel" },
];

const resultItems: {
  label: string;
  value: InspectionResult | "todos";
}[] = [
  { label: "Todos los resultados", value: "todos" },
  { label: "Aprobado", value: "aprobado" },
  { label: "Rechazado", value: "rechazado" },
];

const serviceTypeItems: {
  label: string;
  value: ServiceType | "todos";
}[] = [
  { label: "Todos los servicios", value: "todos" },
  { label: "RTM", value: "RTM" },
  { label: "Preventiva", value: "preventiva" },
  { label: "Peritaje", value: "peritaje" },
  { label: "Otro", value: "otro" },
];

const soatItems: {
  label: string;
  value: SoatPurchased | "todos";
}[] = [
  { label: "Cualquier opción", value: "todos" },
  { label: "Sí", value: "si" },
  { label: "No", value: "no" },
];

const INITIAL_FILTERS: AnaliticaFilters = {
  dateRange: undefined,
  vehicleType: "todos",
  result: "todos",
  serviceType: "RTM",
  soatPurchased: "todos",
};

export function AnaliticicaRangoPersonalizado() {
  const [filters, setFilters] = useState<AnaliticaFilters>(INITIAL_FILTERS);







const {
  data: total,
  refetch,
  isFetching,
  error,
} = useAnaliticaPersonalizada(filters);



const handleConsultar = async () => {
  await refetch();
};




  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Filter className="h-5 w-5" />
          Analítica personalizada
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-5">
        {/* Rango de fechas */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-medium">
            <CalendarDays className="h-4 w-4" />
            Rango de fechas
          </label>

          <DateRangePicker
            dateRange={filters.dateRange}
            setDateRange={(range) =>
              setFilters((prev) => ({
                ...prev,
                dateRange: range,
              }))
            }
          />
        </div>

        {/* Filtros de la analítica */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {/* Tipo de vehículo */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Tipo de vehículo</label>

            <Select
              items={vehicleTypeItems}
              value={filters.vehicleType}
              onValueChange={(value) => {
                if (value === null) return;

                setFilters((prev) => ({
                  ...prev,
                  vehicleType: value as AnaliticaFilters["vehicleType"],
                }));
              }}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>

              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Tipo de vehículo</SelectLabel>

                  {vehicleTypeItems.map((item) => (
                    <SelectItem key={item.value} value={item.value}>
                      {item.label}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>

          {/* Resultado */}
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Resultado de la revisión
            </label>

            <Select
              items={resultItems}
              value={filters.result}
              onValueChange={(value) => {
                if (value === null) return;

                setFilters((prev) => ({
                  ...prev,
                  result: value as AnaliticaFilters["result"],
                }));
              }}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>

              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Resultado</SelectLabel>

                  {resultItems.map((item) => (
                    <SelectItem key={item.value} value={item.value}>
                      {item.label}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>

          {/* Tipo de inspección */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Tipo de inspección</label>

            <Select
              items={serviceTypeItems}
              value={filters.serviceType}
              onValueChange={(value) => {
                if (value === null) return;

                setFilters((prev) => ({
                  ...prev,
                  serviceType: value as AnaliticaFilters["serviceType"],
                }));
              }}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>

              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Servicio</SelectLabel>

                  {serviceTypeItems.map((item) => (
                    <SelectItem key={item.value} value={item.value}>
                      {item.label}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>

          {/* Compra de SOAT */}
          <div className="space-y-2">
            <label className="text-sm font-medium">
              ¿Compró SOAT junto con al RTM?
            </label>

            <Select
              items={soatItems}
              value={filters.soatPurchased}
              onValueChange={(value) => {
                if (value === null) return;

                setFilters((prev) => ({
                  ...prev,
                  soatPurchased: value as AnaliticaFilters["soatPurchased"],
                }));
              }}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>

              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Compra de SOAT</SelectLabel>

                  {soatItems.map((item) => (
                    <SelectItem key={item.value} value={item.value}>
                      {item.label}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
        </div>
       <div className="flex justify-start border-t pt-4">
  <Button
    onClick={handleConsultar}
    disabled={isFetching}
    className="gap-2"
  >
    <Filter className="h-4 w-4" />
    {isFetching ? "Consultando..." : "Consultar"}
  </Button>
</div>

{error && (
  <p className="text-sm text-destructive">
    No fue posible consultar la analítica: {error.message}
  </p>
)}


  <div className="flex justify-start pt-4">
    <CuadroMetrica
      label="Total Consultado"
      valor={total ?? 0}
      esPrimario={true}
      isPorcentaje={false}
    
    />
  </div>

      </CardContent>
    </Card>
  );
}
