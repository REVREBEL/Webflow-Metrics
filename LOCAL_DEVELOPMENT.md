# Local Development Setup - Webflow Sandbox

## 🎯 Important: D1 Database in Webflow Environment

You're currently in the **Webflow Sandbox** environment, which has some limitations:

### ⚠️ D1 Limitations in Webflow Sandbox

The Webflow sandbox doesn't have direct Cloudflare API access, so you **cannot** run:
- `npx wrangler d1 create`
- `npx wrangler d1 execute`
- `npx wrangler d1 list`

**But don't worry!** Here's what happens in different environments:

---

## 🌍 Environment Behavior

### 1. Webflow Workbench (Current)

**What works**:
- ✅ Code editing
- ✅ Preview server
- ✅ File management
- ✅ NPM packages

**What doesn't work**:
- ❌ D1 database (no binding available)
- ❌ Cloudflare API access
- ❌ Wrangler commands

**Result**: You'll see "Database not configured" errors.

### 2. Webflow Cloud (Production)

**When you deploy to Webflow Cloud**:
- ✅ D1 database is **auto-provisioned** based on wrangler.jsonc
- ✅ Full Cloudflare Workers environment
- ✅ All bindings work (D1, KV, R2, etc.)
- ✅ Admin panel will work perfectly
- ✅ Database persistence

**How it works**:
1. Webflow reads your `wrangler.jsonc`
2. Sees the D1 binding declaration
3. Creates the database automatically
4. Binds it to your Worker
5. Your code can access `locals.runtime.env.DB`

### 3. Local Development (Your Machine)

**If you clone this repo locally**:
```bash
# Create D1 database
npx wrangler d1 create bigquery-dashboard

# Update wrangler.jsonc with database_id

# Initialize schema
npx wrangler d1 execute DB --local --file=./schema.sql

# Start dev server
npm run dev
```

Then everything works! ✅

---

## 🚀 Recommended Workflow

### Option A: Deploy to Webflow Cloud (Recommended)

This is the **easiest** path:

1. **In Webflow Workbench**:
   - Make your code changes
   - Test what you can in preview
   - Commit/save your work

2. **Deploy to Webflow Cloud**:
   - Click "Deploy" or "Publish"
   - Webflow auto-provisions D1 database
   - App runs with full database support

3. **Use Admin Panel**:
   - Visit: `https://your-app.webflow.io/admin`
   - Add hotels, credentials, query templates
   - Everything works! ✅

### Option B: Local Development

If you need full local testing:

1. **Clone repo to your machine**:
   ```bash
   git clone <your-repo>
   cd <your-repo>
   npm install
   ```

2. **Setup D1 locally**:
   ```bash
   # Create database
   npx wrangler d1 create bigquery-dashboard
   
   # Copy database_id from output and update wrangler.jsonc
   
   # Initialize schema
   npx wrangler d1 execute DB --local --file=./schema.sql
   ```

3. **Run dev server**:
   ```bash
   npm run dev
   ```

4. **Test locally**:
   - Visit http://localhost:3000/admin
   - Add hotels and test features
   - Push changes back to Webflow

---

## 🔧 Webflow Cloud Deployment

### Step 1: Verify wrangler.jsonc

Make sure your `wrangler.jsonc` has the D1 binding declared:

```json
"d1_databases": [
  {
    "binding": "DB",
    "database_name": "bigquery-dashboard",
    "database_id": "your-database-id",  // Can stay as placeholder for Webflow
    "migrations_dir": "migrations/"
  }
]
```

**Note**: The `database_id` can stay as `"your-database-id"` - Webflow will replace it during deployment!

### Step 2: Prepare Migration File

Create `migrations/0001_initial_schema.sql`:

