"use client";

import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils"; // Importante para combinar clases sin conflictos

interface LogoutButtonProps {
  className?: string; // Prop opcional para Tailwind
  children?: React.ReactNode; // Por si quieres cambiar el texto "Salir"
}

export function LogoutButton({ className, children }: LogoutButtonProps) {
  const router = useRouter();
  
  const handleLogout = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const supabase = createSupabaseBrowserClient();
    await supabase.auth.signOut();
    
    // Como estás en un entorno multi-tenant, asegúrate de que
    // esta ruta sea la correcta para tu estructura actual.
    router.push(`/auth/login`);
  };

  return (
    <form
      method="POST"
      action={`/auth/logout/api`}
      onSubmit={handleLogout}
      className="inline-block" // Para que el form no rompa el diseño
    >
      <button 
        type="submit" 
        className={cn(
          "px-4 py-2 rounded-md transition-colors", // Clases base (opcional)
          className // Clases que pases por props (tienen prioridad)
        )}
      >
        {children || "Salir"}
      </button>
    </form>
  );
}