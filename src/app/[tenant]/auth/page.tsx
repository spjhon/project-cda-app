import { redirect } from 'next/navigation'



export default function AuthPage() {
    redirect("/auth/login")
  return (
    <div>Si puedes leer esto es por que algo muy jodido pasó en la plataforma este viene desde auth</div>
  )
}
