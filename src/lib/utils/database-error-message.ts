
interface DatabaseError {
  code?: string
  message?: string
  details?: string
  hint?: string
}

export function getDatabaseErrorMessage(
  error: DatabaseError,
): string {
  // Violación de una llave foránea en PostgreSQL
  if (
    error.code === "23503" ||
    error.message?.includes(
      "entry_orders_vehicle_service_rate_id_fkey",
    )
  ) {
    return "No se puede eliminar esta tarifa porque está asociada a una o varias órdenes de ingreso. Para conservar el historial, elimina o reasigna primero esas referencias, si corresponde."
  }

  return "No fue posible completar la operación. Inténtalo nuevamente."
}
