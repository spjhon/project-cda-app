import { redirect } from "next/navigation"




export default function TenantPage() {
    redirect("/auth/login")
  return (
    <div>Si puedes leer esto es por que algo muy jodido pasó en la plataforma desde [tenant] page.tsx, este no es auth</div>
  )
}
