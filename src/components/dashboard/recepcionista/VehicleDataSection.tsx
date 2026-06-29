import {
  CalendarDays,
  Car,
  Globe,
  GraduationCap,
  Hash,
  Shield,
  ShieldCheck,
} from "lucide-react";
import { Label } from "../../ui/label";
import { Input } from "../../ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../ui/select";
import {
  ClaseVehiculoType,
  CombustibleType,
  ZodFullFormDataType,
} from "@/lib/zod-schemas/order-schema";
import { Checkbox } from "../../ui/checkbox";
import { OrderTemplate } from "@/lib/server-actions/fetch_orders_templates";
import { Dispatch, SetStateAction } from "react";

interface CombustibleOption {
  value: CombustibleType;
  label: string;
}

export const FUEL_OPTIONS: CombustibleOption[] = [
  { value: "gasolina", label: "Gasolina" },
  { value: "gas_natural_vehicular", label: "Gas Natural Vehicular" },
  { value: "diesel", label: "Diesel" },
  { value: "gas_gasolina", label: "Gas-Gasolina" },
  { value: "hibrido", label: "Híbrido" },
  { value: "electrico", label: "Eléctrico" },
  { value: "etanol", label: "Etanol" },
  { value: "biodiesel", label: "Biodiesel" },
  { value: "hidrogeno", label: "Hidrógeno" },
];

interface ClaseOption {
  value: ClaseVehiculoType;
  label: string;
}

