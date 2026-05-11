# Encryption Setup Guide

## Overview

Service account credentials are **encrypted at rest** in the database using AES-256-GCM encryption. This ensures that even if someone gains database access, they cannot read the credentials without the encryption key.

## Setup Steps

### 1. Generate an Encryption Key

Generate a strong, random encryption key (32+ characters recommended):

```bash
# On macOS/Linux
openssl rand -base64 32

# Or use a password generator
# Example: "Xy9$mK2pL#vN8qR4tW6jZ1aS5dF7gH0"
```

### 2. Configure in Webflow Cloud

1. Go to your **Webflow Cloud Project** dashboard
2. Navigate to **Settings** → **Environment Variables**
3. Add a new variable:
   - **Name**: `ENCRYPTION_KEY`
   - **Value**: Your generated key (e.g., the output from openssl command)
   - **Type**: Secret (encrypted)

### 3. Local Development

Create a `.env` file in your project root:

```env
ENCRYPTION_KEY="your-generated-key-here"
```

**⚠️ IMPORTANT**: 
- Never commit `.env` to version control
- Use the same key in both local and production
- Store the key securely (password manager, secrets vault)

## How It Works

### Encryption Flow
1. Admin enters service account JSON
2. Server encrypts JSON using `ENCRYPTION_KEY`
3. Encrypted data stored in database
4. Database contains unreadable ciphertext

### Decryption Flow
1. Client dashboard requests data for hotel
2. Server fetches encrypted credentials
3. Server decrypts using `ENCRYPTION_KEY`
4. Server executes BigQuery with credentials
5. Results returned (credentials never sent to client)

## Security Features

✅ **AES-256-GCM encryption** (industry standard)
✅ **Unique IV per encryption** (prevents pattern analysis)
✅ **Server-side only** (credentials never sent to browser)
✅ **Key stored as environment variable** (not in code)
✅ **Automatic key hashing** (consistent 256-bit keys)

## API Endpoints

### Store Credentials (Encrypted)
```
POST /api/admin/hotels
```
Automatically encrypts `service_account_json` before storage.

### Execute Query (Decrypts Internally)
```
POST /api/bigquery/execute-query
{
  "hotel_code": "HOTEL1",
  "query": "SELECT COUNT(*) as value FROM dataset.table",
  "metricName": "Total Bookings"
}
```
Fetches and decrypts credentials internally. Client never sees credentials.

### Get Credentials (Admin Only - Server-Side)
```
GET /api/admin/hotels/[hotel_code]/credentials
```
Returns decrypted credentials. Should only be called server-side.

## Troubleshooting

### "Encryption key not configured"
- Ensure `ENCRYPTION_KEY` is set in environment variables
- Restart the application after adding the variable

### "Invalid encrypted data"
- The encryption key may have changed
- Data encrypted with one key cannot be decrypted with another
- You'll need to re-enter credentials if key changed

### Key Rotation
If you need to change the encryption key:
1. Export all hotel data (decrypted)
2. Update `ENCRYPTION_KEY` environment variable
3. Re-initialize database
4. Re-import hotels with new encryption

## Best Practices

1. **Use a strong key**: 32+ random characters
2. **Store securely**: Use a password manager
3. **Rotate periodically**: Change key every 6-12 months
4. **Backup safely**: Encrypt backups with a different key
5. **Monitor access**: Log credential decryption events
6. **Principle of least privilege**: Only query execution needs decryption

## Additional Security Layers

Consider adding:
- **IP whitelisting** for admin endpoints
- **Authentication** (OAuth, JWT)
- **Audit logging** for credential access
- **Rate limiting** on query execution
- **Key rotation automation**
