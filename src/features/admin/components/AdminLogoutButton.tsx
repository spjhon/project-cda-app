"use client";

import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";


export function AdminLogoutButton() {
  const router = useRouter();
  const handleLogout = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const supabase = createSupabaseBrowserClient();
    await supabase.auth.signOut();;

    
    router.push(`/admin`);
   
  };

  return (
    <form
      method="POST"
      
      onSubmit={handleLogout}
    >
      <button type="submit" className="secondary">
        Salir
      </button>
    </form>
  );
}
