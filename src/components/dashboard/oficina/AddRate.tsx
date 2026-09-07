"use client";

import { useContext, useMemo, useState } from "react";
import { Check, ChevronsUpDown } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import { Field, FieldDescription, FieldLabel } from "@/components/ui/field";

import { Input } from "@/components/ui/input";

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

import { Checkbox } from "@/components/ui/checkbox";

import { Button } from "@/components/ui/button";
import { PermissionsContext } from "@/contexts/PermissionsLoaderContext";

import { GenericErrorDialog } from "@/components/feedbackDialogs/GenericErrorDialog";
import { GenericSuccessDialog } from "@/components/feedbackDialogs/GenericSuccessDialog";
import { Database } from "../../../../supabase/types/database.types";
import FeesTable from "./FeesTable";
import { useCreateVehicleServiceRate } from "@/lib/client-actions/create_vehicle_service_rate";
import { createVehicleServiceRateSchema } from "@/lib/zod-schemas/validaciones-formularios/create-vehicle-service-rate-schema";

// -----------------------------------------------------------------------------
// OPCIONES
// -----------------------------------------------------------------------------

type ServiceType = Database["public"]["Enums"]["service_type_enum"];

const SERVICE_TYPES: {
  value: ServiceType;
  label: string;
}[] = [
  { value: "RTM", label: "RTM" },
  { value: "preventiva", label: "Preventiva" },
  { value: "peritaje", label: "Peritaje" },
];

type VehicleType = Database["public"]["Enums"]["vehicle_type_enum"];

const VEHICLE_TYPES: {
  value: VehicleType;
  label: string;
}[] = [
  { value: "liviano", label: "Liviano" },
  { value: "pesado", label: "Pesado" },
  { value: "motocicleta_4t", label: "Moto 4T" },
  { value: "motocicleta_2t", label: "Moto 2T" },
  { value: "motocarro_4t", label: "Moto-Carro 4T" },
  { value: "motocarro_2t", label: "Moto-Carro 2T" },
  {
    value: "motocicleta_electrica",
    label: "Motocicleta Eléctrica",
  },
  {
    value: "motocarro_diesel",
    label: "Motocarro Diésel",
  },
];

type FuelType = Database["public"]["Enums"]["fuel_type_enum"];

export const FUEL_OPTIONS: {
  value: FuelType;
  label: string;
}[] = [
  { value: "gasolina", label: "Gasolina" },
  {
    value: "gas_natural_vehicular",
    label: "Gas Natural Vehicular",
  },
  { value: "diesel", label: "Diesel" },
  { value: "gas_gasolina", label: "Gas-Gasolina" },
  { value: "hibrido", label: "Híbrido" },
  { value: "electrico", label: "Eléctrico" },
  { value: "etanol", label: "Etanol" },
  { value: "biodiesel", label: "Biodiesel" },
  { value: "hidrogeno", label: "Hidrógeno" },
];

type VehicleClass = Database["public"]["Enums"]["vehicle_class_enum"];

export const CLASE_OPTIONS: {
  value: VehicleClass;
  label: string;
}[] = [
  { value: "automovil", label: "Automóvil" },
  { value: "bus", label: "Bus" },
  { value: "buseta", label: "Buseta" },
  { value: "camion", label: "Camión" },
  { value: "camioneta", label: "Camioneta" },
  { value: "campero", label: "Campero" },
  { value: "microbus", label: "Microbús" },
  { value: "tractocamion", label: "Tractocamión" },
  { value: "motocicleta", label: "Motocicleta" },
  { value: "motocarro", label: "Motocarro" },
  { value: "mototriciclo", label: "Mototriciclo" },
  { value: "cuatrimoto", label: "Cuatrimoto" },
  { value: "remolque", label: "Remolque" },
  { value: "semiremolque", label: "Semirremolque" },
  { value: "volqueta", label: "Volqueta" },
  { value: "sin_clase", label: "Sin Clase" },
  {
    value: "maquinaria_construccion_o_minera",
    label: "Maquinaria de Construcción o Minera",
  },
  { value: "ciclomotor", label: "Ciclomotor" },
  { value: "tricimoto", label: "Tricimoto" },
  { value: "cuadriciclo", label: "Cuadriciclo" },
];

type VehicleServiceType = Database["public"]["Enums"]["vehicle_service_type_enum"];

