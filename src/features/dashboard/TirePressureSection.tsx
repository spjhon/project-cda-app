"use client";

import { useState } from "react";
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

// ─── Tipos ─────────────────────────────────────────────────────────

type TirePosition =
  | "izquierda"
  | "derecha"
  | "centro"
  | "izquierda_interior"
  | "derecha_interior"
  | "repuesto";

// Estructura idéntica a la tabla entry_order_tire_pressures
interface TirePressureEntry {
  eje: number;
  posicion: TirePosition;
  presion_encontrada: string;
  presion_ajustada: string;
  es_repuesto: boolean;
  // Propiedad auxiliar solo para la lógica de la UI
  _requiere_ajuste: boolean;
}

// ─── Utilidades ────────────────────────────────────────────────────

const POSITIONS: { value: TirePosition; label: string }[] = [
  { value: "izquierda", label: "Izquierda" },
  { value: "derecha", label: "Derecha" },
  { value: "centro", label: "Centro" },
  { value: "izquierda_interior", label: "Izq. Interior" },
  { value: "derecha_interior", label: "Der. Interior" },
  { value: "repuesto", label: "Repuesto" },
];

const DEFAULT_PRESSURES: TirePressureEntry[] = [
  {
    eje: 1,
    posicion: "izquierda",
    presion_encontrada: "",
    presion_ajustada: "",
    es_repuesto: false,
    _requiere_ajuste: false,
  },
  {
    eje: 1,
    posicion: "derecha",
    presion_encontrada: "",
    presion_ajustada: "",
    es_repuesto: false,
    _requiere_ajuste: false,
  },
  {
    eje: 2,
    posicion: "izquierda",
    presion_encontrada: "",
    presion_ajustada: "",
    es_repuesto: false,
    _requiere_ajuste: false,
  },
  {
    eje: 2,
    posicion: "derecha",
    presion_encontrada: "",
    presion_ajustada: "",
    es_repuesto: false,
    _requiere_ajuste: false,
  },
];

