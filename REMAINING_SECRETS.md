# 🔐 Remaining Secrets to Add

## ✅ Already Set Up:
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID` = snipvault-87c32
- `FIREBASE_PROJECT_ID` = snipvault-87c32  
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` = snipvault-87c32.firebaseapp.com
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` = snipvault-87c32.appspot.com

## ❗ Still Need to Add:

Go to: https://github.com/gaelican/snipvault/settings/secrets/actions

### From Firebase Console (Project Settings → Your apps):
1. **NEXT_PUBLIC_FIREBASE_API_KEY**
   - Example: `AIzaSyDOCAbC123dEf456GhI789jKl01-MnO`

2. **NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID**
   - Example: `65211879809`

3. **NEXT_PUBLIC_FIREBASE_APP_ID**
   - Example: `1:65211879909:web:3ae38ef1cdcb2e01fe5f0c`

### From Service Account JSON (Project Settings → Service Accounts):
4. **FIREBASE_SERVICE_ACCOUNT**
   - The entire service account JSON file encoded as base64
   - Use https://www.base64encode.org to convert

5. **FIREBASE_CLIENT_EMAIL**
   - From JSON: `"client_email": "firebase-adminsdk-xxxxx@snipvault-87c32.iam.gserviceaccount.com"`

6. **FIREBASE_PRIVATE_KEY**
   - From JSON: `"private_key": "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"`
   - ⚠️ IMPORTANT: Keep all the \n characters!

### Optional (for full features):
7. **OPENAI_API_KEY** (for AI features)
   - Get from: https://platform.openai.com/api-keys

8. **STRIPE_SECRET_KEY** (for payments)
   - Get from: https://dashboard.stripe.com/test/apikeys

9. **NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY**
   - Get from: https://dashboard.stripe.com/test/apikeys

## 🚀 After Adding Secrets:

1. Go to: https://github.com/gaelican/snipvault/actions
2. Click on any failed workflow
3. Click "Re-run all jobs"
4. Watch it deploy!

Or trigger a new deployment:
```bash
cd /data/data/com.termux/files/home/snipvault
git commit --allow-empty -m "Trigger deployment"
git push
```

## 📍 Your App URLs:
- Primary: https://snipvault-87c32.web.app
- Alternative: https://snipvault-87c32.firebaseapp.com

The deployment will start automatically once all required secrets are added!