# Auditoría de seguridad y estándares — GanadoApp

Fecha: 2026-05-27  
Alcance: Revisión estática del repo (sin ejecutar Node/Next, sin `npm audit`).  

## Resumen ejecutivo

Estado inicial: **riesgo crítico** por combinación de (1) **Server Actions usando `SUPABASE_SERVICE_ROLE_KEY`** y (2) **queries sin “scoping” por usuario/granja** (multi-tenant break).  
Estado actual (tras hardening en el repo): Service Role eliminado de Server Actions y auth guard reforzado vía `proxy.ts` (Next.js 16 renombró Middleware → Proxy).  
Impacto: **cualquier visitante** podría invocar acciones del servidor y **leer/modificar datos de otras granjas** (multi-tenant break), además de romper el modelo de seguridad basado en RLS.

## Hallazgos (priorizados)

### [CRÍTICO] Bypass total de RLS por uso de Service Role en Server Actions

- Evidencia:
  - `src/actions/lotes.ts` usa `createClient(..., process.env.SUPABASE_SERVICE_ROLE_KEY!)`.
  - `src/actions/registros.ts` usa `createClient(..., process.env.SUPABASE_SERVICE_ROLE_KEY!)`.
- Por qué es crítico:
  - El **Service Role bypass** ignora RLS y opera como “superusuario” desde la app.
  - Las acciones hacen consultas como `from('usuarios').select(...).limit(1).single()` sin filtrar por `auth.uid()`: con Service Role eso devuelve **cualquier fila** (la “primera”), causando fuga/alteración cross-tenant.
- Impacto:
  - Lectura/escritura arbitraria de `lotes` y `registros_gallinas` entre granjas.
  - Auditoría en BD (`registros_auditoria`) pierde trazabilidad porque `auth.uid()` puede ser `NULL` cuando se usa Service Role.
- Recomendación (hardening):
  1) **Eliminar Service Role de Server Actions**; usar un cliente “server-side” con **anon key + cookies** (sesión) para que aplique RLS.
  2) En cada acción, obtener usuario autenticado (`auth.getUser()` / `auth.uid()` vía cookie) y **scopear por `granja_id`**.
  3) Si hay operaciones administrativas reales, aislarlas en endpoints internos con controles estrictos (solo admins) y/o ejecutarlas fuera del runtime público (jobs).

### [ALTO] Asegurar que el Proxy cubra todas las rutas protegidas

- Evidencia:
  - El proyecto usa `src/proxy.ts` (Proxy, antes “Middleware” en Next <16).
- Riesgo:
  - Si el matcher o la lista de rutas protegidas queda incompleta, usuarios no autenticados pueden acceder a pantallas internas.
- Recomendación:
  - Mantener `src/proxy.ts` como “source of truth” para rutas protegidas y cubrir módulos completos.

### [ALTO] Módulo compartido exporta “admin client” y mezcla contexto client/server

- Evidencia:
  - `src/lib/supabase.ts` exporta `createClient()` (browser) y `supabaseAdmin` (service role/anon fallback) en el mismo archivo.
  - `createClient()` se usa desde componentes client (`src/app/login/page.tsx`, `src/components/layout/Sidebar.tsx`).
- Riesgo:
  - Alto riesgo de **bundle accidental** o mal uso del cliente “admin”.
  - Aumenta la probabilidad de que alguien importe `supabaseAdmin` desde un Client Component por error.
- Recomendación:
  - Separar en módulos explícitos:
    - `src/lib/supabase-browser.ts` (solo `createBrowserClient` con anon key).
    - `src/lib/supabase-server.ts` (solo server, y **sin exportar** service role a módulos que puedan tocar client).
  - Evitar cualquier “fallback” de service role a anon key en un mismo export: falla silenciosa y oculta errores.

### [ALTO] Políticas/RLS incompletas en BD (auditoría sin RLS; lotes sin DELETE policy)

- Evidencia:
  - `supabase/schema.sql` no habilita RLS ni policies para `registros_auditoria`.
  - `supabase/schema_lotes.sql` no define policy `DELETE` para `lotes` (solo SELECT/INSERT/UPDATE).
- Riesgo:
  - Si Supabase tiene grants por defecto a `authenticated`, la auditoría podría quedar **expuesta**.
  - Inconsistencia funcional: la app sí tiene `eliminarLote(...)` en `src/actions/lotes.ts`.
- Recomendación:
  - Habilitar RLS en `registros_auditoria` y crear policies mínimas:
    - SELECT solo a miembros de la granja o solo a admins.
  - Definir policy DELETE en `lotes` o remover funcionalidad si no se desea.

### [MEDIO] Función `SECURITY DEFINER` sin endurecimiento

- Evidencia:
  - `supabase/schema.sql` define `audit_registros_gallinas()` como `SECURITY DEFINER`.
- Riesgo:
  - Buen patrón para auditoría, pero debe endurecerse para evitar abuso:
    - fijar `search_path`
    - minimizar privilegios del owner
    - evitar dependencias de objetos resolubles por `search_path`
- Recomendación:
  - Ajustar función para fijar `search_path` explícito y revisar owner/privilegios.

### [MEDIO] Validaciones sin límites superiores (riesgo de datos anómalos / DoS)

- Evidencia:
  - `src/lib/validations.ts`: números `huevos`, `muertes`, `alimento_*` no tienen `max(...)`.
- Impacto:
  - Inputs enormes pueden generar costos de almacenamiento, render lento (charts), o errores.
- Recomendación:
  - Definir rangos razonables por negocio (ej. `huevos <= 1_000_000`, etc.).

### [BAJO] Calidad/UX con implicaciones de seguridad operativa

- Evidencia:
  - `src/components/layout/Sidebar.tsx` muestra usuario/rol hardcodeado (`manuel.amado`, `Admin`).
- Riesgo:
  - Confusión operativa, auditorías internas incorrectas, falsa sensación de rol.
- Recomendación:
  - Cargar usuario/rol real desde sesión + tabla `usuarios` (vía RLS).

## Recomendaciones concretas (orden sugerido)

1) **Cortar el vector crítico**:
   - Reemplazar Service Role en Server Actions por cliente con sesión (anon + cookies) y RLS.
2) **Activar guard de auth**:
   - Implementar middleware real para proteger `/dashboard`, `/lotes`, `/registros`, `/vacas`, `/peces`, `/chatbot`.
3) **Separar clientes Supabase**:
   - Módulos browser vs server, y prohibir `supabaseAdmin` en imports de client.
4) **Ajustes de BD**:
   - RLS + policies para auditoría; completar policies de `lotes`; revisar función definer.
5) **Endurecer validaciones**:
   - Límites superiores y sanitización consistente.
6) **Headers y hardening web** (cuando se confirme la API de Next 16 en este repo):
   - `X-Frame-Options`/`frame-ancestors` (CSP), `Referrer-Policy`, `Permissions-Policy`, `X-Content-Type-Options`, `Strict-Transport-Security` (en prod).

## Acciones de verificación (en tu máquina con Node/npm)

- `npm ci`
- `npm audit` (y luego `npm audit fix` con criterio)
- `npm run lint`
- (si aplica) escaneo de secretos: `gitleaks detect` o equivalente

## Notas del entorno de auditoría

En este entorno no fue posible ejecutar herramientas de Node:
- `npm` no está disponible.
- `node.exe` devuelve “Acceso denegado”.

Con Node/npm disponibles, puedo:
- implementar el refactor (middleware + supabase clients + server actions con RLS),
- añadir checks automatizados (lint/security),
- y dejar pruebas mínimas para evitar regresiones.
