import { AdminLogoutButton } from "@/features/admin/components/AdminLogoutButton";
import { SignUpForm } from "@/features/admin/components/SignUpForm";


export default function DashboardAdminPage() {
  return (
    <section className="border border-red-500">
      <AdminLogoutButton></AdminLogoutButton>
      <h1 className="text-4xl font-extrabold m-5">
        ADMINISTRADOR
      </h1>
      <h2 className="text-3xl font-extrabold m-5">
        REGISTRAR NUEVO GERENTE EN TENANT
      </h2>
      <SignUpForm tenant={"fullmotos"}></SignUpForm>
    </section>
  );
}
