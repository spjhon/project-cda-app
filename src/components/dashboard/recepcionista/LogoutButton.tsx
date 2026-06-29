"use client";

import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils"; 
import { LogOut } from "lucide-react"; // 🌟 El ícono famoso de la puerta de salida

interface LogoutButtonProps {
  className?: string; 
  children?: React.ReactNode; 
}

export function LogoutButton({ className, children }: LogoutButtonProps) {
  const router = useRouter();
  
  const handleLogout = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const supabase = createSupabaseBrowserClient();
    await supabase.auth.signOut();
    
    router.push(`/auth/login`);
  };

  return (
    <form
      method="POST"
      action={`/auth/logout/api`}
      onSubmit={handleLogout}
      className="inline-block p-2" // Un pequeño padding para que la sombra del botón no se corte con el borde del header
    >
      <button 
        type="submit" 
        className={cn(
          // 🌟 Estilos base + Neo-Brutalismo con animación de presión
          "flex items-center gap-2 px-4 py-2 text-sm font-black text-slate-900 bg-white border border-slate-300 rounded-md select-none transition-all cursor-pointer",
          
          "hover:bg-slate-50", 
          "active:translate-x-[2px] active:translate-y-[2px] active:shadow-[1px_1px_0px_0px_rgba(15,23,42,1)]", // 💥 Efecto cuando se presiona (baja y la sombra se achica)
          className 
        )}
      >
        <span>{children || "Salir"}</span>
        <LogOut className="h-4 w-4 shrink-0 stroke-[2.5]" /> {/* Ícono con buen grosor de línea */}
      </button>
    </form>
  );
}