# SnipVault

A modern, feature-rich code snippet management platform built with Next.js, TypeScript, and Supabase. Store, organize, share, and discover code snippets with powerful search, AI-powered features, and team collaboration.

## Features

### Core Features
- **Snippet Management**: Create, edit, delete, and organize code snippets
- **Syntax Highlighting**: Support for 100+ programming languages with Monaco Editor
- **Version Control**: Track changes with built-in version history
- **Search & Filter**: Full-text search with language and tag filters
- **Visibility Control**: Public, private, and unlisted snippet options

### AI-Powered Features
- **Code Generation**: Generate code snippets from natural language descriptions
- **Code Explanation**: Get detailed explanations of code snippets
- **Code Improvement**: Receive suggestions to optimize and improve your code
- **Smart Documentation**: Automatically generate documentation for your code

### Collaboration & Sharing
- **Team Workspaces**: Create teams and share snippets within your organization
- **Public Sharing**: Share snippets with customizable visibility
- **Forking**: Fork and modify existing snippets
- **Embedding**: Embed snippets in websites and documentation

### User Features
- **Authentication**: Secure login with email/password or OAuth providers
- **User Profiles**: Customizable profiles with avatar and bio
- **Favorites**: Save frequently used snippets
- **Activity Tracking**: View history and analytics

### Subscription & Billing
- **Free Tier**: Basic features with usage limits
- **Pro Plan**: Advanced features and increased limits
- **Team Plan**: Collaboration features for organizations
- **Usage Tracking**: Monitor API and AI usage

## Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: Tailwind CSS, Radix UI components
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Payment Processing**: Stripe
- **AI Integration**: OpenAI API
- **Code Editor**: Monaco Editor
- **Testing**: Jest, React Testing Library, Playwright
- **Deployment**: Vercel

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Supabase account
- OpenAI API key (for AI features)
- Stripe account (for billing features)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/snipvault.git
cd snipvault
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```

4. Configure your environment variables in `.env.local`:
```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# OpenAI
OPENAI_API_KEY=your_openai_api_key

# Stripe
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_webhook_secret
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_publishable_key

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

5. Set up the database:
```bash
# Run Supabase migrations
npx supabase db push
```

6. Start the development server:
```bash
npm run dev
```

Visit `http://localhost:3000` to see the application.

## Project Structure

```
snipvault/
├── app/                    # Next.js app directory
│   ├── (auth)/            # Authentication pages
│   ├── api/               # API routes
│   ├── billing/           # Billing pages
│   ├── dashboard/         # User dashboard
│   └── pricing/           # Pricing page
├── components/            # React components
│   ├── ai/               # AI-related components
│   ├── auth/             # Authentication components
│   ├── billing/          # Billing components
│   ├── snippets/         # Snippet components
│   └── ui/               # UI components
├── lib/                   # Utility functions and configurations
│   ├── ai/               # AI utilities
│   ├── api/              # API client functions
│   ├── auth/             # Authentication utilities
│   ├── db/               # Database queries
│   ├── stripe/           # Stripe integration
│   ├── supabase/         # Supabase client and types
│   └── validations/      # Zod schemas
├── __tests__/            # Unit and integration tests
├── e2e/                  # End-to-end tests
└── docs/                 # Documentation
```

## Available Scripts

```bash
# Development
npm run dev              # Start development server
npm run build           # Build for production
npm run start           # Start production server

# Testing
npm run test            # Run unit tests
npm run test:watch      # Run tests in watch mode
npm run test:coverage   # Generate coverage report
npm run test:e2e        # Run E2E tests
npm run test:e2e:ui     # Run E2E tests with UI

# Code Quality
npm run lint            # Run ESLint
npm run type-check      # Run TypeScript compiler
```

## API Documentation

### Authentication Endpoints
- `POST /api/auth/signup` - Create new account
- `POST /api/auth/login` - Sign in
- `POST /api/auth/logout` - Sign out
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password

### Snippet Endpoints
- `GET /api/snippets` - List snippets
- `GET /api/snippets/:id` - Get snippet details
- `POST /api/snippets` - Create snippet
- `PUT /api/snippets/:id` - Update snippet
- `DELETE /api/snippets/:id` - Delete snippet
- `GET /api/snippets/search` - Search snippets
- `GET /api/snippets/:id/versions` - Get version history

### AI Endpoints
- `POST /api/ai/generate` - Generate code snippet
- `POST /api/ai/explain` - Explain code
- `POST /api/ai/improve` - Get improvement suggestions

### Billing Endpoints
- `POST /api/stripe/checkout` - Create checkout session
- `POST /api/stripe/portal` - Access customer portal
- `POST /api/stripe/webhook` - Handle Stripe webhooks

## Contributing

Please see [CONTRIBUTING.md](docs/CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

## Security

- All API endpoints are protected with authentication
- Rate limiting is implemented to prevent abuse
- Input validation using Zod schemas
- SQL injection prevention with parameterized queries
- XSS protection with proper content sanitization
- CSRF protection with SameSite cookies

## Performance Optimization

- Server-side rendering with Next.js
- Optimistic UI updates
- Image optimization with Next.js Image
- Code splitting and lazy loading
- Database query optimization
- Caching strategies for frequently accessed data

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

- Documentation: [docs/](docs/)
- Issues: [GitHub Issues](https://github.com/yourusername/snipvault/issues)
- Discussions: [GitHub Discussions](https://github.com/yourusername/snipvault/discussions)

## Acknowledgments

- [Next.js](https://nextjs.org/) for the amazing framework
- [Supabase](https://supabase.com/) for the backend infrastructure
- [Vercel](https://vercel.com/) for hosting
- [OpenAI](https://openai.com/) for AI capabilities
- All contributors who have helped shape this project