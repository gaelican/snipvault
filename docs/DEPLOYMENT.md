# SnipVault Deployment Guide

This guide walks you through deploying SnipVault to production using Vercel for hosting and Supabase for the backend.

## Prerequisites

Before deploying, ensure you have:

- A [Vercel](https://vercel.com) account
- A [Supabase](https://supabase.com) account
- A [Stripe](https://stripe.com) account (for billing features)
- An [OpenAI](https://openai.com) API key (for AI features)
- A GitHub/GitLab/Bitbucket repository with your code

## Step 1: Set Up Supabase

### 1.1 Create a New Project

1. Log in to [Supabase Dashboard](https://app.supabase.com)
2. Click "New Project"
3. Fill in:
   - Project name: `snipvault-production`
   - Database password: Generate a strong password
   - Region: Choose closest to your users
   - Pricing plan: Choose based on needs

### 1.2 Configure Database

1. Navigate to SQL Editor in your project
2. Run the schema migrations:

```sql
-- Run the contents of lib/supabase/schema.sql
-- This creates all necessary tables and relationships
```

3. Run additional migrations:

```sql
-- Run the contents of lib/supabase/migrations/002_usage_records.sql
-- Run the contents of lib/supabase/ai-schema.sql
```

### 1.3 Configure Authentication

1. Go to Authentication → Settings
2. Configure email settings:
   - Enable email confirmations
   - Set up SMTP if using custom domain
   - Customize email templates

3. Configure OAuth providers (optional):
   - GitHub
   - Google
   - GitLab

### 1.4 Set Up Storage

1. Go to Storage
2. Create buckets:
   - `avatars` - For user profile pictures
   - `snippets` - For snippet attachments (if needed)

3. Set bucket policies:

```sql
-- Allow authenticated users to upload their own avatars
CREATE POLICY "Users can upload own avatar" ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Allow public read access to avatars
CREATE POLICY "Avatars are publicly accessible" ON storage.objects
FOR SELECT TO public
USING (bucket_id = 'avatars');
```

### 1.5 Enable Row Level Security (RLS)

For each table, enable RLS and create appropriate policies:

```sql
-- Example for snippets table
ALTER TABLE snippets ENABLE ROW LEVEL SECURITY;

-- Users can view their own private snippets
CREATE POLICY "Users can view own snippets" ON snippets
FOR SELECT TO authenticated
USING (auth.uid() = user_id OR visibility != 'private');

-- Users can insert their own snippets
CREATE POLICY "Users can create snippets" ON snippets
FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Users can update their own snippets
CREATE POLICY "Users can update own snippets" ON snippets
FOR UPDATE TO authenticated
USING (auth.uid() = user_id);

-- Users can delete their own snippets
CREATE POLICY "Users can delete own snippets" ON snippets
FOR DELETE TO authenticated
USING (auth.uid() = user_id);
```

### 1.6 Get Connection Details

From your Supabase project settings, note down:
- Project URL: `NEXT_PUBLIC_SUPABASE_URL`
- Anon Key: `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Service Role Key: `SUPABASE_SERVICE_ROLE_KEY`

## Step 2: Set Up Stripe

### 2.1 Create Products and Prices

1. Log in to [Stripe Dashboard](https://dashboard.stripe.com)
2. Navigate to Products
3. Create products:
   - Free Tier (optional, for tracking)
   - Pro Plan ($9.99/month)
   - Team Plan ($29.99/month)

4. For each product, create prices:
   - Monthly billing
   - Annual billing (optional, with discount)

### 2.2 Configure Webhooks

1. Go to Developers → Webhooks
2. Add endpoint:
   - URL: `https://your-domain.vercel.app/api/stripe/webhook`
   - Events to listen:
     - `checkout.session.completed`
     - `customer.subscription.created`
     - `customer.subscription.updated`
     - `customer.subscription.deleted`

3. Note down the webhook signing secret

### 2.3 Get API Keys

From Stripe Dashboard → Developers → API keys:
- Publishable key: `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- Secret key: `STRIPE_SECRET_KEY`
- Webhook secret: `STRIPE_WEBHOOK_SECRET`

## Step 3: Prepare Your Repository

### 3.1 Environment Variables

Create a `.env.production` file (don't commit this!):

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# OpenAI
OPENAI_API_KEY=your-openai-api-key

# Stripe
STRIPE_SECRET_KEY=your-stripe-secret-key
STRIPE_WEBHOOK_SECRET=your-webhook-secret
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your-publishable-key

# App Configuration
NEXT_PUBLIC_APP_URL=https://your-domain.vercel.app
```

### 3.2 Update Configuration Files

Ensure your `next.config.js` is production-ready:

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['your-supabase-project.supabase.co'],
  },
  // Add any other production configurations
}

module.exports = nextConfig
```

### 3.3 Build and Test Locally

```bash
# Install dependencies
npm install

# Build the project
npm run build

# Test the production build
npm run start
```

## Step 4: Deploy to Vercel

### 4.1 Import Project

1. Log in to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "New Project"
3. Import your Git repository
4. Configure project:
   - Framework Preset: Next.js
   - Root Directory: `./` (or your project root)
   - Build Command: `npm run build` (default)
   - Output Directory: `.next` (default)

### 4.2 Configure Environment Variables

In Vercel project settings → Environment Variables, add all variables from your `.env.production`:

```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
OPENAI_API_KEY
STRIPE_SECRET_KEY
STRIPE_WEBHOOK_SECRET
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
NEXT_PUBLIC_APP_URL
```

### 4.3 Deploy

1. Click "Deploy"
2. Wait for the build to complete
3. Visit your deployment URL to verify

## Step 5: Post-Deployment Configuration

### 5.1 Update Supabase URLs

In Supabase Dashboard → Authentication → URL Configuration:
- Site URL: `https://your-domain.vercel.app`
- Redirect URLs: 
  - `https://your-domain.vercel.app/auth/callback`
  - `https://your-domain.vercel.app/reset-password`

### 5.2 Update Stripe Webhook URL

Update the webhook endpoint URL to your production domain.

### 5.3 Configure Custom Domain (Optional)

1. In Vercel project settings → Domains
2. Add your custom domain
3. Follow DNS configuration instructions
4. Update `NEXT_PUBLIC_APP_URL` environment variable

### 5.4 Set Up Monitoring

1. Enable Vercel Analytics (optional)
2. Set up error tracking (e.g., Sentry)
3. Configure uptime monitoring

## Step 6: Production Checklist

Before going live, ensure:

- [ ] All environment variables are set correctly
- [ ] Database migrations are run
- [ ] RLS policies are enabled and tested
- [ ] Stripe products and webhooks are configured
- [ ] Email templates are customized
- [ ] Custom domain is configured (if applicable)
- [ ] SSL certificates are active
- [ ] Rate limiting is configured
- [ ] Error pages (404, 500) are customized
- [ ] SEO metadata is configured
- [ ] Analytics are set up
- [ ] Backup strategy is in place

## Deployment Commands

### Quick Deploy

```bash
# Deploy to production
vercel --prod

# Deploy to preview
vercel
```

### Using GitHub Actions

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Vercel

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Install dependencies
        run: npm ci
        
      - name: Run tests
        run: npm test
        
      - name: Build
        run: npm run build
        
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'
```

## Troubleshooting

### Common Issues

1. **Build Failures**
   - Check Node.js version compatibility
   - Verify all dependencies are installed
   - Check for TypeScript errors

2. **Database Connection Issues**
   - Verify Supabase URLs and keys
   - Check RLS policies
   - Ensure migrations are run

3. **Authentication Problems**
   - Verify redirect URLs in Supabase
   - Check cookie settings for your domain
   - Ensure email settings are configured

4. **Stripe Integration Issues**
   - Verify webhook signatures
   - Check product IDs match
   - Ensure webhook endpoint is accessible

### Debug Mode

Enable debug logging by adding:

```env
NODE_ENV=production
DEBUG=true
```

## Scaling Considerations

As your application grows:

1. **Database Optimization**
   - Add appropriate indexes
   - Consider connection pooling
   - Monitor query performance

2. **Caching Strategy**
   - Implement Redis for session storage
   - Use Vercel Edge Cache
   - Cache expensive API calls

3. **Cost Optimization**
   - Monitor Vercel bandwidth usage
   - Optimize image delivery
   - Implement efficient data fetching

## Security Best Practices

1. **Environment Variables**
   - Never commit secrets to Git
   - Use different keys for development/production
   - Rotate keys regularly

2. **API Security**
   - Implement rate limiting
   - Validate all inputs
   - Use HTTPS everywhere

3. **Database Security**
   - Keep RLS policies strict
   - Regular security audits
   - Monitor for suspicious activity

## Backup and Recovery

1. **Database Backups**
   - Enable Supabase automatic backups
   - Create manual backups before major changes
   - Test recovery procedures

2. **Code Backups**
   - Use Git tags for releases
   - Keep deployment history in Vercel
   - Document rollback procedures

## Maintenance

Regular maintenance tasks:

- Update dependencies monthly
- Review and optimize database queries
- Monitor error logs and fix issues
- Update documentation
- Review and update security policies

## Support

If you encounter issues:

1. Check Vercel deployment logs
2. Review Supabase logs
3. Check browser console for client-side errors
4. Review server logs in Vercel Functions tab
5. Consult the documentation

For additional help, please open an issue in the GitHub repository.