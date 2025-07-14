import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getTeam, getTeamMemberRole, getTeamMembers, getTeamInvitations } from '@/lib/db/teams'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import TeamMemberList from '@/components/teams/TeamMemberList'
import TeamInvitationList from '@/components/teams/TeamInvitationList'
import InviteDialog from '@/components/teams/InviteDialog'

interface TeamMembersPageProps {
  params: {
    id: string
  }
}

export default async function TeamMembersPage({ params }: TeamMembersPageProps) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const team = await getTeam(params.id)
  if (!team) {
    redirect('/teams')
  }

  const memberRole = await getTeamMemberRole(params.id, user.id)
  if (!memberRole) {
    redirect('/teams')
  }

  const members = await getTeamMembers(params.id)
  const invitations = await getTeamInvitations(params.id)
  const canManageMembers = memberRole === 'owner' || memberRole === 'admin'

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Team Members</h1>
          <p className="text-muted-foreground mt-2">
            Manage your team members and invitations
          </p>
        </div>
        {canManageMembers && (
          <InviteDialog teamId={params.id} invitedBy={user.id} />
        )}
      </div>

      <Tabs defaultValue="members" className="space-y-4">
        <TabsList>
          <TabsTrigger value="members">
            Members ({members.length})
          </TabsTrigger>
          {canManageMembers && (
            <TabsTrigger value="invitations">
              Invitations ({invitations.length})
            </TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="members">
          <Card>
            <CardHeader>
              <CardTitle>Team Members</CardTitle>
              <CardDescription>
                View and manage team member roles
              </CardDescription>
            </CardHeader>
            <CardContent>
              <TeamMemberList 
                members={members} 
                currentUserId={user.id}
                currentUserRole={memberRole}
                teamId={params.id}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {canManageMembers && (
          <TabsContent value="invitations">
            <Card>
              <CardHeader>
                <CardTitle>Pending Invitations</CardTitle>
                <CardDescription>
                  Manage pending team invitations
                </CardDescription>
              </CardHeader>
              <CardContent>
                <TeamInvitationList 
                  invitations={invitations}
                  teamId={params.id}
                />
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>
    </div>
  )
}