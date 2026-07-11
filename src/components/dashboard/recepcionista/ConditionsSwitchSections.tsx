"use client";

import { useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { ShieldAlert, CheckCircle2, XCircle, Ban } from "lucide-react";

import { OrderTemplateCondition } from "@/lib/server-actions/fetch_orders_templates";
import { ConditionResponse, ConditionResultEntry, ZodFullFormDataType } from "@/lib/zod-schemas/order-schema";

// ─── Tipos ─────────────────────────────────────────────────────────

interface ConditionsSectionProps {
  conditions: OrderTemplateCondition[] | undefined;
  results: ConditionResultEntry[]; // El array del state: formData.condition_results
  setFormData: React.Dispatch<React.SetStateAction<ZodFullFormDataType>>;
  selectedTemplate: boolean;
  hayPlaca: boolean;
}

export default function ConditionsSwitchSections({ conditions, results, setFormData, selectedTemplate, hayPlaca }: ConditionsSectionProps) {
  
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
    setFormData((prev: ZodFullFormDataType) => ({
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
    <fieldset className={`mt-2 transition-all duration-500 ${selectedTemplate && hayPlaca ? "opacity-100" : "opacity-40 pointer-events-none translate-y-4"}`}>
      <div className="border-t border-border pt-6">
        <legend className="text-xs font-bold uppercase text-muted-foreground tracking-widest my-5">
          7. Condiciones de Inspección
        </legend>

        <div className="bg-muted/40 border border-border rounded-xl p-6 space-y-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 rounded-xl bg-foreground text-background shadow-xs">
              <ShieldAlert className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-xl font-black tracking-tight text-foreground uppercase">
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
                    rounded-xl border transition-all duration-200 px-5 py-5 shadow-xs
                    ${isNoAplica ? "bg-muted/60 border-border opacity-80" : 
                      cumple ? "bg-emerald-500/5 border-emerald-500/20" : 
                      "bg-destructive/5 border-destructive/20"}
                  `}
                >
                  <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                    <div className="flex gap-4 flex-1">
                      <div className={`shrink-0 flex h-12 w-12 items-center justify-center rounded-xl border-2
                        ${isNoAplica ? "bg-muted border-muted-foreground/20 text-muted-foreground" : 
                          cumple ? "bg-background border-emerald-500 text-emerald-600" : 
                          "bg-background border-destructive text-destructive shadow-xs"}
                      `}>
                        {isNoAplica ? <Ban className="h-6 w-6" /> : 
                         cumple ? <CheckCircle2 className="h-6 w-6" /> : 
                         <XCircle className="h-6 w-6" />}
                      </div>

                      <div className="space-y-2">
                        {condition.is_special && (
                          <Badge variant="secondary" className="text-[9px] uppercase tracking-widest px-2 py-0.5 font-bold">
                            {condition.special_condition_label}
                          </Badge>
                        )}
                        <h4 className={`text-sm font-black leading-tight ${isNoAplica ? "text-muted-foreground/60" : "text-foreground"}`}>
                          {condition.label}
                        </h4>
                      </div>
                    </div>

                    <div className="flex items-center gap-8 w-full md:w-auto justify-between md:justify-end">
                      <div className="flex items-center gap-4">
                        <span className={`text-[10px] font-black uppercase ${!isNoAplica && !cumple ? "text-destructive" : "text-muted-foreground"}`}>
                          Falla
                        </span>
                        <Switch
                          disabled={isNoAplica}
                          checked={cumple}
                          onCheckedChange={(val) => 
                            updateConditionValue(condition.id, val ? "cumple" : "no_cumple")
                          }
                          className="scale-150 mx-2 data-[state=checked]:bg-emerald-600 data-[state=unchecked]:bg-destructive disabled:opacity-20"
                        />
                        <span className={`text-[10px] font-black uppercase ${!isNoAplica && cumple ? "text-emerald-600" : "text-muted-foreground"}`}>
                          Cumple
                        </span>
                      </div>

                      {condition.is_special && (
                        <Label className={`flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all
                            ${isNoAplica ? "bg-foreground border-foreground text-background" : 
                              "bg-background border-border text-muted-foreground hover:border-muted-foreground/40"}
                          `}>
                          <Checkbox
                            checked={isNoAplica}
                            onCheckedChange={(checked) => 
                              updateConditionValue(condition.id, checked ? "no_aplica" : "cumple")
                            }
                            className={`h-5 w-5 ${isNoAplica ? "border-background data-[state=checked]:bg-background data-[state=checked]:text-foreground" : ""}`}
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
    </fieldset>
  );
}