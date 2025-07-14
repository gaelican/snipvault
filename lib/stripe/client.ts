import { loadStripe } from '@stripe/stripe-js';

// Initialize Stripe.js with your publishable key
// Make sure to set NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY in your environment variables
const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
);

export default stripePromise;

// Stripe configuration
export const STRIPE_CONFIG = {
  // Price IDs for different plans
  prices: {
    individual: process.env.NEXT_PUBLIC_STRIPE_INDIVIDUAL_PRICE_ID!,
    team: process.env.NEXT_PUBLIC_STRIPE_TEAM_PRICE_ID!,
  },
  
  // Trial period in days
  trialPeriodDays: 14,
  
  // Currency
  currency: 'usd',
  
  // Product metadata
  products: {
    free: {
      name: 'Free',
      description: 'Get started with basic features',
      features: [
        '10 public snippets',
        'Basic syntax highlighting',
        'Search functionality',
        'Public sharing',
      ],
      limits: {
        snippets: 10,
        aiGenerations: 0,
        teamMembers: 0,
      },
    },
    individual: {
      name: 'Individual',
      description: 'Perfect for developers and individuals',
      features: [
        'Unlimited snippets',
        'Private snippets',
        '100 AI generations per month',
        'Advanced search',
        'Version history',
        'Export functionality',
        'Priority support',
      ],
      limits: {
        snippets: -1, // unlimited
        aiGenerations: 100,
        teamMembers: 0,
      },
    },
    team: {
      name: 'Team',
      description: 'Collaborate with your team',
      features: [
        'Everything in Individual',
        'Unlimited team members',
        '500 AI generations per month',
        'Team collaboration',
        'Shared snippets',
        'Admin controls',
        'Analytics dashboard',
        'API access',
        'SSO (coming soon)',
      ],
      limits: {
        snippets: -1, // unlimited
        aiGenerations: 500,
        teamMembers: -1, // unlimited
      },
    },
  },
};

// Helper function to format price
export function formatPrice(amount: number, currency: string = 'usd'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency.toUpperCase(),
    minimumFractionDigits: 0,
  }).format(amount / 100);
}

// Helper function to get price for a plan
export function getPlanPrice(plan: 'individual' | 'team'): number {
  switch (plan) {
    case 'individual':
      return 900; // $9.00
    case 'team':
      return 1900; // $19.00
    default:
      return 0;
  }
}