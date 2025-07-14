import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getUserSubscription, checkPlanLimit, PLAN_LIMITS } from '@/lib/db/subscriptions';
import { checkUsageLimit } from '@/lib/db/usage';

export interface SubscriptionCheck {
  hasAccess: boolean;
  reason?: string;
  limit?: number;
  current?: number;
}

export async function checkSubscriptionAccess(
  request: NextRequest,
  feature: keyof typeof PLAN_LIMITS.free
): Promise<SubscriptionCheck> {
  const supabase = createClient();
  
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) {
    return {
      hasAccess: false,
      reason: 'Authentication required'
    };
  }

  const subscription = await getUserSubscription(user.id);
  const plan = subscription?.plan || 'free';
  
  // Special handling for AI generations
  if (feature === 'aiGenerations') {
    const limit = PLAN_LIMITS[plan].aiGenerations;
    if (limit === 0) {
      return {
        hasAccess: false,
        reason: 'AI features not available on free plan'
      };
    }
    
    const usage = await checkUsageLimit(user.id, 'ai_generation', limit);
    if (!usage.allowed) {
      return {
        hasAccess: false,
        reason: 'Monthly AI generation limit reached',
        limit: usage.limit,
        current: usage.current
      };
    }
    
    return { hasAccess: true };
  }
  
  // Check other plan limits
  const limitCheck = await checkPlanLimit(user.id, feature);
  
  if (!limitCheck.allowed) {
    return {
      hasAccess: false,
      reason: `${feature} limit reached for ${plan} plan`,
      limit: limitCheck.limit,
      current: limitCheck.current
    };
  }
  
  return { hasAccess: true };
}

export function createSubscriptionError(check: SubscriptionCheck): NextResponse {
  return NextResponse.json(
    {
      error: check.reason || 'Access denied',
      limit: check.limit,
      current: check.current,
      upgrade_url: '/pricing'
    },
    { status: 403 }
  );
}