'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { TeamMember, User, UserRole } from '@/lib/supabase/types'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { MoreHorizontal, Crown, Shield, User as UserIcon, UserX, RefreshCw } from 'lucide-react'
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

interface TeamMemberListProps {
  members: (TeamMember & { user: User })[]
  currentUserId: string
  currentUserRole: UserRole
  teamId: string
}

export default function TeamMemberList({ members, currentUserId, currentUserRole, teamId }: TeamMemberListProps) {
  const router = useRouter()
  const [actionMember, setActionMember] = useState<(TeamMember & { user: User }) | null>(null)
  const [actionType, setActionType] = useState<'remove' | 'transfer' | null>(null)

  const canManageMembers = currentUserRole === 'owner' || currentUserRole === 'admin'
  const isOwner = currentUserRole === 'owner'

  const updateMemberRole = async (userId: string, newRole: UserRole) => {
    try {
      const response = await fetch(`/api/teams/${teamId}/members`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          action: 'update_role',
          role: newRole
        })
      })

      if (!response.ok) {
        throw new Error('Failed to update member role')
      }

      toast.success('Member role updated')
      router.refresh()
    } catch (error) {
      toast.error('Failed to update member role')
    }
  }

  const removeMember = async () => {
    if (!actionMember) return

    try {
      const response = await fetch(`/api/teams/${teamId}/members`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: actionMember.user_id,
          action: 'remove'
        })
      })

      if (!response.ok) {
        throw new Error('Failed to remove member')
      }

      toast.success('Member removed from team')
      router.refresh()
    } catch (error) {
      toast.error('Failed to remove member')
    } finally {
      setActionMember(null)
      setActionType(null)
    }
  }

  const transferOwnership = async () => {
    if (!actionMember) return

    try {
      const response = await fetch(`/api/teams/${teamId}/members`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: actionMember.user_id,
          action: 'transfer_ownership'
        })
      })

      if (!response.ok) {
        throw new Error('Failed to transfer ownership')
      }

      toast.success('Ownership transferred successfully')
      router.refresh()
    } catch (error) {
      toast.error('Failed to transfer ownership')
    } finally {
      setActionMember(null)
      setActionType(null)
    }
  }

  const getRoleIcon = (role: UserRole) => {
    switch (role) {
      case 'owner':
        return <Crown className="h-3 w-3" />
      case 'admin':
        return <Shield className="h-3 w-3" />
      default:
        return <UserIcon className="h-3 w-3" />
    }
  }

  const getRoleBadgeVariant = (role: UserRole) => {
    switch (role) {
      case 'owner':
        return 'default'
      case 'admin':
        return 'secondary'
      default:
        return 'outline'
    }
  }

  return (
    <>
      <div className="space-y-4">
        {members.map((member) => {
          const isCurrentUser = member.user_id === currentUserId
          const canManageThisMember = canManageMembers && 
            !isCurrentUser && 
            (currentUserRole === 'owner' || member.role === 'member')

          return (
            <div key={member.user_id} className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarImage 
                    src={member.user.avatar_url || '/default-avatar.png'} 
                    alt={member.user.full_name || 'User'} 
                  />
                  <AvatarFallback>
                    {(member.user.full_name || member.user.username || 'U').charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-medium">
                      {member.user.full_name || member.user.username || 'Unknown User'}
                    </p>
                    {isCurrentUser && (
                      <Badge variant="outline" className="text-xs">You</Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Joined {new Date(member.joined_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={getRoleBadgeVariant(member.role)}>
                  <span className="flex items-center gap-1">
                    {getRoleIcon(member.role)}
                    {member.role}
                  </span>
                </Badge>
                {canManageThisMember && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {member.role === 'member' && (
                        <DropdownMenuItem onClick={() => updateMemberRole(member.user_id, 'admin')}>
                          <Shield className="mr-2 h-4 w-4" />
                          Make Admin
                        </DropdownMenuItem>
                      )}
                      {member.role === 'admin' && currentUserRole === 'owner' && (
                        <DropdownMenuItem onClick={() => updateMemberRole(member.user_id, 'member')}>
                          <UserIcon className="mr-2 h-4 w-4" />
                          Make Member
                        </DropdownMenuItem>
                      )}
                      {isOwner && member.role !== 'owner' && (
                        <>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            onClick={() => {
                              setActionMember(member)
                              setActionType('transfer')
                            }}
                          >
                            <RefreshCw className="mr-2 h-4 w-4" />
                            Transfer Ownership
                          </DropdownMenuItem>
                        </>
                      )}
                      <DropdownMenuSeparator />
                      <DropdownMenuItem 
                        className="text-red-600"
                        onClick={() => {
                          setActionMember(member)
                          setActionType('remove')
                        }}
                      >
                        <UserX className="mr-2 h-4 w-4" />
                        Remove from Team
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
            </div>
          )
        })}
      </div>

      <AlertDialog open={actionType === 'remove'} onOpenChange={() => setActionType(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Team Member</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove {actionMember?.user.full_name || 'this member'} from the team?
              They will lose access to all team snippets.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={removeMember} className="bg-red-600 hover:bg-red-700">
              Remove Member
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={actionType === 'transfer'} onOpenChange={() => setActionType(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Transfer Team Ownership</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to transfer ownership to {actionMember?.user.full_name || 'this member'}?
              You will become an admin and they will have full control of the team.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={transferOwnership}>
              Transfer Ownership
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}