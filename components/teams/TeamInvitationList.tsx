'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { TeamInvitation } from '@/lib/supabase/types'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Copy, X } from 'lucide-react'
import { toast } from 'sonner'
import { formatDistanceToNow } from 'date-fns'

interface TeamInvitationListProps {
  invitations: TeamInvitation[]
  teamId: string
}

export default function TeamInvitationList({ invitations, teamId }: TeamInvitationListProps) {
  const router = useRouter()
  const [revokingId, setRevokingId] = useState<string | null>(null)

  const copyInviteLink = (token: string) => {
    const baseUrl = window.location.origin
    const link = `${baseUrl}/teams/join?token=${token}`
    navigator.clipboard.writeText(link)
    toast.success('Invite link copied to clipboard')
  }

  const revokeInvitation = async (invitationId: string) => {
    setRevokingId(invitationId)
    try {
      const response = await fetch(`/api/teams/${teamId}/invites?invitationId=${invitationId}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        throw new Error('Failed to revoke invitation')
      }

      toast.success('Invitation revoked')
      router.refresh()
    } catch (error) {
      toast.error('Failed to revoke invitation')
    } finally {
      setRevokingId(null)
    }
  }

  if (invitations.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No pending invitations
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {invitations.map((invitation) => {
        const isExpired = new Date(invitation.expires_at) < new Date()
        
        return (
          <div 
            key={invitation.id} 
            className={`flex items-center justify-between p-4 border rounded-lg ${
              isExpired ? 'opacity-60' : ''
            }`}
          >
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <p className="font-medium">{invitation.email}</p>
                <Badge variant="outline" className="text-xs">
                  {invitation.role}
                </Badge>
                {isExpired && (
                  <Badge variant="destructive" className="text-xs">
                    Expired
                  </Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground">
                {isExpired ? 'Expired' : 'Expires'} {formatDistanceToNow(new Date(invitation.expires_at), { addSuffix: true })}
              </p>
            </div>
            <div className="flex items-center gap-2">
              {!isExpired && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyInviteLink(invitation.token)}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => revokeInvitation(invitation.id)}
                disabled={revokingId === invitation.id}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )
      })}
    </div>
  )
}