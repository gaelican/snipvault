# 🔐 Firebase Service Account Setup

## Getting Your Service Account

Since we can't retrieve the service account automatically from Termux, you'll need to:

1. **Go to Firebase Console**
   - https://console.firebase.google.com/project/snipvault-87c32/settings/serviceaccounts/adminsdk

2. **Generate Private Key**
   - Click "Generate new private key"
   - Click "Generate key"
   - Save the downloaded JSON file

3. **Extract Required Values**

The JSON file will look like this:
```json
{
  "type": "service_account",
  "project_id": "snipvault-87c32",
  "private_key_id": "...",
  "private_key": "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n",
  "client_email": "firebase-adminsdk-xxxxx@snipvault-87c32.iam.gserviceaccount.com",
  "client_id": "...",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "..."
}
```

## Standard Firebase Service Account Format

Based on your project ID `snipvault-87c32`, the client email typically follows this pattern:
- `firebase-adminsdk-[UNIQUE_ID]@snipvault-87c32.iam.gserviceaccount.com`

The UNIQUE_ID is a 5-character alphanumeric string that's specific to your service account.

## Setting the Secrets

### Option 1: Using GitHub Web UI (Easiest)

1. Go to: https://github.com/gaelican/snipvault/settings/secrets/actions

2. Add these secrets:
   - **FIREBASE_CLIENT_EMAIL**: Copy from `client_email` in JSON
   - **FIREBASE_PRIVATE_KEY**: Copy from `private_key` in JSON (keep all \n characters)
   - **FIREBASE_SERVICE_ACCOUNT**: Base64 encode the entire JSON file

### Option 2: Using Command Line

If you have the JSON file on your computer:

```bash
# Extract client email
CLIENT_EMAIL=$(jq -r '.client_email' service-account.json)

# Extract private key
PRIVATE_KEY=$(jq -r '.private_key' service-account.json)

# Base64 encode the entire file
BASE64_SA=$(base64 < service-account.json | tr -d '\n')

# Set secrets using GitHub CLI
gh secret set FIREBASE_CLIENT_EMAIL --body="$CLIENT_EMAIL" --repo=gaelican/snipvault
gh secret set FIREBASE_PRIVATE_KEY --body="$PRIVATE_KEY" --repo=gaelican/snipvault
gh secret set FIREBASE_SERVICE_ACCOUNT --body="$BASE64_SA" --repo=gaelican/snipvault
```

## Quick Base64 Encoding

### Online Tool:
1. Go to https://www.base64encode.org
2. Upload or paste your service account JSON
3. Click "Encode"
4. Copy the result

### Command Line (macOS/Linux):
```bash
base64 -i service-account.json > encoded.txt
# or
cat service-account.json | base64 | tr -d '\n'
```

### Windows PowerShell:
```powershell
[Convert]::ToBase64String([System.IO.File]::ReadAllBytes("service-account.json"))
```

## Verification

After adding all secrets, trigger a deployment:
```bash
cd /data/data/com.termux/files/home/snipvault
git commit --allow-empty -m "Test deployment with service account"
git push
```

Your app will be live at:
- https://snipvault-87c32.web.app
- https://snipvault-87c32.firebaseapp.com