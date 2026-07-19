import PqafFormClient from "@/components/tenantsLandingPages/PqafFormClient"
import Loading from "@/components/ui/loading"
import { Suspense } from "react"


interface PageProps {
  params: Promise<{
    tenant: string
  }>
}



export async function generateStaticParams() {
  // En el futuro, aquí harías un fetch/RPC a Supabase para traer los slugs de tus CDAs
  return [
    { tenant: "fullmotos" },
    { tenant: "tecnofresno" },
  ];
}





export default function PqrsfPage({ params }: PageProps) {
  // Pasamos la promesa directa al componente cliente sin hacerle await aquí
  return (
    <main className="min-h-screen bg-slate-50 dark:bg-[#051923]/40 flex items-center justify-center p-4 md:p-8">
      <div className="max-w-6xl w-full bg-white dark:bg-[#051923] border border-[#006494]/10 dark:border-[#00a6fb]/20 rounded-2xl p-6 md:p-8 shadow-lg">
        <header className="mb-6 text-center sm:text-left">
          <h1 className="text-2xl font-extrabold text-[#051923] dark:text-[#00a6fb] tracking-tight">
            Radicar Solicitud Oficial
          </h1>
          <p className="text-sm font-normal text-[#003554]/70 dark:text-white/60 mt-1">
            Por favor completa todos los campos obligatorios para dar trámite a tu requerimiento.
          </p>
        </header>

        <Suspense fallback={<Loading></Loading>}>
        <PqafFormClient paramsPromise={params} />
        </Suspense>
      </div>
    </main>
  )
}