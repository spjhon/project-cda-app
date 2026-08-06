-- ==========================================
-- Función para inicializar los créditos del Tenant
-- ==========================================

CREATE OR REPLACE FUNCTION public.handle_new_tenant_credits()
RETURNS TRIGGER AS $$
BEGIN
  -- Crea automáticamente el registro de créditos con 0 cupos iniciales
  INSERT INTO public.tenant_credits (tenant_id, cupo_fupas, cupo_certificados)
  VALUES (NEW.id, 0, 0);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;