-- ============================================================
-- DROP de la firma anterior (cambia la lista de parámetros)
-- ============================================================
DROP FUNCTION IF EXISTS public.update_office_order_data(
    uuid,                    -- p_order_id
    character varying,       -- p_pin
    character varying,       -- p_consecutivo_factura
    boolean,                 -- p_se_compro_soat
    uuid,                    -- p_vehicle_service_rate_id
    numeric,                 -- p_rate_price_snapshot
    uuid,                    -- p_company_id
    jsonb                    -- p_payments
);

-- ============================================================
-- NUEVA VERSIÓN con snapshot de precio
-- ============================================================
CREATE OR REPLACE FUNCTION public.update_office_order_data(
    p_order_id uuid,
    p_pin character varying,
    p_consecutivo_factura character varying,
    p_se_compro_soat boolean,
    p_vehicle_service_rate_id uuid,
    p_rate_price_snapshot numeric(12, 2),
    p_company_id uuid,
    p_payments jsonb,
    p_price_snapshot jsonb DEFAULT NULL   -- 👈 NUEVO
)
RETURNS text
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
DECLARE
    v_estado_actual public.order_status_enum;
    v_tenant_id uuid;
    v_es_reinspeccion boolean;

    v_company_name text := NULL;
    v_company_nit text := NULL;

    v_payment jsonb;
    v_payment_method public.office_payment_type_enum;
    v_monto numeric(12, 2);
    v_num_comprobante text;

    v_total_pagos numeric(12, 2) := 0;

    -- 👇 NUEVO: variables para el snapshot
    v_snapshot_id uuid;
    v_fee jsonb;
