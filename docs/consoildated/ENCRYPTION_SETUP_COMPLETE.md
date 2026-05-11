# ✅ Encryption Setup Complete

## What Changed

Service account JSON credentials are now **encrypted at rest** in the Webflow Cloud D1 database using AES-GCM encryption.

### Implementation Details

- **Encryption Library**: Web Crypto API (Cloudflare Workers compatible)
- **Algorithm**: AES-GCM (256-bit key, 96-bit IV)
- **Key Storage**: Environment variable (`ENCRYPTION_KEY`)
- **Encryption Points**: 
  - When saving hotel configuration (POST `/api/admin/hotels`)
  - Decryption when fetching credentials (GET `/api/admin/hotels/[hotel_code]/credentials`)

## Setup Instructions for Webflow Cloud

### 1. Generate a Strong Encryption Key

Run this command to generate a secure 32-character encryption key:

```bash
openssl rand -base64 32
```

Copy the output (it will look something like: `xK8v2Qm9Pn7Lw4Rt6Yz1Ac3Bd5Ef8Gh0Ij2Kl4Mn6Op`)

### 2. Add to Webflow Cloud Dashboard

1. Go to your app in Webflow Cloud
2. Navigate to **App Settings** → **Environment Variables**
3. Add a new variable:
   - **Name**: `ENCRYPTION_KEY`
   - **Value**: [paste the generated key]
4. Save and redeploy your app

### 3. Verify Encryption

After deploying with the encryption key:

1. Go to your deployed admin panel: `https://[your-app].webflow.io/admin`
2. Save a new hotel configuration
3. Check the Webflow Cloud D1 database console
4. The `service_account_json` column should show encrypted data (long base64 string), not readable JSON

## Local Development

The encryption key is already set in your `.env` file:

```
ENCRYPTION_KEY=dev-key-12345678901234567890123456789012
```

⚠️ **Never use the dev key in production!** Always generate a new one for Webflow Cloud.

## Security Notes

✅ **What's Protected**:
- Service account JSON is encrypted before storage
- Encryption key stored as environment variable (not in code)
- Decryption only happens server-side when executing queries
- D1 database also has encryption at rest by default

⚠️ **Important**:
- Never commit the production encryption key to git
- Rotate the key periodically (will require re-encrypting existing data)
- Keep backups of the encryption key in a secure location (1Password, etc.)

## Troubleshooting

### "Encryption key not configured" Error

Make sure `ENCRYPTION_KEY` is set in:
- **Production**: Webflow Cloud dashboard → App Settings → Environment Variables
- **Local**: `.env` file in project root

### "Failed to decrypt data" Error

This means the data was encrypted with a different key. You'll need to:
1. Delete the hotel configuration
2. Re-save it with the correct encryption key active

## Next Steps

Your database is now secure! You can:

1. Deploy to Webflow Cloud
2. Set the ENCRYPTION_KEY in the dashboard
3. Save your hotel configurations from the deployed admin panel
4. Verify encryption in the D1 database console

All sensitive credentials are now encrypted at rest. ✅
