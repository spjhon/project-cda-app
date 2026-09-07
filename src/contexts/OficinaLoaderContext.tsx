// contexts/OficinaLoaderContext.tsx
"use client";

import { createContext, ReactNode } from "react";

// 📋 Tipos del contexto
// contexts/OficinaLoaderContext.tsx
export interface OficinaContextType {
  rol: string;

  // Mutation para crear fee
}

// 📋 Props del provider
interface OficinaLoaderContextProps {
  children: ReactNode;
  rol: string;
}

// Crear el contexto
export const OficinaContext = createContext<OficinaContextType | null>(null);

// Provider
export default function OficinaLoaderContext({
  children,
  rol,
}: OficinaLoaderContextProps) {
  // 📦 Valor del contexto
  const contextValue: OficinaContextType = {
    rol,
  };

  return (
    <OficinaContext.Provider value={contextValue}>
      {children}
    </OficinaContext.Provider>
  );
}