BEGIN

    -- ========================================================
    -- 1. Obtener la orden
    -- ========================================================
    SELECT
        estado_orden,
        tenant_id,
        es_reinspeccion
    INTO
        v_estado_actual,
        v_tenant_id,
        v_es_reinspeccion
    FROM public.entry_orders
    WHERE id = p_order_id;

    IF NOT FOUND THEN
        RAISE EXCEPTION
            'La orden de entrada con ID % no existe.',
            p_order_id;
    END IF;


    -- ========================================================
    -- 2. Validar estado de la orden
    -- ========================================================
    IF v_estado_actual IN (
        'finalizada'::public.order_status_enum,
        'anulada'::public.order_status_enum
    ) THEN
        RAISE EXCEPTION
            'Operación denegada: La orden % no se puede modificar porque su estado actual es "%".',
            p_order_id,
            v_estado_actual;
    END IF;


    -- ========================================================
    -- 3. Validar consecutivo de factura
    -- ========================================================
    IF p_consecutivo_factura IS NULL
       OR TRIM(p_consecutivo_factura) = '' THEN
        RAISE EXCEPTION
            'Operación cancelada: No se ha registrado un consecutivo de factura.';
    END IF;


    -- ========================================================
    -- 4. Validar tarifa
    -- ========================================================
    IF p_vehicle_service_rate_id IS NULL THEN
        RAISE EXCEPTION
            'Operación cancelada: No se ha seleccionado una tarifa.';
    END IF;

    IF p_rate_price_snapshot IS NULL
       OR p_rate_price_snapshot < 0 THEN
        RAISE EXCEPTION
            'Operación cancelada: El valor de la tarifa no es válido.';
    END IF;


    -- ========================================================
    -- 5. Validar que la tarifa pertenezca al mismo tenant
    -- ========================================================
    IF NOT EXISTS (
        SELECT 1
        FROM public.vehicle_service_rate
        WHERE id = p_vehicle_service_rate_id
          AND tenant_id = v_tenant_id
    ) THEN
        RAISE EXCEPTION
            'Operación cancelada: La tarifa seleccionada no pertenece al tenant de la orden.';
    END IF;


    -- ========================================================
    -- 6. Obtener y validar la empresa seleccionada
    -- ========================================================
    IF p_company_id IS NOT NULL THEN

        SELECT
            tc.name,
            tc.nit
        INTO
            v_company_name,
            v_company_nit
        FROM public.tenants_company AS tc
        WHERE tc.id = p_company_id
          AND tc.tenant_id = v_tenant_id
          AND tc.deleted_at IS NULL;

        IF NOT FOUND THEN
            RAISE EXCEPTION
                'Operación cancelada: La empresa no existe, está eliminada o no pertenece al tenant de la orden.';
        END IF;

    END IF;


    -- ========================================================
    -- 7. Validar payments (permitir vacío en reinspección)
    -- ========================================================
    IF p_payments IS NULL
       OR jsonb_typeof(p_payments) <> 'array' THEN
        RAISE EXCEPTION
            'Operación cancelada: payments inválido.';
    END IF;

    IF jsonb_array_length(p_payments) = 0
       AND COALESCE(v_es_reinspeccion, false) = false THEN
        RAISE EXCEPTION
            'Operación cancelada: Debe registrar al menos un método de pago.';
    END IF;


    -- ========================================================
    -- 8. Validar cada payment
    -- ========================================================
    FOR v_payment IN
        SELECT value
        FROM jsonb_array_elements(p_payments)
    LOOP

        IF v_payment->>'paymentMethod' IS NULL
           OR TRIM(v_payment->>'paymentMethod') = '' THEN
            RAISE EXCEPTION
                'Operación cancelada: Todos los pagos deben tener un método de pago seleccionado.';
        END IF;

        BEGIN
            v_payment_method :=
                (v_payment->>'paymentMethod')
                ::public.office_payment_type_enum;

        EXCEPTION
            WHEN invalid_text_representation THEN
                RAISE EXCEPTION
                    'Operación cancelada: El método de pago "%" no es válido.',
                    v_payment->>'paymentMethod';
        END;

        BEGIN
            v_monto :=
                (v_payment->>'amount')::numeric;

        EXCEPTION
            WHEN invalid_text_representation THEN
                RAISE EXCEPTION
                    'Operación cancelada: El valor de un pago no es válido.';
        END;

        IF v_monto IS NULL OR v_monto < 0 THEN
            RAISE EXCEPTION
                'Operación cancelada: Todos los pagos deben tener un valor 0 o mayor.';
        END IF;

        v_num_comprobante :=
            NULLIF(
                TRIM(
                    COALESCE(
                        v_payment->>'receiptNumber',
                        ''
                    )
                ),
                ''
            );

        IF v_payment_method IN (
            'tarjeta_debito'::public.office_payment_type_enum,
            'tarjeta_credito'::public.office_payment_type_enum
        )
        AND v_num_comprobante IS NULL THEN
            RAISE EXCEPTION
                'Operación cancelada: Las transacciones con tarjeta requieren un número de voucher o comprobante.';
        END IF;

        v_total_pagos := v_total_pagos + v_monto;

    END LOOP;


    -- ========================================================
    -- 9. Validar que el total pagado coincida con la tarifa
    -- ========================================================
    IF v_total_pagos <> p_rate_price_snapshot THEN
        RAISE EXCEPTION
            'Operación cancelada: El total de los pagos ($%) no coincide con el valor a pagar ($%).',
            v_total_pagos,
            p_rate_price_snapshot;
    END IF;


    -- ========================================================
    -- 10. Actualizar la orden
    -- ========================================================
    UPDATE public.entry_orders
    SET
        oficina_pin =
            NULLIF(TRIM(p_pin), ''),

        oficina_consecutivo_factura =
            NULLIF(TRIM(p_consecutivo_factura), ''),

        se_compro_soat =
            COALESCE(p_se_compro_soat, false),

        vehicle_service_rate_id =
            p_vehicle_service_rate_id,

        rate_price_snapshot =
            p_rate_price_snapshot,

        company_id =
            p_company_id,

        company_name_snapshot =
            v_company_name,

        company_nit_snapshot =
            v_company_nit,

        estado_orden =
            'en_prueba'::public.order_status_enum

    WHERE id = p_order_id;


    -- ========================================================
    -- 11. Reemplazar los pagos anteriores
    -- ========================================================
    DELETE FROM public.entry_order_payments
    WHERE entry_order_id = p_order_id;


    -- ========================================================
    -- 12. Insertar los nuevos pagos
    -- ========================================================
    FOR v_payment IN
        SELECT value
        FROM jsonb_array_elements(p_payments)
    LOOP

        v_payment_method :=
            (v_payment->>'paymentMethod')
            ::public.office_payment_type_enum;

        v_monto :=
            (v_payment->>'amount')::numeric;

        v_num_comprobante :=
            NULLIF(
                TRIM(
                    COALESCE(
                        v_payment->>'receiptNumber',
                        ''
                    )
                ),
                ''
            );

        INSERT INTO public.entry_order_payments (
            tenant_id,
            entry_order_id,
            payment_method,
            monto_bruto,
            num_comprobante
        )
        VALUES (
            v_tenant_id,
            p_order_id,
            v_payment_method,
            v_monto,
            v_num_comprobante
        );

    END LOOP;


    -- ========================================================
    -- 13. SNAPSHOT DEL PRECIO
    -- ========================================================
    -- Solo si viene (no es reinspección).
    --
    -- Estrategia de edición:
    --   1. DELETE del snapshot anterior (cascade borra sus fees).
    --   2. INSERT de la nueva cabecera.
    --   3. INSERT de los nuevos fees.
    --
    -- El trigger de inmutabilidad solo bloquea UPDATE, no DELETE,
    -- así que este patrón es válido.
    -- ========================================================
    IF p_price_snapshot IS NOT NULL THEN

        -- 13.1 Borrar snapshot anterior (si existe).
        --       El ON DELETE CASCADE de entry_order_fee_snapshot
        --       borra los fees hijos automáticamente.
        DELETE FROM public.entry_order_price_snapshot
        WHERE entry_order_id = p_order_id;


        -- 13.2 Insertar la nueva cabecera.
        INSERT INTO public.entry_order_price_snapshot (
            tenant_id,
            entry_order_id,
            vehicle_service_rate_name,
            base_price,
            base_price_iva_percentage,
            base_price_iva_amount,
            fees_subtotal,
            fees_iva_total,
            subtotal,
            iva_total,
            total
        ) VALUES (
            v_tenant_id,
            p_order_id,
            (p_price_snapshot->>'rateName')::text,
            (p_price_snapshot->>'basePrice')::numeric(12,2),
            NULLIF(p_price_snapshot->>'baseIvaPercentage', '')::numeric(5,2),
            (p_price_snapshot->>'baseIvaAmount')::numeric(12,2),
            (p_price_snapshot->>'feesSubtotal')::numeric(12,2),
            (p_price_snapshot->>'feesIvaTotal')::numeric(12,2),
            (p_price_snapshot->>'subtotal')::numeric(12,2),
            (p_price_snapshot->>'ivaTotal')::numeric(12,2),
            (p_price_snapshot->>'total')::numeric(12,2)
        )
        RETURNING id INTO v_snapshot_id;


        -- 13.3 Insertar cada fee del snapshot.
        FOR v_fee IN
            SELECT value
            FROM jsonb_array_elements(p_price_snapshot->'fees')
        LOOP

            INSERT INTO public.entry_order_fee_snapshot (
                tenant_id,
                entry_order_price_snapshot_id,
                fee_name,
                fee_description,
                vehicle_age_years,
                vehicle_age_from,
                vehicle_age_to,
                fee_amount,
                iva_percentage,
                iva_amount,
                fee_total
            ) VALUES (
                v_tenant_id,
                v_snapshot_id,
                (v_fee->>'feeName')::text,
                NULLIF(v_fee->>'feeDescription', ''),
                NULLIF(v_fee->>'vehicleAgeYears', '')::integer,
                NULLIF(v_fee->>'vehicleAgeFrom', '')::integer,
                NULLIF(v_fee->>'vehicleAgeTo', '')::integer,
                (v_fee->>'feeAmount')::numeric(12,2),
                COALESCE(NULLIF(v_fee->>'ivaPercentage', '')::numeric(5,2), 0),
                (v_fee->>'ivaAmount')::numeric(12,2),
                (v_fee->>'feeTotal')::numeric(12,2)
            );

        END LOOP;

    ELSE
        -- Si p_price_snapshot es NULL (reinspección), borrar cualquier
        -- snapshot previo que hubiera quedado de una edición anterior.
        DELETE FROM public.entry_order_price_snapshot
        WHERE entry_order_id = p_order_id;
    END IF;


    RETURN 'Datos guardados con éxito';

