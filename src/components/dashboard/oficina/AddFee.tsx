
"use client"

import {  useContext, useState } from "react"

import { Button } from "@/components/ui/button"

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

import { Field, FieldGroup } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

import { Plus } from "lucide-react"
import { useOficina } from "@/contexts/OficinaLoaderContext"
import { GenericErrorDialog } from "@/components/feedbackDialogs/GenericErrorDialog"
import { GenericSuccessDialog } from "@/components/feedbackDialogs/GenericSuccessDialog"
import { PermissionsContext } from "@/contexts/PermissionsLoaderContext"
import { createFeeSchema } from "@/lib/zod-schemas/validaciones-formularios/crear-fee-schema"



// ==========================================
// TIPO DEL FORMULARIO
// ==========================================

interface FeeFormState {
  tenant_id: string
  name: string
  code: string
  description: string
  fee_amount: string
  iva_percentage: number
  model_year_from: string
  model_year_to: string
  is_active: false
}



// ==========================================
// COMPONENTE
// ==========================================

export default function AddFeeDialog() {

const contextRecived = useContext(PermissionsContext);

const tenantId = contextRecived?.PermissionsContextValue.tenantObject?.id

const { createFeeMutation } = useOficina()
  // ==========================================
// ESTADO INICIAL
// ==========================================

const INITIAL_FORM: FeeFormState = {
  tenant_id: tenantId ?? "",
  name: "",
  code: "",
  description: "",
  fee_amount: "",
  iva_percentage: 0,
  model_year_from: "",
  model_year_to: "",
  is_active: false,
}

 


  const [form, setForm] = useState<FeeFormState>(INITIAL_FORM)

  const [isSuccessOpen, setIsSuccessOpen] = useState(false)
const [successMessages, setSuccessMessages] = useState<string | string[] | null>(null)
  const [isErrorOpen, setIsErrorOpen] = useState(false)
const [errors, setErrors] = useState<string | string[] | null>(null)

  

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
    }))
  }














// ==========================================
// SUBMIT
// ==========================================
const handleSubmit = (
  event: React.FormEvent<HTMLFormElement>
) => {



  event.preventDefault()


   // ==========================================
  // PREPARAR DATOS
  // ==========================================

  const data = {
    tenant_id: form.tenant_id,

    name: form.name.trim(),

    code: form.code.trim(),

    description: form.description.trim() || undefined,

    fee_amount: Number(form.fee_amount),

    // IVA: si está vacío/inicializado en 0, se envía 0
    iva_percentage: form.iva_percentage,

    // Los años vacíos se envían como null
    model_year_from:
      form.model_year_from === ""
        ? null
        : Number(form.model_year_from),

    model_year_to:
      form.model_year_to === ""
        ? null
        : Number(form.model_year_to),

    is_active: form.is_active,
  }


  // ==========================================
  // VALIDAR CON ZOD
  // ==========================================

  const result = createFeeSchema.safeParse(data)


  // ==========================================
  // DATOS INVÁLIDOS
  // ==========================================

  if (!result.success) {
    const messages = result.error.issues.map(
      (issue) => issue.message
    )

    setErrors(messages)
    setIsErrorOpen(true)

    return
  }

   // ==========================================
  // DATOS VÁLIDOS → INSERTAR
  // ==========================================

  createFeeMutation.mutate(result.data, {
    onSuccess: () => {
      setSuccessMessages("Fee creado correctamente")
      setIsSuccessOpen(true)

      console.log("Fee creado correctamente")
    },



    onError: (error) => {
      setErrors(error.message)
      setIsErrorOpen(true)
    }


  }

)


}




  // ==========================================
  // RESET DEL FORMULARIO
  // ==========================================

  const resetForm = () => {
    setForm(INITIAL_FORM)
  }




  // ==========================================
  // RENDER
  // ==========================================

  return (
    <>
    <GenericSuccessDialog
  isOpen={isSuccessOpen}
  setIsOpen={setIsSuccessOpen}
  headerText="Operación exitosa"
  descriptionText="El fee fue creado correctamente."
  messages={successMessages}
/>
    <GenericErrorDialog
  isOpen={isErrorOpen}
  setIsOpen={setIsErrorOpen}
  headerText="Error al crear el fee"
  descriptionText="No fue posible crear el fee. Revisa la información e inténtalo nuevamente."
  errors={errors}
/>
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
          CONTENIDO DEL DIALOG
          ========================================== */}

      <DialogContent className="sm:max-w-2xl">

        <form onSubmit={handleSubmit}>

          <DialogHeader>
            <DialogTitle>
              Agregar fee
            </DialogTitle>

            <DialogDescription>
              Crea un nuevo tipo de fee para el catálogo
              de tu CDA. El fee se creará inicialmente
              como inactivo.
            </DialogDescription>
          </DialogHeader>

          {/* ==========================================
              CAMPOS DEL FORMULARIO
              ========================================== */}

          <FieldGroup className="mt-6">

            {/* ========================================
                NOMBRE + CÓDIGO
                ======================================== */}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

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
                  placeholder="Ej. Tarifa ambiental"
                  required
                />
              </Field>

              <Field>
                <Label htmlFor="fee-code">
                  Código
                </Label>

                <Input
                  id="fee-code"
                  name="code"
                  value={form.code}
                  onChange={(event) =>
                    handleChange(
                      "code",
                      event.target.value
                    )
                  }
                  placeholder="Ej. AMB"
                  required
                />
              </Field>

            </div>

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
                VALOR DEL FEE + IVA
                ======================================== */}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

              {/* ========================================
                  VALOR DEL FEE
                  ======================================== */}

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

              {/* ========================================
                  IVA
                  ======================================== */}

              <Field>
                <Label htmlFor="fee-iva">
                  IVA (%)
                </Label>

                <Input
                  id="fee-iva"
                  name="iva"
                  type="number"
                  min="-10"
                  max="100"
                  step="0.01"
                  value={form.iva_percentage}
                  onChange={(event) =>
                    handleChange(
                      "iva_percentage",
                      Number(event.target.value)
                    )
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
                <Label>
                  Rango de años del vehículo
                </Label>

                <p className="text-xs text-muted-foreground mt-1">
                  Déjalo vacío si el fee aplica para
                  cualquier año.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                <Field>
                  <Label htmlFor="model-year-from">
                    Desde
                  </Label>

                  <Input
                    id="model-year-from"
                    name="model_year_from"
                    type="number"
                    min="1900"
                    value={form.model_year_from}
                    onChange={(event) =>
                      handleChange(
                        "model_year_from",
                        event.target.value
                      )
                    }
                    placeholder="Ej. 2010"
                  />
                </Field>

                <Field>
                  <Label htmlFor="model-year-to">
                    Hasta
                  </Label>

                  <Input
                    id="model-year-to"
                    name="model_year_to"
                    type="number"
                    min="1900"
                    value={form.model_year_to}
                    onChange={(event) =>
                      handleChange(
                        "model_year_to",
                        event.target.value
                      )
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
              Crear fee
            </Button>

          </DialogFooter>

        </form>

      </DialogContent>

    </Dialog>
    </>
    
  )
}
