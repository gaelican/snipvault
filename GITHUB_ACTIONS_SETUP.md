# 🚀 GitHub Actions Setup for SnipVault

This guide will help you set up automated deployment to Firebase Hosting using GitHub Actions.

## Prerequisites

1. GitHub account and repository
2. Firebase project created
3. Firebase CLI installed locally (for initial setup)

## Step 1: Create GitHub Repository

```bash
# Initialize git repository
cd /data/data/com.termux/files/home/snipvault
git init

# Add all files
git add .

# Create initial commit
git commit -m "Initial commit: SnipVault with Firebase"

# Create repository on GitHub, then:
git remote add origin https://github.com/YOUR_USERNAME/snipvault.git
git push -u origin main
```

## Step 2: Get Firebase Service Account

1. Go to Firebase Console → Project Settings → Service Accounts
2. Click "Generate new private key"
3. Download the JSON file
4. Convert the JSON to a single line:
   ```bash
   # On your computer (not Termux)
   cat service-account.json | jq -c . | base64
   ```

## Step 3: Set Up GitHub Secrets

Go to your GitHub repository → Settings → Secrets and variables → Actions → New repository secret

Add the following secrets:

### Firebase Configuration (from Firebase Console)
- `NEXT_PUBLIC_FIREBASE_API_KEY` - Your Firebase API key
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` - Your Firebase auth domain
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID` - Your Firebase project ID
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` - Your Firebase storage bucket
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` - Your messaging sender ID
- `NEXT_PUBLIC_FIREBASE_APP_ID` - Your Firebase app ID
- `NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID` - Your analytics measurement ID (optional)

### Firebase Admin (for deployment)
- `FIREBASE_SERVICE_ACCOUNT` - The base64 encoded service account JSON
- `FIREBASE_PROJECT_ID` - Your Firebase project ID (again, for admin)
- `FIREBASE_CLIENT_EMAIL` - Service account email
- `FIREBASE_PRIVATE_KEY` - Service account private key (include the \n characters)

### External Services (optional)
- `OPENAI_API_KEY` - Your OpenAI API key
- `STRIPE_SECRET_KEY` - Your Stripe secret key
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` - Your Stripe publishable key
- `STRIPE_WEBHOOK_SECRET` - Your Stripe webhook secret

## Step 4: Initialize Firebase Hosting

Run these commands on your local computer (not Termux):

```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login to Firebase
firebase login

# Initialize hosting (select existing project)
firebase init hosting

# When prompted:
# - Use 'out' as public directory
# - Configure as single-page app: Yes
# - Don't overwrite index.html
```

## Step 5: Update Package Scripts

The `package.json` already includes the necessary scripts:
- `npm run build` - Builds the static export
- `npm run lint` - Runs ESLint
- `npm run type-check` - Runs TypeScript checking

## Step 6: Push to GitHub

```bash
# Add the GitHub Actions workflows
git add .github/
git commit -m "Add GitHub Actions workflows"
git push origin main
```

## Step 7: Monitor Deployment

1. Go to your GitHub repository
2. Click on the "Actions" tab
3. Watch the workflow run
4. Once complete, your app will be live at:
   - `https://YOUR-PROJECT-ID.web.app`
   - `https://YOUR-PROJECT-ID.firebaseapp.com`

## Workflow Files Created

### `.github/workflows/deploy.yml`
- Triggers on push to main branch
- Builds the Next.js application
- Deploys to Firebase Hosting
- Uses Firebase service account for authentication

### `.github/workflows/ci.yml`
- Runs on all pushes and pull requests
- Performs linting and type checking
- Runs tests
- Builds the application to verify it compiles

## Troubleshooting

### Build Failures
- Check the Actions tab for error logs
- Ensure all secrets are set correctly
- Verify package.json scripts work locally

### Firebase Deployment Issues
- Ensure service account has proper permissions
- Check Firebase project ID matches in all secrets
- Verify Firebase hosting is initialized

### Environment Variables
- All `NEXT_PUBLIC_*` variables are available client-side
- Server-only variables won't work with static export
- Check `.env.local.example` for required variables

## Local Testing

To test the build locally:

```bash
# Create .env.local with your values
cp .env.local.example .env.local

# Install dependencies
npm install --legacy-peer-deps

# Build the application
npm run build

# Test the static output
npx serve out
```

## Success! 🎉

Once set up, every push to the main branch will:
1. Run CI checks (linting, type checking, tests)
2. Build the static Next.js application
3. Deploy to Firebase Hosting automatically

Your SnipVault app will be live and automatically updated with each commit!