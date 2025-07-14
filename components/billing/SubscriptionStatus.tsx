'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Subscription } from '@/lib/supabase/types';
import { STRIPE_CONFIG, formatPrice } from '@/lib/stripe/client';
import { Loader2, CreditCard, Calendar, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

export function SubscriptionStatus() {
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [portalLoading, setPortalLoading] = useState(false);

  useEffect(() => {
    loadSubscription();
  }, []);

  const loadSubscription = async () => {
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setLoading(false);
        return;
      }

      const { data } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .single();

      setSubscription(data);
    } catch (error) {
      console.error('Error loading subscription:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleManageSubscription = async () => {
    try {
      setPortalLoading(true);
      
      const response = await fetch('/api/stripe/portal', {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Failed to create portal session');
      }

      const { url } = await response.json();
      window.location.href = url;
    } catch (error) {
      console.error('Portal error:', error);
      toast.error('Failed to open billing portal');
    } finally {
      setPortalLoading(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  if (!subscription) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>No Subscription</CardTitle>
          <CardDescription>
            You don't have an active subscription
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const planConfig = STRIPE_CONFIG.products[subscription.plan];
  const statusColors = {
    active: 'default',
    canceled: 'destructive',
    past_due: 'destructive',
    trialing: 'secondary',
    incomplete: 'secondary',
  } as const;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Subscription Status</CardTitle>
            <CardDescription>
              Manage your subscription and billing
            </CardDescription>
          </div>
          <Badge variant={statusColors[subscription.status]}>
            {subscription.status}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <CreditCard className="h-4 w-4" />
              Current Plan
            </div>
            <div className="font-semibold text-lg">
              {planConfig.name}
              {subscription.plan !== 'free' && (
                <span className="text-sm font-normal text-muted-foreground ml-2">
                  ({formatPrice(subscription.plan === 'individual' ? 900 : 1900)}/month)
                </span>
              )}
            </div>
          </div>

          {subscription.current_period_end && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                {subscription.status === 'trialing' ? 'Trial Ends' : 'Next Billing Date'}
              </div>
              <div className="font-semibold">
                {new Date(subscription.current_period_end).toLocaleDateString()}
              </div>
            </div>
          )}
        </div>

        {subscription.status === 'past_due' && (
          <div className="flex items-start gap-2 p-4 bg-destructive/10 rounded-lg">
            <AlertCircle className="h-5 w-5 text-destructive mt-0.5" />
            <div className="flex-1">
              <p className="font-semibold text-destructive">Payment Failed</p>
              <p className="text-sm text-muted-foreground">
                Please update your payment method to continue using premium features.
              </p>
            </div>
          </div>
        )}

        {subscription.cancel_at && (
          <div className="flex items-start gap-2 p-4 bg-muted rounded-lg">
            <AlertCircle className="h-5 w-5 text-muted-foreground mt-0.5" />
            <div className="flex-1">
              <p className="font-semibold">Subscription Ending</p>
              <p className="text-sm text-muted-foreground">
                Your subscription will end on {new Date(subscription.cancel_at).toLocaleDateString()}
              </p>
            </div>
          </div>
        )}

        <div className="space-y-4">
          <div>
            <h4 className="font-semibold mb-2">Plan Features</h4>
            <ul className="space-y-1 text-sm text-muted-foreground">
              {planConfig.features.slice(0, 5).map((feature, index) => (
                <li key={index}>• {feature}</li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-2">Usage Limits</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Snippets</span>
                <span className="font-medium">
                  {planConfig.limits.snippets === -1 ? 'Unlimited' : planConfig.limits.snippets}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">AI Generations</span>
                <span className="font-medium">
                  {planConfig.limits.aiGenerations === 0 
                    ? 'Not available' 
                    : `${planConfig.limits.aiGenerations}/month`}
                </span>
              </div>
              {subscription.plan === 'team' && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Team Members</span>
                  <span className="font-medium">Unlimited</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {subscription.plan !== 'free' && subscription.stripe_customer_id && (
          <Button
            onClick={handleManageSubscription}
            disabled={portalLoading}
            className="w-full"
            variant="outline"
          >
            {portalLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Loading...
              </>
            ) : (
              'Manage Subscription'
            )}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}