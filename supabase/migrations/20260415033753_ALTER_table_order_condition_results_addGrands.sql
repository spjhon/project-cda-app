-- ==========================================
-- 5. GRANTS
-- ==========================================
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.order_condition_results TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.order_condition_results TO service_role;