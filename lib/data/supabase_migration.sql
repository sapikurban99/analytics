-- tomeame_file_data: Stores parsed data from each uploaded file
CREATE TABLE IF NOT EXISTS public.tomeame_file_data (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  platform    TEXT NOT NULL,
  category    TEXT NOT NULL,
  data_type   TEXT NOT NULL,
  month_key   TEXT NOT NULL,
  month_name  TEXT NOT NULL,
  filename    TEXT NOT NULL,
  data        JSONB NOT NULL DEFAULT '{}'::jsonb,
  size_bytes  BIGINT DEFAULT 0,
  uploaded_at TIMESTAMPTZ DEFAULT now(),
  status      TEXT DEFAULT 'berhasil',
  error_msg   TEXT
);

-- Index for querying by month
CREATE INDEX IF NOT EXISTS idx_file_data_month
  ON public.tomeame_file_data (month_key);

-- Index for querying by platform
CREATE INDEX IF NOT EXISTS idx_file_data_platform
  ON public.tomeame_file_data (platform, category);

-- Enable RLS
ALTER TABLE public.tomeame_file_data ENABLE ROW LEVEL SECURITY;

-- Allow all authenticated/anonymous reads (dashboard query)
CREATE POLICY "Allow read for all"
  ON public.tomeame_file_data FOR SELECT
  USING (true);

-- Allow insert for all (upload API)
CREATE POLICY "Allow insert for all"
  ON public.tomeame_file_data FOR INSERT
  WITH CHECK (true);

-- Allow delete for all (cleanup)
CREATE POLICY "Allow delete for all"
  ON public.tomeame_file_data FOR DELETE
  USING (true);
