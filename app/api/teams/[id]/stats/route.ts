import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getTeamMemberRole, getTeamStats } from '@/lib/db/teams'

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

    const stats = await getTeamStats(params.id)
    return NextResponse.json(stats)
  } catch (error) {
    console.error('Error fetching team stats:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}