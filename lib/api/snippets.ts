import type { 
  Snippet, 
  SnippetVersion,
  CreateSnippetInput, 
  UpdateSnippetInput, 
  SnippetFilters,
  PaginationParams,
  PaginatedResponse
} from '@/lib/types/snippet';

const API_BASE = '/api/snippets';

interface ApiOptions {
  token?: string;
}

async function fetchAPI<T>(
  endpoint: string,
  options: RequestInit & ApiOptions = {}
): Promise<T> {
  const { token, ...fetchOptions } = options;
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...fetchOptions.headers
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  const response = await fetch(endpoint, {
    ...fetchOptions,
    headers
  });
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(error.error || `API Error: ${response.status}`);
  }
  
  return response.json();
}

// List snippets with pagination and filtering
export async function listSnippets(
  params?: PaginationParams & SnippetFilters,
  options?: ApiOptions
): Promise<PaginatedResponse<Snippet>> {
  const searchParams = new URLSearchParams();
  
  if (params) {
    if (params.page) searchParams.set('page', params.page.toString());
    if (params.limit) searchParams.set('limit', params.limit.toString());
    if (params.sortBy) searchParams.set('sortBy', params.sortBy);
    if (params.sortOrder) searchParams.set('sortOrder', params.sortOrder);
    if (params.tags?.length) searchParams.set('tags', params.tags.join(','));
    if (params.language) searchParams.set('language', params.language);
    if (params.visibility) searchParams.set('visibility', params.visibility);
    if (params.authorId) searchParams.set('authorId', params.authorId);
    if (params.includeDeleted) searchParams.set('includeDeleted', 'true');
  }
  
  return fetchAPI<PaginatedResponse<Snippet>>(
    `${API_BASE}?${searchParams}`,
    options
  );
}

// Get a single snippet
export async function getSnippet(
  id: string,
  options?: ApiOptions
): Promise<Snippet> {
  return fetchAPI<Snippet>(`${API_BASE}/${id}`, options);
}

// Create a new snippet
export async function createSnippet(
  input: CreateSnippetInput,
  options?: ApiOptions
): Promise<Snippet> {
  return fetchAPI<Snippet>(API_BASE, {
    method: 'POST',
    body: JSON.stringify(input),
    ...options
  });
}

// Update a snippet
export async function updateSnippet(
  id: string,
  input: UpdateSnippetInput,
  options?: ApiOptions
): Promise<Snippet> {
  return fetchAPI<Snippet>(`${API_BASE}/${id}`, {
    method: 'PUT',
    body: JSON.stringify(input),
    ...options
  });
}

// Delete a snippet
export async function deleteSnippet(
  id: string,
  options?: ApiOptions
): Promise<{ message: string }> {
  return fetchAPI<{ message: string }>(`${API_BASE}/${id}`, {
    method: 'DELETE',
    ...options
  });
}

// Search snippets
export async function searchSnippets(
  query: string,
  params?: PaginationParams & SnippetFilters,
  options?: ApiOptions
): Promise<PaginatedResponse<Snippet & { highlights?: string[] }>> {
  const searchParams = new URLSearchParams();
  searchParams.set('q', query);
  
  if (params) {
    if (params.page) searchParams.set('page', params.page.toString());
    if (params.limit) searchParams.set('limit', params.limit.toString());
    if (params.sortBy) searchParams.set('sortBy', params.sortBy);
    if (params.sortOrder) searchParams.set('sortOrder', params.sortOrder);
    if (params.tags?.length) searchParams.set('tags', params.tags.join(','));
    if (params.language) searchParams.set('language', params.language);
    if (params.visibility) searchParams.set('visibility', params.visibility);
    if (params.authorId) searchParams.set('authorId', params.authorId);
  }
  
  return fetchAPI<PaginatedResponse<Snippet & { highlights?: string[] }>>(
    `${API_BASE}/search?${searchParams}`,
    options
  );
}

// Get version history for a snippet
export async function getSnippetVersions(
  id: string,
  options?: ApiOptions
): Promise<{
  snippetId: string;
  currentVersion: number;
  versions: SnippetVersion[];
}> {
  return fetchAPI(`${API_BASE}/${id}/versions`, options);
}

// Helper function to build snippet URL
export function getSnippetUrl(snippet: Snippet): string {
  return `/snippets/${snippet.id}`;
}

// Helper function to build embed URL
export function getSnippetEmbedUrl(snippet: Snippet): string {
  return `/embed/${snippet.id}`;
}

// Helper function to build raw content URL
export function getSnippetRawUrl(snippet: Snippet): string {
  return `${API_BASE}/${snippet.id}/raw`;
}