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
import {
  Select,
  SelectContent,

  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { OrderTemplateInput } from "@/lib/zod-schemas/order-template-schema";

interface ConditionDialogProps {
  
 setFormData: React.Dispatch<React.SetStateAction<OrderTemplateInput>>;
}


type ConditionItem = OrderTemplateInput["conditions"][number];


// Definimos las opciones para el Select siguiendo tu estructura
const CONDITION_OPTIONS = [
  { label: "Cumple", value: "cumple" },
  { label: "No Cumple", value: "no_cumple" },
  { label: "No Aplica", value: "no_aplica" },
];


export default function ConditionDialog({  setFormData }: ConditionDialogProps) {


  const [open, setOpen] = useState(false);

//Memoria temporal que esta en el cuadro de dialogo y que se pasa al state principal
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
    ]
  }));

  // 2. Cerramos el diálogo
  setOpen(false);

  // 3. RESETEAMOS los campos al estado inicial
  setNewData({
    label: "",
    default_value: "cumple",
    is_special: false,
    special_condition_label: "",
  });
};


  

  return (

    <Dialog open={open} onOpenChange={setOpen}>



      <DialogTrigger render={<Button size="sm" className="gap-2">+ Adicionar Condicion</Button>}/>



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

          <div className="grid grid-cols-2 gap-4">
            {/* Valor por defecto */}
            <div className="space-y-2">

              <Label className="text-[11px] uppercase font-bold text-muted-foreground">
                Valor por Defecto
              </Label>

              <Select
								items={CONDITION_OPTIONS}
								value={newData.default_value}
								onValueChange={(val) =>
									setNewData({
										...newData,
										default_value: val ? (val as ConditionItem["default_value"]) : "cumple",
									})
								}
							 	>
								<SelectTrigger className="h-10">
									<SelectValue placeholder="Seleccione un valor" />
								</SelectTrigger>
								
								<SelectContent>
									{/* Mapeamos explícitamente las opciones aquí. 
										Esto asegura que Radix encuentre los items dentro del Content.
									*/}
									{CONDITION_OPTIONS.map((option) => (
										<SelectItem key={option.value} value={option.value}>
											{option.label}
										</SelectItem>
									))}
								</SelectContent>
							</Select>



            </div>

            {/* Switch Especial */}
            <div className="flex flex-col justify-end gap-2">
              <div className="flex items-center gap-3 p-2 rounded-md border border-dashed h-10">
                <Switch
                  id="dialog-special"
                  checked={newData.is_special}
                  onCheckedChange={(checked) => setNewData({ ...newData, is_special: checked })}
                />
                <Label htmlFor="dialog-special" className="text-xs font-medium cursor-pointer">
                  ¿Es Especial?
                </Label>
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
          <Button onClick={handleSave} disabled={!newData.label}>
            Guardar Condición
          </Button>
        </DialogFooter>


      </DialogContent>
    </Dialog>
  );
}