import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth';
import { 
  errorResponse, 
  successResponse, 
  parseSearchParams, 
  parseFilters,
  checkRateLimit,
  ApiError
} from '@/lib/api-utils';
import { searchQuerySchema } from '@/lib/validations/snippet';
import { searchSnippets } from '@/lib/db/snippets';
import type { SnippetFilters } from '@/lib/types/snippet';

// GET /api/snippets/search - Full-text search with highlighting
export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    const { searchParams } = new URL(request.url);
    
    // Rate limiting for search
    const clientIp = request.headers.get('x-forwarded-for') || 'anonymous';
    const rateLimitKey = `search_${clientIp}`;
    if (!checkRateLimit(rateLimitKey, 30, 60000)) { // 30 searches per minute
      throw new ApiError(429, 'Too many search requests. Please try again later.');
    }
    
    // Validate search query
    const query = searchParams.get('q') || searchParams.get('query') || '';
    const { query: validatedQuery } = searchQuerySchema.parse({ query });
    
    // Parse pagination and filters
    const pagination = parseSearchParams(searchParams);
    const filters = parseFilters(searchParams);
    
    // Apply visibility restrictions based on auth
    const effectiveFilters: SnippetFilters = {
      ...filters,
      // If not authenticated, only search public snippets
      visibility: !user && !filters.visibility ? 'public' : filters.visibility
    };
    
    // If searching in a specific user's snippets, ensure proper access
    if (filters.authorId && filters.authorId !== user?.id && user?.role !== 'admin') {
      // Only search public snippets for other users
      effectiveFilters.visibility = 'public';
    }
    
    const result = await searchSnippets(validatedQuery, effectiveFilters, pagination);
    
    return successResponse(result);
  } catch (error) {
    return errorResponse(error);
  }
}