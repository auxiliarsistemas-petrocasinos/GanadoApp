# 🚀 PLAN DE IMPLEMENTACIÓN – GANADOAPP
## Gestión Integral de Producción Avícola y Ganadera
**Versión:** 2.0 Optimizado | **Stack:** Antigravity + Supabase + Vercel | **Enfoque:** MVP Equilibrado con Escalabilidad

---

## 📋 ÍNDICE
1. [Objetivo del Proyecto](#objetivo)
2. [Recomendaciones Clave](#recomendaciones)
3. [Arquitectura General](#arquitectura)
4. [Stack Tecnológico](#stack)
5. [Módulos del Sistema](#módulos)
6. [Modelo de Datos](#datos)
7. [Lógica de Negocio](#lógica)
8. [Endpoints / Actions](#endpoints)
9. [Fases de Desarrollo](#fases)
10. [Notas de Escalabilidad](#escalabilidad)
11. [Principios Clave](#principios)

---

## 🎯 OBJETIVO DEL PROYECTO {#objetivo}

Desarrollar una **aplicación web modular** para gestión y análisis de producción avícola (gallinas ponedoras MVP) que permita:

- ✅ Registrar datos diarios con **validaciones robustas**
- ✅ Generar **estadísticas automáticas** con historial completo
- ✅ Visualizar **dashboard completo** con gráficas en tiempo real
- ✅ **Autenticación segura** (JWT) preparada para extensión futura
- ✅ Escalable a **múltiples módulos** (vacas, peces) y **granjas**

**No incluido en MVP:** Reportes PDF/Excel, Chatbot (fase avanzada)

---

## 💡 RECOMENDACIONES CLAVE {#recomendaciones}

### 1. **Arquitectura Recomendada: Full-Stack Antigravity**
**Por qué:** Antigravity permite:
- Backend + Frontend integrado en un stack único
- Realtime updates sin complejidad de REST API
- Hosting en Vercel sin fricción
- Mejor developer experience para proyecto tipo CRUD + dashboard

```
┌─────────────────────────────────┐
│   Vercel (Antigravity Full-Stack)│
│  ├─ Frontend (ShadcN + Tailwind) │
│  ├─ Server Actions / API Routes  │
│  └─ WebSocket realtime           │
└─────────────────────────────────┘
              ↓
┌─────────────────────────────────┐
│  Supabase (PostgreSQL + Auth)    │
│  ├─ Base de datos               │
│  ├─ Auth (JWT tokens)           │
│  └─ Real-time subscriptions     │
└─────────────────────────────────┘
```

**Alternativa rechazada:** Backend separado (más overhead para MVP equilibrado)

---

### 2. **Base de Datos: PostgreSQL (Supabase) desde Día 1**
**Por qué:**
- SQLite es insuficiente para "historial completo" + queries complejas
- Supabase incluye PostgreSQL hosted + Auth JWT integrada
- Supabase → Vercel es nativo y gratuito en ambos
- Costo: $25/mes o menos para tu volumen inicial

**Estructura recomendada:**
```sql
-- Row-level security (RLS) activado para seguridad futura
-- Triggers para auditoría automática
-- Índices en campos críticos (fecha, granja_id)
```

---

### 3. **Autenticación: JWT + Refresh Tokens (Supabase Auth)**
**Por qué:**
- Supabase Auth es gratis y usa JWT nativamente
- Soporta múltiples usuarios sin código adicional
- Refresh tokens automáticos
- Facilita escalación a múltiples granjas

**Flujo:**
```
Login → Supabase JWT (acceso + refresh) → Cookie segura → ✅ Autenticado
```

---

### 4. **Validaciones Robustas desde Día 1**
**Por qué:** Los datos agrícolas son críticos
- Imposibilidad de "huevos negativos" o fechas futuras
- Alertas si mortalidad > 10% (anomalía)
- Validación duplicados (no dos registros mismo día)

**Implementación:** Zod + Server-side validation

---

### 5. **Dashboard Completo (Fase 1)**
**Por qué:** Es el core value para el usuario
- 4-5 gráficas principales (no overkill)
- KPIs clave: producción, mortalidad, tendencias
- Recharts para gráficas responsivas + bonitas

---

## 🏗️ ARQUITECTURA GENERAL {#arquitectura}

### Componentes Principales

```
┌─────────────────────────────────────────────────────┐
│                   VERCEL (FRONTEND)                 │
│  ┌───────────────────────────────────────────────┐  │
│  │  ShadcN/UI Components (Petrocasinos Theme)    │  │
│  │  - Login Screen                               │  │
│  │  - Dashboard (gráficas con Recharts)          │  │
│  │  - Registro Diario (formulario validado)      │  │
│  │  - Historial / Tabla de registros             │  │
│  │  - Settings (usuario)                         │  │
│  └───────────────────────────────────────────────┘  │
│  ┌───────────────────────────────────────────────┐  │
│  │  Server Actions (Antigravity Backend)         │  │
│  │  - POST: crear registro                       │  │
│  │  - PUT: editar registro                       │  │
│  │  - DELETE: eliminar registro                  │  │
│  │  - GET: fetch registros + cálculos            │  │
│  │  - GET: dashboard data                        │  │
│  └───────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────┘
              ↓ (HTTPS + JWT)
┌─────────────────────────────────────────────────────┐
│        SUPABASE (DATABASE + AUTH)                   │
│  ┌───────────────────────────────────────────────┐  │
│  │  PostgreSQL Tables:                           │  │
│  │  ├─ usuarios                                  │  │
│  │  ├─ granjas                                   │  │
│  │  ├─ registros_gallinas                        │  │
│  │  └─ registros_auditoría (historial)           │  │
│  ├─ Supabase Auth (JWT)                          │  │
│  └─ Row-Level Security (RLS)                     │  │
│  └─ Real-time subscriptions (opcional Fase 2)    │  │
└─────────────────────────────────────────────────────┘
```

### Flujo de Datos
```
Usuario → Login → JWT (Supabase) → ShadcN Form → Server Action
                                                      ↓
                                            Validar (Zod)
                                                      ↓
                                        INSERT/UPDATE/DELETE
                                                      ↓
                                         Recalcular KPIs
                                                      ↓
                                         Response + UI Update
```

---

## ⚙️ STACK TECNOLÓGICO {#stack}

| Capa | Tecnología | Razón |
|------|-----------|-------|
| **Hosting Frontend** | Vercel | Nativo con Antigravity |
| **Framework Frontend** | Next.js/Antigravity | Full-stack integrado |
| **UI Components** | ShadcN/UI | Profesional + customizable |
| **Estilos** | Tailwind CSS | Ya tienes config |
| **Tema** | Petrocasinos (azul #324158 + naranja #FF6A23) | Consistente |
| **Gráficas** | Recharts | Reactiva + responsiva |
| **Database** | PostgreSQL (Supabase) | Robusta + escalable |
| **Autenticación** | Supabase Auth (JWT) | Gratuita + segura |
| **Validación** | Zod | Type-safe |
| **ORM/Query** | Supabase JS Client o Drizzle | Recomendado: Drizzle para type-safety |
| **Testing** | Vitest + Testing Library | Para Fases 3+ |

---

## 🧩 MÓDULOS DEL SISTEMA {#módulos}

### 🔐 Módulo 1: Autenticación
**Responsabilidad:** Login/Logout seguro, gestión JWT

**Funcionalidades Fase 1:**
- ✅ Login con email + contraseña (Supabase Auth)
- ✅ Logout y destrucción de sesión
- ✅ Protección de rutas (middleware)
- ✅ Refresh token automático

**Escalabilidad Futura:**
- 2FA (two-factor authentication)
- OAuth2 (Google, GitHub)
- Roles granulares (Fase 2: Admin, Gestor, Visor)

---

### 🏠 Módulo 2: Dashboard
**Responsabilidad:** Visualización central de KPIs y tendencias

**Componentes Fase 1 (todos con datos recalculados):**
1. **Card de Producción Diaria** → Huevos registrados hoy
2. **Card de Promedio Semanal** → Huevos/día promedio esta semana
3. **Card de Mortalidad** → % de muertes (con alerta si > 10%)
4. **Card de Consumo** → kg alimento consumido semana

**Gráficas (Recharts):**
1. **Line Chart:** Huevos diarios (últimos 30 días)
2. **Bar Chart:** Huevos por semana (últimas 8 semanas)
3. **Area Chart:** Producción acumulada (mes actual)
4. **Gauge Chart:** Mortalidad % (indicador de salud)

**Refresh:** Auto-refresh cada 1 minuto (Fase 2: realtime con WebSocket)

---

### 🐔 Módulo 3: Registros Diarios (CORE)
**Responsabilidad:** CRUD para datos avícolas con validaciones

**Campos por Registro:**
```
- fecha (date, required, no future, unique per day)
- cantidad_gallinas (int, required, > 0, ≤ 10000)
- huevos (int, required, ≥ 0)
- muertes (int, required, ≥ 0, ≤ cantidad_gallinas)
- alimento_kg (float, required, ≥ 0)
- notas (text, optional)
- granja_id (UUID, for future multi-granja)
```

**Validaciones (Zod):**
```javascript
// Ejemplo
const registroSchema = z.object({
  fecha: z.date().max(new Date(), "No futuro"),
  cantidad_gallinas: z.number().int().min(1),
  huevos: z.number().int().min(0).max(z.ref('cantidad_gallinas')),
  muertes: z.number().int().min(0).max(z.ref('cantidad_gallinas')),
  alimento_kg: z.number().positive(),
  // Validación cross-field en server action
});
```

**CRUD Operaciones:**
- ✅ **CREATE** → Nuevo registro diario
- ✅ **READ** → Tabla histórica, filtrable por rango fechas
- ✅ **UPDATE** → Editar registro (con auditoría)
- ✅ **DELETE** → Eliminar registro (soft-delete recomendado)

**UI Components:**
- Form dialogo (crear/editar)
- Data Table con paginación
- Búsqueda por fecha
- Exportar a CSV (Fase 1 simple)

---

### 📊 Módulo 4: Estadísticas & Cálculos
**Responsabilidad:** Lógica de negocio, motor de cálculos

**Cálculos Automáticos (por Server Action):**

```javascript
// Todos estos se recalculan en DB o server
- produccion_diaria = huevos
- produccion_semanal = SUM(huevos) GROUP BY WEEK
- produccion_acumulada = SUM(huevos) DESDE inicio
- produccion_porcentual = huevos / cantidad_gallinas * 100
- mortalidad_diaria = (muertes / cantidad_gallinas) * 100
- mortalidad_semanal = SUM(muertes) / AVG(cantidad_gallinas) * 100
- consumo_alimento_semanal = SUM(alimento_kg) per week
- huevos_por_kg_alimento = huevos / alimento_kg (eficiencia)
- alerta_mortalidad = SI mortalidad > 10% THEN "⚠️ Alto"
- comparacion_teorica = (real / teorico) * 100  [Fase 2]
```

**Donde viven estos cálculos:**
- **Server-side:** PostgreSQL (computed columns) + Server Actions (Node.js)
- **NO en frontend:** Evita inconsistencias

---

### 🔍 Módulo 5: Historial & Auditoría
**Responsabilidad:** Rastrear cambios en registros

**Tabla `registros_auditoria`:**
```sql
id, registro_id, accion (CREATE/UPDATE/DELETE), 
antes (JSON), despues (JSON), usuario_id, timestamp
```

**Visibilidad:** Solo en admin panel (Fase 2)

---

### 👤 Módulo 6: Perfil Usuario
**Responsabilidad:** Gestión de cuenta personal

**Funcionalidades Fase 1:**
- ✅ Ver datos perfil (email)
- ✅ Cambiar contraseña
- ✅ Logout

**Escalabilidad Futura (Fase 2):**
- Crear múltiples usuarios en misma granja
- Roles: Admin, Operario, Visor
- Invitar usuarios por email

---

### 🚫 Módulos NO en MVP
- ❌ Reportes PDF/Excel (Fase 2)
- ❌ Chatbot IA (Fase avanzada, si sobra tiempo)
- ❌ Módulo Vacas (Arquitectura lista, no código)
- ❌ Módulo Peces (Ídem)
- ❌ App Móvil (Fase 3+)

---

## 🗂️ MODELO DE DATOS {#datos}

### Diagrama ER (Simplificado para MVP)

```
┌──────────────────────┐
│     usuarios         │
├──────────────────────┤
│ id (UUID)            │
│ email                │
│ password_hash        │
│ nombre               │
│ rol (admin/user)     │ ← Preparado para Fase 2
│ granja_id (UUID)     │ ← Listo para múltiples granjas
│ created_at           │
│ updated_at           │
└──────────────────────┘

┌──────────────────────┐
│     granjas          │ ← Tabla para escalabilidad
├──────────────────────┤
│ id (UUID)            │
│ nombre               │
│ ubicacion            │
│ propietario_id       │
│ created_at           │
└──────────────────────┘

┌─────────────────────────────────┐
│   registros_gallinas            │
├─────────────────────────────────┤
│ id (UUID)                       │
│ granja_id (UUID) → FK granjas   │
│ fecha (date)                    │
│ cantidad_gallinas (int)         │
│ huevos (int)                    │
│ muertes (int)                   │
│ alimento_kg (float)             │
│ notas (text)                    │
│ created_at                      │
│ updated_at                      │
│ created_by_user_id (UUID)       │
│                                 │
│ [ÍNDICES]                       │
│ - (granja_id, fecha) UNIQUE     │
│ - fecha DESC (queries rápidas)  │
└─────────────────────────────────┘

┌──────────────────────────────────────┐
│     registros_auditoria              │
├──────────────────────────────────────┤
│ id (UUID)                            │
│ registro_id (UUID)                   │
│ granja_id (UUID)                     │
│ accion (CREATE | UPDATE | DELETE)    │
│ datos_antes (JSONB)                  │
│ datos_despues (JSONB)                │
│ usuario_id (UUID)                    │
│ timestamp (timestamptz)              │
│                                      │
│ [TRIGGER AUTOMÁTICO EN registros_gl] │
└──────────────────────────────────────┘
```

### SQL Base (Supabase)

```sql
-- 1. Tabla Granjas (estructura para escalabilidad)
CREATE TABLE granjas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre VARCHAR(255) NOT NULL,
  ubicacion VARCHAR(500),
  propietario_id UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Tabla Usuarios (admin/operario/visor)
CREATE TABLE usuarios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  nombre VARCHAR(255) NOT NULL,
  rol VARCHAR(50) DEFAULT 'usuario', -- 'admin', 'usuario'
  granja_id UUID NOT NULL REFERENCES granjas(id) ON DELETE CASCADE,
  auth_user_id UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Tabla Registros Gallinas (CORE)
CREATE TABLE registros_gallinas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  granja_id UUID NOT NULL REFERENCES granjas(id) ON DELETE CASCADE,
  fecha DATE NOT NULL,
  cantidad_gallinas INTEGER NOT NULL CHECK (cantidad_gallinas > 0),
  huevos INTEGER NOT NULL CHECK (huevos >= 0),
  muertes INTEGER NOT NULL CHECK (muertes >= 0 AND muertes <= cantidad_gallinas),
  alimento_kg NUMERIC(10, 2) NOT NULL CHECK (alimento_kg >= 0),
  notas TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by_user_id UUID REFERENCES usuarios(id),
  
  -- Índices para performance
  CONSTRAINT unique_fecha_per_granja UNIQUE (granja_id, fecha)
);

CREATE INDEX idx_registros_fecha_desc ON registros_gallinas(granja_id, fecha DESC);
CREATE INDEX idx_registros_mes ON registros_gallinas(granja_id, DATE_TRUNC('month', fecha));

-- 4. Tabla Auditoría (trigger automático)
CREATE TABLE registros_auditoria (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  registro_id UUID REFERENCES registros_gallinas(id) ON DELETE SET NULL,
  granja_id UUID REFERENCES granjas(id),
  accion VARCHAR(20) NOT NULL, -- CREATE, UPDATE, DELETE
  datos_antes JSONB,
  datos_despues JSONB,
  usuario_id UUID REFERENCES usuarios(id),
  timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- Trigger para auditoría automática
CREATE OR REPLACE FUNCTION audit_registros_gallinas()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO registros_auditoria (
    registro_id, granja_id, accion, datos_antes, datos_despues, usuario_id
  ) VALUES (
    CASE WHEN TG_OP = 'DELETE' THEN NULL ELSE NEW.id END,
    COALESCE(NEW.granja_id, OLD.granja_id),
    TG_OP,
    CASE WHEN TG_OP = 'DELETE' THEN row_to_json(OLD) ELSE NULL END,
    CASE WHEN TG_OP IN ('INSERT', 'UPDATE') THEN row_to_json(NEW) ELSE NULL END,
    auth.uid()
  );
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trigger_audit_registros
AFTER INSERT OR UPDATE OR DELETE ON registros_gallinas
FOR EACH ROW EXECUTE FUNCTION audit_registros_gallinas();

-- 5. RLS (Row-Level Security) - Cada usuario ve solo su granja
ALTER TABLE registros_gallinas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can see their granja records"
  ON registros_gallinas FOR SELECT
  USING (granja_id IN (
    SELECT granja_id FROM usuarios WHERE auth_user_id = auth.uid()
  ));

CREATE POLICY "Users can insert to their granja"
  ON registros_gallinas FOR INSERT
  WITH CHECK (granja_id IN (
    SELECT granja_id FROM usuarios WHERE auth_user_id = auth.uid()
  ));

-- Similar para UPDATE y DELETE
```

---

## 🧮 LÓGICA DE NEGOCIO {#lógica}

### Cálculos Principales (implementar en Server Actions)

```typescript
// lib/calculations.ts

export async function calcularKPIsGranja(granjaId: string, fechaFin: Date = new Date()) {
  // Query 30 últimos días
  const registros = await supabase
    .from('registros_gallinas')
    .select('*')
    .eq('granja_id', granjaId)
    .gte('fecha', dias_atras(30))
    .order('fecha', { ascending: false });

  // Producción diaria (última entrada)
  const produccionDiaria = registros[0]?.huevos || 0;

  // Promedio semanal
  const ultimaSemana = registros.filter(r => dias_desde(r.fecha) <= 7);
  const promedio_semanal = ultimaSemana.length > 0 
    ? Math.round(ultimaSemana.reduce((sum, r) => sum + r.huevos, 0) / ultimaSemana.length)
    : 0;

  // Mortalidad semanal (%)
  const totalMuertes = ultimaSemana.reduce((sum, r) => sum + r.muertes, 0);
  const promGallinas = ultimaSemana.length > 0
    ? ultimaSemana.reduce((sum, r) => sum + r.cantidad_gallinas, 0) / ultimaSemana.length
    : 0;
  const mortalidad = promGallinas > 0 ? (totalMuertes / promGallinas * 100).toFixed(2) : "0.00";

  // Eficiencia alimento (huevos por kg)
  const totalAlimento = ultimaSemana.reduce((sum, r) => sum + r.alimento_kg, 0);
  const totalHuevos = ultimaSemana.reduce((sum, r) => sum + r.huevos, 0);
  const eficiencia = totalAlimento > 0 ? (totalHuevos / totalAlimento).toFixed(2) : "0.00";

  // Tendencia (mejora vs semana anterior)
  const semanaAnterior = registros.filter(r => 
    dias_desde(r.fecha) > 7 && dias_desde(r.fecha) <= 14
  );
  const promedio_semana_anterior = semanaAnterior.length > 0
    ? semanaAnterior.reduce((sum, r) => sum + r.huevos, 0) / semanaAnterior.length
    : 0;
  const tendencia = ((promedio_semanal - promedio_semana_anterior) / promedio_semana_anterior * 100).toFixed(1);

  // Alertas
  const alertas = [];
  if (mortalidad > 10) alertas.push({ tipo: 'ALTA_MORTALIDAD', valor: mortalidad });
  if (eficiencia < 8) alertas.push({ tipo: 'BAJA_EFICIENCIA', valor: eficiencia });

  return {
    produccionDiaria,
    promedio_semanal,
    mortalidad,
    eficiencia,
    tendencia,
    alertas,
    timestamps: {
      calculado_en: new Date(),
      rango_datos: `Últimos 30 días`
    }
  };
}
```

### Validaciones (Zod Schema)

```typescript
// lib/validations.ts
import { z } from 'zod';

export const registroGallinasSchema = z.object({
  fecha: z
    .date()
    .max(new Date(), "La fecha no puede ser futura")
    .refine(
      (date) => !isWeekend(date), // opcional: solo días de semana
      "La fecha debe ser día de semana"
    ),
  
  cantidad_gallinas: z
    .number()
    .int("Debe ser número entero")
    .min(1, "Mínimo 1 gallina")
    .max(10000, "Máximo 10000 gallinas"),
  
  huevos: z
    .number()
    .int("Debe ser número entero")
    .nonnegative("No puede haber huevos negativos"),
  
  muertes: z
    .number()
    .int("Debe ser número entero")
    .nonnegative("No puede haber muertes negativas"),
  
  alimento_kg: z
    .number()
    .positive("Alimento debe ser positivo")
    .max(1000, "Máximo 1000 kg/día"),
  
  notas: z.string().max(500, "Máximo 500 caracteres").optional(),
})
.refine(
  (data) => data.muertes <= data.cantidad_gallinas,
  {
    message: "Las muertes no pueden exceder cantidad de gallinas",
    path: ["muertes"],
  }
)
.refine(
  (data) => data.huevos <= data.cantidad_gallinas * 1.2, // máx 1.2 huevos por gallina (imposibilidad física)
  {
    message: "Huevos exceden capacidad física de gallinas",
    path: ["huevos"],
  }
);
```

---

## 🔌 ENDPOINTS / SERVER ACTIONS {#endpoints}

### Server Actions (Antigravity - `app/actions.ts` o similar)

```typescript
'use server'

import { supabase } from '@/lib/supabase';
import { registroGallinasSchema } from '@/lib/validations';
import { calcularKPIsGranja } from '@/lib/calculations';
import { revalidatePath } from 'next/cache';

// 1. CREAR REGISTRO
export async function crearRegistro(data: unknown) {
  try {
    const validado = registroGallinasSchema.parse(data);
    
    const { data: user } = await supabase.auth.getUser();
    if (!user) throw new Error("No autenticado");

    // Obtener granja del usuario
    const { data: usuario } = await supabase
      .from('usuarios')
      .select('granja_id')
      .eq('auth_user_id', user.id)
      .single();

    if (!usuario) throw new Error("Usuario sin granja asignada");

    // Insertar registro
    const { data: registro, error } = await supabase
      .from('registros_gallinas')
      .insert({
        ...validado,
        granja_id: usuario.granja_id,
        created_by_user_id: usuario.id,
      })
      .select()
      .single();

    if (error) throw error;

    // Recalcular KPIs para dashboard
    await revalidatePath('/dashboard');
    
    return { success: true, registro };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// 2. OBTENER REGISTROS (tabla + dashboard)
export async function obtenerRegistros(
  filtros?: { 
    fecha_inicio?: Date; 
    fecha_fin?: Date;
    limit?: number;
    offset?: number;
  }
) {
  try {
    const { data: user } = await supabase.auth.getUser();
    if (!user) throw new Error("No autenticado");

    const { data: usuario } = await supabase
      .from('usuarios')
      .select('granja_id')
      .eq('auth_user_id', user.id)
      .single();

    let query = supabase
      .from('registros_gallinas')
      .select('*')
      .eq('granja_id', usuario.granja_id)
      .order('fecha', { ascending: false });

    if (filtros?.fecha_inicio) {
      query = query.gte('fecha', filtros.fecha_inicio);
    }
    if (filtros?.fecha_fin) {
      query = query.lte('fecha', filtros.fecha_fin);
    }

    const { data, error, count } = await query
      .limit(filtros?.limit || 100)
      .range(filtros?.offset || 0, (filtros?.offset || 0) + (filtros?.limit || 100) - 1);

    if (error) throw error;

    return { success: true, data, count };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// 3. OBTENER KPIs DASHBOARD
export async function obtenerDashboardKPIs() {
  try {
    const { data: user } = await supabase.auth.getUser();
    if (!user) throw new Error("No autenticado");

    const { data: usuario } = await supabase
      .from('usuarios')
      .select('granja_id')
      .eq('auth_user_id', user.id)
      .single();

    const kpis = await calcularKPIsGranja(usuario.granja_id);
    
    return { success: true, kpis };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// 4. EDITAR REGISTRO
export async function editarRegistro(id: string, data: unknown) {
  try {
    const validado = registroGallinasSchema.parse(data);
    
    const { data: user } = await supabase.auth.getUser();
    if (!user) throw new Error("No autenticado");

    // Verificar pertenencia
    const { data: registro } = await supabase
      .from('registros_gallinas')
      .select('granja_id')
      .eq('id', id)
      .single();

    const { data: usuario } = await supabase
      .from('usuarios')
      .select('granja_id')
      .eq('auth_user_id', user.id)
      .single();

    if (registro.granja_id !== usuario.granja_id) {
      throw new Error("No tienes permisos");
    }

    const { data: actualizado, error } = await supabase
      .from('registros_gallinas')
      .update(validado)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    await revalidatePath('/dashboard');
    await revalidatePath('/registros');

    return { success: true, registro: actualizado };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// 5. ELIMINAR REGISTRO (soft delete)
export async function eliminarRegistro(id: string) {
  try {
    const { data: user } = await supabase.auth.getUser();
    if (!user) throw new Error("No autenticado");

    // Verificar pertenencia
    const { data: registro } = await supabase
      .from('registros_gallinas')
      .select('granja_id')
      .eq('id', id)
      .single();

    const { data: usuario } = await supabase
      .from('usuarios')
      .select('granja_id')
      .eq('auth_user_id', user.id)
      .single();

    if (registro.granja_id !== usuario.granja_id) {
      throw new Error("No tienes permisos");
    }

    const { error } = await supabase
      .from('registros_gallinas')
      .delete()
      .eq('id', id);

    if (error) throw error;

    await revalidatePath('/dashboard');
    await revalidatePath('/registros');

    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// 6. OBTENER DATOS PARA GRÁFICAS (últimos 30 días)
export async function obtenerDatosGraficas() {
  try {
    const { data: user } = await supabase.auth.getUser();
    if (!user) throw new Error("No autenticado");

    const { data: usuario } = await supabase
      .from('usuarios')
      .select('granja_id')
      .eq('auth_user_id', user.id)
      .single();

    const hace30dias = new Date();
    hace30dias.setDate(hace30dias.getDate() - 30);

    const { data: registros } = await supabase
      .from('registros_gallinas')
      .select('fecha, huevos, alimento_kg, muertes, cantidad_gallinas')
      .eq('granja_id', usuario.granja_id)
      .gte('fecha', hace30dias)
      .order('fecha', { ascending: true });

    // Transformar a formato para Recharts
    const grafica_linea = registros.map(r => ({
      fecha: formatDate(r.fecha),
      huevos: r.huevos,
      fecha_raw: r.fecha,
    }));

    // Agrupar por semana
    const por_semana = agruparPorSemana(registros);

    return { 
      success: true, 
      grafica_linea,
      grafica_semana: por_semana,
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
}
```

---

## 🚀 FASES DE DESARROLLO {#fases}

### 📅 Estimación Total: 8-12 semanas (MVP equilibrado)

### 🔥 FASE 0: Configuración & Scaffolding (1 semana)
**Responsable:** Solo tú
**Tareas:**
- [ ] Crear proyecto Antigravity en Vercel
- [ ] Configurar Supabase project + variables `.env`
- [ ] Setup Tailwind + ShadcN/UI con tema Petrocasinos
- [ ] Crear estructura carpetas (`app/`, `components/`, `lib/`, `actions/`)
- [ ] Setup Drizzle ORM (opcional pero recomendado)
- [ ] Crear DB schema en Supabase (SQL que proporcioné)
- [ ] Setup autenticación básica (Supabase Auth)

**Deliverables:**
- Project bootstrapped
- Base de datos lista
- Login funciona (Supabase Auth)

---

### 🔥 FASE 1: Core CRUD + Autenticación (2-3 semanas)
**Responsable:** Solo tú
**Tareas:**
- [ ] Página Login/Signup (ShadcN form)
- [ ] Middleware de autenticación (proteger rutas)
- [ ] Crear tabla `registros_gallinas` ✅
- [ ] Server Action: crear registro
- [ ] Server Action: obtener registros (lista)
- [ ] Server Action: editar registro
- [ ] Server Action: eliminar registro
- [ ] Formulario "Nuevo Registro" con Zod validations
- [ ] Tabla datos con paginación (ShadcN DataTable)
- [ ] Filtro por rango fechas

**Deliverables:**
- MVP CRUD funcional
- Auth completa
- Usuarios pueden registrar datos

**Tests:**
- Validaciones Zod (números negativos, fechas futuras)
- CRUD básico

---

### 🔥 FASE 2: Dashboard & Cálculos (2-3 semanas)
**Responsable:** Solo tú
**Tareas:**
- [ ] Implementar `calcularKPIsGranja()` (lógica cálculos)
- [ ] Server Action: `obtenerDashboardKPIs()`
- [ ] Server Action: `obtenerDatosGraficas()`
- [ ] Componentes ShadcN Card para KPIs
- [ ] Gráficas Recharts:
  - [ ] Line: Huevos diarios (30 días)
  - [ ] Bar: Huevos por semana (8 semanas)
  - [ ] Area: Producción acumulada
  - [ ] Gauge: Mortalidad %
- [ ] Auto-refresh cada 1 min (revalidatePath)
- [ ] Layout dashboard responsivo

**Deliverables:**
- Dashboard completo con gráficas
- Cálculos automáticos
- KPIs en tiempo real (1 min refresh)

**Tests:**
- Cálculos de totales
- Verificación de fórmulas

---

### 🔥 FASE 3: Validaciones Robustas & Auditoría (1-2 semanas)
**Responsable:** Solo tú
**Tareas:**
- [ ] Mejorar Zod schema (validaciones complejas)
- [ ] Alertas en dashboard (mortalidad > 10%, etc)
- [ ] Tabla `registros_auditoria` + trigger
- [ ] Panel auditoría (admin only) - ver cambios
- [ ] UI: toast notificaciones para errores
- [ ] Validar duplicados (no 2 registros mismo día)
- [ ] Tests de validaciones

**Deliverables:**
- Sistema robusto sin inconsistencias
- Historial de cambios completo

---

### 🔥 FASE 4: Pulido UI/UX & Performance (1 semana)
**Responsable:** Solo tú
**Tareas:**
- [ ] Dark mode (soporte opcional)
- [ ] Mobile responsive (Tailwind)
- [ ] Optimización gráficas (loading states)
- [ ] Mejora tablas (columnas customizables)
- [ ] Exportar a CSV simple
- [ ] Búsqueda y filtros avanzados
- [ ] Favicon, metadata

**Deliverables:**
- UI pulida
- Performance optimizado
- Listo para producción

---

### 🔥 FASE 5: Despliegue & Documentación (1 semana)
**Responsable:** Solo tú
**Tareas:**
- [ ] Setup environment variables (Vercel secrets)
- [ ] Deploy Vercel (staging + production)
- [ ] Setup Supabase backups automáticos
- [ ] README.md con instrucciones
- [ ] Documentación de schema DB
- [ ] Testing e2e básico

**Deliverables:**
- App en producción (vercel)
- Documentación completa

---

### 📈 FASE 6: Extras & Mejoras (solo si sobra tiempo)
- [ ] Reportes PDF (si tiempo permite)
- [ ] Notificaciones email (alertas mortalidad)
- [ ] Tema oscuro refinado
- [ ] Buscar registros por rango avanzado
- [ ] Inicio: múltiples granjas (arquitectura lista)

---

## 🔮 NOTAS DE ESCALABILIDAD {#escalabilidad}

### Cómo Escalar a Múltiples Granjas (Fase 2+)

**Ya está previsto en esta arquitectura:**

```sql
-- 1. Tabla granjas existe
-- 2. registros_gallinas tiene granja_id (FK)
-- 3. usuarios tienen granja_id
-- 4. RLS protege datos (cada usuario ve su granja)
```

**Para activar en Fase 2:**
- [ ] UI selector de granja (si usuario tiene múltiples)
- [ ] Admin panel: crear/editar granjas
- [ ] Invitar usuarios a granja por email
- [ ] Dashboard: comparar métricas entre granjas
- [ ] Roles: Admin (todo), Operario (registrar), Visor (solo ver)

**Sin cambios en database, solo en app logic.**

---

### Cómo Escalar a Otros Módulos (Vacas, Peces)

**Arquitectura preparada:**

```
Patrón: Tabla por tipo de animal
registros_gallinas → registros_vacas → registros_peces

Cada tabla tendrá:
- granja_id (FK)
- fecha (unique per day per granja)
- campos específicos del animal
- trigger auditoria automático

Dashboard genérico:
- Selector de módulo (gallinas/vacas/peces)
- Gráficas dinámicas por tipo
```

**Implementación Fase 2+:**
- Copiar schema `registros_gallinas` para `registros_vacas`
- Adaptar campos (ej: litros de leche, % grasa, etc)
- Reutilizar Server Actions genéricas
- Gráficas dinámicas por tipo

---

## 🧠 PRINCIPIOS CLAVE {#principios}

### 1. **Data-Driven**
- Todos los gráficos y alertas vienen de cálculos reales
- No estimaciones, no supuestos
- Histórico completo (auditoría)

### 2. **Separación de Responsabilidades**
```
┌─ Datos ingresados (usuario)
├─ Datos almacenados (BD)
├─ Datos calculados (server actions)
└─ Datos presentados (frontend)
```
Cada capa es independiente.

### 3. **Escalabilidad desde Día 1**
- Arquitectura modular (tabla por tipo animal)
- Multi-granja (granja_id en toda estructura)
- Roles preparados (admin/operario/visor)
- Sin refactor necesario para Fase 2+

### 4. **Seguridad**
- JWT (Supabase Auth)
- RLS en PostgreSQL (solo ves tu granja)
- Server actions autenticadas
- Auditoría automática

### 5. **Performance**
- Índices en campos críticos (fecha, granja_id)
- Paginación en tablas
- Caché + revalidatePath (Antigravity)
- Gráficas con límite 30-60 días

### 6. **UX Simple pero Completa**
- Dashboard es el hero (máxima info en mínimo click)
- Formularios intuitivos (Zod + toasts)
- Mobile-first responsive
- Dark mode opcional

---

## 📋 CHECKLIST FINAL PRE-DESARROLLO

Antes de comenzar, verifica:

- [ ] Tienes cuenta Vercel + repo GitHub
- [ ] Tienes cuenta Supabase (plan gratuito es suficiente)
- [ ] Clonaste el repo de Antigravity
- [ ] Variables `.env` configuradas localmente
- [ ] Tailwind + ShadcN/UI funcionan
- [ ] Supabase Auth habilitado
- [ ] Schema SQL creado en Supabase
- [ ] Entiendes Zod para validaciones
- [ ] Entiendes Server Actions de Antigravity

---

## 📞 Preguntas Finales Antes de Comenzar

1. **¿Cuál es el dato "crítico" más importante?**
   - Producción diaria (huevos)
   - Mortalidad (salud del lote)
   - Ambos equal

2. **¿Necesitas mobile-responsive desde MVP o es opcional?**
   - Crítico (muchos registros en campo)
   - Nice to have (registrar en escritorio)

3. **¿Existen datos históricos que migrar de otro sistema?**
   - No, empieza desde cero
   - Sí, tengo CSV/Excel

4. **¿Qué tan crítico es el backup automático?**
   - Supabase default (1 daily) es suficiente
   - Necesito más (hourly)

---

## 🎯 Próximos Pasos

1. ✅ Responde las 4 preguntas finales
2. ✅ Confirma que el plan tiene sentido
3. ✅ Comienza FASE 0 (scaffolding)
4. ✅ Yo ayudo con code cuando lo necesites

---

**Versión:** 2.0 Optimizado  
**Última actualización:** Mayo 2026  
**Estado:** Listo para Desarrollo
