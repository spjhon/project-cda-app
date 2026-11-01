export interface RateFeeForCalculation {
  fee_amount: number
  iva_percentage: number | null
}

export interface VehicleRateForCalculation {
  rateId: string
  basePrice: number
  ivaPercentage: number | null
  fees: RateFeeForCalculation[]
}

interface CalculateVehicleRateTotalArgs {
  rates: VehicleRateForCalculation[]
}

export interface CalculatedVehicleRate extends VehicleRateForCalculation {
  totalPrice: number
  price: number
}

// =====================================================
// MÉTODO 1: REDONDEO AL PESO
// =====================================================

export function calculateVehicleRateTotal({
  rates,
}: CalculateVehicleRateTotalArgs): CalculatedVehicleRate[] {
  return rates.map((rate) => {
    const normalizedBasePrice = Number(rate.basePrice)

    // IVA del precio base, redondeado al peso.
    const baseIva =
      rate.ivaPercentage != null
        ? Math.round(
            normalizedBasePrice * (Number(rate.ivaPercentage) / 100),
          )
        : 0

    // Cada tarifa adicional conserva su IVA independiente,
    // redondeado al peso antes de sumarlo.
    const feesTotal = rate.fees.reduce((total, fee) => {
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
    const totalPrice = Math.round(
      normalizedBasePrice + baseIva + feesTotal,
    )

    return {
      ...rate,
      totalPrice,
      price: totalPrice,
    }
  })
}

// =====================================================
// MÉTODO 2: REDONDEO A DOS DECIMALES
// =====================================================

/*
export function calculateVehicleRateTotal({
  rates,
}: CalculateVehicleRateTotalArgs): CalculatedVehicleRate[] {
  return rates.map((rate) => {
    const normalizedBasePrice = Number(rate.basePrice)

    // IVA aplicado al precio base, conservando los decimales.
    const baseIva =
      rate.ivaPercentage != null
        ? normalizedBasePrice * (Number(rate.ivaPercentage) / 100)
        : 0

    // Cada tarifa conserva el IVA exacto,
    // sin redondearlo individualmente.
    const feesTotal = rate.fees.reduce((total, fee) => {
      const feeAmount = Number(fee.fee_amount)

      const feeIva =
        fee.iva_percentage != null
          ? feeAmount * (Number(fee.iva_percentage) / 100)
          : 0

      return total + feeAmount + feeIva
    }, 0)

    // Redondeamos únicamente el resultado final a dos decimales.
    const total = normalizedBasePrice + baseIva + feesTotal

    const totalPrice =
      Math.round((total + Number.EPSILON) * 100) / 100

    return {
      ...rate,
      totalPrice,
      price: totalPrice,
    }
  })
}
*/