END;
$$;

-- ============================================================
-- PERMISOS
-- ============================================================
-- Al recrear la función (por el cambio de firma), los permisos
-- anteriores se pierden y PostgreSQL otorga EXECUTE a PUBLIC
-- por defecto. Hay que revocarlo y dar acceso explícito.
-- ============================================================

-- 1. Revocar el acceso público (cierra la puerta a anon)
REVOKE EXECUTE ON FUNCTION public.update_office_order_data(
    uuid,                    -- p_order_id
    character varying,       -- p_pin
    character varying,       -- p_consecutivo_factura
    boolean,                 -- p_se_compro_soat
    uuid,                    -- p_vehicle_service_rate_id
    numeric,                 -- p_rate_price_snapshot
    uuid,                    -- p_company_id
    jsonb,                   -- p_payments
    jsonb                    -- p_price_snapshot
) FROM PUBLIC;

-- 2. Dar acceso solo a usuarios autenticados
GRANT EXECUTE ON FUNCTION public.update_office_order_data(
    uuid,
    character varying,
    character varying,
    boolean,
    uuid,
    numeric,
    uuid,
    jsonb,
    jsonb
) TO authenticated;

-- 3. (Opcional) Dar acceso al backend con service_role
GRANT EXECUTE ON FUNCTION public.update_office_order_data(
    uuid,
    character varying,
    character varying,
    boolean,
    uuid,
    numeric,
    uuid,
    jsonb,
    jsonb
) TO service_role;