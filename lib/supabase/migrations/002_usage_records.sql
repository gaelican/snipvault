-- Create usage_records table for tracking feature usage
CREATE TABLE IF NOT EXISTS public.usage_records (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  feature TEXT NOT NULL CHECK (feature IN ('ai_generation', 'api_call')),
  count INTEGER NOT NULL DEFAULT 0,
  period_start TIMESTAMPTZ NOT NULL,
  period_end TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Ensure one record per user/feature/period combination
  UNIQUE(user_id, feature, period_start, period_end)
);

-- Create indexes for performance
CREATE INDEX idx_usage_records_user_id ON public.usage_records(user_id);
CREATE INDEX idx_usage_records_feature ON public.usage_records(feature);
CREATE INDEX idx_usage_records_period ON public.usage_records(period_start, period_end);

-- Enable RLS
ALTER TABLE public.usage_records ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own usage records"
  ON public.usage_records
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "System can insert usage records"
  ON public.usage_records
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "System can update usage records"
  ON public.usage_records
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Create function to auto-update updated_at
CREATE OR REPLACE FUNCTION update_usage_records_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at
CREATE TRIGGER update_usage_records_updated_at
  BEFORE UPDATE ON public.usage_records
  FOR EACH ROW
  EXECUTE FUNCTION update_usage_records_updated_at();