# ⚙️ FASE 0: SCAFFOLDING & SETUP
## Checklist Técnico + Comandos para GanadoApp

**Duración Estimada:** 3-5 días de trabajo  
**Objetivo:** Proyecto bootstrapped + BD + Auth funcionando

---

## 📋 PREREQUISITOS (Antes de empezar)

### Cuentas Necesarias
- [ ] **Vercel:** https://vercel.com (conectado a GitHub)
- [ ] **Supabase:** https://supabase.com (proyecto creado)
- [ ] **GitHub:** Repositorio privado/público

### Software Local
```bash
# Verifica que tengas instalado
node --version      # v18+ recomendado
npm --version       # v8+
git --version       # cualquier versión

# Si no tienes Node, descargalo de nodejs.org
```

---

## 🚀 PASO 1: Crear Proyecto Antigravity (Vercel)

### Opción A: Desde CLI (Recomendado)
```bash
# 1. Clonar template Antigravity
npx create-next-app@latest ganadoapp \
  --typescript \
  --tailwind \
  --eslint \
  --src-dir \
  --app \
  --no-git

cd ganadoapp

# 2. Inicializar git
git init
git add .
git commit -m "Initial commit: Antigravity template"

# 3. Crear repo en GitHub (desde web)
# Ir a github.com → New Repository → ganadoapp
# Copiar HTTPS URL

# 4. Conectar repo local a GitHub
git remote add origin https://github.com/TU_USUARIO/ganadoapp.git
git branch -M main
git push -u origin main

# 5. Conectar Vercel
# Opción 1 (automático): Vercel detecta repo automáticamente
#   → Ir a vercel.com/new
#   → Seleccionar repo ganadoapp
#   → Deploy

# Opción 2 (CLI):
npm i -g vercel
vercel --prod
```

### Opción B: Dashboard Vercel (GUI)
1. Ir a https://vercel.com/new
2. Conectar GitHub
3. Seleccionar repo `ganadoapp`
4. Framework: Next.js (auto-detectado)
5. Deploy

**Resultado esperado:**
- ✅ App en `https://ganadoapp.vercel.app`
- ✅ Repo linkedeado
- ✅ Despliegue automático en cada push

---

## 🗄️ PASO 2: Configurar Supabase (PostgreSQL + Auth)

### 2.1 Crear Proyecto
1. Ir a https://supabase.com
2. Click "New Project"
3. Configurar:
   - **Project Name:** `ganadoapp-prod`
   - **Database Password:** Genera segura (guarda en LastPass o similar)
   - **Region:** `South America (São Paulo)` (cercano a Colombia)
4. Esperar 2-3 minutos (setup BD)

### 2.2 Obtener Credenciales
En Supabase → Project Settings → API:
```
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIs...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIs... (SECRETO)
```

Guarda estos valores → Los necesitarás en Paso 4.

### 2.3 Habilitar Auth
En Supabase → Authentication:
1. Ir a "Providers"
2. Email/Password: Ya está habilitado ✅
3. Ir a "Settings" → Email Templates:
   - Verify email: Personalizar si necesario (opcional)
   - Reset password: Personalizar si necesario (opcional)

---

## 🎨 PASO 3: Configurar Tailwind + ShadcN/UI + Tema

### 3.1 Instalar ShadcN/UI

```bash
# Desde raíz del proyecto
npx shadcn-ui@latest init

# Cuando pregunta:
# "Would you like to use TypeScript?" → yes
# "Which style would you like to use?" → Default
# "Which color would you like as the base color?" → Slate
# "Where is your global CSS file?" → src/app/globals.css
```

### 3.2 Usar tu Tema Petrocasinos

**Reemplazar `src/app/globals.css` con tu archivo:**

```bash
# Copiar tu archivo CSS
cp /ruta/a/tu/index.css src/app/globals.css
```

**Asegurar que tiene:**
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
    :root {
        --primary: 215 28% 27%;      /* #324158 */
        --secondary: 20 100% 57%;    /* #FF6A23 */
        /* ... resto de variables */
    }
}
```

### 3.3 Actualizar `tailwind.config.ts`

Usar tu `tailwind_config.cjs` como referencia:

```typescript
// tailwind.config.ts
import type { Config } from "tailwindcss"

