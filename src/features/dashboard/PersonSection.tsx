import React from "react";
import { User, UserCheck, Mail, Phone, MapPin, IdCard, Info } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Opciones de identificación según tu lista
const ID_OPTIONS = [
  { label: "Cédula de Ciudadanía", id: "cedula_ciudadania" },
  { label: "NIT", id: "nit" },
  { label: "Pasaporte", id: "pasaporte" },
  { label: "Cédula de Extranjería", id: "cedula_extranjeria" },
  { label: "Tarjeta de Identidad", id: "tarjeta_identidad" },
  { label: "Registro Civil", id: "registro_civil" },
  { label: "Carnet Diplomático", id: "carnet_diplomatico" },
  { label: "N.N.", id: "nn" },
  { label: "TI2", id: "ti2" },
];

export const PersonSection = ({ formData, setFormData }: { formData: any, setFormData: any }) => {

  // Manejador para el Cliente (con lógica de espejo manual)
  const handleCustomerChange = (field: string, value: string) => {
    const formattedValue = field === 'nombre_completo' ? value.toUpperCase() : value;

    setFormData((prev: any) => {
      const newCustomerData = { ...prev.customer_data, [field]: formattedValue };
      return {
        ...prev,
        customer_data: newCustomerData,
        owner_data: prev.is_owner_same_as_customer 
          ? { ...prev.owner_data, [field]: formattedValue }
          : prev.owner_data
      };
    });
  };

  // Manejador para el Dueño
  const handleOwnerChange = (field: string, value: string) => {
    const formattedValue = field === 'nombre_completo' ? value.toUpperCase() : value;
    setFormData((prev: any) => ({
      ...prev,
      owner_data: { ...prev.owner_data, [field]: formattedValue }
    }));
  };

  // Manejador del Checkbox (Click en toda el área)
  const toggleSameOwner = () => {
    setFormData((prev: any) => {
      const newState = !prev.is_owner_same_as_customer;
      return {
        ...prev,
        is_owner_same_as_customer: newState,
        owner_data: newState ? { ...prev.customer_data } : prev.owner_data
      };
    });
  };

  return (
    <div className="mt-10 space-y-8">
      <div className="border-t border-slate-200 pt-8">
        <legend className="text-[12px] font-black uppercase text-slate-400 tracking-[0.2em] mb-8 flex items-center gap-3">
          <div className="h-px w-8 bg-slate-200"></div>
          2. Identificación de Personas
        </legend>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          
          {/* --- BLOQUE CLIENTE (PRESENTANTE) --- */}
          <div className="space-y-6">
            <div className="flex items-center gap-2 px-1">
              <User className="h-5 w-5 text-blue-600" />
              <span className="text-[12px] font-black text-slate-700 uppercase tracking-tight">
                Datos del Cliente <span className="text-slate-400 font-medium">(Presentante)</span>
              </span>
            </div>
            
            <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-5 shadow-sm">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-[11px] font-bold text-slate-500 uppercase">Tipo Documento</Label>
                  <Select 
                    value={formData.customer_data.tipo_documento}
                    onValueChange={(v) => handleCustomerChange('tipo_documento', v)}
                  >
                    <SelectTrigger className="h-11 bg-slate-50/50 border-slate-200 focus:ring-2 ring-blue-100">
                      <SelectValue placeholder="Seleccione tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      {ID_OPTIONS.map(opt => (
                        <SelectItem key={opt.id} value={opt.id}>{opt.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-[11px] font-bold text-slate-500 uppercase">N° Identificación</Label>
                  <Input 
                    className="h-11"
                    placeholder="Ej: 10203040"
                    value={formData.customer_data.numero_documento}
                    onChange={(e) => handleCustomerChange('numero_documento', e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-[11px] font-bold text-slate-500 uppercase">Nombre Completo / Razón Social</Label>
                <Input 
                  className="h-11"
                  placeholder="NOMBRE COMPLETO DEL CLIENTE"
                  value={formData.customer_data.nombre_completo}
                  onChange={(e) => handleCustomerChange('nombre_completo', e.target.value)}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-[11px] font-bold text-slate-500 uppercase">Teléfono de contacto</Label>
                  <Input 
                    className="h-11"
                    placeholder="Ej: 3101234567"
                    value={formData.customer_data.telefono}
                    onChange={(e) => handleCustomerChange('telefono', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-[11px] font-bold text-slate-500 uppercase">Correo Electrónico</Label>
                  <Input 
                    className="h-11"
                    type="email"
                    placeholder="ejemplo@correo.com"
                    value={formData.customer_data.correo}
                    onChange={(e) => handleCustomerChange('correo', e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-[11px] font-bold text-slate-500 uppercase">Dirección de Residencia</Label>
                <Input 
                  className="h-11"
                  placeholder="Ej: Calle 10 # 20-30"
                  value={formData.customer_data.direccion}
                  onChange={(e) => handleCustomerChange('direccion', e.target.value)}
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
                  Propietario <span className="text-slate-400 font-medium">(Tarjeta de Propiedad)</span>
                </span>
              </div>

              {/* BOTÓN / CHECKBOX GRANDE CLICKABLE EN CUALQUIER LADO */}
              <div 
                onClick={toggleSameOwner}
                className={`flex items-center gap-3 px-5 py-2.5 rounded-xl border-2 cursor-pointer transition-all active:scale-95 select-none ${
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
                  ¿Es el mismo cliente?
                </span>
              </div>
            </div>

            <div className={`transition-all duration-500 ${formData.is_owner_same_as_customer ? 'opacity-40 grayscale pointer-events-none' : 'opacity-100'}`}>
              <div className={`bg-white border-2 rounded-2xl p-6 space-y-5 shadow-sm ${formData.is_owner_same_as_customer ? 'border-slate-100' : 'border-emerald-500/30 bg-emerald-50/5'}`}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-[11px] font-bold text-slate-400 uppercase">Tipo Documento</Label>
                    <Select 
                       disabled={formData.is_owner_same_as_customer}
                       value={formData.owner_data.tipo_documento}
                       onValueChange={(v) => handleOwnerChange('tipo_documento', v)}
                    >
                      <SelectTrigger className="h-11 bg-white border-slate-200">
                        <SelectValue placeholder="Seleccione tipo" />
                      </SelectTrigger>
                      <SelectContent>
                        {ID_OPTIONS.map(opt => (
                          <SelectItem key={opt.id} value={opt.id}>{opt.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[11px] font-bold text-slate-400 uppercase">N° Identificación</Label>
                    <Input 
                       disabled={formData.is_owner_same_as_customer}
                       className="h-11 bg-white"
                       placeholder="Ej: 10203040"
                       value={formData.owner_data.numero_documento}
                       onChange={(e) => handleOwnerChange('numero_documento', e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-[11px] font-bold text-slate-400 uppercase">Nombre del Propietario</Label>
                  <Input 
                    disabled={formData.is_owner_same_as_customer}
                    className="h-11 bg-white"
                    placeholder="SEGÚN TARJETA DE PROPIEDAD"
                    value={formData.owner_data.nombre_completo}
                    onChange={(e) => handleOwnerChange('nombre_completo', e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-[11px] font-bold text-slate-400 uppercase">Teléfono Propietario</Label>
                    <Input 
                      disabled={formData.is_owner_same_as_customer}
                      className="h-11 bg-white"
                      placeholder="Ej: 3101234567"
                      value={formData.owner_data.telefono}
                      onChange={(e) => handleOwnerChange('telefono', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[11px] font-bold text-slate-400 uppercase">Correo Propietario</Label>
                    <Input 
                      disabled={formData.is_owner_same_as_customer}
                      className="h-11 bg-white"
                      placeholder="ejemplo@correo.com"
                      value={formData.owner_data.correo}
                      onChange={(e) => handleOwnerChange('correo', e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-[11px] font-bold text-slate-400 uppercase">Dirección Propietario</Label>
                  <Input 
                    disabled={formData.is_owner_same_as_customer}
                    className="h-11 bg-white"
                    placeholder="Ej: Calle 10 # 20-30"
                    value={formData.owner_data.direccion}
                    onChange={(e) => handleOwnerChange('direccion', e.target.value)}
                  />
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};