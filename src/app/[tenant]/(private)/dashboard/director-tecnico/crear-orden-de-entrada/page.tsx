
"use client";

import { useContext } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { Button } from "@/components/ui/button";
import { PermissionsContext } from "@/contexts/PermissionsLoaderContext";
import { DirectorTecnicoContext } from "@/contexts/DirectorTecnicoLoaderContext";
import CreateEntryOrderTemplateForm from "@/components/dashboard/director-tecnico/CreateEntryOrderTemplateForm";

export default function CreateEntryOrderTemplatePage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const permissionsContext = useContext(PermissionsContext);
  const directorContext = useContext(DirectorTecnicoContext);

  const permissions = permissionsContext?.PermissionsContextValue;
  const directorTecnico = directorContext?.DirectorTecnicoContextValue;

  const tenant = permissions?.tenantObject;
  const user = permissions?.user;

  const templateQuery =
    directorTecnico?.templateTableData.templateQuery;

  const templateId = searchParams.get("templateId");

  const currentTemplate = templateQuery?.data?.find(
    (template) => template.id === templateId
  );

  // Quita el templateId de la URL para crear una plantilla nueva.
  const handleCreateNew = () => {
    router.replace(pathname);
  };

 if (!tenant?.id || !user?.id || !templateQuery) {
  return (
    <p className="p-6 text-sm text-muted-foreground">
      Preparando el formulario...
    </p>
  );
}

  if (templateQuery?.isPending) {
    return (
      <p className="p-6 text-sm text-muted-foreground">
        Cargando plantillas...
      </p>
    );
  }

  if (templateQuery?.isError) {
    return (
      <div className="space-y-4 p-6">
        <p className="text-sm text-destructive">
          No fue posible cargar las plantillas.
        </p>

        <Button
          type="button"
          variant="outline"
          onClick={() => void templateQuery.refetch()}
        >
          Reintentar
        </Button>
      </div>
    );
  }

  if (templateId && !currentTemplate) {
    return (
      <div className="mx-auto flex max-w-lg flex-col items-center gap-4 p-8 text-center">
        <h2 className="text-lg font-semibold">
          Identificador de plantilla inválido
        </h2>

        <p className="text-sm text-muted-foreground">
          No encontramos una plantilla con ese identificador.
          Puedes quitarlo de la URL y crear una nueva.
        </p>

        <Button type="button" onClick={handleCreateNew}>
          Crear plantilla nueva
        </Button>
      </div>
    );
  }

  return (
    <CreateEntryOrderTemplateForm
      key={templateId ?? "new"}
      template={currentTemplate ?? null}
      tenantId={tenant.id}
      logoUrl={tenant.logo_url ?? ""}
      userId={user.id}
    />
  );
}
