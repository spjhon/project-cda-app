"use client"

import { useMemo } from "react"

import { useOficina, VehicleRate } from "@/contexts/OficinaLoaderContext"



import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

import {
  AlertCircle,
  CheckCircle2,
  Loader2,
  Car,
  Truck,
  Bike,
  Zap,
  Gauge,
  ShieldAlert,
  Trash2,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

// ==========================================
// DICCIONARIOS DE MAPEO Y TRADUCCIÓN
// ==========================================

const VEHICLE_TYPE_MAP: Record<
  string,
  {
    label: string
    icon: React.ComponentType<{ className?: string }>
  }
> = {
  liviano: { label: "Liviano", icon: Car },
  pesado: { label: "Pesado", icon: Truck },
  motocicleta_4t: { label: "Moto 4T", icon: Bike },
  motocicleta_2t: { label: "Moto 2T", icon: Bike },
  motocicleta_electrica: { label: "Moto Eléctrica", icon: Zap },
  motocarro_4t: { label: "Moto-Carro 4T", icon: Gauge },
  motocarro_2t: { label: "Moto-Carro 2T", icon: ShieldAlert },
  motocarro_diesel: { label: "Moto-Carro Diésel", icon: Truck },
}

const SERVICE_TYPE_MAP: Record<string, string> = {
  RTM: "RTM",
  preventiva: "Preventiva",
  peritaje: "Peritaje",
  otro: "Otro",
}

const columnHelper = createColumnHelper<VehicleRate>()

export default function RatesTable() {
  const {
    rates,
    isLoadingRates,
    errorRates,
    refetchRates,
    isFetchingRates,
  } = useOficina()

  // ==========================================
  // CONFIGURACIÓN DE COLUMNAS
  // ==========================================

  const columns = useMemo(
    () => [
      // ------------------------------------------
      // FECHA
      // ------------------------------------------
      columnHelper.accessor("created_at", {
        header: "Fecha",
        cell: (info) => {
          const date = new Date(info.getValue())

          return (
            <span className="text-muted-foreground text-sm whitespace-nowrap">
              {date.toLocaleDateString("es-CO", {
                dateStyle: "medium",
              })}
            </span>
          )
        },
      }),

      // ------------------------------------------
      // SERVICIO
      // ------------------------------------------
      columnHelper.accessor("service_type", {
        header: "Servicio",
        cell: (info) => {
          const value = info.getValue() as string
          const translatedLabel =
            SERVICE_TYPE_MAP[value] || value || "---"

          return (
            <span className="font-semibold text-foreground text-sm tracking-tight bg-muted px-2.5 py-1 rounded-md border border-border whitespace-nowrap">
              {translatedLabel}
            </span>
          )
        },
      }),

      // ------------------------------------------
      // TIPO DE VEHÍCULO
      // ------------------------------------------
      columnHelper.accessor("vehicle_type", {
        header: "Tipo de Vehículo",
        cell: (info) => {
          const value = info.getValue() as string

          const config = VEHICLE_TYPE_MAP[value] || {
            label: value || "No especificado",
            icon: Car,
          }

          const IconComponent = config.icon

          return (
            <div className="flex items-center gap-2 font-medium text-foreground">
              <div className="p-1.5 rounded-md bg-muted text-primary border border-border">
                <IconComponent className="h-4 w-4 shrink-0" />
              </div>

              <span className="text-sm truncate">
                {config.label}
              </span>
            </div>
          )
        },
      }),

      // ------------------------------------------
      // PRECIO BASE
      // ------------------------------------------
      columnHelper.accessor("base_price", {
        header: "Precio Base",
        cell: (info) => {
          const price = info.getValue() as number

          return (
            <span className="font-bold text-primary text-sm whitespace-nowrap">
              ${price.toLocaleString("es-CO")}
            </span>
          )
        },
      }),

      // ------------------------------------------
      // COBRA IVA
      // ------------------------------------------
      columnHelper.display({
        id: "charges_vat",
        header: "¿Cobra IVA?",
        cell: () => (
          <Badge
            variant="outline"
            className="font-medium"
          >
            Sí
          </Badge>
        ),
      }),

      // ------------------------------------------
      // % IVA
      // ------------------------------------------
      columnHelper.display({
        id: "vat_percentage",
        header: "% IVA",
        cell: () => (
          <span className="text-sm font-medium">
            0%
          </span>
        ),
      }),

      // ------------------------------------------
      // TARIFAS
      // ------------------------------------------
      columnHelper.display({
        id: "fees",
        header: "Tarifas",
        cell: () => (
          <div className="flex items-center gap-2">
            <span className="font-semibold text-sm text-foreground whitespace-nowrap">
              $10.000
            </span>

            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-8"
              onClick={() => {}}
            >
              Ver tarifas
            </Button>
          </div>
        ),
      }),

      // ------------------------------------------
      // TOTAL
      // ------------------------------------------
      columnHelper.display({
        id: "total",
        header: "Total",
        cell: () => (
          <span className="font-bold text-primary text-sm whitespace-nowrap">
            $0
          </span>
        ),
      }),

      // ------------------------------------------
      // ACCIONES
      // ------------------------------------------
      columnHelper.display({
        id: "actions",
        header: "",
        cell: () => (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
            onClick={() => {}}
            title="Eliminar tarifa"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        ),
      }),
    ],
    [],
  )

  const table = useReactTable({
    data: rates || [],
    columns,
    getCoreRowModel: getCoreRowModel(),
  })

  // ==========================================
  // RENDERIZADO DEL BADGE DE ESTADO
  // ==========================================

  const renderStatusBadge = () => {
    if (errorRates) {
      return (
        <Badge
          variant="destructive"
          className="gap-1.5 px-3 py-1 w-35 shadow-sm min-w-35 justify-center"
        >
          <AlertCircle className="h-3.5 w-4" />
          Error
        </Badge>
      )
    }

    if (isFetchingRates || isLoadingRates) {
      return (
        <Badge
          variant="default"
          className="gap-1.5 px-3 py-1 w-35 shadow-sm min-w-35 justify-center bg-primary text-primary-foreground"
        >
          <Loader2 className="h-3.5 w-4 animate-spin" />

          {isLoadingRates
            ? "Cargando..."
            : "Actualizando..."}
        </Badge>
      )
    }

    return (
      <Badge
        variant="outline"
        className="gap-1.5 px-3 py-1 w-35 shadow-sm min-w-35 justify-center border-emerald-500 text-emerald-700 bg-emerald-50 dark:bg-emerald-950/50 dark:text-emerald-400 dark:border-emerald-800"
      >
        <CheckCircle2 className="h-3.5 w-4" />
        Datos Actualizados
      </Badge>
    )
  }

  // ==========================================
  // RENDER PRINCIPAL
  // ==========================================

  return (
    <div className="space-y-5 p-6 bg-background rounded-2xl shadow-sm">

      {/* ==========================================
          SECCIÓN SUPERIOR
          ========================================== */}

      <div className="flex flex-row items-center justify-between bg-muted/30 p-4 rounded-xl border border-border shadow-sm">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-muted-foreground">
            Tarifas de Vehículos
          </span>
        </div>

        <div className="flex items-center gap-3">

          {/* Badge de estado */}
          {renderStatusBadge()}

          {/* Botón de refrescar */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetchRates()}
            disabled={isLoadingRates}
            className="h-9"
          >
            <Loader2
              className={`h-4 w-4 mr-2 ${
                isLoadingRates ? "animate-spin" : ""
              }`}
            />

            Refrescar
          </Button>
        </div>
      </div>

      {/* ==========================================
          ACCIONES DE LA TABLA
          ========================================== */}

      <div className="flex justify-end">
        <Button
          type="button"
          onClick={() => {}}
        >
          Agregar tarifa
        </Button>
      </div>

      {/* ==========================================
          CONTENEDOR DE LA TABLA
          ========================================== */}

      <div className="border border-border rounded-xl overflow-hidden shadow-sm bg-background overflow-x-auto">
        <Table>
          <TableHeader className="bg-muted/50 border-b border-border">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow
                key={headerGroup.id}
                className="hover:bg-transparent"
              >
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    className="font-semibold text-foreground h-11 whitespace-nowrap"
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>

          <TableBody>

            {/* Primera carga */}
            {isLoadingRates ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="text-center py-12"
                >
                  <div className="flex items-center justify-center gap-2 text-muted-foreground">
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />

                    <span className="font-medium">
                      Cargando tarifas...
                    </span>
                  </div>
                </TableCell>
              </TableRow>

            ) : isFetchingRates && !isLoadingRates ? (

              /* Refetch en segundo plano */
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="text-center py-12"
                >
                  <div className="flex items-center justify-center gap-2 text-muted-foreground">
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />

                    <span className="font-medium">
                      Actualizando tarifas...
                    </span>
                  </div>
                </TableCell>
              </TableRow>

            ) : errorRates ? (

              /* Error */
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="text-center py-12"
                >
                  <div className="flex flex-col items-center justify-center gap-3 text-destructive">
                    <AlertCircle className="h-8 w-8" />

                    <span className="font-medium">
                      Error al cargar las tarifas
                    </span>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => refetchRates()}
                    >
                      Reintentar
                    </Button>
                  </div>
                </TableCell>
              </TableRow>

            ) : table.getRowModel().rows.length ? (

              /* Datos cargados */
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  className="hover:bg-muted/50 border-b border-border transition-colors"
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell
                      key={cell.id}
                      className="py-3"
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))

            ) : (

              /* Sin datos */
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="text-center py-12 text-muted-foreground font-medium"
                >
                  No se encontraron tarifas configuradas
                </TableCell>
              </TableRow>
            )}

          </TableBody>
        </Table>
      </div>
    </div>
  )
}