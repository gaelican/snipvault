import { useState, useCallback } from 'react';
import { useAuth } from '@/app/providers';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { loadStripe } from '@stripe/stripe-js';
import { toast } from 'sonner';

// Initialize Stripe
const stripePromise = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
  ? loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY)
  : null;

interface CreateCheckoutSessionParams {
  priceId: string;
  successUrl?: string;
  cancelUrl?: string;
}

interface CreatePortalSessionParams {
  returnUrl?: string;
}

export function useBilling() {
  const { user, profile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createCheckoutSession = useCallback(
    async (params: CreateCheckoutSessionParams) => {
      if (!user) {
        toast.error('You must be logged in to subscribe');
        return;
      }

      if (!stripePromise) {
        toast.error('Stripe is not configured');
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // In production, call Firebase Function to create checkout session
        if (process.env.NODE_ENV === 'production' && process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID) {
          const functions = getFunctions();
          const createCheckout = httpsCallable(functions, 'createCheckoutSession');
          const { data } = await createCheckout({
            ...params,
            successUrl: params.successUrl || `${window.location.origin}/billing?success=true`,
            cancelUrl: params.cancelUrl || `${window.location.origin}/billing?canceled=true`,
          });

          // Redirect to Stripe Checkout
          const stripe = await stripePromise;
          const result = await stripe!.redirectToCheckout({
            sessionId: (data as any).sessionId,
          });

          if (result.error) {
            throw new Error(result.error.message);
          }
        } else {
          // Mock for development
          toast.info('Stripe checkout would open in production');
          console.log('Create checkout session with params:', params);
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to create checkout session';
        setError(message);
        toast.error(message);
      } finally {
        setLoading(false);
      }
    },
    [user]
  );

  const createPortalSession = useCallback(
    async (params?: CreatePortalSessionParams) => {
      if (!user) {
        toast.error('You must be logged in to manage billing');
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // In production, call Firebase Function to create portal session
        if (process.env.NODE_ENV === 'production' && process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID) {
          const functions = getFunctions();
          const createPortal = httpsCallable(functions, 'createPortalSession');
          const { data } = await createPortal({
            returnUrl: params?.returnUrl || window.location.href,
          });

          // Redirect to Stripe Customer Portal
          window.location.href = (data as any).url;
        } else {
          // Mock for development
          toast.info('Stripe customer portal would open in production');
          console.log('Create portal session with params:', params);
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to open billing portal';
        setError(message);
        toast.error(message);
      } finally {
        setLoading(false);
      }
    },
    [user]
  );

  const cancelSubscription = useCallback(
    async () => {
      if (!user) {
        toast.error('You must be logged in to cancel subscription');
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // In production, this would be handled through Stripe Customer Portal
        await createPortalSession();
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to cancel subscription';
        setError(message);
        toast.error(message);
      } finally {
        setLoading(false);
      }
    },
    [user, createPortalSession]
  );

  return {
    createCheckoutSession,
    createPortalSession,
    cancelSubscription,
    loading,
    error,
    subscription: profile?.subscription,
  };
}

// Pricing data (in production, this might come from Firestore or be hardcoded)
export const PRICING_PLANS = [
  {
    id: 'free',
    name: 'Free',
    description: 'Perfect for trying out SnipVault',
    price: 0,
    currency: 'USD',
    interval: null,
    features: [
      'Up to 10 snippets',
      'Basic syntax highlighting',
      'Public sharing',
      'Community support',
    ],
    limitations: [
      'No private snippets',
      'No team collaboration',
      'Limited AI features (10/month)',
    ],
  },
  {
    id: 'individual',
    name: 'Individual',
    description: 'For developers who need more',
    price: 9,
    currency: 'USD',
    interval: 'month',
    priceId: process.env.NEXT_PUBLIC_STRIPE_INDIVIDUAL_PRICE_ID,
    features: [
      'Unlimited snippets',
      'Private snippets',
      'Advanced search',
      'AI features (100/month)',
      'Priority support',
      'Version history',
    ],
    limitations: [
      'No team features',
    ],
    popular: true,
  },
  {
    id: 'team',
    name: 'Team',
    description: 'For teams and organizations',
    price: 29,
    currency: 'USD',
    interval: 'month',
    priceId: process.env.NEXT_PUBLIC_STRIPE_TEAM_PRICE_ID,
    features: [
      'Everything in Individual',
      'Unlimited team members',
      'Team collaboration',
      'Shared snippets library',
      'AI features (1000/month)',
      'Admin controls',
      'Analytics',
      'SSO (coming soon)',
    ],
    limitations: [],
  },
];