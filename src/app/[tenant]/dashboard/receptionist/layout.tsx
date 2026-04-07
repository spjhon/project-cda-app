import { ReactNode } from "react";

interface AdminDashboardLayout {
  children: ReactNode;
}

export default function ReceptionistDashboardLayout({ children }: AdminDashboardLayout) {

//la idea es crear aca las promesas y pasarlo al contex del dashboarddatalayer y que se comience a procesar desde aqui, pero que la promesa se espere en el cliente.
    
  return (
    <>
    {children}
    </>
  )
}
