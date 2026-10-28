"use client"

import { useCallback, useContext, useMemo, useState } from "react"

import {
  createColumnHelper,
  flexRender,
  stockFeatures,
  useTable,
  type StockFeatures,
} from "@tanstack/react-table";

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
  Eye,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog"

import { PermissionsContext } from "@/contexts/PermissionsLoaderContext"
import {
  useVehicleRates,
  VehicleRate,
} from "@/lib/client-actions/fetch_rates"

import { AddRateDialog } from "./AddRate"
import { useUpdateVehicleRateActive } from "@/lib/client-actions/update_vehicle_service_rate_is_active"
import { GenericErrorDialog } from "@/components/feedbackDialogs/GenericErrorDialog"
import { useDeleteVehicleRate } from "@/lib/client-actions/delete_vehicle_service_rate"
import { GenericConfirmDialog } from "@/components/feedbackDialogs/GenericConfirmDialog"




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
  preventiva_viajero: "Preventiva viajero",
  peritaje: "Peritaje",
  prueba_gases: "Prueba de gases",
  otro: "Otro",
};

const FUEL_TYPE_MAP: Record<string, string> = {
  gasolina: "Gasolina",
  gas_natural_vehicular: "Gas Natural Vehicular",
  diesel: "Diésel",
  gas_gasolina: "Gas / Gasolina",
  hibrido: "Híbrido",
  electrico: "Eléctrico",
  etanol: "Etanol",
  biodiesel: "Biodiésel",
  hidrogeno: "Hidrógeno",
}

const VEHICLE_CLASS_MAP: Record<string, string> = {
  automovil: "Automóvil",
  bus: "Bus",
  buseta: "Buseta",
  camion: "Camión",
  camioneta: "Camioneta",
  campero: "Campero",
  microbus: "Microbús",
  tractocamion: "Tractocamión",
  motocicleta: "Motocicleta",
  motocarro: "Motocarro",
  mototriciclo: "Mototriciclo",
  cuatrimoto: "Cuatrimoto",
  remolque: "Remolque",
  semiremolque: "Semirremolque",
  volqueta: "Volqueta",
  sin_clase: "Sin clase",
  maquinaria_construccion_o_minera:
    "Maquinaria de construcción o minera",
  ciclomotor: "Ciclomotor",
  tricimoto: "Tricimoto",
  cuadriciclo: "Cuadriciclo",
}

const VEHICLE_SERVICE_TYPE_MAP: Record<string, string> = {
  particular: "Particular",
  enseñanza: "Enseñanza",
  oficial: "Oficial",
  publico: "Público",
  diplomático: "Diplomático",
  especial: "Especial",
}

const columnHelper = createColumnHelper<StockFeatures, VehicleRate>();

// ==========================================
// DIALOG: COMBUSTIBLES
// ==========================================

