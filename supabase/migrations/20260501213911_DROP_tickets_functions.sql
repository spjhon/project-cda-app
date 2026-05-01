DROP FUNCTION IF EXISTS public.get_service_users_with_tenant(target_tenant_id uuid);

DROP TRIGGER IF EXISTS tr_comments_derive_tenant ON public.comments;

DROP TRIGGER IF EXISTS set_comments_updated_at ON public.comments;

DROP TRIGGER IF EXISTS trg_comments_autoset_author_name ON public.comments;

DROP TRIGGER IF EXISTS tr_comments_autoset_created_by ON public.comments;

DROP TRIGGER IF EXISTS tr_set_comments_attachments_updated_at ON public.comment_attachments;

-- 1. Eliminar el trigger de actualización automática de fecha
DROP TRIGGER IF EXISTS set_tickets_updated_at ON public.tickets;

-- 2. Eliminar el trigger que asigna el autor (creador)
DROP TRIGGER IF EXISTS tr_set_author ON public.tickets;

-- 3. Eliminar el trigger que genera el número secuencial de ticket
DROP TRIGGER IF EXISTS tr_set_ticket_number ON public.tickets;

-- 4. Eliminar el trigger que asigna el nombre del responsable (assignee)
DROP TRIGGER IF EXISTS trg_set_ticket_assignee_name ON public.tickets;

DROP FUNCTION IF EXISTS public.derive_tenant_from_ticket();

DROP FUNCTION IF EXISTS public.set_comment_author_name();

DROP FUNCTION IF EXISTS public.set_created_by_value();

DROP FUNCTION IF EXISTS public.set_created_by_table_tickets();

DROP FUNCTION IF EXISTS public.set_next_ticket_number();

DROP FUNCTION IF EXISTS public.set_ticket_assignee_name();
