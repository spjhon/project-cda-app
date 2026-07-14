import FullmotosLandingPage from "@/components/tenantsLandingPages/FullmotosLandingPage";
import TecnofresnoLandingPage from "@/components/tenantsLandingPages/TecnofresnoLandingPage";



export async function generateStaticParams() {
  // En el futuro, aquí harías un fetch/RPC a Supabase para traer los slugs de tus CDAs
  return [
    { tenant: "fullmotos" },
    { tenant: "tecnofresno" },
  ];
}





export default async function TenantPage({params}: {params: Promise<{ tenant: string }>}) {
    
 const { tenant } = await params;

// Pasamos el tenant a minúsculas para evitar problemas de digitación en la URL
  const currentTenant = tenant.toLowerCase();


if (currentTenant === "fullmotos") {

    return <FullmotosLandingPage currentTenant={currentTenant} />;
  }

if (currentTenant === "tecnofresno") {
    return <TecnofresnoLandingPage  currentTenant={currentTenant} />;
  }


return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4 text-center bg-background">
      <h1 className="text-2xl font-bold tracking-tight text-foreground">
        Centro de Diagnóstico no registrado
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">
        El subdominio <span className="font-mono font-bold text-primary">{tenant}</span> no corresponde a una organización activa en cdApp.
      </p>
    </div>
  );
}