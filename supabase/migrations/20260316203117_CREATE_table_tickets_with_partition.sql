
-- ==========================================
-- Tabla: tickets (PARTICIONADA)
-- ==========================================

CREATE TABLE public.tickets (
  id uuid NOT NULL DEFAULT gen_random_uuid(),

  -- Identificador humano secuencial por tenant
  ticket_number bigint NOT NULL, 
  
  -- Relación con el tenant (Obligatorio para aislamiento y particionamiento)
  tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  
  -- Autor del ticket (Relacionado con tu tabla de perfiles públicos)
  created_by uuid NOT NULL REFERENCES public.service_users(id),
  assignee uuid REFERENCES public.service_users(id) ON DELETE SET NULL,
  
  -- Datos del ticket
  title text NOT NULL CHECK (char_length(title) > 0),
  description text,
  status text NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'done', 'cancelled', 'information_missing')),
  assignee_name text,
  
  -- Auditoría
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),

  -- CONSTRAINT DE UNICIDAD Y PK: 
  -- En tablas particionadas, la columna de partición DEBE estar en la PK
  PRIMARY KEY (id, tenant_id),
  -- CONSTRAINT DE UNICIDAD: Evita duplicados de número dentro del mismo cliente
  CONSTRAINT unique_ticket_number_per_tenant UNIQUE (tenant_id, ticket_number)
) PARTITION BY LIST (tenant_id);

-- 

-- ==========================================
-- Comentarios
-- ==========================================

COMMENT ON TABLE public.tickets IS 'Esta es la v2, particionada por tenant_id';
COMMENT ON COLUMN public.tickets.status IS 'Estado actual del ticket: open, in_progress, done, cancelled.';
COMMENT ON COLUMN public.tickets.tenant_id IS 'ID del tenant al que pertenece el ticket para aislamiento multi-tenant.';

-- ==========================================
-- Índices estratégicos
-- ==========================================

-- Nota: En tablas particionadas, estos índices se propagan automáticamente a las particiones hijas
-- Índice para búsquedas rápidas por tenant (vital para el rendimiento)
CREATE INDEX tickets_tenant_id_idx ON public.tickets (tenant_id);
-- Índice para filtrar por creador
CREATE INDEX tickets_created_by_idx ON public.tickets (created_by);
-- Índice para filtros de estado
CREATE INDEX tickets_status_idx ON public.tickets (status);
-- Indice para los filtros por assignee
CREATE INDEX tickets_assignee_idx ON public.tickets (assignee);

-- Búsqueda ultra rápida por número (usado en URLs: /tenant/tickets/42)
CREATE INDEX tickets_tenant_ticket_num_idx ON public.tickets (tenant_id, ticket_number);

-- ==========================================
-- GRANTS
-- ==========================================

GRANT SELECT, INSERT, UPDATE ON TABLE public.tickets TO authenticated;
GRANT ALL ON TABLE public.tickets TO service_role;

ALTER TABLE public.comments 
ADD CONSTRAINT fk_comments_to_tickets 
FOREIGN KEY (ticket_id, tenant_id) REFERENCES public.tickets (id, tenant_id) ON DELETE CASCADE;