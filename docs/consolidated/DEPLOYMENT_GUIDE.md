# 🚀 Deployment Guide - Webflow Cloud

## Quick Summary

You're seeing **"Database not configured"** because the Webflow Workbench preview environment doesn't have access to D1 databases. This is **normal and expected**.

**Solution**: Deploy to Webflow Cloud, where the D1 database will be automatically provisioned! 

---

## ✅ Pre-Deployment Checklist

Before deploying, verify these files are in place:

### 1. wrangler.jsonc ✅
```json
"d1_databases": [
  {
    "binding": "DB",
    "database_name": "bigquery-dashboard",
    "database_id": "your-database-id",
    "migrations_dir": "migrations/"
  }
]
```

**Note**: The `database_id` value can stay as `"your-database-id"` - Webflow will replace it!

### 2. migrations/0001_initial_schema.sql ✅
This file contains your database schema and will be run automatically by Webflow Cloud.

### 3. Check Files Exist

```bash
# Verify these files exist:
- wrangler.jsonc
- migrations/0001_initial_schema.sql
- schema.sql (backup)
- src/pages/api/admin/hotels.ts
- src/pages/admin.astro
```

---

## 🎯 Deployment Steps

### Step 1: Build Locally (Optional)

Test that everything compiles:

```bash
npm run build
```

If you see errors, fix them before deploying.

### Step 2: Deploy from Webflow Workbench

1. **Save Your Changes**
   - Make sure all files are saved
   - Review your recent changes

2. **Click Deploy**
   - Look for "Deploy" or "Publish" button in Webflow UI
   - Confirm deployment

3. **Wait for Build**
   - Webflow will:
     - Build your Astro app
     - Create D1 database
     - Run migrations automatically
     - Deploy to Cloudflare Workers

4. **Check Deployment Logs**
   - Look for messages like:
     - ✅ "D1 database created"
     - ✅ "Running migrations"
     - ✅ "Deployment successful"

### Step 3: Verify Deployment

1. **Get Your App URL**
   - Example: `https://bigquery-dashboard.webflow.io`
   - Or custom domain if configured

2. **Test Home Page**
   ```
   https://your-app.webflow.io/
   ```
   Should show the dashboard (may be empty at first)

3. **Test Admin Page**
   ```
   https://your-app.webflow.io/admin
   ```
   Should show "Add New Hotel" button

---

## 🔧 First-Time Setup After Deployment

### Step 1: Access Admin Panel

Visit: `https://your-app.webflow.io/admin`

### Step 2: Add Your First Hotel

1. Click **"Add New Hotel"**

2. Fill in the form:
   ```
   Hotel Code: GRAND_PLAZA
   Hotel Name: Grand Plaza Hotel
   BigQuery Project ID: my-project-id
   Data Location: US (or your region)
   Service Account JSON: {paste your service account JSON}
   ```

3. Click **"Test Connection"**
   - Should show: ✅ "Connection successful!"
   - If error, check credentials

4. Click **"Save Hotel"**
   - Should now work! (no "Database not configured" error)

### Step 3: Add Query Templates

1. Click **"Add Query Template"**

2. Fill in template details:
   ```
   Template Name: Rooms OTB
   SQL Query: 
   SELECT 
     rooms_otb_change_1_day as value
   FROM `your-project.dataset.table`
   WHERE property_code = @hotel_code
   LIMIT 1
   ```

3. Click **"Save Template"**

### Step 4: Test Dashboard

1. Visit: `https://your-app.webflow.io/`

2. Select your hotel from dropdown

3. Choose year/month filters

4. Click **"Load Metrics"**

5. Should see your KPI cards with data! ✅

---

## 🐛 Troubleshooting

### Issue: "Database not configured" in Production

**Symptom**: Still seeing error after deployment

**Causes**:
1. Migration didn't run
2. D1 database not created
3. Binding name mismatch

**Solutions**:

#### Solution 1: Re-deploy

Sometimes the first deployment doesn't complete properly:

1. Go back to Webflow Workbench
2. Make a small change (add a comment somewhere)
3. Deploy again
4. Check deployment logs

#### Solution 2: Check Deployment Logs

Look for these in your deployment logs:

✅ **Good**:
```
✓ Creating D1 database: bigquery-dashboard
✓ Running migrations from migrations/
✓ Migration 0001_initial_schema.sql completed
✓ Binding DB to Worker
```

❌ **Bad**:
```
⚠ Skipping D1 setup
⚠ No migrations found
✗ Failed to create database
```

#### Solution 3: Verify wrangler.jsonc

Make sure it looks exactly like this:

```json
"d1_databases": [
  {
    "binding": "DB",
    "database_name": "bigquery-dashboard",
    "database_id": "your-database-id",
    "migrations_dir": "migrations/"
  }
]
```

**Common mistakes**:
- ❌ Wrong binding name (must be "DB")
- ❌ Typo in migrations_dir
- ❌ Missing migrations/ folder
- ❌ Missing migration file

#### Solution 4: Check Code

Verify your API endpoints use the correct binding:

```typescript
// ✅ Correct
const db = locals.runtime.env.DB;

// ❌ Wrong
const db = locals.runtime.env.D1;
const db = locals.env.DB;
const db = context.env.DB;
```

#### Solution 5: Contact Webflow Support

If none of the above work:

1. Gather information:
   - App URL
   - Deployment timestamp
   - Error messages
   - Deployment logs

