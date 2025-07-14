# Teams API Documentation

## Overview

The SnipVault Teams API allows you to create and manage teams for collaborative code snippet sharing.

## Endpoints

### Teams

#### List User's Teams
```
GET /api/teams
```

Returns all teams the authenticated user is a member of.

**Response:**
```json
{
  "teams": [
    {
      "id": "uuid",
      "name": "My Team",
      "slug": "my-team",
      "description": "Team description",
      "avatar_url": "https://...",
      "owner_id": "uuid",
      "created_at": "2024-01-01T00:00:00Z",
      "updated_at": "2024-01-01T00:00:00Z"
    }
  ]
}
```

#### Create Team
```
POST /api/teams
```

**Request Body:**
```json
{
  "name": "My Team",
  "slug": "my-team",
  "description": "Optional description",
  "avatarUrl": "https://..."
}
```

**Response:**
```json
{
  "team": {
    "id": "uuid",
    "name": "My Team",
    "slug": "my-team",
    ...
  }
}
```

#### Get Team Details
```
GET /api/teams/:id
```

**Response:**
```json
{
  "team": { ... },
  "memberRole": "owner" | "admin" | "member"
}
```

#### Update Team
```
PATCH /api/teams/:id
```

Requires admin or owner role.

**Request Body:**
```json
{
  "name": "Updated Name",
  "slug": "updated-slug",
  "description": "Updated description",
  "avatarUrl": "https://..."
}
```

#### Delete Team
```
DELETE /api/teams/:id
```

Requires owner role.

### Team Members

#### List Team Members
```
GET /api/teams/:id/members
```

**Response:**
```json
{
  "members": [
    {
      "team_id": "uuid",
      "user_id": "uuid",
      "role": "owner" | "admin" | "member",
      "joined_at": "2024-01-01T00:00:00Z",
      "user": {
        "id": "uuid",
        "username": "john_doe",
        "full_name": "John Doe",
        "avatar_url": "https://..."
      }
    }
  ]
}
```

#### Update Member Role
```
POST /api/teams/:id/members
```

**Request Body:**
```json
{
  "userId": "uuid",
  "action": "update_role",
  "role": "admin" | "member"
}
```

#### Remove Member
```
POST /api/teams/:id/members
```

**Request Body:**
```json
{
  "userId": "uuid",
  "action": "remove"
}
```

#### Transfer Ownership
```
POST /api/teams/:id/members
```

Requires owner role.

**Request Body:**
```json
{
  "userId": "uuid",
  "action": "transfer_ownership"
}
```

#### Leave Team
```
DELETE /api/teams/:id/members
```

Member leaves the team (cannot be used by owner).

### Team Invitations

#### List Invitations
```
GET /api/teams/:id/invites
```

Requires admin or owner role.

**Response:**
```json
{
  "invitations": [
    {
      "id": "uuid",
      "team_id": "uuid",
      "email": "user@example.com",
      "role": "member" | "admin",
      "token": "...",
      "invited_by": "uuid",
      "accepted": false,
      "expires_at": "2024-01-08T00:00:00Z",
      "created_at": "2024-01-01T00:00:00Z"
    }
  ]
}
```

#### Create Invitation
```
POST /api/teams/:id/invites
```

Requires admin or owner role.

**Request Body:**
```json
{
  "email": "user@example.com",
  "role": "member" | "admin"
}
```

**Response:**
```json
{
  "invitation": {
    "id": "uuid",
    "token": "...",
    ...
  }
}
```

#### Accept Invitation
```
POST /api/teams/:id/invites
```

**Request Body:**
```json
{
  "token": "invitation_token"
}
```

#### Revoke Invitation
```
DELETE /api/teams/:id/invites?invitationId=uuid
```

Requires admin or owner role.

### Team Statistics
```
GET /api/teams/:id/stats
```

**Response:**
```json
{
  "memberCount": 5,
  "snippetCount": 42,
  "recentActivityCount": 15
}
```

## Team Snippets

To create a snippet for a team, use the regular snippets API with additional fields:

```
POST /api/snippets
```

**Request Body:**
```json
{
  "title": "Team Snippet",
  "content": "...",
  "language": "javascript",
  "visibility": "team",
  "teamId": "uuid"
}
```

To list team snippets:

```
GET /api/snippets?teamId=uuid
```

## Permissions

### Role Permissions

- **Owner:**
  - All permissions
  - Delete team
  - Transfer ownership
  - Manage billing

- **Admin:**
  - Manage team settings
  - Manage members (except owner)
  - Send invitations
  - Create/edit team snippets

- **Member:**
  - View team
  - View team snippets
  - Create team snippets
  - Leave team

## Activity Tracking

All team actions are logged and can be viewed in the team activity feed:

- Member joined/left
- Member invited
- Role changes
- Snippet created/updated/deleted
- Team settings updated

## Usage Example

```typescript
// Create a team
const response = await fetch('/api/teams', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: 'Awesome Developers',
    slug: 'awesome-devs',
    description: 'A team of awesome developers'
  })
});

const { team } = await response.json();

// Invite a member
await fetch(`/api/teams/${team.id}/invites`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'developer@example.com',
    role: 'member'
  })
});

// Create a team snippet
await fetch('/api/snippets', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    title: 'Shared Utility Function',
    content: 'export const formatDate = (date) => ...',
    language: 'javascript',
    visibility: 'team',
    teamId: team.id
  })
});
```