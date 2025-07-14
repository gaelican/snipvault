'use client'

import { useEffect, useState } from 'react'
import { Snippet } from '@/lib/supabase/types'
import SnippetCard from '@/components/snippets/SnippetCard'
import { Button } from '@/components/ui/button'
import { PlusCircle } from 'lucide-react'
import CreateSnippetDialog from '@/components/snippets/CreateSnippetDialog'

interface TeamSnippetsProps {
  teamId: string
}

export default function TeamSnippets({ teamId }: TeamSnippetsProps) {
  const [snippets, setSnippets] = useState<Snippet[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchTeamSnippets()
  }, [teamId])

  const fetchTeamSnippets = async () => {
    try {
      const response = await fetch(`/api/snippets?teamId=${teamId}`)
      if (response.ok) {
        const data = await response.json()
        setSnippets(data.snippets || [])
      }
    } catch (error) {
      console.error('Error fetching team snippets:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div>Loading snippets...</div>
  }

  if (snippets.length === 0) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium mb-2">No team snippets yet</h3>
        <p className="text-muted-foreground mb-4">
          Create your first team snippet to share with members
        </p>
        <CreateSnippetDialog defaultTeamId={teamId}>
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            Create Team Snippet
          </Button>
        </CreateSnippetDialog>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Team Snippets</h3>
        <CreateSnippetDialog defaultTeamId={teamId}>
          <Button size="sm">
            <PlusCircle className="mr-2 h-4 w-4" />
            New Snippet
          </Button>
        </CreateSnippetDialog>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {snippets.map((snippet) => (
          <SnippetCard key={snippet.id} snippet={snippet} />
        ))}
      </div>
    </div>
  )
}