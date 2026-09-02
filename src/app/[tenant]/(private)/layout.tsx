import AuthListener from "@/components/auth/AuthListener";
import TanstackContext from "@/contexts/TanstackContext";
import { Metadata } from "next/types";

export const metadata: Metadata = {
  title: {
    template: "%s",
    default: "Dashboard Centro de Diagnóstico Automotor",
  },
  description:
    "Plataforma oficial para la gestión de trámites, consultas del RUNT y radicación de PQRSF.",
  robots: {
    index: true,
    follow: true,
  },
};

export async function generateStaticParams() {
  return [{ tenant: "demo" }];
}

export default function TenantLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ tenant: string }>;
}>) {
  

  return (
    <TanstackContext>
      <main className="">
        <AuthListener params={params}>
          {children}
        </AuthListener>
      </main>
    </TanstackContext>
  );
}