const RATE_SERVICE_TYPES: {
  value: VehicleServiceType;
  label: string;
}[] = [
  { value: "particular", label: "Particular" },
  { value: "enseñanza", label: "Enseñanza" },
  { value: "oficial", label: "Oficial" },
  { value: "publico", label: "Público" },
  { value: "diplomático", label: "Diplomático" },
  { value: "especial", label: "Especial" },
];

// -----------------------------------------------------------------------------
// TIPOS
// -----------------------------------------------------------------------------

export interface RateFeeFormState {
  name: string;
  description: string;
  fee_amount: string;
  iva_percentage: string;
  model_year_from: string;
  model_year_to: string;
}

interface RateFormState {
  tenant_id: string;
  name: string;
  service_type: ServiceType | "";
  vehicle_type: VehicleType | "";
  fuels: FuelType[];
  classes: VehicleClass[];
  service_types: VehicleServiceType[];
  base_price_rtm: string;
  iva_percentage: string;
  fees: RateFeeFormState[];
}

interface MultiSelectOption<T extends string> {
  value: T;
  label: string;
}

interface MultiSelectFieldProps<T extends string> {
  label: string;
  placeholder: string;
  options: MultiSelectOption<T>[];
  value: T[];
  onChange: (value: T[]) => void;
  description?: string;
}

function MultiSelectField<T extends string>({
  label,
  placeholder,
  options,
  value,
  onChange,
  description,
}: MultiSelectFieldProps<T>) {
  const allSelected = value.length === options.length;

  const selectedLabels = useMemo(() => {
    return options
      .filter((option) => value.includes(option.value))
      .map((option) => option.label);
  }, [options, value]);

  const displayValue =
    value.length === 0
      ? placeholder
      : allSelected
        ? "Todos"
        : selectedLabels.length <= 2
          ? selectedLabels.join(", ")
          : `${selectedLabels.slice(0, 2).join(", ")} +${
              selectedLabels.length - 2
            }`;

  const toggleValue = (optionValue: T) => {
    if (value.includes(optionValue)) {
      onChange(value.filter((item) => item !== optionValue));
    } else {
      onChange([...value, optionValue]);
    }
  };

  const toggleAll = () => {
    if (allSelected) {
      onChange([]);
    } else {
      onChange(options.map((option) => option.value));
    }
  };

  return (
    <Field>
      <FieldLabel>{label}</FieldLabel>

      <Popover>
        <PopoverTrigger
          render={
            <Button
              type="button"
              variant="outline"
              role="combobox"
              className="w-full justify-between font-normal"
            >
              <span className="truncate">{displayValue}</span>

              <ChevronsUpDown className="ml-2 size-4 shrink-0 opacity-50" />
            </Button>
          }
        ></PopoverTrigger>

        <PopoverContent
          align="start"
          className="w-(--radix-popover-trigger-width) p-2"
        >
          <div className="space-y-1">
            <Button
              type="button"
              variant="ghost"
              className="w-full justify-start"
              onClick={toggleAll}
            >
              {allSelected ? "Deseleccionar todos" : "Seleccionar todos"}
            </Button>

            <div className="my-1 border-t" />

            <div className="max-h-64 overflow-y-auto">
              {options.map((option) => {
                const checked = value.includes(option.value);

                return (
                  <button
                    key={option.value}
                    type="button"
                    className="flex w-full items-center gap-2 rounded-sm px-2 py-2 text-sm hover:bg-accent"
                    onClick={() => toggleValue(option.value)}
                  >
                    <Checkbox
                      checked={checked}
                      className="pointer-events-none"
                    />

                    <span className="flex-1 text-left">{option.label}</span>

                    {checked && <Check className="size-4" />}
                  </button>
                );
              })}
            </div>
          </div>
        </PopoverContent>
      </Popover>

      {description && <FieldDescription>{description}</FieldDescription>}
    </Field>
  );
}

// -----------------------------------------------------------------------------
// INITIAL STATE
// -----------------------------------------------------------------------------

const INITIAL_FORM: RateFormState = {
  tenant_id: "",
  name: "",
  service_type: "",
  vehicle_type: "",
  fuels: [],
  classes: [],
  service_types: [],
  base_price_rtm: "",
  iva_percentage: "",
  fees: [],
};

// -----------------------------------------------------------------------------
// COMPONENTE
// -----------------------------------------------------------------------------

