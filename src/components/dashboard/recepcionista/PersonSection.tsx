import React from "react";
import { User, UserCheck } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

import { ZodFullFormDataType } from "@/lib/zod-schemas/order-schema";
import { SearchPersonDialog } from "./SearchPersonDialog";

// Opciones de identificación según tu lista
export const ID_DOCUMENT_OPTIONS = [
  { label: "Cédula de Ciudadanía", value: "cedula_ciudadania" },
  { label: "NIT", value: "nit" },
  { label: "Pasaporte", value: "pasaporte" },
  { label: "Cédula de Extranjería", value: "cedula_extranjeria" },
  { label: "Tarjeta de Identidad", value: "tarjeta_identidad" },
  { label: "Registro Civil", value: "registro_civil" },
  { label: "Carnet Diplomático", value: "carnet_diplomatico" },
  { label: "N.N.", value: "nn" },
  { label: "TI2", value: "ti2" },
];

interface PersonSectionProps {
  formData: ZodFullFormDataType;
  setFormData: React.Dispatch<React.SetStateAction<ZodFullFormDataType>>;
  selectedTemplate: boolean;
  hayPlaca: boolean;
}

export const PersonSection = ({ formData, setFormData, selectedTemplate, hayPlaca }: PersonSectionProps) => {

  // Manejador para el Cliente (con lógica de espejo manual)
  const handleCustomerChange = (field: string, value: string) => {
    const formattedValue = field === "nombre_completo" ? value.toUpperCase() : value;

    setFormData((prev: ZodFullFormDataType) => {
      const newCustomerData = {
        ...prev.customer_data,
        [field]: formattedValue,
      };

      return {
        ...prev,
        customer_data: newCustomerData,
        owner_data: prev.is_owner_same_as_customer
          ? { ...prev.owner_data, [field]: formattedValue }
          : prev.owner_data,
      };
    });
  };

  // Manejador para el Dueño
  const handleOwnerChange = (field: string, value: string) => {
    const formattedValue = field === "nombre_completo" ? value.toUpperCase() : value;

    setFormData((prev: ZodFullFormDataType) => ({
      ...prev,
      owner_data: { ...prev.owner_data, [field]: formattedValue },
    }));
  };

  // Manejador del Checkbox (Click en toda el área)
  const toggleSameOwner = () => {
    setFormData((prev: ZodFullFormDataType) => {
      const newState = !prev.is_owner_same_as_customer;
      
      return {
        ...prev,
        is_owner_same_as_customer: newState,
        // Si newState es true, clona el cliente. 
        // Si es false, vacía los campos del propietario.
        owner_data: newState 
          ? { ...prev.customer_data } 
          : {
              id: null,
              tipo_documento: "cedula_ciudadania",
              numero_documento: "",
              nombre_completo: "",
              telefono: "",
              correo: "",
              direccion: "",
            },
      };
    });
  };

  return (
    <fieldset
      className={`mt-2 transition-all duration-500 ${selectedTemplate && hayPlaca ? "opacity-100" : "opacity-40 pointer-events-none translate-y-4"}`}
    >
      <div className="border-t border-border pt-8">
        <legend className="text-xs font-bold uppercase text-muted-foreground tracking-widest my-5">
          3. Identificación de Personas
        </legend>

        {/* BOTÓN / CHECKBOX GRANDE CLICKABLE EN CUALQUIER LADO */}
        <div
          onClick={toggleSameOwner}
          className={`flex max-w-100 items-center gap-3 px-5 py-2.5 rounded-xl border-2 cursor-pointer transition-all active:scale-95 select-none my-10 ${
            formData.is_owner_same_as_customer
              ? "bg-primary border-primary text-primary-foreground shadow-xs"
              : "bg-background border-border text-muted-foreground hover:border-muted-foreground/40"
          }`}
        >
          <Checkbox
            checked={formData.is_owner_same_as_customer}
            onCheckedChange={toggleSameOwner}
            className={`h-5 w-5 ${
              formData.is_owner_same_as_customer 
                ? "border-background data-[state=checked]:bg-background data-[state=checked]:text-primary" 
                : "border-input"
            }`}
          />
          <span className="text-[11px] font-black uppercase tracking-tighter">
            ¿Es el cliente tambien el propietario del vehiculo?
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* --- BLOQUE CLIENTE (PRESENTANTE) --- */}
          <div className="space-y-6">
            <div className="flex items-center gap-2 px-1">
              <User className="h-5 w-5 text-primary" />
              <span className="text-[12px] font-black text-foreground uppercase tracking-tight">
                Datos del Cliente{" "}
                <span className="text-muted-foreground/60 font-medium">
                  (Presentante)
                </span>
              </span>
            </div>
            <div className="bg-background border border-border rounded-2xl p-6 space-y-5 shadow-xs">

              <div className="flex gap-2">
                {/* DISPLAY DOCUMENTO */}
                <div className="flex-1 h-11 rounded-md border border-border bg-muted/40 px-4 flex items-center overflow-hidden">
                  <div className="flex flex-col leading-tight overflow-hidden">
                    <span className="text-[10px] uppercase font-bold text-muted-foreground truncate">
                      {ID_DOCUMENT_OPTIONS.find(
                        (d) => d.value === formData.customer_data.tipo_documento
                      )?.label || "Tipo documento"}
                    </span>

                    <span className="text-sm font-semibold text-foreground truncate">
                      {formData.customer_data.numero_documento || "Sin documento"}
                    </span>
                  </div>
                </div>

                {/* BOTÓN */}
                <div className="flex-1">
                  <SearchPersonDialog
                    currentDocumentType={formData.customer_data.tipo_documento}
                    currentDocumentNumber={formData.customer_data.numero_documento}
                    onUpdate={(data) => {
                      setFormData((prev) => {
                        const updatedCustomerData = {
                          ...prev.customer_data,
                          tipo_documento: data.tipo_documento,
                          numero_documento: data.numero_documento,
                          ...(data.foundData ?? {}),
                        };

                        if (prev.is_owner_same_as_customer) {
                          return {
                            ...prev,
                            customer_data: updatedCustomerData,
                            owner_data: {
                              ...prev.owner_data,
                              tipo_documento: data.tipo_documento,
                              numero_documento: data.numero_documento,
                              ...(data.foundData ?? {}),
                            },
                          };
                        }

                        return {
                          ...prev,
                          customer_data: updatedCustomerData,
                        };
                      });
                    }}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-[11px] font-bold text-muted-foreground uppercase">
                  Nombre Completo / Razón Social
                </Label>
                <Input
                  required
                  className="h-11 bg-background"
                  placeholder="NOMBRE COMPLETO DEL CLIENTE"
                  value={formData.customer_data.nombre_completo}
                  onChange={(e) =>
                    handleCustomerChange("nombre_completo", e.target.value)
                  }
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-[11px] font-bold text-muted-foreground uppercase">
                    Teléfono de contacto
                  </Label>
                  <Input
                    required
                    className="h-11 bg-background"
                    placeholder="Ej: 3101234567"
                    value={formData.customer_data.telefono}
                    onChange={(e) =>
                      handleCustomerChange("telefono", e.target.value)
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-[11px] font-bold text-muted-foreground uppercase">
                    Correo Electrónico
                  </Label>
                  <Input
                    required
                    className="h-11 bg-background"
                    type="email"
                    placeholder="ejemplo@correo.com"
                    value={formData.customer_data.correo}
                    onChange={(e) =>
                      handleCustomerChange("correo", e.target.value)
                    }
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-[11px] font-bold text-muted-foreground uppercase">
                  Dirección de Residencia
                </Label>
                <Input
                  required
                  className="h-11 bg-background"
                  placeholder="Ej: Calle 10 # 20-30"
                  value={formData.customer_data.direccion}
                  onChange={(e) =>
                    handleCustomerChange("direccion", e.target.value)
                  }
                />
              </div>
            </div>
          </div>

          {/* --- BLOQUE PROPIETARIO (TARJETA) --- */}
          <div className="space-y-6">
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-2">
                <UserCheck className="h-5 w-5 text-emerald-600" />
                <span className="text-[12px] font-black text-foreground uppercase tracking-tight">
                  Propietario{" "}
                  <span className="text-muted-foreground/60 font-medium">
                    (Tarjeta de Propiedad)
                  </span>
                </span>
              </div>
            </div>

            <div
              className={`transition-all duration-500 ${formData.is_owner_same_as_customer ? "opacity-40 grayscale pointer-events-none" : "opacity-100"}`}
            >
              <div
                className={`bg-background border-2 rounded-2xl p-6 space-y-5 shadow-xs transition-all ${
                  formData.is_owner_same_as_customer 
                    ? "border-muted/40" 
                    : "border-emerald-500/20 bg-emerald-500/5"
                }`}
              >
                <div className="space-y-2">
                  <Label className="text-[11px] font-bold text-muted-foreground uppercase">
                    Documento Propietario
                  </Label>

                  <div className="flex gap-2">
                    {/* DISPLAY */}
                    <div
                      className={`flex-1 h-11 rounded-md border px-4 flex items-center overflow-hidden transition-all ${
                        formData.is_owner_same_as_customer
                          ? "bg-muted border-transparent opacity-60"
                          : "bg-background border-border"
                      }`}
                    >
                      <div className="flex flex-col leading-tight overflow-hidden">
                        <span className="text-[10px] uppercase font-bold text-muted-foreground truncate">
                          {ID_DOCUMENT_OPTIONS.find(
                            (d) => d.value === formData.owner_data.tipo_documento
                          )?.label || "Tipo documento"}
                        </span>

                        <span className="text-sm font-semibold text-foreground truncate">
                          {formData.owner_data.numero_documento || "Sin documento"}
                        </span>
                      </div>
                    </div>

                    {/* BOTÓN / DIALOG */}
                    <div className="flex-1">
                      <SearchPersonDialog
                        disabled={formData.is_owner_same_as_customer}
                        currentDocumentType={formData.owner_data.tipo_documento}
                        currentDocumentNumber={formData.owner_data.numero_documento}
                        onUpdate={(data) => {
                          setFormData((prev) => ({
                            ...prev,
                            owner_data: {
                              ...prev.owner_data,
                              tipo_documento: data.tipo_documento,
                              numero_documento: data.numero_documento,
                              ...(data.foundData ?? {}),
                            },
                          }));
                        }}
                      />
                    </div>
                  </div>

                  {/* MENSAJE CUANDO ESTÁ SINCRONIZADO */}
                  {formData.is_owner_same_as_customer && (
                    <p className="text-[11px] text-muted-foreground font-medium px-1">
                      El propietario utiliza automáticamente la información del cliente.
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label className="text-[11px] font-bold text-muted-foreground uppercase">
                    Nombre del Propietario
                  </Label>
                  <Input
                    required
                    disabled={formData.is_owner_same_as_customer}
                    className="h-11 bg-background"
                    placeholder="SEGÚN TARJETA DE PROPIEDAD"
                    value={formData.owner_data.nombre_completo}
                    onChange={(e) =>
                      handleOwnerChange("nombre_completo", e.target.value)
                    }
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-[11px] font-bold text-muted-foreground uppercase">
                      Teléfono Propietario
                    </Label>
                    <Input
                      disabled={formData.is_owner_same_as_customer}
                      className="h-11 bg-background"
                      placeholder="Ej: 3101234567"
                      value={formData.owner_data.telefono}
                      onChange={(e) =>
                        handleOwnerChange("telefono", e.target.value)
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[11px] font-bold text-muted-foreground uppercase">
                      Correo Propietario
                    </Label>
                    <Input
                      disabled={formData.is_owner_same_as_customer}
                      className="h-11 bg-background"
                      placeholder="ejemplo@correo.com"
                      value={formData.owner_data.correo}
                      onChange={(e) =>
                        handleOwnerChange("correo", e.target.value)
                      }
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-[11px] font-bold text-muted-foreground uppercase">
                    Dirección Propietario
                  </Label>
                  <Input
                    disabled={formData.is_owner_same_as_customer}
                    className="h-11 bg-background"
                    placeholder="Ej: Calle 10 # 20-30"
                    value={formData.owner_data.direccion}
                    onChange={(e) =>
                      handleOwnerChange("direccion", e.target.value)
                    }
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </fieldset>
  );
};