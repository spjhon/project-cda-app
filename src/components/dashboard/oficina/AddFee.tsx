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

import { createFeeSchema } from "@/lib/zod-schemas/validaciones-formularios/crear-fee-schema";

import { RateFeeFormState } from "./AddRate";

// ==========================================
// TIPO DEL FORMULARIO
// ==========================================

interface FeeFormState {
  tenant_id: string;
  name: string;
  code: string;
  description: string;
  fee_amount: string;
  iva_percentage: string;
  model_year_from: string;
  model_year_to: string;
}

// ==========================================
// PROPS
// ==========================================

interface AddFeeDialogProps {
  onFeeCreated: (fee: RateFeeFormState) => void;
}

// ==========================================
// COMPONENTE
// ==========================================

export default function AddFeeDialog({ onFeeCreated }: AddFeeDialogProps) {
  const contextReceived = useContext(PermissionsContext);

  const tenantId = contextReceived?.PermissionsContextValue?.tenantObject?.id;

  // ==========================================
  // ESTADO INICIAL
  // ==========================================

  const INITIAL_FORM: FeeFormState = {
    tenant_id: tenantId ?? "",
    name: "",
    code: "",
    description: "",
    fee_amount: "",
    iva_percentage: "",
    model_year_from: "",
    model_year_to: "",
  };

  const [form, setForm] = useState<FeeFormState>(INITIAL_FORM);

  // ==========================================
  // ESTADO DEL ERROR
  // ==========================================

  const [isErrorOpen, setIsErrorOpen] = useState(false);

  const [errors, setErrors] = useState<string | string[] | null>(null);

  // ==========================================
  // ACTUALIZAR CAMPO
  // ==========================================

  const handleChange = (field: keyof FeeFormState, value: string | number) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // ==========================================
  // SUBMIT
  // ==========================================

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    // ==========================================
    // PREPARAR DATOS
    // ==========================================

    const data = {
      tenant_id: form.tenant_id,
      name: form.name.trim(),
      code: form.code.trim(),
      description: form.description.trim() || undefined,
      fee_amount: Number(form.fee_amount),
      iva_percentage: Number(form.iva_percentage),
      model_year_from:
        form.model_year_from === "" ? null : Number(form.model_year_from),
      model_year_to:
        form.model_year_to === "" ? null : Number(form.model_year_to),
    };

    // ==========================================
    // VALIDAR CON ZOD
    // ==========================================

    const result = createFeeSchema.safeParse(data);

    // ==========================================
    // DATOS INVÁLIDOS
    // ==========================================

    if (!result.success) {
      const messages = result.error.issues.map((issue) => issue.message);

      setErrors(messages);
      setIsErrorOpen(true);

      return;
    }

    // ==========================================
    // CREAR FEE LOCAL
    // ==========================================

    const newFee: RateFeeFormState = {
      name: result.data.name,

      description: result.data.description ?? "",
      fee_amount: String(result.data.fee_amount),
      iva_percentage: String(result.data.iva_percentage),
      model_year_from:
        result.data.model_year_from === null
          ? ""
          : String(result.data.model_year_from),
      model_year_to:
        result.data.model_year_to === null
          ? ""
          : String(result.data.model_year_to),
    };

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
              <DialogTitle>Agregar fee</DialogTitle>

              <DialogDescription>
                Agrega un fee al rate actual. El fee se mantendrá en el
                formulario hasta que se registre el rate.
              </DialogDescription>
            </DialogHeader>

            {/* ========================================
                CAMPOS
                ======================================== */}

            <FieldGroup className="mt-6">
              {/* ========================================
                  NOMBRE + CÓDIGO
                  ======================================== */}

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field>
                  <Label htmlFor="fee-name">Nombre</Label>

                  <Input
                    id="fee-name"
                    name="name"
                    value={form.name}
                    onChange={(event) =>
                      handleChange("name", event.target.value)
                    }
                    placeholder="Ej. Tarifa ambiental"
                    required
                  />
                </Field>
              </div>

              {/* ========================================
                  DESCRIPCIÓN
                  ======================================== */}

              <Field>
                <Label htmlFor="fee-description">Descripción</Label>

                <Textarea
                  id="fee-description"
                  name="description"
                  value={form.description}
                  onChange={(event) =>
                    handleChange("description", event.target.value)
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
                  <Label htmlFor="fee-amount">Valor del fee</Label>

                  <Input
                    id="fee-amount"
                    name="fee_amount"
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.fee_amount}
                    onChange={(event) =>
                      handleChange("fee_amount", event.target.value)
                    }
                    placeholder="0"
                    required
                  />
                </Field>

                <Field>
                  <Label htmlFor="fee-iva">IVA (%)</Label>

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
                      handleChange("iva_percentage", event.target.value)
                    }
                  />

                  <p className="text-xs text-muted-foreground">
                    Déjalo vacío si el fee no tiene IVA.
                  </p>
                </Field>
              </div>

              {/* ========================================
                  RANGO DE AÑOS
                  ======================================== */}

              <div className="space-y-3">
                <div>
                  <Label>Rango de años del vehículo</Label>

                  <p className="text-xs text-muted-foreground mt-1">
                    Déjalo vacío si el fee aplica para cualquier año.
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <Field>
                    <Label htmlFor="model-year-from">Desde</Label>

                    <Input
                      id="model-year-from"
                      name="model_year_from"
                      type="number"
                      min="1900"
                      value={form.model_year_from}
                      onChange={(event) =>
                        handleChange("model_year_from", event.target.value)
                      }
                      placeholder="Ej. 2010"
                    />
                  </Field>

                  <Field>
                    <Label htmlFor="model-year-to">Hasta</Label>

                    <Input
                      id="model-year-to"
                      name="model_year_to"
                      type="number"
                      min="1900"
                      value={form.model_year_to}
                      onChange={(event) =>
                        handleChange("model_year_to", event.target.value)
                      }
                      placeholder="Ej. 2026"
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
                  <Button type="button" variant="outline" onClick={resetForm}>
                    Cancelar
                  </Button>
                }
              />

              <Button type="submit">Agregar fee</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
