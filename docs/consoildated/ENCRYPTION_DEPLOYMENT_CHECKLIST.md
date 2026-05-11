# 🔐 Encryption Deployment Checklist

## ✅ What's Been Done

1. **Encryption Module Created** (`src/lib/encryption.ts`)
   - Uses Web Crypto API (Cloudflare Workers compatible)
   - AES-GCM 256-bit encryption
   - Encrypts/decrypts service account JSON

2. **API Endpoints Updated**
   - `POST /api/admin/hotels` - Encrypts credentials before storing
   - `GET /api/admin/hotels/[hotel_code]/credentials` - Decrypts when needed

3. **Configuration Added**
   - `wrangler.jsonc` - Added `ENCRYPTION_KEY` to vars
   - `.env` - Added dev encryption key for local testing

4. **Build Verified** ✅
   - No compilation errors
   - Ready to deploy

## 🚀 Deployment Steps

### Step 1: Generate Production Encryption Key

```bash
openssl rand -base64 32
```

**Save this key securely!** You'll need it if you ever migrate databases or restore from backup.

### Step 2: Set Environment Variable in Webflow Cloud

1. Go to Webflow Cloud dashboard
2. Select your app
3. Go to **Settings** → **Environment Variables**
4. Add:
   - **Name**: `ENCRYPTION_KEY`
   - **Value**: [paste the generated key from Step 1]
5. Click **Save**

### Step 3: Deploy Your App

```bash
# Commit changes
git add .
git commit -m "Add encryption for service account credentials"
git push

# Deploy to Webflow Cloud (or use their UI)
```

### Step 4: Initialize Production Database

**Option A: Using the Admin Panel**

1. Go to `https://[your-app].webflow.io/admin`
2. Click "Initialize Database" button
3. Wait for success message

**Option B: Direct API Call**

```bash
curl -X POST https://[your-app].webflow.io/api/admin/init-database
```

### Step 5: Add Your Hotel Configuration

1. Go to `https://[your-app].webflow.io/admin`
2. Fill in the form:
   - Hotel Code (e.g., "HOTEL001")
   - Hotel Name
   - BigQuery Project ID
   - Dataset ID (optional)
   - Table ID (optional)
   - Data Location (US, EU, etc.)
   - Service Account JSON (paste the entire JSON)
3. Click "Save Hotel Configuration"

### Step 6: Verify Encryption

**Check in Webflow Cloud Console:**

1. Go to your D1 database in Webflow Cloud
2. Open SQL editor
3. Run: `SELECT hotel_code, length(service_account_json) as encrypted_length FROM hotels`
4. You should see a large number (500+) for encrypted_length
5. The data should NOT be readable JSON

**Check via API:**

```bash
# This should return encrypted data (base64 string)
curl https://[your-app].webflow.io/api/admin/hotels
```

### Step 7: Test the Dashboard

1. Go to `https://[your-app].webflow.io/`
2. Select your hotel from the dropdown
3. The dashboard should load and display data

## 🔒 Security Verification Checklist

- [ ] `ENCRYPTION_KEY` set in Webflow Cloud (not hardcoded)
- [ ] Production key is different from dev key
- [ ] Production key saved securely (password manager)
- [ ] Database shows encrypted data (not readable JSON)
- [ ] Dashboard can decrypt and use credentials successfully
- [ ] No credentials exposed in client-side code
- [ ] No credentials in git history

## 🚨 Important Security Notes

### DO ✅

- Store production `ENCRYPTION_KEY` in password manager (1Password, etc.)
- Use different keys for dev/staging/production
- Rotate keys periodically (every 90 days recommended)
- Keep database backups secure

### DON'T ❌

- Never commit `ENCRYPTION_KEY` to git
- Never share the key via email/Slack
- Never use the dev key in production
- Never expose credentials in client-side code

## 🛠️ Troubleshooting

### "Encryption key not configured"

**Cause**: `ENCRYPTION_KEY` environment variable not set

**Fix**: Add it in Webflow Cloud dashboard → Settings → Environment Variables

### "Failed to decrypt data"

**Cause**: Data was encrypted with a different key

**Fix**: 
1. Delete the hotel configuration
2. Re-save it with the correct encryption key active

### Database shows readable JSON

**Cause**: Encryption not working, or old data saved before encryption was added

**Fix**:
1. Verify `ENCRYPTION_KEY` is set
2. Delete old hotel configurations
3. Re-save them (they will be encrypted)

## 📊 What's Encrypted vs. Not Encrypted

### ✅ Encrypted (at rest in D1)
- `service_account_json` column in hotels table

### 🔓 Not Encrypted (safe to store in plain text)
- Hotel code
- Hotel name
- Project ID
- Dataset ID
- Table ID
- Data location
- Query templates (no sensitive data)
- Dashboard settings

## 🎯 Next Steps

Once encryption is verified:

1. Add query templates for your hotel
2. Configure dashboard metrics
3. Share the dashboard URL with clients
4. Set up monitoring/alerts (optional)

---

**Questions?** Check `ENCRYPTION_SETUP_COMPLETE.md` for more details.
