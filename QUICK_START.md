# 🚀 SnipVault Quick Start Guide

Welcome to SnipVault! Your AI-powered code snippet manager is ready to launch.

## 📋 Prerequisites

1. **Supabase Account** (free tier works)
   - Create project at https://supabase.com
   - Get your API keys from project settings

2. **Stripe Account** (test mode for development)
   - Sign up at https://stripe.com
   - Get test API keys from dashboard

3. **OpenAI API Key**
   - Get from https://platform.openai.com

## 🛠️ Setup Steps

### 1. Configure Environment Variables

```bash
cp .env.example .env.local
```

Edit `.env.local` with your actual values:

```env
# Supabase (Required)
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-key

# OpenAI (Required for AI features)
OPENAI_API_KEY=your-openai-key

# Stripe (Required for payments)
STRIPE_SECRET_KEY=your-stripe-secret-key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your-stripe-publishable-key
STRIPE_WEBHOOK_SECRET=your-webhook-secret
```

### 2. Setup Database

1. Go to Supabase SQL Editor
2. Run these scripts in order:
   - Copy contents of `lib/supabase/schema.sql`
   - Copy contents of `lib/supabase/ai-schema.sql`
   - Copy contents of `lib/supabase/migrations/002_usage_records.sql`

### 3. Configure Authentication

In Supabase Dashboard:
1. Go to Authentication → Providers
2. Enable Email provider
3. (Optional) Enable Google OAuth - see `docs/AUTH_SETUP.md`
4. (Optional) Enable GitHub OAuth - see `docs/AUTH_SETUP.md`

### 4. Setup Stripe Products

1. In Stripe Dashboard, create products:
   - **Individual Plan**: $9/month
   - **Team Plan**: $19/month
2. Copy the price IDs
3. Update price IDs in `lib/stripe/client.ts`

### 5. Install Dependencies

```bash
npm install
```

### 6. Run Development Server

```bash
npm run dev
```

Visit http://localhost:3000 🎉

## 🧪 Test the Application

1. **Create an account** using email/password
2. **Create a snippet** from the dashboard
3. **Try AI generation** (requires OpenAI API key)
4. **Test subscription** upgrade (use Stripe test card: 4242 4242 4242 4242)

## 📱 CLI Tool

To use the CLI tool:

```bash
cd cli
npm install
npm run build
npm link
snipvault --help
```

## 🚀 Deploy to Production

See `docs/DEPLOYMENT.md` for detailed deployment instructions.

## 📚 Documentation

- **Architecture**: `docs/ARCHITECTURE.md`
- **API Reference**: `docs/API.md`
- **Contributing**: `docs/CONTRIBUTING.md`
- **Testing**: `docs/TESTING.md`

## 🆘 Troubleshooting

### Common Issues:

1. **Build errors in Termux**: The SWC binary warning is expected and won't affect development
2. **Database connection issues**: Check Supabase URL and keys
3. **AI features not working**: Verify OpenAI API key and check usage limits
4. **Payment issues**: Ensure Stripe keys are for the same environment (test/live)

### Need Help?

- Check existing documentation in `/docs`
- Review example code in `/examples`
- Test with the CLI tool for API debugging

## 🎯 Next Steps

1. Customize the landing page content
2. Add your logo and branding
3. Configure email templates in Supabase
4. Set up analytics tracking
5. Deploy to production!

Happy coding! 🚀