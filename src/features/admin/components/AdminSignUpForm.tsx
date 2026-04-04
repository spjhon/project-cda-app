"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { registerUserAction } from "@/lib/server_actions/register";

interface SignUpFormProps extends React.ComponentPropsWithoutRef<"div"> {
  tenant: string;
}

export function AdminSignUpForm({
  className,
  tenant,
  ...props
}: SignUpFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [repeatPassword, setRepeatPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [documentType, setDocumentType] = useState("cedula"); // Default según DB
  const [documentNumber, setDocumentNumber] = useState("");
  const [phone, setPhone] = useState("");
  const [userRole, setUserRole] = useState("");
  
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (password !== repeatPassword) {
      setError("Las contraseñas no coinciden");
      return;
    }

    if (password.length < 6) { // Recomendado subir de 3 a 6 por seguridad
      setError("La contraseña debe tener al menos 6 caracteres");
      return;
    }

    setIsLoading(true);

    try {
      // FormData capturará todos los inputs con el atributo 'fullmotos'
      const formData = new FormData(event.currentTarget);
      
      // 2. Llamas directamente a la función del servidor
    const result = await registerUserAction(tenant, formData);

    if (result.error) {
      setError(result.error);
    } else {
      window.alert(result.message);
      // Redirigir o limpiar form aquí
    }
      
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? "Error en el fetch: "+  err.message : "Ocurrió un error desconocido";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className={cn("flex flex-col w-full max-w-md mx-auto gap-6", className)} {...props}>
      <Card className="rounded-xs">
        <CardHeader>
          <CardTitle className="text-2xl">Registro</CardTitle>
          <CardDescription>Crear cuenta en el taller: {tenant}</CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit}>
            <fieldset className="flex flex-col gap-4">
              
              {/* NOMBRE COMPLETO */}
              <div className="grid gap-2">
                <Label htmlFor="fullName">Nombre Completo</Label>
                <Input
                  id="fullName"
                  name="fullName"
                  placeholder="Ej: Juan Pérez"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                />
              </div>

              {/* TIPO Y NÚMERO DE DOCUMENTO */}
              <div className="grid grid-cols-3 gap-2">
                <div className="col-span-1 grid gap-2">
                  <Label htmlFor="documentType">Tipo</Label>
                  <select
                    id="documentType"
                    name="documentType"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    value={documentType}
                    onChange={(e) => setDocumentType(e.target.value)}
                  >
                    <option value="cedula">Cédula</option>
                    <option value="cedula_extrangeria">C. Extranjería</option>
                    <option value="pasaporte">Pasaporte</option>
                    <option value="nit">NIT</option>
                    <option value="targeta_identidad">T. Identidad</option>
                  </select>
                </div>
                <div className="col-span-2 grid gap-2">
                  <Label htmlFor="documentNumber">Número de Documento</Label>
                  <Input
                    type="number"
                    id="documentNumber"
                    name="documentNumber"
                    placeholder="12345678"
                    required
                    value={documentNumber}
                    onChange={(e) => setDocumentNumber(e.target.value)}
                  />
                </div>
              </div>

              {/* TELÉFONO */}
              <div className="grid gap-2">
                <Label htmlFor="phone">Teléfono / WhatsApp</Label>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  placeholder="Ej: 3001234567"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>

              {/* EMAIL */}
              <div className="grid gap-2">
                <Label htmlFor="email">Correo Electrónico</Label>
                <Input
                  id="email"
                  type="email"
                  name="email"
                  placeholder="m@ejemplo.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              {/* CONTRASEÑAS */}
              <div className="grid gap-2">
                <Label htmlFor="password">Contraseña</Label>
                <Input
                  id="password"
                  type="password"
                  name="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="repeat-password">Repetir Contraseña</Label>
                <Input
                  id="repeat-password"
                  type="password"
                  required
                  value={repeatPassword}
                  onChange={(e) => setRepeatPassword(e.target.value)}
                />
              </div>

              {/* ROL DEL USUARIO (Solo para Administrador) */}
              <div className="grid gap-2">
                <Label htmlFor="role">Rol en el Sistema</Label>
                <select
                  id="role"
                  name="role"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  required
                  value={userRole}
                  onChange={(e) => setUserRole(e.target.value)}
                >
                  <option value="" disabled>Selecciona un rol</option>
                  <option value="recepcionista">Recepcionista</option>
                  <option value="aux_administrativo">Auxiliar Administrativo</option>
                  <option value="gerente">Gerente</option>
                  <option value="director_tecnico">Director Técnico</option>
                </select>
              </div>

              {error && <p className="text-sm font-medium text-red-500">{error}</p>}

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Procesando..." : "Registrarme"}
              </Button>
            </fieldset>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}