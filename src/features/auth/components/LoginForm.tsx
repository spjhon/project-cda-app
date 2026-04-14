"use client";

import { cn } from "@/lib/utils";
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
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { AuthError } from "@supabase/supabase-js";
import { enviarEmailMagicLink } from "@/lib/server_actions/emails";


type LoginProps = React.ComponentPropsWithoutRef<"div"> & {
  isPasswordLogin?: boolean;
  tenant: string;
};


export const LoginForm = ({
  className,
  isPasswordLogin,
  tenant,
  ...props
}: LoginProps) => {

  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  
  

  const passwordField = (
    <div className="grid gap-2 ">
      <div className="flex items-center">
        <Label htmlFor="password">Contraseña</Label>
        <Link
          
          href= {`/auth/forgot-password`}
          className="ml-auto inline-block text-sm underline-offset-4 hover:underline"
        >
          Olvidaste tu contraseña?
        </Link>
      </div>
      <Input
        id="password"
        type="password"
        name="password"
        required
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
    </div>
  );

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);



    if (isPasswordLogin) {
      const supabase = createSupabaseBrowserClient();
      
      setError(null);

      
      try {
        const emailLowered = email.toLowerCase().trim()
        const { error } = await supabase.auth.signInWithPassword({
          email: emailLowered,
          password,
        });
        if (error) throw error;
        
        
        // Update this route to redirect to an authenticated route. The user already has an active session.
       
        router.push(`/tickets`);
        


      } catch (error: unknown) {
        
        if (error instanceof AuthError) {
          // Aquí TypeScript ya sabe que 'error' tiene .message, .code, .status, etc.
          setError(error.message);
          console.dir(error)
        } else {
          // Si no es un error de Supabase, es un error genérico (ej: error de red)
          setError("Ha ocurrido un error inesperado");
        }
        setIsLoading(false);
      } finally {
        
      }
    }


    

    if (!isPasswordLogin) {
      
      try {

        if (typeof email !== "string") {
          throw new Error ("Lo siento, el email no es un string.")
        }

        if (!email) {
          throw new Error("Lo siento, el email no existe");
        }

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
          throw new Error("Lo siento, el email no cumple las condiciones");
        }

        const {data, error} = await enviarEmailMagicLink(email, tenant)
      
        if (!data || error){
        throw new Error("Error al crear el link y enviarlo: " + error)
        }

        const emailSafe = encodeURIComponent(email);
        
        router.push(`/auth/confirm-otp?email=${emailSafe}`)
        

      }catch(err: unknown){
        const message = err instanceof Error ? "Error enviando el magic link: " + err.message : "Error enviando el magic link.";
        setError(message)
        setIsLoading(false);
      }finally{
        
      }
      
      
      

    }
  };











  return (
    <div className={cn("flex flex-col gap-6 border border-black rounded-xs", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Login</CardTitle>
          <CardDescription>
            Ingresa el correo electronico para iniciar sesion con la organizacion: {`${tenant}`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={handleLogin}
            action={
              isPasswordLogin ? `/auth/login/api` : `/auth/login-magic-link/api`
            }
            method="POST"
          >
            <div className="flex flex-col gap-6">
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

              {isPasswordLogin && passwordField}
              {error && <p className="text-sm text-red-500">{error}</p>}


              



              <Button type="submit" className="w-full" disabled={isLoading}>
                {!isLoading
                  ? isPasswordLogin
                    ? "Ingresa con contraseña"
                    : "Enviar codigo al correo"
                  : ""}
                {isLoading ? "Entrando" : ""}
              </Button>




              





              {/* Toggle */}
              <p className="mt-4 text-center text-sm">
                {isPasswordLogin ? (
                  <Link
                     
                    href={{
                      pathname: `/auth/login`,
                      query: { magicLink: "yes" },
                    }}
                  >
                    Solicitar codigo ingreso que llegue al correo
                  </Link>
                ) : (
                  <Link
                     
                    href={{
                      pathname: `/auth/login`,
                      query: { magicLink: "no" },
                    }}
                  >
                    Utilizar contraseña
                  </Link>
                )}
              </p>
            </div>

            




          </form>
        </CardContent>
      </Card>
    </div>
  );
};
