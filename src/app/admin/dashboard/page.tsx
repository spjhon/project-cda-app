import { AdminLogoutButton } from "@/components/admin/AdminLogoutButton";
import { AdminSignUpForm } from "@/components/admin/AdminSignUpForm";


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
      <AdminSignUpForm tenant={"fullmotos"}></AdminSignUpForm>
    </section>
  );
}
