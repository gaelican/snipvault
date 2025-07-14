# Authentication Setup Guide

This guide will help you set up authentication for SnipVault using Supabase Auth.

## Prerequisites

1. A Supabase account and project
2. Environment variables configured in `.env.local`

## Environment Variables

Copy `.env.example` to `.env.local` and fill in your Supabase credentials:

```bash
cp .env.example .env.local
```

Required variables:
- `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your Supabase anonymous key

## Features Implemented

### 1. Email/Password Authentication
- User registration with email verification
- Login with email and password
- Password reset flow
- Email verification requirement

### 2. OAuth Authentication
- Google OAuth integration
- GitHub OAuth integration
- Automatic account linking

### 3. Session Management
- Server-side session validation
- Automatic session refresh
- Secure cookie-based sessions

### 4. Protected Routes
- Middleware-based route protection
- Automatic redirection for unauthenticated users
- Role-based access control ready

### 5. User Experience
- Remember me functionality
- User profile dropdown menu
- Responsive authentication forms
- Loading states and error handling

## Setting Up OAuth Providers

### Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URI: `https://yourproject.supabase.co/auth/v1/callback`
6. Copy Client ID and Client Secret

In Supabase Dashboard:
1. Go to Authentication > Providers
2. Enable Google
3. Add your Client ID and Client Secret
4. Save

### GitHub OAuth

1. Go to GitHub Settings > Developer settings > OAuth Apps
2. Click "New OAuth App"
3. Fill in:
   - Application name: SnipVault
   - Homepage URL: Your app URL
   - Authorization callback URL: `https://yourproject.supabase.co/auth/v1/callback`
4. Copy Client ID and Client Secret

In Supabase Dashboard:
1. Go to Authentication > Providers
2. Enable GitHub
3. Add your Client ID and Client Secret
4. Save

## Email Templates

Customize email templates in Supabase Dashboard:
1. Go to Authentication > Email Templates
2. Customize:
   - Confirmation email
   - Password reset email
   - Magic link email

## Security Configurations

### In Supabase Dashboard:

1. **Email Confirmations**: Enable "Confirm email" in Authentication > Settings
2. **Site URL**: Set your production URL in Authentication > URL Configuration
3. **Redirect URLs**: Add allowed redirect URLs for OAuth

### Rate Limiting

Supabase provides built-in rate limiting:
- Sign up: 3 per hour per IP
- Sign in: 10 per hour per IP
- Password reset: 3 per hour per IP

## Testing

1. Test email/password signup and login
2. Test OAuth providers
3. Test password reset flow
4. Test protected routes
5. Test session persistence

## Troubleshooting

### Common Issues:

1. **OAuth redirect errors**: Check redirect URLs in provider settings
2. **Email not sending**: Verify SMTP settings in Supabase
3. **Session issues**: Check cookie settings and middleware
4. **CORS errors**: Verify allowed origins in Supabase

## Next Steps

1. Implement user profile management
2. Add two-factor authentication
3. Implement team/organization management
4. Add audit logging
5. Set up user analytics