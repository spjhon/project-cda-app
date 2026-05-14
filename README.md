# project-cda-app

Multi-tenant Colombian CDAs (automotive diagnostic center) admin tool.

## CLI Commands I Use Frequently

Local Types Generation: `pnpx supabase gen types typescript --local > supabase/types/database.types.ts`
Make full local system backup: `pnpx supabase db dump --local > backup_completo.sql`
To link with established env: `pnpx supabase link --project-ref lyktizihszlbmzzjrqye`
actualizar dependencias: `pnpm add next@latest react@latest react-dom@latest`
ver que falta por actualizar: `pnpm update --interactive --latest`
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
                