2. Contact Webflow support:
   - Mention: "D1 database not being provisioned"
   - Provide logs and wrangler.jsonc
   - Reference this deployment guide

### Issue: Migration Errors

**Symptom**: "Migration failed" in deployment logs

**Solutions**:

1. **Check SQL Syntax**
   - Review `migrations/0001_initial_schema.sql`
   - Ensure valid SQLite syntax
   - No trailing commas
   - Proper semicolons

2. **Test Locally** (if possible)
   ```bash
   npx wrangler d1 execute DB --local --file=./migrations/0001_initial_schema.sql
   ```

3. **Check File Encoding**
   - Must be UTF-8
   - No BOM (Byte Order Mark)
   - Unix line endings (LF, not CRLF)

### Issue: "Cannot read properties of undefined (reading 'prepare')"

**Symptom**: Error when trying to query database

**Cause**: DB binding is undefined

**Solutions**:

1. Verify code checks for DB:
   ```typescript
   const db = locals.runtime.env.DB;
   if (!db) {
     return new Response(
       JSON.stringify({ error: 'Database not configured' }), 
       { status: 500 }
     );
   }
   ```

2. Check environment:
   - Works in Webflow Cloud? ✅
   - Breaks in preview? ⚠️ Expected (no D1 in preview)

3. Re-deploy if in production

---

## 📊 Monitoring After Deployment

### Check Database is Working

After deployment, verify these API endpoints work:

#### 1. List Hotels (should return empty array initially)
```bash
curl https://your-app.webflow.io/api/admin/hotels
```

Expected response:
```json
{
  "hotels": []
}
```

#### 2. Add a Hotel (via admin UI)
- Visit `/admin`
- Add hotel
- Should succeed without "Database not configured" error

#### 3. List Hotels Again
```bash
curl https://your-app.webflow.io/api/admin/hotels
```

Expected response:
```json
{
  "hotels": [
    {
      "hotel_code": "GRAND_PLAZA",
      "hotel_name": "Grand Plaza Hotel",
      "project_id": "my-project"
    }
  ]
}
```

### Check Logs

If using Wrangler CLI locally, you can tail production logs:

```bash
npx wrangler tail
```

Look for:
- API requests
- Database queries
- Errors or warnings

---

## 🔄 Update Workflow

When you need to make changes after deployment:

### Code Changes

1. **Edit in Webflow Workbench**
2. **Test locally** (if possible)
3. **Deploy** (same as initial deployment)
4. **Verify** changes in production

### Database Schema Changes

**⚠️ Important**: Be careful with schema changes in production!

1. **Create New Migration File**:
   ```
   migrations/0002_add_new_column.sql
   ```

2. **Use ALTER TABLE** (not CREATE TABLE):
   ```sql
   ALTER TABLE hotels ADD COLUMN region TEXT;
   ```

3. **Test Migration Locally** First:
   ```bash
   npx wrangler d1 execute DB --local --file=./migrations/0002_add_new_column.sql
   ```

4. **Deploy**:
   - Webflow will run new migration automatically
   - Existing data is preserved

5. **Rollback Plan**:
   - Have a rollback migration ready
   - Example: `0003_remove_region_column.sql`

---

## 🎉 Success Criteria

Your deployment is successful when:

✅ App loads at `https://your-app.webflow.io/`  
✅ Admin panel works at `/admin`  
✅ Can add hotels without "Database not configured" error  
✅ Can add query templates  
✅ Dashboard displays metrics from BigQuery  
✅ No errors in browser console  
✅ No errors in deployment logs  

---

## 📈 Next Steps After Successful Deployment

1. **Add All Your Hotels**
   - Use admin panel
   - Add service account credentials
   - Test connections

2. **Create Query Templates**
   - One template per metric
   - Use reusable queries with variables

3. **Test Dashboard**
   - Select different hotels
   - Change time periods
   - Verify data accuracy

4. **Share with Users**
   - Send dashboard URL
   - Provide instructions
   - Gather feedback

5. **Monitor Usage**
   - Check BigQuery usage/costs
   - Review error logs
   - Optimize slow queries

---

## 🔐 Security Checklist

After deployment:

- [ ] Service account JSON only stored in D1 (server-side)
- [ ] Admin panel is protected (if auth is enabled)
- [ ] BigQuery credentials use least-privilege roles
- [ ] No credentials in client-side code
- [ ] HTTPS enabled (automatic with Webflow Cloud)
- [ ] CORS configured properly
- [ ] Rate limiting considered (for future)

---

## 📚 Related Documentation

- **`LOCAL_DEVELOPMENT.md`** - Understanding different environments
- **`D1_SETUP.md`** - Detailed D1 database guide
- **`QUICK_START_GUIDE.md`** - Using the dashboard
- **`ADMIN_QUICK_START.md`** - Admin panel usage

---

## 🆘 Getting Help

If you're stuck:

1. **Check This Guide** - Search for your error message
2. **Review Logs** - Deployment and runtime logs
3. **Test Locally** - Clone and test on your machine
4. **Webflow Support** - For deployment/platform issues
5. **Cloudflare Docs** - For D1/Workers questions

---

**Ready to Deploy?** 🚀

1. ✅ Files are ready
2. ✅ Checklist complete
3. ✅ Click Deploy in Webflow Workbench!

---

**Status**: Ready for Webflow Cloud deployment!  
**Last Updated**: February 18, 2026
