-- TAPE MASTER DATABASE SCHEMA
-- PostgreSQL with Supabase Row Level Security

-- 1. Profiles Table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE NOT NULL,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Collections Table
CREATE TABLE IF NOT EXISTS public.collections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  share_token TEXT UNIQUE NOT NULL DEFAULT encode(gen_random_bytes(12), 'hex'),
  is_public BOOLEAN DEFAULT true NOT NULL,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Tapes Table
CREATE TABLE IF NOT EXISTS public.tapes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  collection_id UUID REFERENCES public.collections(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  artist TEXT NOT NULL,
  subtitle TEXT,
  description TEXT,
  audio_path TEXT NOT NULL,
  artwork_path TEXT,
  duration INTEGER DEFAULT 180 NOT NULL,
  label_color TEXT DEFAULT '#D6C7B2' NOT NULL,
  position_x REAL DEFAULT 0 NOT NULL,
  position_y REAL DEFAULT 0 NOT NULL,
  position_z REAL DEFAULT 0 NOT NULL,
  rotation_x REAL DEFAULT 0 NOT NULL,
  rotation_y REAL DEFAULT 0 NOT NULL,
  rotation_z REAL DEFAULT 0 NOT NULL,
  scale REAL DEFAULT 1.0 NOT NULL,
  sort_order INTEGER DEFAULT 0 NOT NULL,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Indexes for lightning fast queries
CREATE INDEX IF NOT EXISTS idx_collections_owner ON public.collections(owner_id);
CREATE INDEX IF NOT EXISTS idx_collections_share_token ON public.collections(share_token);
CREATE INDEX IF NOT EXISTS idx_tapes_collection ON public.tapes(collection_id);
CREATE INDEX IF NOT EXISTS idx_tapes_sort_order ON public.tapes(sort_order);

-- Enable Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tapes ENABLE ROW LEVEL SECURITY;

-- RLS Policies for Profiles
CREATE POLICY "Public profiles are readable by everyone"
  ON public.profiles FOR SELECT USING (true);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- RLS Policies for Collections
CREATE POLICY "Public collections are viewable by anyone"
  ON public.collections FOR SELECT
  USING (is_public = true OR auth.uid() = owner_id);

CREATE POLICY "Owners can manage their collections"
  ON public.collections FOR ALL
  USING (auth.uid() = owner_id);

-- RLS Policies for Tapes
CREATE POLICY "Tapes are viewable if collection is viewable"
  ON public.tapes FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.collections
      WHERE collections.id = tapes.collection_id
      AND (collections.is_public = true OR collections.owner_id = auth.uid())
    )
  );

CREATE POLICY "Owners can insert tapes into their collections"
  ON public.tapes FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.collections
      WHERE collections.id = tapes.collection_id
      AND collections.owner_id = auth.uid()
    )
  );

CREATE POLICY "Owners can update tapes in their collections"
  ON public.tapes FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.collections
      WHERE collections.id = tapes.collection_id
      AND collections.owner_id = auth.uid()
    )
  );

CREATE POLICY "Owners can delete tapes from their collections"
  ON public.tapes FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.collections
      WHERE collections.id = tapes.collection_id
      AND collections.owner_id = auth.uid()
    )
  );
