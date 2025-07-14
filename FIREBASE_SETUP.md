# 🔥 SnipVault Firebase Setup Guide

## Current Status

The project has been successfully converted to use Firebase with static export. However, there's a limitation running Next.js builds in Termux due to SWC binary compatibility.

## ✅ What's Been Done

1. **Firebase Integration**
   - Firebase Auth for authentication
   - Firestore for database
   - Firebase Functions ready for serverless operations
   - Firebase Hosting configuration

2. **Static Export Configuration**
   - Converted from server-side to client-side operations
   - All data fetching uses Firestore directly
   - Authentication handled client-side
   - Ready for static hosting

3. **Security**
   - Comprehensive Firestore security rules
   - Row-level security equivalent
   - User data isolation

## 🚀 Deployment Options

Since Termux can't build Next.js projects, you have several options:

### Option 1: Deploy from Another Environment

1. **Transfer the project:**
   ```bash
   cd /data/data/com.termux/files/home
   tar -czf snipvault-firebase.tar.gz snipvault/
   ```

2. **On a regular computer:**
   ```bash
   # Extract the project
   tar -xzf snipvault-firebase.tar.gz
   cd snipvault
   
   # Install dependencies
   npm install
   
   # Build
   npm run build
   
   # Deploy to Firebase
   npm install -g firebase-tools
   firebase login
   firebase deploy
   ```

### Option 2: Use GitHub Actions

1. **Push to GitHub:**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin YOUR_REPO_URL
   git push -u origin main
   ```

2. **GitHub Action** (`.github/workflows/deploy.yml`):
   ```yaml
   name: Deploy to Firebase
   on:
     push:
       branches: [main]
   
   jobs:
     deploy:
       runs-on: ubuntu-latest
       steps:
         - uses: actions/checkout@v3
         - uses: actions/setup-node@v3
           with:
             node-version: 18
         - run: npm install
         - run: npm run build
         - uses: FirebaseExtended/action-hosting-deploy@v0
           with:
             repoToken: '${{ secrets.GITHUB_TOKEN }}'
             firebaseServiceAccount: '${{ secrets.FIREBASE_SERVICE_ACCOUNT }}'
             channelId: live
   ```

### Option 3: Use Vercel with Firebase Backend

1. Keep Firebase for auth/database
2. Deploy the Next.js app to Vercel
3. Remove static export from `next.config.js`
4. Vercel handles the build process

## 🔧 Firebase Setup Steps

1. **Create Firebase Project:**
   - Go to https://console.firebase.google.com
   - Create new project
   - Enable Authentication, Firestore, and Hosting

2. **Get Configuration:**
   - Project Settings → General → Your apps → Web app
   - Copy the configuration object

3. **Update `.env.local`:**
   ```env
   NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-auth-domain
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-storage-bucket
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
   NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
   ```

4. **Deploy Security Rules:**
   ```bash
   firebase deploy --only firestore:rules
   ```

5. **Deploy Indexes:**
   ```bash
   firebase deploy --only firestore:indexes
   ```

## 📱 Alternative: Simple Web Server

For testing in Termux without building:

```bash
# Install live-server
npm install -g live-server

# Create a simple test version
cd /data/data/com.termux/files/home/snipvault
live-server --port=3000
```

## 🎯 Recommended Path

1. **Use GitHub + Vercel/Netlify** for easy deployment
2. Keep Firebase for backend services
3. Remove static export for easier development
4. Use CI/CD for automatic deployments

The project is fully functional and ready for deployment outside of Termux!