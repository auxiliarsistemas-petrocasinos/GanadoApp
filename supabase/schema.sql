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
  alimento_kg NUMERIC(10, 2) CHECK (alimento_kg >= 0),
  alimento_bultos_gastados NUMERIC(10, 2) NOT NULL DEFAULT 0,
  alimento_bultos_ingresados NUMERIC(10, 2) NOT NULL DEFAULT 0,
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
ALTER TABLE registros_auditoria ENABLE ROW LEVEL SECURITY;

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

-- Policy: Auditoría visible solo para admins de la granja
CREATE POLICY "Admins see their granja audit logs"
  ON registros_auditoria FOR SELECT
  USING (granja_id IN (
    SELECT granja_id FROM usuarios
    WHERE auth_user_id = auth.uid()
      AND rol = 'admin'
  ));

COMMIT;
