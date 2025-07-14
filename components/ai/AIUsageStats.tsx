'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Sparkles, TrendingUp, DollarSign, Clock } from 'lucide-react';

interface UsageStats {
  daily: {
    requests: number;
    tokens: number;
    cost: number;
  };
  monthly: {
    requests: number;
    tokens: number;
    cost: number;
  };
  rateLimit: {
    remaining: number;
    limit: number;
    resetIn: number;
  };
}

export function AIUsageStats() {
  const [stats, setStats] = useState<UsageStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // In a real implementation, fetch usage stats from your API
    // For now, we'll use mock data
    setTimeout(() => {
      setStats({
        daily: {
          requests: 12,
          tokens: 4500,
          cost: 0.0234,
        },
        monthly: {
          requests: 245,
          tokens: 89000,
          cost: 0.4567,
        },
        rateLimit: {
          remaining: 3,
          limit: 5,
          resetIn: 45000, // 45 seconds
        },
      });
      setIsLoading(false);
    }, 1000);
  }, []);

  const formatTime = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`;
    }
    return `${seconds}s`;
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            AI Usage
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-32">
            <div className="animate-pulse text-muted-foreground">
              Loading usage stats...
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!stats) {
    return null;
  }

  const rateLimitPercentage = (stats.rateLimit.remaining / stats.rateLimit.limit) * 100;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5" />
          AI Usage Statistics
        </CardTitle>
        <CardDescription>
          Track your AI feature usage and costs
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Rate Limit Status */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Rate Limit</span>
            <span className="flex items-center gap-2">
              <Clock className="h-3 w-3" />
              {formatTime(stats.rateLimit.resetIn)}
            </span>
          </div>
          <Progress value={rateLimitPercentage} className="h-2" />
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>{stats.rateLimit.remaining} / {stats.rateLimit.limit} requests remaining</span>
          </div>
        </div>

        {/* Daily Stats */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium">Today</h4>
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-1">
              <p className="text-2xl font-semibold">{stats.daily.requests}</p>
              <p className="text-xs text-muted-foreground">Requests</p>
            </div>
            <div className="space-y-1">
              <p className="text-2xl font-semibold">
                {(stats.daily.tokens / 1000).toFixed(1)}k
              </p>
              <p className="text-xs text-muted-foreground">Tokens</p>
            </div>
            <div className="space-y-1">
              <p className="text-2xl font-semibold">
                ${stats.daily.cost.toFixed(3)}
              </p>
              <p className="text-xs text-muted-foreground">Cost</p>
            </div>
          </div>
        </div>

        {/* Monthly Stats */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium">This Month</h4>
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-1">
              <p className="text-2xl font-semibold">{stats.monthly.requests}</p>
              <p className="text-xs text-muted-foreground">Requests</p>
            </div>
            <div className="space-y-1">
              <p className="text-2xl font-semibold">
                {(stats.monthly.tokens / 1000).toFixed(1)}k
              </p>
              <p className="text-xs text-muted-foreground">Tokens</p>
            </div>
            <div className="space-y-1">
              <p className="text-2xl font-semibold">
                ${stats.monthly.cost.toFixed(2)}
              </p>
              <p className="text-xs text-muted-foreground">Cost</p>
            </div>
          </div>
        </div>

        {/* Cost Breakdown */}
        <div className="pt-4 border-t">
          <div className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Average cost per request
            </span>
            <Badge variant="secondary">
              ${(stats.monthly.cost / stats.monthly.requests).toFixed(4)}
            </Badge>
          </div>
          <div className="flex items-center justify-between text-sm mt-2">
            <span className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Average tokens per request
            </span>
            <Badge variant="secondary">
              {Math.round(stats.monthly.tokens / stats.monthly.requests)}
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}