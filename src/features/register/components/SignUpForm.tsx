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
import Link from "next/link";
//import { useRouter } from "next/navigation";
import { useState } from "react";


// Definimos qué esperamos recibir
interface SignUpFormProps extends React.ComponentPropsWithoutRef<"div"> {
  tenant: string;
}

export function SignUpForm({
  className,
  tenant,
  ...props
}: SignUpFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [userName, setUserName] = useState("");
  const [repeatPassword, setRepeatPassword] = useState("");
  const [userProfecion, setUserProfecion] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);


async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
  
  event.preventDefault();
  setError(null);

  // 1. Validación de contraseñas iguales
  if (password !== repeatPassword) {
    setError("Las contraseñas no combinan");
    return;
  }

  if (password.length<3){
    setError("La contraseña debe tener al menos tres letras");
    return;
  }

  setIsLoading(true);

  try {
    const response = await fetch(`/register/api`, { 
      method: "POST", 
      body: new FormData(event.currentTarget) 
    });

    if (response.redirected) {
      window.location.href = response.url;
      return; 
    }

    if (!response.ok) {
      const errorData = await response.json();
      setError(errorData.message || "Ocurrió un error inesperado");
      return
    }

    const data = await response.json();
    window.alert(data.message);
    
  } catch (err: unknown) {
    // 2. Catch que muestra el error capturado
    const errorMessage = err instanceof Error ? err.message : "Ah ocurrido un error desconocido al momento de registrar";
    setError(errorMessage);
    console.log("Error de registro:", err);
  } finally {
    setIsLoading(false);
  }
}



  return (
    <div className={cn("flex flex-col gap-6 border border-black rounded-xs", className)} {...props}>
      <Card className="rounded-xs">

        <CardHeader>
          <CardTitle className="text-2xl">Registro</CardTitle>
          <CardDescription>Crear una nueva cuenta con: {tenant}</CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit}>

            <fieldset className="flex flex-col gap-6">


              <div className="grid gap-2">
                <Label htmlFor="userName">Nombre del usuario</Label>
                <Input
                  id="userName"
                  type="name"
                  name="userName"
                  placeholder="Nombre Completo"
                  required
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="userName">Profesion</Label>
                <Input
                  id="profecion"
                  type="name"
                  name="profecion"
                  placeholder="Profesion"
                  required
                  value={userProfecion}
                  onChange={(e) => setUserProfecion(e.target.value)}
                />
              </div>


              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
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


              <div className="grid gap-2">
                <div className="flex items-center">
                  <Label htmlFor="password">Contraseña</Label>
                </div>
                <Input
                  id="password"
                  type="password"
                  required
                  name="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>


              <div className="grid gap-2">
                <div className="flex items-center">
                  <Label htmlFor="repeat-password">Repetir Contraseña</Label>
                </div>
                <Input
                  id="repeat-password"
                  type="password"
                  required
                  value={repeatPassword}
                  onChange={(e) => setRepeatPassword(e.target.value)}
                />
              </div>


              {error && <p className="text-sm text-red-500">{error}</p>}

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Creando cuenta..." : "Registrame"}
              </Button>


            </fieldset>


            <div className="mt-4 text-center text-sm">
              Ya tiene una cuenta?{" "}
              <Link   prefetch={false} href="/auth/login" className="underline underline-offset-4">
                Ingresar
              </Link>
            </div>


          </form>


        </CardContent>
      </Card>
    </div>
  );
}
