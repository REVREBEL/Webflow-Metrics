# D1 Database Setup Guide

## 🎯 Quick Fix for "Database not configured" Error

If you're seeing **"Database not configured"** when trying to save a hotel, it means the D1 database isn't set up yet.

---

## ✅ Automated Setup (Recommended)

### Option 1: Run the Setup Script

```bash
# Make script executable (if not already)
chmod +x setup-d1.sh

# Run the setup script
./setup-d1.sh
```

This script will:
1. Create the D1 database
2. Extract the database_id
3. Update wrangler.jsonc automatically
4. Initialize the schema

**Then start your dev server**:
```bash
npm run dev
```

---

## 🔧 Manual Setup (Alternative)

If the automated script doesn't work, follow these manual steps:

### Step 1: Create D1 Database

```bash
npx wrangler d1 create bigquery-dashboard
```

**Expected Output**:
```
✅ Successfully created DB 'bigquery-dashboard'

[[d1_databases]]
binding = "DB"
database_name = "bigquery-dashboard"
database_id = "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
migrations_dir = "migrations/"
```

### Step 2: Copy Database ID

From the output above, copy the `database_id` value (the long string with dashes).

**Example**:
```
database_id = "a1b2c3d4-e5f6-7890-abcd-ef1234567890"
```

Copy: `a1b2c3d4-e5f6-7890-abcd-ef1234567890`

### Step 3: Update wrangler.jsonc

Open `wrangler.jsonc` and find this section (around line 30):

```json
"d1_databases": [
  {
    "binding": "DB",
    "database_name": "bigquery-dashboard",
    "database_id": "your-database-id",  // ← Replace this
    "migrations_dir": "migrations/"
  }
]
```

**Replace** `"your-database-id"` with your actual database ID:

```json
"d1_databases": [
  {
    "binding": "DB",
    "database_name": "bigquery-dashboard",
    "database_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",  // ← Your actual ID
    "migrations_dir": "migrations/"
  }
]
```

### Step 4: Initialize Database Schema

Run this command to create the tables:

```bash
npx wrangler d1 execute DB --local --file=./schema.sql
```

**Expected Output**:
```
🌀 Executing on local database bigquery-dashboard (xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx) from ./schema.sql:
🌀 To execute on your remote database, add a --remote flag to your wrangler command.
├ 🚣 Executed 4 commands in 0.123ms
```

### Step 5: Restart Dev Server

If your dev server was already running, restart it:

```bash
# Stop current server (Ctrl+C)
# Then start again
npm run dev
```

### Step 6: Test

1. Go to http://localhost:3000/admin
2. Click "Add New Hotel"
3. Fill in the form
4. Click "Save Hotel"

Should now work! ✅

---

## 🐛 Troubleshooting

### Error: "Cannot find binding 'DB'"

**Cause**: wrangler.jsonc not updated or dev server not restarted

**Solution**:
1. Verify `database_id` is updated in wrangler.jsonc
2. Restart dev server: `npm run dev`

### Error: "Table 'hotels' does not exist"

**Cause**: Schema not initialized

**Solution**:
```bash
npx wrangler d1 execute DB --local --file=./schema.sql
```

### Error: "Database not found"

**Cause**: Wrong database_id in wrangler.jsonc

**Solution**:
1. Run: `npx wrangler d1 list`
2. Find your database and copy the ID
3. Update wrangler.jsonc with correct ID
4. Restart dev server

### Error: "no such table: hotels"

**Cause**: Using wrong database or schema not run

**Solution**:
1. Check binding name is "DB" in wrangler.jsonc
2. Run schema: `npx wrangler d1 execute DB --local --file=./schema.sql`
3. If error persists, delete and recreate database:
   ```bash
   npx wrangler d1 delete bigquery-dashboard
   ./setup-d1.sh  # Run setup script again
   ```

---

## 🔍 Verifying Setup

### Check D1 Databases

```bash
npx wrangler d1 list
```

Should show:
```
┌──────────────────────────────────────┬────────────────────┐
│ uuid                                 │ name               │
├──────────────────────────────────────┼────────────────────┤
│ a1b2c3d4-e5f6-7890-abcd-ef1234567890 │ bigquery-dashboard │
└──────────────────────────────────────┴────────────────────┘
```

### Check Tables

```bash
npx wrangler d1 execute DB --local --command="SELECT name FROM sqlite_master WHERE type='table'"
```

Should show:
```
┌──────────────────┐
│ name             │
├──────────────────┤
│ hotels           │
│ query_templates  │
│ cache_entries    │
│ audit_log        │
└──────────────────┘
```

### Test Query

```bash
npx wrangler d1 execute DB --local --command="SELECT COUNT(*) as count FROM hotels"
```

Should show:
```
┌───────┐
│ count │
├───────┤
│ 0     │
└───────┘
```

