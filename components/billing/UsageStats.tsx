'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { PLAN_LIMITS } from '@/lib/db/subscriptions';
import { Loader2, Sparkles, FileCode, Users } from 'lucide-react';
import { useSubscription } from '@/lib/hooks/use-subscription';

interface UsageData {
  snippets: number;
  privateSnippets: number;
  teams: number;
  aiGenerations: number;
}

export function UsageStats() {
  const { subscription, loading: subLoading } = useSubscription();
  const [usage, setUsage] = useState<UsageData>({
    snippets: 0,
    privateSnippets: 0,
    teams: 0,
    aiGenerations: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!subLoading && subscription) {
      loadUsage();
    }
  }, [subscription, subLoading]);

  const loadUsage = async () => {
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) return;

      // Get snippet counts
      const [snippetsResult, privateResult, teamsResult] = await Promise.all([
        supabase
          .from('snippets')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id),
        supabase
          .from('snippets')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id)
          .eq('visibility', 'private'),
        supabase
          .from('teams')
          .select('*', { count: 'exact', head: true })
          .eq('owner_id', user.id),
      ]);

      // Get AI usage for current month
      const now = new Date();
      const periodStart = new Date(now.getFullYear(), now.getMonth(), 1);
      const periodEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      
      const { data: aiUsage } = await supabase
        .from('usage_records')
        .select('count')
        .eq('user_id', user.id)
        .eq('feature', 'ai_generation')
        .gte('period_start', periodStart.toISOString())
        .lte('period_end', periodEnd.toISOString());

      const aiTotal = aiUsage?.reduce((sum, record) => sum + record.count, 0) || 0;

      setUsage({
        snippets: snippetsResult.count || 0,
        privateSnippets: privateResult.count || 0,
        teams: teamsResult.count || 0,
        aiGenerations: aiTotal,
      });
    } catch (error) {
      console.error('Error loading usage:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || subLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  const plan = subscription?.plan || 'free';
  const limits = PLAN_LIMITS[plan];

  const usageItems = [
    {
      name: 'Snippets',
      icon: FileCode,
      current: usage.snippets,
      limit: limits.snippets,
      color: 'text-blue-600',
    },
    {
      name: 'Private Snippets',
      icon: FileCode,
      current: usage.privateSnippets,
      limit: limits.privateSnippets,
      color: 'text-purple-600',
    },
    {
      name: 'Teams',
      icon: Users,
      current: usage.teams,
      limit: limits.teams,
      color: 'text-green-600',
    },
    {
      name: 'AI Generations',
      icon: Sparkles,
      current: usage.aiGenerations,
      limit: limits.aiGenerations,
      color: 'text-orange-600',
      period: 'This month',
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Usage Statistics</CardTitle>
        <CardDescription>
          Track your usage against plan limits
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {usageItems.map((item) => {
          const percentage = item.limit === -1 
            ? 0 
            : item.limit === 0 
            ? 100 
            : (item.current / item.limit) * 100;
          
          const isUnlimited = item.limit === -1;
          const isUnavailable = item.limit === 0;
          const isNearLimit = !isUnlimited && percentage >= 80;
          const isAtLimit = !isUnlimited && percentage >= 100;

          return (
            <div key={item.name} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <item.icon className={`h-4 w-4 ${item.color}`} />
                  <span className="font-medium">{item.name}</span>
                  {item.period && (
                    <span className="text-xs text-muted-foreground">
                      ({item.period})
                    </span>
                  )}
                </div>
                <span className={`text-sm ${isAtLimit ? 'text-destructive' : ''}`}>
                  {item.current}
                  {!isUnlimited && ` / ${item.limit}`}
                  {isUnlimited && ' / Unlimited'}
                  {isUnavailable && ' (Not available)'}
                </span>
              </div>
              
              {!isUnlimited && !isUnavailable && (
                <Progress 
                  value={Math.min(percentage, 100)} 
                  className={`h-2 ${isNearLimit ? 'bg-orange-100' : ''}`}
                />
              )}
              
              {isAtLimit && (
                <p className="text-xs text-destructive">
                  Limit reached. Upgrade your plan for more {item.name.toLowerCase()}.
                </p>
              )}
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}