import { createClient } from '@/lib/supabase/server';

export interface UsageRecord {
  id: string;
  user_id: string;
  feature: 'ai_generation' | 'api_call';
  count: number;
  period_start: string;
  period_end: string;
  created_at: string;
  updated_at: string;
}

export async function getUsageForPeriod(
  userId: string,
  feature: 'ai_generation' | 'api_call',
  periodStart: Date,
  periodEnd: Date
): Promise<number> {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('usage_records')
    .select('count')
    .eq('user_id', userId)
    .eq('feature', feature)
    .gte('period_start', periodStart.toISOString())
    .lte('period_end', periodEnd.toISOString());
  
  if (error) {
    console.error('Error fetching usage:', error);
    return 0;
  }
  
  return data.reduce((sum, record) => sum + record.count, 0);
}

export async function incrementUsage(
  userId: string,
  feature: 'ai_generation' | 'api_call',
  amount: number = 1
): Promise<boolean> {
  const supabase = createClient();
  
  // Get current billing period
  const now = new Date();
  const periodStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const periodEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  
  // Check if record exists for this period
  const { data: existing } = await supabase
    .from('usage_records')
    .select('*')
    .eq('user_id', userId)
    .eq('feature', feature)
    .gte('period_start', periodStart.toISOString())
    .lte('period_end', periodEnd.toISOString())
    .single();
  
  if (existing) {
    // Update existing record
    const { error } = await supabase
      .from('usage_records')
      .update({ 
        count: existing.count + amount,
        updated_at: new Date().toISOString()
      })
      .eq('id', existing.id);
    
    return !error;
  } else {
    // Create new record
    const { error } = await supabase
      .from('usage_records')
      .insert({
        user_id: userId,
        feature,
        count: amount,
        period_start: periodStart.toISOString(),
        period_end: periodEnd.toISOString()
      });
    
    return !error;
  }
}

export async function checkUsageLimit(
  userId: string,
  feature: 'ai_generation' | 'api_call',
  limit: number
): Promise<{ allowed: boolean; current: number; limit: number }> {
  if (limit === -1) {
    return { allowed: true, current: 0, limit: -1 };
  }
  
  const now = new Date();
  const periodStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const periodEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  
  const current = await getUsageForPeriod(userId, feature, periodStart, periodEnd);
  
  return {
    allowed: current < limit,
    current,
    limit
  };
}