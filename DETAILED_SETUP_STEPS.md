# 🚀 Detailed Setup Steps for SnipVault

## 📍 Current Status
- ✅ Code pushed to: https://github.com/gaelican/snipvault
- ⏳ Waiting for: Firebase configuration
- 🔄 GitHub Actions: Ready to deploy automatically

## 🔥 Step-by-Step Firebase Setup

### Step 1: Create Firebase Project (5 minutes)

1. **Open Firebase Console**
   - Go to: https://console.firebase.google.com
   - Sign in with your Google account

2. **Create New Project**
   - Click "Create a project" or "Add project"
   - Project name: `snipvault` (or `snipvault-prod`)
   - Accept terms and click Continue
   - Disable Google Analytics (optional, you can enable later)
   - Click "Create project"
   - Wait for creation (~30 seconds)

### Step 2: Enable Required Services (5 minutes)

#### A. Authentication Setup
1. In Firebase Console, click **Authentication** in left sidebar
2. Click **Get started**
3. Under Sign-in providers:
   - Click **Email/Password**
   - Enable **Email/Password** (first toggle)
   - Save
   
4. (Optional) Enable OAuth providers:
   - Click **Add new provider**
   - Select **Google**:
     - Enable and click Save
   - Select **GitHub**:
     - Enable
     - You'll need GitHub OAuth App (see below)
     - Add Client ID and Secret
     - Copy the callback URL for GitHub

#### B. Firestore Database Setup
1. Click **Firestore Database** in left sidebar
2. Click **Create database**
3. Choose **Start in production mode**
4. Select location:
   - Choose closest to your users
   - Common: `us-central1`, `europe-west1`, `asia-southeast1`
5. Click **Enable**
6. Wait for provisioning (~1 minute)

#### C. Firebase Hosting Setup
1. Click **Hosting** in left sidebar
2. Click **Get started**
3. **Skip all the CLI steps** (click Next → Continue to console)
4. You'll see "You haven't deployed your site yet" - that's OK!

### Step 3: Get Firebase Configuration (2 minutes)

1. Click the **gear icon** ⚙️ → **Project settings**
2. Scroll down to **Your apps** section
3. Click the **Web** icon (looks like `</>`)
4. App nickname: `SnipVault Web`
5. ✅ Check "Also set up Firebase Hosting"
6. Click **Register app**
7. You'll see a code block with `firebaseConfig` - **COPY THIS ENTIRE OBJECT**

Example format:
```javascript
const firebaseConfig = {
  apiKey: "AIzaSyDOCAbC123dEf456GhI789jKl01-MnO",
  authDomain: "myapp-project-123.firebaseapp.com",
  projectId: "myapp-project-123",
  storageBucket: "myapp-project-123.appspot.com",
  messagingSenderId: "65211879809",
  appId: "1:65211879909:web:3ae38ef1cdcb2e01fe5f0c",
  measurementId: "G-8GSGZQ44ST"
};
```

8. Click **Continue to console**

### Step 4: Generate Service Account Key (3 minutes)

1. Still in **Project settings**
2. Click **Service accounts** tab
3. Under Firebase Admin SDK:
   - Node.js should be selected
   - Click **Generate new private key**
   - Click **Generate key** in the popup
   - A JSON file will download

4. **Convert Service Account to Base64:**
   
   Option A - Using online tool (easier):
   - Go to https://www.base64encode.org
   - Click "Choose File" and select your JSON
   - Click "Encode"
   - Copy the entire base64 string

   Option B - Using command line:
   ```bash
   # macOS
   base64 -i service-account.json | pbcopy
   
   # Linux
   base64 service-account.json | xclip -selection clipboard
   
   # Windows PowerShell
   [Convert]::ToBase64String([System.IO.File]::ReadAllBytes("service-account.json")) | Set-Clipboard
   ```

### Step 5: Add GitHub Secrets (10 minutes)

1. Go to: https://github.com/gaelican/snipvault/settings/secrets/actions
2. For each secret below, click **New repository secret**

#### Required Firebase Secrets:

