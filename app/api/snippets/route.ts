import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser, requireAuth } from '@/lib/auth';
import { 
  errorResponse, 
  successResponse, 
  parseSearchParams, 
  parseFilters,
  checkRateLimit,
  ApiError
} from '@/lib/api-utils';
import { createSnippetSchema } from '@/lib/validations/snippet';
import { createSnippet, listSnippets } from '@/lib/db/snippets';
import type { SnippetFilters } from '@/lib/types/snippet';

// GET /api/snippets - List snippets with pagination and filtering
export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    const { searchParams } = new URL(request.url);
    
    // Parse pagination and filters
    const pagination = parseSearchParams(searchParams);
    const filters = parseFilters(searchParams);
    
    // Apply visibility restrictions based on auth
    const effectiveFilters: SnippetFilters = {
      ...filters,
      // If not authenticated, only show public snippets
      visibility: !user && !filters.visibility ? 'public' : filters.visibility
    };
    
    // If filtering by a specific user's snippets, ensure proper access
    if (filters.authorId && filters.authorId !== user?.id && user?.role !== 'admin') {
      // Only show public snippets for other users
      effectiveFilters.visibility = 'public';
    }
    
    const result = await listSnippets(effectiveFilters, pagination);
    
    return successResponse(result);
  } catch (error) {
    return errorResponse(error);
  }
}

// POST /api/snippets - Create a new snippet
export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    requireAuth(user);
    
    // Rate limiting
    const rateLimitKey = `create_snippet_${user.id}`;
    if (!checkRateLimit(rateLimitKey, 30, 3600000)) { // 30 snippets per hour
      throw new ApiError(429, 'Rate limit exceeded. Please try again later.');
    }
    
    const body = await request.json();
    const validatedData = createSnippetSchema.parse(body);
    
    const snippet = await createSnippet(validatedData, user.id);
    
    return successResponse(snippet, 201);
  } catch (error) {
    return errorResponse(error);
  }
}