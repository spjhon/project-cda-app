"use client";

import { useParams } from "next/navigation";
//import { useState, useEffect } from "react";

export default function TenantName() {
  const { tenant } = useParams();

  /** 
  // 1. Estado para controlar cuándo mostrar el spinner/cargando
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulamos una carga de 2 segundos
    const timer = setTimeout(() => {
      // 2. Aquí cambiamos el estado a falso para mostrar el nombre
      setIsLoading(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  // 3. Renderizado condicional clásico
  if (isLoading) {
    return <span>Cargando...</span>;
  }
    */

  return <strong>{tenant}</strong>;
}