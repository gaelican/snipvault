import { createClient } from '@/lib/supabase/client'
import { createClient as createServerClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { headers } from 'next/headers'

export type AuthError = {
  message: string
  status?: number
}

// Client-side auth functions
export const clientAuth = {
  async signUp(email: string, password: string, metadata?: { full_name?: string }) {
    const supabase = createClient()
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: metadata,
        emailRedirectTo: `${window.location.origin}/auth/callback`
      }
    })

    if (error) {
      return { error: { message: error.message } }
    }

    return { data }
  },

  async signIn(email: string, password: string) {
    const supabase = createClient()
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })

    if (error) {
      return { error: { message: error.message } }
    }

    return { data }
  },

  async signInWithOAuth(provider: 'google' | 'github') {
    const supabase = createClient()
    
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        }
      }
    })

    if (error) {
      return { error: { message: error.message } }
    }

    return { data }
  },

  async signOut() {
    const supabase = createClient()
    
    const { error } = await supabase.auth.signOut()

    if (error) {
      return { error: { message: error.message } }
    }

    return { success: true }
  },

  async resetPassword(email: string) {
    const supabase = createClient()
    
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback?next=/reset-password`
    })

    if (error) {
      return { error: { message: error.message } }
    }

    return { success: true }
  },

  async updatePassword(newPassword: string) {
    const supabase = createClient()
    
    const { error } = await supabase.auth.updateUser({
      password: newPassword
    })

    if (error) {
      return { error: { message: error.message } }
    }

    return { success: true }
  },

  async getSession() {
    const supabase = createClient()
    
    const { data: { session }, error } = await supabase.auth.getSession()

    if (error) {
      return { error: { message: error.message } }
    }

    return { session }
  },

  async getUser() {
    const supabase = createClient()
    
    const { data: { user }, error } = await supabase.auth.getUser()

    if (error) {
      return { error: { message: error.message } }
    }

    return { user }
  }
}

// Server-side auth functions
export const serverAuth = {
  async getUser() {
    const supabase = createServerClient()
    
    const { data: { user }, error } = await supabase.auth.getUser()

    if (error) {
      return null
    }

    return user
  },

  async getSession() {
    const supabase = createServerClient()
    
    const { data: { session }, error } = await supabase.auth.getSession()

    if (error) {
      return null
    }

    return session
  },

  async signOut() {
    const supabase = createServerClient()
    
    await supabase.auth.signOut()
    redirect('/login')
  },

  async requireAuth() {
    const user = await this.getUser()
    
    if (!user) {
      redirect('/login')
    }

    return user
  },

  async requireNoAuth() {
    const user = await this.getUser()
    
    if (user) {
      redirect('/dashboard')
    }
  }
}

// Auth state hooks for client components
export function useAuthState() {
  const supabase = createClient()
  
  return {
    onAuthStateChange: (callback: (event: string, session: any) => void) => {
      const { data: { subscription } } = supabase.auth.onAuthStateChange(callback)
      return subscription
    }
  }
}