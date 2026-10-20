
"use client";

import { useContext, useState, type FormEvent } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Field, FieldGroup } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { companySchema } from "@/lib/zod-schemas/validaciones-formularios/companySchema ";
import { GenericErrorDialog } from "@/components/feedbackDialogs/GenericErrorDialog";
import { GenericSuccessDialog } from "@/components/feedbackDialogs/GenericSuccessDialog";
import { useCreateCompany } from "@/lib/client-actions/create_tenant_company";
import { PermissionsContext } from "@/contexts/PermissionsLoaderContext";

type CompanyFormState = {
  tenant_id: string;
  nit: string;
  name: string;
  address: string;
  phone: string;
  email: string;
};

export function CreateCompanyDialog() {
  const permissionsContext = useContext(PermissionsContext);

  const tenant_id =
    permissionsContext?.PermissionsContextValue.tenantObject?.id ?? "";

  const createCompany = useCreateCompany();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isErrorOpen, setIsErrorOpen] = useState(false);
  const [isSuccessOpen, setIsSuccessOpen] = useState(false);

  const [errors, setErrors] = useState<string[]>([]);
  const [successMessages, setSuccessMessages] = useState<string[]>([]);

  const [form, setForm] = useState<CompanyFormState>({
    tenant_id,
    nit: "",
    name: "",
    address: "",
    phone: "",
    email: "",
  });

  const handleChange = (
    field: keyof CompanyFormState,
    value: string,
  ) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    // Usar siempre el tenant actual del contexto.
    const result = companySchema.safeParse({
      ...form,
      tenant_id,
    });

    if (!result.success) {
      setErrors(result.error.issues.map((issue) => issue.message));
      setIsErrorOpen(true);
      return;
    }

    try {
      // El RPC devuelve la empresa registrada o actualizada.
      const savedCompany = await createCompany.mutateAsync(
        result.data,
      );

      // Mostrar datos reales devueltos por PostgreSQL.
      setSuccessMessages([
        "La operación se completó correctamente.",
        `ID de empresa: ${savedCompany.id}`,
        `NIT: ${savedCompany.nit}`,
        `Razón social: ${savedCompany.name}`,
        `Tenant: ${savedCompany.tenant_id}`,
      ]);

      // Limpiar el formulario conservando el tenant actual.
      setForm({
        tenant_id,
        nit: "",
        name: "",
        address: "",
        phone: "",
        email: "",
      });

      setErrors([]);

      // Cerrar el formulario y mostrar el éxito.
      setIsFormOpen(false);
      setIsSuccessOpen(true);
    } catch (error: unknown) {
      const errorMessages =
        error instanceof Error
          ? [error.message]
          : [
              "Ocurrió un error inesperado al registrar la empresa.",
            ];

      setErrors(errorMessages);
      setIsErrorOpen(true);
    }
  };

  return (
    <>
      <Dialog
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
      >
        <DialogTrigger
          render={<Button>Agregar empresa</Button>}
        />

        <DialogContent className="sm:max-w-md">
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle>Registrar empresa</DialogTitle>

              <DialogDescription>
                Ingresa los datos de la empresa que deseas
                registrar para este CDA.
              </DialogDescription>
            </DialogHeader>

            <FieldGroup className="py-4">
              <Field>
                <Label htmlFor="company-nit">NIT</Label>
                <Input
                  id="company-nit"
                  name="nit"
                  value={form.nit}
                  onChange={(event) =>
                    handleChange("nit", event.target.value)
                  }
                  placeholder="Ej. 900123456-7"
                  required
                />
              </Field>

              <Field>
                <Label htmlFor="company-name">
                  Razón social
                </Label>
                <Input
                  id="company-name"
                  name="name"
                  value={form.name}
                  onChange={(event) =>
                    handleChange("name", event.target.value)
                  }
                  placeholder="Nombre de la empresa"
                  required
                />
              </Field>

              <Field>
                <Label htmlFor="company-address">
                  Dirección
                </Label>
                <Input
                  id="company-address"
                  name="address"
                  value={form.address}
                  onChange={(event) =>
                    handleChange("address", event.target.value)
                  }
                  placeholder="Dirección de la empresa"
                />
              </Field>

              <Field>
                <Label htmlFor="company-phone">Teléfono</Label>
                <Input
                  id="company-phone"
                  name="phone"
                  type="tel"
                  value={form.phone}
                  onChange={(event) =>
                    handleChange("phone", event.target.value)
                  }
                  placeholder="Teléfono de contacto"
                />
              </Field>

              <Field>
                <Label htmlFor="company-email">
                  Correo electrónico
                </Label>
                <Input
                  id="company-email"
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={(event) =>
                    handleChange("email", event.target.value)
                  }
                  placeholder="correo@empresa.com"
                />
              </Field>
            </FieldGroup>

            <div className="flex justify-end">
              <Button
                type="submit"
                disabled={createCompany.isPending}
              >
                {createCompany.isPending
                  ? "Guardando..."
                  : "Guardar empresa"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <GenericErrorDialog
        isOpen={isErrorOpen}
        setIsOpen={setIsErrorOpen}
        headerText="Error en el formulario"
        descriptionText="Revisa los siguientes campos e inténtalo nuevamente."
        errors={errors}
      />

      <GenericSuccessDialog
        isOpen={isSuccessOpen}
        setIsOpen={setIsSuccessOpen}
        headerText="Operación exitosa"
        descriptionText="La información de la empresa fue procesada correctamente."
        messages={successMessages}
      />
    </>
  );
}
