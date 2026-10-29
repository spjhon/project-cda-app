



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

  // IVA del precio base, redondeado al peso.
  const baseIva =
    ivaPercentage != null
      ? Math.round(
          normalizedBasePrice * (Number(ivaPercentage) / 100),
        )
      : 0

  // Cada tarifa adicional conserva su IVA independiente,
  // redondeado al peso antes de sumarlo.
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

  // Total final en pesos enteros.
  return Math.round(normalizedBasePrice + baseIva + feesTotal)
}







/** 
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

  // IVA aplicado al precio base, conservando los decimales.
  const baseIva =
    ivaPercentage != null
      ? normalizedBasePrice * (Number(ivaPercentage) / 100)
      : 0

  // Cada tarifa conserva el IVA exacto, sin redondearlo individualmente.
  const feesTotal = fees.reduce((total, fee) => {
    const feeAmount = Number(fee.fee_amount)

    const feeIva =
      fee.iva_percentage != null
        ? feeAmount * (Number(fee.iva_percentage) / 100)
        : 0

    return total + feeAmount + feeIva
  }, 0)

  // Redondeamos únicamente el resultado final a dos decimales.
  const total = normalizedBasePrice + baseIva + feesTotal

 

  return Math.round((total + Number.EPSILON) * 100) / 100
}*/