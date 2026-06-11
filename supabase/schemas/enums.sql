

-- Enums de los roles del sistema
CREATE TYPE public.user_role_enum AS ENUM (
            'gerente',
            'recepcionista',
            'aux_administrativo',
            'director_tecnico'
        );
        
        -- Añadimos un comentario a la base de datos para documentar el tipo
COMMENT ON TYPE public.user_role_enum IS 'Roles asignados a los usuarios dentro del CDA para control de accesos (SGC / ISO 17020).';