---

## 📦 Database Schema

The schema creates 4 tables:

### 1. hotels
Stores hotel configurations and BigQuery credentials.

```sql
CREATE TABLE IF NOT EXISTS hotels (
  hotel_code TEXT PRIMARY KEY,
  hotel_name TEXT NOT NULL,
  project_id TEXT NOT NULL,
  dataset_id TEXT,
  table_id TEXT,
  data_location TEXT DEFAULT 'US',
  service_account_json TEXT NOT NULL,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);
```

### 2. query_templates
Stores reusable SQL query templates for metrics.

```sql
CREATE TABLE IF NOT EXISTS query_templates (
  template_id TEXT PRIMARY KEY,
  hotel_code TEXT NOT NULL,
  template_name TEXT NOT NULL,
  sql_query TEXT NOT NULL,
  variables TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (hotel_code) REFERENCES hotels(hotel_code)
);
```

### 3. cache_entries
Stores cached query results for performance.

```sql
CREATE TABLE IF NOT EXISTS cache_entries (
  cache_key TEXT PRIMARY KEY,
  cache_value TEXT NOT NULL,
  expires_at TEXT NOT NULL,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);
```

### 4. audit_log
Stores audit trail for security and debugging.

```sql
CREATE TABLE IF NOT EXISTS audit_log (
  log_id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT,
  action TEXT NOT NULL,
  resource_type TEXT,
  resource_id TEXT,
  details TEXT,
  ip_address TEXT,
  user_agent TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);
```

---

## 🚀 Production Setup

When deploying to production, you need to initialize the **remote** database:

### Step 1: Deploy Your App

```bash
npm run build
npx wrangler deploy
```

### Step 2: Initialize Remote Database

```bash
npx wrangler d1 execute DB --remote --file=./schema.sql
```

**⚠️ Important**: Use `--remote` instead of `--local` for production!

### Step 3: Verify Production

```bash
# List remote databases
npx wrangler d1 list

# Check remote tables
npx wrangler d1 execute DB --remote --command="SELECT name FROM sqlite_master WHERE type='table'"
```

---

## 🔐 Security Notes

### Service Account JSON Storage

- **Local Dev**: Stored in local D1 database (isolated to your machine)
- **Production**: Stored in Cloudflare D1 (encrypted at rest)
- **Never** committed to git (D1 is runtime-only)
- **Access**: Server-side only, never exposed to client

### Best Practices

✅ **DO**:
- Use unique `hotel_code` values
- Store BigQuery credentials in D1 only
- Test connections before saving
- Use least-privilege service accounts (BigQuery Data Viewer)
- Keep service account JSON files secure

❌ **DON'T**:
- Commit service account JSON to git
- Share service account JSON in chat/email
- Use overly permissive service account roles
- Store credentials in environment variables
- Hardcode credentials in code

---

## 📊 Database Maintenance

### View All Hotels

```bash
npx wrangler d1 execute DB --local --command="SELECT hotel_code, hotel_name FROM hotels"
```

### View All Templates

```bash
npx wrangler d1 execute DB --local --command="SELECT template_id, template_name, hotel_code FROM query_templates"
```

### Clear Cache

```bash
npx wrangler d1 execute DB --local --command="DELETE FROM cache_entries"
```

### Delete a Hotel

```bash
npx wrangler d1 execute DB --local --command="DELETE FROM hotels WHERE hotel_code='GRAND_PLAZA'"
```

**⚠️ Warning**: This will also delete all associated query templates (CASCADE).

---

## 🔄 Migration Strategy

### Current State: Phase 2

- Using D1 for storage
- No authentication
- Direct access to API endpoints

### Future: Phase 3

Will add:
- User authentication
- Encrypted credentials at rest
- Role-based access control
- Audit logging (using audit_log table)

### Migration Path

When moving from Phase 2 to Phase 3:

1. **No database changes needed** - Schema already includes audit_log
2. Add user authentication tables
3. Add foreign keys to audit_log
4. Enable logging in API endpoints

---

## 📚 Related Documentation

- **`QUICK_START_GUIDE.md`** - Complete setup walkthrough
- **`SETUP_INSTRUCTIONS.md`** - Detailed setup guide
- **`ADMIN_QUICK_START.md`** - Admin panel usage
- **`PROJECT_SUMMARY.md`** - Architecture overview

---

## ✅ Setup Checklist

- [ ] Run `./setup-d1.sh` or manual steps
- [ ] Verify database ID in wrangler.jsonc
- [ ] Initialize schema with schema.sql
- [ ] Restart dev server
- [ ] Test admin panel at `/admin`
- [ ] Add first hotel successfully
- [ ] Test BigQuery connection
- [ ] Create first query template
- [ ] View metrics on dashboard

---

**Status**: D1 database ready for development!  
**Last Updated**: February 18, 2026
