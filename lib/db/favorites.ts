import { createClient } from '@/lib/supabase/server'
import type { Favorite, Snippet } from '@/lib/supabase/types'

export async function toggleFavorite(userId: string, snippetId: string): Promise<boolean> {
  const supabase = createClient()
  
  // Check if already favorited
  const { data: existing } = await supabase
    .from('favorites')
    .select('*')
    .eq('user_id', userId)
    .eq('snippet_id', snippetId)
    .single()
  
  if (existing) {
    // Remove favorite
    const { error } = await supabase
      .from('favorites')
      .delete()
      .eq('user_id', userId)
      .eq('snippet_id', snippetId)
    
    if (error) {
      console.error('Error removing favorite:', error)
      return false
    }
    
    // Decrement likes count
    await supabase.rpc('decrement_snippet_likes', { snippet_id: snippetId })
    
    return false // Not favorited anymore
  } else {
    // Add favorite
    const { error } = await supabase
      .from('favorites')
      .insert({
        user_id: userId,
        snippet_id: snippetId
      })
    
    if (error) {
      console.error('Error adding favorite:', error)
      return false
    }
    
    // Increment likes count
    await supabase.rpc('increment_snippet_likes', { snippet_id: snippetId })
    
    return true // Now favorited
  }
}

export async function isFavorited(userId: string, snippetId: string): Promise<boolean> {
  const supabase = createClient()
  
  const { data } = await supabase
    .from('favorites')
    .select('*')
    .eq('user_id', userId)
    .eq('snippet_id', snippetId)
    .single()
  
  return !!data
}

export async function getUserFavorites(userId: string, limit = 20, offset = 0): Promise<Snippet[]> {
  const supabase = createClient()
  
  const { data, error } = await supabase
    .from('favorites')
    .select(`
      snippet_id,
      snippets (*)
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)
  
  if (error) {
    console.error('Error fetching user favorites:', error)
    return []
  }
  
  return data?.map(item => (item as any).snippets).filter(Boolean) || []
}

export async function getSnippetFavoritesCount(snippetId: string): Promise<number> {
  const supabase = createClient()
  
  const { count, error } = await supabase
    .from('favorites')
    .select('*', { count: 'exact', head: true })
    .eq('snippet_id', snippetId)
  
  if (error) {
    console.error('Error counting favorites:', error)
    return 0
  }
  
  return count || 0
}