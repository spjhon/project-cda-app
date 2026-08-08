"use client";

import { useRef, useState, useCallback } from "react";
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
  formData: ZodFullFormDataType;
  contractText: string | undefined;
  selectedTemplate: boolean;
  hayPlaca: boolean;
}

export default function SignatureSection({
  signatures,
  contractText,
  setFormData,
  selectedTemplate,
  hayPlaca,
  formData,
}: SignatureSectionProps) {
  const [acceptedDeclarations, setAcceptedDeclarations] = useState<
    Record<string, boolean>
  >({});

  const toggleLocalCheck = (sigId: string, decId: string) => {
    const key = `${sigId}-${decId}`;
    setAcceptedDeclarations((prev) => ({ ...prev, [key]: !prev[key] }));

    setFormData((prev) => ({
      ...prev,
      signatures: prev.signatures.map((sig) =>
        sig.template_signature_id === sigId
          ? { ...sig, signature_url: "" }
          : sig,
      ),
    }));
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
                      <button className="flex items-center gap-1 text-[20px] font-bold text-primary hover:text-primary/80 transition-colors uppercase tracking-widest cursor-pointer">
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
                        {contractText || "Cargando términos contractuales..."}
                      </div>
                    </div>

                    <div className="border-t border-border pt-4 flex justify-end">
                      <DialogClose
                        render={
                          <Button
                            type="button"
                            className="bg-primary text-primary-foreground text-[10px] font-bold uppercase px-8"
                            onClick={() => {
                              if (!acceptedDeclarations["contrato-general"]) {
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

          {/* --- TARJETAS INDIVIDUALES --- */}
          {signatures?.map((signature) => (
            <SignatureCardItem
              key={signature.id}
              signature={signature}
              acceptedDeclarations={acceptedDeclarations}
              toggleLocalCheck={toggleLocalCheck}
              setFormData={setFormData}
              formData={formData}
            />
          ))}
        </div>
      </div>
    </fieldset>
  );
}

{/* --- SUBCOMPONENTE INDIVIDUAL OPTIMIZADO PARA MAXIMUM PERFORMANCE --- */}

interface SignatureCardItemProps {
  signature: OrderTemplateSignature;
  acceptedDeclarations: Record<string, boolean>;
  toggleLocalCheck: (sigId: string, decId: string) => void;
  setFormData: React.Dispatch<React.SetStateAction<ZodFullFormDataType>>;
  formData: ZodFullFormDataType;
}

function SignatureCardItem({
  signature,
  acceptedDeclarations,
  toggleLocalCheck,
  setFormData,
  formData,
}: SignatureCardItemProps) {
  const [size, setSize] = useState({ width: 0, height: 0 });
  const canvasRef = useRef<SignatureCanvasRef | null>(null);

  const allChecked = signature.declarations.every(
    (dec) =>
      acceptedDeclarations[`${signature.id}-${dec.id}`] &&
      acceptedDeclarations["contrato-general"],
  );

  // Búsqueda por ID seguro
  const currentSignature = formData.signatures.find(
    (s) => s.template_signature_id === signature.id,
  );

  // Callback Ref para medir contenedor dinámicamente
  const containerRef = useCallback((node: HTMLDivElement | null) => {
    if (!node) return;

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;

        if (width > 0 && height > 0) {
          setSize({
            width: Math.floor(width),
            height: Math.floor(height),
          });
        }
      }
    });

    observer.observe(node);

    return () => observer.disconnect();
  }, []);

  // 🚀 EXTRAE LA IMAGEN Y ACTUALIZA EL STATE SOLO AL DAR CLIC EN "GUARDAR Y CERRAR"
  const handleSaveAndClose = () => {
    const canvas = canvasRef.current?.canvas;

    if (canvas) {
      const tempCanvas = document.createElement("canvas");
      tempCanvas.width = canvas.width;
      tempCanvas.height = canvas.height;
      const ctx = tempCanvas.getContext("2d");

      if (ctx) {
        ctx.fillStyle = "#FFFFFF";
        ctx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
        ctx.drawImage(canvas, 0, 0);

        const base64 = tempCanvas.toDataURL("image/jpeg", 0.4);

        setFormData((prev) => ({
          ...prev,
          signatures: prev.signatures.map((sig) =>
            sig.template_signature_id === signature.id
              ? { ...sig, signature_url: base64 }
              : sig,
          ),
        }));
      }
    }
  };

  const handleClear = () => {
    canvasRef.current?.clear();
    setFormData((prev) => ({
      ...prev,
      signatures: prev.signatures.map((sig) =>
        sig.template_signature_id === signature.id
          ? { ...sig, signature_url: "" }
          : sig,
      ),
    }));
  };

  return (
    <Card className="border-border shadow-sm overflow-hidden bg-card">
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
                Documento legal: {signature.representative_type}
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
                  !!acceptedDeclarations[`${signature.id}-${dec.id}`];

                return (
                  <div
                    key={dec.id}
                    onClick={() => toggleLocalCheck(signature.id, dec.id)}
                    className={`flex items-start gap-3 p-3 rounded-lg border transition-all cursor-pointer select-none ${
                      isChecked
                        ? "border-primary/30 bg-primary/10"
                        : "border-border bg-muted/50 hover:bg-muted"
                    }`}
                  >
                    <Checkbox
                      checked={isChecked}
                      onCheckedChange={() =>
                        toggleLocalCheck(signature.id, dec.id)
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

          <div className="lg:col-span-3">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] font-bold uppercase text-muted-foreground tracking-wider">
                Área de Captura
              </span>
            </div>

            <div className="relative rounded-xl border-2 transition-all duration-300 w-full m-auto">
              <Dialog>
                <DialogTrigger
                  render={
                    <Button
                      type="button"
                      disabled={!allChecked}
                      className="w-full h-28 border-2 border-dashed border-primary/30 hover:border-primary bg-primary/5 hover:bg-primary/10 text-primary font-bold uppercase tracking-wider flex flex-col items-center justify-center gap-2 rounded-xl transition-all disabled:opacity-40 disabled:pointer-events-none cursor-pointer"
                    >
                      <PenTool className="h-6 w-6" />
                      <span className="text-xs">Capturar Firma</span>
                    </Button>
                  }
                />

                <DialogContent
                  className="h-[98dvh] flex flex-col items-center justify-center p-0 overflow-hidden"
                  style={{ maxWidth: "98vw" }}
                  showCloseButton={false}
                >
                  <DialogHeader className="w-full mb-2 shrink-0 px-4 pt-4 flex flex-row items-center justify-between">
                    <DialogTitle className="text-sm font-bold uppercase tracking-tight flex items-center gap-2">
                      <PenTool className="h-4 w-4 text-primary" />
                      Captura de Firma - {signature.signature_label}
                    </DialogTitle>
                  </DialogHeader>

                  <div
                    className="w-full h-full border border-red-600 rounded-lg bg-card overflow-hidden"
                    ref={containerRef}
                  >
                    {size.width > 0 && size.height > 0 && (
                      <Signature
                        options={{ size: 10 }}
                        ref={canvasRef}
                        width={size.width}
                        height={size.height}
                      />
                    )}
                  </div>

                  {/* Barra flotante inferior */}
                  <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 p-1.5 rounded-full bg-background/80 backdrop-blur-md border border-border shadow-2xl">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={handleClear}
                      className="h-9 px-4 text-destructive hover:bg-destructive/10 rounded-full text-xs font-bold uppercase transition-all"
                    >
                      <Trash2 className="h-3.5 w-3.5 mr-1.5" />
                      Limpiar
                    </Button>

                    <div className="h-4 w-px bg-border" />

                    <DialogClose
                      render={
                        <Button
                          type="button"
                          size="sm"
                          onClick={handleSaveAndClose}
                          className="h-9 px-6 bg-primary text-primary-foreground hover:bg-primary/90 rounded-full text-xs font-bold uppercase tracking-wider shadow-md transition-all active:scale-95"
                        >
                          Guardar y Cerrar
                        </Button>
                      }
                    />
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            <p className="mt-2 text-[9px] text-center text-muted-foreground font-medium">
              La firma capturada será vinculada automáticamente al reporte de
              inspección.
            </p>
          </div>

          <div className="lg:col-span-5 mt-2">
            {currentSignature?.signature_url ? (
              <div className="w-full border-2 border-primary/20 rounded-xl bg-white/50 p-6 flex items-center justify-center shadow-sm hover:shadow-md transition-shadow min-h-[180px]">
                <img
                  src={currentSignature.signature_url}
                  alt={`Firma ${signature.signature_label}`}
                  className="w-full max-h-[250px] object-contain"
                />
              </div>
            ) : (
              <div className="w-full border-2 border-dashed border-muted-foreground/30 rounded-xl bg-muted/20 p-10 flex flex-col items-center justify-center min-h-[180px] transition-all">
                <PenTool className="h-14 w-14 text-muted-foreground/30 mb-3" />
                <span className="text-xl font-bold text-muted-foreground/50 uppercase tracking-wider">
                  Sin firma capturada
                </span>
                <span className="text-sm text-muted-foreground/40 mt-2">
                  Complete los términos y capture su firma
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}