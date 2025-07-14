# Supabase Database Setup

This directory contains the database schema and configuration for SnipVault.

## Setup Instructions

1. **Create a Supabase Project**
   - Go to [https://supabase.com](https://supabase.com)
   - Create a new project
   - Wait for the project to be provisioned

2. **Run the Database Schema**
   - Go to the SQL Editor in your Supabase dashboard
   - Copy the contents of `schema.sql`
   - Run the SQL to create all tables, functions, and RLS policies

3. **Configure Environment Variables**
   - Copy `.env.local.example` to `.env.local`
   - Add your Supabase project URL and anon key from the Supabase dashboard
   - These can be found in Settings > API

4. **Enable Authentication Providers (Optional)**
   - In Supabase dashboard, go to Authentication > Providers
   - Enable desired providers (GitHub is recommended for a code snippet app)
   - Configure OAuth apps and add credentials

## Database Structure

### Tables

- **users** - User profiles (extends Supabase auth.users)
- **snippets** - Code snippets with metadata
- **snippet_versions** - Version history for snippets
- **teams** - Team/organization accounts
- **team_members** - Team membership and roles
- **tags** - User-created tags for organizing snippets
- **favorites** - User favorites/bookmarks
- **subscriptions** - Subscription and billing information

### Security

- Row Level Security (RLS) is enabled on all tables
- Policies ensure users can only access their own data
- Public snippets are viewable by everyone
- Team snippets are only accessible to team members

### Key Features

- **Multi-tenancy**: Each user's data is isolated
- **Version Control**: All snippet changes are tracked
- **Team Collaboration**: Share snippets within teams
- **Flexible Visibility**: Private, public, or team-only snippets
- **Subscription Management**: Built-in support for free/pro/team plans

## Type Safety

TypeScript types are automatically generated in `types.ts` based on the database schema. Use these types throughout the application for type safety.

## Database Utilities

The `/lib/db` directory contains utility functions for all database operations:

- `users.ts` - User profile management
- `snippets.ts` - CRUD operations for snippets
- `favorites.ts` - Favorite/bookmark management
- `teams.ts` - Team and member management
- `tags.ts` - Tag creation and management
- `subscriptions.ts` - Subscription and plan limit checking

## Migrations

When updating the schema:

1. Create a new migration file with timestamp
2. Add ALTER statements for schema changes
3. Update `types.ts` to match new schema
4. Test thoroughly in a development environment