const config = {
  darkMode: ["class"],
  content: [
    './src/pages/**/*.{ts,tsx}',
    './src/components/**/*.{ts,tsx}',
    './src/app/**/*.{ts,tsx}',
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "#324158",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "#FF6A23",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config

export default config
```

**Test tema:**
```bash
npm run dev
# Abre http://localhost:3000
# Verifica que colores sean azul marino + naranja
```

---

## 🔐 PASO 4: Conectar Supabase a Vercel (Env Variables)

### 4.1 Crear `.env.local` (Development)

En raíz de tu proyecto (`ganadoapp/.env.local`):

```env
# Supabase (obtuviste en Paso 2.2)
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIs...

# Service role (secreto, solo server-side)
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIs...
```

**⚠️ IMPORTANTE:**
- `NEXT_PUBLIC_*` = seguro exponer (anon key)
- `SUPABASE_SERVICE_ROLE_KEY` = SECRETO (nunca en frontend)
- NO commitar `.env.local` a git

### 4.2 Crear `.env.local.example` (para referencia)

```env
# .env.local.example
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIs...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIs...
```

Agregar a `.gitignore`:
```bash
echo ".env.local" >> .gitignore
git add .gitignore
git commit -m "Add env to gitignore"
```

### 4.3 Configurar Variables en Vercel

En Vercel Dashboard → Projeto → Settings → Environment Variables:

1. Agregar: `NEXT_PUBLIC_SUPABASE_URL` = `https://xxxxx.supabase.co`
2. Agregar: `NEXT_PUBLIC_SUPABASE_ANON_KEY` = `eyJ...`
3. Agregar: `SUPABASE_SERVICE_ROLE_KEY` = `eyJ...` (SECRETO)

**Asegurar:** Visible en Preview + Production ✅

---

## 📦 PASO 5: Instalar Librerías Clave

```bash
# Supabase JS Client
npm install @supabase/supabase-js

# Validaciones (Zod)
npm install zod

# Gráficas (para Fase 2, pero instalar ahora)
npm install recharts

# Utilidades
npm install date-fns clsx class-variance-authority

# Desarrollo
npm install -D tailwindcss-animate
```

**Verificar instalación:**
```bash
npm ls @supabase/supabase-js
npm ls zod
npm ls recharts
```

---

## 🗂️ PASO 6: Estructura de Carpetas

Crear estructura recomendada:

```bash
mkdir -p src/{components,app,lib,actions,hooks,utils}

# Crear archivos base
touch src/lib/supabase.ts
touch src/lib/validations.ts
touch src/lib/calculations.ts
touch src/app/actions.ts
touch src/middleware.ts
```

**Resultado:**
```
ganadoapp/
├── src/
│   ├── app/
│   │   ├── page.tsx           # Home
│   │   ├── login/
│   │   │   └── page.tsx       # Login page
│   │   ├── dashboard/
│   │   │   └── page.tsx       # Dashboard
│   │   ├── registros/
│   │   │   └── page.tsx       # Tabla registros
│   │   ├── settings/
│   │   │   └── page.tsx       # Perfil usuario
│   │   ├── layout.tsx         # Root layout
│   │   └── actions.ts         # Server actions
│   ├── components/
│   │   ├── ui/                # ShadcN components
│   │   ├── forms/             # Custom forms
│   │   ├── dashboard/         # Dashboard components
│   │   └── layout/            # Layout components
│   ├── lib/
│   │   ├── supabase.ts        # Supabase client
│   │   ├── validations.ts     # Zod schemas
│   │   ├── calculations.ts    # Lógica de negocio
│   │   └── utils.ts           # Utilidades
│   ├── hooks/
│   │   └── useAuth.ts         # Custom hook auth
│   ├── middleware.ts          # Auth middleware
│   └── globals.css            # Tailwind + tema
├── .env.local                 # Variables locales (gitignore)
├── .env.local.example         # Referencia
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

---

## 🔑 PASO 7: Cliente Supabase (Configuración)

### 7.1 Crear `src/lib/supabase.ts`

```typescript
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Para server-side (admin actions)
export const supabaseAdmin = createClient(
  supabaseUrl,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)
```

### 7.2 Test Conexión

En `src/app/page.tsx`:

```typescript
'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function Home() {
  const [connected, setConnected] = useState(false)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setConnected(session !== null)
    })
  }, [])

  return (
    <div className="p-8">
      <h1>GanadoApp</h1>
      <p>
        Conexión Supabase: 
        <span className={connected ? 'text-green-600' : 'text-red-600'}>
          {connected ? ' ✅ Connected' : ' ❌ Disconnected'}
        </span>
      </p>
    </div>
  )
}
```

```bash
npm run dev
# Abre http://localhost:3000
# Deberías ver: "Conexión Supabase: ✅ Connected"
```

---

## 🛢️ PASO 8: Crear Schema SQL en Supabase

### 8.1 Ir a SQL Editor en Supabase

Dashboard → SQL Editor → New Query

### 8.2 Copiar y ejecutar este SQL

```sql
-- ============================================
-- GANADOAPP DATABASE SCHEMA
-- ============================================

