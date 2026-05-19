ALTER TABLE public.vehicles
    -- Datos de identificación y aspecto
    ALTER COLUMN marca SET NOT NULL,
    ALTER COLUMN linea SET NOT NULL,
    ALTER COLUMN modelo SET NOT NULL,
    ALTER COLUMN color SET NOT NULL,
    
    -- Características técnicas del RUNT
    ALTER COLUMN clase SET NOT NULL,
    ALTER COLUMN combustible SET NOT NULL,
    ALTER COLUMN cilindrada SET NOT NULL,
    
    -- Atributos específicos e indicadores
    ALTER COLUMN blindaje SET NOT NULL,
    ALTER COLUMN capacidad_pasajeros SET NOT NULL,
    ALTER COLUMN es_ensenanza SET NOT NULL;

    -- ⚠️ NOTA SOBRE PROPIETARIO: No le aplicamos NOT NULL aquí. 
   

COMMIT;