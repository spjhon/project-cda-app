-- ============================================================
-- ELIMINAR TRIGGER: UPDATED_AT
-- ============================================================

DROP TRIGGER IF EXISTS set_rate_fee_components_updated_at
ON public.rate_fee_components;


-- ============================================================
-- ELIMINAR TABLA: rate_fee_components
-- ============================================================

DROP TABLE IF EXISTS public.rate_fee_components;