-- 1. Tabla Granjas (multi-granja en Fase 2)
CREATE TABLE granjas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre VARCHAR(255) NOT NULL,
  ubicacion VARCHAR(500),
  propietario_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Tabla Usuarios
CREATE TABLE usuarios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  nombre VARCHAR(255) NOT NULL,
  rol VARCHAR(50) DEFAULT 'usuario',
  granja_id UUID NOT NULL REFERENCES granjas(id) ON DELETE CASCADE,
  auth_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Tabla Registros Gallinas (CORE)
CREATE TABLE registros_gallinas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  granja_id UUID NOT NULL REFERENCES granjas(id) ON DELETE CASCADE,
  fecha DATE NOT NULL,
  cantidad_gallinas INTEGER NOT NULL CHECK (cantidad_gallinas > 0),
  huevos INTEGER NOT NULL CHECK (huevos >= 0),
  muertes INTEGER NOT NULL CHECK (muertes >= 0),
  alimento_kg NUMERIC(10, 2) NOT NULL CHECK (alimento_kg >= 0),
  notas TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by_user_id UUID REFERENCES usuarios(id),
  
  CONSTRAINT unique_fecha_per_granja UNIQUE (granja_id, fecha),
  CONSTRAINT muertes_check CHECK (muertes <= cantidad_gallinas)
);

-- Índices
CREATE INDEX idx_registros_gallinas_granja_fecha 
  ON registros_gallinas(granja_id, fecha DESC);
CREATE INDEX idx_registros_gallinas_mes 
  ON registros_gallinas(granja_id, DATE_TRUNC('month', fecha));

-- 4. Tabla Auditoría
CREATE TABLE registros_auditoria (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  registro_id UUID REFERENCES registros_gallinas(id) ON DELETE SET NULL,
  granja_id UUID REFERENCES granjas(id),
  accion VARCHAR(20) NOT NULL,
  datos_antes JSONB,
  datos_despues JSONB,
  usuario_id UUID REFERENCES usuarios(id),
  timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- Función Trigger para auditoría
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
    (SELECT id FROM usuarios WHERE auth_user_id = auth.uid() LIMIT 1)
  );
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger
CREATE TRIGGER trigger_audit_registros_gallinas
AFTER INSERT OR UPDATE OR DELETE ON registros_gallinas
FOR EACH ROW EXECUTE FUNCTION audit_registros_gallinas();

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Habilitar RLS
ALTER TABLE registros_gallinas ENABLE ROW LEVEL SECURITY;
ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE granjas ENABLE ROW LEVEL SECURITY;

-- Policy: Usuarios ven solo sus registros
CREATE POLICY "Users see their granja records"
  ON registros_gallinas FOR SELECT
  USING (granja_id IN (
    SELECT granja_id FROM usuarios WHERE auth_user_id = auth.uid()
  ));

CREATE POLICY "Users insert to their granja"
  ON registros_gallinas FOR INSERT
  WITH CHECK (granja_id IN (
    SELECT granja_id FROM usuarios WHERE auth_user_id = auth.uid()
  ));

CREATE POLICY "Users update their granja records"
  ON registros_gallinas FOR UPDATE
  USING (granja_id IN (
    SELECT granja_id FROM usuarios WHERE auth_user_id = auth.uid()
  ));

