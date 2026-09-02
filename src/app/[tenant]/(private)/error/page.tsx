import { urlPath } from "@/lib/url-helpers";
import Link from "next/link";
import { AlertCircle } from "lucide-react";
import { Suspense, use } from "react";

// 1. Componente que consume los datos dinámicos (searchParams)
function ErrorDetails({
  searchParamsPromise,
}: {
  searchParamsPromise: Promise<{ type: string }>;
}) {
  const { type } = use(searchParamsPromise);

  if (!type) return null;

  return (
    <div className="rounded-md border bg-muted p-4 font-mono text-xs text-muted-foreground break-all my-4">
      {decodeURIComponent(type)}
    </div>
  );
}

// 2. Componente para el botón que lee el tenant
function HomeButton({
  paramsPromise,
}: {
  paramsPromise: Promise<{ tenant: string }>;
}) {
  const { tenant } = use(paramsPromise);

  return (
    <Link
      href={urlPath("/", tenant)}
      className="inline-flex h-10 w-full items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring mt-4"
    >
      Volver al inicio
    </Link>
  );
}

// 3. Página principal estática
export default function ErrorPage({
  searchParams,
  params,
}: {
  searchParams: Promise<{ type: string }>;
  params: Promise<{ tenant: string }>;
}) {
  return (
    <div className="flex items-center justify-center h-screen">
      <div className="mx-5 border border-black p-5 sm:p-20 rounded-xs bg-white">
        <div className="flex flex-col space-y-2 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-destructive/15 text-destructive">
            <AlertCircle className="h-6 w-6" />
          </div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Algo salió mal
          </h1>
          <p className="text-sm text-muted-foreground">
            Ha ocurrido un error inesperado en la aplicación.
          </p>
        </div>

        {/* Cajas aisladas con Suspense para no bloquear el build */}
        <Suspense fallback={null}>
          <ErrorDetails searchParamsPromise={searchParams} />
        </Suspense>

        <Suspense
          fallback={
            <div className="h-10 w-full bg-muted animate-pulse rounded-md mt-4" />
          }
        >
          <HomeButton paramsPromise={params} />
        </Suspense>
      </div>
    </div>
  );
}