CREATE OR REPLACE FUNCTION public.update_tenant_credits(
  p_tenant_id UUID,
  p_fupas_delta INT DEFAULT 0,
  p_certificados_delta INT DEFAULT 0
)
RETURNS public.tenant_credits
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
DECLARE
  v_result public.tenant_credits;
BEGIN
  UPDATE public.tenant_credits
  SET 
    cupo_fupas = cupo_fupas + p_fupas_delta,
    cupo_certificados = cupo_certificados + p_certificados_delta
  WHERE tenant_id = p_tenant_id
  RETURNING * INTO v_result;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'No se encontraron créditos registrados para el tenant especifico.';
  END IF;

  RETURN v_result;
END;
$$;