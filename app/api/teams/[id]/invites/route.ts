import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { 
  getTeamMemberRole, 
  createTeamInvitation,
  getTeamInvitations,
  revokeTeamInvitation,
  acceptTeamInvitation
} from '@/lib/db/teams'
import { z } from 'zod'

const createInvitationSchema = z.object({
  email: z.string().email(),
  role: z.enum(['member', 'admin'])
})

const acceptInvitationSchema = z.object({
  token: z.string()
})

interface RouteParams {
  params: {
    id: string
  }
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const memberRole = await getTeamMemberRole(params.id, user.id)
    if (!memberRole || (memberRole !== 'owner' && memberRole !== 'admin')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const invitations = await getTeamInvitations(params.id)
    return NextResponse.json({ invitations })
  } catch (error) {
    console.error('Error fetching invitations:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const memberRole = await getTeamMemberRole(params.id, user.id)
    if (!memberRole || (memberRole !== 'owner' && memberRole !== 'admin')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    
    // Check if accepting invitation
    if (body.token) {
      const validatedData = acceptInvitationSchema.parse(body)
      const team = await acceptTeamInvitation(validatedData.token, user.id)
      
      if (!team) {
        return NextResponse.json({ error: 'Invalid or expired invitation' }, { status: 400 })
      }
      
      return NextResponse.json({ team })
    }

    // Creating new invitation
    const validatedData = createInvitationSchema.parse(body)
    
    const invitation = await createTeamInvitation(
      params.id,
      validatedData.email,
      validatedData.role,
      user.id
    )
    
    if (!invitation) {
      return NextResponse.json({ error: 'Failed to create invitation' }, { status: 400 })
    }

    // TODO: Send invitation email
    // For now, just return the invitation with the token
    return NextResponse.json({ invitation }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 })
    }
    console.error('Error creating invitation:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const memberRole = await getTeamMemberRole(params.id, user.id)
    if (!memberRole || (memberRole !== 'owner' && memberRole !== 'admin')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const invitationId = searchParams.get('invitationId')
    
    if (!invitationId) {
      return NextResponse.json({ error: 'Invitation ID required' }, { status: 400 })
    }

    const success = await revokeTeamInvitation(invitationId)
    if (!success) {
      return NextResponse.json({ error: 'Failed to revoke invitation' }, { status: 400 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error revoking invitation:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}