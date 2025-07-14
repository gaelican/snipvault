import { NextRequest, NextResponse } from 'next/server';
import { stripe, webhookSecret } from '@/lib/stripe/server';
import { 
  getSubscriptionByStripeCustomerId,
  getSubscriptionByStripeSubscriptionId,
  updateSubscription,
  createSubscription 
} from '@/lib/db/subscriptions';
import { headers } from 'next/headers';
import Stripe from 'stripe';

// Stripe webhook events we care about
const relevantEvents = new Set([
  'checkout.session.completed',
  'customer.subscription.created',
  'customer.subscription.updated',
  'customer.subscription.deleted',
  'invoice.payment_succeeded',
  'invoice.payment_failed',
]);

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = headers().get('stripe-signature')!;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (error) {
    console.error('Webhook signature verification failed:', error);
    return NextResponse.json(
      { error: 'Invalid signature' },
      { status: 400 }
    );
  }

  if (!relevantEvents.has(event.type)) {
    return NextResponse.json({ received: true });
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        
        if (session.mode === 'subscription') {
          const userId = session.metadata?.user_id;
          const plan = session.metadata?.plan as 'individual' | 'team';
          
          if (!userId || !plan) {
            throw new Error('Missing user_id or plan in session metadata');
          }

          await updateSubscription(userId, {
            stripeCustomerId: session.customer as string,
            stripeSubscriptionId: session.subscription as string,
            plan,
            status: 'active',
          });
        }
        break;
      }

      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        const userId = subscription.metadata?.user_id;
        
        if (!userId) {
          // Try to find user by customer ID
          const existingSubscription = await getSubscriptionByStripeCustomerId(
            subscription.customer as string
          );
          
          if (!existingSubscription) {
            console.error('No user found for subscription:', subscription.id);
            break;
          }

          await updateSubscription(existingSubscription.user_id, {
            stripeSubscriptionId: subscription.id,
            stripePriceId: subscription.items.data[0].price.id,
            status: mapStripeStatus(subscription.status),
            currentPeriodStart: new Date(subscription.current_period_start * 1000).toISOString(),
            currentPeriodEnd: new Date(subscription.current_period_end * 1000).toISOString(),
            cancelAt: subscription.cancel_at 
              ? new Date(subscription.cancel_at * 1000).toISOString() 
              : null,
            canceledAt: subscription.canceled_at 
              ? new Date(subscription.canceled_at * 1000).toISOString() 
              : null,
            trialStart: subscription.trial_start 
              ? new Date(subscription.trial_start * 1000).toISOString() 
              : null,
            trialEnd: subscription.trial_end 
              ? new Date(subscription.trial_end * 1000).toISOString() 
              : null,
          });
        } else {
          // Determine plan based on price ID
          const priceId = subscription.items.data[0].price.id;
          let plan: 'individual' | 'team' = 'individual';
          
          if (priceId === process.env.NEXT_PUBLIC_STRIPE_TEAM_PRICE_ID) {
            plan = 'team';
          }

          await updateSubscription(userId, {
            stripeCustomerId: subscription.customer as string,
            stripeSubscriptionId: subscription.id,
            stripePriceId: priceId,
            plan,
            status: mapStripeStatus(subscription.status),
            currentPeriodStart: new Date(subscription.current_period_start * 1000).toISOString(),
            currentPeriodEnd: new Date(subscription.current_period_end * 1000).toISOString(),
            cancelAt: subscription.cancel_at 
              ? new Date(subscription.cancel_at * 1000).toISOString() 
              : null,
            canceledAt: subscription.canceled_at 
              ? new Date(subscription.canceled_at * 1000).toISOString() 
              : null,
            trialStart: subscription.trial_start 
              ? new Date(subscription.trial_start * 1000).toISOString() 
              : null,
            trialEnd: subscription.trial_end 
              ? new Date(subscription.trial_end * 1000).toISOString() 
              : null,
          });
        }
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        const existingSubscription = await getSubscriptionByStripeSubscriptionId(
          subscription.id
        );
        
        if (existingSubscription) {
          await updateSubscription(existingSubscription.user_id, {
            status: 'canceled',
            plan: 'free',
            canceledAt: new Date().toISOString(),
          });
        }
        break;
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice;
        
        if (invoice.subscription) {
          const existingSubscription = await getSubscriptionByStripeSubscriptionId(
            invoice.subscription as string
          );
          
          if (existingSubscription) {
            await updateSubscription(existingSubscription.user_id, {
              status: 'active',
            });
          }
        }
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        
        if (invoice.subscription) {
          const existingSubscription = await getSubscriptionByStripeSubscriptionId(
            invoice.subscription as string
          );
          
          if (existingSubscription) {
            await updateSubscription(existingSubscription.user_id, {
              status: 'past_due',
            });
          }
        }
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook handler error:', error);
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    );
  }
}

// Map Stripe subscription status to our status
function mapStripeStatus(stripeStatus: Stripe.Subscription.Status): 'active' | 'canceled' | 'past_due' | 'trialing' | 'incomplete' {
  switch (stripeStatus) {
    case 'active':
      return 'active';
    case 'canceled':
      return 'canceled';
    case 'past_due':
      return 'past_due';
    case 'trialing':
      return 'trialing';
    case 'incomplete':
    case 'incomplete_expired':
      return 'incomplete';
    default:
      return 'canceled';
  }
}