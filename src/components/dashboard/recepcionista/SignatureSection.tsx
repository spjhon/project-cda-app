"use client";

import { useRef, useState } from "react";
import Signature, { SignatureCanvasRef } from "@uiw/react-signature/canvas";
import { Checkbox } from "@/components/ui/checkbox";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  PenTool,
  FileText,
  Trash2,
  CheckCircle2,
  ScrollText,
} from "lucide-react";
import { OrderTemplateSignature } from "@/lib/server-actions/fetch_orders_templates";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ZodFullFormDataType } from "@/lib/zod-schemas/order-schema";

interface SignatureSectionProps {
  signatures: OrderTemplateSignature[] | undefined;
  setFormData: React.Dispatch<React.SetStateAction<ZodFullFormDataType>>;
  contractText: string | undefined;
  selectedTemplate: boolean;
  hayPlaca: boolean
}

export default function SignatureSection({
  signatures,
  contractText,
  setFormData,
  selectedTemplate,
  hayPlaca
}: SignatureSectionProps) {
  // Referencias individuales para cada canvas de firma
  const canvasRefs = useRef<Record<string, SignatureCanvasRef | null>>({});

  // Estado local para los checks de declaraciones (UI)
  const [acceptedDeclarations, setAcceptedDeclarations] = useState<Record<string, boolean>>({});

  

  const handleSignatureUpdate = (
    pointsData: number[][],
    templateSigId: string,
  ) => {
    if (pointsData.length === 0) return;

    // Buscamos el canvas específico usando el ID
    const signatureRef = canvasRefs.current[templateSigId];
    const canvas = signatureRef?.canvas;

    if (canvas) {
      // Creamos un canvas temporal del mismo tamaño para no ensuciar el original
      const tempCanvas = document.createElement("canvas");
      tempCanvas.width = canvas.width;
      tempCanvas.height = canvas.height;
      const ctx = tempCanvas.getContext("2d");

      if (ctx) {
        // Pintamos el fondo de blanco (esto elimina la transparencia)
        ctx.fillStyle = "#FFFFFF";
        ctx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);

        // Dibujamos la firma encima del fondo blanco
        ctx.drawImage(canvas, 0, 0);

        // Exportamos desde el canvas temporal como JPEG
        // 0.4 es un excelente balance entre peso y legibilidad para firmas
        const base64 = tempCanvas.toDataURL("image/jpeg", 0.4);

        // ACTUALIZACIÓN SIMPLIFICADA
        setFormData((prev) => ({
          ...prev,
          signatures: prev.signatures.map(
            (sig) =>
              sig.template_signature_id === templateSigId
                ? { ...sig, signature_url: base64 } // Si es el ID, actualizamos solo la URL
                : sig, // Si no, lo dejamos igual
          ),
        }));
      }
    }
  };

  const clearAll = (sigId: string) => {
    // 1. Limpiamos visualmente el canvas
    const target = canvasRefs.current[sigId];
    if (target) {
      target.clear();
    }

    // 2. Limpiamos el dato en el state principal
    setFormData((prev) => ({
      ...prev,
      signatures: prev.signatures.map((sig) =>
        sig.template_signature_id === sigId
          ? { ...sig, signature_url: "" } // Reseteamos la URL a vacío
          : sig,
      ),
    }));
  };

  //Esta línea crea un ID único combinando el ID de la firma y el ID de la declaración.
  //Así, el estado sabe exactamente cuál checkbox se está marcando.
  //al comienzo el state de acceptedDeclarations esta vacio y se va llenando a medida que se van haciendo check
  const toggleLocalCheck = (sigId: string, decId: string) => {
    const key = `${sigId}-${decId}`;
    //Invierte el valor. Si era undefined o false (no marcado), lo vuelve true. Si ya era true, lo vuelve false.
    setAcceptedDeclarations((prev) => ({ ...prev, [key]: !prev[key] }));
    canvasRefs.current[sigId]?.clear();
    clearAll(sigId);
  };


