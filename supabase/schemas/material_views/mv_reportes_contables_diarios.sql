CREATE MATERIALIZED VIEW public.mv_recaudos_diarios AS

SELECT
    DATE_TRUNC('day', eop.created_at)::DATE AS fecha,
    eop.tenant_id,
    eo.service_type,
    eo.vehiculo_tipo_snapshot,
    eop.payment_method,
    COUNT(*)::INTEGER AS cantidad_pagos,
    COALESCE(
        SUM(eop.monto_bruto),
        0
    )::NUMERIC(12, 2) AS total_recaudado

FROM public.entry_order_payments AS eop

INNER JOIN public.entry_orders AS eo
    ON eo.id = eop.entry_order_id

WHERE eo.deleted_at IS NULL
  AND (
      eo.es_reinspeccion = false
      OR eo.es_reinspeccion IS NULL
  )

GROUP BY
    DATE_TRUNC('day', eop.created_at)::DATE,
    eop.tenant_id,
    eo.service_type,
    eo.vehiculo_tipo_snapshot,
    eop.payment_method

ORDER BY fecha DESC;

CREATE UNIQUE INDEX idx_mv_recaudos_diarios
ON public.mv_recaudos_diarios (
    fecha,
    tenant_id,
    service_type,
    vehiculo_tipo_snapshot,
    payment_method
);


REFRESH MATERIALIZED VIEW public.mv_recaudos_diarios;


-- ============================================================
-- MATERIALIZED VIEW: RECAUDOS DIARIOS
-- ============================================================
--
-- Esta MV consolida los pagos realmente registrados en
-- entry_order_payments.
--
-- Cada fila representa una combinación única de:
--
--   fecha
--   tenant
--   tipo de servicio
--   tipo de vehículo
--   método de pago
--
-- Para cada combinación obtenemos:
--
--   cantidad_pagos
--   total_recaudado
--
-- ============================================================

CREATE MATERIALIZED VIEW public.mv_recaudos_diarios AS

SELECT

    -- --------------------------------------------------------
    -- FECHA
    -- --------------------------------------------------------
    --
    -- Usamos la fecha de creación del pago, NO la fecha de
    -- creación de la orden.
    --
    -- Esto es importante porque estamos analizando dinero
    -- efectivamente recaudado.
    --
    -- Ejemplo:
    --
    -- 2026-09-14 08:35:21
    --        ↓
    -- 2026-09-14
    --
    DATE_TRUNC('day', eop.created_at)::DATE AS fecha,


    -- --------------------------------------------------------
    -- TENANT
    -- --------------------------------------------------------
    --
    -- Identifica el CDA al que pertenece el pago.
    -- --------------------------------------------------------
    eop.tenant_id,


    -- --------------------------------------------------------
    -- TIPO DE SERVICIO
    -- --------------------------------------------------------
    --
    -- Se obtiene desde entry_orders porque
    -- entry_order_payments no necesita duplicar este dato.
    --
    -- Ejemplos:
    -- RTM
    -- preventiva
    -- peritaje
    -- otro
    -- --------------------------------------------------------
    eo.service_type,


    -- --------------------------------------------------------
    -- TIPO DE VEHÍCULO
    -- --------------------------------------------------------
    --
    -- También viene de entry_orders.
    --
    -- Ejemplos:
    -- liviano
    -- pesado
    -- motocicleta_4t
    -- motocicleta_2t
    -- --------------------------------------------------------
    eo.vehiculo_tipo_snapshot,


    -- --------------------------------------------------------
    -- MÉTODO DE PAGO
    -- --------------------------------------------------------
    --
    -- Este sí viene directamente de entry_order_payments.
    --
    -- Ejemplos:
    -- efectivo
    -- tarjeta_debito
    -- tarjeta_credito
    -- transferencia
    -- qr
    -- etc.
    -- --------------------------------------------------------
    eop.payment_method,


    -- --------------------------------------------------------
    -- CANTIDAD DE PAGOS
    -- --------------------------------------------------------
    --
    -- Cuenta cuántos registros de pago existen dentro
    -- de cada grupo.
    --
    -- IMPORTANTE:
    --
    -- Si una orden tiene:
    --
    --   efectivo       $100.000
    --   tarjeta_debito $136.280
    --
    -- tenemos DOS registros de pago y por lo tanto:
    --
    --   cantidad_pagos = 2
    --
    -- --------------------------------------------------------
    COUNT(*)::INTEGER AS cantidad_pagos,


    -- --------------------------------------------------------
    -- TOTAL RECAUDADO
    -- --------------------------------------------------------
    --
    -- Suma el monto de todos los pagos pertenecientes
    -- al grupo.
    --
    -- Ejemplo:
    --
    -- Pago 1 → $100.000
    -- Pago 2 → $150.000
    -- Pago 3 → $ 50.000
    --
    -- SUM = $300.000
    --
    -- COALESCE evita obtener NULL en caso de no existir
    -- valores, aunque actualmente monto_bruto es NOT NULL.
    -- --------------------------------------------------------
    COALESCE(
        SUM(eop.monto_bruto),
        0
    )::NUMERIC(12, 2) AS total_recaudado


FROM public.entry_order_payments AS eop


-- ============================================================
-- JOIN CON ENTRY_ORDERS
-- ============================================================
--
-- entry_order_payments contiene:
--
--   entry_order_id
--
-- que apunta a:
--
--   entry_orders.id
--
-- Gracias a esta relación podemos obtener el tipo de servicio
-- y el tipo de vehículo de cada pago.
-- ============================================================

INNER JOIN public.entry_orders AS eo
    ON eo.id = eop.entry_order_id


-- ============================================================
-- FILTROS
-- ============================================================

WHERE eo.deleted_at IS NULL

    -- No incluimos órdenes eliminadas lógicamente.


    AND (
        eo.es_reinspeccion = false
        OR eo.es_reinspeccion IS NULL
    )

    -- No incluimos reinspecciones.
    --
    -- La idea es mantener el mismo criterio que utilizamos
    -- en mv_reportes_diarios:
    --
    -- solamente órdenes de primera vez que generan el
    -- recaudo principal.


-- ============================================================
-- AGRUPACIÓN
-- ============================================================
--
-- Cada combinación diferente de estas columnas genera
-- una fila independiente en la MV.
--
-- Por ejemplo:
--
-- 14/09 + CDA A + RTM + moto_4t + efectivo
--
-- es diferente de:
--
-- 14/09 + CDA A + RTM + moto_4t + tarjeta_debito
--
-- aunque todos los demás valores sean iguales.
-- ============================================================

GROUP BY

    DATE_TRUNC('day', eop.created_at)::DATE,
    eop.tenant_id,
    eo.service_type,
    eo.vehiculo_tipo_snapshot,
    eop.payment_method;


-- ============================================================
-- ÍNDICE ÚNICO
-- ============================================================
--
-- Identifica de forma única cada fila de la MV.
--
-- Además permite posteriormente utilizar:
--
-- REFRESH MATERIALIZED VIEW CONCURRENTLY
--
-- sin bloquear las consultas que estén leyendo la MV.
-- ============================================================

CREATE UNIQUE INDEX idx_mv_recaudos_diarios
ON public.mv_recaudos_diarios (
    fecha,
    tenant_id,
    service_type,
    vehiculo_tipo_snapshot,
    payment_method
);


-- ============================================================
-- PRIMER REFRESCO
-- ============================================================

REFRESH MATERIALIZED VIEW public.mv_recaudos_diarios;