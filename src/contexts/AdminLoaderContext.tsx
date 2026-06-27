"use client";

import { createContext, ReactNode } from "react";

interface AdminLoaderContext {
  children: ReactNode;
  rol: string;
}

export interface AdminContextType {
  AdminContextValue: {
    rol: string;
  };
}

export const AdminContext = createContext<AdminContextType | null>(null);

export default function ReceptionistLoaderContext({
  rol,
  children,
}: AdminLoaderContext) {
  const AdminContextValue = {
    rol: rol,
  };

  return (
    <AdminContext.Provider value={{ AdminContextValue }}>
      {children}
    </AdminContext.Provider>
  );
}
