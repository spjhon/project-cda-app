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
import { registerUserAction } from "@/lib/server-actions/register";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

const SELECT_ROLES_SISTEMA = [
  { label: "Recepcionista", value: "recepcionista" },
  { label: "Auxiliar Administrativo", value: "aux_administrativo" },
  { label: "Gerente", value: "gerente" },
  { label: "Director Técnico", value: "director_tecnico" },
];



export function AdminSignUpForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const [tenant, setTenant] = useState("");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [repeatPassword, setRepeatPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [documentType, setDocumentType] = useState("cedula");
  const [documentNumber, setDocumentNumber] = useState("");
  const [phone, setPhone] = useState("");
  const [userRole, setUserRole] = useState("");

  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    event.stopPropagation();
    setError(null);

    if (!tenant.trim()) {
      setError("Debe ingresar el tenant");
      return;
    }

    if (password !== repeatPassword) {
      setError("Las contraseñas no coinciden");
      return;
    }

    if (password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres");
      return;
    }

    if (!userRole) {
      setError("Debe seleccionar un rol");
      return;
    }

    setIsLoading(true);

    try {
      const formData = new FormData(event.currentTarget);

      const result = await registerUserAction(tenant, formData);

      if (result.error) {
        setError(result.error);
      } else {
        window.alert(result.message);
      }
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error
          ? "Error en el fetch: " + err.message
          : "Ocurrió un error desconocido";

      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div
      className={cn("flex flex-col w-full max-w-md mx-auto gap-6", className)}
      {...props}
    >
      <Card className="rounded-xs">
        <CardHeader>
          <CardTitle className="text-2xl">Registro</CardTitle>
          <CardDescription>
            {tenant
              ? `Crear cuenta en: ${tenant}`
              : "Ingrese el tenant del CDA"}
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit}>
            <fieldset className="flex flex-col gap-4">

              {/* TENANT */}
              <div className="grid gap-2">
                <Label htmlFor="tenant">Tenant / CDA</Label>
                <Input
                  id="tenant"
                  name="tenant"
                  placeholder="Ej: tecnofresno"
                  required
                  value={tenant}
                  onChange={(e) => setTenant(e.target.value)}
                />
              </div>

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
                    <option value="cedula_extrangeria">
                      C. Extranjería
                    </option>
                    <option value="pasaporte">Pasaporte</option>
                    <option value="nit">NIT</option>
                    <option value="targeta_identidad">
                      T. Identidad
                    </option>
                  </select>
                </div>

                <div className="col-span-2 grid gap-2">
                  <Label htmlFor="documentNumber">
                    Número de Documento
                  </Label>

                  <Input
                    type="string"
                    id="documentNumber"
                    name="documentNumber"
                    placeholder="12345678"
                    required
                    value={documentNumber}
                    onChange={(e) =>
                      setDocumentNumber(e.target.value)
                    }
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

              {/* CONTRASEÑA */}
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

              {/* REPETIR CONTRASEÑA */}
              <div className="grid gap-2">
                <Label htmlFor="repeat-password">
                  Repetir Contraseña
                </Label>

                <Input
                  id="repeat-password"
                  type="password"
                  required
                  value={repeatPassword}
                  onChange={(e) =>
                    setRepeatPassword(e.target.value)
                  }
                />
              </div>

              {/* ROL */}
              <div className="grid gap-2">
                <Label
                  htmlFor="role"
                  className="text-slate-700 font-medium"
                >
                  Rol en el Sistema
                </Label>

                <Select
                  items={SELECT_ROLES_SISTEMA}
                  value={userRole}
                  onValueChange={(value) =>
                    setUserRole(value ?? "")
                  }
                >
                  <SelectTrigger
                    id="role"
                    render={
                      <Button
                        variant="outline"
                        className="w-full justify-between bg-white font-normal h-10 border-input text-sm px-3 py-2"
                      />
                    }
                  >
                    <SelectValue placeholder="Selecciona un rol" />
                  </SelectTrigger>

                  <SelectContent alignItemWithTrigger={false}>
                    {SELECT_ROLES_SISTEMA.map((rol) => (
                      <SelectItem
                        key={rol.value}
                        value={rol.value}
                      >
                        {rol.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <input
                  type="hidden"
                  name="role"
                  value={userRole}
                />
              </div>

              {error && (
                <p className="text-sm font-medium text-red-500">
                  {error}
                </p>
              )}

              <Button
                type="submit"
                className="w-full"
                disabled={isLoading}
              >
                {isLoading
                  ? "Procesando..."
                  : "Registrarme"}
              </Button>
            </fieldset>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}