CREATE POLICY "Users delete their granja records"
  ON registros_gallinas FOR DELETE
  USING (granja_id IN (
    SELECT granja_id FROM usuarios WHERE auth_user_id = auth.uid()
  ));

-- Policy: Usuarios ven su perfil
CREATE POLICY "Users see their profile"
  ON usuarios FOR SELECT
  USING (auth_user_id = auth.uid());

-- Policy: Granjas visibles para propietario
CREATE POLICY "Users see their granjas"
  ON granjas FOR SELECT
  USING (propietario_id = auth.uid());

COMMIT;
```

**Resultado esperado:**
```
✅ 4 tables created
✅ 3 indexes created
✅ 1 trigger created
✅ 7 policies created
```

---

## 👤 PASO 9: Testing Auth Básico

### 9.1 Crear Página Login Temporal

Crear `src/app/login/page.tsx`:

```typescript
'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        setError(error.message)
        return
      }

      // Login exitoso → ir a dashboard
      router.push('/dashboard')
    } catch (err) {
      setError(String(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <form onSubmit={handleLogin} className="w-full max-w-md p-8 border rounded-lg">
        <h1 className="text-2xl font-bold mb-6">GanadoApp Login</h1>

        {error && (
          <div className="bg-destructive/10 border border-destructive text-destructive p-3 rounded mb-4">
            {error}
          </div>
        )}

        <div className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-2 border rounded"
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-2 border rounded"
            required
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full p-2 bg-primary text-primary-foreground rounded hover:bg-primary/90 disabled:opacity-50"
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </div>
      </form>
    </div>
  )
}
```

### 9.2 Crear Usuario Test en Supabase

En Supabase → Authentication → Users:
1. Click "Add user"
2. Email: `test@example.com`
3. Password: `Test123456!` (segura)
4. Click "Create user"

### 9.3 Test Login

```bash
npm run dev
# Abre http://localhost:3000/login
# Ingresa: test@example.com / Test123456!
# Deberías ir a /dashboard
```

---

## ✅ PASO 10: Checklist Final Fase 0

- [ ] Proyecto Antigravity en Vercel
- [ ] Repo GitHub linkedeado
- [ ] Supabase proyecto creado
- [ ] Variables `.env.local` configuradas
- [ ] Vercel env variables seteadas
- [ ] Tailwind + ShadcN/UI + Tema funcionando
- [ ] Estructura de carpetas creada
- [ ] Cliente Supabase configurado
- [ ] Schema SQL ejecutado
- [ ] Usuario test creado
- [ ] Login page funciona
- [ ] Deoploy en Vercel sin errores

---

## 🚨 Troubleshooting Fase 0

### Error: "Cannot find module '@supabase/supabase-js'"
```bash
npm install @supabase/supabase-js
npm run dev
```

### Error: "NEXT_PUBLIC_SUPABASE_URL is not defined"
```bash
# Verificar .env.local existe
cat .env.local

# Si no:
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
```

### Error: "Supabase project not responding"
- Ir a Supabase dashboard
- Verificar que proyecto está "Active" (verde)
- Esperar 2-3 minutos (a veces tarda)

### Error: "RLS policy violation"
- Ir a Supabase → Authentication → Habilitado Email/Password
- SQL: Ejecutar policies nuevamente

---

## 📝 Notas para Fase 1

Una vez Fase 0 completa:
1. Crear page layout (navbar, sidebar)
2. Implementar Server Actions básicas
3. Crear formulario registros con Zod
4. Tabla histórica con paginación
5. Middleware autenticación

---

## 🆘 ¿Problemas?

Si algo no funciona:

1. **Revisar console:**
   ```bash
   npm run dev
   # Ver errores en terminal
   ```

2. **Verificar variables:**
   ```bash
   cat .env.local
   # Debe tener 3 líneas
   ```

3. **Network tab (DevTools):**
   - F12 → Network
   - Hacer login
   - Ver requests a Supabase

4. **Supabase logs:**
   - Dashboard → Logs
   - Ver qué requests llegan

---

**Siguiente:** Una vez Fase 0 completa, avísame para comenzar Fase 1 (CRUD).
