# Team Collaboration Features

## Overview

SnipVault now includes comprehensive team collaboration features that allow users to create teams, invite members, and share code snippets privately within their organization.

## Features Implemented

### 1. Team Management
- Create and manage teams with unique slugs
- Team profiles with name, description, and avatar
- Team settings page for admins/owners
- Delete team functionality (owner only)

### 2. Member Management
- Role-based access control (Owner, Admin, Member)
- Invite members via email
- Accept/decline invitations
- Update member roles
- Remove members from team
- Transfer team ownership
- Members can leave teams

### 3. Team Snippets
- Create snippets with "team" visibility
- Team members can view and create team snippets
- Snippets are private to team members only
- Filter snippets by team

### 4. Activity Feed
- Track all team activities
- Member joins/leaves
- Role changes
- Snippet creation/updates/deletions
- Team setting updates

### 5. Team Statistics
- Member count
- Snippet count
- Recent activity count (30 days)

### 6. Billing Integration
- Team subscription plans
- Centralized billing for teams
- Usage tracking per team

## Database Schema

### New Tables

#### team_invitations
- Stores pending team invitations
- Includes expiration dates (7 days)
- Tracks invitation status

#### team_activities
- Logs all team-related activities
- Includes metadata for context
- Used for activity feed

### Updated Tables

#### snippets
- Added team_id field
- Added 'team' visibility option

#### subscriptions
- Added team_id field for team billing

## Pages Created

1. **Teams Overview** (`/teams`)
   - List all user's teams
   - Create new team button
   - Team cards with stats

2. **Team Dashboard** (`/teams/[id]`)
   - Team overview with stats
   - Team snippets
   - Activity feed
   - Quick actions

3. **Team Settings** (`/teams/[id]/settings`)
   - General settings (name, slug, description)
   - Billing management (owner only)
   - Danger zone (delete team)

4. **Team Members** (`/teams/[id]/members`)
   - Member list with roles
   - Invite new members
   - Manage member roles
   - Pending invitations

5. **Join Team** (`/teams/join`)
   - Accept team invitations via token
   - Error handling for invalid/expired tokens

## Components Created

1. **TeamCard** - Display team in grid/list
2. **TeamMemberList** - Show members with role management
3. **InviteDialog** - Send team invitations
4. **TeamActivityFeed** - Display team activities
5. **TeamSnippets** - List team snippets
6. **TeamGeneralSettings** - Edit team info
7. **TeamDangerZone** - Delete team
8. **TeamBilling** - Manage team subscription
9. **CreateTeamDialog** - Create new team
10. **TeamInvitationList** - Manage pending invites

## API Endpoints

### Teams
- `GET /api/teams` - List user's teams
- `POST /api/teams` - Create team
- `GET /api/teams/[id]` - Get team details
- `PATCH /api/teams/[id]` - Update team
- `DELETE /api/teams/[id]` - Delete team

### Members
- `GET /api/teams/[id]/members` - List members
- `POST /api/teams/[id]/members` - Update member/transfer ownership
- `DELETE /api/teams/[id]/members` - Leave team

### Invitations
- `GET /api/teams/[id]/invites` - List invitations
- `POST /api/teams/[id]/invites` - Create/accept invitation
- `DELETE /api/teams/[id]/invites` - Revoke invitation

### Stats
- `GET /api/teams/[id]/stats` - Get team statistics

## Security

### Row Level Security (RLS)
- Team members can only view their teams
- Only admins/owners can manage team settings
- Team snippets visible only to members
- Invitation management restricted to admins/owners

### Permissions by Role

**Owner:**
- All permissions
- Delete team
- Transfer ownership
- Manage billing

**Admin:**
- Manage team settings
- Invite/remove members (except owner)
- Manage team snippets

**Member:**
- View team and snippets
- Create team snippets
- Leave team

## Future Enhancements

1. **Email Integration**
   - Send actual invitation emails
   - Team activity notifications

2. **Advanced Permissions**
   - Snippet-level permissions
   - Read-only members
   - Guest access

3. **Team Features**
   - Team chat/comments
   - Code reviews
   - Shared collections
   - Team templates

4. **Analytics**
   - Detailed usage metrics
   - Member contribution stats
   - Popular snippets

5. **Integrations**
   - Slack/Discord notifications
   - GitHub/GitLab sync
   - IDE plugins for teams