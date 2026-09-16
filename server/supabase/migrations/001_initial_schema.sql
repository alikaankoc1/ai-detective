-- 001_initial_schema.sql
-- Oyuncu ilerlemesi için temel profiles tablosu.
-- Bu dosya henüz uygulanmamıştır; yalnızca migration kaynağıdır.
-- Secret / API key içermez.

-- profiles: auth.users ile 1:1
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users (id) ON DELETE CASCADE,
  username TEXT NULL,
  xp INTEGER NOT NULL DEFAULT 0,
  level INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT profiles_xp_nonnegative CHECK (xp >= 0),
  CONSTRAINT profiles_level_positive CHECK (level >= 1)
);

-- Sık kullanılan alanlar için yardımcı index'ler (PK zaten id üzerindedir)
CREATE INDEX IF NOT EXISTS profiles_username_idx ON public.profiles (username);
CREATE INDEX IF NOT EXISTS profiles_level_idx ON public.profiles (level);

-- Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Kullanıcı yalnızca kendi profilini okuyabilir
CREATE POLICY "profiles_select_own"
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- Kullanıcı yalnızca kendi profilini güncelleyebilir
CREATE POLICY "profiles_update_own"
  ON public.profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Not:
-- service_role RLS'yi bypass eder (mevcut sunucu istemcisi etkilenmez).
-- INSERT politikası yok; profil oluşturma ileride service_role veya ayrı policy ile eklenebilir.
-- Gemini / Case Engine bu migration'dan bağımsızdır.
