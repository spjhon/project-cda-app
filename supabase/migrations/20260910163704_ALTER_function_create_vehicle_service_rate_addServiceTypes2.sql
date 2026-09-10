DROP FUNCTION IF EXISTS public.create_vehicle_service_rate(
    UUID,
    public.vehicle_type_enum,
    NUMERIC,
    NUMERIC,
    public.service_type_enum,
    JSONB,
    JSONB,
    JSONB
);