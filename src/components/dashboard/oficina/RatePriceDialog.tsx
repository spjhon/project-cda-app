
"use client"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { calculateVehicleRateScenarios } from "@/lib/utils/calculate-vehicle-rate-scenarios"
import { VehicleRate } from "@/lib/client-actions/fetch_rates"


interface RatePriceDialogProps {
  rate: VehicleRate
}

const formatCurrency = (value: number) =>
  `$${value.toLocaleString("es-CO")}`

const calculateIva = (
  amount: number,
  percentage: number | null,
) =>
  percentage != null
    ? Math.round(amount * (Number(percentage) / 100))
    : 0

export function RatePriceDialog({ rate }: RatePriceDialogProps) {
  const scenarios = calculateVehicleRateScenarios({
    basePrice: rate.base_price,
    ivaPercentage: rate.iva_percentage,
    fees: rate.fees,
  })

  const basePrice = Number(rate.base_price)
  const baseIva = calculateIva(basePrice, rate.iva_percentage)

  return (
    <Dialog>
      <DialogTrigger render={<Button variant="outline" size="sm" />}>
        Ver precios
      </DialogTrigger>

      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Precios de la tarifa</DialogTitle>
          <DialogDescription>
            {rate.name} · {rate.vehicle_type}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5">
          <section className="rounded-lg border p-4">
            <h3 className="mb-3 font-semibold">Precio base</h3>

            <div className="flex justify-between gap-4 text-sm">
              <span>Valor base</span>
              <span>{formatCurrency(basePrice)}</span>
            </div>

            <div className="mt-2 flex justify-between gap-4 text-sm">
              <span>IVA del precio base ({rate.iva_percentage ?? 0}%)</span>
              <span>{formatCurrency(baseIva)}</span>
            </div>
          </section>

          {scenarios.map((scenario) => {
            const feesIva = scenario.fees.reduce(
              (total, fee) =>
                total +
                calculateIva(
                  Number(fee.fee_amount),
                  fee.iva_percentage,
                ),
              0,
            )

            const feesBase = scenario.fees.reduce(
              (total, fee) => total + Number(fee.fee_amount),
              0,
            )

            return (
              <section
                key={scenario.id}
                className="rounded-lg border p-4"
              >
                <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                  <h3 className="font-semibold">
                    {scenario.label}
                  </h3>

                  <span className="font-bold text-emerald-700 dark:text-emerald-400">
                    {formatCurrency(scenario.totalPrice)}
                  </span>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between gap-4">
                    <span>Precio base + IVA</span>
                    <span>{formatCurrency(basePrice + baseIva)}</span>
                  </div>

                  {scenario.fees.length > 0 ? (
                    scenario.fees.map((fee) => {
                      const feeAmount = Number(fee.fee_amount)
                      const feeIva = calculateIva(
                        feeAmount,
                        fee.iva_percentage,
                      )

                      return (
                        <div
                          key={fee.id}
                          className="border-t pt-2"
                        >
                          <div className="flex justify-between gap-4">
                            <span>{fee.name}</span>
                            <span>{formatCurrency(feeAmount)}</span>
                          </div>

                          {fee.iva_percentage != null && (
                            <div className="mt-1 flex justify-between gap-4 text-muted-foreground">
                              <span>
                                IVA ({fee.iva_percentage}%)
                              </span>
                              <span>{formatCurrency(feeIva)}</span>
                            </div>
                          )}

                          {fee.description && (
                            <p className="mt-1 text-xs text-muted-foreground">
                              {fee.description}
                            </p>
                          )}
                        </div>
                      )
                    })
                  ) : (
                    <p className="text-muted-foreground">
                      No hay tarifas adicionales configuradas para este intervalo.
                    </p>
                  )}

                  <div className="flex justify-between gap-4 border-t pt-3 font-semibold">
                    <span>Subtotal de tarifas</span>
                    <span>{formatCurrency(feesBase)}</span>
                  </div>

                  <div className="flex justify-between gap-4">
                    <span>IVA de tarifas</span>
                    <span>{formatCurrency(feesIva)}</span>
                  </div>

                  <div className="flex justify-between gap-4 border-t pt-3 text-base font-bold">
                    <span>Total</span>
                    <span className="text-emerald-700 dark:text-emerald-400">
                      {formatCurrency(scenario.totalPrice)}
                    </span>
                  </div>
                </div>
              </section>
            )
          })}
        </div>
      </DialogContent>
    </Dialog>
  )
}
