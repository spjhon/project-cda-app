import Loading from "@/components/ui/loading";
import AuthListener from "@/components/auth/AuthListener";
import TanstackContext from "@/contexts/TanstackContext";
import { Suspense } from "react";

export default function TenantLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    // 2. Usamos un fragmento <> o un <section> / <main>
    <TanstackContext>
      {" "}
      {/* <-- El motor de datos nace aquí */}
      <main className="">
        {/* El AuthListener es clave aquí para vigilar la sesión del tenant específico */}
        <Suspense fallback={<Loading />}>
          <AuthListener>{children}</AuthListener>
        </Suspense>
      </main>
    </TanstackContext>
  );
}
