import { createClient } from '@/lib/supabase/server'
import type { Team, TeamMember, UserRole, TeamInvitation, TeamActivity } from '@/lib/supabase/types'
import { randomBytes } from 'crypto'

interface CreateTeamInput {
  name: string
  slug: string
  description?: string
  avatarUrl?: string
}

export async function createTeam(ownerId: string, input: CreateTeamInput): Promise<Team | null> {
  const supabase = createClient()
  
  // Create team
  const { data: team, error: teamError } = await supabase
    .from('teams')
    .insert({
      name: input.name,
      slug: input.slug,
      description: input.description,
      avatar_url: input.avatarUrl,
      owner_id: ownerId
    })
    .select()
    .single()
  
  if (teamError) {
    console.error('Error creating team:', teamError)
    return null
  }
  
  // Add owner as team member
  const { error: memberError } = await supabase
    .from('team_members')
    .insert({
      team_id: team.id,
      user_id: ownerId,
      role: 'owner'
    })
  
  if (memberError) {
    console.error('Error adding owner to team:', memberError)
    // Rollback team creation
    await supabase.from('teams').delete().eq('id', team.id)
    return null
  }
  
  return team
}

export async function updateTeam(teamId: string, updates: Partial<CreateTeamInput>): Promise<Team | null> {
  const supabase = createClient()
  
  const { data, error } = await supabase
    .from('teams')
    .update({
      name: updates.name,
      slug: updates.slug,
      description: updates.description,
      avatar_url: updates.avatarUrl
    })
    .eq('id', teamId)
    .select()
    .single()
  
  if (error) {
    console.error('Error updating team:', error)
    return null
  }
  
  return data
}

export async function deleteTeam(teamId: string): Promise<boolean> {
  const supabase = createClient()
  
  const { error } = await supabase
    .from('teams')
    .delete()
    .eq('id', teamId)
  
  if (error) {
    console.error('Error deleting team:', error)
    return false
  }
  
  return true
}

export async function getTeam(teamId: string): Promise<Team | null> {
  const supabase = createClient()
  
  const { data, error } = await supabase
    .from('teams')
    .select('*')
    .eq('id', teamId)
    .single()
  
  if (error) {
    console.error('Error fetching team:', error)
    return null
  }
  
  return data
}

export async function getTeamBySlug(slug: string): Promise<Team | null> {
  const supabase = createClient()
  
  const { data, error } = await supabase
    .from('teams')
    .select('*')
    .eq('slug', slug)
    .single()
  
  if (error) {
    console.error('Error fetching team by slug:', error)
    return null
  }
  
  return data
}

export async function getUserTeams(userId: string): Promise<Team[]> {
  const supabase = createClient()
  
  const { data, error } = await supabase
    .from('team_members')
    .select(`
      team_id,
      role,
      teams (*)
    `)
    .eq('user_id', userId)
    .order('joined_at', { ascending: false })
  
  if (error) {
    console.error('Error fetching user teams:', error)
    return []
  }
  
  return data?.map(item => (item as any).teams).filter(Boolean) || []
}

// Team member management
export async function addTeamMember(
  teamId: string, 
  userId: string, 
  role: UserRole = 'member'
): Promise<boolean> {
  const supabase = createClient()
  
  const { error } = await supabase
    .from('team_members')
    .insert({
      team_id: teamId,
      user_id: userId,
      role
    })
  
  if (error) {
    console.error('Error adding team member:', error)
    return false
  }
  
  return true
}

export async function updateTeamMemberRole(
  teamId: string, 
  userId: string, 
  role: UserRole
): Promise<boolean> {
  const supabase = createClient()
  
  const { error } = await supabase
    .from('team_members')
    .update({ role })
    .eq('team_id', teamId)
    .eq('user_id', userId)
  
  if (error) {
    console.error('Error updating team member role:', error)
    return false
  }
  
  return true
}

export async function removeTeamMember(teamId: string, userId: string): Promise<boolean> {
  const supabase = createClient()
  
  const { error } = await supabase
    .from('team_members')
    .delete()
    .eq('team_id', teamId)
    .eq('user_id', userId)
  
  if (error) {
    console.error('Error removing team member:', error)
    return false
  }
  
  return true
}

export async function getTeamMembers(teamId: string): Promise<(TeamMember & { user: any })[]> {
  const supabase = createClient()
  
  const { data, error } = await supabase
    .from('team_members')
    .select(`
      *,
      users (*)
    `)
    .eq('team_id', teamId)
    .order('joined_at', { ascending: true })
  
  if (error) {
    console.error('Error fetching team members:', error)
    return []
  }
  
  return data as any || []
}

export async function isTeamMember(teamId: string, userId: string): Promise<boolean> {
  const supabase = createClient()
  
  const { data } = await supabase
    .from('team_members')
    .select('*')
    .eq('team_id', teamId)
    .eq('user_id', userId)
    .single()
  
  return !!data
}

export async function getTeamMemberRole(teamId: string, userId: string): Promise<UserRole | null> {
  const supabase = createClient()
  
  const { data } = await supabase
    .from('team_members')
    .select('role')
    .eq('team_id', teamId)
    .eq('user_id', userId)
    .single()
  
  return data?.role || null
}

