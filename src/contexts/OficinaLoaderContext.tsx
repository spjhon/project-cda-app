"use client"


import { createContext, ReactNode } from "react";


interface ReceptionistLoaderContext {
  children: ReactNode;
 rol: string;
}


export interface OficinaContextType {
  OficinaContextValue: {
    rol: string;
    
  };
}


export const OficinaContext = createContext<OficinaContextType | null>(null);


export default function ReceptionistLoaderContext({
  rol,
  children,
}: ReceptionistLoaderContext) {


const OficinaContextValue = {
  rol: rol,
}


return (
  <OficinaContext.Provider value={{ OficinaContextValue }}>
        {children}
      </OficinaContext.Provider>
)


}