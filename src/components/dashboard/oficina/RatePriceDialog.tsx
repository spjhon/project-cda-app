"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { calculateVehicleRateScenarios } from "@/lib/utils/calculate-vehicle-rate-scenarios";
import { VehicleRate } from "@/lib/client-actions/fetch_rates";

interface RatePriceDialogProps {
  rate: VehicleRate;
}

const formatCurrency = (value: number) => `$${value.toLocaleString("es-CO")}`;

const calculateIva = (amount: number, percentage: number | null) =>
  percentage != null ? Math.round(amount * (Number(percentage) / 100)) : 0;

export function RatePriceDialog({ rate }: RatePriceDialogProps) {
  const scenarios = calculateVehicleRateScenarios({
    basePrice: rate.base_price,
    ivaPercentage: rate.iva_percentage,
    fees: rate.fees,
  });

  const basePrice = Number(rate.base_price);
  const baseIva = calculateIva(basePrice, rate.iva_percentage);

  return (
    <Dialog>
      <DialogTrigger render={<Button variant="outline" size="sm" />}>
        Ver precios
      </DialogTrigger>

      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader className="space-y-3">
          <div>
            <DialogTitle className="text-xl">Desglose de precios</DialogTitle>
            <DialogDescription>
              Consulta el precio base, los impuestos y las tarifas adicionales
              según la edad del vehículo.
            </DialogDescription>
          </div>

          <div className="grid grid-cols-2 gap-3 rounded-lg border bg-muted/30 p-3 sm:grid-cols-3">
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">
                Tarifa configurada
              </p>
              <p className="text-sm font-medium">{rate.name}</p>
            </div>

            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Tipo de vehículo</p>
              <p className="text-sm font-medium">{rate.vehicle_type}</p>
            </div>

            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Tipo de servicio</p>
              <p className="text-sm font-medium">{rate.service_type}</p>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-5">
          {scenarios.map((scenario) => (
            <section
              key={scenario.id}
              className="overflow-hidden rounded-xl border"
            >
              {/* Encabezado del escenario */}
              <div className="border-b bg-muted/30 px-4 py-3">
                <h3 className="font-semibold">{scenario.label}</h3>
              </div>

              <div className="space-y-4 p-4">
                {/* Precio base: misma estructura visual que cada tarifa */}
                <div className="space-y-1 py-3 first:pt-0">
                  <div className="flex items-start justify-between gap-4 text-sm">
                    <span className="font-medium">Precio base</span>
                    <span className="shrink-0 tabular-nums">
                      {formatCurrency(basePrice)}
                    </span>
                  </div>

                  <div className="flex justify-between gap-4 text-sm text-muted-foreground">
                    <span>
                      IVA del precio base ({rate.iva_percentage ?? 0}%)
                    </span>
                    <span className="shrink-0 tabular-nums">
                      {formatCurrency(baseIva)}
                    </span>
                  </div>
                </div>

                <div className="border-t border-border/60" />

                {/* Tarifas adicionales con separación sutil */}
                {scenario.fees.length > 0 ? (
                  <div className="divide-y">
                    {scenario.fees.map((fee) => {
                      const feeAmount = Number(fee.fee_amount);
                      const feeIva = calculateIva(
                        feeAmount,
                        fee.iva_percentage,
                      );

                      return (
                        <div
                          key={fee.id}
                          className="space-y-1 py-3 first:pt-0 last:pb-0"
                        >
                          <div className="flex items-start justify-between gap-4 text-sm">
                            <span className="font-medium">{fee.name}</span>
                            <span className="shrink-0 tabular-nums">
                              {formatCurrency(feeAmount)}
                            </span>
                          </div>

                          {fee.iva_percentage != null && (
                            <div className="flex justify-between gap-4 text-sm text-muted-foreground">
                              <span>IVA ({fee.iva_percentage}%)</span>
                              <span className="shrink-0 tabular-nums">
                                {formatCurrency(feeIva)}
                              </span>
                            </div>
                          )}

                          {fee.description && (
                            <p className="text-xs leading-relaxed text-muted-foreground">
                              {fee.description}
                            </p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    No hay tarifas adicionales configuradas para este intervalo.
                  </p>
                )}

                {/* Total final */}
                <div className="flex items-center justify-between gap-4 border-t pt-4">
                  <span className="font-semibold">Total</span>
                  <span className="text-xl font-bold tabular-nums text-emerald-700 dark:text-emerald-400">
                    {formatCurrency(scenario.totalPrice)}
                  </span>
                </div>
              </div>
            </section>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
