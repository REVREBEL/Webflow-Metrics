# Webflow Cloud D1 Binding Configuration

## Problem
The D1 database was created in Webflow Cloud, but the app can't access it because the binding isn't configured correctly.

**Error:** `Database binding not found. Check wrangler.jsonc configuration.`

## Root Cause
Webflow Cloud manages D1 bindings through their dashboard, **not** through `wrangler.jsonc`. The binding name must match what's expected in the code.

## Solution

### Option 1: Configure in Webflow Cloud Dashboard (Recommended)

1. **Go to Webflow Cloud Dashboard** → Your Project → **Settings** or **Resources**

2. **Find the D1 Database section** - it should show your "bigquery-dashboard" database

3. **Check the Binding Name** - it needs to be exactly: `DB`

4. **If the binding name is different or missing:**
   - Edit the database resource
   - Set Binding Name to: `DB`
   - Save changes
   - Redeploy the app

5. **Verify** by visiting `/test-db` - you should see "DB Binding Status: found"

### Option 2: Check Environment Variables

The D1 binding might be under a different environment variable name. Let me update the code to check multiple possible locations.

## Expected Binding Configuration

In Webflow Cloud, the D1 binding should be configured as:

```
Resource Type: D1 Database
Binding Name: DB
Database Name: bigquery-dashboard
```

The app expects to access it via: `Astro.locals.runtime.env.DB`

## Troubleshooting

### If binding still not found after configuration:

1. **Check Webflow Cloud Logs**
   - Go to your project → Logs
   - Look for errors related to D1 or database bindings
   - Check if the binding is being loaded at runtime

2. **Verify Database Exists**
   - In Webflow Cloud → Resources → Databases
   - Confirm "bigquery-dashboard" or similar D1 database exists
   - Note the exact name

3. **Try Different Binding Names**
   - The binding might be auto-generated with a different name
   - Check the Webflow Cloud UI for what it's actually called
   - Update our code to match (see below)

### Alternative Binding Names to Try

If Webflow Cloud created the binding with a different name, update this in the code:

Common alternatives:
- `DB` (what we expect)
- `D1` (generic)
- `bigquery_dashboard` (snake_case from database name)
- `BIGQUERY_DASHBOARD` (uppercase)

## Next Steps

1. **Contact Webflow Support** if you can't find the D1 binding configuration in the dashboard
2. Ask them: "How do I configure the D1 database binding name for my Cloudflare D1 database?"
3. They should be able to point you to the right settings page

---

**Important**: This is a Webflow Cloud-specific configuration issue. The database exists, but it needs to be properly "connected" to your app through their binding system.
