'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Subscription } from '@/lib/supabase/types';
import { PLAN_LIMITS } from '@/lib/db/subscriptions';

interface UseSubscriptionReturn {
  subscription: Subscription | null;
  loading: boolean;
  error: Error | null;
  isActive: boolean;
  isPro: boolean;
  isTeam: boolean;
  canUseFeature: (feature: keyof typeof PLAN_LIMITS.free) => boolean;
  getRemainingLimit: (feature: keyof typeof PLAN_LIMITS.free) => number;
  refetch: () => Promise<void>;
}

export function useSubscription(): UseSubscriptionReturn {
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const loadSubscription = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setSubscription(null);
        return;
      }

      const { data, error: subError } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (subError) {
        // User might not have a subscription yet
        console.log('No subscription found:', subError);
        setSubscription(null);
      } else {
        setSubscription(data);
      }
    } catch (err) {
      console.error('Error loading subscription:', err);
      setError(err instanceof Error ? err : new Error('Failed to load subscription'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSubscription();

    // Subscribe to realtime changes
    const supabase = createClient();
    
    const setupRealtimeSubscription = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const channel = supabase
        .channel('subscription_changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'subscriptions',
            filter: `user_id=eq.${user.id}`,
          },
          (payload) => {
            if (payload.eventType === 'DELETE') {
              setSubscription(null);
            } else {
              setSubscription(payload.new as Subscription);
            }
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    };

    setupRealtimeSubscription();
  }, []);

  const isActive = subscription?.status === 'active' || subscription?.status === 'trialing';
  const isPro = subscription?.plan === 'pro' && isActive;
  const isTeam = subscription?.plan === 'team' && isActive;

  const canUseFeature = (feature: keyof typeof PLAN_LIMITS.free): boolean => {
    const plan = subscription?.plan || 'free';
    const limit = PLAN_LIMITS[plan][feature];
    return limit === -1 || limit > 0;
  };

  const getRemainingLimit = (feature: keyof typeof PLAN_LIMITS.free): number => {
    const plan = subscription?.plan || 'free';
    return PLAN_LIMITS[plan][feature];
  };

  return {
    subscription,
    loading,
    error,
    isActive,
    isPro,
    isTeam,
    canUseFeature,
    getRemainingLimit,
    refetch: loadSubscription,
  };
}