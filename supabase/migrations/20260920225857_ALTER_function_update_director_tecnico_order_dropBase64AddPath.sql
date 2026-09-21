DROP FUNCTION IF EXISTS public.update_director_tecnico_order(
    uuid,
    text,
    character varying,
    character varying,
    text,
    character varying,
    text,
    text,
    boolean
);


CREATE OR REPLACE FUNCTION public.update_director_tecnico_order(
    p_order_id uuid,
    p_resultado_revision text,
    p_consecutivo_fur character varying,
    p_consecutivo_rtm character varying,
    p_director_tecnico_tipo_documento_snapshot text,
    p_director_tecnico_numero_documento_snapshot character varying,
    p_director_tecnico_nombre_snapshot text,
    p_director_tecnico_firma_path_snapshot text,
    p_es_reinspeccion boolean DEFAULT false
)

RETURNS jsonb
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public

AS $$

DECLARE
    v_order_id uuid;
    v_message text;
    v_tenant_id uuid;
    v_resultado_clean text;

    -- Variable para capturar y validar el resultado post-UPDATE
    v_estado_actualizado public.order_status_enum;

BEGIN

    -- ============================================================
    -- 1. VERIFICACIÓN DEFENSIVA DE LA EXISTENCIA DE LA ORDEN
    -- ============================================================

    IF NOT EXISTS (
        SELECT 1
        FROM public.entry_orders
        WHERE id = p_order_id
    ) THEN

        RAISE EXCEPTION
            'La orden de entrada con ID % no existe.',
            p_order_id;

    END IF;


    -- ============================================================
    -- 2. ACTUALIZACIÓN DEL CIERRE TÉCNICO
    -- ============================================================

    UPDATE public.entry_orders

    SET
        resultado_revision =
            NULLIF(TRIM(p_resultado_revision), ''),

        consecutivo_fur =
            NULLIF(TRIM(p_consecutivo_fur), ''),

        consecutivo_rtm =
            NULLIF(TRIM(p_consecutivo_rtm), ''),

        -- ========================================================
        -- SNAPSHOT DEL DIRECTOR TÉCNICO
        -- ========================================================

        director_tecnico_tipo_documento_snapshot =
            NULLIF(
                TRIM(p_director_tecnico_tipo_documento_snapshot),
                ''
            ),

        director_tecnico_numero_documento_snapshot =
            NULLIF(
                TRIM(p_director_tecnico_numero_documento_snapshot),
                ''
            ),

        director_tecnico_nombre_snapshot =
            NULLIF(
                TRIM(p_director_tecnico_nombre_snapshot),
                ''
            ),

        -- Guardamos únicamente el PATH de la firma.
        -- La imagen física está almacenada en Storage.
        director_tecnico_firma_path_snapshot =
            NULLIF(
                TRIM(p_director_tecnico_firma_path_snapshot),
                ''
            ),

        -- ========================================================
        -- FECHA LÍMITE DE REINSPECCIÓN
        -- ========================================================

        fecha_limite_reinspeccion =
            CASE

                WHEN LOWER(TRIM(p_resultado_revision)) = 'rechazado'
                THEN NOW() + INTERVAL '15 days'

                ELSE fecha_limite_reinspeccion

            END,

        -- ========================================================
        -- TRANSICIÓN DE ESTADO
        -- ========================================================

        estado_orden =
            'finalizada'::public.order_status_enum

    WHERE id = p_order_id

    RETURNING estado_orden
    INTO v_estado_actualizado;


    -- ============================================================
    -- 2.1 VERIFICACIÓN ESTRICTA DEL ESTADO
    -- ============================================================

    IF
        v_estado_actualizado IS NULL
        OR v_estado_actualizado != 'finalizada'::public.order_status_enum
    THEN

        RAISE EXCEPTION
            'Error de consistencia: La orden % no pudo ser marcada como finalizada (Estado resultante: %).',
            p_order_id,
            COALESCE(
                v_estado_actualizado::text,
                'NULL'
            );

    END IF;


    -- ============================================================
    -- 2.2 ENLACE DE REINSPECCIÓN CON LA ORDEN ANTERIOR
    -- ============================================================

    UPDATE public.entry_orders

    SET id_orden_reinspeccion = p_order_id

    WHERE id = (

        SELECT id_reprobado

        FROM public.entry_orders

        WHERE id = p_order_id
          AND es_reinspeccion = TRUE
          AND id_reprobado IS NOT NULL

    );


    -- ============================================================
    -- 2.3 DESCUENTO CONDICIONAL DE CUPOS
    -- ============================================================

    -- Obtener tenant_id de la orden

    SELECT tenant_id
    INTO v_tenant_id

    FROM public.entry_orders

    WHERE id = p_order_id;


    v_resultado_clean =
        LOWER(TRIM(p_resultado_revision));


    -- ============================================================
    -- ACTUALIZAR CRÉDITOS DEL TENANT
    -- ============================================================

    UPDATE public.tenant_credits

    SET

        -- --------------------------------------------------------
        -- FUPAs
        --
        -- Se descuenta 1 si NO es reinspección.
        -- --------------------------------------------------------

        cupo_fupas =
            cupo_fupas
            -
            CASE

                WHEN NOT COALESCE(
                    p_es_reinspeccion,
                    false
                )
                THEN 1

                ELSE 0

            END,


        -- --------------------------------------------------------
        -- CERTIFICADOS
        --
        -- Se descuenta:
        --   1. Si es reinspección
        --   2. Si NO es reinspección y fue aprobada
        --
        -- No se descuenta si:
        --   NO es reinspección + rechazada
        -- --------------------------------------------------------

        cupo_certificados =
            cupo_certificados
            -
            CASE

                WHEN COALESCE(
                    p_es_reinspeccion,
                    false
                )
                THEN 1

                WHEN v_resultado_clean = 'aprobado'
                THEN 1

                ELSE 0

            END

    WHERE tenant_id = v_tenant_id;


    -- ============================================================
    -- VERIFICAR QUE EXISTAN CRÉDITOS PARA EL TENANT
    -- ============================================================

    IF NOT FOUND THEN

        RAISE EXCEPTION
            'Operación cancelada: No se encontraron registros de créditos para este centro (Tenant: %).',
            v_tenant_id;

    END IF;


    -- ============================================================
    -- 3. MENSAJE DE ÉXITO
    -- ============================================================

    v_message =
        'Cierre técnico registrado con éxito';

    v_order_id =
        p_order_id;


    -- ============================================================
    -- 4. RETORNO
    -- ============================================================

    RETURN jsonb_build_object(
        'id',
        v_order_id,

        'message',
        v_message
    );

END;

$$;