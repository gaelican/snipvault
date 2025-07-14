import { NextRequest, NextResponse } from 'next/server';

// Logging middleware
export function withLogging(
  handler: (req: NextRequest, ...args: any[]) => Promise<NextResponse>
) {
  return async (req: NextRequest, ...args: any[]) => {
    const start = Date.now();
    const method = req.method;
    const url = new URL(req.url);
    const path = url.pathname;

    try {
      const response = await handler(req, ...args);
      const duration = Date.now() - start;
      
      console.log(`${method} ${path} - ${response.status} - ${duration}ms`);
      
      return response;
    } catch (error) {
      const duration = Date.now() - start;
      console.error(`${method} ${path} - ERROR - ${duration}ms`, error);
      throw error;
    }
  };
}

// CORS middleware
export function withCORS(
  handler: (req: NextRequest, ...args: any[]) => Promise<NextResponse>
) {
  return async (req: NextRequest, ...args: any[]) => {
    // Handle preflight requests
    if (req.method === 'OPTIONS') {
      return new NextResponse(null, {
        status: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
          'Access-Control-Max-Age': '86400',
        },
      });
    }

    const response = await handler(req, ...args);
    
    // Add CORS headers to response
    response.headers.set('Access-Control-Allow-Origin', '*');
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    return response;
  };
}

// Request validation middleware
export function withValidation<T>(
  schema: { parse: (data: any) => T },
  source: 'body' | 'query' = 'body'
) {
  return (
    handler: (req: NextRequest & { validated: T }, ...args: any[]) => Promise<NextResponse>
  ) => {
    return async (req: NextRequest, ...args: any[]) => {
      try {
        let data: any;
        
        if (source === 'body') {
          data = await req.json();
        } else {
          const url = new URL(req.url);
          data = Object.fromEntries(url.searchParams);
        }
        
        const validated = schema.parse(data);
        (req as any).validated = validated;
        
        return handler(req as NextRequest & { validated: T }, ...args);
      } catch (error) {
        return NextResponse.json(
          { error: 'Validation failed', details: error },
          { status: 400 }
        );
      }
    };
  };
}

// Combine multiple middleware
export function compose(...middleware: Function[]) {
  return (handler: Function) => {
    return middleware.reduceRight((acc, fn) => fn(acc), handler);
  };
}