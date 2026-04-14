import { urlPath } from "@/lib/url-helpers";
import Link from "next/link";
import { AlertCircle } from "lucide-react"; // Shadcn usa mucho esta librería de iconos



/**
 * This page is important; this is where almost all errors that occur in the app are redirected. 
 * Since the console.log on the server is not easily visible, the messages shown in this error provide a good 
 * idea not only of the error itself but also of its location.
 * @param param0 The tenants
 * @returns Error message page.
 */
export default async function ErrorPage({
  searchParams,
  params,
}: {
  searchParams: Promise<{ type: string }>;
  params: Promise<{ tenant: string }>;
}) {
  const { type } = await searchParams;
  const { tenant } = await params;

  return (
    <div className="flex items-center justify-center h-screen">

      <div className="mx-5 border border-black p-5 sm:p-20 rounded-xs bg-white">
        
        {/* Shadcn-style card */}
        <div className="flex flex-col space-y-2 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-destructive/15 text-destructive ">
            <AlertCircle className="h-6 w-6" />
          </div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Algo salió mal
          </h1>
          <p className="text-sm text-muted-foreground">
            Ha ocurrido un error inesperado en la aplicación.
          </p>
        </div>

        {/* Error box - shadcn "code" style */}
        {type && (
          <div className="rounded-md border bg-muted p-4 font-mono text-xs text-muted-foreground break-all">
            {decodeURIComponent(type)}
          </div>
        )}

        {/* Shadcn style button (outline or default variant) */}
        <Link
          
          href={urlPath("/", tenant)}
          className="inline-flex h-10 w-full items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        >
          Volver al inicio
        </Link>
      </div>


    </div>
  );
}