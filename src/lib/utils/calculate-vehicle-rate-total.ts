import { OrderRateData, RateFeeForCalculation } from "../client-actions/fetch_entry_order_rate"

// =====================================================
// TIPOS DE SALIDA (lo que consume el frontend y se envía a la RPC)
// =====================================================

// Fee con sus montos ya calculados y redondeados al peso.
export interface CalculatedFee extends RateFeeForCalculation {
  iva_amount: number    // Math.round(fee_amount * iva% / 100)
  fee_total: number     // fee_amount + iva_amount
}

// Rate con todo el desglose calculado.
export interface CalculatedVehicleRate extends Omit<OrderRateData, "fees"> {
  fees: CalculatedFee[]

  // ============ Agregados del rate (redondeados al peso) ============
  baseIvaAmount: number   // Math.round(base_price * iva% / 100)
  feesSubtotal: number    // Σ fee_amount
  feesIvaTotal: number    // Σ iva_amount
  subtotal: number        // base_price + feesSubtotal
  ivaTotal: number        // baseIvaAmount + feesIvaTotal
  totalPrice: number      // subtotal + ivaTotal
           // alias de totalPrice (compatibilidad)
}

// =====================================================
// ARGUMENTOS DE ENTRADA (patrón objeto, escalable a futuro)
// =====================================================

interface CalculateVehicleRateTotalArgs {
  rates: OrderRateData[]

  // A futuro aquí se pueden agregar opciones sin romper call sites:
  // roundingMode?: "peso" | "decimales"
  // includeZeroFees?: boolean
}

// =====================================================
// MÉTODO 1: REDONDEO AL PESO (activo)
// =====================================================

export function calculateVehicleRateTotal({
  rates,
}: CalculateVehicleRateTotalArgs): CalculatedVehicleRate[] {
  return rates.map((rate) => {
    const normalizedBasePrice = Number(rate.base_price)

    // ============================================================
    // 1. IVA del precio base, redondeado al peso.
    // ============================================================
    const baseIvaAmount =
      rate.iva_percentage != null
        ? Math.round(
            normalizedBasePrice * (Number(rate.iva_percentage) / 100),
          )
        : 0

    // ============================================================
    // 2. Calcular cada fee con su IVA y su total.
    // ============================================================
    const calculatedFees: CalculatedFee[] = rate.fees.map((fee) => {
      const feeAmount = Number(fee.fee_amount)

      const ivaAmount =
        fee.iva_percentage != null
          ? Math.round(
              feeAmount * (Number(fee.iva_percentage) / 100),
            )
          : 0

      return {
        ...fee,
        iva_amount: ivaAmount,
        fee_total: feeAmount + ivaAmount,
      }
    })

    // ============================================================
    // 3. Agregados de los fees.
    // ============================================================
    const feesSubtotal = calculatedFees.reduce(
      (total, fee) => total + Number(fee.fee_amount),
      0,
    )

    const feesIvaTotal = calculatedFees.reduce(
      (total, fee) => total + fee.iva_amount,
      0,
    )

    // ============================================================
    // 4. Totales del rate.
    // ============================================================
    const subtotal = normalizedBasePrice + feesSubtotal
    const ivaTotal = baseIvaAmount + feesIvaTotal
    const totalPrice = Math.round(subtotal + ivaTotal)

    // ============================================================
    // 5. Devolver el rate con todo el desglose.
    // ============================================================
    return {
      ...rate,
      fees: calculatedFees,
      baseIvaAmount,
      feesSubtotal,
      feesIvaTotal,
      subtotal,
      ivaTotal,
      totalPrice,
     
    }
  })
}





// =====================================================
// MÉTODO 2: REDONDEO A DOS DECIMALES (comentado, para cambio futuro)
// =====================================================

/*
export function calculateVehicleRateTotal({
  rates,
}: CalculateVehicleRateTotalArgs): CalculatedVehicleRate[] {
  return rates.map((rate) => {
    const normalizedBasePrice = Number(rate.base_price)

    // ============================================================
    // 1. IVA del precio base, sin redondear todavía.
    // ============================================================
    const baseIvaAmount =
      rate.iva_percentage != null
        ? normalizedBasePrice * (Number(rate.iva_percentage) / 100)
        : 0

    // ============================================================
    // 2. Calcular cada fee con su IVA exacto (sin redondear aún).
    // ============================================================
    const calculatedFees: CalculatedFee[] = rate.fees.map((fee) => {
      const feeAmount = Number(fee.fee_amount)

      const ivaAmount =
        fee.iva_percentage != null
          ? feeAmount * (Number(fee.iva_percentage) / 100)
          : 0

      return {
        ...fee,
        iva_amount: ivaAmount,
        fee_total: feeAmount + ivaAmount,
      }
    })

    // ============================================================
    // 3. Agregados de los fees (sin redondear todavía).
    // ============================================================
    const feesSubtotal = calculatedFees.reduce(
      (total, fee) => total + Number(fee.fee_amount),
      0,
    )

    const feesIvaTotal = calculatedFees.reduce(
      (total, fee) => total + fee.iva_amount,
      0,
    )

    // ============================================================
    // 4. Totales del rate, sin redondear.
    // ============================================================
    const subtotal = normalizedBasePrice + feesSubtotal
    const ivaTotal = baseIvaAmount + feesIvaTotal
    const totalRaw = subtotal + ivaTotal

    // ============================================================
    // 5. Redondeo final a dos decimales (solo el total).
    // ============================================================
    const totalPrice =
      Math.round((totalRaw + Number.EPSILON) * 100) / 100

    // ============================================================
    // 6. Devolver el rate con todo el desglose.
    //    Nota: en este método, iva_amount y fee_total de los fees
    //    conservan decimales exactos; solo totalPrice se redondea.
    // ============================================================
    return {
      ...rate,
      fees: calculatedFees,
      baseIvaAmount,
      feesSubtotal,
      feesIvaTotal,
      subtotal,
      ivaTotal,
      totalPrice,
      price: totalPrice,
    }
  })
}
*/
