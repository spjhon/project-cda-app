
"use client";

import { useContext, useState } from "react";

import { Button } from "@/components/ui/button";

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import { Field, FieldGroup } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

import { Plus } from "lucide-react";

import { PermissionsContext } from "@/contexts/PermissionsLoaderContext";

import { GenericErrorDialog } from "@/components/feedbackDialogs/GenericErrorDialog";
import { GenericSuccessDialog } from "@/components/feedbackDialogs/GenericSuccessDialog";

import {
  CreateFeeInput,
  createFeeSchema,
} from "@/lib/zod-schemas/validaciones-formularios/crear-fee-schema";

// ==========================================
// TIPO DEL FORMULARIO
// ==========================================

interface FeeFormState {
  tenant_id: string;
  name: string;
  description: string;
  fee_amount: string;
  iva_percentage: string;
  vehicle_age_from: string;
  vehicle_age_to: string;
}

// ==========================================
// PROPS
// ==========================================

interface AddFeeDialogProps {
  onFeeCreated: (fee: CreateFeeInput) => void;
}

// ==========================================
// COMPONENTE
// ==========================================

export default function AddFeeDialog({
  onFeeCreated,
}: AddFeeDialogProps) {
  const contextReceived = useContext(PermissionsContext);

  const tenantId =
    contextReceived?.PermissionsContextValue?.tenantObject?.id;

  // ==========================================
  // ESTADO INICIAL
  // ==========================================

  const INITIAL_FORM: FeeFormState = {
    tenant_id: tenantId ?? "",
    name: "",
    description: "",
    fee_amount: "",
    iva_percentage: "",
    vehicle_age_from: "",
    vehicle_age_to: "",
  };

  const [form, setForm] =
    useState<FeeFormState>(INITIAL_FORM);

  // ==========================================
  // ESTADO DEL ERROR
  // ==========================================

  const [isErrorOpen, setIsErrorOpen] = useState(false);
  const [errors, setErrors] =
    useState<string | string[] | null>(null);

  // ==========================================
  // ESTADO DEL ÉXITO
  // ==========================================

  const [isSuccessOpen, setIsSuccessOpen] = useState(false);
  const [successMessages, setSuccessMessages] =
    useState<string | null>(null);

  // ==========================================
  // ACTUALIZAR CAMPO
  // ==========================================

  const handleChange = (
    field: keyof FeeFormState,
    value: string | number
  ) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // ==========================================
  // SUBMIT
  // ==========================================

  const handleSubmit = (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();
    event.stopPropagation();

    // ==========================================
    // PREPARAR DATOS
    // ==========================================

    const data = {
      tenant_id: form.tenant_id,
      name: form.name.trim(),
      description: form.description.trim() || undefined,

      fee_amount:
        form.fee_amount === ""
          ? null
          : Number(form.fee_amount),

      iva_percentage:
        (form.iva_percentage === "" || form.iva_percentage === "0")
          ? null
          : Number(form.iva_percentage),

      vehicle_age_from:
        form.vehicle_age_from === ""
          ? null
          : Number(form.vehicle_age_from),

      vehicle_age_to:
        form.vehicle_age_to === ""
          ? null
          : Number(form.vehicle_age_to),
    };

    // ==========================================
    // VALIDAR CON ZOD
    // ==========================================

    const result = createFeeSchema.safeParse(data);

    // ==========================================
    // DATOS INVÁLIDOS
    // ==========================================

    if (!result.success) {
      const messages = result.error.issues.map(
        (issue) => issue.message
      );

      setErrors(messages);
      setIsErrorOpen(true);

      return;
    }

    // ==========================================
    // CREAR FEE LOCAL
    // ==========================================

    const newFee: CreateFeeInput = {
      tenant_id: result.data.tenant_id,
      name: result.data.name,
      description: result.data.description ?? "",
      fee_amount: result.data.fee_amount,
      iva_percentage: result.data.iva_percentage,

      vehicle_age_from:
        result.data.vehicle_age_from ?? null,

      vehicle_age_to:
        result.data.vehicle_age_to ?? null,
    };

    // ==========================================
    // MENSAJE DE ÉXITO
    // ==========================================

    setSuccessMessages(
      "El fee fue agregado correctamente."
    );

    setIsSuccessOpen(true);

    // ==========================================
    // SINCRONIZAR CON EL STATE DEL PADRE
    // ==========================================

    onFeeCreated(newFee);

    // ==========================================
    // LIMPIAR FORMULARIO
    // ==========================================

    resetForm();
  };

  // ==========================================
  // RESET DEL FORMULARIO
  // ==========================================

  const resetForm = () => {
    setForm({
      ...INITIAL_FORM,
      tenant_id: tenantId ?? "",
    });
  };

  // ==========================================
  // RENDER
  // ==========================================

  return (
    <>
      {/* ==========================================
          ERROR
          ========================================== */}

      <GenericErrorDialog
        isOpen={isErrorOpen}
        setIsOpen={setIsErrorOpen}
        headerText="Error al crear el fee"
        descriptionText="No fue posible agregar el fee. Revisa la información e inténtalo nuevamente."
        errors={errors}
      />

      {/* ==========================================
          SUCCESS
          ========================================== */}

      <GenericSuccessDialog
        isOpen={isSuccessOpen}
        setIsOpen={setIsSuccessOpen}
        headerText="Fee Creado"
        descriptionText="El fee fue creado correctamente."
        messages={successMessages}
      />

      {/* ==========================================
          DIALOG
          ========================================== */}

      <Dialog>
        {/* ==========================================
            TRIGGER
            ========================================== */}

        <DialogTrigger
          render={
            <Button type="button">
              <Plus className="h-4 w-4 mr-2" />
              Agregar fee
            </Button>
          }
        />

        {/* ==========================================
            CONTENIDO
            ========================================== */}

        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle>
                Agregar fee
              </DialogTitle>

              <DialogDescription>
                Agrega un fee al rate actual. El fee se
                mantendrá en el formulario hasta que se
                registre el rate.
              </DialogDescription>
            </DialogHeader>

            {/* ========================================
                CAMPOS
                ======================================== */}

            <FieldGroup className="mt-6">

              {/* ========================================
                  NOMBRE
                  ======================================== */}

              <Field>
                <Label htmlFor="fee-name">
                  Nombre
                </Label>

                <Input
                  id="fee-name"
                  name="name"
                  value={form.name}
                  onChange={(event) =>
                    handleChange(
                      "name",
                      event.target.value
                    )
                  }
                  placeholder="Ej. SICOV"
                  required
                />
              </Field>

              {/* ========================================
                  DESCRIPCIÓN
                  ======================================== */}

              <Field>
                <Label htmlFor="fee-description">
                  Descripción
                </Label>

                <Textarea
                  id="fee-description"
                  name="description"
                  value={form.description}
                  onChange={(event) =>
                    handleChange(
                      "description",
                      event.target.value
                    )
                  }
                  placeholder="Describe el fee..."
                  rows={3}
                />
              </Field>

              {/* ========================================
                  VALOR + IVA
                  ======================================== */}

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field>
                  <Label htmlFor="fee-amount">
                    Valor del fee
                  </Label>

                  <Input
                    id="fee-amount"
                    name="fee_amount"
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.fee_amount}
                    onChange={(event) =>
                      handleChange(
                        "fee_amount",
                        event.target.value
                      )
                    }
                    placeholder="0"
                    required
                  />
                </Field>

                <Field>
                  <Label htmlFor="fee-iva">
                    IVA (%)
                  </Label>

                  <Input
                    id="fee-iva"
                    name="iva"
                    type="number"
                    min="0"
                    max="100"
                    step="0.1"
                    value={form.iva_percentage}
                    placeholder="0"
                    onChange={(event) =>
                      handleChange(
                        "iva_percentage",
                        event.target.value
                      )
                    }
                  />

                  <p className="text-xs text-muted-foreground">
                    Déjalo vacío si el fee no tiene IVA.
                  </p>
                </Field>
              </div>

              {/* ========================================
                  RANGO DE EDAD DEL VEHÍCULO
                  ======================================== */}

              <div className="space-y-3">
                <div>
                  <Label>
                    Rango de edad del vehículo
                  </Label>

                  <p className="text-xs text-muted-foreground mt-1">
                    Indica la antigüedad del vehículo en años.
                    Déjalo vacío si el fee aplica para cualquier
                    antigüedad.
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

                  {/* ========================================
                      EDAD DESDE
                      ======================================== */}

                  <Field>
                    <Label htmlFor="vehicle-age-from">
                      Desde
                    </Label>

                    <Input
                      id="vehicle-age-from"
                      name="vehicle_age_from"
                      type="number"
                      min="0"
                      step="1"
                      value={form.vehicle_age_from}
                      onChange={(event) =>
                        handleChange(
                          "vehicle_age_from",
                          event.target.value
                        )
                      }
                      placeholder="Ej. 0"
                    />
                  </Field>

                  {/* ========================================
                      EDAD HASTA
                      ======================================== */}

                  <Field>
                    <Label htmlFor="vehicle-age-to">
                      Hasta
                    </Label>

                    <Input
                      id="vehicle-age-to"
                      name="vehicle_age_to"
                      type="number"
                      min="0"
                      step="1"
                      value={form.vehicle_age_to}
                      onChange={(event) =>
                        handleChange(
                          "vehicle_age_to",
                          event.target.value
                        )
                      }
                      placeholder="Ej. 2"
                    />
                  </Field>

                </div>
              </div>

            </FieldGroup>

            {/* ==========================================
                FOOTER
                ========================================== */}

            <DialogFooter className="mt-6">

              <DialogClose
                render={
                  <Button
                    type="button"
                    variant="outline"
                    onClick={resetForm}
                  >
                    Cancelar
                  </Button>
                }
              />

              <Button type="submit">
                Agregar fee
              </Button>

            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
