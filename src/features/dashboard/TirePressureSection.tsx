"use client";


import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Minus, Gauge } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { FullFormData, TirePressureEntry } from "@/app/[tenant]/dashboard/recepcionista/page";

// ─── Tipos ─────────────────────────────────────────────────────────

interface TirePressureSectionProps {
  tirePressures: TirePressureEntry[];// O usa el tipo de tu formData si lo tienes definido
  setFormData: React.Dispatch<React.SetStateAction<FullFormData>>;
}

// ─── Utilidades ────────────────────────────────────────────────────

const POSITIONS: { value: string; label: string }[] = [
  { value: "izquierda", label: "Izquierda" },
  { value: "derecha", label: "Derecha" },
  { value: "centro", label: "Centro" },
  { value: "izquierda_interior", label: "Izq. Interior" },
  { value: "derecha_interior", label: "Der. Interior" },
  { value: "repuesto", label: "Repuesto" },
];



export default function TirePressureSection({ tirePressures, setFormData }: TirePressureSectionProps) {

// Extraemos las presiones para que el código de abajo siga funcionando igual
  const pressures = tirePressures;

//STATE simplificado que refleja los datos que se van a insertar en la tabla
//const [pressures, setPressures] = useState<TirePressureEntry[]>(DEFAULT_PRESSURES);


  // Derivamos datos necesarios para el renderizado, esto se calcula cada vez que se re renderiza el componente
  //al tener un estado "aplanado" (un array de objetos donde cada uno es una llanta), no tienes una variable directa que te diga cuántos ejes hay.
  //Funcion de numero de ejes reviza el object presures y mira si y obtiene elmaximo de la key eje del object
  const numEjes = pressures.length > 0 ? Math.max(...pressures.map((p: TirePressureEntry) => p.eje)) : 0;
  //entonces sabiendo el mujero de ejes, vamos a crear un array que contenga los indices desde el 1 hasta elmaximo de los ejes que hay en el state (preasures.eje)
  //la idea es saber cuantos ejes hay a partir de todo el state que lo que trae es cantidad de llantas mas  no cantidad de ejes
  const ejesIndices = Array.from({ length: numEjes }, (_, i) => i + 1);






  // ─── Manejadores de Ejes ───────────────────────────────────────

 const addAxle = () => {
  // Tomamos el número de ejes (el máximo en el state.eje) y se le suma uno
  const nextEje = numEjes + 1;

  setFormData((prev: FullFormData) => ({
    ...prev,
    // Actualizamos solo la propiedad tire_pressures
    tire_pressures: [
      ...prev.tire_pressures,
      {
        eje: nextEje,
        posicion: "izquierda",
        presion_encontrada: "",
        presion_ajustada: "",
        es_repuesto: false,
        _requiere_ajuste: false,
      },
      {
        eje: nextEje,
        posicion: "derecha",
        presion_encontrada: "",
        presion_ajustada: "",
        es_repuesto: false,
        _requiere_ajuste: false,
      },
    ],
  }));
};

  const removeAxle = () => {
    if (numEjes <= 1) return;
    setFormData((prev: FullFormData) => ({
      ...prev,
      tire_pressures: prev.tire_pressures.filter((p: TirePressureEntry) => p.eje !== numEjes)
    }));
  };

  // ─── Manejadores de Llantas ────────────────────────────────────

 const addTire = (ejeNumero: number) => {
    const newTire: TirePressureEntry = {
      eje: ejeNumero,
      posicion: "izquierda",
      presion_encontrada: "",
      presion_ajustada: "",
     
      _requiere_ajuste: false,
    };

    setFormData((prev: FullFormData) => {
      const currentPressures = [...prev.tire_pressures];
      const lastIndexInAxle = [...currentPressures].reverse().findIndex((p) => p.eje === ejeNumero);
      const insertAt = lastIndexInAxle === -1 ? currentPressures.length : currentPressures.length - lastIndexInAxle;
      
      currentPressures.splice(insertAt, 0, newTire);
      
      return { ...prev, tire_pressures: currentPressures };
    });
  };

 const removeTire = (ejeNumero: number) => {
  // 1. Obtenemos las llantas actuales del estado del padre
  const currentPressures = pressures;
  
  // 2. Filtramos cuántas hay en este eje para la validación
  const axleTires = currentPressures.filter((p: TirePressureEntry) => p.eje === ejeNumero);
  if (axleTires.length <= 1) return;

  // 3. Buscamos la última llanta de ese eje usando la lógica de reversa
  const lastIndexInAxle = [...currentPressures]
    .reverse()
    .findIndex((p: TirePressureEntry) => p.eje === ejeNumero);
  
  // 4. Calculamos el índice real en el array original
  const actualIndex = currentPressures.length - 1 - lastIndexInAxle;

  // 5. Actualizamos el estado del padre filtrando por ese índice
  setFormData((prev: FullFormData) => ({
    ...prev,
    tire_pressures: prev.tire_pressures.filter((_: TirePressureEntry, idx: number) => idx !== actualIndex)
  }));
};

  // ─── Manejadores de Campos ─────────────────────────────────────

const updateField = (index: number, field: keyof TirePressureEntry, value: boolean | string | TirePressureEntry | null) => {
  setFormData(prev => ({
    ...prev,
    tire_pressures: prev.tire_pressures.map((item, idx) => {
      if (idx !== index) return item;

      const updated = { ...item, [field]: value };

      // Limpieza automática: si deja de requerir ajuste, reseteamos el valor
      if (field === "_requiere_ajuste" && !value) {
        updated.presion_ajustada = "";
      }

      return updated;
    }),
  }));
};

  const handlePressureChange = (
    index: number,
    field: "presion_encontrada" | "presion_ajustada",
    value: string,
  ) => {
    const cleanValue = value.replace(/[^0-9.]/g, "");
    if (cleanValue !== "" && parseFloat(cleanValue) > 300) return;
    updateField(index, field, cleanValue);
  };




  return (
    <div className="space-y-6">


      {/* Header General */}
      <div className="flex items-center justify-between">

        <div className="flex items-center gap-2">
          <Gauge className="h-4 w-4 text-slate-400" />
          <span className="text-xs font-bold uppercase text-slate-400 tracking-widest">
            Configuración: {numEjes} Ejes
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/*#a11 ACTION */}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addAxle}
            className="gap-1.5 text-xs font-bold h-8"
          >
            <Plus className="h-3.5 w-3.5" />
            Agregar Eje
          </Button>

          {/*#a11 ACTION */}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={removeAxle}
            disabled={numEjes <= 1}
            className="gap-1.5 text-xs font-bold h-8 border-red-200 text-red-600 hover:bg-red-50"
          >
            <Minus className="h-3.5 w-3.5" />
            Quitar Eje
          </Button>
          
        </div>

      </div>



      {/* Lista de Ejes */}
      <div className="space-y-4">
        {/**En la parte mas exterior mapeamos los indices, osea cada cuadro de eje calculado a partir del state que solo son llantas */}
        {ejesIndices.map((ejeNum) => {
          // Filtramos las llantas que pertenecen a este eje (el que se esta renderizando dentro del map) para el conteo y renderizado
          const llantasDelEje = pressures.filter((p) => p.eje === ejeNum);

          return (
            <div
              key={`axle-card-${ejeNum}`}
              className="border rounded-xl bg-white shadow-sm overflow-hidden"
             >

              {/* Header del Eje individual */}
              <div className="flex items-center justify-between px-4 py-3 bg-slate-50 border-b">
                
                <div className="flex items-center gap-3">
                  <span className="text-sm font-black text-slate-800 uppercase tracking-tight">
                    Eje {ejeNum}
                  </span>
                  <span className="text-[10px] text-slate-400 font-medium">
                    {llantasDelEje.length} llanta
                    {llantasDelEje.length !== 1 ? "s" : ""}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {/*#a11 ACTION */}
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => addTire(ejeNum)}
                    className="gap-1.5 text-xs font-bold h-7 text-blue-600 hover:bg-blue-50"
                  >
                    <Plus className="h-3 w-3" />
                    Llanta
                  </Button>

                  {/*#a11 ACTION */}
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeTire(ejeNum)}
                    disabled={llantasDelEje.length <= 1}
                    className="gap-1.5 text-xs font-bold h-7 text-slate-400 hover:text-red-600"
                  >
                    <Minus className="h-3 w-3" />
                    Llanta
                  </Button>
                  
                </div>

              </div>



              {/* Tabla de Llantas */}
              <div className="p-4 overflow-x-auto">
                <Table>

                  <TableHeader>
                    <TableRow className="border-b border-slate-100 hover:bg-transparent">
                      <TableHead className="text-left text-[10px] font-bold uppercase text-slate-400 h-auto pb-2 w-32">
                        Posición
                      </TableHead>
                      <TableHead className="text-left text-[10px] font-bold uppercase text-slate-400 h-auto pb-2 w-28">
                        Presión (PSI)
                      </TableHead>
                      <TableHead className="text-center text-[10px] font-bold uppercase text-slate-400 h-auto pb-2 w-24">
                        Ajuste
                      </TableHead>
                      <TableHead className="text-left text-[10px] font-bold uppercase text-slate-400 h-auto pb-2 w-28">
                        Ajustado (PSI)
                      </TableHead>
                    </TableRow>
                  </TableHeader>

                  <TableBody>
                    {pressures.map((llanta, idx) => {
                      // Solo renderizamos si la llanta pertenece a este eje
                      if (llanta.eje !== ejeNum) return null;

                      return (
                        <TableRow
                          key={`tire-row-${idx}`}
                          className="border-b border-slate-50 last:border-0 hover:bg-slate-50/50 "
                        >
                          <TableCell className="py-2 pr-2">
                            {/*#a11 ACTION */}
                            <Select
                              value={llanta.posicion}
                              onValueChange={(val) => updateField(idx, "posicion", val)}
                              // Pasamos el array de posiciones directamente como prop
                              items={POSITIONS.map((p) => ({
                                value: p.value,
                                label: p.label,
                              }))}
                            >
                              <SelectTrigger className="h-9 text-xs border-slate-200 w-full">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {POSITIONS.map((p) => (
                                  <SelectItem key={p.value} value={p.value} className="text-xs">
                                    {p.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </TableCell>

                          <TableCell className="py-2 px-2">
                            <div className="relative">
                              {/*#a11 ACTION */}
                              <Input
                                type="text"
                                inputMode="decimal"
                                value={llanta.presion_encontrada}
                                onChange={(e) =>
                                  handlePressureChange(idx, "presion_encontrada", e.target.value)
                                }
                                className="h-9 text-sm font-bold text-center border-slate-200 pr-8"
                                placeholder="0"
                              />
                              <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-slate-400 font-medium">
                                PSI
                              </span>
                            </div>
                          </TableCell>

                          <TableCell className="py-2 px-2 text-center">
                            <Checkbox
                              checked={llanta._requiere_ajuste}
                              onCheckedChange={(val) =>
                                updateField(idx, "_requiere_ajuste", !!val)
                              }
                              className="h-5 w-5 rounded border-slate-300 data-[state=checked]:bg-blue-600 m-auto"
                            />
                          </TableCell>

                          <TableCell className="py-2 px-2">
                            <div className="relative">
                              <Input
                                type="text"
                                inputMode="decimal"
                                value={llanta.presion_ajustada}
                                disabled={!llanta._requiere_ajuste}
                                onChange={(e) =>
                                  handlePressureChange(idx, "presion_ajustada", e.target.value)
                                }
                                className={`h-9 text-sm font-bold text-center pr-8 transition-all ${
                                  llanta._requiere_ajuste
                                    ? "border-blue-200 bg-blue-50/50 text-blue-900"
                                    : "bg-slate-50 text-slate-300 border-slate-100"
                                }`}
                                placeholder={llanta._requiere_ajuste ? "0" : "---"}
                              />
                              <span
                                className={`absolute right-2 top-1/2 -translate-y-1/2 text-[10px] font-medium ${
                                  llanta._requiere_ajuste ? "text-blue-400" : "text-slate-300"
                                }`}
                              >
                                PSI
                              </span>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </div>


          );
        })}

        
      </div>



    </div>
  );
}
