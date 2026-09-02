ALTER TABLE public.fee_types
ADD COLUMN iva_percentage NUMERIC(5,2) NOT NULL DEFAULT 0;

ALTER TABLE public.fee_types
ADD CONSTRAINT fee_types_iva_percentage_check
CHECK (
    iva_percentage >= 0
    AND iva_percentage <= 100
);

COMMENT ON COLUMN public.fee_types.iva_percentage IS
'Porcentaje de IVA aplicable al fee. Ej: 19.00 representa 19%.';