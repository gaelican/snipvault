import { createClient } from '@/lib/supabase/server'
import type { Tag } from '@/lib/supabase/types'

export async function createTag(userId: string, name: string): Promise<Tag | null> {
  const supabase = createClient()
  
  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
  
  const { data, error } = await supabase
    .from('tags')
    .insert({
      name,
      slug,
      user_id: userId
    })
    .select()
    .single()
  
  if (error) {
    console.error('Error creating tag:', error)
    return null
  }
  
  return data
}

export async function getUserTags(userId: string): Promise<Tag[]> {
  const supabase = createClient()
  
  const { data, error } = await supabase
    .from('tags')
    .select('*')
    .eq('user_id', userId)
    .order('name', { ascending: true })
  
  if (error) {
    console.error('Error fetching user tags:', error)
    return []
  }
  
  return data || []
}

export async function getTagBySlug(userId: string, slug: string): Promise<Tag | null> {
  const supabase = createClient()
  
  const { data, error } = await supabase
    .from('tags')
    .select('*')
    .eq('user_id', userId)
    .eq('slug', slug)
    .single()
  
  if (error) {
    console.error('Error fetching tag by slug:', error)
    return null
  }
  
  return data
}

export async function updateTag(tagId: string, name: string): Promise<Tag | null> {
  const supabase = createClient()
  
  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
  
  const { data, error } = await supabase
    .from('tags')
    .update({ name, slug })
    .eq('id', tagId)
    .select()
    .single()
  
  if (error) {
    console.error('Error updating tag:', error)
    return null
  }
  
  return data
}

export async function deleteTag(tagId: string): Promise<boolean> {
  const supabase = createClient()
  
  const { error } = await supabase
    .from('tags')
    .delete()
    .eq('id', tagId)
  
  if (error) {
    console.error('Error deleting tag:', error)
    return false
  }
  
  return true
}

export async function getPopularTags(limit = 10): Promise<{ tag: string; count: number }[]> {
  const supabase = createClient()
  
  // This would require a custom RPC function to aggregate tags from snippets
  // For now, returning empty array
  // TODO: Implement RPC function for tag aggregation
  return []
}

export async function createOrGetTags(userId: string, tagNames: string[]): Promise<Tag[]> {
  const supabase = createClient()
  const tags: Tag[] = []
  
  for (const name of tagNames) {
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
    
    // Try to get existing tag
    const { data: existing } = await supabase
      .from('tags')
      .select('*')
      .eq('user_id', userId)
      .eq('slug', slug)
      .single()
    
    if (existing) {
      tags.push(existing)
    } else {
      // Create new tag
      const { data: newTag } = await supabase
        .from('tags')
        .insert({
          name,
          slug,
          user_id: userId
        })
        .select()
        .single()
      
      if (newTag) {
        tags.push(newTag)
      }
    }
  }
  
  return tags
}