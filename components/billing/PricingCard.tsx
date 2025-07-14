import { Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatPrice } from '@/lib/stripe/client';

interface PricingCardProps {
  name: string;
  description: string;
  price: number;
  currency?: string;
  interval?: 'month' | 'year';
  features: string[];
  limitations?: string[];
  popular?: boolean;
  disabled?: boolean;
  loading?: boolean;
  ctaText: string;
  onSubscribe?: () => void;
}

export function PricingCard({
  name,
  description,
  price,
  currency = 'usd',
  interval = 'month',
  features,
  limitations = [],
  popular = false,
  disabled = false,
  loading = false,
  ctaText,
  onSubscribe,
}: PricingCardProps) {
  return (
    <Card className={`relative ${popular ? 'border-primary shadow-lg' : ''}`}>
      {popular && (
        <Badge 
          className="absolute -top-3 left-1/2 transform -translate-x-1/2"
          variant="default"
        >
          Most Popular
        </Badge>
      )}
      
      <CardHeader>
        <CardTitle className="text-2xl">{name}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <div>
          <span className="text-4xl font-bold">
            {formatPrice(price, currency)}
          </span>
          {price > 0 && (
            <span className="text-muted-foreground">/{interval}</span>
          )}
        </div>

        <div className="space-y-2">
          {features.map((feature, index) => (
            <div key={index} className="flex items-start gap-2">
              <Check className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
              <span className="text-sm">{feature}</span>
            </div>
          ))}
        </div>

        {limitations.length > 0 && (
          <div className="space-y-2 pt-4 border-t">
            {limitations.map((limitation, index) => (
              <div key={index} className="flex items-start gap-2">
                <X className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                <span className="text-sm text-muted-foreground">
                  {limitation}
                </span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
      
      <CardFooter>
        <Button
          className="w-full"
          size="lg"
          variant={popular ? 'default' : 'outline'}
          disabled={disabled || loading}
          onClick={onSubscribe}
        >
          {loading ? 'Processing...' : ctaText}
        </Button>
      </CardFooter>
    </Card>
  );
}