return (
  <fieldset
    className={`mt-2 transition-all duration-500 ${
      selectedTemplate && hayPlaca
        ? "opacity-100"
        : "opacity-40 pointer-events-none translate-y-4"
    }`}
  >
    <div className="border-t border-border pt-6">
      <legend className="text-xs font-bold uppercase text-muted-foreground tracking-widest my-5">
        8. Autorización y Firmas Digitales
      </legend>

      <div className="space-y-6">
        {/* --- BLOQUE DE CONTRATO FIJO --- */}
        <div className="bg-muted border border-border rounded-xl p-4 flex items-center justify-center gap-10 transition-all hover:bg-muted/80">
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Checkbox
              id="fixed-contract"
              checked={!!acceptedDeclarations["contrato-general"]}
              onCheckedChange={(checked: boolean) => {
                setAcceptedDeclarations((prev) => ({
                  ...prev,
                  ["contrato-general"]: checked,
                }));

                if (!checked) {
                  Object.values(canvasRefs.current).forEach((canvas) => {
                    canvas?.clear();
                  });

                  setFormData((prev) => ({
                    ...prev,
                    signatures: prev.signatures.map((sig) => ({
                      ...sig,
                      signature_url: "",
                    })),
                  }));
                }
              }}
              className="h-10 w-10 border-border data-[state=checked]:bg-primary data-[state=checked]:border-primary"
            />

            <div className="space-y-0.5">
              <Label
                htmlFor="fixed-contract"
                className="text-[20px] font-bold text-foreground cursor-pointer uppercase tracking-tight"
              >
                Acepto los términos del contrato de prestación de servicios
              </Label>

              <Dialog>
                <DialogTrigger
                  render={
                    <button className="flex items-center gap-1 text-[20px] font-bold text-primary hover:text-primary/80 transition-colors uppercase tracking-widest">
                      <ScrollText className="h-9 w-9" />
                      Ver Condiciones Contractuales
                    </button>
                  }
                />

                <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
                  <DialogHeader className="border-b border-border pb-4">
                    <DialogTitle className="text-sm font-bold uppercase tracking-tighter flex items-center gap-2">
                      <FileText className="h-4 w-4 text-primary" />
                      Contrato de Servicios CDA
                    </DialogTitle>
                  </DialogHeader>

                  <div className="flex-1 overflow-y-auto py-6 px-2">
                    <div className="text-[13px] text-muted-foreground leading-relaxed whitespace-pre-wrap font-medium">
                      {contractText ||
                        "Cargando términos contractuales..."}
                    </div>
                  </div>

                  <div className="border-t border-border pt-4 flex justify-end">
                    <DialogClose
                      render={
                        <Button
                          type="button"
                          className="bg-primary text-primary-foreground text-[10px] font-bold uppercase px-8"
                          onClick={() => {
                            if (
                              !acceptedDeclarations[
                                "contrato-general"
                              ]
                            ) {
                              setAcceptedDeclarations((prev) => ({
                                ...prev,
                                ["contrato-general"]: true,
                              }));
                            }
                          }}
                        >
                          Entendido y Acepto
                        </Button>
                      }
                    />
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            <div
              className={`transition-opacity duration-300 ${
                acceptedDeclarations["contrato-general"]
                  ? "opacity-100"
                  : "opacity-20"
              }`}
            >
              <CheckCircle2 className="h-10 w-10 text-emerald-600 dark:text-emerald-400" />
            </div>
          </div>
        </div>

        {signatures?.map((signature) => {
          const allChecked = signature.declarations.every(
            (dec) =>
              acceptedDeclarations[
                `${signature.id}-${dec.id}`
              ] &&
              acceptedDeclarations["contrato-general"]
          );

          return (
            <Card
              key={signature.id}
              className="border-border shadow-sm overflow-hidden bg-card"
            >
              <div className="p-0">
                <div className="bg-muted/60 p-4 border-b border-border flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary rounded-lg text-primary-foreground">
                      <PenTool className="h-4 w-4" />
                    </div>

                    <div>
                      <h3 className="text-sm font-bold text-foreground uppercase tracking-tight">
                        {signature.signature_label}
                      </h3>

                      <p className="text-[9px] text-muted-foreground font-medium uppercase italic">
                        Documento legal:{" "}
                        {signature.representative_type}
                      </p>
                    </div>
                  </div>

                  {allChecked && (
                    <div className="flex items-center gap-1.5 px-2 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-md">
                      <CheckCircle2 className="h-3 w-3 text-emerald-600 dark:text-emerald-400" />

                      <span className="text-[9px] font-bold text-emerald-600 dark:text-emerald-400 uppercase">
                        Habilitado
                      </span>
                    </div>
                  )}
                </div>

                <div className="p-6 grid grid-cols-1 lg:grid-cols-5 gap-8">
                  <div className="lg:col-span-2 space-y-4">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <FileText className="h-3.5 w-3.5" />

                      <span className="text-[10px] font-bold uppercase tracking-wider">
                        Aceptación de términos
                      </span>
                    </div>

                    <div className="space-y-2">
                      {signature.declarations.map((dec) => {
                        const isChecked =
                          !!acceptedDeclarations[
                            `${signature.id}-${dec.id}`
                          ];

                        return (
                          <div
                            key={dec.id}
                            onClick={() =>
                              toggleLocalCheck(
                                signature.id,
                                dec.id
                              )
                            }
                            className={`flex items-start gap-3 p-3 rounded-lg border transition-all cursor-pointer select-none ${
                              isChecked
                                ? "border-primary/30 bg-primary/10"
                                : "border-border bg-muted/50 hover:bg-muted"
                            }`}
                          >
                            <Checkbox
                              checked={isChecked}
                              onCheckedChange={() =>
                                toggleLocalCheck(
                                  signature.id,
                                  dec.id
                                )
                              }
                              className="mt-0.5 border-border"
                            />

                            <Label className="text-[11px] font-medium leading-relaxed text-foreground cursor-pointer">
                              {dec.declaration_text}
                            </Label>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="lg:col-span-3 flex flex-col">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-[10px] font-bold uppercase text-muted-foreground tracking-wider">
                        Área de Captura
                      </span>

                      {allChecked && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            clearAll(signature.id)
                          }
                          className="h-7 text-destructive hover:bg-destructive/10 hover:text-destructive text-[10px] font-bold"
                        >
                          <Trash2 className="h-3 w-3 mr-1" />
                          REINICIAR
                        </Button>
                      )}
                    </div>

                    <div
                      className={`relative rounded-xl border-2 transition-all duration-300 w-99 m-auto ${
                        allChecked
                          ? "bg-card border-primary/20 shadow-sm border-dashed"
                          : "bg-muted border-border opacity-40 pointer-events-none"
                      }`}
                    >
                      <Signature
                        ref={(el) => {
                          canvasRefs.current[signature.id] = el;
                        }}
                        height={200}
                        width={390}
                        style={{
                          margin: "auto",
                          width: "auto",
                          height: "auto",
                          border: "1px solid hsl(var(--border))",
                        }}
                        onPointer={(points) =>
                          handleSignatureUpdate(
                            points,
                            signature.id
                          )
                        }
                      />

                      {!allChecked && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground gap-2">
                          <PenTool className="h-5 w-5 opacity-20" />

                          <p className="text-[9px] font-bold uppercase tracking-widest">
                            Bloqueado hasta aceptar términos
                          </p>
                        </div>
                      )}

                      {allChecked && (
                        <div className="absolute bottom-6 left-10 right-10 border-b border-border pointer-events-none" />
                      )}
                    </div>

                    <p className="mt-2 text-[9px] text-center text-muted-foreground font-medium">
                      La firma capturada será vinculada automáticamente al
                      reporte de inspección.
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  </fieldset>
);
}
