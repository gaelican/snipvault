import { createClient } from '@/lib/supabase/server'
import type { User } from '@/lib/supabase/types'

export async function getUser(userId: string): Promise<User | null> {
  const supabase = createClient()
  
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single()
  
  if (error) {
    console.error('Error fetching user:', error)
    return null
  }
  
  return data
}

export async function updateUser(userId: string, updates: Partial<User>): Promise<User | null> {
  const supabase = createClient()
  
  const { data, error } = await supabase
    .from('users')
    .update(updates)
    .eq('id', userId)
    .select()
    .single()
  
  if (error) {
    console.error('Error updating user:', error)
    return null
  }
  
  return data
}

export async function getUserByUsername(username: string): Promise<User | null> {
  const supabase = createClient()
  
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('username', username)
    .single()
  
  if (error) {
    console.error('Error fetching user by username:', error)
    return null
  }
  
  return data
}

export async function checkUsernameAvailability(username: string): Promise<boolean> {
  const supabase = createClient()
  
  const { data, error } = await supabase
    .from('users')
    .select('id')
    .eq('username', username)
    .single()
  
  // If error and no data, username is available
  return !data && error?.code === 'PGRST116'
}