// Team invitation management
export async function createTeamInvitation(
  teamId: string,
  email: string,
  role: UserRole,
  invitedBy: string
): Promise<TeamInvitation | null> {
  const supabase = createClient()
  
  // Generate unique token
  const token = randomBytes(32).toString('hex')
  
  // Set expiration to 7 days from now
  const expiresAt = new Date()
  expiresAt.setDate(expiresAt.getDate() + 7)
  
  const { data, error } = await supabase
    .from('team_invitations')
    .insert({
      team_id: teamId,
      email,
      role,
      token,
      invited_by: invitedBy,
      expires_at: expiresAt.toISOString()
    })
    .select()
    .single()
  
  if (error) {
    console.error('Error creating team invitation:', error)
    return null
  }
  
  // Log activity
  await logTeamActivity(teamId, invitedBy, 'member_invited', 'member', null, { email, role })
  
  return data
}

export async function getTeamInvitations(teamId: string): Promise<TeamInvitation[]> {
  const supabase = createClient()
  
  const { data, error } = await supabase
    .from('team_invitations')
    .select('*')
    .eq('team_id', teamId)
    .eq('accepted', false)
    .gte('expires_at', new Date().toISOString())
    .order('created_at', { ascending: false })
  
  if (error) {
    console.error('Error fetching team invitations:', error)
    return []
  }
  
  return data || []
}

export async function acceptTeamInvitation(token: string, userId: string): Promise<Team | null> {
  const supabase = createClient()
  
  // Get invitation
  const { data: invitation, error: inviteError } = await supabase
    .from('team_invitations')
    .select('*')
    .eq('token', token)
    .eq('accepted', false)
    .gte('expires_at', new Date().toISOString())
    .single()
  
  if (inviteError || !invitation) {
    console.error('Error fetching invitation:', inviteError)
    return null
  }
  
  // Add user to team
  const added = await addTeamMember(invitation.team_id, userId, invitation.role)
  if (!added) {
    return null
  }
  
  // Mark invitation as accepted
  await supabase
    .from('team_invitations')
    .update({ accepted: true })
    .eq('id', invitation.id)
  
  // Log activity
  await logTeamActivity(invitation.team_id, userId, 'member_joined', 'member', userId, { role: invitation.role })
  
  // Return the team
  return getTeam(invitation.team_id)
}

export async function revokeTeamInvitation(invitationId: string): Promise<boolean> {
  const supabase = createClient()
  
  const { error } = await supabase
    .from('team_invitations')
    .delete()
    .eq('id', invitationId)
  
  if (error) {
    console.error('Error revoking invitation:', error)
    return false
  }
  
  return true
}

// Team activity logging
export async function logTeamActivity(
  teamId: string,
  userId: string,
  activityType: TeamActivity['activity_type'],
  entityType?: string | null,
  entityId?: string | null,
  metadata?: any
): Promise<void> {
  const supabase = createClient()
  
  const { error } = await supabase
    .rpc('log_team_activity', {
      p_team_id: teamId,
      p_user_id: userId,
      p_activity_type: activityType,
      p_entity_type: entityType,
      p_entity_id: entityId,
      p_metadata: metadata || {}
    })
  
  if (error) {
    console.error('Error logging team activity:', error)
  }
}

export async function getTeamActivities(teamId: string, limit = 50): Promise<(TeamActivity & { user: any })[]> {
  const supabase = createClient()
  
  const { data, error } = await supabase
    .from('team_activities')
    .select(`
      *,
      users (*)
    `)
    .eq('team_id', teamId)
    .order('created_at', { ascending: false })
    .limit(limit)
  
  if (error) {
    console.error('Error fetching team activities:', error)
    return []
  }
  
  return data as any || []
}

// Transfer team ownership
export async function transferTeamOwnership(teamId: string, newOwnerId: string): Promise<boolean> {
  const supabase = createClient()
  
  // Update team owner
  const { error: teamError } = await supabase
    .from('teams')
    .update({ owner_id: newOwnerId })
    .eq('id', teamId)
  
  if (teamError) {
    console.error('Error transferring team ownership:', teamError)
    return false
  }
  
  // Update new owner's role to owner
  const { error: roleError } = await supabase
    .from('team_members')
    .update({ role: 'owner' })
    .eq('team_id', teamId)
    .eq('user_id', newOwnerId)
  
  if (roleError) {
    console.error('Error updating new owner role:', roleError)
    return false
  }
  
  return true
}

// Team statistics
export async function getTeamStats(teamId: string) {
  const supabase = createClient()
  
  // Get member count
  const { count: memberCount } = await supabase
    .from('team_members')
    .select('*', { count: 'exact', head: true })
    .eq('team_id', teamId)
  
  // Get snippet count
  const { count: snippetCount } = await supabase
    .from('snippets')
    .select('*', { count: 'exact', head: true })
    .eq('team_id', teamId)
  
  // Get recent activity count (last 30 days)
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
  
  const { count: activityCount } = await supabase
    .from('team_activities')
    .select('*', { count: 'exact', head: true })
    .eq('team_id', teamId)
    .gte('created_at', thirtyDaysAgo.toISOString())
  
  return {
    memberCount: memberCount || 0,
    snippetCount: snippetCount || 0,
    recentActivityCount: activityCount || 0
  }
}