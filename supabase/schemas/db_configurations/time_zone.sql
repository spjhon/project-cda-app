-- Establece zona horaria por defecto para la base de datos
alter database postgres
set timezone to 'America/Bogota';

-- (Opcional pero recomendado) 
-- Asegura que nuevas conexiones también usen esta zona
alter role authenticated
set timezone to 'America/Bogota';

alter role anon
set timezone to 'America/Bogota';

alter role service_role
set timezone to 'America/Bogota';

--WARNING, ESTE CODIGO DEBE DE IR EN MIGRACIONES MANUALES