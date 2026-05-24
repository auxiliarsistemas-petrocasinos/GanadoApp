# 🏗️ DECISIONES ARQUITECTÓNICAS - GanadoApp
## Justificaciones y Alternativas Consideradas

---

## 1. ARQUITECTURA: Full-Stack Antigravity (Vercel + Supabase)

### ✅ Decisión: Integrar Backend + Frontend en Antigravity

### Alternativas Evaluadas

#### Opción A: Arquitectura Monolítica (RECOMENDADA ✅)
```
Vercel (Frontend + Backend integrado)
  ├─ Next.js/Antigravity
  ├─ Server Actions
  └─ API Routes
       ↓
  Supabase (PostgreSQL + Auth)
```

**Ventajas:**
- Código centralizado (menos duplicación)
- Server Actions → Supabase es trivial (1 paso)
- Hot reload en desarrollo
- Despliegue atómico (frontend + backend juntos)
- No necesitas mantener 2 repos
- JWT nativo con Supabase
- Cost: $0-$50/mes total

**Desventajas:**
- Si la API crece mucho (Fase 3+) puede haber acoplamiento
- Versionamiento: ambas capas en mismo repo

**Curva de Aprendizaje:** Baja (ya conoces Antigravity)

---

#### Opción B: Arquitectura Separada (API Backend + Frontend)
```
Vercel (Frontend)
  └─ Next.js Frontend + Fetch API
       ↓ (HTTPS)
  Backend Separado (FastAPI/Django/Node)
    (Railway/Render/Fly.io)
       ↓
  Supabase PostgreSQL
```

**Ventajas:**
- Escalabilidad independiente
- Equipos separados (no aplica, solo tú)
- API reutilizable (móvil futura)

**Desventajas:**
- Más complejidad ahora (overhead para MVP)
- Duplicación de lógica validación
- Overhead CORS + autenticación distribuida
- Cost: $0-$100/mes (dos hostings)
- Debugging más difícil (2 procesos)

**Curva de Aprendizaje:** Alta (orchestración)

**Veredicto:** ❌ Rechazada. Es overkill para MVP.

---

#### Opción C: Arquitectura de Eventos (Event-Driven)
```
Frontend → API REST → Message Queue (RabbitMQ)
  → Workers (Async)
  → PostgreSQL
```

**Ventajas:**
- Desacoplamiento completo
- Escalable a millones de eventos

**Desventajas:**
- Complejidad extrema para MVP
- Cost: $50+ extra/mes
- Debugging pesadilla

**Veredicto:** ❌ Rechazada. Para año 2-3.

---

### 🎯 Recomendación Final
**Antigravity Full-Stack** es el sweet spot:
- MVP rápido (Fase 0-2)
- Arquitectura limpia
- Escalable sin refactor

**Upgrade Path:** Si en Fase 3+ necesitas API separada, es fácil extraer Server Actions a backend separado sin cambiar cliente.

---

## 2. BASE DE DATOS: PostgreSQL (Supabase) desde Día 1

### ✅ Decisión: PostgreSQL, No SQLite

### Alternativas Evaluadas

#### Opción A: SQLite (Local Development)
```
Vercel + SQLite ❌ (no persistence en serverless)
     ↓
Vercel + Neon (SQLite wrapper) ⚠️ (overhead)
```

**Ventajas:**
- Desarrollo local simple
- Perfecto para prototipos

**Desventajas:**
- Serverless Vercel no puede escribir a disco → no persiste datos
- Necesitas Neon o similar → extra complejo
- Índices limitados
- Transacciones simples
- No RLS nativo

**Veredicto:** ❌ No viable para producción en Vercel.

---

#### Opción B: PostgreSQL (Supabase) ✅ RECOMENDADA
```
Vercel
  → Supabase PostgreSQL (managed)
  → RLS + Auth nativo
  → Backups automáticos
  → Cost: $25/mes (o free tier para MVP)
```

