import { NextResponse } from 'next/server';
import { ZodError } from 'zod';

export class ApiError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public details?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export function errorResponse(error: unknown): NextResponse {
  console.error('API Error:', error);

  if (error instanceof ApiError) {
    return NextResponse.json(
      {
        error: error.message,
        details: error.details
      },
      { status: error.statusCode }
    );
  }

  if (error instanceof ZodError) {
    return NextResponse.json(
      {
        error: 'Validation failed',
        details: error.errors
      },
      { status: 400 }
    );
  }

  if (error instanceof Error) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    if (error.message.startsWith('Forbidden')) {
      return NextResponse.json(
        { error: error.message },
        { status: 403 }
      );
    }
  }

  return NextResponse.json(
    { error: 'Internal server error' },
    { status: 500 }
  );
}

export function successResponse<T>(data: T, status = 200): NextResponse {
  return NextResponse.json(data, { status });
}

export function parseSearchParams(searchParams: URLSearchParams) {
  const page = parseInt(searchParams.get('page') || '1', 10);
  const limit = Math.min(parseInt(searchParams.get('limit') || '20', 10), 100);
  const sortBy = searchParams.get('sortBy') as 'created_at' | 'updated_at' | 'popularity' | null;
  const sortOrder = searchParams.get('sortOrder') as 'asc' | 'desc' | null;
  
  return {
    page: Math.max(1, page),
    limit: Math.max(1, limit),
    sortBy: sortBy || 'created_at',
    sortOrder: sortOrder || 'desc'
  };
}

export function parseFilters(searchParams: URLSearchParams) {
  const tags = searchParams.get('tags')?.split(',').filter(Boolean) || undefined;
  const language = searchParams.get('language') || undefined;
  const visibility = searchParams.get('visibility') as 'public' | 'private' | 'unlisted' | 'team' | undefined;
  const authorId = searchParams.get('authorId') || undefined;
  const teamId = searchParams.get('teamId') || undefined;
  const includeDeleted = searchParams.get('includeDeleted') === 'true';

  return {
    tags,
    language,
    visibility,
    authorId,
    teamId,
    includeDeleted
  };
}

// Rate limiting helper
const requestCounts = new Map<string, { count: number; resetTime: number }>();

export function checkRateLimit(
  identifier: string,
  limit: number = 60,
  windowMs: number = 60000
): boolean {
  const now = Date.now();
  const userLimit = requestCounts.get(identifier);

  if (!userLimit || now > userLimit.resetTime) {
    requestCounts.set(identifier, {
      count: 1,
      resetTime: now + windowMs
    });
    return true;
  }

  if (userLimit.count >= limit) {
    return false;
  }

  userLimit.count++;
  return true;
}

// Clean up old rate limit entries periodically
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of requestCounts.entries()) {
    if (now > value.resetTime) {
      requestCounts.delete(key);
    }
  }
}, 60000); // Clean up every minute