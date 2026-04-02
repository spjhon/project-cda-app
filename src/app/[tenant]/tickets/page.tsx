import { TicketList } from "@/features/tickets/components/TicketList";
import { TicketFilters } from "@/features/tickets/components/TicketsFilter";
import Link from "next/link";

export const dynamic = "force-static";

export default function TicketsPage() {
  return (
    // 2.
    <div className="max-w-300 mx-auto">
      <div className=" mt-20 space-y-8 border border-black rounded-xs p-5 mx-5 self">
        {/* Header & Actions */}
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
            Tickets
          </h1>

          <Link
            prefetch={false}
            href={"/tickets/new"}
            className="px-4 py-2 bg-primary hover:primary text-white text-sm font-medium rounded-lg shadow transition"
          >
            + Crear Ticket
          </Link>
        </div>

        <p className="text-gray-600">
          Tabla de tickets creados, se presenta paginación despues del sexto
          ticket
        </p>

        {/* 3. & 4. Ticket List Container */}
        <div className="bg-white border border-gray-200 shadow-sm rounded-xl p-6">
          <TicketFilters />
          <TicketList />
        </div>
      </div>
    </div>
  );
}
