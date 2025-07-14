import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createCheckoutSession, createStripeCustomer } from '@/lib/stripe/server';
import { STRIPE_CONFIG } from '@/lib/stripe/client';
import { getUserSubscription, updateSubscription } from '@/lib/db/subscriptions';

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient();
    
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get request body
    const body = await request.json();
    const { priceId, plan } = body;

    // Validate plan
    if (!['individual', 'team'].includes(plan)) {
      return NextResponse.json(
        { error: 'Invalid plan' },
        { status: 400 }
      );
    }

    // Get user's subscription
    const subscription = await getUserSubscription(user.id);
    
    // Check if user already has an active paid subscription
    if (subscription && subscription.plan !== 'free' && subscription.status === 'active') {
      return NextResponse.json(
        { error: 'User already has an active subscription' },
        { status: 400 }
      );
    }

    let stripeCustomerId = subscription?.stripe_customer_id;

    // Create Stripe customer if doesn't exist
    if (!stripeCustomerId) {
      const customer = await createStripeCustomer(user.email!, {
        user_id: user.id,
      });
      stripeCustomerId = customer.id;

      // Update subscription with Stripe customer ID
      await updateSubscription(user.id, {
        stripeCustomerId,
      });
    }

    // Create checkout session
    const session = await createCheckoutSession({
      customerId: stripeCustomerId,
      priceId,
      successUrl: `${request.headers.get('origin')}/billing?success=true`,
      cancelUrl: `${request.headers.get('origin')}/pricing?canceled=true`,
      metadata: {
        user_id: user.id,
        plan,
      },
      trialPeriodDays: STRIPE_CONFIG.trialPeriodDays,
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error('Checkout session error:', error);
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}