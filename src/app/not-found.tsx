import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[100dvh] bg-background px-4 text-center">
      {/* El "404" usando el color primary de shadcn */}
      <h1 className="text-[8rem] md:text-[10rem] font-extrabold leading-none text-primary tracking-tighter">
        404
      </h1>
      
      <h2 className="mt-4 text-2xl md:text-3xl font-bold text-foreground">
        Página no encontrada
      </h2>
      
      <p className="mt-4 mb-8 max-w-[500px] text-lg text-muted-foreground">
        Lo sentimos, el subdominio al que intentas acceder no existe o no está registrado en nuestro sistema.
      </p>

      {/* Botón original de shadcn */}
      <Button size="lg" className="font-bold">
        <Link href="http://127.0.0.1:3000" >
          Volver al inicio
        </Link>
      </Button>

      {/* Decoración sutil de fondo (opcional) */}
      <div className="absolute inset-0 -z-10 h-full w-full bg-white [background:radial-gradient(125%_125%_at_50%_10%,#fff_40%,#63e_100%)] opacity-20"></div>
    </div>
  );
}