export const CLASE_OPTIONS: ClaseOption[] = [
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

export interface VehicleDataSectionProps {
  /** * La plantilla técnica seleccionada actualmente.
   * Útil si necesitas condicionar campos visuales del vehículo según el tipo de plantilla.
   */
  selectedTemplate: OrderTemplate | undefined;

  /** * El estado completo del formulario de la orden de entrada.
   */
  formData: ZodFullFormDataType;

  /** * Función despachadora de React para actualizar el estado global desde los inputs del vehículo.
   */
  setFormData: Dispatch<SetStateAction<ZodFullFormDataType>>;
}

export default function VehicleDataSection({
  selectedTemplate,
  formData,
  setFormData,
}: VehicleDataSectionProps) {




const requiereGas =
  formData.vehicle.combustible === "gas_natural_vehicular" ||
  formData.vehicle.combustible === "gas_gasolina";


  return (
    <fieldset
      className={`mt-2 transition-all duration-500 ${selectedTemplate && formData.vehicle.placa ? "opacity-100" : "opacity-40 pointer-events-none translate-y-4"}`}
    >
      <div className="border-t pt-6">
        <legend className="text-xs font-bold uppercase text-slate-400 tracking-widest my-5">
          4. Datos del vehiculo
        </legend>

        <div className="bg-slate-50/80 border rounded-xl p-6 space-y-10">
          {/* GRUPO 3.1: Identificación Básica */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Car className="h-4 w-4 text-slate-400" />
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Identificación del Vehículo
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label className="text-xs font-semibold">Marca</Label>
                {/*#a11 ACTION */}
                <Input
                  required
                  placeholder="Ej: Chevrolet"
                  value={formData.vehicle.marca}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      vehicle: {
                        ...prev.vehicle,
                        marca: e.target.value.toUpperCase(),
                      },
                    }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-semibold">Línea</Label>
                {/*#a11 ACTION */}
                <Input
                  required
                  placeholder="Ej: Spark GT"
                  value={formData.vehicle.linea}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      vehicle: {
                        ...prev.vehicle,
                        linea: e.target.value.toUpperCase(),
                      },
                    }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-semibold">Modelo (Año)</Label>
                {/*#a11 ACTION */}
                <Input
                  required
                  type="number"
                  min={1900}
                  placeholder="Ej: 2026"
                  value={formData.vehicle.modelo}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      vehicle: {
                        ...prev.vehicle,
                        modelo: e.target.value,
                      },
                    }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-semibold">Color</Label>
                {/*#a11 ACTION */}
                <Input
                  required
                  placeholder="Ej: Blanco Galaxia"
                  value={formData.vehicle.color}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      vehicle: {
                        ...prev.vehicle,
                        color: e.target.value.toUpperCase(),
                      },
                    }))
                  }
                />
              </div>
            </div>
          </div>

          {/* GRUPO 3.2: Especificaciones Técnicas */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Hash className="h-4 w-4 text-slate-400" />
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Especificaciones Técnicas
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label className="text-xs font-semibold">Cilindrada (cc)</Label>
                {/*#a11 ACTION */}
                <Input
                  required
                  type="number"
                  min={0}
                  placeholder="Ej: 1600"
                  value={formData.vehicle.cilindrada}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      vehicle: {
                        ...prev.vehicle,
                        cilindrada: e.target.value,
                      },
                    }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-semibold">
                  Capacidad Pasajeros
                </Label>
                {/*#a11 ACTION */}
                <Input
                  required
                  type="number"
                  min={0}
                  placeholder="Ej: 5"
                  value={formData.vehicle.capacidad_pasajeros}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      vehicle: {
                        ...prev.vehicle,
                        capacidad_pasajeros: e.target.value.toString(),
                      },
                    }))
                  }
                />
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-semibold">Combustible</Label>

                <Select
                  required
                  items={FUEL_OPTIONS}
                  value={formData.vehicle.combustible}
                  onValueChange={(value) =>
                    setFormData((prev) => ({
                      ...prev,
                      vehicle: {
                        ...prev.vehicle,
                        combustible: value ? value : "gasolina",
                      },
                    }))
                  }
                >
                  <SelectTrigger className="h-10 w-full bg-background text-left">
                    <SelectValue placeholder="Selecciona combustible" />
                  </SelectTrigger>

                  <SelectContent alignItemWithTrigger={false}>
                    {/* Mapeo dinámico */}
                    {FUEL_OPTIONS.map((opcion) => (
                      <SelectItem key={opcion.value} value={opcion.value}>
                        {opcion.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-semibold">
                  Clase de Vehículo
                </Label>

                <Select
                  required
                  items={CLASE_OPTIONS}
                  value={formData.vehicle.clase}
                  onValueChange={(value) =>
                    setFormData((prev) => ({
                      ...prev,
                      vehicle: {
                        ...prev.vehicle,
                        clase: value ? value : "automovil",
                      },
                    }))
                  }
                >
                  <SelectTrigger className="h-10 w-full bg-background text-left">
                    <SelectValue placeholder="Selecciona una clase" />
                  </SelectTrigger>

                  <SelectContent alignItemWithTrigger={false}>
                    {CLASE_OPTIONS.map((opcion) => (
                      <SelectItem key={opcion.value} value={opcion.value}>
                        {opcion.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-semibold">
                  Tipo de Vehículo
                </Label>
                {/*#a11 ACTION */}
                <Select
                  required
                  value={formData.vehicle.tipo_vehiculo}
                  onValueChange={(value) =>
                    setFormData((prev) => ({
                      ...prev,
                      vehicle: {
                        ...prev.vehicle,
                        tipo_vehiculo: value ? value : "",
                      },
                    }))
                  }
                  items={[
                    { label: "Liviano", value: "liviano" },
                    { label: "Pesado", value: "pesado" },
                    { label: "Moto 4T", value: "motocicleta_4t" },
                    { label: "Moto 2T", value: "motocicleta_2t" },
                    { label: "Motocarro 4T", value: "motocarro_4t" },
                    { label: "Motocarro 2T", value: "motocarro_2t" },
                  ]}
                >
                  <SelectTrigger className="h-10 bg-background w-full">
                    <SelectValue placeholder="Selecciona un tipo" />
                  </SelectTrigger>

                  <SelectContent alignItemWithTrigger={false}>
                    <SelectItem value="liviano">Liviano</SelectItem>
                    <SelectItem value="pesado">Pesado</SelectItem>
                    <SelectItem value="motocicleta_4t">Moto 4T</SelectItem>
                    <SelectItem value="motocicleta_2t">Moto 2T</SelectItem>
                    <SelectItem value="motocarro_4t">Motocarro 4T</SelectItem>
                    <SelectItem value="motocarro_2t">Motocarro 2T</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-semibold">
                  Tipo de Servicio
                </Label>

                <Select
                  required
                  value={formData.vehicle.tipo_servicio_vehiculo}
                  onValueChange={(value) =>
                    setFormData((prev) => ({
                      ...prev,
                      vehicle: {
                        ...prev.vehicle,
                        tipo_servicio_vehiculo: value ? value : "particular",
                      },
                    }))
                  }
                  items={[
                    { label: "Particular", value: "particular" },
                    { label: "Enseñanza", value: "ensenanza" },
                    { label: "Oficial", value: "oficial" },
                    { label: "Público", value: "publico" },
                    { label: "Diplomático", value: "diplomatico" },
                    { label: "Especial", value: "especial" },
                  ]}
                >
                  <SelectTrigger className="h-10 w-full bg-background">
                    <SelectValue placeholder="Selecciona tipo de servicio" />
                  </SelectTrigger>

                  <SelectContent alignItemWithTrigger={false}>
                    <SelectItem value="particular">Particular</SelectItem>
                    <SelectItem value="ensenanza">Enseñanza</SelectItem>
                    <SelectItem value="oficial">Oficial</SelectItem>
                    <SelectItem value="publico">Público</SelectItem>
                    <SelectItem value="diplomatico">Diplomático</SelectItem>
                    <SelectItem value="especial">Especial</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* GRUPO 3.3: Snapshots Legales (SOAT y GAS) */}
          <div className="pt-4 border-t border-slate-200">
            <div className="bg-white p-5 rounded-xl border border-blue-100 shadow-sm space-y-6">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-blue-600" />
                <h3 className="text-sm font-bold text-slate-800">
                  Documentación y Snapshots de Ley
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label className="text-xs font-bold text-blue-700 flex items-center gap-1.5">
                    <CalendarDays className="h-3.5 w-3.5" /> Vencimiento SOAT
                  </Label>
                  {/*#a11 ACTION */}
                  <Input
                    required
                    type="date"
                    className="border-blue-100 focus:ring-blue-500"
                    value={formData.soat_vencimiento_snapshot || ""}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        soat_vencimiento_snapshot: e.target.value,
                      }))
                    }
                  />
                </div>

                <div className={`space-y-2 ${requiereGas ? "opacity-100" : "opacity-40 pointer-events-none"}`}>
                  <Label className="text-xs font-bold text-emerald-700 flex items-center gap-1.5">
                    <Globe className="h-3.5 w-3.5" /> Número Certificado Gas
                  </Label>

                  <Input
                    required={requiereGas}
                    disabled={!requiereGas}
                    placeholder="N° de certificado"
                    className="border-emerald-100 focus:ring-emerald-500"
                    value={formData.gas_numero_snapshot}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        gas_numero_snapshot: e.target.value.toUpperCase(),
                      }))
                    }
                  />
                </div>

                <div 
                  className={`space-y-2 transition-all duration-300 ${
                    formData.vehicle.combustible === "gas_natural_vehicular" || 
                    formData.vehicle.combustible === "gas_gasolina" 
                      ? "opacity-100" 
                      : "opacity-40 pointer-events-none"
                  }`}
                 >
                  <Label className="text-xs font-bold text-emerald-700 flex items-center gap-1.5">
                    <CalendarDays className="h-3.5 w-3.5" /> Vencimiento Gas
                  </Label>
                  <Input
                    type="date"
                    className="border-emerald-100 focus:ring-emerald-500"
                    value={formData.gas_vencimiento_snapshot || ""}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        gas_vencimiento_snapshot: e.target.value,
                      }))
                    }
                  />
                </div>



              </div>

              <div className="space-y-2">
                <Label className="text-xs font-bold text-slate-700">
                  Kilometraje Actual -Km-
                </Label>
                {/*#a11 ACTION */}
                <Input
                  min={0}
                  type="number"
                  placeholder="000000"
                  className="h-12 text-lg font-mono font-bold"
                  value={formData.kilometraje}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      kilometraje: e.target.value,
                    }))
                  }
                />
              </div>
            </div>
          </div>

          {/* Checkboxes de Estado Especial */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="h-px flex-1 bg-slate-200"></div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-2">
                Estado Especial
              </span>
              <div className="h-px flex-1 bg-slate-200"></div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {[
                {
                  id: "blindaje",
                  label: "VEHÍCULO BLINDADO",
                  desc: "Protección balística",
                  icon: <Shield className="h-5 w-5 text-amber-600" />,
                  checked: formData.vehicle.blindaje,
                  field: "blindaje" as const,
                },
                {
                  id: "ensenanza",
                  label: "VEHÍCULO DE ENSEÑANZA",
                  desc: "Escuelas de conducción",
                  icon: <GraduationCap className="h-5 w-5 text-emerald-600" />,
                  checked: formData.vehicle.es_ensenanza,
                  field: "es_ensenanza" as const,
                },
                {
                  id: "extranjero",
                  label: "VEHÍCULO EXTRANJERO",
                  desc: "Placa o registro de otro país",
                  icon: <Globe className="h-5 w-5 text-purple-600" />,
                  checked: formData.vehicle.es_extranjero,
                  field: "es_extranjero" as const,
                },
              ].map((item) => (
                <Label
                  key={item.id}
                  className={`group relative flex flex-col gap-3 rounded-xl border p-4 cursor-pointer transition-all bg-white hover:border-blue-300 ${
                    item.checked
                      ? "border-blue-600 bg-blue-50/50 ring-1 ring-blue-600"
                      : "border-slate-200"
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <div
                      className={`p-2 border rounded-lg transition-colors ${
                        item.checked
                          ? "bg-white border-blue-100"
                          : "bg-slate-50 border-slate-100"
                      }`}
                    >
                      {item.icon}
                    </div>
                    {/*#a11 ACTION */}
                    <Checkbox
                      checked={item.checked}
                      onCheckedChange={(checked) =>
                        setFormData((prev) => ({
                          ...prev,
                          vehicle: {
                            ...prev.vehicle,
                            [item.field]: !!checked,
                          },
                        }))
                      }
                      className="h-5 w-5 rounded-full border-slate-300 data-[state=checked]:border-blue-600 data-[state=checked]:bg-blue-600 ml-4"
                    />
                  </div>

                  <div className="space-y-0.5">
                    <p className="text-[11px] font-black text-slate-800 uppercase leading-tight">
                      {item.label}
                    </p>
                    <p className="text-[10px] text-slate-500 font-medium">
                      {item.desc}
                    </p>
                  </div>
                </Label>
              ))}
            </div>
          </div>
        </div>
      </div>
    </fieldset>
  );
}
