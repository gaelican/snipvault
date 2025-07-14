import { createClient } from '@/lib/supabase/server'
import type { Snippet, SnippetVersion, SnippetVisibility } from '@/lib/supabase/types'

interface CreateSnippetInput {
  title: string
  description?: string
  code: string
  language: string
  tags?: string[]
  visibility?: SnippetVisibility
  teamId?: string
}

interface UpdateSnippetInput extends Partial<CreateSnippetInput> {
  commitMessage?: string
}

export async function createSnippet(userId: string, input: CreateSnippetInput): Promise<Snippet | null> {
  const supabase = createClient()
  
  const { data, error } = await supabase
    .from('snippets')
    .insert({
      user_id: userId,
      title: input.title,
      description: input.description,
      code: input.code,
      language: input.language,
      tags: input.tags || [],
      visibility: input.visibility || 'private',
      team_id: input.teamId
    })
    .select()
    .single()
  
  if (error) {
    console.error('Error creating snippet:', error)
    return null
  }
  
  // Create initial version
  await createSnippetVersion(data.id, userId, {
    title: data.title,
    description: data.description,
    code: data.code,
    language: data.language,
    tags: data.tags,
    versionNumber: 1,
    commitMessage: 'Initial version'
  })
  
  return data
}

export async function updateSnippet(
  snippetId: string, 
  userId: string, 
  updates: UpdateSnippetInput
): Promise<Snippet | null> {
  const supabase = createClient()
  
  // Get current snippet to create version
  const { data: currentSnippet } = await supabase
    .from('snippets')
    .select('*')
    .eq('id', snippetId)
    .single()
  
  if (!currentSnippet) return null
  
  // Update snippet
  const { data, error } = await supabase
    .from('snippets')
    .update({
      title: updates.title,
      description: updates.description,
      code: updates.code,
      language: updates.language,
      tags: updates.tags,
      visibility: updates.visibility,
      team_id: updates.teamId
    })
    .eq('id', snippetId)
    .select()
    .single()
  
  if (error) {
    console.error('Error updating snippet:', error)
    return null
  }
  
  // Create new version
  const { data: maxVersion } = await supabase
    .from('snippet_versions')
    .select('version_number')
    .eq('snippet_id', snippetId)
    .order('version_number', { ascending: false })
    .limit(1)
    .single()
  
  await createSnippetVersion(snippetId, userId, {
    title: data.title,
    description: data.description,
    code: data.code,
    language: data.language,
    tags: data.tags,
    versionNumber: (maxVersion?.version_number || 0) + 1,
    commitMessage: updates.commitMessage
  })
  
  return data
}

export async function deleteSnippet(snippetId: string): Promise<boolean> {
  const supabase = createClient()
  
  const { error } = await supabase
    .from('snippets')
    .delete()
    .eq('id', snippetId)
  
  if (error) {
    console.error('Error deleting snippet:', error)
    return false
  }
  
  return true
}

export async function getSnippet(snippetId: string): Promise<Snippet | null> {
  const supabase = createClient()
  
  const { data, error } = await supabase
    .from('snippets')
    .select('*')
    .eq('id', snippetId)
    .single()
  
  if (error) {
    console.error('Error fetching snippet:', error)
    return null
  }
  
  return data
}

export async function getUserSnippets(userId: string, limit = 20, offset = 0): Promise<Snippet[]> {
  const supabase = createClient()
  
  const { data, error } = await supabase
    .from('snippets')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)
  
  if (error) {
    console.error('Error fetching user snippets:', error)
    return []
  }
  
  return data || []
}

export async function getPublicSnippets(limit = 20, offset = 0): Promise<Snippet[]> {
  const supabase = createClient()
  
  const { data, error } = await supabase
    .from('snippets')
    .select('*')
    .eq('visibility', 'public')
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)
  
  if (error) {
    console.error('Error fetching public snippets:', error)
    return []
  }
  
  return data || []
}

export async function searchSnippets(
  query: string, 
  filters?: {
    language?: string
    tags?: string[]
    visibility?: SnippetVisibility
    userId?: string
  },
  limit = 20,
  offset = 0
): Promise<Snippet[]> {
  const supabase = createClient()
  
  let queryBuilder = supabase
    .from('snippets')
    .select('*')
  
  // Text search
  if (query) {
    queryBuilder = queryBuilder.or(`title.ilike.%${query}%,description.ilike.%${query}%`)
  }
  
  // Apply filters
  if (filters?.language) {
    queryBuilder = queryBuilder.eq('language', filters.language)
  }
  
  if (filters?.visibility) {
    queryBuilder = queryBuilder.eq('visibility', filters.visibility)
  }
  
  if (filters?.userId) {
    queryBuilder = queryBuilder.eq('user_id', filters.userId)
  }
  
  if (filters?.tags && filters.tags.length > 0) {
    queryBuilder = queryBuilder.contains('tags', filters.tags)
  }
  
  const { data, error } = await queryBuilder
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)
  
  if (error) {
    console.error('Error searching snippets:', error)
    return []
  }
  
  return data || []
}

// Version management
interface CreateVersionInput {
  title: string
  description?: string | null
  code: string
  language: string
  tags: string[]
  versionNumber: number
  commitMessage?: string | null
}

async function createSnippetVersion(
  snippetId: string,
  userId: string,
  input: CreateVersionInput
): Promise<SnippetVersion | null> {
  const supabase = createClient()
  
  const { data, error } = await supabase
    .from('snippet_versions')
    .insert({
      snippet_id: snippetId,
      user_id: userId,
      title: input.title,
      description: input.description,
      code: input.code,
      language: input.language,
      tags: input.tags,
      version_number: input.versionNumber,
      commit_message: input.commitMessage
    })
    .select()
    .single()
  
  if (error) {
    console.error('Error creating snippet version:', error)
    return null
  }
  
  return data
}

export async function getSnippetVersions(snippetId: string): Promise<SnippetVersion[]> {
  const supabase = createClient()
  
  const { data, error } = await supabase
    .from('snippet_versions')
    .select('*')
    .eq('snippet_id', snippetId)
    .order('version_number', { ascending: false })
  
  if (error) {
    console.error('Error fetching snippet versions:', error)
    return []
  }
  
  return data || []
}

export async function getSnippetVersion(versionId: string): Promise<SnippetVersion | null> {
  const supabase = createClient()
  
  const { data, error } = await supabase
    .from('snippet_versions')
    .select('*')
    .eq('id', versionId)
    .single()
  
  if (error) {
    console.error('Error fetching snippet version:', error)
    return null
  }
  
  return data
}

// View tracking
export async function incrementSnippetViews(snippetId: string): Promise<void> {
  const supabase = createClient()
  
  const { error } = await supabase.rpc('increment_snippet_views', {
    snippet_id: snippetId
  })
  
  if (error) {
    console.error('Error incrementing snippet views:', error)
  }
}