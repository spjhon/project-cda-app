import { AdminLogoutButton } from "@/components/admin/AdminLogoutButton";
import { AdminSignUpForm } from "@/components/admin/AdminSignUpForm";
import { PromotionalEmailForm } from "@/components/admin/PromotionalEmailForm";

export default function DashboardAdminPage() {
  return (
    <section className="min-h-screen bg-muted/30 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8">
        {/* Header */}
        <div className="flex flex-col gap-4 rounded-xl border bg-background p-6 shadow-sm sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">
              Administración global
            </p>

            <h1 className="mt-1 text-3xl font-bold tracking-tight sm:text-4xl">
              Panel de Administración
            </h1>

            <p className="mt-2 text-sm text-muted-foreground">
              Gestiona usuarios y comunicaciones de cdApp.
            </p>
          </div>

          <AdminLogoutButton />
        </div>

        {/* Forms */}
        <div className="flex flex-col gap-6 md:flex-row md:items-start">
          {/* Register manager */}
          <div className="flex-1 rounded-xl border bg-background p-6 shadow-sm">
            <div className="mb-6">
              <h2 className="text-xl font-semibold tracking-tight">
                Registrar gerente
              </h2>

              <p className="mt-1 text-sm text-muted-foreground">
                Crea un nuevo gerente y asígnalo a un tenant de cdApp.
              </p>
            </div>

            <AdminSignUpForm />
          </div>

          {/* Promotional email */}
          <div className="flex-1 rounded-xl border bg-background p-6 shadow-sm">
            <div className="mb-6">
              <h2 className="text-xl font-semibold tracking-tight">
                Enviar correo promocional
              </h2>

              <p className="mt-1 text-sm text-muted-foreground">
                Envía una presentación de cdApp a un Centro de Diagnóstico
                Automotor.
              </p>
            </div>

            <PromotionalEmailForm />
          </div>
        </div>
      </div>
    </section>
  );
}