import AuthListener from "@/features/auth/components/AuthListener";
import TenantProviders from "@/features/TenantProviders";

export default function TenantLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    // 2. Usamos un fragmento <> o un <section> / <main>
    <TenantProviders> {/* <-- El motor de datos nace aquí */}
    <main className="bg-[#F5F5F5]">
      {/* El AuthListener es clave aquí para vigilar la sesión del tenant específico */}
      <AuthListener />
      {children}
    </main>
    </TenantProviders>
  );
}
