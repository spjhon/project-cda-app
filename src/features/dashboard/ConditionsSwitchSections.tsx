"use client";

import { useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { ShieldAlert, CheckCircle2, XCircle, Ban } from "lucide-react";
import { FullFormData, ConditionResponse, ConditionResultEntry, } from "@/app/[tenant]/dashboard/recepcionista/page";
import { OrderTemplateCondition } from "@/lib/dbFunctions/fetch_orders_templates";

// ─── Tipos ─────────────────────────────────────────────────────────

interface ConditionsSectionProps {
  conditions: OrderTemplateCondition[] | undefined;
  results: ConditionResultEntry[]; // El array del state: formData.condition_results
  setFormData: React.Dispatch<React.SetStateAction<FullFormData>>;
}

export default function ConditionsSwitchSections({ conditions, results, setFormData }: ConditionsSectionProps) {
  
  // Ordenar para que las especiales aparezcan primero, igual que antes
  const orderedConditions = useMemo(() => {
    return [...(conditions ?? [])].sort((a, b) => {
      if (a.is_special && !b.is_special) return -1;
      if (!a.is_special && b.is_special) return 1;
      return 0;
    });
  }, [conditions]);

  // ─── Manejadores de Estado ─────────────────────────────────────

  const updateConditionValue = (id: string, newValue: ConditionResponse) => {
    setFormData((prev: FullFormData) => ({
      ...prev,
      // Usamos el mismo patrón de .map con el objeto previo
      condition_results: prev.condition_results.map((item) =>
        item.template_condition_id === id 
          ? { ...item, value: newValue } 
          : item
      ),
    }));
  };

  return (
    <div className="mt-2">
      <div className="border-t pt-6">
        <legend className="text-xs font-bold uppercase text-slate-400 tracking-widest my-5">
          5. Condiciones de Inspección
        </legend>

        <div className="bg-slate-50/80 border rounded-xl p-6 space-y-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 rounded-xl bg-slate-900 text-white shadow-lg shadow-slate-200">
              <ShieldAlert className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-xl font-black tracking-tight text-slate-900 uppercase">
                Condiciones de Recepción
              </h2>
            </div>
          </div>

          <div className="space-y-3">
            {orderedConditions.map((condition) => {
              // Buscamos el valor actual dentro del array 'results' que viene por props
              const currentResult = results.find(
                (r) => r.template_condition_id === condition.id
              );
              
              const value = currentResult?.value ?? condition.default_value;
              const isNoAplica = value === "no_aplica";
              const cumple = value === "cumple";

              return (
                <Card
                  key={condition.id}
                  className={`
                    rounded-xl border transition-all duration-200 px-5 py-5 
                    ${isNoAplica ? "bg-slate-100 border-slate-300 opacity-90" : 
                      cumple ? "bg-emerald-50 border-emerald-200 shadow-sm" : 
                      "bg-red-50 border-red-200 shadow-sm"}
                  `}
                >
                  <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                    <div className="flex gap-4 flex-1">
                      <div className={`shrink-0 flex h-12 w-12 items-center justify-center rounded-xl border-2
                        ${isNoAplica ? "bg-slate-200 border-slate-300 text-slate-500" : 
                          cumple ? "bg-white border-emerald-400 text-emerald-600" : 
                          "bg-white border-red-400 text-red-600 shadow-md"}
                      `}>
                        {isNoAplica ? <Ban className="h-6 w-6" /> : 
                         cumple ? <CheckCircle2 className="h-6 w-6" /> : 
                         <XCircle className="h-6 w-6" />}
                      </div>

                      <div className="space-y-2">
                        {condition.is_special && (
                          <Badge className="bg-slate-800 text-white border-none text-[9px] uppercase tracking-widest px-2 py-0.5">
                            {condition.special_condition_label}
                          </Badge>
                        )}
                        <h4 className={`text-sm font-black leading-tight ${isNoAplica ? "text-slate-400" : "text-slate-800"}`}>
                          {condition.label}
                        </h4>
                      </div>
                    </div>

                    <div className="flex items-center gap-8 w-full md:w-auto justify-between md:justify-end">
                      <div className="flex items-center gap-4">
                        <span className={`text-[10px] font-black uppercase ${!isNoAplica && !cumple ? "text-red-600" : "text-slate-400"}`}>
                          Falla
                        </span>
                        <Switch
                          disabled={isNoAplica}
                          checked={cumple}
                          onCheckedChange={(val) => 
                            updateConditionValue(condition.id, val ? "cumple" : "no_cumple")
                          }
                          className="scale-150 mx-2 data-[state=checked]:bg-emerald-600 data-[state=unchecked]:bg-red-500 disabled:opacity-20"
                        />
                        <span className={`text-[10px] font-black uppercase ${!isNoAplica && cumple ? "text-emerald-600" : "text-slate-400"}`}>
                          Cumple
                        </span>
                      </div>

                      {condition.is_special && (
                        <Label className={`flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all
                            ${isNoAplica ? "bg-slate-800 border-slate-900 text-white" : 
                              "bg-white border-slate-200 text-slate-600 hover:border-slate-400"}
                          `}>
                          <Checkbox
                            checked={isNoAplica}
                            onCheckedChange={(checked) => 
                              updateConditionValue(condition.id, checked ? "no_aplica" : "cumple")
                            }
                            className={`h-5 w-5 ${isNoAplica ? "border-white data-[state=checked]:bg-white data-[state=checked]:text-slate-900" : ""}`}
                          />
                          <span className="text-[10px] font-black uppercase tracking-tighter select-none">
                            No aplica
                          </span>
                        </Label>
                      )}
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}