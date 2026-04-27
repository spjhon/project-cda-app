-- ==========================================
-- 1. TABLA: vehicles
-- ==========================================

CREATE TABLE IF NOT EXISTS public.vehicles (
    -- Identificador único global.
    id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Indispensable para separar los datos de cada CDA (Multi-tenant).
    tenant_id               UUID NOT NULL,

    -- Única por país (Indexada para búsqueda rápida).
    placa                   VARCHAR NOT NULL,
    
    -- Ej: Chevrolet, Yamaha.
    marca                   VARCHAR,
    
    -- Ej: Spark, NMAX.
    linea                   VARCHAR,
    
    -- El año del vehículo.
    modelo                  INTEGER,
    
    -- Color actual del vehículo.
    color                   VARCHAR,
    
    -- (motocicleta, liviano, pesado, motocarro).
    tipo_vehiculo           vehicle_type_enum NOT NULL,
    
    -- Automóvil, Camioneta, Motocicleta.
    clase                   VARCHAR,
    
    -- Gasolina, Diesel, Eléctrico, GNV.
    combustible             VARCHAR,
    
    -- Vital para determinar tarifas y pruebas de gases.
    cilindrada              INTEGER,

    tipo_servicio_vehiculo public.vehicle_service_type_enum not null default 'particular'::public.vehicle_service_type_enum,
    
    -- Indica si el vehículo posee blindaje legal.
    blindaje                BOOLEAN DEFAULT false,
    
    -- Cantidad máxima de personas permitidas.
    capacidad_pasajeros     INTEGER,
    
    
    -- Indica si es un vehículo de escuela de conducción.
    es_ensenanza            BOOLEAN DEFAULT false,

    -- Referencia a la tabla personas (Dueño registrado).
    propietario_actual_id   UUID,

    -- Registro de creación en sistema.
    created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Registro de última edición.
    updated_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Registro para anulación o borrado lógico.
    deleted_at              TIMESTAMPTZ
);

-- ==========================================
-- 2. FOREIGN KEYS (Relaciones)
-- ==========================================

-- Relación con el tenant para aislamiento total.
ALTER TABLE public.vehicles
    ADD CONSTRAINT vehicles_tenant_id_fkey 
    FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;

-- Relación con el propietario (Referencia a personas).
ALTER TABLE public.vehicles
    ADD CONSTRAINT vehicles_propietario_fkey 
    FOREIGN KEY (propietario_actual_id) REFERENCES public.personas(id) ON DELETE SET NULL;

-- ==========================================
-- 3. CONSTRAINTS (Unicidad)
-- ==========================================

-- Unicidad de placa por Tenant (Evita duplicados en el mismo CDA).
ALTER TABLE public.vehicles
    ADD CONSTRAINT vehicles_placa_tenant_key UNIQUE (tenant_id, placa);

-- ==========================================
-- 4. ÍNDICES (Rendimiento)
-- ==========================================

-- Búsqueda ultra rápida por placa.
CREATE INDEX IF NOT EXISTS vehicles_placa_idx 
    ON public.vehicles USING btree (placa);

-- Búsqueda por propietario.
CREATE INDEX IF NOT EXISTS vehicles_propietario_idx 
    ON public.vehicles USING btree (propietario_actual_id);

-- Búsqueda por Tenant para RLS.
CREATE INDEX IF NOT EXISTS vehicles_tenant_idx 
    ON public.vehicles USING btree (tenant_id);

-- 3. (Opcional) Crear un índice para mejorar búsquedas por tipo de servicio
CREATE INDEX IF NOT EXISTS vehicles_tipo_servicio_idx 
    ON public.vehicles (tipo_servicio_vehiculo);


-- ==========================================
-- COMENTARIOS
-- ==========================================

COMMENT ON COLUMN public.vehicles.tipo_servicio_vehiculo IS 'Clasificación del servicio según la tarjeta de propiedad (Particular, Público, etc.)';


-- ==========================================
-- 5. GRANTS
-- ==========================================

GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.vehicles TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.vehicles TO service_role;


-- ==========================================
-- 6. RLS (Row Level Security) - vehicles
-- ==========================================

ALTER TABLE public.vehicles ENABLE ROW LEVEL SECURITY;

-- ------------------------------------------
-- SELECT: Ver vehículos registrados en el CDA
-- ------------------------------------------
CREATE POLICY "select_vehicles_by_tenant"
ON public.vehicles
FOR SELECT
TO authenticated
USING (
    tenant_id IN (
        SELECT tp.tenant_id 
        FROM public.tenant_permissions tp
        JOIN public.service_users su ON su.id = tp.service_user_id
        WHERE su.auth_user_id = (SELECT auth.uid())
    )
);

-- ------------------------------------------
-- INSERT: Registrar nuevos vehículos
-- ------------------------------------------
CREATE POLICY "insert_vehicles_by_tenant"
ON public.vehicles
FOR INSERT
TO authenticated
WITH CHECK (
    tenant_id IN (
        SELECT tp.tenant_id 
        FROM public.tenant_permissions tp
        JOIN public.service_users su ON su.id = tp.service_user_id
        WHERE su.auth_user_id = (SELECT auth.uid())
    )
);

-- ------------------------------------------
-- UPDATE: Actualizar datos técnicos o vencimientos
-- ------------------------------------------
CREATE POLICY "update_vehicles_by_tenant"
ON public.vehicles
FOR UPDATE
TO authenticated
USING (
    tenant_id IN (
        SELECT tp.tenant_id 
        FROM public.tenant_permissions tp
        JOIN public.service_users su ON su.id = tp.service_user_id
        WHERE su.auth_user_id = (SELECT auth.uid())
    )
)
WITH CHECK (
    tenant_id IN (
        SELECT tp.tenant_id 
        FROM public.tenant_permissions tp
        JOIN public.service_users su ON su.id = tp.service_user_id
        WHERE su.auth_user_id = (SELECT auth.uid())
    )
);