"use client"

import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { useParams } from "next/navigation"

interface PqrsfFormData {
  tipoTramite: string
  nombreCompleto: string
  telefono: string
  correo: string
  placa: string
  descripcion: string
  habeasData: boolean
  honeypot: string
}

const tramitesDisponibles = [
  { label: "Petición", value: "peticion" },
  { label: "Queja", value: "queja" },
  { label: "Apelación", value: "apelacion" },
  { label: "Felicitación", value: "felicitacion" },
]

export default function PqrsfModal() {
  const params = useParams()
  const tenant = params.tenant?.toString() || ""

  const [open, setOpen] = useState(false)
  const [formData, setFormData] = useState<PqrsfFormData>({
    tipoTramite: "",
    nombreCompleto: "",
    telefono: "",
    correo: "",
    placa: "",
    descripcion: "",
    habeasData: false,
    honeypot: "",
  })

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSelectChange = (value: string | null) => {
    setFormData((prev) => ({
      ...prev,
      tipoTramite: value ?? "",
    }))
  }

  const handleCheckboxChange = (checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      habeasData: checked,
    }))
  }

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (formData.honeypot) return
    console.log("Datos listos para enviar para el tenant:", tenant, formData)
    // Aquí integras tu lógica de envío o RPC
    setOpen(false) // Opcional: cierra el modal tras un envío exitoso
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button className="w-full sm:w-auto h-12 bg-[#051923] dark:bg-[#00a6fb] text-white dark:text-[#051923] hover:bg-[#006494] dark:hover:bg-[#0582ca] text-sm font-bold tracking-tight rounded-xl px-10 shadow-md transition-all">
          Radicar una Solicitud Oficial
        </Button>}>
        
      </DialogTrigger>

      <DialogContent className="max-w-xl w-full max-h-[90vh] overflow-y-auto bg-white dark:bg-[#051923] border border-[#006494]/10 dark:border-[#00a6fb]/20 rounded-2xl p-6 md:p-8 shadow-lg">
        <DialogHeader className="mb-4 text-center sm:text-left">
          <DialogTitle className="text-2xl font-extrabold text-[#051923] dark:text-[#00a6fb] tracking-tight">
            Radicar Solicitud Oficial
          </DialogTitle>
          <DialogDescription className="text-sm font-normal text-[#003554]/70 dark:text-white/60 mt-1">
            Por favor completa todos los campos obligatorios para dar trámite a tu requerimiento en cdApp.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={onSubmit} className="space-y-5">
          {/* Honeypot anti-spam */}
          <div className="hidden" aria-hidden="true">
            <input
              type="text"
              name="honeypot"
              value={formData.honeypot}
              onChange={handleChange}
              tabIndex={-1}
              autoComplete="off"
            />
          </div>

          {/* Tipo de Trámite */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[#051923] dark:text-white uppercase tracking-wider">
              Tipo de Trámite <span className="text-red-500">*</span>
            </label>
            <Select 
              value={formData.tipoTramite} 
              onValueChange={handleSelectChange}
            >
              <SelectTrigger className="w-full h-11 border-black dark:border-white/20 rounded-xl bg-card">
                <SelectValue placeholder="Selecciona una opción" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {tramitesDisponibles.map((item) => (
                    <SelectItem key={item.value} value={item.value}>
                      {item.label}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>

          {/* Nombre Completo */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[#051923] dark:text-white uppercase tracking-wider">
              Nombre Completo <span className="text-red-500">*</span>
            </label>
            <Input
              required
              type="text"
              name="nombreCompleto"
              placeholder="Ej. Juan Pérez"
              value={formData.nombreCompleto}
              onChange={handleChange}
              className="h-11 border-black dark:border-white/20 rounded-xl bg-card focus-visible:ring-[#006494]"
            />
          </div>

          {/* Teléfono y Correo */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#051923] dark:text-white uppercase tracking-wider">
                Teléfono <span className="text-red-500">*</span>
              </label>
              <Input
                required
                type="tel"
                name="telefono"
                placeholder="Ej. 3001234567"
                value={formData.telefono}
                onChange={handleChange}
                className="h-11 border-black dark:border-white/20 rounded-xl bg-card focus-visible:ring-[#006494]"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#051923] dark:text-white uppercase tracking-wider">
                Correo Electrónico <span className="text-red-500">*</span>
              </label>
              <Input
                required
                type="email"
                name="correo"
                placeholder="Ej. juan@correo.com"
                value={formData.correo}
                onChange={handleChange}
                className="h-11 border-black dark:border-white/20 rounded-xl bg-card focus-visible:ring-[#006494]"
              />
            </div>
          </div>

          {/* Placa de Vehículo */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[#051923] dark:text-white uppercase tracking-wider">
              Placa de Vehículo <span className="text-gray-400 dark:text-gray-500">(Opcional)</span>
            </label>
            <Input
              type="text"
              name="placa"
              placeholder="Ej. ABC12D"
              value={formData.placa}
              onChange={handleChange}
              className="h-11 border-black dark:border-white/20 rounded-xl bg-card focus-visible:ring-[#006494] uppercase"
            />
          </div>

          {/* Descripción */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[#051923] dark:text-white uppercase tracking-wider">
              Descripción de los hechos <span className="text-red-500">*</span>
            </label>
            <Textarea
              required
              name="descripcion"
              rows={4}
              placeholder="Describe detalladamente los hechos, motivos o sugerencia..."
              value={formData.descripcion}
              onChange={handleChange}
              className="border-black dark:border-white/20 rounded-xl bg-card focus-visible:ring-[#006494] resize-none leading-relaxed"
            />
          </div>

          {/* Checkbox y Sub-Dialog de Habeas Data */}
          <div className="flex items-start space-x-3 pt-2">
            <Checkbox
              id="habeasData"
              required
              checked={formData.habeasData}
              onCheckedChange={handleCheckboxChange}
              className="mt-1 border-black dark:border-white/40 data-[state=checked]:bg-[#006494] dark:data-[state=checked]:bg-[#00a6fb]"
            />
            <label
              htmlFor="habeasData"
              className="text-xs font-normal text-[#003554]/80 dark:text-white/70 leading-normal"
            >
              Acepto los términos, condiciones y la política de tratamiento de datos personales de acuerdo con la ley de{" "}
              
              <Dialog>
                <DialogTrigger className="font-bold underline text-[#006494] dark:text-[#00a6fb] cursor-pointer hover:opacity-80 transition-opacity bg-transparent p-0 border-none inline align-baseline">
                  Habeas Data
                </DialogTrigger>
                <DialogContent className="max-w-lg bg-white dark:bg-[#051923] border border-[#006494]/20 dark:border-[#00a6fb]/20 rounded-2xl">
                  <DialogHeader>
                    <DialogTitle className="text-lg font-bold text-[#051923] dark:text-white">
                      Política de Tratamiento de Datos (Ley 1581 de 2012)
                    </DialogTitle>
                    <DialogDescription className="text-sm font-normal text-[#003554]/70 dark:text-white/60 leading-relaxed pt-3 text-left space-y-3 max-h-[60vh] overflow-y-auto pr-2">
                      En cumplimiento de la Ley Estatutaria 1581 de 2012 por la cual se dictan disposiciones generales para la protección de datos personales (Habeas Data), el sistema informa que los datos suministrados en este formulario serán tratados de forma segura y confidencial.
                      <br /><br />
                      La finalidad de la recolección de estos datos es exclusivamente gestionar, evaluar y dar respuesta formal a las peticiones, quejas, reclamos, apelaciones y felicitaciones interpuestas por nuestros usuarios, garantizando la trazabilidad bajo las directrices exigidas por nuestros entes reguladores de acreditación y certificación.
                      <br /><br />
                      Como titular de la información, usted tiene derecho a conocer, actualizar, rectificar y solicitar la supresión de sus datos personales en cualquier momento a través de nuestros canales de atención oficiales habilitados.
                    </DialogDescription>
                  </DialogHeader>
                </DialogContent>
              </Dialog>
              . <span className="text-red-500">*</span>
            </label>
          </div>

          <div className="pt-3">
            <Button
              type="submit"
              className="w-full h-12 bg-[#051923] dark:bg-[#00a6fb] text-white dark:text-[#051923] hover:bg-[#006494] dark:hover:bg-[#0582ca] text-sm font-bold tracking-tight rounded-xl shadow-md transition-all"
            >
              Radicar Requerimiento
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}