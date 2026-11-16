-- Revocar acceso a los roles de la API para que no sea pública
REVOKE SELECT ON public.mv_reportes_desglose_precio FROM public, anon, authenticated;