export default function TirePressureSection() {


//STATE simplificado que refleja los datos que se van a insertar en la tabla
  const [pressures, setPressures] = useState<TirePressureEntry[]>(DEFAULT_PRESSURES);


  // Derivamos datos necesarios para el renderizado, esto se calcula cada vez que se re renderiza el componente
  //al tener un estado "aplanado" (un array de objetos donde cada uno es una llanta), no tienes una variable directa que te diga cuántos ejes hay.
  //Funcion de numero de ejes reviza el object presures y mira si y obtiene elmaximo de la key eje del object
  const numEjes = pressures.length > 0 ? Math.max(...pressures.map((p) => p.eje)) : 0;
  //entonces sabiendo el mujero de ejes, vamos a crear un array que contenga los indices desde el 1 hasta elmaximo de los ejes que hay en el state (preasures.eje)
  //la idea es saber cuantos ejes hay a partir de todo el state que lo que trae es cantidad de llantas mas  no cantidad de ejes
  const ejesIndices = Array.from({ length: numEjes }, (_, i) => i + 1);






  // ─── Manejadores de Ejes ───────────────────────────────────────

  const addAxle = () => {
    //Tomamos el numero de ejes (el maxmimo en el state.eje) y se le suma uno y se le añade una llanta al state
    const nextEje = numEjes + 1;
    setPressures((prev) => [
      ...prev,
      {
        eje: nextEje,
        posicion: "izquierda",
        presion_encontrada: "",
        presion_ajustada: "",
        es_repuesto: false,
        _requiere_ajuste: false,
      },
      
    ]);
  };

  const removeAxle = () => {
    if (numEjes <= 1) return;
    //Usamos la forma funcional (prev) => ... porque necesitamos saber qué había en el estado justo antes (previous state) para poder filtrarlo.
    //la idea es que conserve por medio del filtro todos los ejes excepto aquel eje key que sea igual al maximo
    //efectivamente eliminando las llantas que contengan el ultimo eje
    setPressures((prev) => prev.filter((p) => p.eje !== numEjes));
  };

  // ─── Manejadores de Llantas ────────────────────────────────────

  const addTire = (ejeNumero: number) => {
    const newTire: TirePressureEntry = {
      eje: ejeNumero,
      posicion: "izquierda",
      presion_encontrada: "",
      presion_ajustada: "",
      es_repuesto: false,
      _requiere_ajuste: false,
    };

    // Buscamos el último índice del eje actual para insertar la nueva llanta justo después
    const lastIndexInAxle = [...pressures]
      .reverse()
      .findIndex((p) => p.eje === ejeNumero);
    const insertAt =
      lastIndexInAxle === -1
        ? pressures.length
        : pressures.length - lastIndexInAxle;

    const newArray = [...pressures];
    newArray.splice(insertAt, 0, newTire);
    setPressures(newArray);
  };

  const removeTire = (ejeNumero: number) => {
    const axleTires = pressures.filter((p) => p.eje === ejeNumero);
    if (axleTires.length <= 1) return;

    // Removemos la última llanta encontrada de ese eje
    const lastIndexInAxle = [...pressures]
      .reverse()
      .findIndex((p) => p.eje === ejeNumero);
    const actualIndex = pressures.length - 1 - lastIndexInAxle;

    setPressures((prev) => prev.filter((_, idx) => idx !== actualIndex));
  };

  // ─── Manejadores de Campos ─────────────────────────────────────

  const updateField = (index: number, field: keyof TirePressureEntry, value: TirePosition | boolean | string | null) => {
    
    setPressures((prev) =>
      prev.map((item, idx) => {
        if (idx !== index) return item;

        const updated = { ...item, [field]: value };

        // Lógica de negocio automática
        if (field === "posicion") {
          updated.es_repuesto = value === "repuesto";
        }
        if (field === "_requiere_ajuste" && value === false) {
          updated.presion_ajustada = "";
        }

        return updated;
      }),
    );
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
        </div>

      </div>



      {/* Lista de Ejes */}
      <div className="space-y-4">
        {/**En la parte mas exterior mapeamos los indices, osea cada eje calculado a partir del state que solo son llantas */}
        {ejesIndices.map((ejeNum) => {
          // Filtramos las llantas que pertenecen a este eje para el conteo y renderizado
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
                </div>
              </div>

              {/* Tabla de Llantas */}
              <div className="p-4 overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-100">
                      <th className="text-left text-[10px] font-bold uppercase text-slate-400 pb-2 w-32">
                        Posición
                      </th>
                      <th className="text-left text-[10px] font-bold uppercase text-slate-400 pb-2 w-28">
                        Presión (PSI)
                      </th>
                      <th className="text-center text-[10px] font-bold uppercase text-slate-400 pb-2 w-24">
                        Ajuste
                      </th>
                      <th className="text-left text-[10px] font-bold uppercase text-slate-400 pb-2 w-28">
                        Ajustado (PSI)
                      </th>
                    </tr>
                  </thead>
                  <tbody className="space-y-1">
                    {pressures.map((llanta, idx) => {
                      // Solo renderizamos si la llanta pertenece a este eje
                      if (llanta.eje !== ejeNum) return null;

                      return (
                        <tr
                          key={`tire-row-${idx}`}
                          className="border-b border-slate-50 last:border-0"
                        >
                          <td className="py-2 pr-2">
                            <Select
                              value={llanta.posicion}
                              onValueChange={(val) =>
                                updateField(idx, "posicion", val)
                              }
                            >
                              <SelectTrigger className="h-9 text-xs border-slate-200">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {POSITIONS.map((p) => (
                                  <SelectItem
                                    key={p.value}
                                    value={p.value}
                                    className="text-xs"
                                  >
                                    {p.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </td>
                          <td className="py-2 px-2">
                            <div className="relative">
                              <Input
                                type="text"
                                inputMode="decimal"
                                value={llanta.presion_encontrada}
                                onChange={(e) =>
                                  handlePressureChange(
                                    idx,
                                    "presion_encontrada",
                                    e.target.value,
                                  )
                                }
                                className="h-9 text-sm font-bold text-center border-slate-200 pr-8"
                                placeholder="0"
                              />
                              <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-slate-400 font-medium">
                                PSI
                              </span>
                            </div>
                          </td>
                          <td className="py-2 px-2 text-center">
                            <Checkbox
                              checked={llanta._requiere_ajuste}
                              onCheckedChange={(val) =>
                                updateField(idx, "_requiere_ajuste", !!val)
                              }
                              className="h-5 w-5 rounded border-slate-300 data-[state=checked]:bg-blue-600"
                            />
                          </td>
                          <td className="py-2 px-2">
                            <div className="relative">
                              <Input
                                type="text"
                                inputMode="decimal"
                                value={llanta.presion_ajustada}
                                disabled={!llanta._requiere_ajuste}
                                onChange={(e) =>
                                  handlePressureChange(
                                    idx,
                                    "presion_ajustada",
                                    e.target.value,
                                  )
                                }
                                className={`h-9 text-sm font-bold text-center pr-8 transition-all ${
                                  llanta._requiere_ajuste
                                    ? "border-blue-200 bg-blue-50/50 text-blue-900"
                                    : "bg-slate-50 text-slate-300 border-slate-100"
                                }`}
                                placeholder={
                                  llanta._requiere_ajuste ? "0" : "---"
                                }
                              />
                              <span
                                className={`absolute right-2 top-1/2 -translate-y-1/2 text-[10px] font-medium ${llanta._requiere_ajuste ? "text-blue-400" : "text-slate-300"}`}
                              >
                                PSI
                              </span>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          );
        })}
      </div>



    </div>
  );
}
