"use client"; // Obligatorio para usar suppressHydrationWarning

export function CurrentYear() {
  // Obtenemos el año en el cuerpo del componente
  const year = new Date().getFullYear();

  return (
    
    <span >
      {year}
    </span>
  );
}