import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getUserTeams } from '@/lib/db/teams'
import { Button } from '@/components/ui/button'
import { PlusCircle } from 'lucide-react'
import Link from 'next/link'
import TeamCard from '@/components/teams/TeamCard'
import CreateTeamDialog from '@/components/teams/CreateTeamDialog'

export default async function TeamsPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const teams = await getUserTeams(user.id)

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Teams</h1>
          <p className="text-muted-foreground mt-2">
            Collaborate with your team members on code snippets
          </p>
        </div>
        <CreateTeamDialog userId={user.id} />
      </div>

      {teams.length === 0 ? (
        <div className="text-center py-12">
          <h3 className="text-lg font-medium mb-2">No teams yet</h3>
          <p className="text-muted-foreground mb-4">
            Create a team to start collaborating with others
          </p>
          <CreateTeamDialog userId={user.id} />
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {teams.map((team) => (
            <TeamCard key={team.id} team={team} userId={user.id} />
          ))}
        </div>
      )}

      <div className="mt-12 p-6 bg-muted rounded-lg">
        <h2 className="text-xl font-semibold mb-2">Team Features</h2>
        <ul className="space-y-2 text-sm text-muted-foreground">
          <li>• Share snippets privately within your team</li>
          <li>• Collaborate on code snippets together</li>
          <li>• Manage team member roles and permissions</li>
          <li>• Track team activity and usage</li>
          <li>• Centralized billing for team subscriptions</li>
        </ul>
      </div>
    </div>
  )
}