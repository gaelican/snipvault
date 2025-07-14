'use client'

import { TeamActivity, User } from '@/lib/supabase/types'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { formatDistanceToNow } from 'date-fns'
import { 
  UserPlus, 
  UserMinus, 
  Mail, 
  Shield, 
  Code, 
  Edit, 
  Trash2, 
  Building,
  RefreshCw
} from 'lucide-react'

interface TeamActivityFeedProps {
  activities: (TeamActivity & { user: User | null })[]
}

export default function TeamActivityFeed({ activities }: TeamActivityFeedProps) {
  const getActivityIcon = (type: TeamActivity['activity_type']) => {
    switch (type) {
      case 'member_joined':
        return <UserPlus className="h-4 w-4 text-green-600" />
      case 'member_left':
        return <UserMinus className="h-4 w-4 text-red-600" />
      case 'member_invited':
        return <Mail className="h-4 w-4 text-blue-600" />
      case 'member_role_changed':
        return <Shield className="h-4 w-4 text-purple-600" />
      case 'snippet_created':
        return <Code className="h-4 w-4 text-green-600" />
      case 'snippet_updated':
        return <Edit className="h-4 w-4 text-blue-600" />
      case 'snippet_deleted':
        return <Trash2 className="h-4 w-4 text-red-600" />
      case 'team_created':
        return <Building className="h-4 w-4 text-green-600" />
      case 'team_updated':
        return <RefreshCw className="h-4 w-4 text-blue-600" />
      default:
        return null
    }
  }

  const getActivityMessage = (activity: TeamActivity) => {
    const metadata = activity.metadata as any || {}
    
    switch (activity.activity_type) {
      case 'member_joined':
        return 'joined the team'
      case 'member_left':
        return metadata.removedBy ? 'was removed from the team' : 'left the team'
      case 'member_invited':
        return `invited ${metadata.email} as ${metadata.role}`
      case 'member_role_changed':
        if (metadata.previousOwnerId) {
          return 'became the team owner'
        }
        return `changed role from ${metadata.oldRole} to ${metadata.newRole}`
      case 'snippet_created':
        return 'created a new snippet'
      case 'snippet_updated':
        return 'updated a snippet'
      case 'snippet_deleted':
        return 'deleted a snippet'
      case 'team_created':
        return 'created the team'
      case 'team_updated':
        return 'updated team settings'
      default:
        return 'performed an action'
    }
  }

  if (activities.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No activity yet
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {activities.map((activity) => (
        <div key={activity.id} className="flex gap-3">
          <div className="flex-shrink-0 mt-1">
            {getActivityIcon(activity.activity_type)}
          </div>
          <div className="flex-1 space-y-1">
            <div className="flex items-center gap-2">
              {activity.user && (
                <>
                  <Avatar className="h-6 w-6">
                    <AvatarImage 
                      src={activity.user.avatar_url || '/default-avatar.png'} 
                      alt={activity.user.full_name || 'User'} 
                    />
                    <AvatarFallback className="text-xs">
                      {(activity.user.full_name || activity.user.username || 'U').charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <span className="font-medium text-sm">
                    {activity.user.full_name || activity.user.username || 'Unknown User'}
                  </span>
                </>
              )}
              <span className="text-sm text-muted-foreground">
                {getActivityMessage(activity)}
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              {formatDistanceToNow(new Date(activity.created_at), { addSuffix: true })}
            </p>
          </div>
        </div>
      ))}
    </div>
  )
}