import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { acceptTeamInvitation } from '@/lib/db/teams'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CheckCircle, XCircle } from 'lucide-react'
import Link from 'next/link'

interface JoinTeamPageProps {
  searchParams: {
    token?: string
  }
}

export default async function JoinTeamPage({ searchParams }: JoinTeamPageProps) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    // Store the token in the redirect URL so user can join after login
    const redirectUrl = `/teams/join?token=${searchParams.token}`
    redirect(`/login?redirect=${encodeURIComponent(redirectUrl)}`)
  }

  const token = searchParams.token
  if (!token) {
    redirect('/teams')
  }

  // Try to accept the invitation
  const team = await acceptTeamInvitation(token, user.id)

  if (team) {
    return (
      <div className="container mx-auto px-4 py-16 max-w-md">
        <Card>
          <CardHeader className="text-center">
            <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
            <CardTitle>Welcome to {team.name}!</CardTitle>
            <CardDescription>
              You have successfully joined the team
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Button asChild className="w-full">
              <Link href={`/teams/${team.id}`}>Go to Team</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-16 max-w-md">
      <Card>
        <CardHeader className="text-center">
          <XCircle className="h-12 w-12 text-red-600 mx-auto mb-4" />
          <CardTitle>Invalid or Expired Invitation</CardTitle>
          <CardDescription>
            This invitation link is no longer valid
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-sm text-muted-foreground">
            The invitation may have expired or already been used. Please contact the team admin for a new invitation.
          </p>
          <Button asChild variant="outline" className="w-full">
            <Link href="/teams">View Your Teams</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}