From your Firebase config object, add these secrets:

| Secret Name | Value | Example |
|------------|-------|---------|
| `NEXT_PUBLIC_FIREBASE_API_KEY` | apiKey value | AIzaSyDOCAbC123... |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | authDomain value | myapp-project-123.firebaseapp.com |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | projectId value | myapp-project-123 |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | storageBucket value | myapp-project-123.appspot.com |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | messagingSenderId value | 65211879809 |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | appId value | 1:65211879909:web:3ae38... |

From your service account JSON, add:

| Secret Name | Value | Where to find |
|------------|-------|---------------|
| `FIREBASE_SERVICE_ACCOUNT` | Base64 encoded JSON | The entire base64 string |
| `FIREBASE_PROJECT_ID` | project_id | In the JSON: `"project_id": "..."` |
| `FIREBASE_CLIENT_EMAIL` | client_email | In the JSON: `"client_email": "..."` |
| `FIREBASE_PRIVATE_KEY` | private_key | In the JSON: `"private_key": "..."` (include \n) |

#### Optional but Recommended:

| Secret Name | Value | Get from |
|------------|-------|----------|
| `OPENAI_API_KEY` | sk-... | https://platform.openai.com/api-keys |
| `STRIPE_SECRET_KEY` | sk_test_... | https://dashboard.stripe.com/test/apikeys |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | pk_test_... | Same Stripe page |

### Step 6: Trigger Deployment (2 minutes)

After adding all secrets:

1. Go to: https://github.com/gaelican/snipvault/actions
2. You might see a failed workflow (from before secrets were added)
3. Click on the failed workflow
4. Click **Re-run all jobs**
5. Watch the deployment progress!

OR trigger manually:
```bash
# In Termux
cd /data/data/com.termux/files/home/snipvault
echo "# Trigger deployment" >> README.md
git add README.md
git commit -m "Trigger deployment"
git push
```

### Step 7: Verify Deployment (5 minutes)

1. Watch the GitHub Action:
   - Green checkmark = Success!
   - Red X = Check logs for errors

2. Once successful, your app is live at:
   - `https://[YOUR-PROJECT-ID].web.app`
   - `https://[YOUR-PROJECT-ID].firebaseapp.com`

3. Test the app:
   - Visit the URL
   - Try creating an account
   - Create a test snippet

### Step 8: Deploy Security Rules (Optional but Important)

The app will work without this, but for production security:

1. On a computer with Node.js:
```bash
npm install -g firebase-tools
firebase login
git clone https://github.com/gaelican/snipvault
cd snipvault
firebase use [YOUR-PROJECT-ID]
firebase deploy --only firestore:rules,firestore:indexes
```

## 🎯 Quick Checklist

- [ ] Firebase project created
- [ ] Authentication enabled
- [ ] Firestore database created  
- [ ] Web app registered
- [ ] Firebase config copied
- [ ] Service account generated
- [ ] Service account converted to base64
- [ ] All GitHub secrets added (10 required)
- [ ] Deployment triggered
- [ ] App accessible at Firebase URL

## 🚨 Common Issues & Solutions

### "Module not found" errors
- Make sure all secrets are added correctly
- Check for typos in secret names

### "Permission denied" errors  
- Verify service account has proper permissions
- Check FIREBASE_PRIVATE_KEY includes \n characters

### Build succeeds but site shows 404
- Wait 5-10 minutes for Firebase to propagate
- Check Firebase Hosting dashboard

### Authentication not working
- Ensure Email/Password is enabled in Firebase
- Check AUTH_DOMAIN secret matches exactly

## 🎉 Success Indicators

You'll know it's working when:
1. GitHub Actions shows green checkmark
2. Firebase Hosting shows "Live" status
3. You can visit the URL and see SnipVault
4. You can create an account and log in
5. You can create and save snippets

## 📞 Need Help?

- Check GitHub Actions logs for specific errors
- Firebase Console shows service status
- Create an issue at: https://github.com/gaelican/snipvault/issues

Your SnipVault app will be live and auto-deploy on every push! 🚀