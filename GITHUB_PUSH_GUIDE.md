# 📤 Push SnipVault to GitHub

## Step 1: Create GitHub Repository

1. Go to https://github.com/new
2. Create a new repository:
   - Repository name: `snipvault`
   - Description: "AI-powered code snippet manager for developers"
   - Public or Private (your choice)
   - **DON'T** initialize with README, .gitignore, or license

## Step 2: Push Your Code

The repository is already initialized with a commit. Now push it:

```bash
# Add your GitHub repository as remote
git remote add origin https://github.com/YOUR_USERNAME/snipvault.git

# Push to GitHub
git push -u origin main
```

If you haven't set up GitHub authentication in Termux:

### Option A: Use Personal Access Token (Recommended)
1. Go to GitHub → Settings → Developer settings → Personal access tokens
2. Generate new token with `repo` scope
3. When pushing, use your GitHub username and the token as password

### Option B: Use GitHub CLI
```bash
# Install GitHub CLI in Termux
pkg install gh

# Authenticate
gh auth login

# Push using gh
git push -u origin main
```

## Step 3: Set Up Secrets

After pushing, go to your repository on GitHub:

1. Navigate to Settings → Secrets and variables → Actions
2. Add these repository secrets:

### Required Firebase Secrets:
```
NEXT_PUBLIC_FIREBASE_API_KEY
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
NEXT_PUBLIC_FIREBASE_PROJECT_ID
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
NEXT_PUBLIC_FIREBASE_APP_ID
FIREBASE_SERVICE_ACCOUNT
```

### Optional Service Secrets:
```
OPENAI_API_KEY
STRIPE_SECRET_KEY
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
STRIPE_WEBHOOK_SECRET
```

## Step 4: Get Firebase Service Account

1. Go to Firebase Console → Project Settings → Service Accounts
2. Click "Generate new private key"
3. Download the JSON file
4. Convert to base64:
   ```bash
   # On a computer (not Termux)
   base64 -i service-account.json | pbcopy  # macOS
   base64 service-account.json | xclip      # Linux
   ```
5. Paste as `FIREBASE_SERVICE_ACCOUNT` secret

## Step 5: Watch the Magic! 🎉

1. The GitHub Action will trigger automatically
2. Go to Actions tab in your repository
3. Watch the deployment progress
4. Once complete, your app will be live!

## Quick Commands Summary

```bash
# If you haven't pushed yet:
git remote add origin https://github.com/YOUR_USERNAME/snipvault.git
git push -u origin main

# To check remote:
git remote -v

# If you need to change remote:
git remote set-url origin https://github.com/YOUR_USERNAME/snipvault.git
```

## Troubleshooting

### Authentication Failed
- Use personal access token instead of password
- Make sure token has `repo` scope
- Try `gh auth login` for easier auth

### Push Rejected
- Make sure GitHub repo is empty (no README)
- If not empty, use: `git push -f origin main` (careful!)

### Actions Failed
- Check all secrets are set correctly
- Look at Actions tab for error details
- Ensure Firebase project exists

## Success Checklist

- [ ] Code pushed to GitHub
- [ ] All secrets configured
- [ ] Actions workflow running
- [ ] App deployed to Firebase
- [ ] Can access live URL

Your app will be available at:
- `https://YOUR-PROJECT-ID.web.app`
- `https://YOUR-PROJECT-ID.firebaseapp.com`