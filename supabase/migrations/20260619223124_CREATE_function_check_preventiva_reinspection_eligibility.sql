CREATE OR REPLACE FUNCTION public.check_preventiva_reinspection_eligibility(
    p_placa CHARACTER VARYING,
    p_tenant_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY INVOKER 
AS $$
DECLARE
    v_orden_original RECORD;
    v_conteo_originales INT;
    v_ya_reinspeccionada BOOLEAN;
BEGIN



    -- 1. Contar cuántas órdenes originales vigentes (sin vencer) existen para esa placa
    -- Usamos: CURRENT_DATE <= fecha_limite_reinspeccion
    SELECT COUNT(*)
    INTO v_conteo_originales
    FROM public.entry_orders
    WHERE vehiculo_placa_snapshot = p_placa
      AND tenant_id = p_tenant_id
      AND es_reinspeccion = false
      AND service_type = 'preventiva'
      AND estado_orden = 'finalizada'
      AND resultado_revision = 'rechazado'
      AND CURRENT_DATE <= fecha_limite_reinspeccion -- 🌟 Validación directa con tu campo
      AND deleted_at IS NULL;

    IF v_conteo_originales > 1 THEN
        RETURN jsonb_build_object(
            'merece_reinspeccion', false,
            'motivo', 'Error crítico: Existe más de una orden original rechazada vigente en el sistema para esta placa.'
        );
    END IF;



    -- 2. Seleccionar la orden original vigente
    SELECT id, fecha, fecha_limite_reinspeccion
    INTO v_orden_original
    FROM public.entry_orders
    WHERE vehiculo_placa_snapshot = p_placa
      AND tenant_id = p_tenant_id
      AND es_reinspeccion = false
      AND service_type = 'preventiva'
      AND estado_orden = 'finalizada'
      AND resultado_revision = 'rechazado'
      AND CURRENT_DATE <= fecha_limite_reinspeccion -- 🌟 Validación directa con tu campo
      AND deleted_at IS NULL
    ORDER BY fecha DESC
    LIMIT 1;

    -- Si no hay ninguna orden que cumpla las condiciones o ya expiró la fecha límite
    IF v_orden_original.id IS NULL THEN
        RETURN jsonb_build_object(
            'merece_reinspeccion', false,
            'motivo', 'No se encontró ninguna revisión preventiva rechazada que esté vigente. El plazo legal ya expiró o no existe el registro.'
        );
    END IF;




    -- 3. Comprobar que no se haya usado ya este derecho en otra orden de reinspección
    SELECT EXISTS (
        SELECT 1 
        FROM public.entry_orders 
        WHERE id_reprobado = v_orden_original.id
          AND es_reinspeccion = true
          AND deleted_at IS NULL
    ) INTO v_ya_reinspeccionada;

    IF v_ya_reinspeccionada THEN
        RETURN jsonb_build_object(
            'merece_reinspeccion', false,
            'motivo', 'El derecho a reinspección para esta orden ya fue utilizado.'
        );
    END IF;






    -- 4. Todo correcto: Retornamos éxito y el ID del reprobado para el formulario
    RETURN jsonb_build_object(
        'merece_reinspeccion', true,
        'motivo', 'Vehículo apto. Aplica para reinspección (Plazo límite: ' || to_char(v_orden_original.fecha_limite_reinspeccion, 'DD/MM/YYYY') || ')',
        'id_reprobado', v_orden_original.id
    );

END;
$$;
