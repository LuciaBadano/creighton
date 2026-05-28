-- ============================================================
-- SCHEMA v2 — ROLES Y APROBACIÓN
-- Ejecutar completo en Supabase > SQL Editor
-- ============================================================

-- 1. Tabla de perfiles
CREATE TABLE IF NOT EXISTS user_profiles (
  id           UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email        TEXT NOT NULL,
  full_name    TEXT,
  role         TEXT NOT NULL DEFAULT 'pending'
                 CHECK (role IN ('pending', 'user', 'admin')),
  approved_at  TIMESTAMPTZ,
  approved_by  UUID REFERENCES auth.users(id),
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Campos SOSt en entries (si ya existe la tabla del schema v1)
ALTER TABLE entries
  ADD COLUMN IF NOT EXISTS sensation_s    TEXT,
  ADD COLUMN IF NOT EXISTS observation_o  TEXT,
  ADD COLUMN IF NOT EXISTS touch_st       TEXT,
  ADD COLUMN IF NOT EXISTS frequency      TEXT;

-- 3. Activar RLS
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- 4. Borrar políticas viejas si existieran (evita conflictos al re-ejecutar)
DROP POLICY IF EXISTS "Users can view own profile"      ON user_profiles;
DROP POLICY IF EXISTS "Users can update own profile (name only)" ON user_profiles;
DROP POLICY IF EXISTS "Admins can view all profiles"    ON user_profiles;
DROP POLICY IF EXISTS "Admins can update all profiles"  ON user_profiles;
DROP POLICY IF EXISTS "Admins can view all entries"     ON entries;
DROP POLICY IF EXISTS "Allow insert own profile"        ON user_profiles;

-- 5. POLÍTICA CRÍTICA: permitir que el trigger inserte el perfil nuevo
--    (SECURITY DEFINER en la función lo maneja, pero por las dudas también
--     permitimos INSERT al propio usuario recién creado)
CREATE POLICY "Allow insert own profile"
  ON user_profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- 6. Cada usuario ve y edita su propio perfil
CREATE POLICY "Users can view own profile"
  ON user_profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own name"
  ON user_profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (
    auth.uid() = id
    -- no puede cambiarse el rol a sí mismo
    AND role = (SELECT role FROM user_profiles WHERE id = auth.uid())
  );

-- 7. Admin ve TODOS los perfiles
--    Usamos una función auxiliar para evitar recursión infinita en RLS
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM user_profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

CREATE POLICY "Admins can view all profiles"
  ON user_profiles FOR SELECT
  USING (is_admin());

CREATE POLICY "Admins can update all profiles"
  ON user_profiles FOR UPDATE
  USING (is_admin());

-- 8. Admin ve entries de todos los usuarios
DROP POLICY IF EXISTS "Admins can view all entries" ON entries;
CREATE POLICY "Admins can view all entries"
  ON entries FOR SELECT
  USING (is_admin());

-- 9. Trigger: crea perfil automáticamente al registrarse
--    SECURITY DEFINER = corre como superuser, bypassea RLS
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_profiles (id, email, role)
  VALUES (NEW.id, NEW.email, 'pending')
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Eliminar trigger viejo antes de recrear
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ============================================================
-- PASO FINAL: hacerte admin (reemplazá con tu email real)
-- ============================================================
-- UPDATE user_profiles SET role = 'admin' WHERE email = 'tu@email.com';
