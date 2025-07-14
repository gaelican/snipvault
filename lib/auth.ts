import { NextRequest } from 'next/server';
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'user' | 'admin';
}

export async function getAuthUser(request: NextRequest): Promise<User | null> {
  // Create Supabase client for server-side auth
  const cookieStore = cookies()
  
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value, ...options })
          } catch (error) {
            // Ignore error if called from Server Component
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: '', ...options })
          } catch (error) {
            // Ignore error if called from Server Component
          }
        },
      },
    }
  )

  // Get the authenticated user from Supabase
  const { data: { user }, error } = await supabase.auth.getUser()
  
  if (error || !user) {
    return null;
  }

  // Map Supabase user to our User interface
  return {
    id: user.id,
    email: user.email!,
    name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'User',
    role: user.user_metadata?.role || 'user'
  };
}

export function requireAuth(user: User | null): asserts user is User {
  if (!user) {
    throw new Error('Unauthorized');
  }
}

export function requireAdmin(user: User | null): asserts user is User {
  requireAuth(user);
  if (user.role !== 'admin') {
    throw new Error('Forbidden: Admin access required');
  }
}

export function canAccessSnippet(
  user: User | null,
  snippet: { authorId: string; visibility: string }
): boolean {
  // Public snippets are accessible to everyone
  if (snippet.visibility === 'public') {
    return true;
  }

  // Private and unlisted snippets require authentication
  if (!user) {
    return false;
  }

  // Users can access their own snippets
  if (user.id === snippet.authorId) {
    return true;
  }

  // Admins can access all snippets
  if (user.role === 'admin') {
    return true;
  }

  // Unlisted snippets can be accessed by authenticated users with the link
  if (snippet.visibility === 'unlisted') {
    return true;
  }

  return false;
}