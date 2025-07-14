# Firebase Deployment Guide for SnipVault

This guide explains how to deploy SnipVault as a static site to Firebase Hosting.

## Prerequisites

1. Node.js and npm installed
2. Firebase CLI installed (`npm install -g firebase-tools`)
3. A Firebase project created at [Firebase Console](https://console.firebase.google.com)

## Setup Instructions

### 1. Environment Configuration

Copy the example environment file and add your Firebase configuration:

```bash
cp .env.local.example .env.local
```

The Firebase configuration is already set in the example file. If you're using your own Firebase project, update the values accordingly.

### 2. Firebase Project Setup

1. Login to Firebase CLI:
```bash
firebase login
```

2. Initialize Firebase in your project (if not already done):
```bash
firebase init
```

Select:
- Hosting: Configure files for Firebase Hosting
- Firestore: Deploy rules and create indexes
- Functions: Configure Cloud Functions (optional, for server-side operations)

3. When prompted:
- Use existing project or create new one
- Public directory: `out`
- Configure as single-page app: Yes
- Don't overwrite existing files

### 3. Firestore Setup

1. Enable Firestore in Firebase Console
2. Deploy security rules:
```bash
firebase deploy --only firestore:rules
```

3. Deploy indexes:
```bash
firebase deploy --only firestore:indexes
```

### 4. Authentication Setup

In Firebase Console:

1. Go to Authentication > Sign-in method
2. Enable the following providers:
   - Email/Password
   - Google
   - GitHub (requires GitHub OAuth app)

3. Add authorized domains:
   - localhost (for development)
   - Your Firebase Hosting domain
   - Any custom domains

### 5. Building the Application

#### For regular systems:
```bash
npm run build
```

#### For Termux:
```bash
./build-termux.sh
```

Or manually:
```bash
NODE_OPTIONS="--max-old-space-size=2048" npm run build
```

### 6. Testing Locally

Test the static build locally:
```bash
npm run start:static
```

Or with Firebase emulators:
```bash
firebase emulators:start
```

### 7. Deployment

Deploy to Firebase Hosting:
```bash
npm run firebase:deploy
```

Or deploy everything (hosting, rules, indexes):
```bash
npm run firebase:deploy:all
```

## Important Notes

### Static Export Limitations

Since this is a static export:
- No server-side rendering (SSR)
- No API routes - all operations use client-side Firestore
- Authentication is handled client-side
- Dynamic routes must be pre-generated or handled client-side

### Security Considerations

1. **Firestore Rules**: The security rules in `firestore.rules` are crucial for protecting your data. Review and test them thoroughly.

2. **API Keys**: The Firebase config keys in the frontend are meant to be public. Security is enforced through:
   - Authentication
   - Firestore security rules
   - Firebase App Check (optional but recommended)

3. **Sensitive Operations**: For operations requiring server-side security (like Stripe webhooks), use Firebase Functions.

### Performance Optimization

1. **Enable Firestore Offline Persistence**: Already configured in `lib/firebase/config.ts`

2. **Use Firebase Hosting CDN**: Automatically enabled with proper cache headers in `firebase.json`

3. **Optimize Images**: Since Next.js Image optimization is disabled for static export, consider:
   - Pre-optimizing images
   - Using Firebase Storage for user-uploaded images
   - Implementing client-side lazy loading

### Monitoring

1. Enable Firebase Analytics in your project
2. Use Firebase Performance Monitoring
3. Monitor Firestore usage in Firebase Console

## Troubleshooting

### Build Errors in Termux

If you encounter memory issues:
```bash
# Increase memory limit
export NODE_OPTIONS="--max-old-space-size=4096"
npm run build
```

### Authentication Issues

1. Check Firebase Console for authentication errors
2. Ensure redirect URIs are properly configured
3. Verify environment variables are loaded

### Firestore Permission Errors

1. Check security rules are deployed
2. Verify user authentication state
3. Use Firebase Console to test rules

### Deployment Failures

1. Ensure you're logged in: `firebase login`
2. Check project selection: `firebase use --add`
3. Verify build output exists in `out/` directory

## Next Steps

1. Set up custom domain in Firebase Hosting
2. Enable Firebase App Check for additional security
3. Configure Firebase Functions for server-side operations
4. Set up monitoring and alerts
5. Implement automated deployment with GitHub Actions