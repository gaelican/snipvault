# SnipVault Architecture

## Overview

SnipVault is built as a modern web application using Next.js 14 with the App Router, providing a full-stack solution for code snippet management. The architecture follows a modular, scalable design with clear separation of concerns.

## High-Level Architecture

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│                 │     │                 │     │                 │
│   Frontend      │────▶│   API Routes    │────▶│   Backend       │
│   (Next.js)     │     │   (Next.js)     │     │   Services      │
│                 │     │                 │     │                 │
└─────────────────┘     └─────────────────┘     └─────────────────┘
         │                       │                       │
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│                 │     │                 │     │                 │
│   UI Components │     │   Middleware    │     │   Database      │
│   (React/TS)    │     │   (Auth/Rate)   │     │   (Supabase)    │
│                 │     │                 │     │                 │
└─────────────────┘     └─────────────────┘     └─────────────────┘
```

## Technology Stack

### Frontend
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **UI Library**: React 18
- **Styling**: Tailwind CSS
- **Component Library**: Radix UI (unstyled components)
- **State Management**: React hooks and context
- **Code Editor**: Monaco Editor
- **Form Handling**: React Hook Form + Zod validation

### Backend
- **API**: Next.js API Routes
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **File Storage**: Supabase Storage
- **Real-time**: Supabase Realtime (planned)

### External Services
- **AI Provider**: OpenAI API
- **Payment Processing**: Stripe
- **Email**: Supabase Email (via SMTP)
- **Analytics**: Vercel Analytics (optional)

### Development Tools
- **Testing**: Jest, React Testing Library, Playwright
- **Linting**: ESLint
- **Formatting**: Prettier
- **Type Checking**: TypeScript
- **Build Tool**: Next.js bundler (Turbopack)

## Project Structure

```
snipvault/
├── app/                        # Next.js App Router
│   ├── (auth)/                # Authentication group
│   │   ├── login/            # Login page
│   │   ├── signup/           # Signup page
│   │   └── forgot-password/  # Password reset
│   ├── api/                   # API routes
│   │   ├── ai/               # AI endpoints
│   │   ├── snippets/         # Snippet CRUD
│   │   └── stripe/           # Payment endpoints
│   ├── dashboard/            # Protected dashboard
│   ├── globals.css          # Global styles
│   └── layout.tsx           # Root layout
│
├── components/               # React components
│   ├── ai/                  # AI-related components
│   ├── auth/                # Auth components
│   ├── billing/             # Billing components
│   ├── snippets/            # Snippet components
│   └── ui/                  # Reusable UI components
│
├── lib/                     # Core library code
│   ├── ai/                  # AI integration
│   │   ├── openai.ts       # OpenAI client
│   │   ├── prompts.ts      # AI prompts
│   │   └── token-tracker.ts # Usage tracking
│   ├── api/                 # API client functions
│   ├── auth/                # Auth utilities
│   ├── db/                  # Database queries
│   ├── stripe/              # Stripe integration
│   ├── supabase/            # Supabase clients
│   └── validations/         # Zod schemas
│
├── middleware.ts            # Next.js middleware
└── public/                  # Static assets
```

## Data Models

### Core Entities

```typescript
// User
interface User {
  id: string;
  email: string;
  username?: string;
  avatar_url?: string;
  created_at: Date;
  subscription_tier: 'free' | 'pro' | 'team';
}

// Snippet
interface Snippet {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  code: string;
  language: string;
  tags: string[];
  visibility: 'public' | 'private' | 'unlisted';
  team_id?: string;
  view_count: number;
  like_count: number;
  fork_count: number;
  created_at: Date;
  updated_at: Date;
}

// Team
interface Team {
  id: string;
  name: string;
  owner_id: string;
  created_at: Date;
}

// Subscription
interface Subscription {
  id: string;
  user_id: string;
  stripe_customer_id: string;
  stripe_subscription_id: string;
  plan_id: string;
  status: string;
  current_period_end: Date;
}
```

### Database Schema

The database uses PostgreSQL via Supabase with the following main tables:

- `users` - User accounts and profiles
- `snippets` - Code snippets
- `snippet_versions` - Version history
- `teams` - Team workspaces
- `team_members` - Team membership
- `favorites` - User favorites
- `tags` - Tag definitions
- `subscriptions` - Subscription data
- `usage_records` - AI usage tracking

## API Design

### RESTful Endpoints

All API routes follow RESTful conventions:

```
GET    /api/snippets         # List snippets
GET    /api/snippets/:id     # Get snippet
POST   /api/snippets         # Create snippet
PUT    /api/snippets/:id     # Update snippet
DELETE /api/snippets/:id     # Delete snippet

