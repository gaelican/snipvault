-- AI Usage Tracking Schema

-- Create AI usage logs table
CREATE TABLE IF NOT EXISTS ai_usage_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  operation TEXT NOT NULL CHECK (operation IN ('generate', 'explain', 'improve')),
  prompt_tokens INTEGER NOT NULL,
  completion_tokens INTEGER NOT NULL,
  total_tokens INTEGER NOT NULL,
  cost DECIMAL(10, 6) NOT NULL,
  model TEXT NOT NULL,
  cached BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create daily usage aggregate table
CREATE TABLE IF NOT EXISTS ai_usage_daily (
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  requests INTEGER NOT NULL DEFAULT 0,
  tokens INTEGER NOT NULL DEFAULT 0,
  cost DECIMAL(10, 6) NOT NULL DEFAULT 0,
  PRIMARY KEY (user_id, date)
);

-- Create monthly usage aggregate table
CREATE TABLE IF NOT EXISTS ai_usage_monthly (
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  year_month TEXT NOT NULL, -- Format: YYYY-MM
  requests INTEGER NOT NULL DEFAULT 0,
  tokens INTEGER NOT NULL DEFAULT 0,
  cost DECIMAL(10, 6) NOT NULL DEFAULT 0,
  PRIMARY KEY (user_id, year_month)
);

-- Create user AI quotas table
CREATE TABLE IF NOT EXISTS ai_quotas (
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE PRIMARY KEY,
  monthly_token_limit INTEGER NOT NULL DEFAULT 100000, -- 100k tokens for free tier
  rate_limit_per_minute INTEGER NOT NULL DEFAULT 5,
  tier TEXT NOT NULL DEFAULT 'free' CHECK (tier IN ('free', 'pro', 'enterprise')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_ai_usage_logs_user_created ON ai_usage_logs(user_id, created_at DESC);
CREATE INDEX idx_ai_usage_logs_operation ON ai_usage_logs(operation);
CREATE INDEX idx_ai_usage_daily_user_date ON ai_usage_daily(user_id, date DESC);
CREATE INDEX idx_ai_usage_monthly_user_month ON ai_usage_monthly(user_id, year_month DESC);

-- Create function to auto-update quotas based on subscription
CREATE OR REPLACE FUNCTION update_ai_quota_from_subscription()
RETURNS TRIGGER AS $$
BEGIN
  -- Update AI quota based on subscription tier
  INSERT INTO ai_quotas (user_id, monthly_token_limit, rate_limit_per_minute, tier)
  VALUES (
    NEW.user_id,
    CASE NEW.tier
      WHEN 'pro' THEN 1000000  -- 1M tokens for pro
      WHEN 'enterprise' THEN 10000000  -- 10M tokens for enterprise
      ELSE 100000  -- 100k tokens for free
    END,
    CASE NEW.tier
      WHEN 'pro' THEN 20  -- 20 requests per minute for pro
      WHEN 'enterprise' THEN 100  -- 100 requests per minute for enterprise
      ELSE 5  -- 5 requests per minute for free
    END,
    NEW.tier
  )
  ON CONFLICT (user_id) DO UPDATE
  SET 
    monthly_token_limit = EXCLUDED.monthly_token_limit,
    rate_limit_per_minute = EXCLUDED.rate_limit_per_minute,
    tier = EXCLUDED.tier,
    updated_at = NOW();
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for subscription changes
CREATE TRIGGER update_ai_quota_on_subscription_change
AFTER INSERT OR UPDATE OF tier ON subscriptions
FOR EACH ROW
EXECUTE FUNCTION update_ai_quota_from_subscription();

-- Create view for user AI usage stats
CREATE OR REPLACE VIEW ai_usage_stats AS
SELECT 
  u.id AS user_id,
  COALESCE(d.requests, 0) AS daily_requests,
  COALESCE(d.tokens, 0) AS daily_tokens,
  COALESCE(d.cost, 0) AS daily_cost,
  COALESCE(m.requests, 0) AS monthly_requests,
  COALESCE(m.tokens, 0) AS monthly_tokens,
  COALESCE(m.cost, 0) AS monthly_cost,
  COALESCE(q.monthly_token_limit, 100000) AS monthly_token_limit,
  COALESCE(q.rate_limit_per_minute, 5) AS rate_limit_per_minute,
  COALESCE(q.tier, 'free') AS tier
FROM profiles u
LEFT JOIN ai_usage_daily d ON u.id = d.user_id AND d.date = CURRENT_DATE
LEFT JOIN ai_usage_monthly m ON u.id = m.user_id AND m.year_month = TO_CHAR(CURRENT_DATE, 'YYYY-MM')
LEFT JOIN ai_quotas q ON u.id = q.user_id;

-- Row Level Security (RLS) policies
ALTER TABLE ai_usage_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_usage_daily ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_usage_monthly ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_quotas ENABLE ROW LEVEL SECURITY;

-- Users can only see their own usage
CREATE POLICY "Users can view own AI usage logs" ON ai_usage_logs
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can view own daily AI usage" ON ai_usage_daily
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can view own monthly AI usage" ON ai_usage_monthly
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can view own AI quotas" ON ai_quotas
  FOR SELECT USING (auth.uid() = user_id);

-- System can insert usage logs
CREATE POLICY "System can insert AI usage logs" ON ai_usage_logs
  FOR INSERT WITH CHECK (true);

CREATE POLICY "System can update daily AI usage" ON ai_usage_daily
  FOR ALL WITH CHECK (true);

CREATE POLICY "System can update monthly AI usage" ON ai_usage_monthly
  FOR ALL WITH CHECK (true);