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



export const PersonSection = ({formData, setFormData, selectedTemplate, hayPlaca}: PersonSectionProps) => {







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
    const formattedValue =
      field === "nombre_completo" ? value.toUpperCase() : value;
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
        owner_data: newState ? { ...prev.customer_data } : prev.owner_data,
      };
    });
  };




  


  return (
    <fieldset
      className={`mt-2 transition-all duration-500 ${selectedTemplate && hayPlaca ? "opacity-100" : "opacity-40 pointer-events-none translate-y-4"}`}
    >
      <div className="border-t border-slate-200 pt-8">
        <legend className="text-xs font-bold uppercase text-slate-400 tracking-widest my-5">
          3. Identificación de Personas
        </legend>

        {/* BOTÓN / CHECKBOX GRANDE CLICKABLE EN CUALQUIER LADO */}
        <div
          onClick={toggleSameOwner}
          className={`flex items-center gap-3 px-5 py-2.5 rounded-xl border-2 cursor-pointer transition-all active:scale-95 select-none w-100 my-10 ${
            formData.is_owner_same_as_customer
              ? "bg-blue-600 border-blue-700 text-white shadow-lg shadow-blue-200"
              : "bg-white border-slate-200 text-slate-600 hover:border-blue-300"
          }`}
        >
          <Checkbox
            checked={formData.is_owner_same_as_customer}
            onCheckedChange={toggleSameOwner} // Soporta click directo al check también
            className="border-white data-[state=checked]:bg-white data-[state=checked]:text-blue-600 h-5 w-5"
          />
          <span className="text-[11px] font-black uppercase tracking-tighter">
            ¿Es el cliente tambien el propietario del vehiculo?
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* --- BLOQUE CLIENTE (PRESENTANTE) --- */}
          <div className="space-y-6">
            <div className="flex items-center gap-2 px-1">
              <User className="h-5 w-5 text-blue-600" />
              <span className="text-[12px] font-black text-slate-700 uppercase tracking-tight">
                Datos del Cliente{" "}
                <span className="text-slate-400 font-medium">
                  (Presentante)
                </span>
              </span>
            </div>
            <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-5 shadow-sm">








              <div className="flex gap-2">
                {/* DISPLAY DOCUMENTO */}
                <div className="flex-1 h-11 rounded-md border border-slate-200 bg-slate-50 px-4 flex items-center overflow-hidden">
                  <div className="flex flex-col leading-tight overflow-hidden">
                    <span className="text-[10px] uppercase font-bold text-slate-400 truncate">
                      {ID_DOCUMENT_OPTIONS.find(
                        (d) =>
                          d.value === formData.customer_data.tipo_documento,
                      )?.label || "Tipo documento"}
                    </span>

                    <span className="text-sm font-semibold text-slate-700 truncate">
                      {formData.customer_data.numero_documento ||
                        "Sin documento"}
                    </span>
                  </div>
                </div>

                {/* BOTÓN */}
                <div className="flex-1">

                  {/**Cuando pasas una arrow function, el hijo recibe una función nueva que tú controlas, y esa función puede hacer lógica extra antes de llamar al setter real. */}
                  <SearchPersonDialog
                    currentDocumentType={formData.customer_data.tipo_documento}
                    currentDocumentNumber={formData.customer_data.numero_documento}
                    onUpdate={(data) => {
                      setFormData((prev) => ({
                        ...prev,
                        customer_data: {
                          ...prev.customer_data,
                          tipo_documento: data.tipo_documento,
                          numero_documento: data.numero_documento,

                          ...(data.foundData ?? {}), //aqui dice que si se encuentra data en el hijo despues de hacer el fetch, actualize tambien el resto de datos en el padre
                        },
                      }));
                    }}
                  />

                </div>
              </div>










              <div className="space-y-2">
                <Label className="text-[11px] font-bold text-slate-500 uppercase">
                  Nombre Completo / Razón Social
                </Label>
                <Input
                  required
                  className="h-11"
                  placeholder="NOMBRE COMPLETO DEL CLIENTE"
                  value={formData.customer_data.nombre_completo}
                  onChange={(e) =>
                    handleCustomerChange("nombre_completo", e.target.value)
                  }
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-[11px] font-bold text-slate-500 uppercase">
                    Teléfono de contacto
                  </Label>
                  <Input
                    required
                    className="h-11"
                    placeholder="Ej: 3101234567"
                    value={formData.customer_data.telefono}
                    onChange={(e) =>
                      handleCustomerChange("telefono", e.target.value)
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-[11px] font-bold text-slate-500 uppercase">
                    Correo Electrónico
                  </Label>
                  <Input
                    required
                    className="h-11"
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
                <Label className="text-[11px] font-bold text-slate-500 uppercase">
                  Dirección de Residencia
                </Label>
                <Input
                  required
                  className="h-11"
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
                <span className="text-[12px] font-black text-slate-700 uppercase tracking-tight">
                  Propietario{" "}
                  <span className="text-slate-400 font-medium">
                    (Tarjeta de Propiedad)
                  </span>
                </span>
              </div>
            </div>

            <div
              className={`transition-all duration-500 ${formData.is_owner_same_as_customer ? "opacity-40 grayscale pointer-events-none" : "opacity-100"}`}
            >
              <div
                className={`bg-white border-2 rounded-2xl p-6 space-y-5 shadow-sm ${formData.is_owner_same_as_customer ? "border-slate-100" : "border-emerald-500/30 bg-emerald-50/5"}`}
              >













                <div className="space-y-2">
                  <Label className="text-[11px] font-bold text-slate-400 uppercase">
                    Documento Propietario
                  </Label>

                  <div className="flex gap-2">


                    {/* DISPLAY */}
                    <div
                      className={`flex-1 h-11 rounded-md border px-4 flex items-center overflow-hidden transition-all ${
                        formData.is_owner_same_as_customer
                          ? "bg-slate-100 border-slate-100 opacity-60"
                          : "bg-white border-slate-200"
                      }`}
                     >
                      <div className="flex flex-col leading-tight overflow-hidden">
                        <span className="text-[10px] uppercase font-bold text-slate-400 truncate">
                          {ID_DOCUMENT_OPTIONS.find(
                            (d) =>
                              d.value === formData.owner_data.tipo_documento,
                          )?.label || "Tipo documento"}
                        </span>

                        <span className="text-sm font-semibold text-slate-700 truncate">
                          {formData.owner_data.numero_documento ||
                            "Sin documento"}
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

                          handleOwnerChange(
                            "tipo_documento",
                            data.tipo_documento,
                          );

                          handleOwnerChange(
                            "numero_documento",
                            data.numero_documento,
                          );

                          if (data.foundData) {
                            Object.entries(data.foundData).forEach(
                              ([key, value]) => {
                                if (value) {
                                  handleOwnerChange(key, value);
                                }
                              },
                            );
                          }
                        }}
                      />
                    </div>


                  </div>

                  {/* MENSAJE CUANDO ESTÁ SINCRONIZADO */}
                  {formData.is_owner_same_as_customer && (
                    <p className="text-[11px] text-slate-400 font-medium px-1">
                      El propietario utiliza automáticamente la información del
                      cliente.
                    </p>
                  )}


                </div>












                <div className="space-y-2">
                  <Label className="text-[11px] font-bold text-slate-400 uppercase">
                    Nombre del Propietario
                  </Label>
                  <Input
                    required
                    disabled={formData.is_owner_same_as_customer}
                    className="h-11 bg-white"
                    placeholder="SEGÚN TARJETA DE PROPIEDAD"
                    value={formData.owner_data.nombre_completo}
                    onChange={(e) =>
                      handleOwnerChange("nombre_completo", e.target.value)
                    }
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-[11px] font-bold text-slate-400 uppercase">
                      Teléfono Propietario
                    </Label>
                    <Input
                      disabled={formData.is_owner_same_as_customer}
                      className="h-11 bg-white"
                      placeholder="Ej: 3101234567"
                      value={formData.owner_data.telefono}
                      onChange={(e) =>
                        handleOwnerChange("telefono", e.target.value)
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[11px] font-bold text-slate-400 uppercase">
                      Correo Propietario
                    </Label>
                    <Input
                      disabled={formData.is_owner_same_as_customer}
                      className="h-11 bg-white"
                      placeholder="ejemplo@correo.com"
                      value={formData.owner_data.correo}
                      onChange={(e) =>
                        handleOwnerChange("correo", e.target.value)
                      }
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-[11px] font-bold text-slate-400 uppercase">
                    Dirección Propietario
                  </Label>
                  <Input
                    disabled={formData.is_owner_same_as_customer}
                    className="h-11 bg-white"
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
