import { cookies } from "next/headers"; // O import { headers } from "next/headers";

export default async function DynamicYear() {
  // Al invocar cookies() o headers(), Next.js marca el componente como dinámico.
  // Esto "desbloquea" el acceso a new Date() sin errores.
  await cookies(); 
  
  const year = new Date().getFullYear();
  
  return <span>{year}</span>;
}