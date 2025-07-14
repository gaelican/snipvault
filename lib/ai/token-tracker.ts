import { createClient } from '@/lib/supabase/server';

interface TokenUsageRecord {
  userId: string;
  operation: 'generate' | 'explain' | 'improve';
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  cost: number;
  model: string;
  cached: boolean;
  createdAt: Date;
}

export class TokenTracker {
  static async recordUsage(record: TokenUsageRecord): Promise<void> {
    try {
      const supabase = createClient();
      
      // Insert usage record
      const { error: insertError } = await supabase
        .from('ai_usage_logs')
        .insert({
          user_id: record.userId,
          operation: record.operation,
          prompt_tokens: record.promptTokens,
          completion_tokens: record.completionTokens,
          total_tokens: record.totalTokens,
          cost: record.cost,
          model: record.model,
          cached: record.cached,
          created_at: record.createdAt.toISOString(),
        });

      if (insertError) {
        console.error('Failed to record token usage:', insertError);
        return;
      }

      // Update daily and monthly aggregates
      await this.updateAggregates(record);
    } catch (error) {
      console.error('Error recording token usage:', error);
    }
  }

  static async updateAggregates(record: TokenUsageRecord): Promise<void> {
    const supabase = createClient();
    const today = new Date().toISOString().split('T')[0];
    const yearMonth = today.substring(0, 7);

    // Update daily aggregate
    const { data: dailyData } = await supabase
      .from('ai_usage_daily')
      .select('*')
      .eq('user_id', record.userId)
      .eq('date', today)
      .single();

    if (dailyData) {
      await supabase
        .from('ai_usage_daily')
        .update({
          requests: dailyData.requests + 1,
          tokens: dailyData.tokens + record.totalTokens,
          cost: dailyData.cost + record.cost,
        })
        .eq('user_id', record.userId)
        .eq('date', today);
    } else {
      await supabase
        .from('ai_usage_daily')
        .insert({
          user_id: record.userId,
          date: today,
          requests: 1,
          tokens: record.totalTokens,
          cost: record.cost,
        });
    }

    // Update monthly aggregate
    const { data: monthlyData } = await supabase
      .from('ai_usage_monthly')
      .select('*')
      .eq('user_id', record.userId)
      .eq('year_month', yearMonth)
      .single();

    if (monthlyData) {
      await supabase
        .from('ai_usage_monthly')
        .update({
          requests: monthlyData.requests + 1,
          tokens: monthlyData.tokens + record.totalTokens,
          cost: monthlyData.cost + record.cost,
        })
        .eq('user_id', record.userId)
        .eq('year_month', yearMonth);
    } else {
      await supabase
        .from('ai_usage_monthly')
        .insert({
          user_id: record.userId,
          year_month: yearMonth,
          requests: 1,
          tokens: record.totalTokens,
          cost: record.cost,
        });
    }
  }

  static async getUserStats(userId: string): Promise<{
    daily: { requests: number; tokens: number; cost: number };
    monthly: { requests: number; tokens: number; cost: number };
  }> {
    const supabase = createClient();
    const today = new Date().toISOString().split('T')[0];
    const yearMonth = today.substring(0, 7);

    // Get daily stats
    const { data: dailyData } = await supabase
      .from('ai_usage_daily')
      .select('*')
      .eq('user_id', userId)
      .eq('date', today)
      .single();

    // Get monthly stats
    const { data: monthlyData } = await supabase
      .from('ai_usage_monthly')
      .select('*')
      .eq('user_id', userId)
      .eq('year_month', yearMonth)
      .single();

    return {
      daily: dailyData || { requests: 0, tokens: 0, cost: 0 },
      monthly: monthlyData || { requests: 0, tokens: 0, cost: 0 },
    };
  }

  static async getUserQuota(userId: string): Promise<{
    used: number;
    limit: number;
    resetDate: Date;
  }> {
    // This is a placeholder - implement based on your subscription model
    const stats = await this.getUserStats(userId);
    
    // Example: 100k tokens per month for free tier
    const monthlyLimit = 100000;
    const resetDate = new Date();
    resetDate.setMonth(resetDate.getMonth() + 1);
    resetDate.setDate(1);
    resetDate.setHours(0, 0, 0, 0);

    return {
      used: stats.monthly.tokens,
      limit: monthlyLimit,
      resetDate,
    };
  }
}