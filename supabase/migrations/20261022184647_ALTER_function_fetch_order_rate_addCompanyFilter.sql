
-- La firma cambia de un argumento a dos.
-- Eliminamos la versión anterior para evitar ambigüedades.
DROP FUNCTION IF EXISTS public.fetch_order_rate(UUID);

CREATE OR REPLACE FUNCTION public.fetch_order_rate(
    p_order_id UUID,
    p_company_id UUID DEFAULT NULL
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

    IF NOT FOUND THEN
        RAISE EXCEPTION 'No se encontró la orden de entrada';
    END IF;


    /*
     * 2. Calcular la edad del vehículo.
     */
    v_vehiculo_edad :=
        EXTRACT(YEAR FROM CURRENT_DATE)::INTEGER
        - v_order.vehiculo_modelo_snapshot;


    /*
     * 3. Buscar una tarifa compatible.
     *
     * Prioridad:
     *   0. Tarifa asociada a la empresa seleccionada.
     *   1. Tarifa general, sin empresas asociadas.
     *
     * Si no se encuentra una tarifa preferencial compatible,
     * se utiliza la tarifa general, si existe.
     */
    RETURN QUERY
    SELECT
        vsr.id AS rate_id,
        vsr.base_price,
        vsr.iva_percentage,

        /*
         * 4. Obtener los fees correspondientes a la tarifa
         * y a la edad del vehículo.
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

                  AND (
                      ft.vehicle_age_from IS NULL
                      OR v_vehiculo_edad >= ft.vehicle_age_from
                  )

                  AND (
                      ft.vehicle_age_to IS NULL
                      OR v_vehiculo_edad <= ft.vehicle_age_to
                  )
            ),
            '[]'::JSONB
        ) AS fees

    FROM public.vehicle_service_rate AS vsr

    WHERE vsr.tenant_id = v_order.tenant_id
      AND vsr.is_active = TRUE

      -- Tipo de servicio de la orden.
      AND vsr.service_type = v_order.service_type

      -- Tipo de vehículo.
      AND vsr.vehicle_type = v_order.vehiculo_tipo_snapshot

      -- Combustible.
      AND EXISTS (
          SELECT 1
          FROM public.vehicle_service_rate_fuels AS vsrf
          WHERE vsrf.vehicle_service_rate_id = vsr.id
            AND vsrf.tenant_id = v_order.tenant_id
            AND vsrf.fuel_type =
                v_order.vehiculo_combustible_snapshot
                    ::public.fuel_type_enum
      )

      -- Clase del vehículo.
      AND EXISTS (
          SELECT 1
          FROM public.vehicle_service_rate_classes AS vsrc
          WHERE vsrc.vehicle_service_rate_id = vsr.id
            AND vsrc.tenant_id = v_order.tenant_id
            AND vsrc.vehicle_class =
                v_order.vehiculo_clase_snapshot
                    ::public.vehicle_class_enum
      )

      -- Tipo de servicio del vehículo.
      AND EXISTS (
          SELECT 1
          FROM public.vehicle_service_rate_service_types AS vsrst
          WHERE vsrst.vehicle_service_rate_id = vsr.id
            AND vsrst.tenant_id = v_order.tenant_id
            AND vsrst.service_type =
                v_order.vehiculo_tipo_servicio_snapshot
      )

      /*
       * 5. Filtrar tarifas por empresa.
       *
       * Caso A:
       * La tarifa está asociada a la empresa seleccionada.
       *
       * Caso B:
       * La tarifa no tiene ninguna empresa asociada,
       * por lo que es una tarifa general.
       *
       * Una tarifa asociada exclusivamente a otras empresas
       * no se considera una tarifa general.
       */
      AND (
          (
              p_company_id IS NOT NULL
              AND EXISTS (
                  SELECT 1
                  FROM public.vehicle_service_rate_companies AS vsrc
                  WHERE vsrc.vehicle_service_rate_id = vsr.id
                    AND vsrc.tenant_id = v_order.tenant_id
                    AND vsrc.company_id = p_company_id
              )
          )

          OR NOT EXISTS (
              SELECT 1
              FROM public.vehicle_service_rate_companies AS vsrc
              WHERE vsrc.vehicle_service_rate_id = vsr.id
                AND vsrc.tenant_id = v_order.tenant_id
          )
      )

    /*
     * 6. La tarifa específica de la empresa tiene prioridad.
     * Si no existe, gana la tarifa general.
     */
    ORDER BY
        CASE
            WHEN p_company_id IS NOT NULL
             AND EXISTS (
                 SELECT 1
                 FROM public.vehicle_service_rate_companies AS vsrc
                 WHERE vsrc.vehicle_service_rate_id = vsr.id
                   AND vsrc.tenant_id = v_order.tenant_id
                   AND vsrc.company_id = p_company_id
             )
            THEN 0
            ELSE 1
        END,
        vsr.id

    LIMIT 1;

END;
$$;
