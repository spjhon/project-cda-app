-- =========================================================================
-- 2. ELIMINACIÓN DEL CONSTRAINT ANTERIOR
-- =========================================================================
ALTER TABLE public.entry_order_tire_pressures
    DROP CONSTRAINT IF EXISTS check_tire_position;


-- =========================================================================
-- 3. APLICACIÓN DEL NUEVO CONSTRAINT (Alineado con tu Frontend)
-- =========================================================================
ALTER TABLE public.entry_order_tire_pressures
    ADD CONSTRAINT check_tire_position CHECK (
        posicion::text = ANY (
            ARRAY[
                'izquierda'::text,
                'derecha'::text,
                'centro'::text,
                'izquierda_interior'::text,
                'derecha_interior'::text,
                'repuesto'::text
            ]
        )
    );