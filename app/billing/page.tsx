'use client';

import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { SubscriptionStatus } from '@/components/billing/SubscriptionStatus';
import { UsageStats } from '@/components/billing/UsageStats';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function BillingPage() {
  const searchParams = useSearchParams();

  useEffect(() => {
    // Check for success message
    if (searchParams.get('success') === 'true') {
      toast.success('Subscription activated successfully!');
    }
  }, [searchParams]);

  return (
    <div className="container max-w-4xl mx-auto py-8 px-4">
      <div className="mb-8">
        <Link href="/">
          <Button variant="ghost" size="sm" className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
        </Link>
        
        <h1 className="text-3xl font-bold">Billing & Subscription</h1>
        <p className="text-muted-foreground mt-2">
          Manage your subscription, payment methods, and billing history
        </p>
      </div>

      <div className="space-y-8">
        <SubscriptionStatus />
        
        <UsageStats />

        <Card>
          <CardHeader>
            <CardTitle>Billing Information</CardTitle>
            <CardDescription>
              View and manage your billing details
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-sm text-muted-foreground">
              <p>
                All billing is handled securely through Stripe. You can manage your payment methods,
                download invoices, and update your billing information through the customer portal.
              </p>
            </div>
            
            <div className="pt-4">
              <h4 className="font-semibold mb-2">Need Help?</h4>
              <p className="text-sm text-muted-foreground mb-4">
                If you have any questions about billing or need assistance with your subscription,
                please don't hesitate to reach out.
              </p>
              <Button variant="outline" asChild>
                <Link href="mailto:support@snipvault.com">
                  Contact Support
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Upgrade Your Plan</CardTitle>
            <CardDescription>
              Get more features and higher limits
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Need more snippets, AI generations, or team features? Check out our pricing plans
              to find the perfect fit for your needs.
            </p>
            <Button asChild>
              <Link href="/pricing">
                View Pricing Plans
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}