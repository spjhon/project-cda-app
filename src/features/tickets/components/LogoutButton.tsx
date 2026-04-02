"use client";

import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";


export function LogoutButton() {
  const router = useRouter();
  const handleLogout = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const supabase = createSupabaseBrowserClient();
    await supabase.auth.signOut();;

    
    router.push(`/tickets`);
   
  };

  return (
    <form
      method="POST"
      action={`/auth/logout/api`}
      onSubmit={handleLogout}
    >
      <button type="submit" className="secondary">
        Salir
      </button>
    </form>
  );
}
