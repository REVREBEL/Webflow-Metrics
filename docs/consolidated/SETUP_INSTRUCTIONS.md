# Complete Setup Instructions

## ⚠️ Important: Run These Commands in Your Local Environment

The sandbox environment doesn't have Cloudflare credentials. Follow these steps on your local machine or in your Webflow Cloud dashboard.

---

## Step 1: Create D1 Database (Local Development)

```bash
npx wrangler d1 create bigquery-dashboard
```

This will output something like:

```
✅ Successfully created DB 'bigquery-dashboard'

[[d1_databases]]
binding = "DB"
database_name = "bigquery-dashboard"
database_id = "12345678-1234-1234-1234-123456789abc"
```

**Copy the `database_id` value!**

---

## Step 2: Update wrangler.jsonc

Replace `"your-database-id"` in `wrangler.jsonc` with the actual database ID:

```jsonc
"d1_databases": [
  {
    "binding": "DB",
    "database_name": "bigquery-dashboard",
    "database_id": "12345678-1234-1234-1234-123456789abc", // ← Your actual ID here
    "migrations_dir": "migrations/"
  }
]
```

---

## Step 3: Initialize Database Schema (Local)

```bash
npx wrangler d1 execute bigquery-dashboard --local --file=./schema.sql
```

Expected output:
```
🌀 Executing on local database bigquery-dashboard from ./schema.sql:
🌀 To execute on your remote database, add a --remote flag to your wrangler command.
✅ Successfully executed SQL statements
```

---

## Step 4: Verify Tables Were Created

```bash
npx wrangler d1 execute bigquery-dashboard --local --command="SELECT name FROM sqlite_master WHERE type='table';"
```

Expected output:
```
┌────────────────────┐
│ name               │
├────────────────────┤
│ users              │
├────────────────────┤
│ user_hotels        │
├────────────────────┤
│ hotel_configs      │
├────────────────────┤
│ query_templates    │
├────────────────────┤
│ dashboard_configs  │
└────────────────────┘
```

---

## Step 5: Start Development Server

```bash
npm run dev
```

The server will start on `http://localhost:3000`

---

## Step 6: Access Admin Panel

Navigate to: `http://localhost:3000/admin`

You should see:
- 🏨 **Hotel Management** section
- ➕ **Add New Hotel** button
- Empty list (no hotels configured yet)

---

## Step 7: Configure Your First Hotel

Click **"Add New Hotel"** and fill in:

### Basic Information
- **Hotel Code**: `HOTEL001` (unique identifier)
- **Hotel Name**: `Grand Plaza Hotel` (display name)

### BigQuery Configuration
- **Project ID**: Your GCP project ID (e.g., `my-analytics-project`)
- **Dataset ID**: Your BigQuery dataset (e.g., `hotel_analytics`)
- **Table Name**: Your data table (e.g., `daily_metrics`)
- **Data Location**: Select your region (e.g., `US`, `EU`, `asia-northeast1`)

### Service Account JSON
Paste your BigQuery service account JSON:
```json
{
  "type": "service_account",
  "project_id": "your-project-id",
  "private_key_id": "...",
  "private_key": "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n",
  "client_email": "service-account@project.iam.gserviceaccount.com",
  "client_id": "...",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "..."
}
```

### Query Templates
Add queries for your metrics. Example:

**Template Name**: `Total Bookings`

**SQL Query**:
```sql
SELECT 
  COUNT(*) as value
FROM `{project_id}.{dataset_id}.{table_name}`
WHERE booking_date >= @start_date
  AND booking_date <= @end_date
  AND hotel_id = @hotel_id
```

**Variables**: (auto-detected from `@variable_name` in SQL)
- `start_date` (Type: `DATE`)
- `end_date` (Type: `DATE`)
- `hotel_id` (Type: `STRING`)

Click **"Save Hotel Configuration"**

---

## Step 8: Test the Configuration

The admin panel will automatically test the connection when you save. You should see:
- ✅ **Connection successful**
- Hotel appears in the list

---

