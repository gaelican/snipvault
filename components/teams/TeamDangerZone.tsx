'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Team } from '@/lib/supabase/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

interface TeamDangerZoneProps {
  team: Team
  currentUserId: string
}

export default function TeamDangerZone({ team, currentUserId }: TeamDangerZoneProps) {
  const router = useRouter()
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [deleteConfirmation, setDeleteConfirmation] = useState('')
  const [deleting, setDeleting] = useState(false)

  const handleDeleteTeam = async () => {
    if (deleteConfirmation !== team.name) {
      toast.error('Team name does not match')
      return
    }

    setDeleting(true)
    try {
      const response = await fetch(`/api/teams/${team.id}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        throw new Error('Failed to delete team')
      }

      toast.success('Team deleted successfully')
      router.push('/teams')
      router.refresh()
    } catch (error) {
      toast.error('Failed to delete team')
    } finally {
      setDeleting(false)
      setShowDeleteDialog(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-red-600 mb-2">Delete Team</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Once you delete a team, there is no going back. All team data, including snippets and member associations, will be permanently deleted.
        </p>
        <Button
          variant="destructive"
          onClick={() => setShowDeleteDialog(true)}
        >
          Delete Team
        </Button>
      </div>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription className="space-y-3">
              <p>
                This action cannot be undone. This will permanently delete the team
                <span className="font-semibold"> {team.name}</span> and remove all associated data.
              </p>
              <div className="space-y-2">
                <Label htmlFor="confirm">
                  Type <span className="font-mono font-semibold">{team.name}</span> to confirm
                </Label>
                <Input
                  id="confirm"
                  value={deleteConfirmation}
                  onChange={(e) => setDeleteConfirmation(e.target.value)}
                  placeholder="Enter team name"
                />
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteTeam}
              disabled={deleteConfirmation !== team.name || deleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {deleting ? 'Deleting...' : 'Delete Team'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}