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

  // IVA aplicado exclusivamente al precio base.
  // Se redondea individualmente antes de sumarlo.
  const baseIva =
    ivaPercentage != null
      ? Math.round(
          normalizedBasePrice * (Number(ivaPercentage) / 100),
        )
      : 0

  // Cada fee conserva su propio IVA independiente.
  // El IVA de cada fee se redondea individualmente.
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

  // Precio final: precio base + IVA base + cada fee con su IVA.
  return Math.round(normalizedBasePrice + baseIva + feesTotal)
}