// Example of using authentication in API routes

import { NextRequest, NextResponse } from 'next/server'
import { getAuthUser, requireAuth } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'

// Example 1: Public API endpoint with optional authentication
export async function GET(request: NextRequest) {
  const user = await getAuthUser(request)
  
  if (user) {
    // User is authenticated - return personalized data
    return NextResponse.json({
      message: `Hello ${user.name}!`,
      data: {
        userId: user.id,
        email: user.email,
        // ... personalized data
      }
    })
  }
  
  // User is not authenticated - return public data
  return NextResponse.json({
    message: 'Hello anonymous user!',
    data: {
      // ... public data only
    }
  })
}

// Example 2: Protected API endpoint that requires authentication
export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser(request)
    requireAuth(user) // Throws if user is null
    
    // User is authenticated - process the request
    const body = await request.json()
    
    // Use Supabase client for database operations
    const supabase = createClient()
    
    const { data, error } = await supabase
      .from('snippets')
      .insert({
        title: body.title,
        content: body.content,
        author_id: user.id,
        // ...
      })
      .select()
      .single()
    
    if (error) {
      return NextResponse.json(
        { error: 'Failed to create snippet' },
        { status: 500 }
      )
    }
    
    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    )
  }
}

// Example 3: Using Supabase Auth directly in API routes
export async function DELETE(request: NextRequest) {
  const supabase = createClient()
  
  // Get authenticated user from Supabase
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  
  if (authError || !user) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    )
  }
  
  // Get snippet ID from URL
  const { searchParams } = new URL(request.url)
  const snippetId = searchParams.get('id')
  
  if (!snippetId) {
    return NextResponse.json(
      { error: 'Snippet ID required' },
      { status: 400 }
    )
  }
  
  // Check ownership before deletion
  const { data: snippet, error: fetchError } = await supabase
    .from('snippets')
    .select('author_id')
    .eq('id', snippetId)
    .single()
  
  if (fetchError || !snippet) {
    return NextResponse.json(
      { error: 'Snippet not found' },
      { status: 404 }
    )
  }
  
  if (snippet.author_id !== user.id) {
    return NextResponse.json(
      { error: 'Forbidden' },
      { status: 403 }
    )
  }
  
  // Delete the snippet
  const { error: deleteError } = await supabase
    .from('snippets')
    .delete()
    .eq('id', snippetId)
  
  if (deleteError) {
    return NextResponse.json(
      { error: 'Failed to delete snippet' },
      { status: 500 }
    )
  }
  
  return NextResponse.json({ success: true })
}