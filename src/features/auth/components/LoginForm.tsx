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

  
  const [email, setEmail] = useState(`user01@${tenant}.com`);
  const [password, setPassword] = useState("Manolo");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  
  

  const passwordField = (
    <div className="grid gap-2 ">
      <div className="flex items-center">
        <Label htmlFor="password">Contraseña</Label>
        <Link
           prefetch={false}
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

        
        router.push("/auth/magic-thanks")
        

      }catch(err: unknown){
        const message = err instanceof Error ? "Error enviando el magic link: " + err.message : "Error enviando el magic link.";
        setError(message)
        setIsLoading(false);
      }finally{
        
      }
      
      
      

    }
  };




  const handleLoginGoogle = async (e: React.FormEvent) => {
    e.preventDefault();
  
    try {
      const supabase = createSupabaseBrowserClient();
      const {error} = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: window.location.origin + "/auth/verify-oauth/api",
          queryParams: {access_type: "offline", prompt: "consent"},
        },
      });

      if (error) throw error;
      


    } catch (error: unknown) {
      setError(error instanceof AuthError ? error.message : "Ah ocurrido un error al hacer login");
    } finally {
      //...
    }
  
  }







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
                    : "Ingresa con link magico"
                  : ""}
                {isLoading ? "Entrando" : ""}
              </Button>




              <Button
                type="button"
                variant="outline"
                className="w-full flex items-center justify-center gap-3 h-11"
                onClick={handleLoginGoogle}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 48 48"
                  className="w-5 h-5"
                >
                  <path fill="#EA4335" d="M24 9.5c3.54 0 6.36 1.22 8.29 2.24l6.15-6.02C34.84 2.44 29.86 0 24 0 14.62 0 6.47 5.38 2.56 13.22l7.36 5.72C11.73 13.2 17.37 9.5 24 9.5z"/>
                  <path fill="#4285F4" d="M46.1 24.5c0-1.63-.15-3.2-.42-4.72H24v9.04h12.44c-.54 2.9-2.18 5.36-4.64 7.01l7.18 5.58C43.9 37.4 46.1 31.5 46.1 24.5z"/>
                  <path fill="#FBBC05" d="M9.92 28.94A14.53 14.53 0 0 1 9.1 24c0-1.72.3-3.38.82-4.94l-7.36-5.72A23.94 23.94 0 0 0 0 24c0 3.86.92 7.52 2.56 10.66l7.36-5.72z"/>
                  <path fill="#34A853" d="M24 48c6.48 0 11.92-2.13 15.9-5.8l-7.18-5.58c-2 1.34-4.56 2.13-8.72 2.13-6.63 0-12.27-3.7-14.08-9.44l-7.36 5.72C6.47 42.62 14.62 48 24 48z"/>
                </svg>

                Ingresa con Google
              </Button>





              {/* Toggle */}
              <p className="mt-4 text-center text-sm">
                {isPasswordLogin ? (
                  <Link
                     prefetch={false}
                    href={{
                      pathname: `/auth/login`,
                      query: { magicLink: "yes" },
                    }}
                  >
                    Utilizar Link Magico para ingresar
                  </Link>
                ) : (
                  <Link
                     prefetch={false}
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

            <div className="mt-4 text-center text-sm">
              Todavia no tienes cuenta?{" "}
              <Link
                 prefetch={false}
                href={`/register`}
                className="underline underline-offset-4"
              >
                Registrarse
              </Link>
            </div>




          </form>
        </CardContent>
      </Card>
    </div>
  );
};
