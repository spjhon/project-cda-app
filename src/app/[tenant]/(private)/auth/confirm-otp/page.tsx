"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Loader2, KeyRound, AlertTriangle } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export default function ConfirmOtp() {


 
  const searchParams = useSearchParams();
  const router = useRouter();
  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleVerifyOtp() {
    if (otp.length !== 6) {
      setError("El código debe tener 6 dígitos.");
      return;
    }

    setError(null);
    setIsLoading(true);

    try {


      const supabaseBrowser = createSupabaseBrowserClient();

      const emailSucio = searchParams.get("email") || "";

      const emailLimpio = decodeURIComponent(emailSucio);



      const { data: verifiedOtp, error: errorVerifingOtp } =
        await supabaseBrowser.auth.verifyOtp({
          email: emailLimpio,
          token: otp,
          type: "recovery",
        });


        console.log(verifiedOtp)
        console.log(errorVerifingOtp)

        if (!verifiedOtp || errorVerifingOtp ){
            throw new Error("Error verificando el otp: " + errorVerifingOtp?.message)
        }

      router.push("/dashboard");



    } catch (err: unknown) {
      
        const errormessage = err instanceof Error ? err.message : "Ha ocurrido un error inesperado verificando el otp"

      setError(errormessage);
      setOtp(""); // Limpiamos el OTP en caso de error
    } finally {
      setIsLoading(false);
    }
  }




  return (
    <div className="w-full h-screen flex justify-center items-center bg-zinc-50 dark:bg-zinc-950">
      <Card className="w-full max-w-md mx-4 border-zinc-200 dark:border-zinc-800 shadow-lg">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-2">
            <div className="p-3 bg-zinc-100 dark:bg-zinc-900 rounded-full border border-zinc-200 dark:border-zinc-800">
              <KeyRound className="h-6 w-6 text-zinc-900 dark:text-zinc-50" />
            </div>
          </div>
          <CardTitle className="text-2xl font-semibold tracking-tight text-zinc-950 dark:text-zinc-50">
            Verifica tu código
          </CardTitle>
          <CardDescription className="text-zinc-500 dark:text-zinc-400">
            Ingresa el código de 6 dígitos que enviamos a tu correo.
          </CardDescription>
        </CardHeader>

        <CardContent className="grid gap-6">
          <div className="flex flex-col items-center justify-center gap-4">
            {/* COMPONENTE INPUT-OTP DE SHADCN */}
            <InputOTP
              maxLength={6}
              value={otp}
              onChange={(value) => setOtp(value)}
              disabled={isLoading}
              className="font-mono text-lg"
              onFocus={() => setError(null)}
            >
              <InputOTPGroup className="gap-2">
                <InputOTPSlot
                
                  index={0}
                  className="rounded-md border-zinc-200 dark:border-zinc-800 w-12 h-14"
                />
                <InputOTPSlot
               
                  index={1}
                  className="rounded-md border-zinc-200 dark:border-zinc-800 w-12 h-14"
                />
                <InputOTPSlot
               
                  index={2}
                  className="rounded-md border-zinc-200 dark:border-zinc-800 w-12 h-14"
                />
              </InputOTPGroup>
              <span className="text-zinc-300 dark:text-zinc-700 font-bold mx-1">
                -
              </span>
              <InputOTPGroup className="gap-2">
                <InputOTPSlot
                
                  index={3}
                  className="rounded-md border-zinc-200 dark:border-zinc-800 w-12 h-14"
                />
                <InputOTPSlot
                
                  index={4}
                  className="rounded-md border-zinc-200 dark:border-zinc-800 w-12 h-14"
                />
                <InputOTPSlot
                
                  index={5}
                  className="rounded-md border-zinc-200 dark:border-zinc-800 w-12 h-14"
                />
              </InputOTPGroup>
            </InputOTP>

            {/* MENSAJE DE ERROR (Opcional, estilo Alert de Shadcn) */}
            {error && (
              <Alert
                variant="destructive"
                className="border-red-600 bg-red-50 text-red-900 dark:border-red-900 dark:bg-red-950 dark:text-red-100 p-3"
              >
                <AlertTriangle className="h-4 w-4 stroke-red-800 dark:stroke-red-200" />
                <AlertTitle className="text-sm font-semibold">Error</AlertTitle>
                <AlertDescription className="text-xs">{error}</AlertDescription>
              </Alert>
            )}
          </div>
        </CardContent>

        <CardFooter className="flex flex-col gap-3">
          <Button
            onClick={handleVerifyOtp}
            className="w-full bg-zinc-900 text-zinc-50 hover:bg-zinc-800/90 dark:bg-zinc-50 dark:text-zinc-950 dark:hover:bg-zinc-50/90"
            disabled={isLoading || otp.length !== 6}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Verificando...
              </>
            ) : (
              "Confirmar y Acceder"
            )}
          </Button>

            {/** 
          <div className="text-center text-sm text-zinc-500 dark:text-zinc-400">
            ¿No recibiste el código?{" "}
            <button className="text-zinc-900 dark:text-zinc-50 hover:underline font-medium">
              Reenviar
            </button>
          </div>
            */}

        </CardFooter>
      </Card>
    </div>
  );
}
