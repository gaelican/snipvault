import { NextRequest, NextResponse } from 'next/server';
import { checkRateLimit, getUserIdFromRequest } from './openai';

export function withAIRateLimit(
  handler: (req: NextRequest, ...args: any[]) => Promise<NextResponse>
) {
  return async (req: NextRequest, ...args: any[]) => {
    // Get user ID from request
    const userId = await getUserIdFromRequest(req);
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Check rate limit
    const rateLimit = checkRateLimit(userId);
    
    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          error: 'Rate limit exceeded',
          retryAfter: Math.ceil(rateLimit.resetIn / 1000),
        },
        {
          status: 429,
          headers: {
            'X-RateLimit-Limit': '5',
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': new Date(Date.now() + rateLimit.resetIn).toISOString(),
            'Retry-After': Math.ceil(rateLimit.resetIn / 1000).toString(),
          },
        }
      );
    }

    // Add rate limit headers to successful responses
    const response = await handler(req, ...args);
    
    response.headers.set('X-RateLimit-Limit', '5');
    response.headers.set('X-RateLimit-Remaining', rateLimit.remaining.toString());
    response.headers.set(
      'X-RateLimit-Reset',
      new Date(Date.now() + rateLimit.resetIn).toISOString()
    );
    
    return response;
  };
}