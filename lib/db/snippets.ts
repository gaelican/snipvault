// Stub for database operations - using Firebase instead
// These functions exist to prevent build errors during static export

export interface Snippet {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  code: string;
  language: string;
  tags: string[];
  visibility: 'private' | 'public' | 'unlisted' | 'team';
  team_id?: string;
  created_at: string;
  updated_at: string;
  view_count?: number;
  like_count?: number;
}

export async function createSnippet(userId: string, input: any): Promise<Snippet | null> {
  console.warn('Using Firebase for snippet creation');
  return null;
}

export async function updateSnippet(snippetId: string, userId: string, input: any): Promise<Snippet | null> {
  console.warn('Using Firebase for snippet update');
  return null;
}

export async function deleteSnippet(snippetId: string, userId: string): Promise<boolean> {
  console.warn('Using Firebase for snippet deletion');
  return false;
}

export async function getSnippet(snippetId: string): Promise<Snippet | null> {
  console.warn('Using Firebase for snippet retrieval');
  return null;
}

export async function listSnippets(filters?: any): Promise<{ snippets: Snippet[], total: number }> {
  console.warn('Using Firebase for snippet listing');
  return { snippets: [], total: 0 };
}

export async function incrementViewCount(snippetId: string): Promise<void> {
  console.warn('Using Firebase for view count');
}

export async function searchSnippets(query: string, filters?: any): Promise<{ snippets: Snippet[], total: number }> {
  console.warn('Using Firebase for snippet search');
  return { snippets: [], total: 0 };
}

export async function createSnippetVersion(snippetId: string, userId: string, data: any): Promise<void> {
  console.warn('Using Firebase for version creation');
}

export async function getSnippetVersions(snippetId: string): Promise<any[]> {
  console.warn('Using Firebase for version history');
  return [];
}