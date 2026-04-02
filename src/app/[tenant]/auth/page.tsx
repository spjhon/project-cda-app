import { redirect } from 'next/navigation'

export const dynamic = 'force-static' 

export default function AuthPage() {
    redirect("/tickets")
  return (
    <div>Si puedes leer esto es por que algo muy jodido pasó en la plataforma este viene desde auth</div>
  )
}
