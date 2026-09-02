"use client";

import { useEffect, use, Suspense } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { AuthChangeEvent, Session } from "@supabase/supabase-js";

interface AuthListenerProps {
  params: Promise<{ tenant: string }>;
  children: React.ReactNode;
}

// Subcomponente interno que desenvuelve la promesa con use()
function AuthListenerContent({
  params,
  children,
}: {
  params: Promise<{ tenant: string }>;
  children: React.ReactNode;
}) {
  const router = useRouter();

  // Desenvolvemos la promesa dentro del boundary aislado
  const { tenant } = use(params);

  useEffect(() => {
    const supabase = createSupabaseBrowserClient();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      (event: AuthChangeEvent, session: Session | null) => {
        if (event === "SIGNED_IN") {
          if (!session?.user.app_metadata?.tenants?.includes(tenant)) {
            supabase.auth.signOut();
            alert("No se puede ingresar, el tenant no concuerda");
          }
        }

        if (event === "SIGNED_OUT") {
          router.push(`/auth/login`);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [router, tenant]);

  return <>{children}</>;
}

// Componente principal exported
export default function AuthListener({ params, children }: AuthListenerProps) {
  return (
    <Suspense fallback={null}>
      <AuthListenerContent params={params}>
        {children}
      </AuthListenerContent>
    </Suspense>
  );
}