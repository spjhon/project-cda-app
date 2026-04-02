"use client";

import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectGroup,
} from "@/components/ui/select";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

const statusLabels: Record<string, string> = {
  open: "Abierto",
  in_progress: "En progreso",
  done: "Finalizado",
  cancelled: "Cancelado",
  information_missing: "Falta información",
};

const statusStyles: Record<string, string> = {
  open: "bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-100/80",
  in_progress: "bg-blue-100 text-blue-700 border-blue-200 hover:bg-blue-100/80",
  done: "bg-emerald-100 text-emerald-700 border-emerald-200 hover:bg-emerald-100/80",
  cancelled: "bg-red-100 text-red-700 border-red-200 hover:bg-red-100/80",
  information_missing:
    "bg-amber-100 text-amber-700 border-amber-200 hover:bg-amber-100/80",
};

export default function TicketStatusSelect({
  user_id,
  currentStatus,
  ticket_id,
  setCurrentStatus,
}: {
  user_id: string;
  currentStatus: string;
  ticket_id: string;
  setCurrentStatus: React.Dispatch<React.SetStateAction<string>>;
}) {
  const [isLoading, setIsLoading] = useState(false);

  const supabaseBrowser = createSupabaseBrowserClient();
  const router = useRouter();

  const handleStatusChange = async (value: string | null) => {
    if (!value) return;
    setIsLoading(true);

    try {
      const { data: finaleUpdateStatus, error: errorUpdatingStatus } =
        await supabaseBrowser
          .from("tickets")
          .update({ status: value })
          .eq("created_by", user_id)
          .eq("id", ticket_id)
          .select() // <--- OBLIGATORIO para recibir la fila actualizada
          .single();

      if (!finaleUpdateStatus || errorUpdatingStatus) {
        throw new Error(
          "Error actualizando estatus: " + errorUpdatingStatus.message,
        );
      }

      setCurrentStatus(finaleUpdateStatus.status);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Error actualizando el status.";
      console.log(message);
    } finally {
      setIsLoading(false);
      router.refresh();
    }
  };

  return (
    <Select
      onValueChange={handleStatusChange}
      disabled={isLoading}
      value={currentStatus}
    >
      <SelectTrigger className="w-35">
        <SelectValue placeholder={currentStatus} />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          {Object.entries(statusLabels).map(([value, label]) => (
            <SelectItem key={value} value={value} className="capitalize">
              <div className="flex items-center gap-2">
                {/* Opcional: Un pequeño punto de color usando tus statusStyles */}
                <span
                  className={`h-2 w-2 rounded-full ${statusStyles[value]?.split(" ")[0] || "bg-slate-400"}`}
                />
                {label}
              </div>
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}
