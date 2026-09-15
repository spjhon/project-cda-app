
--Tu materialized view no está recorriendo manualmente cada tipo de vehículo. PostgreSQL automáticamente crea una fila por cada combinación 
--diferente de las columnas que pusiste en el GROUP BY.

CREATE MATERIALIZED VIEW public.mv_reportes_diarios AS
SELECT 
    DATE_TRUNC('day', fecha)::DATE as fecha,
    tenant_id,
    service_type,                 -- 'RTM', 'PREVENTIVA', etc.
    resultado_revision,           -- 'APROBADO', 'REPROBADO', etc.
    vehiculo_tipo_snapshot,       -- liviano, pesado, motocicleta_4t, etc.
    se_compro_soat,               -- boolean: true / false
    COUNT(*)::INTEGER as cantidad
FROM public.entry_orders
WHERE deleted_at IS NULL
  -- ◄ REFINAMIENTO: Solo contar órdenes de primera vez (las que generan dinero)
  AND (es_reinspeccion = false OR es_reinspeccion IS NULL)
GROUP BY 
    DATE_TRUNC('day', fecha)::DATE, 
    tenant_id, 
    service_type, 
    resultado_revision, 
    vehiculo_tipo_snapshot, 
    se_compro_soat;

-- 3. Volver a crear el índice único para permitir REFRESH CONCURRENTLY
CREATE UNIQUE INDEX idx_mv_reportes_diarios 
ON public.mv_reportes_diarios (fecha, tenant_id, service_type, resultado_revision, vehiculo_tipo_snapshot, se_compro_soat);

-- 4. Ejecutar el primer refresco manual para poblar la vista con los nuevos filtros
REFRESH MATERIALIZED VIEW public.mv_reportes_diarios;




--Tu materialized view no está recorriendo manualmente cada tipo de vehículo. PostgreSQL automáticamente crea una fila por cada combinación 
--diferente de las columnas que pusiste en el GROUP BY.

-- ============================================================
-- MATERIALIZED VIEW: REPORTES DIARIOS
-- ============================================================
--
-- Una MATERIALIZED VIEW guarda físicamente el resultado de
-- esta consulta en PostgreSQL.
--
-- A diferencia de una VIEW normal, los datos quedan
-- almacenados y posteriormente podemos hacer:
--
-- REFRESH MATERIALIZED VIEW ...
--
-- para actualizar sus datos.
-- ============================================================

CREATE MATERIALIZED VIEW public.mv_reportes_diarios AS

SELECT

    -- --------------------------------------------------------
    -- FECHA
    -- --------------------------------------------------------
    --
    -- DATE_TRUNC('day', fecha)
    -- elimina la parte de hora/minutos/segundos del timestamp.
    --
    -- Por ejemplo:
    --
    -- 2026-09-14 08:35:21
    -- 2026-09-14 14:22:10
    --
    -- ambas quedan agrupadas como:
    --
    -- 2026-09-14
    --
    -- Finalmente ::DATE convierte el resultado a tipo DATE.
    -- --------------------------------------------------------
    DATE_TRUNC('day', fecha)::DATE AS fecha,


    -- --------------------------------------------------------
    -- TENANT
    -- --------------------------------------------------------
    --
    -- Permite que los datos de cada CDA sean independientes.
    --
    -- CDA A + fecha X
    -- y
    -- CDA B + fecha X
    --
    -- pertenecen a grupos diferentes.
    -- --------------------------------------------------------
    tenant_id,


    -- --------------------------------------------------------
    -- TIPO DE SERVICIO
    -- --------------------------------------------------------
    --
    -- Ejemplos:
    -- RTM
    -- preventiva
    -- peritaje
    -- otro
    --
    -- Al estar en el GROUP BY, cada tipo de servicio
    -- tendrá su propio grupo.
    -- --------------------------------------------------------
    service_type,


    -- --------------------------------------------------------
    -- RESULTADO DE LA REVISIÓN
    -- --------------------------------------------------------
    --
    -- Ejemplos:
    -- APROBADO
    -- REPROBADO
    --
    -- También forma parte del GROUP BY, por lo que un aprobado
    -- nunca se mezcla con un reprobado.
    -- --------------------------------------------------------
    resultado_revision,


    -- --------------------------------------------------------
    -- TIPO DE VEHÍCULO
    -- --------------------------------------------------------
    --
    -- Ejemplos:
    -- liviano
    -- pesado
    -- motocicleta_4t
    -- motocicleta_2t
    --
    -- Esta columna permite separar las estadísticas por
    -- tipo de vehículo.
    -- --------------------------------------------------------
    vehiculo_tipo_snapshot,


    -- --------------------------------------------------------
    -- COMPRA DE SOAT
    -- --------------------------------------------------------
    --
    -- TRUE  = compró SOAT
    -- FALSE = no compró SOAT
    --
    -- Al estar en GROUP BY, las órdenes con SOAT y sin SOAT
    -- quedan en grupos diferentes.
    -- --------------------------------------------------------
    se_compro_soat,


    -- --------------------------------------------------------
    -- CANTIDAD
    -- --------------------------------------------------------
    --
    -- COUNT(*) cuenta cuántas órdenes existen dentro de
    -- cada grupo creado por el GROUP BY.
    --
    -- Ejemplo:
    --
    -- 2026-09-14
    -- tenant A
    -- RTM
    -- APROBADO
    -- motocicleta_4t
    -- SOAT = true
    --
    -- Si existen 25 órdenes con exactamente esa combinación,
    -- COUNT(*) devuelve 25.
    --
    -- ::INTEGER convierte el resultado de COUNT a integer.
    -- --------------------------------------------------------
    COUNT(*)::INTEGER AS cantidad


