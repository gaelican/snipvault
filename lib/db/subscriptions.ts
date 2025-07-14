import { createClient } from '@/lib/supabase/server'
import type { Subscription, SubscriptionPlan, SubscriptionStatus } from '@/lib/supabase/types'

export async function getUserSubscription(userId: string): Promise<Subscription | null> {
  const supabase = createClient()
  
  const { data, error } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('user_id', userId)
    .single()
  
  if (error) {
    console.error('Error fetching user subscription:', error)
    return null
  }
  
  return data
}

export async function createSubscription(
  userId: string,
  plan: SubscriptionPlan = 'free',
  stripeCustomerId?: string
): Promise<Subscription | null> {
  const supabase = createClient()
  
  const { data, error } = await supabase
    .from('subscriptions')
    .insert({
      user_id: userId,
      plan,
      status: 'active',
      stripe_customer_id: stripeCustomerId
    })
    .select()
    .single()
  
  if (error) {
    console.error('Error creating subscription:', error)
    return null
  }
  
  return data
}

export async function updateSubscription(
  userId: string,
  updates: {
    stripeCustomerId?: string
    stripeSubscriptionId?: string
    stripePriceId?: string
    status?: SubscriptionStatus
    plan?: SubscriptionPlan
    currentPeriodStart?: string
    currentPeriodEnd?: string
    cancelAt?: string
    canceledAt?: string
    trialStart?: string
    trialEnd?: string
  }
): Promise<Subscription | null> {
  const supabase = createClient()
  
  const { data, error } = await supabase
    .from('subscriptions')
    .update({
      stripe_customer_id: updates.stripeCustomerId,
      stripe_subscription_id: updates.stripeSubscriptionId,
      stripe_price_id: updates.stripePriceId,
      status: updates.status,
      plan: updates.plan,
      current_period_start: updates.currentPeriodStart,
      current_period_end: updates.currentPeriodEnd,
      cancel_at: updates.cancelAt,
      canceled_at: updates.canceledAt,
      trial_start: updates.trialStart,
      trial_end: updates.trialEnd
    })
    .eq('user_id', userId)
    .select()
    .single()
  
  if (error) {
    console.error('Error updating subscription:', error)
    return null
  }
  
  return data
}

export async function getSubscriptionByStripeCustomerId(
  stripeCustomerId: string
): Promise<Subscription | null> {
  const supabase = createClient()
  
  const { data, error } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('stripe_customer_id', stripeCustomerId)
    .single()
  
  if (error) {
    console.error('Error fetching subscription by Stripe customer ID:', error)
    return null
  }
  
  return data
}

export async function getSubscriptionByStripeSubscriptionId(
  stripeSubscriptionId: string
): Promise<Subscription | null> {
  const supabase = createClient()
  
  const { data, error } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('stripe_subscription_id', stripeSubscriptionId)
    .single()
  
  if (error) {
    console.error('Error fetching subscription by Stripe subscription ID:', error)
    return null
  }
  
  return data
}

export async function isUserPro(userId: string): Promise<boolean> {
  const subscription = await getUserSubscription(userId)
  return (subscription?.plan === 'pro' || subscription?.plan === 'individual') && subscription?.status === 'active'
}

export async function isUserIndividual(userId: string): Promise<boolean> {
  const subscription = await getUserSubscription(userId)
  return subscription?.plan === 'individual' && subscription?.status === 'active'
}

export async function isUserTeam(userId: string): Promise<boolean> {
  const subscription = await getUserSubscription(userId)
  return subscription?.plan === 'team' && subscription?.status === 'active'
}

export async function hasActiveSubscription(userId: string): Promise<boolean> {
  const subscription = await getUserSubscription(userId)
  return subscription?.status === 'active' || subscription?.status === 'trialing'
}

// Plan limits
export const PLAN_LIMITS = {
  free: {
    snippets: 10,
    privateSnippets: 0,
    teams: 0,
    teamMembers: 0,
    snippetVersions: 3,
    favoriteSnippets: 25,
    aiGenerations: 0
  },
  pro: {
    snippets: -1, // unlimited
    privateSnippets: -1,
    teams: 3,
    teamMembers: 5,
    snippetVersions: -1,
    favoriteSnippets: -1,
    aiGenerations: 100
  },
  individual: {
    snippets: -1, // unlimited
    privateSnippets: -1,
    teams: 0,
    teamMembers: 0,
    snippetVersions: -1,
    favoriteSnippets: -1,
    aiGenerations: 100
  },
  team: {
    snippets: -1,
    privateSnippets: -1,
    teams: -1,
    teamMembers: -1,
    snippetVersions: -1,
    favoriteSnippets: -1,
    aiGenerations: 500
  }
}

export async function checkPlanLimit(
  userId: string,
  limitType: keyof typeof PLAN_LIMITS.free
): Promise<{ allowed: boolean; limit: number; current: number }> {
  const subscription = await getUserSubscription(userId)
  const plan = subscription?.plan || 'free'
  const limit = PLAN_LIMITS[plan][limitType]
  
  // Unlimited
  if (limit === -1) {
    return { allowed: true, limit: -1, current: 0 }
  }
  
  // Get current count based on limit type
  const supabase = createClient()
  let current = 0
  
  switch (limitType) {
    case 'snippets':
      const { count: snippetCount } = await supabase
        .from('snippets')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
      current = snippetCount || 0
      break
      
    case 'privateSnippets':
      const { count: privateCount } = await supabase
        .from('snippets')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('visibility', 'private')
      current = privateCount || 0
      break
      
    case 'teams':
      const { count: teamCount } = await supabase
        .from('teams')
        .select('*', { count: 'exact', head: true })
        .eq('owner_id', userId)
      current = teamCount || 0
      break
      
    case 'favoriteSnippets':
      const { count: favoriteCount } = await supabase
        .from('favorites')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
      current = favoriteCount || 0
      break
  }
  
  return {
    allowed: current < limit,
    limit,
    current
  }
}