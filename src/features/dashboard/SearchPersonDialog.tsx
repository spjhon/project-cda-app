"use client";

import React, { useState } from "react";
import { Search, Loader2, CheckCircle2, XCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TipoDocumentoType } from "@/lib/zod-schemas/order-schema";
import { ID_DOCUMENT_OPTIONS } from "./PersonSection";






interface SearchPersonDialogProps {
  currentDocumentType: TipoDocumentoType;
  currentDocumentNumber: string;

  disabled?: boolean;

  onUpdate: (data: {
    tipo_documento: TipoDocumentoType;
    numero_documento: string;
    foundData?: {
      nombre_completo?: string;
      telefono?: string;
      correo?: string;
      direccion?: string;
    };
  }) => void;
}







type SearchState = "idle" | "loading" | "found" | "not_found";



export const SearchPersonDialog = ({currentDocumentType, currentDocumentNumber, onUpdate, disabled,}: SearchPersonDialogProps) => {


  //state para el dialog
  const [open, setOpen] = useState(false);


  //state para el tipo de documento, si ya viene desde el front se deja ese, sino por defecto va con cedulas
  const [documentType, setDocumentType] = useState<TipoDocumentoType>(currentDocumentType || "cedula_ciudadania");

  //state para el numero de documento que viene del front, sino se deja vacio listo para llenar por el usuariio
  const [documentNumber, setDocumentNumber] = useState(currentDocumentNumber || "");


  //este es el state para el input de busqueda
  const [searchState, setSearchState] =useState<SearchState>("idle");

  //y el meensaje de exito o fracado y se inicializa en vacio ya que no hay mensaje hasta que se haga alguna busqueda
  const [message, setMessage] = useState("");




	const handleOpenChange = (value: boolean) => {
		setOpen(value);

		if (value) {
			setDocumentType(currentDocumentType || "cedula_ciudadania");
			setDocumentNumber(currentDocumentNumber || "");

			setSearchState("idle");
			setMessage("");
		}
	};







  const handleSubmit = async () => {

    try {
      setSearchState("loading");
      setMessage("");

      // Simulación temporal
      console.log({
        tipo_documento: documentType,
        numero_documento: documentNumber,
      });

      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Simulación encontrada / no encontrada
      const found = Math.random() > 0.5;

      if (found) {


        setSearchState("found");
        setMessage("Persona encontrada correctamente.");

        onUpdate({
          tipo_documento: documentType,
          numero_documento: documentNumber,
          foundData: {
            nombre_completo: "JUAN PABLO PEREZ",
            telefono: "3101234567",
            correo: "juan@email.com",
            direccion: "CALLE 10 #20-30",
          },
        });

      } else {

        setSearchState("not_found");
        setMessage("No se encontró información. Puedes continuar el registro manualmente.");

        // IMPORTANTE:
        // Aún actualiza el state externo con la cédula
        onUpdate({
          tipo_documento: documentType,
          numero_documento: documentNumber,
        });
      }
    } catch (error) {
      console.log(error);

      setSearchState("not_found");
      setMessage("Ocurrió un error en la búsqueda.");
    }


  };







	//apenas se le de al boton de aceptar despues de la consulta, se sierra el cuadro de dialogo, se quita el mensaje y se deja el search en idle
  const handleAccept = () => {
    setOpen(false);

    setSearchState("idle");
    setMessage("");
  };





  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>


			<DialogTrigger render={
				<Button
					type="button"
					variant="outline"
					disabled={disabled}
					className="w-full h-11 flex items-center justify-center gap-2 font-semibold"
					>
					<Search className="h-4 w-4" />

					<span>Buscar Persona</span>
				</Button>
			}/>
        
      



      <DialogContent className="sm:max-w-md">


        <DialogHeader>

          <DialogTitle>
            Buscar Persona
          </DialogTitle>

          <DialogDescription>
            Busca automáticamente información del cliente.
          </DialogDescription>

        </DialogHeader>

        <div className="space-y-5 pt-2">


          {/* CONTROLES SUPERIORES */}
					{/**Actualiza un state local para ser enviado al state principal al hacer submit */}
          <div className="space-y-2">
            <Label className="text-[11px] font-bold uppercase text-slate-500">
              Tipo Documento
            </Label>

            <Select
              items={ID_DOCUMENT_OPTIONS}
              value={documentType}
              onValueChange={(v) =>
                setDocumentType(v ? v : "cedula_ciudadania")
              }
            >
              <SelectTrigger className="h-11">
                <SelectValue placeholder="Seleccione tipo" />
              </SelectTrigger>

              <SelectContent>
                {ID_DOCUMENT_OPTIONS.map((option) => (
                  <SelectItem
                    key={option.value}
                    value={option.value}
                  >
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>



          <div className="space-y-2">
            <Label className="text-[11px] font-bold uppercase text-slate-500">
              Número Documento
            </Label>

            <Input
              className="h-11"
              placeholder="Ej: 10203040"
              value={documentNumber}
              onChange={(e) =>
                setDocumentNumber(e.target.value)
              }
            />
          </div>



          <Button
            type="button"
            onClick={handleSubmit}
            disabled={
							//En este disables, estamos diciendo que no este disponible sino hasta que se haya puesdo un numero y un tipo, sino no se puede
              searchState === "loading" ||
              !documentType ||
              !documentNumber
            }
            className="w-full h-11"
           >
            {searchState === "loading" ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Buscando...
              </>
            ) : (
              <>
                <Search className="h-4 w-4" />
                Buscar
              </>
            )}
          </Button>



          {/* RESULTADO */}
          {searchState !== "idle" && (


            <div className="border rounded-xl p-4 bg-slate-50 space-y-4">

              {searchState === "loading" && (
                <div className="flex items-center gap-3 text-sm text-slate-600">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Consultando información...
                </div>
              )}


              {searchState === "found" && (
                <div className="space-y-4">
                  <div className="flex items-start gap-3 text-sm text-emerald-700">
                    <CheckCircle2 className="h-5 w-5 shrink-0" />

                    <span>{message}</span>
                  </div>

                  <Button
                    type="button"
                    onClick={handleAccept}
                    className="w-full"
                  >
                    Aceptar
                  </Button>
                </div>
              )}


              {searchState === "not_found" && (
                <div className="space-y-4">
                  <div className="flex items-start gap-3 text-sm text-amber-700">
                    <XCircle className="h-5 w-5 shrink-0" />

                    <span>{message}</span>
                  </div>

                  <Button
                    type="button"
                    onClick={handleAccept}
                    className="w-full"
                  >
                    Aceptar
                  </Button>
                </div>
              )}

							
            </div>


          )}



        </div>


      </DialogContent>
    </Dialog>
  );
};