```sql
-- Initial schema for BigQuery Dashboard
-- This will be run automatically by Webflow Cloud on first deployment

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

CREATE TABLE IF NOT EXISTS query_templates (
  template_id TEXT PRIMARY KEY,
  hotel_code TEXT NOT NULL,
  template_name TEXT NOT NULL,
  sql_query TEXT NOT NULL,
  variables TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (hotel_code) REFERENCES hotels(hotel_code) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS cache_entries (
  cache_key TEXT PRIMARY KEY,
  cache_value TEXT NOT NULL,
  expires_at TEXT NOT NULL,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

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

### Step 3: Deploy

In Webflow Workbench:
- Click **"Deploy"** or **"Publish"**
- Webflow will:
  1. Build your app
  2. Create D1 database
  3. Run migrations automatically
  4. Deploy to Cloudflare Workers
  5. Make your app live!

### Step 4: Access Your App

```
https://your-app-name.webflow.io/
https://your-app-name.webflow.io/admin
```

Everything will work! ✅

---

## 🎨 Testing in Webflow Workbench

While you can't fully test the database in the workbench, you can:

### ✅ What You CAN Test

1. **UI/UX**:
   - Preview all pages
   - Test responsive design
   - Check component rendering
   - Verify styling

2. **Client-Side Logic**:
   - React component behavior
   - Form validation
   - State management
   - UI interactions

3. **Code Quality**:
   - TypeScript errors
   - Build success
   - Import resolution
   - Syntax validation

### ❌ What You CANNOT Test

1. **Database Operations**:
   - Saving hotels
   - Query templates
   - Cache entries

2. **BigQuery Integration**:
   - Connection testing
   - Query execution
   - Credential validation

3. **API Endpoints**:
   - `/api/admin/hotels`
   - `/api/bigquery/*`

**Solution**: Deploy to Webflow Cloud or test locally!

---

## 🔍 Debugging "Database not configured"

### In Webflow Workbench

**Expected**: This error is normal because D1 isn't available in the preview environment.

**Action**: Deploy to Webflow Cloud where D1 will be provisioned.

### In Webflow Cloud (Production)

If you see this error after deployment:

**Causes**:
1. Migration didn't run
2. D1 binding name mismatch
3. Database not created

**Solutions**:

1. **Check Logs**:
   - View deployment logs in Webflow dashboard
   - Look for D1 creation messages
   - Check migration execution

2. **Verify Binding**:
   - Ensure wrangler.jsonc has `"binding": "DB"`
   - Code uses `locals.runtime.env.DB`

3. **Re-deploy**:
   - Sometimes a re-deploy fixes provisioning issues
   - Click "Deploy" again

4. **Contact Webflow Support**:
   - If problem persists after re-deploy
   - Provide deployment logs
   - Mention D1 auto-provisioning issue

### In Local Development

If running locally and seeing this error:

**Solution**: Follow D1_SETUP.md to create database:

```bash
# 1. Create database
npx wrangler d1 create bigquery-dashboard

# 2. Update wrangler.jsonc with database_id

# 3. Run schema
npx wrangler d1 execute DB --local --file=./schema.sql

# 4. Restart server
npm run dev
```

---

## 📋 Pre-Deployment Checklist

Before deploying to Webflow Cloud:

- [ ] `wrangler.jsonc` has D1 binding declared
- [ ] `migrations/0001_initial_schema.sql` exists
- [ ] `schema.sql` matches migration file
- [ ] Code uses `locals.runtime.env.DB` (not hardcoded)
- [ ] TypeScript compiles without errors
- [ ] Build succeeds: `npm run build`

---

## 🚀 Deployment Flow

```
Webflow Workbench (Development)
         ↓
    Click Deploy
         ↓
Webflow Cloud Deployment Pipeline
         ↓
1. Build App (npm run build)
2. Create D1 Database (auto)
3. Run Migrations (auto)
4. Deploy to Cloudflare Workers
5. Bind D1 to Worker
         ↓
Your App is Live! ✅
         ↓
Visit: https://your-app.webflow.io/admin
```

---

## 🎉 Summary

**In Webflow Workbench**:
- Preview UI/UX
- Edit code
- Can't test database

**In Webflow Cloud** (Production):
- Full D1 support ✅
- All features work ✅
- Database auto-provisioned ✅

**In Local Development**:
- Full control
- Test everything
- Manual D1 setup required

---

## 📚 Next Steps

1. **Deploy to Webflow Cloud** to test with real D1 database
2. **Or** clone repo locally for full development environment
3. **Review** QUICK_START_GUIDE.md for usage instructions
4. **Check** DASHBOARD_SETUP.md for feature documentation

---

**Status**: Ready for deployment! 🚀  
**Last Updated**: February 18, 2026
