'use client'

import { Team } from '@/lib/supabase/types'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Users, Code, Activity } from 'lucide-react'
import Link from 'next/link'
import { useEffect, useState } from 'react'

interface TeamCardProps {
  team: Team
  userId: string
}

export default function TeamCard({ team, userId }: TeamCardProps) {
  const [stats, setStats] = useState<{ memberCount: number; snippetCount: number } | null>(null)
  const [memberRole, setMemberRole] = useState<string | null>(null)

  useEffect(() => {
    fetchTeamStats()
    fetchMemberRole()
  }, [team.id])

  const fetchTeamStats = async () => {
    try {
      const response = await fetch(`/api/teams/${team.id}/stats`)
      if (response.ok) {
        const data = await response.json()
        setStats(data)
      }
    } catch (error) {
      console.error('Error fetching team stats:', error)
    }
  }

  const fetchMemberRole = async () => {
    try {
      const response = await fetch(`/api/teams/${team.id}`)
      if (response.ok) {
        const data = await response.json()
        setMemberRole(data.memberRole)
      }
    } catch (error) {
      console.error('Error fetching member role:', error)
    }
  }

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-xl">{team.name}</CardTitle>
            {team.description && (
              <CardDescription className="mt-1">{team.description}</CardDescription>
            )}
          </div>
          {memberRole && (
            <Badge variant={memberRole === 'owner' ? 'default' : 'secondary'}>
              {memberRole}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
          {stats && (
            <>
              <div className="flex items-center gap-1">
                <Users className="h-4 w-4" />
                <span>{stats.memberCount} members</span>
              </div>
              <div className="flex items-center gap-1">
                <Code className="h-4 w-4" />
                <span>{stats.snippetCount} snippets</span>
              </div>
            </>
          )}
        </div>
        <Button asChild className="w-full">
          <Link href={`/teams/${team.id}`}>View Team</Link>
        </Button>
      </CardContent>
    </Card>
  )
}