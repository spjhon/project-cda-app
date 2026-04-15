-- ==========================================
-- 5. GRANTS (Permisos de Acceso)
-- ==========================================

-- Permisos para el usuario autenticado (App Next.js)
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.order_signatures TO authenticated;

-- Permisos para el rol de servicio (Edge Functions / Admin)
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.order_signatures TO service_role;