
import { calculateVehicleRateTotal } from "@/lib/utils/calculate-vehicle-rate-total"

export interface RateFeeForScenario {
  id: string
  name: string
  description: string | null
  fee_amount: number
  iva_percentage: number | null
  vehicle_age_from: number | null
  vehicle_age_to: number | null
}

interface CalculateVehicleRateScenariosArgs {
  basePrice: number
  ivaPercentage: number | null
  fees: RateFeeForScenario[]
}

export interface VehicleRatePriceScenario {
  id: string
  label: string
  ageFrom: number | null
  ageTo: number | null
  fees: RateFeeForScenario[]
  totalPrice: number
}

export function calculateVehicleRateScenarios({
  basePrice,
  ivaPercentage,
  fees,
}: CalculateVehicleRateScenariosArgs): VehicleRatePriceScenario[] {
  const hasAgeRanges = fees.some(
    (fee) =>
      fee.vehicle_age_from !== null ||
      fee.vehicle_age_to !== null,
  )

  const fixedFees = fees.filter(
    (fee) =>
      fee.vehicle_age_from === null &&
      fee.vehicle_age_to === null,
  )

  // Sin tarifas por edad: un único precio general.
  if (!hasAgeRanges) {
    return [
      {
        id: "general",
        label: "Precio general",
        ageFrom: null,
        ageTo: null,
        fees,
        totalPrice: calculateVehicleRateTotal({
          basePrice,
          ivaPercentage,
          fees,
        }),
      },
    ]
  }

  // Cada límite marca el inicio de un nuevo intervalo.
  // Los rangos son inclusivos: [0, 2] y [3, 5].
  const boundaries = new Set<number>([0])

  for (const fee of fees) {
    if (fee.vehicle_age_from !== null && fee.vehicle_age_from >= 0) {
      boundaries.add(fee.vehicle_age_from)
    }

    if (fee.vehicle_age_to !== null && fee.vehicle_age_to >= 0) {
      boundaries.add(fee.vehicle_age_to + 1)
    }
  }

  const sortedBoundaries = [...boundaries].sort((a, b) => a - b)

  const intervals = sortedBoundaries.map((ageFrom, index) => {
    const nextBoundary = sortedBoundaries[index + 1]

    return {
      ageFrom,
      ageTo: nextBoundary === undefined ? null : nextBoundary - 1,
    }
  })

  return intervals.map(({ ageFrom, ageTo }) => {
    const applicableFees = fees.filter((fee) => {
      const isFixed =
        fee.vehicle_age_from === null &&
        fee.vehicle_age_to === null

      const matchesFrom =
        fee.vehicle_age_from === null ||
        ageFrom >= fee.vehicle_age_from

      const matchesTo =
        fee.vehicle_age_to === null ||
        ageFrom <= fee.vehicle_age_to

      return isFixed || (matchesFrom && matchesTo)
    })

    const rangedFees = applicableFees.filter(
      (fee) =>
        fee.vehicle_age_from !== null ||
        fee.vehicle_age_to !== null,
    )

    const label =
      ageTo === null
        ? `Desde ${ageFrom} años`
        : ageFrom === ageTo
          ? `${ageFrom} ${ageFrom === 1 ? "año" : "años"}`
          : `${ageFrom}–${ageTo} años`

    return {
      id: `${ageFrom}-${ageTo ?? "plus"}`,
      label,
      ageFrom,
      ageTo,
      fees: [...fixedFees, ...rangedFees],
      totalPrice: calculateVehicleRateTotal({
        basePrice,
        ivaPercentage,
        fees: [...fixedFees, ...rangedFees],
      }),
    }
  })
}
