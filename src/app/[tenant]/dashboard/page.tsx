"use client"

import { useContext, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { PermissionsContext } from "@/contexts/PermissionsLoaderContext";

// Componentes de Shadcn (Base UI)
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, UserCircle, ShieldCheck, ArrowRight } from "lucide-react";
import Loading from "@/components/ui/loading";




// 🌟 DICCIONARIO DE ROLES: Centraliza textos, descripciones y rutas de redirección
const ROLE_CONFIG: Record<string, { label: string; description: string; path: string }> = {
  gerente: {
    label: "Administrador",
    description: "Gestión global, reportes financieros y control total del CDA.",
    path: "/dashboard/gerente", // 👈 Controlado desde el objeto
  },
  recepcionista: {
    label: "Recepcionista",
    description: "Creación de órdenes de entrada, manejo de caja y flujo inicial.",
    path: "/dashboard/recepcionista",
  },
  aux_administrativo: {
    label: "Auxiliar Administrativo",
    description: "Gestión de documentos, control de archivos y soporte general.",
    path: "/dashboard/oficina",
  },
  director_tecnico: {
    label: "Director Técnico",
    description: "Control de calidad del SGC, aprobación e inspección bajo ISO 17020.",
    path: "/dashboard/director_tecnico",
  },
};



export default function DashboardPage() {
  const router = useRouter();
  const permissionsContext = useContext(PermissionsContext);
  
  // Extraemos la info del contexto
  const contextValue = permissionsContext?.PermissionsContextValue;
  const roles = contextValue?.RolesArray || [];
  const tenantName = contextValue?.tenantObject?.name || "tu CDA";
  const userName = contextValue?.user?.name || "Usuario";

  // Lógica de Redirección Automática
 // 🌟 Lógica de Redirección Automática adaptada al Objeto
  useEffect(() => {
    if (roles.length === 1) {
      const targetRole = roles[0];
      const targetPath = ROLE_CONFIG[targetRole]?.path || `/dashboard/${targetRole}`;
      router.replace(targetPath);
    }
  }, [roles, router]);

  // Si solo hay un rol, mostramos un loader mientras se redirecciona para que no sea brusco
  if (roles.length === 1) {
    return (
      <Loading/>
    );
  }



  return (
    <div className="min-h-screen bg-slate-50/50 flex flex-col items-center justify-center p-6">
      
      {/* Botón de regreso minimalista */}
      <div className="absolute top-8 left-8">
        <Button variant="ghost" className="text-muted-foreground hover:text-foreground">
          <Link href="/landingpage">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Regresar a la landing
          </Link>
        </Button>
      </div>

      <div className="max-w-2xl w-full space-y-8">
        {/* Header de Bienvenida */}
        <div className="text-center space-y-2">
          <Badge variant="outline" className="px-3 py-1 border-primary/20 text-primary bg-primary/5 mb-2">
            Panel de Acceso
          </Badge>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            ¡Hola, {userName.split(' ')[0]}!
          </h1>
          <p className="text-muted-foreground">
            Hemos detectado múltiples perfiles para <span className="font-semibold text-slate-700">{tenantName}</span>. 
            Selecciona con cuál deseas ingresar hoy:
          </p>
        </div>

        {/* Rejilla de Perfiles */}
<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {roles.length > 0 ? (
            roles.map((role) => {
              // Extraemos la configuración o generamos un fallback seguro si no existe la key
              const config = ROLE_CONFIG[role] || { 
                label: role, 
                description: `Acceso a las funciones de ${role}.`,
                path: `/dashboard/${role}` 
              };

              return (
                <Card 
                  key={role} 
                  className="group relative overflow-hidden transition-all hover:shadow-md hover:border-primary/50 cursor-pointer"
                  onClick={() => router.push(config.path)} // 🌟 Redirección controlada 100% por el Objeto
                >
                  <CardHeader className="pb-4">
                    <div className="flex items-center justify-between">
                      <div className="p-2 bg-slate-100 rounded-lg group-hover:bg-primary/10 transition-colors">
                        <UserCircle className="h-6 w-6 text-slate-600 group-hover:text-primary" />
                      </div>
                      <ArrowRight className="h-4 w-4 text-slate-300 group-hover:text-primary transition-all group-hover:translate-x-1" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <CardTitle className="text-xl mb-1">{config.label}</CardTitle>
                    <CardDescription>{config.description}</CardDescription>
                  </CardContent>
                </Card>
              );
            })
          ) : (
            <div className="col-span-full py-12 text-center border-2 border-dashed rounded-xl">
              <ShieldCheck className="h-12 w-12 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500">No se encontraron roles activos.</p>
            </div>
          )}
        </div>

        {/* Footer simple */}
        <p className="text-center text-xs text-muted-foreground pt-4">
          ID de Sesión: {contextValue?.user?.authId?.slice(0, 8)}...
        </p>
      </div>
    </div>
  );
}