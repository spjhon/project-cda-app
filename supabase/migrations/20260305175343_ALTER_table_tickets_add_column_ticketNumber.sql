-- 1. Agregar la columna como NOT NULL desde el inicio
-- (Al estar vacía la tabla, no habrá conflictos)
ALTER TABLE public.tickets 
ADD COLUMN ticket_number bigint NOT NULL;

-- 2. Crear la restricción de unicidad compuesta
-- Garantiza que cada tenant tenga su propia secuencia (1, 2, 3...)
ALTER TABLE public.tickets 
ADD CONSTRAINT unique_ticket_number_per_tenant 
UNIQUE (tenant_id, ticket_number);

-- 3. Crear el índice para búsquedas rápidas (ej: /tenant/tickets/1)
CREATE INDEX tickets_ticket_number_idx ON public.tickets (ticket_number);

-- 4. Comentario para la base de datos
COMMENT ON COLUMN public.tickets.ticket_number IS 'Número secuencial humano (1, 2, 3...) por cada tenant.';