**Ventajas:**
- Hosted: sin ops
- RLS integrado (seguridad automática)
- Indices avanzados, transacciones ACID
- Triggers para auditoría automática
- Backups diarios gratis
- Auth JWT integrado
- Compatible con Vercel (1000% uptime en proyecto tuyo)

**Desventajas:**
- Requiere SQL conocimientos (pero estás OK)

**Veredicto:** ✅ La opción correcta.

---

#### Opción C: MongoDB (NoSQL)
```
Vercel + MongoDB Atlas
```

**Ventajas:**
- Flexible schema (agregar campos easy)
- JSON nativo

**Desventajas:**
- Transacciones más débiles
- RLS simulada (código en app)
- Consultas complejas difíciles (analytics)
- Auditoría manual
- Overkill para datos estructurados (gallinas)

**Veredicto:** ❌ Rechazada. Tu data es relacional.

---

### Justificación: ¿Por qué PostgreSQL?

**Tu data es relacional:**
```
usuarios ← → granjas ← → registros_gallinas
                          ↓ (auditoria)
                     registros_auditoria
```

**Necesitas:**
- ✅ Integridad referencial (FK)
- ✅ Transacciones ACID (no datos corrompidos)
- ✅ RLS (cada usuario ve solo su granja)
- ✅ Triggers (auditoría automática)
- ✅ Indices (queries rápidas en histórico)

PostgreSQL domina aquí.

---

## 3. AUTENTICACIÓN: JWT + Supabase Auth

### ✅ Decisión: Supabase Auth (JWT Nativo)

### Alternativas Evaluadas

#### Opción A: Sesiones Simples
```
Login → Guardar en BD → Cookie con session_id → Verificar cada request
```

**Ventajas:**
- Familiar (viejo estilo)

**Desventajas:**
- Stateful (BD crece con sesiones)
- No escalable (stateless es mejor)
- CSRF/XSRF complicado
- Revocación lenta

**Veredicto:** ❌ Rechazada. Estamos en 2026.

---

#### Opción B: JWT (Supabase Auth) ✅ RECOMENDADA
```
1. Login → Supabase Auth
2. Devuelve: JWT access + refresh token
3. Frontend: guarda en HttpOnly Cookie
4. Cada request: incluye JWT
5. Verifica: JWT signature (sin hit DB)
6. Refresh automático: refresh token → nuevo JWT
```

**Ventajas:**
- Stateless (sin sesiones en BD)
- Revocación rápida
- Mobile-ready (para app futura)
- 2FA soportado
- OAuth2 fácil (Google login futura)
- Supabase maneja refresh automático

**Desventajas:**
- Requiere manejo de refresh tokens

**Veredicto:** ✅ Opción correcta.

---

#### Opción C: OAuth2 (Google/GitHub)
```
Login → Redirect Google → JWT desde Google → App
```

**Ventajas:**
- Usuarios no crean password
- Seguridad delegada

**Desventajas:**
- Requiere tu aplicación registrada (Fase 2+)
- No es alternativa a JWT, es adicional

**Veredicto:** ⚠️ Complementaria (Fase 2).

---

### Flujo JWT Recomendado (Código)

```typescript
// login.ts - Server Action
export async function login(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  
  if (error) return { error: error.message };
  
  // Supabase automáticamente:
  // 1. Genera JWT access token (15 min)
  // 2. Genera refresh token (30 días)
  // 3. Guarda en HttpOnly cookie segura
  
  return { success: true, user: data.user };
}

// middleware.ts - Verificar en cada request
export async function middleware(request: NextRequest) {
  const user = await supabase.auth.getUser();
  
  if (!user) {
    // Intenta refresh automático
    const { data } = await supabase.auth.refreshSession();
    if (!data?.session) {
      return NextResponse.redirect('/login');
    }
  }
  
  return NextResponse.next();
}
```

---

## 4. VALIDACIONES: Zod + Server-Side

### ✅ Decisión: Zod Schema + Server Actions

### Alternativas Evaluadas

#### Opción A: Sin Validaciones
```
Input → Directamente DB ❌
```