GET    /api/snippets/search  # Search snippets
GET    /api/snippets/:id/versions # Get versions
```

### Request/Response Format

All API responses follow a consistent format:

```typescript
// Success Response
{
  data: T,
  meta?: {
    pagination?: {
      page: number,
      limit: number,
      total: number
    }
  }
}

// Error Response
{
  error: {
    code: string,
    message: string,
    details?: any
  }
}
```

## Authentication & Authorization

### Authentication Flow

1. **Email/Password**: Traditional signup/login with email verification
2. **OAuth**: Support for GitHub, Google (planned)
3. **Magic Links**: Passwordless authentication (planned)

### Authorization Levels

- **Anonymous**: Can view public snippets
- **Authenticated**: Can create/manage own snippets
- **Pro/Team**: Access to advanced features
- **Admin**: Full system access (internal use)

### Security Measures

- JWT tokens stored in httpOnly cookies
- CSRF protection with SameSite cookies
- Rate limiting on all API endpoints
- Input validation with Zod schemas
- SQL injection prevention via parameterized queries

## AI Integration

### Architecture

```
Client → API Route → AI Service → OpenAI API
                         ↓
                   Token Tracker → Database
```

### Features

1. **Code Generation**: Natural language to code
2. **Code Explanation**: Detailed code analysis
3. **Code Improvement**: Optimization suggestions
4. **Documentation**: Auto-generate docs

### Rate Limiting & Usage Tracking

- Token usage tracked per user
- Monthly limits based on subscription tier
- Real-time usage updates
- Graceful degradation when limits reached

## Performance Optimization

### Frontend

1. **Server Components**: Default for static content
2. **Client Components**: Only where interactivity needed
3. **Dynamic Imports**: Code splitting for large components
4. **Image Optimization**: Next.js Image component
5. **Font Optimization**: Next.js font optimization

### Backend

1. **Database Indexing**: On frequently queried fields
2. **Query Optimization**: Efficient joins and aggregations
3. **Caching Strategy**:
   - Static content: CDN caching
   - API responses: Redis (planned)
   - Database queries: Query result caching
4. **Connection Pooling**: Supabase connection management

### Monitoring

- Performance metrics via Vercel Analytics
- Error tracking with Sentry (optional)
- Custom metrics for AI usage
- Database query performance monitoring

## Deployment Architecture

### Production Environment

```
┌─────────────┐     ┌──────────────┐     ┌─────────────┐
│   Vercel    │────▶│   Supabase   │────▶│   OpenAI    │
│   (Edge)    │     │   (Cloud)    │     │    API      │
└─────────────┘     └──────────────┘     └─────────────┘
      │                    │                     │
      ▼                    ▼                     ▼
┌─────────────┐     ┌──────────────┐     ┌─────────────┐
│    CDN      │     │  PostgreSQL  │     │   Stripe    │
│  (Global)   │     │   Database   │     │    API      │
└─────────────┘     └──────────────┘     └─────────────┘
```

### Scaling Strategy

1. **Horizontal Scaling**: Vercel automatically scales
2. **Database Scaling**: Supabase Pro for higher limits
3. **CDN Distribution**: Global edge network
4. **API Rate Limiting**: Prevent abuse
5. **Queue System**: For heavy operations (planned)

## Development Workflow

### Local Development

```bash
# Start all services
npm run dev

# Run tests
npm run test
npm run test:e2e

# Type checking
npm run type-check
```

### CI/CD Pipeline

1. **Pull Request**:
   - Run linting
   - Run type checking
   - Run unit tests
   - Run E2E tests
   - Build verification

2. **Main Branch**:
   - Deploy to preview
   - Run integration tests
   - Deploy to production
   - Run smoke tests

## Future Enhancements

### Planned Features

1. **Real-time Collaboration**: Live editing with presence
2. **API SDK**: JavaScript/Python client libraries
3. **CLI Tool**: Command-line snippet management
4. **Browser Extension**: Quick snippet access
5. **Mobile App**: React Native application

### Technical Improvements

1. **GraphQL API**: Alternative to REST
2. **WebSocket Support**: Real-time features
3. **Redis Caching**: Performance improvement
4. **Elasticsearch**: Advanced search
5. **Microservices**: Service separation

## Conclusion

SnipVault's architecture is designed to be scalable, maintainable, and performant. The modular structure allows for easy feature additions and modifications while maintaining code quality and system reliability.