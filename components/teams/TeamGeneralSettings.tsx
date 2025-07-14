'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Team } from '@/lib/supabase/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'

interface TeamGeneralSettingsProps {
  team: Team
}

export default function TeamGeneralSettings({ team }: TeamGeneralSettingsProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: team.name,
    slug: team.slug,
    description: team.description || ''
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch(`/api/teams/${team.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (!response.ok) {
        throw new Error('Failed to update team')
      }

      toast.success('Team settings updated')
      router.refresh()
    } catch (error) {
      toast.error('Failed to update team settings')
    } finally {
      setLoading(false)
    }
  }

  const hasChanges = 
    formData.name !== team.name ||
    formData.slug !== team.slug ||
    formData.description !== (team.description || '')

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <Label htmlFor="name">Team Name</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
          disabled={loading}
        />
      </div>
      
      <div>
        <Label htmlFor="slug">Team URL</Label>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">/teams/</span>
          <Input
            id="slug"
            value={formData.slug}
            onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
            pattern="^[a-z0-9-]+$"
            required
            disabled={loading}
          />
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          Only lowercase letters, numbers, and hyphens
        </p>
      </div>
      
      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="What is this team about?"
          rows={3}
          disabled={loading}
        />
      </div>
      
      <Button 
        type="submit" 
        disabled={loading || !hasChanges}
      >
        {loading ? 'Saving...' : 'Save Changes'}
      </Button>
    </form>
  )
}