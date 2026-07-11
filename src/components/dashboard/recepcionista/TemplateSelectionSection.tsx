import { Label } from "@/components/ui/label";
import { Car, ClipboardCheck, FileText, Hash, ShieldCheck } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { OrderTemplate } from "@/lib/server-actions/fetch_orders_templates";
import { ZodFullFormDataType } from "@/lib/zod-schemas/order-schema";



//FUNCION GENERICA PARA EXTRAER ICONOS CON COLORES PERZONALIZADOS
const getTemplateIcon = (index: number) => {
  const icons = [
    <Car key="car" className="h-5 w-5 text-blue-500" />,
    <ClipboardCheck key="clip" className="h-5 w-5 text-indigo-500" />,
    <ShieldCheck key="shield" className="h-5 w-5 text-slate-500" />,
    <FileText key="file" className="h-5 w-5 text-emerald-500" />,
  ];
  return icons[index % icons.length];
};





// Interfaz principal para las Props del componente
export interface TemplateSelectionSectionProps {
  /** Listado de plantillas activas disponibles para el Tenant actual */
  activeTemplates: OrderTemplate[];
  
  /** ID de la plantilla seleccionada actualmente en el formData del Padre (puede ser un string o vacío) */
  plantilla_id: ZodFullFormDataType["plantilla_id"];
  
  /** * Handler del componente padre para actualizar el estado cuando se selecciona o deselecciona una plantilla
   * @param id El UUID de la plantilla afectada
   * @param isChecked Estado booleano del Checkbox (true si se seleccionó, false si se desmarcó)
   */
  handleTemplateSelect: (id: string, isChecked: boolean) => void;
}






export default function TemplateSelectionSection({activeTemplates, plantilla_id, handleTemplateSelect}: TemplateSelectionSectionProps) {






return (
  <fieldset>
    <legend className="text-xs font-bold uppercase text-muted-foreground tracking-widest my-5">
      1. Selección de Plantilla Técnica
    </legend>

    <div className="flex flex-wrap gap-3">
      {activeTemplates.map((template, index) => (
        <Label
          key={template.id}
          className={`group border-2 rounded-xl shadow-sm relative flex flex-col gap-3 p-4 cursor-pointer transition-all hover:border-primary/30 hover:bg-accent ${
            plantilla_id === template.id
              ? "border-primary bg-accent"
              : "border-border bg-card"
          }`}
        >
          <div className="flex justify-between items-center w-full">
            <div className="p-2 bg-card border border-border rounded-lg shadow-sm group-hover:border-primary/30">
              {getTemplateIcon(index)}
            </div>

            <Checkbox
              checked={plantilla_id === template.id}
              onCheckedChange={(checked) =>
                handleTemplateSelect(
                  template.id,
                  checked === true
                )
              }
              className="h-5 w-5 ml-4 rounded-full border-border data-[state=checked]:border-primary data-[state=checked]:bg-primary"
            />
          </div>

          <div className="space-y-1">
            <p className="text-sm font-bold text-foreground">
              {template.template_name}
            </p>

            <div className="flex flex-wrap gap-y-1 gap-x-3 pt-1">
              <span className="flex items-center text-[11px] text-muted-foreground gap-1">
                <Hash className="h-3 w-3" />
                Cod: {template.document_code}
              </span>

              <span className="text-[11px] text-muted-foreground font-medium">
                Version: {template.version}
              </span>
            </div>
          </div>
        </Label>
      ))}
    </div>
  </fieldset>
);
}