**Veredicto:** ❌ Rechazada (inseguro).

---

#### Opción B: Solo Frontend (HTML5 validation)
```
Input → HTML5 pattern → DB
```

**Ventajas:**
- UX rápido

**Desventajas:**
- Usuario puede bypassear (F12)
- No es seguridad real

**Veredicto:** ⚠️ Necesaria pero insuficiente.

---

#### Opción C: Zod Server-Side + Frontend ✅ RECOMENDADA
```
Frontend:
  HTML5 + React Zod client-side
       ↓ (submit)
Server Actions:
  1. Parse con Zod schema
  2. Si error → devuelve al cliente
  3. Validar duplicados en DB
  4. Validar relaciones (FK)
  5. INSERT/UPDATE
```

**Ventajas:**
- Type-safe (TypeScript)
- Reusable schema (frontend + server)
- DRY (no duplicar validaciones)
- Error messages consistentes
- Imposible bypassear

**Desventajas:**
- Requiere setup Zod

**Veredicto:** ✅ Best practice.

---

### Ejemplo Validación Robusta

```typescript
// lib/validations.ts
export const registroSchema = z.object({
  fecha: z
    .date()
    .max(new Date(), "No puede ser futura")
    .refine(
      (d) => !isWeekend(d),
      "Solo días de semana"
    ),
  
  huevos: z
    .number()
    .min(0)
    .max(z.ref('cantidad_gallinas') * 1.2), // Física
});

// app/actions.ts
export async function crearRegistro(data: unknown) {
  // 1. Parse + validación Zod
  const parsed = registroSchema.safeParse(data);
  if (!parsed.success) {
    return { 
      error: 'Validación fallida',
      details: parsed.error.flatten() 
    };
  }

  // 2. Validar duplicados
  const existe = await supabase
    .from('registros_gallinas')
    .select('id')
    .eq('granja_id', granjaId)
    .eq('fecha', parsed.data.fecha)
    .single();
  
  if (existe.data) {
    return { error: 'Ya existe registro para esta fecha' };
  }

  // 3. Insertar
  const { data: registro, error } = await supabase
    .from('registros_gallinas')
    .insert(parsed.data);

  if (error) {
    return { error: error.message };
  }

  return { success: true, registro };
}
```

---

## 5. DASHBOARD: Completo desde Fase 2

### ✅ Decisión: 4-5 Gráficas + 4 KPI Cards

### Alternativas Evaluadas

#### Opción A: Dashboard Mínimo (Solo números)
```
┌─────────────────────────────────┐
│ Huevos hoy: 450                 │
│ Promedio semana: 400            │
│ Mortalidad: 2.5%                │
└─────────────────────────────────┘
```

**Ventajas:**
- Rápido de implementar (1 día)
- Performance: no gráficas

**Desventajas:**
- No muestra tendencias
- Usuario no ve "historias" en datos
- Menos useful

**Veredicto:** ⚠️ Insuficiente.

---

#### Opción B: Dashboard Completo (4-5 gráficas + KPIs) ✅ RECOMENDADA
```
┌──────────────────────────────────────────────────────┐
│  KPI Cards:                                          │
│  Huevos hoy | Promedio semanal | Mortalidad | Alimento
├──────────────────────────────────────────────────────┤
│  [Line Chart]           │  [Bar Chart]               │
│  Huevos últimos 30d     │  Huevos por semana        │
├──────────────────────────────────────────────────────┤
│  [Area Chart]           │  [Gauge]                   │
│  Acumulado              │  Mortalidad %              │
└──────────────────────────────────────────────────────┘
```

**Ventajas:**
- User ve tendencias
- Alertas visuales (mortalidad roja)
- Profesional
- Responsivo

**Desventajas:**
- Requiere Recharts
- Datos más complejos para calcular

**Veredicto:** ✅ Worth it. Es el heart de la app.

---

#### Opción C: Dashboard Extremo (15+ gráficas)
```
Cada métrica → gráfica
Comparación teórica
Correlación alimento-producción
etc.
```

**Ventajas:**
- Mucho análisis