FROM public.entry_orders


-- ============================================================
-- FILTROS
-- ============================================================

WHERE deleted_at IS NULL

    -- Solo incluimos órdenes que no hayan sido eliminadas
    -- lógicamente.
    --
    -- deleted_at IS NULL
    -- significa que la orden está activa/no eliminada.


    AND (
        es_reinspeccion = false
        OR es_reinspeccion IS NULL
    )

    -- Excluimos las reinspecciones.
    --
    -- ¿Por qué?
    --
    -- Una reinspección no representa una nueva orden que
    -- genere un nuevo recaudo.
    --
    -- Permitimos:
    --   false
    --   NULL
    --
    -- y excluimos:
    --   true


-- ============================================================
-- AGRUPACIÓN
-- ============================================================
--
-- ESTA ES LA PARTE MÁS IMPORTANTE DE LA CONSULTA.
--
-- PostgreSQL crea un grupo diferente por cada combinación
-- única de TODAS estas columnas.
--
-- Es decir:
--
-- fecha + tenant + servicio + resultado +
-- tipo de vehículo + SOAT
--
-- forman la "identidad" de cada fila de la materialized view.
-- ============================================================

GROUP BY

    -- Agrupamos por día.
    DATE_TRUNC('day', fecha)::DATE,


    -- Cada tenant tiene sus propios datos.
    tenant_id,


    -- Separamos RTM, preventiva, peritaje, etc.
    service_type,


    -- Separamos aprobados y reprobados.
    resultado_revision,


    -- Separamos los diferentes tipos de vehículo.
    vehiculo_tipo_snapshot,


    -- Separamos las órdenes con SOAT de las que no lo compraron.
    se_compro_soat;


-- ============================================================
-- ÍNDICE ÚNICO
-- ============================================================
--
-- Este índice no sirve para calcular los datos.
--
-- Su propósito principal es permitir posteriormente:
--
-- REFRESH MATERIALIZED VIEW CONCURRENTLY
--
-- PostgreSQL necesita un índice UNIQUE que identifique
-- inequívocamente cada fila de la materialized view.
--
-- La combinación de estas seis columnas debe ser única:
--
-- fecha
-- tenant_id
-- service_type
-- resultado_revision
-- vehiculo_tipo_snapshot
-- se_compro_soat
-- ============================================================

CREATE UNIQUE INDEX idx_mv_reportes_diarios
ON public.mv_reportes_diarios (
    fecha,
    tenant_id,
    service_type,
    resultado_revision,
    vehiculo_tipo_snapshot,
    se_compro_soat
);


-- ============================================================
-- PRIMER REFRESCO
-- ============================================================
--
-- Cuando una MATERIALIZED VIEW se crea, PostgreSQL ejecuta
-- la consulta y llena inicialmente sus datos.
--
-- Este REFRESH también puede utilizarse posteriormente para
-- actualizar la información cuando cambien las tablas origen.
-- ============================================================

REFRESH MATERIALIZED VIEW public.mv_reportes_diarios;