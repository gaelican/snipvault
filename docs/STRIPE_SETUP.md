# Stripe Payment System Setup

This guide walks you through setting up the Stripe payment system for SnipVault.

## Prerequisites

1. A Stripe account (sign up at https://stripe.com)
2. Supabase project with authentication configured
3. Environment variables configured

## Setup Steps

### 1. Configure Stripe Dashboard

1. Log in to your [Stripe Dashboard](https://dashboard.stripe.com)
2. Create products and prices:
   
   **Individual Plan**
   - Product Name: "SnipVault Individual"
   - Price: $9.00/month
   - Billing: Recurring monthly
   - Save the price ID (starts with `price_`)

   **Team Plan**
   - Product Name: "SnipVault Team"
   - Price: $19.00/month
   - Billing: Recurring monthly
   - Save the price ID (starts with `price_`)

3. Configure Customer Portal:
   - Go to Settings → Billing → Customer portal
   - Enable customer portal
   - Configure branding and features
   - Allow customers to:
     - Update payment methods
     - Cancel subscriptions
     - Download invoices
     - Update billing address

4. Set up Webhooks:
   - Go to Developers → Webhooks
   - Add endpoint: `https://your-domain.com/api/stripe/webhook`
   - Select events:
     - `checkout.session.completed`
     - `customer.subscription.created`
     - `customer.subscription.updated`
     - `customer.subscription.deleted`
     - `invoice.payment_succeeded`
     - `invoice.payment_failed`
   - Save the webhook secret (starts with `whsec_`)

### 2. Environment Variables

Add these to your `.env.local` file:

```env
# Stripe Keys
STRIPE_SECRET_KEY=sk_test_... # From API keys section
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_... # From API keys section
STRIPE_WEBHOOK_SECRET=whsec_... # From webhook endpoint

# Price IDs
NEXT_PUBLIC_STRIPE_INDIVIDUAL_PRICE_ID=price_... # Individual plan price ID
NEXT_PUBLIC_STRIPE_TEAM_PRICE_ID=price_... # Team plan price ID
```

### 3. Database Setup

Run the SQL migrations in your Supabase dashboard:

1. Execute `/lib/supabase/schema.sql` (if not already done)
2. Execute `/lib/supabase/migrations/002_usage_records.sql`

### 4. Test the Integration

1. Use Stripe's test cards:
   - Success: `4242 4242 4242 4242`
   - Decline: `4000 0000 0000 0002`
   - Requires auth: `4000 0025 0000 3155`

2. Test webhook events using Stripe CLI:
   ```bash
   stripe listen --forward-to localhost:3000/api/stripe/webhook
   ```

## Features Implemented

### Subscription Plans

1. **Free Plan**
   - 10 public snippets
   - Basic features
   - No AI generations

2. **Individual Plan ($9/month)**
   - Unlimited snippets
   - Private snippets
   - 100 AI generations/month
   - Version history
   - Export functionality

3. **Team Plan ($19/month)**
   - Everything in Individual
   - Unlimited team members
   - 500 AI generations/month
   - Team collaboration
   - Admin controls
   - API access

### User Flows

1. **Subscription Purchase**
   - User visits `/pricing`
   - Clicks "Start Free Trial"
   - Redirected to Stripe Checkout
   - After payment, redirected to `/billing?success=true`
   - Webhook updates subscription in database

2. **Subscription Management**
   - User visits `/billing`
   - Views current plan and usage
   - Clicks "Manage Subscription"
   - Redirected to Stripe Customer Portal
   - Can update payment method, cancel, etc.

### Usage Tracking

- AI generations tracked per month
- Usage resets on billing cycle
- Limits enforced via middleware
- Real-time usage display in billing page

### API Protection

Use the subscription middleware to protect premium features:

```typescript
import { checkSubscriptionAccess, createSubscriptionError } from '@/lib/middleware/subscription-middleware';

export async function POST(request: NextRequest) {
  // Check if user can use AI features
  const check = await checkSubscriptionAccess(request, 'aiGenerations');
  
  if (!check.hasAccess) {
    return createSubscriptionError(check);
  }
  
  // Increment usage after successful generation
  await incrementUsage(user.id, 'ai_generation');
  
  // ... rest of your API logic
}
```

## Troubleshooting

### Common Issues

1. **Webhook signature verification fails**
   - Ensure webhook secret is correct
   - Check that raw body is used for verification
   - Verify webhook endpoint URL matches

2. **Subscription not updating**
   - Check webhook logs in Stripe dashboard
   - Verify database permissions
   - Check error logs

3. **Customer portal not loading**
   - Ensure customer portal is enabled in Stripe
   - Check that user has stripe_customer_id

## Production Checklist

- [ ] Switch to live Stripe keys
- [ ] Update webhook endpoint to production URL
- [ ] Test with real payment methods
- [ ] Set up monitoring and alerts
- [ ] Configure tax settings if needed
- [ ] Set up email receipts
- [ ] Review and test refund process
- [ ] Document support procedures