**Desventajas:**
- Análisis parálisis
- Slow performance
- Confunde al usuario

**Veredicto:** ❌ Rechazada. KISS.

---

### Librería Gráficas: Recharts

**Por qué Recharts:**
- React nativa (no charts.js)
- Responsive por defecto
- Bonito out-of-the-box
- Suporta dark mode

**Alternativas:**
- ❌ Chart.js: No es React (wrapper incómodo)
- ⚠️ Plotly: Overkill
- ✅ Recharts: Perfect fit

---

## 6. ESCALABILIDAD: Arquitectura Modular desde Día 1

### ✅ Decisión: Diseñar para Múltiples Granjas (sin implementar)

### Por qué esto importa

**Escenario Futuro (Fase 2+):**
```
Granja A (gallinas)
Granja B (vacas)
Granja C (peces)
```

Si diseñas sin `granja_id`:
```sql
-- ❌ MAL
registros_gallinas (fecha, cantidad, huevos, ...)
               -- Sin granja_id, asumes 1 granja forever
```

Luego necesitas:
```sql
-- ❌ Refactor dolor
ALTER TABLE registros_gallinas ADD granja_id UUID;
-- Migraciones complejas
-- Testing todo de nuevo
```

**Si diseñas CON `granja_id` (lo que hice):**
```sql
-- ✅ BIEN
registros_gallinas (granja_id, fecha, cantidad, huevos, ...)
               -- Multi-granja desde el inicio
```

Para agregar Granja B:
```
1. Insertar granjas row → id=456
2. Insertar registros con granja_id=456
3. RLS automáticamente protege
4. DONE (no refactor)
```

---

### Patrón para Futuros Módulos

**Tabla Gallinas (MVP):**
```sql
CREATE TABLE registros_gallinas (
  id UUID PRIMARY KEY,
  granja_id UUID, -- ← LLAVE
  fecha DATE,
  huevos INT,
  CONSTRAINT unique_fecha_granja UNIQUE (granja_id, fecha)
);
```

**Tabla Vacas (Fase 2, copy-paste):**
```sql
CREATE TABLE registros_vacas (
  id UUID PRIMARY KEY,
  granja_id UUID, -- ← MISMO PATRÓN
  fecha DATE,
  litros_leche FLOAT,
  porcentaje_grasa FLOAT,
  CONSTRAINT unique_fecha_granja UNIQUE (granja_id, fecha)
);
```

**Tabla Peces (Fase 3, repeat):**
```sql
CREATE TABLE registros_peces (
  id UUID PRIMARY KEY,
  granja_id UUID,
  fecha DATE,
  cantidad INT,
  peso_promedio FLOAT,
  CONSTRAINT unique_fecha_granja UNIQUE (granja_id, fecha)
);
```

**Dashboard genérico (reutilizable):**
```typescript
async function getDashboard(granjaId: string, modulo: 'gallinas' | 'vacas' | 'peces') {
  const tableName = `registros_${modulo}`;
  const registros = await supabase
    .from(tableName)
    .select('*')
    .eq('granja_id', granjaId);
  
  // Cálculos dinámicos según modulo
  return calcularKPIs(registros, modulo);
}
```

**CERO refactor. Es hermoso.**

---

## 7. FASE 1 vs FASE 2: MVP Equilibrado

### ✅ Decisión: MVP Equilibrado (no MVP mínimo)

### Alternativas

#### Opción A: MVP Extremadamente Mínimo
```
Fase 1 (2 semanas):
  - Login
  - Form: ingresar fecha, huevos
  - Tabla básica
  - NADA de gráficas
```

**Ventajas:**
- Muy rápido
- Funcional

**Desventajas:**
- Sin value visual
- No ves tendencias
- Parece incompleto

**Veredicto:** ❌ Desmotivador.

---

#### Opción B: MVP Equilibrado ✅ RECOMENDADA
```
Fase 1 (2-3 semanas):
  - Auth
  - CRUD registros
  - Validaciones
  - Tabla histórica

Fase 2 (2-3 semanas):
  - Dashboard 4-5 gráficas
  - Cálculos completos
  - KPI cards
```

