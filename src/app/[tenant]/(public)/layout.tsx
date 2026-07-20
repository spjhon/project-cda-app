import { Metadata } from "next/types";

export const metadata: Metadata = {
  title: {
    template: "%s",
    default: "Centro de Diagnóstico Automotor",
  },
  description: "Plataforma oficial para la gestión de trámites, consultas del RUNT y radicación de PQRSF.",
  robots: {
    index: true,
    follow: true,
  },
};



export default function layout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <>
    
    {children}
    </>
  )
}
