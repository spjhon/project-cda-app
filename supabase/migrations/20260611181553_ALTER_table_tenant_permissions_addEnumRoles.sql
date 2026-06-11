
-- 1. ELIMINAR DEPENDENCIAS VIEJAS
    -- Quitamos el CHECK antiguo porque el ENUM ahora validará los valores por sí solo de forma nativa
ALTER TABLE public.tenant_permissions DROP CONSTRAINT IF EXISTS tenant_permissions_role_check;

-- Quitamos temporalmente la restricción UNIQUE que involucra la columna role
ALTER TABLE public.tenant_permissions  DROP CONSTRAINT IF EXISTS tenant_permissions_unique_triplet;

-- 2. TRANSICIÓN DE LA COLUMNA AL NUEVO TIPO ENUM
-- Eliminamos el valor por defecto de texto temporalmente para evitar conflictos de tipo
ALTER TABLE public.tenant_permissions  ALTER COLUMN role DROP DEFAULT;


-- Cambiamos el tipo de columna usando USING para castear el texto existente al ENUM de forma segura
    ALTER TABLE public.tenant_permissions 
        ALTER COLUMN role TYPE public.user_role_enum 
        USING role::public.user_role_enum;

    -- Volvemos a aplicar el valor por defecto, pero ahora mapeado bajo el nuevo tipo ENUM
    ALTER TABLE public.tenant_permissions ALTER COLUMN role SET DEFAULT 'recepcionista'::public.user_role_enum;


    -- 3. RECONSTRUIR RESTRICCIONES Y CONFIGURACIONES
    -- Volvemos a levantar la restricción UNIQUE (ahora protegiendo con el ENUM acoplado)
    ALTER TABLE public.tenant_permissions
    ADD CONSTRAINT tenant_permissions_unique_triplet 
    UNIQUE (tenant_id, service_user_id, role);

    -- Actualizamos el comentario explicativo de la columna en la base de datos
    COMMENT ON COLUMN public.tenant_permissions.role IS 'Rol del usuario en el CDA administrado mediante el tipo estructurado public.user_role_enum.';