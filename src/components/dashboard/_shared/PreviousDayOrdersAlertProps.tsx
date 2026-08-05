"use client";

import { AlertTriangle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

import { useContext } from "react";
import { EntryOrdersContext } from "@/contexts/EntryOrdersContext";


export default function PreviousDayOrdersAlert() {


    const EntryOrdersContextRecived = useContext(EntryOrdersContext);

  const { ordenesDelDiaAnteriorQuery} = EntryOrdersContextRecived?.entryOrdersTableData || {};



  const {
     pendingPreviousDayOrders,
        isLoadingPendingPreviousDayOrders,
        isPendingPreviousDayOrdersError,
        pendingPreviousDayOrdersError,
  } = ordenesDelDiaAnteriorQuery || {};




  if (isLoadingPendingPreviousDayOrders) return null;

  if (isPendingPreviousDayOrdersError) return null;

  if (!pendingPreviousDayOrders?.length) return null;


  if (isPendingPreviousDayOrdersError) {
  return (
    <Card className="border-destructive bg-destructive/10">
      <div className="p-4">
        <p className="font-bold text-destructive">
          No fue posible verificar si existen órdenes pendientes de días anteriores.
        </p>

        <p className="mt-1 text-sm text-muted-foreground">
          {pendingPreviousDayOrdersError?.message}
        </p>
      </div>
    </Card>
  );
}

  return (
    <Card className="mb-6 border-2 border-destructive bg-destructive/10 shadow-lg animate-pulse">
      <div className="p-6">
        <div className="flex items-center gap-4">
          <AlertTriangle className="h-12 w-12 text-destructive shrink-0" />

          <div className="flex-1">
            <h2 className="text-xl font-black uppercase tracking-wide text-destructive">
              ⚠ Atención
            </h2>

            <p className="mt-1 text-sm font-semibold text-destructive">
              Existen{" "}
              <span className="font-black">
                {pendingPreviousDayOrders.length}
              </span>{" "}
              órdenes de entrada de días anteriores que aún no han sido
              finalizadas.
            </p>

            <p className="mt-2 text-xs text-destructive/80">
              Antes de continuar creando nuevas órdenes, revise las siguientes:
            </p>
          </div>
        </div>

        <div className="mt-6 rounded-lg border border-destructive/30 bg-background">
          {pendingPreviousDayOrders.map((order) => (
            <div
              key={order.id}
              className="flex items-center justify-between border-b last:border-b-0 border-destructive/20 px-4 py-3"
            >
              <div>
                <p className="font-bold">
                  Orden #{order.consecutivo}
                </p>

                <p className="text-sm text-muted-foreground">
                  Placa: {order.vehiculo_placa_snapshot}
                </p>
              </div>

              <span className="rounded-full bg-destructive px-3 py-1 text-xs font-bold uppercase text-destructive-foreground">
                {order.estado_orden}
              </span>
            </div>
          ))}
        </div>

        <div className="mt-5 flex justify-end">
          <Button
            variant="destructive"
            onClick={() => window.location.reload()}
          >
            Ya las finalicé - Actualizar
          </Button>
        </div>
      </div>
    </Card>
  );
}