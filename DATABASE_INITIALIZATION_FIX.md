# Database Initialization Fix

## Problem
After deploying to Webflow Cloud, you saw "Database not configured" errors even though:
- ✅ D1 database was created in Webflow Cloud
- ✅ Migration files exist in `migrations/` folder
- ✅ `wrangler.jsonc` is properly configured

## Root Cause
Webflow Cloud creates the D1 database **but doesn't automatically run migrations** on first deployment. The database exists but is empty (no tables).

## Solution

### 🎯 Quick Fix (Recommended)
1. **Go to Admin Panel**: Navigate to `/admin` in your deployed app
2. **Click "Initialize Database"**: A yellow warning banner will appear at the top with a button
3. **Done!** The tables will be created and you can start adding hotels

### 🔧 Technical Details

The fix includes:

1. **New Initialization Endpoint** (`/api/admin/init-database`)
   - Creates all required tables (hotels, query_templates, cache_entries, audit_log)
   - Creates indexes for performance
   - Safe to call multiple times (uses `IF NOT EXISTS`)
   - Verifies tables were created successfully

2. **Admin Panel Enhancement**
   - Automatically detects if database is uninitialized
   - Shows a clear warning banner with initialization button
   - Disables hotel form until database is ready
   - Provides user-friendly feedback during initialization

3. **Updated Cache System**
   - Moved from in-memory cache to D1-based caching
   - Cache persists across server restarts
   - Shared cache across multiple workers
   - Automatic 7am PST expiration (aligns with BigQuery data refresh)

## What Gets Created

When you click "Initialize Database", the following tables are created:

### `hotels`
Stores BigQuery connection details and credentials for each property
- hotel_code (PRIMARY KEY)
- hotel_name, project_id, dataset_id, table_id
- data_location
- service_account_json (encrypted credentials)
- timestamps

### `query_templates`
Reusable SQL query templates for metrics
- template_id (PRIMARY KEY)
- hotel_code, template_name, sql_query
- variables (JSON)
- timestamps

### `cache_entries`
Query result cache (24hr TTL, resets at 7am PST)
- cache_key (PRIMARY KEY)
- cache_value (JSON)
- expires_at
- timestamps

### `audit_log`
Security and debugging logs
- log_id (AUTO INCREMENT)
- user_id, action, resource details
- ip_address, user_agent
- timestamp

## Troubleshooting

### If initialization fails:
1. Check browser console for errors
2. Verify you're accessing the deployed Webflow Cloud app (not localhost)
3. Try refreshing the page and clicking again
4. Check Webflow Cloud logs for detailed error messages

### If you still see "Database not configured":
This means the D1 binding isn't working. Verify:
- Database was created in Webflow Cloud dashboard
- Database name matches `wrangler.jsonc` (should be "bigquery-dashboard")
- You've deployed the latest code that includes the init endpoint

## Why This Approach?

Instead of running migrations automatically on every request:
- ✅ **User Control**: Admin decides when to initialize
- ✅ **Transparency**: Clear feedback about database state
- ✅ **Safety**: Won't accidentally reinitialize if tables exist
- ✅ **Debugging**: Easy to diagnose connection issues
- ✅ **Performance**: No overhead checking on every request

## Next Steps

After database initialization:
1. ✅ Add your first hotel configuration in Admin Panel
2. ✅ Configure query templates for metrics
3. ✅ View dashboard at `/` to see your data

---

**Note**: This is a one-time setup. Once initialized, the database persists across all future deployments.