## Step 9: Deploy to Production (Webflow Cloud)

### Commit and Push

```bash
git add -A
git commit -m "feat: add D1 database and admin panel"
git push origin main
```

### Webflow Cloud Will Automatically:

1. ✅ Read `wrangler.jsonc`
2. ✅ Provision D1 database
3. ✅ Apply migrations from `migrations/` folder
4. ✅ Inject binding as `locals.runtime.env.DB`
5. ✅ Deploy your app

### Initialize Production Database Schema

After first deploy, run:

```bash
npx wrangler d1 execute bigquery-dashboard --remote --file=./schema.sql
```

This creates the tables in production.

---

## Step 10: Configure Environment Variables (Webflow Dashboard)

Navigate to: **Site Settings → Apps & Integrations → [Your App] → Settings**

Add (if using CMS):
- `WEBFLOW_CMS_SITE_API_TOKEN` = `your-token-here`
- `WEBFLOW_API_HOST` = `https://api.webflow.com` (optional)

**Note**: BigQuery credentials are stored IN D1, not as environment variables.

---

## Verification Checklist

- [ ] D1 database created locally
- [ ] `wrangler.jsonc` updated with correct `database_id`
- [ ] Schema initialized (tables created)
- [ ] Dev server running on port 3000
- [ ] Admin panel accessible at `/admin`
- [ ] First hotel configured
- [ ] Connection test passed
- [ ] Code committed and pushed
- [ ] Production database schema initialized
- [ ] Webflow Cloud deployment successful

---

## What You've Built (Phase 1)

✅ **Backend Infrastructure**
- D1 database with secure credential storage
- Multi-hotel configuration system
- Query template management
- API endpoints for hotel CRUD operations

✅ **Admin Panel**
- Hotel management interface
- BigQuery connection testing
- Query template editor with variable detection
- Secure service account JSON storage

✅ **Security**
- Credentials stored in D1 (encrypted at rest)
- Server-side only access (never exposed to client)
- Environment variable support for API tokens

---

## Next Steps (Phase 2)

🚧 **Client Dashboard**
- Year/month filter dropdown
- Dynamic metric cards (KPI display)
- Query execution with variable substitution
- Real-time data visualization
- Loading states and error handling

🚧 **User Management** (Phase 3)
- User authentication
- Hotel access permissions
- Role-based access control

---

## Troubleshooting

### "No such table" Error
```bash
# Recreate tables
npx wrangler d1 execute bigquery-dashboard --local --file=./schema.sql
```

### Database Not Found
```bash
# List all databases
npx wrangler d1 list

# Verify wrangler.jsonc has correct database_id
```

### Admin Panel Shows Empty
Check browser console for errors. Likely causes:
- D1 binding not configured
- Schema not initialized
- Dev server not running with platform proxy

### Connection Test Fails
- Verify service account JSON is valid
- Check BigQuery API is enabled in GCP
- Verify service account has BigQuery Data Viewer role
- Check data location matches your dataset

---

## Quick Command Reference

```bash
# Create database
npx wrangler d1 create bigquery-dashboard

# Initialize schema (local)
npx wrangler d1 execute bigquery-dashboard --local --file=./schema.sql

# Initialize schema (production)
npx wrangler d1 execute bigquery-dashboard --remote --file=./schema.sql

# View tables
npx wrangler d1 execute bigquery-dashboard --local --command="SELECT name FROM sqlite_master WHERE type='table';"

# View hotels
npx wrangler d1 execute bigquery-dashboard --local --command="SELECT hotel_code, hotel_name FROM hotel_configs;"

# Start dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

---

## Support & Documentation

- **D1 Docs**: https://developers.cloudflare.com/d1/
- **Wrangler Docs**: https://developers.cloudflare.com/workers/wrangler/
- **Webflow Cloud**: https://webflow.com/cloud
- **BigQuery API**: https://cloud.google.com/bigquery/docs

---

**Setup Complete!** 🎉

Your BigQuery dashboard infrastructure is ready. Follow the steps above to initialize everything in your local/production environment.
