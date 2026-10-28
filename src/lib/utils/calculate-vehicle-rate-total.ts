export interface RateFeeForCalculation {
  fee_amount: number
  iva_percentage: number | null
}

interface CalculateVehicleRateTotalArgs {
  basePrice: number
  ivaPercentage: number | null
  fees: RateFeeForCalculation[]
}

export function calculateVehicleRateTotal({
  basePrice,
  ivaPercentage,
  fees,
}: CalculateVehicleRateTotalArgs): number {
  const normalizedBasePrice = Number(basePrice)

  // IVA del precio base, redondeado individualmente.
  const baseIva =
    ivaPercentage != null
      ? Math.round(
          normalizedBasePrice * (Number(ivaPercentage) / 100),
        )
      : 0

  // Valor de cada fee más su propio IVA.
  const feesTotal = fees.reduce((total, fee) => {
    const feeAmount = Number(fee.fee_amount)

    const feeIva =
      fee.iva_percentage != null
        ? Math.round(
            feeAmount * (Number(fee.iva_percentage) / 100),
          )
        : 0

    return total + feeAmount + feeIva
  }, 0)

  // Precio base + IVA base + fees con sus respectivos IVA.
  return Math.round(normalizedBasePrice + baseIva + feesTotal)
}