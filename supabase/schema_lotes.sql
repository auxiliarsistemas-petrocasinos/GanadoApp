-- 1. Crear tabla Lotes
CREATE TABLE IF NOT EXISTS lotes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  granja_id UUID NOT NULL REFERENCES granjas(id) ON DELETE CASCADE,
  nombre VARCHAR(255) NOT NULL,
  fecha_inicio DATE NOT NULL,
  cantidad_inicial INTEGER NOT NULL CHECK (cantidad_inicial > 0),
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by_user_id UUID REFERENCES usuarios(id)
);

-- 2. Limpiar registros de gallinas actuales (ya que no tienen lote asignado)
-- Nota: Esto vacía los registros de prueba que teníamos para evitar inconsistencias
TRUNCATE TABLE registros_gallinas CASCADE;

-- 3. Alterar registros_gallinas
ALTER TABLE registros_gallinas DROP CONSTRAINT IF EXISTS unique_fecha_per_granja;

-- Agregamos la columna lote_id (obligatoria)
ALTER TABLE registros_gallinas ADD COLUMN lote_id UUID NOT NULL REFERENCES lotes(id) ON DELETE CASCADE;

-- Agregamos constraint para que no haya dos registros el mismo día para el MISMO lote
ALTER TABLE registros_gallinas ADD CONSTRAINT unique_fecha_per_lote UNIQUE (lote_id, fecha);

-- 4. RLS para Lotes
ALTER TABLE lotes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can see their granja lotes"
  ON lotes FOR SELECT
  USING (granja_id IN (
    SELECT granja_id FROM usuarios WHERE auth_user_id = auth.uid()
  ));

CREATE POLICY "Users can insert lotes to their granja"
  ON lotes FOR INSERT
  WITH CHECK (granja_id IN (
    SELECT granja_id FROM usuarios WHERE auth_user_id = auth.uid()
  ));

CREATE POLICY "Users can update their granja lotes"
  ON lotes FOR UPDATE
  USING (granja_id IN (
    SELECT granja_id FROM usuarios WHERE auth_user_id = auth.uid()
  ));
