-- ============================================================
-- ELIMINAR RPC EXISTENTE
-- ============================================================
-- Eliminamos la función anterior antes de recrearla porque
-- cambió la estructura de su RETURNS TABLE al agregar
-- iva_percentage.
-- ============================================================

DROP FUNCTION IF EXISTS public.fetch_fee_types(UUID);




-- ============================================================
-- RPC: OBTENER FEES DEL CATÁLOGO
-- ============================================================
-- Obtiene todas las configuraciones de fees pertenecientes
-- al tenant indicado.
--
-- IMPORTANTE:
-- Esta función respeta RLS porque utiliza SECURITY INVOKER.
-- Por lo tanto, el usuario que ejecuta la función debe tener
-- permiso de SELECT sobre los registros correspondientes.
-- ============================================================

CREATE OR REPLACE FUNCTION public.fetch_fee_types(
    p_tenant_id UUID
)

-- ============================================================
-- ESTRUCTURA DEL RESULTADO
-- ============================================================
-- La estructura debe coincidir con las columnas que devuelve
-- el SELECT de abajo.
-- ============================================================

RETURNS TABLE (
    -- Identificador único de la configuración del fee.
    id UUID,

    -- Tenant / CDA propietario del fee.
    tenant_id UUID,

    -- Nombre visible del fee.
    name TEXT,

    -- Código interno del fee.
    code TEXT,

    -- Descripción opcional.
    description TEXT,

    -- Valor monetario base del fee.
    fee_amount NUMERIC(12,2),

    -- Porcentaje de IVA aplicable al fee.
    -- Ejemplo: 19.00 = 19%.
    -- 0.00 = sin IVA.
    iva_percentage NUMERIC(5,2),

    -- Año inicial del rango de aplicación.
    -- NULL significa que no existe límite inferior.
    model_year_from INTEGER,

    -- Año final del rango de aplicación.
    -- NULL significa que no existe límite superior.
    model_year_to INTEGER,

    -- Indica si la configuración está activa.
    is_active BOOLEAN,

    -- Fecha y hora de creación.
    created_at TIMESTAMPTZ,

    -- Fecha y hora de última actualización.
    updated_at TIMESTAMPTZ
)

-- ============================================================
-- CONFIGURACIÓN DE LA FUNCIÓN
-- ============================================================

LANGUAGE sql

-- La función no modifica datos.
-- PostgreSQL puede optimizarla como función STABLE.
STABLE

-- La función se ejecuta con los permisos del usuario
-- que la invoca, por lo que RLS continúa aplicándose.
SECURITY INVOKER

-- Evita ambigüedades y establece public como esquema
-- de búsqueda para los objetos utilizados.
SET search_path = public

AS $$

    -- ========================================================
    -- CONSULTA PRINCIPAL
    -- ========================================================
    SELECT

        -- Identificador del fee.
        ft.id,

        -- Tenant propietario.
        ft.tenant_id,

        -- Nombre del fee.
        ft.name,

        -- Código del fee.
        ft.code,

        -- Descripción del fee.
        ft.description,

        -- Valor monetario del fee.
        ft.fee_amount,

        -- Porcentaje de IVA aplicable.
        ft.iva_percentage,

        -- Año inicial de aplicación.
        ft.model_year_from,

        -- Año final de aplicación.
        ft.model_year_to,

        -- Estado de la configuración.
        ft.is_active,

        -- Fecha de creación.
        ft.created_at,

        -- Fecha de actualización.
        ft.updated_at

    -- ========================================================
    -- TABLA ORIGEN
    -- ========================================================
    FROM public.fee_types AS ft

    -- ========================================================
    -- FILTRO POR TENANT
    -- ========================================================
    -- Solo devuelve las configuraciones pertenecientes
    -- al tenant recibido como parámetro.
    WHERE ft.tenant_id = p_tenant_id

    -- ========================================================
    -- ORDENAMIENTO
    -- ========================================================
    -- 1. Primero los fees activos.
    -- 2. Después orden alfabético por nombre.
    -- 3. Finalmente, los más recientes primero.
    ORDER BY
        ft.is_active DESC,
        ft.name,
        ft.created_at DESC;

$$;