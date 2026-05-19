-- Eliminamos la columna de la tabla public.order_signatures
ALTER TABLE public.order_signatures 
    DROP COLUMN IF EXISTS signer_name;