"use client";

import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils"; 
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";

interface LogoutButtonProps {
  className?: string; 
  children?: React.ReactNode; 
}

export function LogoutButton({ className, children }: LogoutButtonProps) {
  const router = useRouter();
  
  const handleLogout = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    event.stopPropagation();

    const supabase = createSupabaseBrowserClient();
    await supabase.auth.signOut();
    
    router.push(`/auth/login`);
  };

  return (
    <form
      method="POST"
      action={`/auth/logout/api`}
      onSubmit={handleLogout}
      className="inline-block"
    >
      <Button 
        type="submit" 
        variant="outline"
        size="sm"
        className={cn(
          "h-9 gap-2 px-4 font-bold text-foreground border-border select-none transition-all cursor-pointer",
          "active:translate-x-px active:translate-y-px", 
          className 
        )}
      >
        <span>{children || "Salir"}</span>
        <LogOut className="h-4 w-4 shrink-0 text-muted-foreground" />
      </Button>
    </form>
  );
}