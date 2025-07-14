# SnipVault API Documentation

## Authentication

All API endpoints require authentication except for viewing public snippets. Include the authentication token in the Authorization header:

```
Authorization: Bearer <token>
```

## Rate Limiting

- Create snippet: 30 requests per hour per user
- Update snippet: 60 requests per hour per user  
- Search: 30 requests per minute per IP

## Endpoints

### List Snippets
**GET** `/api/snippets`

Query parameters:
- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 20, max: 100)
- `sortBy` (string): Sort field - `created_at`, `updated_at`, `popularity` (default: created_at)
- `sortOrder` (string): Sort order - `asc`, `desc` (default: desc)
- `tags` (string): Comma-separated list of tags to filter by
- `language` (string): Programming language to filter by
- `visibility` (string): Visibility filter - `public`, `private`, `unlisted`
- `authorId` (string): Filter by author ID
- `includeDeleted` (boolean): Include soft-deleted snippets (admin only)

Response:
```json
{
  "data": [Snippet],
  "total": 100,
  "page": 1,
  "limit": 20,
  "totalPages": 5
}
```

### Get Single Snippet
**GET** `/api/snippets/:id`

Response: `Snippet` object

### Create Snippet
**POST** `/api/snippets`

Request body:
```json
{
  "title": "string (required)",
  "description": "string (optional)",
  "content": "string (required)",
  "language": "string (required)",
  "tags": ["string"] (optional),
  "visibility": "public|private|unlisted" (optional, default: public)
}
```

Response: Created `Snippet` object

### Update Snippet
**PUT** `/api/snippets/:id`

Request body: Same as create, but all fields are optional

Response: Updated `Snippet` object

### Delete Snippet
**DELETE** `/api/snippets/:id`

Response:
```json
{
  "message": "Snippet deleted successfully"
}
```

### Search Snippets
**GET** `/api/snippets/search`

Query parameters:
- `q` or `query` (string): Search query (required)
- All pagination and filter parameters from List Snippets endpoint

Response:
```json
{
  "data": [
    {
      ...Snippet,
      "highlights": ["matched content excerpts"]
    }
  ],
  "total": 50,
  "page": 1,
  "limit": 20,
  "totalPages": 3
}
```

### Get Version History
**GET** `/api/snippets/:id/versions`

Response:
```json
{
  "snippetId": "123",
  "currentVersion": 3,
  "versions": [
    {
      "id": "456",
      "snippetId": "123",
      "content": "...",
      "version": 3,
      "createdAt": "2024-01-01T00:00:00Z",
      "createdBy": "user123",
      "changeDescription": "Updated function"
    }
  ]
}
```

## Types

### Snippet
```typescript
{
  id: string;
  title: string;
  description?: string;
  content: string;
  language: string;
  tags: string[];
  visibility: 'public' | 'private' | 'unlisted';
  authorId: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date | null;
  viewCount: number;
  likeCount: number;
  forkCount: number;
  version: number;
}
```

## Client SDK Usage

```typescript
import { 
  listSnippets, 
  getSnippet, 
  createSnippet, 
  updateSnippet, 
  deleteSnippet,
  searchSnippets,
  getSnippetVersions 
} from '@/lib/api/snippets';

// List public snippets
const snippets = await listSnippets({ 
  visibility: 'public',
  sortBy: 'popularity',
  limit: 10 
});

// Search snippets
const results = await searchSnippets('react hooks', {
  language: 'javascript',
  tags: ['react']
});

// Create a snippet (requires auth)
const newSnippet = await createSnippet({
  title: 'React Custom Hook',
  content: 'export function useCustomHook() { ... }',
  language: 'javascript',
  tags: ['react', 'hooks']
}, { token: authToken });

// Update a snippet
const updated = await updateSnippet('123', {
  title: 'Updated Title'
}, { token: authToken });

// Get version history
const versions = await getSnippetVersions('123', { token: authToken });
```

## AI-Powered Endpoints

### Generate Snippet
**POST** `/api/ai/generate`

Generate code snippets from natural language descriptions.

Request body:
```json
{
  "description": "string (required, min 10 chars)",
  "language": "string (required)",
  "context": "string (optional)",
  "stream": "boolean (optional, default: false)"
}
```

Response (non-streaming):
```json
{
  "success": true,
  "data": {
    "content": "generated code",
    "usage": {
      "promptTokens": 100,
      "completionTokens": 200,
      "totalTokens": 300
    },
    "cost": 0.0015,
    "validation": {
      "valid": true,
      "issues": []
    },
    "cached": false
  }
}
```

Response (streaming):
```
data: {"content": "partial content"}
data: {"content": "more content"}
data: [DONE]
```

### Explain Code
**POST** `/api/ai/explain`

Get detailed explanations of code snippets.

Request body:
```json
{
  "code": "string (required)",
  "language": "string (optional, auto-detected if not provided)"
}
```

Response:
```json
{
  "success": true,
  "data": {
    "content": {
      "overview": "High-level explanation",
      "stepByStep": ["Step 1", "Step 2"],
      "concepts": ["Concept 1", "Concept 2"],
      "useCases": ["Use case 1"],
      "considerations": ["Important note"]
    },
    "usage": { /* token usage */ },
    "cost": 0.0012,
    "language": "javascript",
    "cached": false
  }
}
```

### Improve Code
**POST** `/api/ai/improve`

Get suggestions to improve code quality, performance, and security.

Request body:
```json
{
  "code": "string (required)",
  "language": "string (optional)",
  "requirements": "string (optional)"
}
```

Response:
```json
{
  "success": true,
  "data": {
    "issues": [
      {
        "type": "Performance",
        "description": "Inefficient loop",
        "severity": "medium"
      }
    ],
    "suggestions": [
      {
        "category": "Performance",
        "suggestion": "Use array methods",
        "explanation": "Array methods are more efficient"
      }
    ],
    "improvedCode": "// improved version",
    "performanceNotes": ["Note 1"],
    "securityNotes": ["Security consideration"],
    "usage": { /* token usage */ },
    "cost": 0.0025,
    "language": "javascript",
    "cached": false
  }
}
```

### AI Rate Limiting

AI endpoints have separate rate limits:
- 5 requests per minute per user (free tier)
- 20 requests per minute per user (pro tier)
- 100 requests per minute per user (enterprise tier)

Rate limit headers:
- `X-RateLimit-Limit`: Total requests allowed
- `X-RateLimit-Remaining`: Remaining requests
- `X-RateLimit-Reset`: Reset time (ISO 8601)
- `Retry-After`: Seconds until reset (on 429 responses)

## Error Responses

All endpoints return errors in the following format:
```json
{
  "error": "Error message",
  "details": {} // Optional, validation errors or additional info
}
```

Common HTTP status codes:
- 400: Bad Request (validation error)
- 401: Unauthorized (missing or invalid auth)
- 403: Forbidden (insufficient permissions)
- 404: Not Found
- 429: Too Many Requests (rate limit exceeded)
- 500: Internal Server Error