"use client";
import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { OrderTemplateInput } from "@/lib/zod-schemas/order-template-schema";

interface ConditionDialogProps {
  setFormData: React.Dispatch<React.SetStateAction<OrderTemplateInput>>;
}

type ConditionItem = OrderTemplateInput["conditions"][number];

export default function ConditionDialog({ setFormData }: ConditionDialogProps) {
  const [open, setOpen] = useState(false);

  // Memoria temporal que está en el cuadro de diálogo y que se pasa al state principal
  const [newData, setNewData] = useState<ConditionItem>({
    label: "",
    default_value: "cumple",
    is_special: false,
    special_condition_label: "",
  });

  // FUNCIONES PARA CREAR, EDITAR O ELIMINAR UNA CONDICION AGREGADA
  const handleSave = () => {
    if (!newData.label.trim()) return;

    // 1. Guardamos en el estado del padre
    setFormData((prev: OrderTemplateInput) => ({
      ...prev,
      conditions: [
        ...prev.conditions,
        {
          ...newData,
          // Limpieza de seguridad: si no es especial, ignoramos el label de vehículo
          special_condition_label: newData.is_special ? newData.special_condition_label : "",
        },
      ],
    }));

    // 2. Cerramos el diálogo
    setOpen(false);

    // 3. RESETEAMOS los campos al estado inicial automático
    setNewData({
      label: "",
      default_value: "cumple",
      is_special: false,
      special_condition_label: "",
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={
<Button size="sm" className="gap-2">+ Adicionar Condicion</Button>
      }>
        
      </DialogTrigger>

      <DialogContent className="sm:max-w-125">
        <DialogHeader>
          <DialogTitle>Nueva Condición de Inspección</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Label de la condición */}
          <div className="space-y-2">
            <Label className="text-sm font-bold">Descripción de la Condición</Label>
            <Textarea
              placeholder="Ej: El vehículo debe ingresar sin carga pesada..."
              className="min-h-20 resize-none"
              value={newData.label}
              onChange={(e) => setNewData({ ...newData, label: e.target.value })}
            />
          </div>

          {/* Sección del Switch - Ocupando el contenedor completo de forma limpia */}
          <div className="space-y-2">
            <Label className="text-[11px] uppercase font-bold text-muted-foreground">
              Configuración de Aplicación
            </Label>
            <div className="flex items-center gap-3 p-3 rounded-md border border-dashed h-12 bg-slate-50/50">
              <Switch
                id="dialog-special"
                checked={newData.is_special}
                onCheckedChange={(checked) => {
                  setNewData({
                    ...newData,
                    is_special: checked,
                    // CAMBIO CLAVE: Cambia dinámicamente el valor por defecto según el estado del switch
                    default_value: checked ? "no_aplica" : "cumple",
                  });
                }}
              />
              <div className="flex flex-col">
                <Label htmlFor="dialog-special" className="text-xs font-bold cursor-pointer">
                  ¿Es Especial?
                </Label>
                <span className="text-[10px] text-muted-foreground">
                  {newData.is_special 
                    ? "Valor por defecto automatizado a 'No Aplica'" 
                    : "Valor por defecto automatizado a 'Cumple'"}
                </span>
              </div>
            </div>
          </div>

          {/* Campo adicional si es especial */}
          {newData.is_special && (
            <div className="space-y-2 pt-2 border-t animate-in fade-in slide-in-from-top-2">
              <Label className="text-sm font-bold">¿A quién aplica?</Label>
              <Input
                placeholder="Ej: Solo vehículos 4x4"
                value={newData.special_condition_label}
                onChange={(e) => setNewData({ ...newData, special_condition_label: e.target.value })}
              />
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
          <Button onClick={handleSave} disabled={!newData.label.trim()}>
            Guardar Condición
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}