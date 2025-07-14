import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getTeam, getTeamMemberRole } from '@/lib/db/teams'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import TeamGeneralSettings from '@/components/teams/TeamGeneralSettings'
import TeamDangerZone from '@/components/teams/TeamDangerZone'
import TeamBilling from '@/components/teams/TeamBilling'

interface TeamSettingsPageProps {
  params: {
    id: string
  }
}

export default async function TeamSettingsPage({ params }: TeamSettingsPageProps) {
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
  if (!memberRole || (memberRole !== 'owner' && memberRole !== 'admin')) {
    redirect(`/teams/${params.id}`)
  }

  const isOwner = memberRole === 'owner'

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Team Settings</h1>
        <p className="text-muted-foreground mt-2">
          Manage your team&apos;s settings and preferences
        </p>
      </div>

      <Tabs defaultValue="general" className="space-y-4">
        <TabsList>
          <TabsTrigger value="general">General</TabsTrigger>
          {isOwner && <TabsTrigger value="billing">Billing</TabsTrigger>}
          {isOwner && <TabsTrigger value="danger">Danger Zone</TabsTrigger>}
        </TabsList>

        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle>General Settings</CardTitle>
              <CardDescription>
                Update your team&apos;s basic information
              </CardDescription>
            </CardHeader>
            <CardContent>
              <TeamGeneralSettings team={team} />
            </CardContent>
          </Card>
        </TabsContent>

        {isOwner && (
          <TabsContent value="billing">
            <Card>
              <CardHeader>
                <CardTitle>Team Billing</CardTitle>
                <CardDescription>
                  Manage your team&apos;s subscription and billing
                </CardDescription>
              </CardHeader>
              <CardContent>
                <TeamBilling teamId={params.id} />
              </CardContent>
            </Card>
          </TabsContent>
        )}

        {isOwner && (
          <TabsContent value="danger">
            <Card className="border-red-200">
              <CardHeader>
                <CardTitle className="text-red-600">Danger Zone</CardTitle>
                <CardDescription>
                  Irreversible and destructive actions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <TeamDangerZone team={team} currentUserId={user.id} />
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>
    </div>
  )
}