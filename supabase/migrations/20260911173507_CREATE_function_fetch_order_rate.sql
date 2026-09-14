CREATE OR REPLACE FUNCTION public.fetch_order_rate(
    p_order_id UUID
)
RETURNS TABLE (
    rate_id UUID,
    base_price NUMERIC(12,2),
    iva_percentage NUMERIC(5,2),
    fees JSONB
)
LANGUAGE plpgsql
STABLE
SECURITY INVOKER
SET search_path = public
AS $$
DECLARE
    v_order RECORD;
    v_vehiculo_edad INTEGER;
BEGIN

    /*
     * 1. Obtener la información necesaria de la orden.
     */
    SELECT
        eo.id,
        eo.tenant_id,
        eo.service_type,
        eo.vehiculo_tipo_snapshot,
        eo.vehiculo_clase_snapshot,
        eo.vehiculo_combustible_snapshot,
        eo.vehiculo_tipo_servicio_snapshot,
        eo.vehiculo_modelo_snapshot
    INTO v_order
    FROM public.entry_orders AS eo
    WHERE eo.id = p_order_id;

    /*
     * La orden no existe.
     */
    IF NOT FOUND THEN
        RAISE EXCEPTION 'No se encontró la orden de entrada';
    END IF;


    /*
     * 2. Calcular la edad del vehículo.
     *
     * Regla:
     *
     * año actual - año del modelo
     *
     * Ejemplo:
     *
     * Año actual: 2026
     * Modelo:     2024
     *
     * Edad = 2
     *
     * No se tienen en cuenta meses ni días.
     */
    v_vehiculo_edad :=
        extract(year FROM current_date)::INTEGER
        - v_order.vehiculo_modelo_snapshot;


    /*
     * 3. Buscar la tarifa que corresponda
     *    a las características de la orden.
     */
    RETURN QUERY
    SELECT
        vsr.id AS rate_id,
        vsr.base_price,
        vsr.iva_percentage,

        /*
         * 4. Obtener los fees correspondientes
         *    a esta tarifa y a la edad del vehículo.
         */
        COALESCE(
            (
                SELECT jsonb_agg(
                    jsonb_build_object(
                        'id', ft.id,
                        'tenant_id', ft.tenant_id,
                        'name', ft.name,
                        'description', ft.description,
                        'fee_amount', ft.fee_amount,
                        'iva_percentage', ft.iva_percentage,
                        'vehicle_age_from', ft.vehicle_age_from,
                        'vehicle_age_to', ft.vehicle_age_to,
                        'created_at', ft.created_at,
                        'updated_at', ft.updated_at
                    )
                    ORDER BY ft.created_at
                )
                FROM public.fee_types AS ft
                WHERE ft.vehicle_service_rate_id = vsr.id
                  AND ft.tenant_id = v_order.tenant_id

                  /*
                   * Sin edad mínima:
                   * el fee aplica independientemente
                   * de la edad del vehículo.
                   *
                   * Con edad mínima:
                   * la edad debe ser >= al mínimo.
                   */
                  AND (
                      ft.vehicle_age_from IS NULL
                      OR v_vehiculo_edad >= ft.vehicle_age_from
                  )

                  /*
                   * Sin edad máxima:
                   * el fee aplica independientemente
                   * de la edad del vehículo.
                   *
                   * Con edad máxima:
                   * la edad debe ser <= al máximo.
                   */
                  AND (
                      ft.vehicle_age_to IS NULL
                      OR v_vehiculo_edad <= ft.vehicle_age_to
                  )
            ),
            '[]'::JSONB
        ) AS fees

    FROM public.vehicle_service_rate AS vsr

    WHERE vsr.tenant_id = v_order.tenant_id

      /*
       * Solo tarifas activas.
       */
      AND vsr.is_active = TRUE

      /*
       * RTM, preventiva, peritaje, etc.
       */
      AND vsr.service_type = v_order.service_type

      /*
       * Liviano, pesado, motocicleta, etc.
       */
      AND vsr.vehicle_type = v_order.vehiculo_tipo_snapshot

      /*
       * Combustible.
       *
       * La orden guarda character varying,
       * mientras que la tabla de tarifas
       * utiliza fuel_type_enum.
       */
      AND EXISTS (
          SELECT 1
          FROM public.vehicle_service_rate_fuels AS vsrf
          WHERE vsrf.vehicle_service_rate_id = vsr.id
            AND vsrf.tenant_id = v_order.tenant_id
            AND vsrf.fuel_type =
                v_order.vehiculo_combustible_snapshot::public.fuel_type_enum
      )

      /*
       * Clase del vehículo.
       *
       * La orden guarda character varying,
       * mientras que la tabla de tarifas
       * utiliza vehicle_class_enum.
       */
      AND EXISTS (
          SELECT 1
          FROM public.vehicle_service_rate_classes AS vsrc
          WHERE vsrc.vehicle_service_rate_id = vsr.id
            AND vsrc.tenant_id = v_order.tenant_id
            AND vsrc.vehicle_class =
                v_order.vehiculo_clase_snapshot::public.vehicle_class_enum
      )

      /*
       * Tipo de servicio del vehículo:
       *
       * particular
       * enseñanza
       * oficial
       * publico
       * diplomático
       * especial
       */
      AND EXISTS (
          SELECT 1
          FROM public.vehicle_service_rate_service_types AS vsrst
          WHERE vsrst.vehicle_service_rate_id = vsr.id
            AND vsrst.tenant_id = v_order.tenant_id
            AND vsrst.service_type =
                v_order.vehiculo_tipo_servicio_snapshot
      )

    /*
     * En condiciones normales debería existir
     * una única tarifa compatible.
     */
    LIMIT 1;

END;
$$;