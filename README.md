# 🐔 GanadoApp

**Sistema de gestión productiva pecuaria para Petrocasinos** — plataforma web centralizada para el registro diario, control de inventario y análisis de producción de los módulos avícolas, bovinos y acuícolas de la granja.

> Desarrollado con **Next.js 16**, **Supabase** y desplegado en **Vercel**.

---

## ✨ Características Principales

### 🐔 Módulo Gallinas *(completamente operativo)*
- **Gestión de lotes**: Crear, activar/finalizar y eliminar lotes de aves ponedoras
- **Registros diarios**: Un registro por día por lote que captura:
  - Cantidad de gallinas vivas
  - Huevos producidos
  - Muertes del día
  - Bultos de alimento gastados
  - Bultos de alimento ingresados (compras/entradas)
  - Notas y observaciones
- **Control de inventario de alimento**: Stock calculado automáticamente como `Σ(ingresados) − Σ(gastados)` visible en tiempo real
- **Edición y eliminación** de registros con confirmación interna (sin ventanas del sistema)
- **Auditoría automática** vía trigger PostgreSQL — cada inserción, edición o borrado queda registrado

### 📊 Dashboard Analítico
- **KPIs semanales** calculados automáticamente:
  - Producción diaria (último registro)
  - Promedio semanal de huevos
  - Tasa de mortalidad (%)
  - Eficiencia de alimento (huevos por bulto)
  - Tendencia vs semana anterior (↑ / ↓)
  - Consumo semanal de bultos
- **Selector de lote activo** para filtrar estadísticas por lote
- **4 gráficas interactivas**:
  - 🌾 **Consumo de Alimento** — dos líneas: Stock acumulado vs. Gastado diario (últimos 30 días)
  - 📅 **Producción por Semana** — barras de las últimas 8 semanas
  - 📈 **Producción Acumulada del Mes** — área acumulada
  - 💀 **Mortalidad Diaria (%)** — línea de tendencia
- **Widget de Inventario** siempre visible mostrando bultos en stock actuales

### 🐄 Módulo Vacas *(base lista, en expansión)*
- Gestión de ganado bovino por lote

### 🐟 Módulo Peces *(base lista, en expansión)*
- Control de producción acuícola por estanque

---

## 🛠️ Stack Tecnológico

| Capa | Tecnología | Versión |
|---|---|---|
| Framework | Next.js | 16.2 |
| UI Library | React | 19 |
| Lenguaje | TypeScript | 5 |
| Estilos | TailwindCSS | 4 |
| Componentes | shadcn/ui + @base-ui/react | Latest |
| Gráficas | Recharts | 3.8 |
| Iconos | Lucide React | 1.16 |
| Fechas | date-fns | 4.3 |
| Validación | Zod | 4.4 |
| Base de datos | Supabase (PostgreSQL) | Latest |
| Auth | Supabase Auth | Latest |
| Deploy | Vercel | — |

---

## 🗂️ Estructura del Proyecto

```
GanadoApp/
├── src/
│   ├── actions/               # Server Actions (lógica de negocio)
│   │   ├── lotes.ts           # CRUD de lotes
│   │   └── registros.ts       # CRUD de registros diarios + dashboard
│   ├── app/
│   │   ├── (main)/            # Rutas protegidas (requieren auth)
│   │   │   ├── dashboard/     # Dashboard con KPIs y gráficas
│   │   │   ├── lotes/         # Módulo gallinas - lotes y registros
│   │   │   ├── vacas/         # Módulo vacas (base)
│   │   │   └── peces/         # Módulo peces (base)
│   │   └── login/             # Página de autenticación
│   ├── components/
│   │   ├── layout/Sidebar.tsx # Navegación lateral colapsable
│   │   └── ui/                # Componentes reutilizables (Button, Dialog, Select…)
│   └── lib/
│       ├── calculations.ts    # Cálculo de KPIs y datos para gráficas
│       ├── validations.ts     # Esquemas Zod
│       └── supabase.ts        # Clientes Supabase (browser + admin)
├── supabase/
│   ├── schema.sql             # Schema completo con RLS y triggers de auditoría
│   └── schema_lotes.sql       # Schema de tabla lotes
└── docs/                      # Documentación arquitectónica y planes
```

---

## 🗄️ Base de Datos

```
granjas          → propietario (auth.users)
  └── usuarios   → miembros de la granja
  └── lotes      → lotes de producción (gallinas, etc.)
        └── registros_gallinas → registros diarios
              └── registros_auditoria → historial de cambios
```

**Seguridad:**
- Row Level Security (RLS) habilitado en todas las tablas
- Cada usuario solo ve y modifica los datos de su propia granja
- Trigger PostgreSQL captura automáticamente INSERT / UPDATE / DELETE en auditoría

---

## 🚀 Instalación Local

### Prerrequisitos
- Node.js 18+
- Cuenta en [Supabase](https://supabase.com)

### 1. Clonar el repositorio

```bash
git clone https://github.com/auxiliarsistemas-petrocasinos/GanadoApp.git
cd GanadoApp
npm install
```

### 2. Variables de entorno

Crea un archivo `.env.local` en la raíz con:

```env
NEXT_PUBLIC_SUPABASE_URL=tu_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_anon_key
SUPABASE_SERVICE_ROLE_KEY=tu_service_role_key
```

> Puedes encontrar estos valores en tu proyecto de Supabase en **Settings → API**.

### 3. Configurar la base de datos

Ejecuta los scripts de Supabase en el editor SQL de tu proyecto:

```bash
# Primero el schema de lotes
supabase/schema_lotes.sql

# Luego el schema principal (registros, auditoría, RLS)
supabase/schema.sql
```

### 4. Crear el primer usuario

```bash
node scratch/setup-user.js
```

Este script crea la granja inicial y el perfil de administrador para el primer usuario registrado en Supabase Auth.

### 5. Ejecutar en desarrollo

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

---

## ☁️ Deploy en Vercel

1. Conecta el repositorio GitHub en [vercel.com/new](https://vercel.com/new)
2. En **Environment Variables** agrega las 3 variables del paso anterior
3. Framework preset: **Next.js** (se detecta automático)
4. Haz clic en **Deploy**

El deploy se actualiza automáticamente con cada `git push` a `main`.

---

## 📐 Arquitectura

```
   [Browser — Next.js App]
          │  React Server Components
          │  + Client Components
          ▼
   [Server Actions]          ←  lógica de negocio (lotes.ts, registros.ts)
          │
          ▼
   [Supabase — PostgreSQL]   ←  datos, auth, RLS, triggers de auditoría
          │
          ▼
   [Vercel Edge Network]     ←  distribución global
```

La lógica de KPIs y gráficas corre en el servidor (`calculations.ts`) y se inyecta al dashboard mediante Server Actions, evitando exponer cálculos sensibles al cliente.

---

## 🗺️ Roadmap

- [ ] Completar módulo Vacas con registros y KPIs
- [ ] Completar módulo Peces con registros y KPIs
- [ ] Autenticación multi-usuario con roles (admin / operario)
- [ ] Exportación de reportes a PDF / Excel
- [ ] Alertas automáticas por mortalidad o stock bajo
- [ ] Progressive Web App (PWA) para uso en campo sin internet
- [ ] Chatbot integrado para consultar datos por lenguaje natural

---

## 📄 Licencia

Uso interno — Petrocasinos. Todos los derechos reservados.
