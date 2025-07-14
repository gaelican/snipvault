import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser, requireAuth, canAccessSnippet } from '@/lib/auth';
import { 
  errorResponse, 
  successResponse,
  checkRateLimit,
  ApiError
} from '@/lib/api-utils';
import { updateSnippetSchema } from '@/lib/validations/snippet';
import { 
  getSnippet, 
  updateSnippet, 
  deleteSnippet,
  incrementViewCount
} from '@/lib/db/snippets';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET /api/snippets/[id] - Get a single snippet
export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { id } = await params;
    const user = await getAuthUser(request);
    
    const snippet = await getSnippet(id);
    if (!snippet) {
      throw new ApiError(404, 'Snippet not found');
    }
    
    // Check access permissions
    if (!canAccessSnippet(user, snippet)) {
      throw new ApiError(403, 'Access denied');
    }
    
    // Increment view count for public snippets
    if (snippet.visibility === 'public') {
      await incrementViewCount(id);
    }
    
    return successResponse(snippet);
  } catch (error) {
    return errorResponse(error);
  }
}

// PUT /api/snippets/[id] - Update a snippet
export async function PUT(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { id } = await params;
    const user = await getAuthUser(request);
    requireAuth(user);
    
    // Get the snippet to check ownership
    const snippet = await getSnippet(id);
    if (!snippet) {
      throw new ApiError(404, 'Snippet not found');
    }
    
    // Check if user owns the snippet or is admin
    if (snippet.authorId !== user.id && user.role !== 'admin') {
      throw new ApiError(403, 'You can only edit your own snippets');
    }
    
    // Rate limiting
    const rateLimitKey = `update_snippet_${user.id}`;
    if (!checkRateLimit(rateLimitKey, 60, 3600000)) { // 60 updates per hour
      throw new ApiError(429, 'Rate limit exceeded. Please try again later.');
    }
    
    const body = await request.json();
    const validatedData = updateSnippetSchema.parse(body);
    
    const updatedSnippet = await updateSnippet(id, validatedData, user.id);
    if (!updatedSnippet) {
      throw new ApiError(500, 'Failed to update snippet');
    }
    
    return successResponse(updatedSnippet);
  } catch (error) {
    return errorResponse(error);
  }
}

// DELETE /api/snippets/[id] - Soft delete a snippet
export async function DELETE(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { id } = await params;
    const user = await getAuthUser(request);
    requireAuth(user);
    
    // Get the snippet to check ownership
    const snippet = await getSnippet(id);
    if (!snippet) {
      throw new ApiError(404, 'Snippet not found');
    }
    
    // Check if user owns the snippet or is admin
    if (snippet.authorId !== user.id && user.role !== 'admin') {
      throw new ApiError(403, 'You can only delete your own snippets');
    }
    
    const success = await deleteSnippet(id);
    if (!success) {
      throw new ApiError(500, 'Failed to delete snippet');
    }
    
    return successResponse({ message: 'Snippet deleted successfully' });
  } catch (error) {
    return errorResponse(error);
  }
}