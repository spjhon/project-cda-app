DROP FUNCTION IF EXISTS public.check_reinspection_eligibility_table(p_placa CHARACTER VARYING, p_tenant_id UUID);



CREATE OR REPLACE FUNCTION public.check_preventiva_reinspection_eligibility(
    p_placa CHARACTER VARYING,
    p_tenant_id UUID
)
RETURNS TABLE (
    merece_reinspeccion BOOLEAN,
    motivo TEXT,
    id_reprobado UUID
)
LANGUAGE plpgsql
SECURITY INVOKER
AS $$
DECLARE
    v_orden_id UUID;
    v_fecha_limite DATE;
    v_conteo_originales INT;
    v_ya_reinspeccionada BOOLEAN;
BEGIN



    -- 1. Contar cuántas órdenes originales vigentes existen
    SELECT COUNT(*)
    INTO v_conteo_originales
    FROM public.entry_orders
    WHERE vehiculo_placa_snapshot = p_placa
      AND tenant_id = p_tenant_id
      AND es_reinspeccion = false
      AND service_type = 'preventiva'
      AND estado_orden = 'finalizada'
      AND resultado_revision = 'rechazado'
      AND CURRENT_DATE <= fecha_limite_reinspeccion
      AND deleted_at IS NULL;

    IF v_conteo_originales > 1 THEN
        merece_reinspeccion := false;
        motivo := 'Error crítico: Existe más de una orden original rechazada vigente en el sistema para esta placa.';
        id_reprobado := NULL;
        RETURN NEXT;
        RETURN;
    END IF;




    -- 2. Seleccionar la orden original vigente
    SELECT id, fecha_limite_reinspeccion
    INTO v_orden_id, v_fecha_limite
    FROM public.entry_orders
    WHERE vehiculo_placa_snapshot = p_placa
      AND tenant_id = p_tenant_id
      AND es_reinspeccion = false
      AND service_type = 'preventiva'
      AND estado_orden = 'finalizada'
      AND resultado_revision = 'rechazado'
      AND CURRENT_DATE <= fecha_limite_reinspeccion
      AND deleted_at IS NULL
    ORDER BY fecha DESC
    LIMIT 1;

    -- Si no hay ninguna orden que cumpla las condiciones o ya expiró
    IF v_orden_id IS NULL THEN
        merece_reinspeccion := false;
        motivo := 'No se encontró ninguna revisión preventiva rechazada que esté vigente. El plazo legal ya expiró o no existe el registro.';
        id_reprobado := NULL;
        RETURN NEXT;
        RETURN;
    END IF;






    -- 3. Comprobar que no se haya usado ya este derecho en otra orden de reinspección
    SELECT EXISTS (
        SELECT 1 
        FROM public.entry_orders 
        WHERE public.entry_orders.id_reprobado = v_orden_id
          AND es_reinspeccion = true
          AND deleted_at IS NULL
    ) INTO v_ya_reinspeccionada;

    IF v_ya_reinspeccionada THEN
        merece_reinspeccion := false;
        motivo := 'El derecho a reinspección para esta orden ya fue utilizado.';
        id_reprobado := NULL;
        RETURN NEXT;
        RETURN;
    END IF;





    -- 4. Todo correcto: Retornamos los datos asignando valores a las columnas de la tabla de salida
    merece_reinspeccion := true;
    motivo := 'Vehículo apto. Aplica para reinspección (Plazo límite: ' || to_char(v_fecha_limite, 'DD/MM/YYYY') || ')';
    id_reprobado := v_orden_id;
    
    RETURN NEXT; -- Empuja la fila armada al resultado
END;
$$;
