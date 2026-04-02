"use client";


import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { Button } from "@/components/ui/button";
import { useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { AuthError } from "@supabase/supabase-js";




export const AdminLoginForm = () => {

  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  
  

  const passwordField = (
    <div className="grid gap-2 ">
      <div className="flex items-center">
        <Label htmlFor="password">Contraseña</Label>
        
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
       
        router.push(`/admin/dashboard`);
        


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
    
  };



  return (
    <div className={"flex flex-col gap-6 border border-black rounded-xs w-100 mx-auto my-auto"}>
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Login</CardTitle>
          <CardDescription>
            Hola ADMIN, ingresa...
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={handleLogin}
            
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

              {passwordField}
              {error && <p className="text-sm text-red-500">{error}</p>}


              



              <Button type="submit" className="w-full" disabled={isLoading}>
                {!isLoading ? "Ingresa con contraseña": "Entrando"}
              </Button>

              
            </div>



          </form>
        </CardContent>
      </Card>
    </div>
  );
};
