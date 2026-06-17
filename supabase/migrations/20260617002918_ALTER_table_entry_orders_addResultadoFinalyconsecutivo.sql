-- MIGRACIÓN: Agregar campos de control para el Director Técnico (ISO 17020)

-- 1. Agregar columnas para los consecutivos de RTM y FUR
ALTER TABLE public.entry_orders 
  ADD COLUMN consecutivo_fur character varying NULL,
  ADD COLUMN consecutivo_rtm character varying NULL;

-- 2. Comentarios de documentación en la base de datos (Excelente para auditorías de la ONAC/Supertransporte)
COMMENT ON COLUMN public.entry_orders.consecutivo_fur IS 'Número del Formato Uniforme de Resultados generado en la inspección';
COMMENT ON COLUMN public.entry_orders.consecutivo_rtm IS 'Número del certificado de Revisión Tecnicomecánica emitido (Satisface RUNT)';

-- 3. Crear índices para optimizar las búsquedas por estos documentos (Muy común al auditar un vehículo específico)
CREATE INDEX IF NOT EXISTS entry_orders_consecutivo_fur_idx 
  ON public.entry_orders USING btree (tenant_id, consecutivo_fur) 
  TABLESPACE pg_default;

CREATE INDEX IF NOT EXISTS entry_orders_consecutivo_rtm_idx 
  ON public.entry_orders USING btree (tenant_id, consecutivo_rtm) 
  TABLESPACE pg_default;