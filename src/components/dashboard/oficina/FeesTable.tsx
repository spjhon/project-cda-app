"use client"

import { useMemo } from "react"

import { FeeType, useOficina } from "@/contexts/OficinaLoaderContext"


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
  Trash2,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import AddFeeDialog from "./AddFee"

// ==========================================
// CONFIGURACIÓN DE COLUMNAS
// ==========================================

const columnHelper = createColumnHelper<FeeType>()

export default function FeesTable() {



  const {
    feeTypes,
    isLoadingFeeTypes,
    errorFeeTypes,
    refetchFeeTypes,
    isFetchingFeeTypes,
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
      // FEE
      // ------------------------------------------

      columnHelper.accessor("name", {
        header: "Fee",

        cell: (info) => {
          const value = info.getValue()

          return (
            <span className="font-semibold text-foreground text-sm whitespace-nowrap">
              {value || "---"}
            </span>
          )
        },
      }),

      // ------------------------------------------
      // CÓDIGO
      // ------------------------------------------

      columnHelper.accessor("code", {
        header: "Código",

        cell: (info) => {
          const value = info.getValue()

          return (
            <span className="font-mono text-sm font-medium bg-muted px-2.5 py-1 rounded-md border border-border whitespace-nowrap">
              {value || "---"}
            </span>
          )
        },
      }),

      // ------------------------------------------
      // DESCRIPCIÓN
      // ------------------------------------------

      columnHelper.accessor("description", {
        header: "Descripción",

        cell: (info) => {
          const value = info.getValue()

          return (
            <span className="text-sm text-muted-foreground max-w-64 truncate block">
              {value || "---"}
            </span>
          )
        },
      }),

      // ------------------------------------------
      // VALOR DEL FEE
      // ------------------------------------------

      columnHelper.accessor("fee_amount", {
        header: "Valor",

        cell: (info) => {
          const amount = info.getValue()

          return (
            <span className="font-bold text-primary text-sm whitespace-nowrap">
              ${Number(amount).toLocaleString("es-CO")}
            </span>
          )
        },
      }),

      // ------------------------------------------
      // IVA
      // ------------------------------------------
      columnHelper.accessor("iva_percentage", {
        header: "IVA",
        cell: (info) => {
          const iva = info.getValue()

          return (
            <span className="text-sm font-medium whitespace-nowrap">
              {Number(iva) === 0 ? "Sin IVA" : `${Number(iva)}%`}
            </span>
          )
        },
      }),

      // ------------------------------------------
      // AÑOS DEL MODELO
      // ------------------------------------------

      columnHelper.display({
        id: "model_year_range",
        header: "Años modelo",

        cell: ({ row }) => {
          const from = row.original.model_year_from
          const to = row.original.model_year_to

          let label = "Todos los años"

          if (from !== null && to !== null) {
            label = `${from} - ${to}`
          } else if (from !== null) {
            label = `${from} en adelante`
          } else if (to !== null) {
            label = `Hasta ${to}`
          }

          return (
            <span className="text-sm font-medium whitespace-nowrap">
              {label}
            </span>
          )
        },
      }),

      // ------------------------------------------
      // ESTADO
      // ------------------------------------------

      columnHelper.accessor("is_active", {
        header: "Estado",

        cell: (info) => {
          const isActive = info.getValue()

          return (
            <Badge
              variant={isActive ? "outline" : "secondary"}
              className={
                isActive
                  ? "border-emerald-500 text-emerald-700 bg-emerald-50 dark:bg-emerald-950/50 dark:text-emerald-400 dark:border-emerald-800"
                  : ""
              }
            >
              {isActive ? "Activo" : "Inactivo"}
            </Badge>
          )
        },
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
            title="Eliminar fee"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        ),
      }),

    ],
    [],
  )

  // ==========================================
  // CONFIGURACIÓN DE LA TABLA
  // ==========================================

  const table = useReactTable({
    data: feeTypes || [],
    columns,
    getCoreRowModel: getCoreRowModel(),
  })

  // ==========================================
  // RENDERIZADO DEL BADGE DE ESTADO
  // ==========================================

  const renderStatusBadge = () => {
    if (errorFeeTypes) {
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

    if (isFetchingFeeTypes || isLoadingFeeTypes) {
      return (
        <Badge
          variant="default"
          className="gap-1.5 px-3 py-1 w-35 shadow-sm min-w-35 justify-center bg-primary text-primary-foreground"
        >
          <Loader2 className="h-3.5 w-4 animate-spin" />

          {isLoadingFeeTypes
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
            Tipos de Fees
          </span>
        </div>

        <div className="flex items-center gap-3">

          {/* Badge de estado */}

          {renderStatusBadge()}

          {/* Botón de refrescar */}

          <Button
            variant="outline"
            size="sm"
            onClick={() => refetchFeeTypes()}
            disabled={isLoadingFeeTypes}
            className="h-9"
          >
            <Loader2
              className={`h-4 w-4 mr-2 ${
                isLoadingFeeTypes ? "animate-spin" : ""
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

        <AddFeeDialog></AddFeeDialog>

      </div>

      {/* ==========================================
          CONTENEDOR DE LA TABLA
          ========================================== */}

      <div className="border border-border rounded-xl overflow-hidden shadow-sm bg-background overflow-x-auto">

        <Table>

          {/* ==========================================
              HEADER
              ========================================== */}

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

          {/* ==========================================
              BODY
              ========================================== */}

          <TableBody>

            {/* ==========================================
                PRIMERA CARGA
                ========================================== */}

            {isLoadingFeeTypes ? (

              <TableRow>

                <TableCell
                  colSpan={columns.length}
                  className="text-center py-12"
                >

                  <div className="flex items-center justify-center gap-2 text-muted-foreground">

                    <Loader2 className="h-6 w-6 animate-spin text-primary" />

                    <span className="font-medium">
                      Cargando tipos de fees...
                    </span>

                  </div>

                </TableCell>

              </TableRow>

            ) : isFetchingFeeTypes && !isLoadingFeeTypes ? (

              /* ==========================================
                 REFRESH EN SEGUNDO PLANO
                 ========================================== */

              <TableRow>

                <TableCell
                  colSpan={columns.length}
                  className="text-center py-12"
                >

                  <div className="flex items-center justify-center gap-2 text-muted-foreground">

                    <Loader2 className="h-6 w-6 animate-spin text-primary" />

                    <span className="font-medium">
                      Actualizando tipos de fees...
                    </span>

                  </div>

                </TableCell>

              </TableRow>

            ) : errorFeeTypes ? (

              /* ==========================================
                 ERROR
                 ========================================== */

              <TableRow>

                <TableCell
                  colSpan={columns.length}
                  className="text-center py-12"
                >

                  <div className="flex flex-col items-center justify-center gap-3 text-destructive">

                    <AlertCircle className="h-8 w-8" />

                    <span className="font-medium">
                      Error al cargar los tipos de fees
                    </span>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => refetchFeeTypes()}
                    >
                      Reintentar
                    </Button>

                  </div>

                </TableCell>

              </TableRow>

            ) : table.getRowModel().rows.length ? (

              /* ==========================================
                 DATOS CARGADOS
                 ========================================== */

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

              /* ==========================================
                 SIN DATOS
                 ========================================== */

              <TableRow>

                <TableCell
                  colSpan={columns.length}
                  className="text-center py-12 text-muted-foreground font-medium"
                >
                  No se encontraron tipos de fees configurados
                </TableCell>

              </TableRow>

            )}

          </TableBody>

        </Table>

      </div>

    </div>
  )
}