**Ventajas:**
- Fase 1: funcional + usable
- Fase 2: visual + powerful
- Timeline realista
- User happy en Fase 2

**Veredicto:** ✅ El plan correcto.

---

#### Opción C: Todo en Fase 1
```
1-2 meses:
- Auth
- CRUD
- Dashboard completo
- Auditoría
- Validaciones
- Alertas
```

**Ventajas:**
- Solo una fase
- Completo rápido

**Desventajas:**
- Riesgo: burnout
- Debugging difícil
- Menos tiempo para testing

**Veredicto:** ⚠️ Posible pero acelerado.

---

## 8. REPORTES PDF/EXCEL: En Fase 2

### ✅ Decisión: No en MVP

### Razón

**80/20 rule:**
- Dashboard cubre 80% del valor
- Reportes: 20% del valor, 40% del trabajo
- Mejor: polir dashboard en Fase 1

**Fase 2+:** Agregar reportes es trivial:
```typescript
// app/actions.ts
export async function exportarRegistrosCSV(fechaInicio, fechaFin) {
  const { data } = await supabase
    .from('registros_gallinas')
    .select('*')
    .gte('fecha', fechaInicio)
    .lte('fecha', fechaFin);
  
  // Convertir a CSV
  const csv = registros.map(r => 
    `${r.fecha},${r.huevos},${r.alimento_kg},...`
  ).join('\n');
  
  // Download
  return csv;
}
```

**PDF (Fase 2+):**
```typescript
// npm i jspdf
import jsPDF from 'jspdf';

export async function generarReportePDF(granjaId, fecha) {
  const doc = new jsPDF();
  const { data: registros } = await obtenerRegistros(...);
  
  doc.text('Reporte Mensual', 10, 10);
  doc.autoTable({
    head: [['Fecha', 'Huevos', 'Alimento']],
    body: registros.map(r => [r.fecha, r.huevos, r.alimento_kg])
  });
  
  doc.save('reporte.pdf');
}
```

---

## 9. CHATBOT: Fase Avanzada (Skip para MVP)

### ✅ Decisión: No incluir

### Por qué no

**Costo real:**
- Integración LLM (OpenAI/Claude) → $20+/mes
- Prompt engineering → 10-20 horas
- Fine-tuning en tus datos → 10 horas
- Testing → 5 horas
- **Total: 25-35 horas (1-2 semanas)**

**Valor real:**
- "¿Cuántos huevos en promedio?" → Usuario abre dashboard (5s)
- "¿Hay alerta de mortalidad?" → Dashboard lo dice (visible)
- Chatbot evita 1-2 clicks... no worth it

**Veredicto:** ❌ "Nice to have" = no hacer.

**Si fuera crítico (ej: app móvil sin dashboard):** Sería diferente.

---

## Resumen: Decisiones Clave

| Decisión | Opción | Razón |
|----------|--------|-------|
| Arquitectura | Full-stack Antigravity | MVP rápido, escalable |
| BD | PostgreSQL (Supabase) | RLS, transacciones, triggers |
| Auth | JWT (Supabase Auth) | Stateless, mobile-ready |
| Validaciones | Zod server-side | Type-safe, imposible bypassear |
| Dashboard | 4-5 gráficas Recharts | Visual, tendencias, value |
| Escalabilidad | Multi-granja desde día 1 | 0 refactor en Fase 2 |
| Reportes | Fase 2+ | 80/20, trivial después |
| Chatbot | Skip | Low value, high effort |
| Fases | 6 fases en 8-12 semanas | Equilibrado |

---

## Próximos Pasos

1. **Validar plan contigo** → ¿Está de acuerdo?
2. **Clarificar dudas** → ¿Preguntas sobre decisiones?
3. **Comenzar Fase 0** → Setup proyecto
4. **Fase 1** → CRUD + Auth

¿Alguna pregunta sobre estas decisiones?