function FuelsDialog({
  rate,
  open,
  onOpenChange,
}: {
  rate: VehicleRate
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Combustibles</DialogTitle>
          <DialogDescription>
            Combustibles asociados a esta tarifa.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-wrap gap-2 pt-2">
          {rate.fuels.length > 0 ? (
            rate.fuels.map((fuel) => (
              <Badge key={fuel} variant="secondary">
                {FUEL_TYPE_MAP[fuel] || fuel}
              </Badge>
            ))
          ) : (
            <span className="text-sm text-muted-foreground">
              No hay combustibles asociados.
            </span>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

// ==========================================
// DIALOG: CLASES
// ==========================================

function ClassesDialog({
  rate,
  open,
  onOpenChange,
}: {
  rate: VehicleRate
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Clases de vehículo</DialogTitle>
          <DialogDescription>
            Clases de vehículo asociadas a esta tarifa.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-wrap gap-2 pt-2">
          {rate.classes.length > 0 ? (
            rate.classes.map((vehicleClass) => (
              <Badge
                key={vehicleClass}
                variant="secondary"
              >
                {VEHICLE_CLASS_MAP[vehicleClass] ||
                  vehicleClass}
              </Badge>
            ))
          ) : (
            <span className="text-sm text-muted-foreground">
              No hay clases asociadas.
            </span>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

// ==========================================
// DIALOG: TIPO DE SERVICIO DEL VEHÍCULO
// ==========================================

function VehicleServiceTypesDialog({
  rate,
  open,
  onOpenChange,
}: {
  rate: VehicleRate
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Tipo de servicio</DialogTitle>
          <DialogDescription>
            Tipos de servicio del vehículo asociados a
            esta tarifa.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-wrap gap-2 pt-2">
          {rate.service_types.length > 0 ? (
            rate.service_types.map((serviceType) => (
              <Badge
                key={serviceType}
                variant="secondary"
              >
                {VEHICLE_SERVICE_TYPE_MAP[
                  serviceType
                ] || serviceType}
              </Badge>
            ))
          ) : (
            <span className="text-sm text-muted-foreground">
              No hay tipos de servicio asociados.
            </span>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

// ==========================================
// DIALOG: FEES
// ==========================================

function FeesDialog({
  rate,
  open,
  onOpenChange,
}: {
  rate: VehicleRate
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Tarifas adicionales</DialogTitle>
          <DialogDescription>
            Tarifas asociadas a este tipo de servicio y
            sus condiciones.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          {rate.fees.length > 0 ? (
            rate.fees.map((fee) => (
              <div
                key={fee.id}
                className="rounded-xl border border-border bg-muted/20 p-4 space-y-3"
              >
                {/* Nombre */}
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-semibold text-foreground">
                      {fee.name}
                    </p>

                    {fee.description && (
                      <p className="text-sm text-muted-foreground mt-1">
                        {fee.description}
                      </p>
                    )}
                  </div>

                  <span className="font-bold text-primary whitespace-nowrap">
                    $
                    {fee.fee_amount.toLocaleString(
                      "es-CO",
                    )}
                  </span>
                </div>

                {/* Información */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="rounded-lg border border-border bg-background p-3">
                    <p className="text-xs text-muted-foreground">
                      IVA
                    </p>

                    <p className="text-sm font-medium mt-1">
                      {fee.iva_percentage === null
                        ? "Sin IVA"
                        : `${fee.iva_percentage}%`}
                    </p>
                  </div>

                  <div className="rounded-lg border border-border bg-background p-3">
                    <p className="text-xs text-muted-foreground">
                      Rango de edad
                    </p>

                    <p className="text-sm font-medium mt-1">
                      {fee.vehicle_age_from !== null ||
                      fee.vehicle_age_to !== null
                        ? `${fee.vehicle_age_from ?? "Sin límite"} - ${
                            fee.vehicle_age_to ?? "Sin límite"
                          } años`
                        : "Sin rango de edad"}
                    </p>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="py-8 text-center text-sm text-muted-foreground">
              No hay tarifas adicionales asociadas.
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

// ==========================================
// TABLA
// ==========================================

export default function RatesTable() {
  // ==========================================
  // TENANT
  // ==========================================

  const permissionsContextRecived = useContext(
    PermissionsContext,
  )

  const tenantId =
    permissionsContextRecived?.PermissionsContextValue
      .tenantObject?.id

  const updateVehicleRateActiveMutation = useUpdateVehicleRateActive();
  const deleteVehicleRateMutation = useDeleteVehicleRate();

 

  const [errors, setErrors] = useState<string | null>(null);
  const [isErrorOpen, setIsErrorOpen] = useState(false);

  // ==========================================
  // OBTENER RATES
  // ==========================================

  const {
    data: rates = [],
    isLoading: isLoadingRates,
    isFetching: isFetchingRates,
    error: errorRates,
    refetch: refetchRates,
  } = useVehicleRates({
    tenantId,
  })

 
/* ==========================================
 * MUTATION: ESTADO ACTIVO
 * ========================================== */

const handleToggleActive = useCallback(
  (rate: VehicleRate): void => {
    updateVehicleRateActiveMutation.mutate(
      {
        id: rate.id,
        is_active: !rate.is_active,
      },
      {
        onError: (error) => {
          setErrors(error.message);
          setIsErrorOpen(true);
        },
      }
    );
  },
  [
    updateVehicleRateActiveMutation,
    setErrors,
    setIsErrorOpen,
  ]
);

/* ==========================================
 * MUTATION: ELIMINAR
 * ========================================== */

const handleDeleteRate = useCallback(
  async (rate: VehicleRate): Promise<void> => {
    await deleteVehicleRateMutation.mutateAsync({
      id: rate.id,
    });
  },
  [deleteVehicleRateMutation]
);


  // ==========================================
  // CONFIGURACIÓN DE COLUMNAS
  // ==========================================

const columns = useMemo(
  () =>
    columnHelper.columns([
      // ------------------------------------------
      // FECHA
      // ------------------------------------------
      columnHelper.accessor("created_at", {
        header: "Fecha",
        cell: (info) => {
          const date = new Date(info.getValue());

          return (
            <span className="text-muted-foreground text-sm whitespace-nowrap">
              {date.toLocaleDateString("es-CO", {
                dateStyle: "medium",
              })}
            </span>
          );
        },
      }),

      // ------------------------------------------
      // SERVICIO
      // ------------------------------------------
      columnHelper.accessor("service_type", {
        header: "Servicio",
        cell: (info) => {
          const value = info.getValue() as string;
          const translatedLabel = SERVICE_TYPE_MAP[value] || value || "---";

          return (
            <span className="font-semibold text-foreground text-sm tracking-tight bg-muted px-2.5 py-1 rounded-md border border-border whitespace-nowrap">
              {translatedLabel}
            </span>
          );
        },
      }),

      // ------------------------------------------
      // TIPO DE VEHÍCULO
      // ------------------------------------------
      columnHelper.accessor("vehicle_type", {
        header: "Tipo de Vehículo",
        cell: (info) => {
          const value = info.getValue() as string;

          const config = VEHICLE_TYPE_MAP[value] ?? {
            label: value || "No especificado",
            icon: Car,
          };

          const IconComponent = config.icon;

          return (
            <div className="flex items-center gap-2 font-medium text-foreground">
              <div className="p-1.5 rounded-md bg-muted text-primary border border-border">
                <IconComponent className="h-4 w-4 shrink-0" />
              </div>
              <span className="text-sm truncate">{config.label}</span>
            </div>
          );
        },
      }),

      // ------------------------------------------
      // PRECIO BASE
      // ------------------------------------------
      columnHelper.accessor("base_price", {
        header: "Precio Base",
        cell: (info) => {
          const price = info.getValue();

          return (
            <span className="font-bold text-primary text-sm whitespace-nowrap">
              ${Number(price).toLocaleString("es-CO")}
            </span>
          );
        },
      }),

      // ------------------------------------------
      // IVA
      // ------------------------------------------
      columnHelper.accessor("iva_percentage", {
        header: "% IVA",
        cell: (info) => {
          const iva = info.getValue();

          if (iva === null) {
            return (
              <Badge variant="outline" className="text-xs">
                Sin IVA
              </Badge>
            );
          }

          return (
            <span className="text-sm font-medium whitespace-nowrap">
              {iva}%
            </span>
          );
        },
      }),

      // ------------------------------------------
      // COMBUSTIBLES
      // ------------------------------------------
      columnHelper.display({
        id: "fuels",
        header: "Combustibles",
        cell: ({ row }) => <FuelsCell rate={row.original} />,
      }),

      // ------------------------------------------
      // CLASES
      // ------------------------------------------
      columnHelper.display({
        id: "classes",
        header: "Clases",
        cell: ({ row }) => <ClassesCell rate={row.original} />,
      }),

      // ------------------------------------------
      // TIPO DE SERVICIO DEL VEHÍCULO
      // ------------------------------------------
      columnHelper.display({
        id: "service_types",
        header: "Tipo servicio vehículo",
        cell: ({ row }) => (
          <VehicleServiceTypesCell rate={row.original} />
        ),
      }),

      // ------------------------------------------
      // TARIFAS ADICIONALES
      // ------------------------------------------
      columnHelper.display({
        id: "fees",
        header: "Tarifas",
        cell: ({ row }) => <FeesCell rate={row.original} />,
      }),

      // ------------------------------------------
      // ESTADO
      // ------------------------------------------
      columnHelper.accessor("is_active", {
        header: "Estado",
        cell: (info) => {
          const rate = info.row.original;
          const isActive = info.getValue();

          return (
            <div className="flex items-center gap-2">
              <Switch
                checked={isActive}
                onCheckedChange={() => handleToggleActive(rate)}
                disabled={isFetchingRates || isLoadingRates}
                aria-label={
                  isActive ? "Desactivar tarifa" : "Activar tarifa"
                }
              />

              <Badge
                variant={isActive ? "default" : "secondary"}
                className="w-24 justify-center whitespace-nowrap"
              >
                {isActive ? "Activa" : "Desactivada"}
              </Badge>
            </div>
          );
        },
      }),

      // ------------------------------------------
      // EMPRESAS RELACIONADAS
      // ------------------------------------------
      columnHelper.accessor("companies", {
        header: "Empresas relacionadas",
        cell: (info) => {
          const companies = info.getValue() ?? [];
          const hasCompanies = companies.length > 0;

          return (
            <Dialog>
              <DialogTrigger
                render={
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-fit whitespace-nowrap"
                  />
                }
              >
                {hasCompanies
                  ? `Ver empresas (${companies.length})`
                  : "General"}
              </DialogTrigger>

              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Empresas relacionadas</DialogTitle>
                  <DialogDescription>
                    Empresas asociadas a esta tarifa.
                  </DialogDescription>
                </DialogHeader>

                {hasCompanies ? (
                  <ul className="flex flex-col gap-2">
                    {companies.map((company) => (
                      <li
                        key={company.id}
                        className="rounded-md border px-3 py-2"
                      >
                        {company.name}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Esta es una tarifa general, sin empresas asociadas.
                  </p>
                )}
              </DialogContent>
            </Dialog>
          );
        },
      }),

      // ------------------------------------------
      // ACCIONES
      // ------------------------------------------
      columnHelper.display({
        id: "actions",
        header: "",
        cell: ({ row }) => (
          <RateActionsCell
            rate={row.original}
            onDelete={handleDeleteRate}
            isPending={deleteVehicleRateMutation.isPending}
          />
        ),
      }),
    ]),
  [
    isFetchingRates,
    isLoadingRates,
    handleToggleActive,
    handleDeleteRate,
    deleteVehicleRateMutation.isPending,
  ],
);


  // ==========================================
  // TABLA TANSTACK
  // ==========================================

  const table = useTable({
  features: stockFeatures,
  data: rates,
  columns,
});

  // ==========================================
  // STATUS BADGE
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

    if (
      isFetchingRates ||
      isLoadingRates
    ) {
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
    <>
    <GenericErrorDialog
            isOpen={isErrorOpen}
            setIsOpen={setIsErrorOpen}
            headerText="Error al crear rate"
            descriptionText="No fue posible crear el rate."
            errors={errors}
          />
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
          {renderStatusBadge()}

          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              refetchRates()
            }
            className="h-9"
          >
            <Loader2
              className={`h-4 w-4 mr-2 ${
                isLoadingRates ||
                isFetchingRates
                  ? "animate-spin"
                  : ""
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
        <AddRateDialog />
      </div>

      {/* ==========================================
          CONTENEDOR DE LA TABLA
          ========================================== */}

      <div className="border border-border rounded-xl overflow-hidden shadow-sm bg-background overflow-x-auto">
        <Table>
          <TableHeader className="bg-muted/50 border-b border-border">
            {table
              .getHeaderGroups()
              .map((headerGroup) => (
                <TableRow
                  key={headerGroup.id}
                  className="hover:bg-transparent"
                >
                  {headerGroup.headers.map(
                    (header) => (
                      <TableHead
                        key={header.id}
                        className="font-semibold text-foreground h-11 whitespace-nowrap"
                      >
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header
                                .column
                                .columnDef
                                .header,
                              header.getContext(),
                            )}
                      </TableHead>
                    ),
                  )}
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
                      onClick={() =>
                        refetchRates()
                      }
                    >
                      Reintentar
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ) : table.getRowModel().rows.length ? (
              /* Datos cargados */

              table
                .getRowModel()
                .rows.map((row) => (
                  <TableRow
                    key={row.id}
                    className="hover:bg-muted/50 border-b border-border transition-colors"
                  >
                    {row
                      .getVisibleCells()
                      .map((cell) => (
                        <TableCell
                          key={cell.id}
                          className="py-3"
                        >
                          {flexRender(
                            cell.column.columnDef
                              .cell,
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
                  No se encontraron tarifas
                  configuradas
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
    </>
  )
}

// ============================================================
// CELDA: COMBUSTIBLES
// ============================================================

function FuelsCell({
  rate,
}: {
  rate: VehicleRate
}) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="h-8 gap-2"
        onClick={() => setOpen(true)}
      >
        <Eye className="h-3.5 w-3.5" />
        Ver ({rate.fuels.length})
      </Button>

      <FuelsDialog
        rate={rate}
        open={open}
        onOpenChange={setOpen}
      />
    </>
  )
}

// ============================================================
// CELDA: CLASES
// ============================================================

function ClassesCell({
  rate,
}: {
  rate: VehicleRate
}) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="h-8 gap-2"
        onClick={() => setOpen(true)}
      >
        <Eye className="h-3.5 w-3.5" />
        Ver ({rate.classes.length})
      </Button>

      <ClassesDialog
        rate={rate}
        open={open}
        onOpenChange={setOpen}
      />
    </>
  )
}

// ============================================================
// CELDA: TIPOS DE SERVICIO
// ============================================================

function VehicleServiceTypesCell({
  rate,
}: {
  rate: VehicleRate
}) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="h-8 gap-2"
        onClick={() => setOpen(true)}
      >
        <Eye className="h-3.5 w-3.5" />
        Ver ({rate.service_types.length})
      </Button>

      <VehicleServiceTypesDialog
        rate={rate}
        open={open}
        onOpenChange={setOpen}
      />
    </>
  )
}

// ============================================================
// CELDA: FEES
// ============================================================

function FeesCell({
  rate,
}: {
  rate: VehicleRate
}) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="h-8 gap-2"
        onClick={() => setOpen(true)}
      >
        <Eye className="h-3.5 w-3.5" />
        Ver ({rate.fees.length})
      </Button>

      <FeesDialog
        rate={rate}
        open={open}
        onOpenChange={setOpen}
      />
    </>
  )
}


// ==========================================
// ACCIONES DE LA FILA
// ==========================================


function RateActionsCell({
  rate,
  onDelete,
  isPending = false,
}: {
  rate: VehicleRate;
  onDelete: (rate: VehicleRate) => Promise<void>;
  isPending?: boolean;
}) {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const handleConfirmDelete = async () => {
    try {
      await onDelete(rate);
      setIsDeleteDialogOpen(false);
    } catch (error) {
      setDeleteError(
        error instanceof Error
          ? error.message
          : "Ocurrió un error al eliminar la tarifa.",
      );
    }
  };

  const handleDialogOpenChange = (open: boolean) => {
    if (isPending) return;

    setIsDeleteDialogOpen(open);

    if (open) {
      setDeleteError(null);
    }
  };

  return (
    <>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
        onClick={() => setIsDeleteDialogOpen(true)}
        title="Eliminar tarifa"
        aria-label="Eliminar tarifa"
      >
        <Trash2 className="h-4 w-4" />
      </Button>

      <GenericConfirmDialog
        open={isDeleteDialogOpen}
        onOpenChange={handleDialogOpenChange}
        title="¿Eliminar tarifa?"
        description={
          deleteError
            ? `No fue posible eliminar la tarifa: ${deleteError}`
            : "Esta acción eliminará la tarifa seleccionada. ¿Deseas continuar?"
        }
        itemName="Tarifa de vehículo"
        itemDetails={`ID: ${rate.id}`}
        confirmText="Eliminar tarifa"
        onConfirm={handleConfirmDelete}
        isPending={isPending}
      />
    </>
  );
}