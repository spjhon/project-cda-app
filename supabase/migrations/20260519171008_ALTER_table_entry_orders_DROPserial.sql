ALTER TABLE public.entry_orders 
    ALTER COLUMN consecutivo DROP DEFAULT,
    ALTER COLUMN consecutivo TYPE integer;