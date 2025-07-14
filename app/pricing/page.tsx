'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { STRIPE_CONFIG, formatPrice, getPlanPrice } from '@/lib/stripe/client';
import { toast } from 'sonner';

export default function PricingPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState<string | null>(null);

  // Check for success or canceled in URL params
  if (searchParams.get('canceled') === 'true') {
    toast.error('Payment canceled');
  }

  const handleSubscribe = async (plan: 'individual' | 'team') => {
    try {
      setLoading(plan);
      
      const priceId = STRIPE_CONFIG.prices[plan];
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          priceId,
          plan,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create checkout session');
      }

      const { url } = await response.json();
      
      // Redirect to Stripe Checkout
      window.location.href = url;
    } catch (error) {
      console.error('Subscription error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to start subscription');
    } finally {
      setLoading(null);
    }
  };

  const plans = [
    {
      id: 'free',
      name: 'Free',
      description: 'Get started with basic features',
      price: 0,
      features: STRIPE_CONFIG.products.free.features,
      limitations: [
        'Limited to 10 snippets',
        'No AI features',
        'No private snippets',
        'No team features',
      ],
      cta: 'Current Plan',
      disabled: true,
    },
    {
      id: 'individual',
      name: 'Individual',
      description: 'Perfect for developers and individuals',
      price: getPlanPrice('individual'),
      features: STRIPE_CONFIG.products.individual.features,
      limitations: [
        'No team features',
        'Limited to 100 AI generations/month',
      ],
      cta: 'Start Free Trial',
      disabled: false,
      popular: true,
    },
    {
      id: 'team',
      name: 'Team',
      description: 'Collaborate with your team',
      price: getPlanPrice('team'),
      features: STRIPE_CONFIG.products.team.features,
      limitations: [],
      cta: 'Start Free Trial',
      disabled: false,
    },
  ];

  return (
    <div className="container max-w-7xl mx-auto py-16 px-4">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">Choose Your Plan</h1>
        <p className="text-xl text-muted-foreground">
          Start with a {STRIPE_CONFIG.trialPeriodDays}-day free trial. No credit card required.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {plans.map((plan) => (
          <Card
            key={plan.id}
            className={`relative p-8 ${
              plan.popular ? 'border-primary shadow-lg' : ''
            }`}
          >
            {plan.popular && (
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <span className="bg-primary text-primary-foreground px-3 py-1 rounded-full text-sm font-medium">
                  Most Popular
                </span>
              </div>
            )}

            <div className="mb-8">
              <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
              <p className="text-muted-foreground mb-4">{plan.description}</p>
              <div className="mb-6">
                <span className="text-4xl font-bold">
                  {formatPrice(plan.price)}
                </span>
                {plan.price > 0 && (
                  <span className="text-muted-foreground">/month</span>
                )}
              </div>
            </div>

            <div className="space-y-4 mb-8">
              <div className="space-y-2">
                {plan.features.map((feature, index) => (
                  <div key={index} className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <span className="text-sm">{feature}</span>
                  </div>
                ))}
              </div>

              {plan.limitations.length > 0 && (
                <div className="space-y-2 pt-4 border-t">
                  {plan.limitations.map((limitation, index) => (
                    <div key={index} className="flex items-start gap-2">
                      <X className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-muted-foreground">
                        {limitation}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <Button
              className="w-full"
              size="lg"
              variant={plan.popular ? 'default' : 'outline'}
              disabled={plan.disabled || loading !== null}
              onClick={() => {
                if (plan.id !== 'free') {
                  handleSubscribe(plan.id as 'individual' | 'team');
                }
              }}
            >
              {loading === plan.id ? 'Processing...' : plan.cta}
            </Button>
          </Card>
        ))}
      </div>

      <div className="mt-16 text-center">
        <h2 className="text-2xl font-bold mb-8">Frequently Asked Questions</h2>
        <div className="max-w-3xl mx-auto space-y-6">
          <div className="text-left">
            <h3 className="font-semibold mb-2">
              Can I change my plan later?
            </h3>
            <p className="text-muted-foreground">
              Yes, you can upgrade or downgrade your plan at any time. Changes will be prorated.
            </p>
          </div>
          <div className="text-left">
            <h3 className="font-semibold mb-2">
              What happens when I reach my AI generation limit?
            </h3>
            <p className="text-muted-foreground">
              You'll need to wait until the next billing cycle or upgrade to a higher plan for more generations.
            </p>
          </div>
          <div className="text-left">
            <h3 className="font-semibold mb-2">
              Do you offer refunds?
            </h3>
            <p className="text-muted-foreground">
              We offer a {STRIPE_CONFIG.trialPeriodDays}-day free trial. You can cancel anytime during the trial without being charged.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}