-- 1. Función específica para comentarios
create or replace function public.set_comment_author_name()
returns trigger
language plpgsql
SECURITY DEFINER
set search_path = public
as $$
begin

    -- Como created_by es NOT NULL, siempre tendrá un valor.
    -- Pero si quieres una validación de seguridad extra:
    IF (NEW.created_by IS NULL) THEN
        RAISE EXCEPTION 'Un comentario debe tener un autor.';
    END IF;


    -- Buscamos el nombre del usuario basado en su ID (created_by)
    -- No necesitamos validar el tenant aquí, porque ya lo haces en el RLS
    SELECT full_name 
    INTO NEW.author_name
    FROM public.service_users 
    WHERE id = NEW.created_by;
    
    -- Si por alguna razón el usuario no existe, lanzamos un error o ponemos 'Unknown'
    IF NOT FOUND THEN
        NEW.author_name := 'Usuario desconocido';
    END IF;

    RETURN NEW;
end;
$$;
