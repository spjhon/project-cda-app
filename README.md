# project-cda-app

Multi-tenant Colombian CDAs (automotive diagnostic center) admin tool.

## CLI Commands I Use Frequently

Local Types Generation: `pnpx supabase gen types typescript --local > supabase/types/database.types.ts` o `pnpx supabase gen types typescript --db-url "postgresql://postgres:postgres@localhost:54322/postgres" > supabase/types/database.types.ts`

Make full local system schema backup: `pnpx supabase db dump --local > backup_completo.sql` o `pnpx supabase db dump --db-url "postgresql://postgres:postgres@localhost:54322/postgres" > backup_schema.sql`
backup solo de la data: `pnpx supabase db dump --db-url "postgresql://postgres:postgres@localhost:54322/postgres" --use-copy --data-only -x "storage.buckets_vectors" -x "storage.vector_indexes" > backup_data.sql`
restore de la data despues del reset: `docker exec -i supabase_db_project-cda-app psql -U postgres -d postgres < backup_data.sql`
restaurar data en la nube: `pnpx supabase db execute --db-url "postgresql://postgres:TU_CONTRASEÑA_REAL@db.lyktizihszlbmzzjrqye.supabase.co:5432/postgres" --file backup_data.sql`

To link with established env: `pnpx supabase link --project-ref lyktizihszlbmzzjrqye`

actualizar dependencias: `pnpm add next@latest react@latest react-dom@latest`
ver que falta por actualizar: `pnpm update --interactive --latest`, este permite no solo ver sino tambien instalar
tambien ver que falta por actualizar: `pnpm outdated`
Actualizar tipos de React (obligatorio para TS): `pnpm add -D @types/react@latest @types/react-dom@latest typescript@latest`
otros especificos para este projecto: `pnpm add @supabase/ssr@latest @supabase/supabase-js@latest`

## Documentacion del codigo

/dashboard
    Layout (suspence bundary)
            PermissionsLoaderContext (contexto)
                tenantPromise
                userPromise
                RolesDataPromise
            _____________________________________________________________
            children (page.tsx)
            /recepcionista
                Layout (suspence boundary)
                ReceptionistLoaderContext
                    templateTabelDataPromise
                ____________________________________________
                children (page.tsx)
