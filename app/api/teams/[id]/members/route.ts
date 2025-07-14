import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { 
  getTeamMembers, 
  getTeamMemberRole, 
  updateTeamMemberRole,
  removeTeamMember,
  transferTeamOwnership,
  logTeamActivity
} from '@/lib/db/teams'
import { z } from 'zod'

const updateMemberSchema = z.object({
  userId: z.string().uuid(),
  action: z.enum(['update_role', 'remove', 'transfer_ownership']),
  role: z.enum(['member', 'admin', 'owner']).optional()
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
    if (!memberRole) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const members = await getTeamMembers(params.id)
    return NextResponse.json({ members })
  } catch (error) {
    console.error('Error fetching team members:', error)
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

    const currentUserRole = await getTeamMemberRole(params.id, user.id)
    if (!currentUserRole || (currentUserRole !== 'owner' && currentUserRole !== 'admin')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const validatedData = updateMemberSchema.parse(body)

    const targetUserRole = await getTeamMemberRole(params.id, validatedData.userId)
    if (!targetUserRole) {
      return NextResponse.json({ error: 'Member not found' }, { status: 404 })
    }

    // Check permissions
    if (currentUserRole === 'admin' && targetUserRole === 'owner') {
      return NextResponse.json({ error: 'Cannot modify owner' }, { status: 403 })
    }

    if (validatedData.action === 'transfer_ownership' && currentUserRole !== 'owner') {
      return NextResponse.json({ error: 'Only owner can transfer ownership' }, { status: 403 })
    }

    let success = false
    let activityType: any = null
    let metadata: any = {}

    switch (validatedData.action) {
      case 'update_role':
        if (!validatedData.role || validatedData.role === 'owner') {
          return NextResponse.json({ error: 'Invalid role' }, { status: 400 })
        }
        success = await updateTeamMemberRole(params.id, validatedData.userId, validatedData.role)
        activityType = 'member_role_changed'
        metadata = { 
          userId: validatedData.userId, 
          oldRole: targetUserRole, 
          newRole: validatedData.role 
        }
        break

      case 'remove':
        if (validatedData.userId === user.id) {
          return NextResponse.json({ error: 'Cannot remove yourself' }, { status: 400 })
        }
        success = await removeTeamMember(params.id, validatedData.userId)
        activityType = 'member_left'
        metadata = { userId: validatedData.userId, removedBy: user.id }
        break

      case 'transfer_ownership':
        success = await transferTeamOwnership(params.id, validatedData.userId)
        if (success) {
          // Update old owner to admin
          await updateTeamMemberRole(params.id, user.id, 'admin')
        }
        activityType = 'member_role_changed'
        metadata = { 
          userId: validatedData.userId, 
          oldRole: targetUserRole, 
          newRole: 'owner',
          previousOwnerId: user.id
        }
        break
    }

    if (!success) {
      return NextResponse.json({ error: 'Operation failed' }, { status: 400 })
    }

    // Log activity
    if (activityType) {
      await logTeamActivity(params.id, user.id, activityType, 'member', validatedData.userId, metadata)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 })
    }
    console.error('Error managing team member:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// Handle member leaving team
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const memberRole = await getTeamMemberRole(params.id, user.id)
    if (!memberRole) {
      return NextResponse.json({ error: 'Not a member' }, { status: 403 })
    }

    if (memberRole === 'owner') {
      return NextResponse.json({ error: 'Owner cannot leave team' }, { status: 400 })
    }

    const success = await removeTeamMember(params.id, user.id)
    if (!success) {
      return NextResponse.json({ error: 'Failed to leave team' }, { status: 400 })
    }

    await logTeamActivity(params.id, user.id, 'member_left', 'member', user.id, {})

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error leaving team:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}