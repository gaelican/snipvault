import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser, canAccessSnippet } from '@/lib/auth';
import { 
  errorResponse, 
  successResponse,
  ApiError
} from '@/lib/api-utils';
import { getSnippet, getSnippetVersions } from '@/lib/db/snippets';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET /api/snippets/[id]/versions - Get version history
export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { id } = await params;
    const user = await getAuthUser(request);
    
    // Get the snippet to check permissions
    const snippet = await getSnippet(id);
    if (!snippet) {
      throw new ApiError(404, 'Snippet not found');
    }
    
    // Check access permissions
    if (!canAccessSnippet(user, snippet)) {
      throw new ApiError(403, 'Access denied');
    }
    
    // Get version history
    const versions = await getSnippetVersions(id);
    
    return successResponse({
      snippetId: id,
      currentVersion: snippet.version,
      versions
    });
  } catch (error) {
    return errorResponse(error);
  }
}