export function AddRateDialog() {
  const contextReceived = useContext(PermissionsContext);

  const tenantId = contextReceived?.PermissionsContextValue?.tenantObject?.id;

  const [isOpen, setIsOpen] = useState(false);

  const [form, setForm] = useState<RateFormState>({
    ...INITIAL_FORM,
    tenant_id: tenantId ?? "",
  });


 const createVehicleServiceRateMutation = useCreateVehicleServiceRate()


  const [errors, setErrors] = useState<string | null>(null);

  const [successMessages, setSuccessMessages] = useState<string | null>(null);

  const [isErrorOpen, setIsErrorOpen] = useState(false);

  const [isSuccessOpen, setIsSuccessOpen] = useState(false);

  // ---------------------------------------------------------------------------
  // HANDLERS
  // ---------------------------------------------------------------------------

  const handleChange = (field: keyof RateFormState, value: string) => {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  };

  const resetForm = () => {
    setForm({
      ...INITIAL_FORM,
      tenant_id: tenantId ?? "",
    });
  };

  


const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
  event.preventDefault();

  // ========================================================
  // DATOS DEL FORMULARIO
  // ========================================================

  const data = {
    tenant_id: form.tenant_id,
    name: form.name.trim(),
    service_type: form.service_type,
    vehicle_type: form.vehicle_type,
    fuels: form.fuels,
    classes: form.classes,
    service_types: form.service_types,
    base_price_rtm:
      form.base_price_rtm === ""
        ? undefined
        : Number(form.base_price_rtm),
    iva_percentage:
      form.iva_percentage === ""
        ? undefined
        : Number(form.iva_percentage),
    fees: form.fees,
  };

  // ========================================================
  // VALIDAR DATOS CON ZOD
  // ========================================================

  const result = createVehicleServiceRateSchema.safeParse(data);

  if (!result.success) {
    setErrors(
      result.error.issues
        .map((issue) => issue.message)
        .join("\n")
    );

    setIsErrorOpen(true);

    return;
  }

  // ========================================================
  // CREAR RATE PRINCIPAL
  // ========================================================

  createVehicleServiceRateMutation.mutate(
    {
      tenant_id: result.data.tenant_id,
      vehicle_type: result.data.vehicle_type,
      base_price_rtm: result.data.base_price_rtm.toString(),
      service_type: result.data.service_type,
    },
    {
      onSuccess: (rateId) => {
        console.log("Rate creado:", rateId);
      },

      onError: (error) => {
        setErrors(error.message);
        setIsErrorOpen(true);
      },
    }
  );
};




  // ---------------------------------------------------------------------------
  // RENDER
  // ---------------------------------------------------------------------------

  return (
    <>
      <Dialog
        open={isOpen}
        onOpenChange={(open) => {
          setIsOpen(open);

          if (!open) {
            resetForm();
          }
        }}
        disablePointerDismissal
      >
        <DialogTrigger render={<Button>+ Crear rate</Button>}></DialogTrigger>

        <DialogContent
          className="max-h-[90vh] overflow-y-auto "
          style={{ maxWidth: "80rem" }}
        >
          <DialogHeader>
            <DialogTitle>Crear nuevo rate</DialogTitle>

            <DialogDescription>
              Configure las condiciones y valores asociados al rate.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="min-w-0 space-y-6">
            <div className="grid min-w-0 gap-4 sm:grid-cols-2">
              {/* ----------------------------------------------------------------
                  NOMBRE
              ----------------------------------------------------------------- */}
              <Field>
                <FieldLabel htmlFor="name">Nombre</FieldLabel>
                <Input
                  id="name"
                  value={form.name}
                  onChange={(event) => handleChange("name", event.target.value)}
                  placeholder="Ej. RTM Liviano Público"
                />
              </Field>

              {/* ----------------------------------------------------------------
                  TIPO DE SERVICIO
              ----------------------------------------------------------------- */}
              <Field>
                <FieldLabel>Tipo de servicio</FieldLabel>

                <Select
                  items={SERVICE_TYPES}
                  value={form.service_type}
                  onValueChange={(value) =>
                    handleChange("service_type", value ?? "")
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Seleccione..." />
                  </SelectTrigger>

                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Tipo de servicio</SelectLabel>

                      {SERVICE_TYPES.map((item) => (
                        <SelectItem key={item.value} value={item.value}>
                          {item.label}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </Field>

              {/* ----------------------------------------------------------------
                  TIPO DE VEHÍCULO
              ----------------------------------------------------------------- */}
              <Field>
                <FieldLabel>Tipo de vehículo</FieldLabel>

                <Select
                  items={VEHICLE_TYPES}
                  value={form.vehicle_type}
                  onValueChange={(value) =>
                    handleChange("vehicle_type", value ?? "")
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Seleccione..." />
                  </SelectTrigger>

                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Tipo de vehículo</SelectLabel>

                      {VEHICLE_TYPES.map((item) => (
                        <SelectItem key={item.value} value={item.value}>
                          {item.label}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </Field>

              {/* ----------------------------------------------------------------
                  COMBUSTIBLE
              ----------------------------------------------------------------- */}
              <MultiSelectField
                label="Combustible"
                placeholder="Seleccione combustibles..."
                options={FUEL_OPTIONS}
                value={form.fuels}
                onChange={(value) =>
                  setForm((previous) => ({
                    ...previous,
                    fuels: value,
                  }))
                }
              />

              {/* ----------------------------------------------------------------
                  CLASE DE VEHÍCULO
              ----------------------------------------------------------------- */}
              <MultiSelectField
                label="Clase de vehículo"
                placeholder="Seleccione clases..."
                options={CLASE_OPTIONS}
                value={form.classes}
                onChange={(value) =>
                  setForm((previous) => ({
                    ...previous,
                    classes: value,
                  }))
                }
              />

              {/* ----------------------------------------------------------------
                  TIPO DE SERVICIO APLICABLE
              ----------------------------------------------------------------- */}
              <div>
                <MultiSelectField
                  label="Tipo de servicio aplicable"
                  placeholder="Seleccione los tipos de servicio..."
                  options={RATE_SERVICE_TYPES}
                  value={form.service_types}
                  onChange={(value) =>
                    setForm((previous) => ({
                      ...previous,
                      service_types: value,
                    }))
                  }
                  description="Seleccione los tipos de servicio a los que aplicará este rate."
                />
              </div>

              {/* ----------------------------------------------------------------
                  PRECIO BASE
              ----------------------------------------------------------------- */}
              <Field>
                <FieldLabel htmlFor="base_price_rtm">Precio base</FieldLabel>

                <Input
                  id="base_price_rtm"
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.base_price_rtm}
                  onChange={(event) =>
                    handleChange("base_price_rtm", event.target.value)
                  }
                  placeholder="0"
                />
              </Field>

              {/* ----------------------------------------------------------------
                  IVA
              ----------------------------------------------------------------- */}
              <Field>
                <FieldLabel htmlFor="iva_percentage">IVA (%)</FieldLabel>

                <Input
                  id="iva_percentage"
                  type="number"
                  min="0"
                  max="100"
                  step="0.01"
                  value={form.iva_percentage}
                  onChange={(event) =>
                    handleChange("iva_percentage", event.target.value)
                  }
                  placeholder="0"
                />
              </Field>
            </div>
            <FeesTable
              fees={form.fees}
              onFeesChange={(fees) => {
                setForm((prev) => ({
                  ...prev,
                  fees,
                }));
              }}
            />

            {/* ------------------------------------------------------------------
                FOOTER
            ------------------------------------------------------------------- */}
            <DialogFooter className="flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <Button
                type="button"
                variant="outline"
                className="w-full sm:w-auto"
                onClick={() => setIsOpen(false)}
              >
                Cancelar
              </Button>

              <Button type="submit" className="w-full sm:w-auto">
                Registrar
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ----------------------------------------------------------------------
          ERROR
      ----------------------------------------------------------------------- */}
      <GenericErrorDialog
        isOpen={isErrorOpen}
        setIsOpen={setIsErrorOpen}
        headerText="Error al crear rate"
        descriptionText="No fue posible crear el rate."
        errors={errors}
      />

      {/* ----------------------------------------------------------------------
          SUCCESS
      ----------------------------------------------------------------------- */}
      <GenericSuccessDialog
        isOpen={isSuccessOpen}
        setIsOpen={setIsSuccessOpen}
        headerText="Rate creado"
        descriptionText="El rate fue creado correctamente."
        messages={successMessages}
      />
    </>
  );
}
