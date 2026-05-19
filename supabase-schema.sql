-- ============================================================
-- ESQUEMA PARA CICLO CREIGHTON
-- Ejecutar en Supabase > SQL Editor
-- ============================================================

-- Tabla principal de entradas
CREATE TABLE IF NOT EXISTS entries (
  id                   UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id              UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date                 DATE NOT NULL,
  day_type             TEXT NOT NULL CHECK (day_type IN ('menstrual','seco','mucus','fertil','cuspide','spotting')),
  sensation_code       TEXT,          -- 0, 2, 2W, 4, 6, 8, 10, 10DL, 10SL, 10WL
  characteristic_codes TEXT[] DEFAULT '{}',  -- ['K', 'L', 'C', ...]
  is_peak              BOOLEAN DEFAULT FALSE,
  bleeding_intensity   TEXT,          -- 'Muy ligero', 'Ligero', 'Moderado', 'Abundante'
  note                 TEXT,
  created_at           TIMESTAMPTZ DEFAULT NOW(),
  updated_at           TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE (user_id, date)
);

-- Actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER entries_updated_at
  BEFORE UPDATE ON entries
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Row Level Security: cada usuario solo ve sus propios datos
ALTER TABLE entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own entries"
  ON entries FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own entries"
  ON entries FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own entries"
  ON entries FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own entries"
  ON entries FOR DELETE
  USING (auth.uid() = user_id);

-- Índice para consultas por mes
CREATE INDEX entries_user_date ON entries(user_id, date);
