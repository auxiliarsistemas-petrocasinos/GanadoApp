# Security checklist — GanadoApp

## P0 (hoy)

- [ ] Eliminar `SUPABASE_SERVICE_ROLE_KEY` de Server Actions (`src/actions/*`) y usar cliente con sesión (anon+cookies) + RLS.
- [ ] Implementar protección real de rutas (middleware oficial de Next 16 para este repo).
- [ ] Separar Supabase client browser vs server (evitar `supabaseAdmin` en módulos importables por client).

## P1 (esta semana)

- [ ] Habilitar RLS + policies en `registros_auditoria`.
- [ ] Completar policies faltantes (`lotes` DELETE si aplica).
- [ ] Endurecer función `SECURITY DEFINER` (`search_path`, owner/privilegios).
- [ ] Añadir límites superiores en Zod (`src/lib/validations.ts`) y constraints equivalentes en SQL si aplica.

## P2 (este mes)

- [ ] Añadir security headers/CSP (según guía Next 16 del proyecto).
- [ ] Configurar revisión de dependencias: `npm audit` en CI y actualización regular.
- [ ] Añadir escaneo de secretos (gitleaks) en CI.
- [ ] Documentar modelo de permisos/roles (admin/operario) y aplicarlo en policies.

