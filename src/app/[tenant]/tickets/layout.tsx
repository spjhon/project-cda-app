import { Navbar } from "@/features/tickets/components/NavBar/Navbar";

import { ReactNode } from "react";

interface TicketsLayoutProps {
  children: ReactNode;
}

export default function TicketsLayout({ children }: TicketsLayoutProps) {
  return (
    <>
      <section>
        <Navbar></Navbar>
      </section>

      <section className="min-h-screen">
        
          {children}
        
      </section>
    </>
  );
}
