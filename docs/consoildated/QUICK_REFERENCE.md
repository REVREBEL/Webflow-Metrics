# BigQuery Dashboard - Quick Reference

## 📁 Project Structure

```
/
├── src/
│   ├── components/
│   │   ├── AdminPanel.tsx         # Hotel management UI
│   │   ├── BigQueryConfig.tsx     # (old) Single-hotel config
│   │   ├── BigQueryDashboard.tsx  # (old) Single-hotel dashboard
│   │   └── DashboardApp.tsx       # Main app entry point
│   ├── lib/
│   │   ├── bigquery-client.ts     # BigQuery API wrapper
│   │   └── cache-manager.ts       # 24hr cache + 7am PST reset
│   ├── pages/
│   │   ├── api/
│   │   │   ├── admin/
│   │   │   │   └── hotels.ts      # GET/POST/DELETE hotels
│   │   │   └── bigquery/
│   │   │       ├── execute-query.ts   # Execute queries
│   │   │       └── test-connection.ts # Test BigQuery connection
│   │   ├── admin.astro            # Admin panel page
│   │   └── index.astro            # Main dashboard (TBD Phase 2)
│   └── layouts/
│       └── main.astro             # Global layout
├── migrations/                     # D1 migration SQL files
├── schema.sql                      # Initial database schema
├── wrangler.jsonc                  # Cloudflare bindings config
└── webflow.json                    # Webflow Cloud config
```

---

## 🗄️ Database Schema

### `hotel_configs`
Primary table for hotel configurations

| Column | Type | Description |
|--------|------|-------------|
| `hotel_code` | TEXT (PK) | Unique identifier (e.g., `HOTEL001`) |
| `hotel_name` | TEXT | Display name |
| `service_account_json` | TEXT | BigQuery credentials (encrypted) |
| `data_location` | TEXT | Dataset region (e.g., `US`, `EU`) |
| `project_id` | TEXT | GCP project ID |
| `created_at` | TIMESTAMP | Creation time |
| `updated_at` | TIMESTAMP | Last modified time |

### `query_templates`
Reusable SQL queries for metrics

| Column | Type | Description |
|--------|------|-------------|
| `template_id` | TEXT (PK) | Unique template ID |
| `hotel_code` | TEXT (FK) | Associated hotel |
| `template_name` | TEXT | Display name (e.g., "Total Bookings") |
| `sql_query` | TEXT | BigQuery SQL with variables |
| `variables` | TEXT | JSON array of variable definitions |
| `created_at` | TIMESTAMP | Creation time |

**Example `variables` JSON:**
```json
[
  { "name": "start_date", "type": "DATE" },
  { "name": "end_date", "type": "DATE" },
  { "name": "hotel_id", "type": "STRING" }
]
```

### `dashboard_configs`
Dashboard layout and metric assignments (Phase 2)

| Column | Type | Description |
|--------|------|-------------|
| `config_id` | TEXT (PK) | Unique config ID |
| `hotel_code` | TEXT (FK) | Associated hotel |
| `config_name` | TEXT | Dashboard name |
| `layout` | TEXT | JSON layout definition |
| `created_at` | TIMESTAMP | Creation time |

### `users` (Phase 3)
User accounts and authentication

| Column | Type | Description |
|--------|------|-------------|
| `user_id` | TEXT (PK) | Unique user ID |
| `email` | TEXT (UNIQUE) | User email |
| `password_hash` | TEXT | Hashed password |
| `role` | TEXT | User role (`admin`, `viewer`) |
| `created_at` | TIMESTAMP | Account creation |

### `user_hotels` (Phase 3)
User-hotel access permissions

| Column | Type | Description |
|--------|------|-------------|
| `user_id` | TEXT (FK) | User reference |
| `hotel_code` | TEXT (FK) | Hotel reference |
| `access_level` | TEXT | Permission level |

---

## 🔌 API Endpoints

### Admin API

**GET** `/api/admin/hotels`
- **Purpose**: List all configured hotels
- **Auth**: None (Phase 1)
- **Response**:
  ```json
  {
    "hotels": [
      {
        "hotel_code": "HOTEL001",
        "hotel_name": "Grand Plaza Hotel",
        "data_location": "US",
        "project_id": "my-project-123",
        "created_at": "2025-01-15T10:30:00Z",
        "updated_at": "2025-01-15T10:30:00Z"
      }
    ]
  }
  ```

**POST** `/api/admin/hotels`
- **Purpose**: Create or update hotel configuration
- **Auth**: None (Phase 1)
- **Body**:
  ```json
  {
    "hotel_code": "HOTEL001",
    "hotel_name": "Grand Plaza Hotel",
    "service_account_json": "{...}",
    "data_location": "US",
    "project_id": "my-project-123"
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "message": "Hotel configuration saved successfully"
  }
  ```

**DELETE** `/api/admin/hotels`
- **Purpose**: Delete hotel configuration
- **Auth**: None (Phase 1)
- **Body**:
  ```json
  {
    "hotel_code": "HOTEL001"
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "message": "Hotel deleted successfully"
  }
  ```

### BigQuery API

**POST** `/api/bigquery/test-connection`
- **Purpose**: Test BigQuery credentials
- **Body**:
  ```json
  {
    "service_account_json": "{...}",
    "data_location": "US",
    "project_id": "my-project-123"
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "message": "Connection successful"
  }
  ```

**POST** `/api/bigquery/execute-query`
- **Purpose**: Execute BigQuery query with variable substitution
- **Body**:
  ```json
  {
    "hotel_code": "HOTEL001",
    "sql_query": "SELECT COUNT(*) as value FROM `{project_id}.{dataset_id}.{table_name}` WHERE date >= @start_date",
    "variables": [
      { "name": "start_date", "type": "DATE", "value": "2025-01-01" }
    ]
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "value": 1234,
    "cached": false
  }
  ```

---

## 🔧 Configuration Files

### `wrangler.jsonc`
Cloudflare Workers configuration

```jsonc
{
  "name": "astro",
  "d1_databases": [{
    "binding": "DB",                          // Access via locals.runtime.env.DB
    "database_name": "bigquery-dashboard",    // Human-readable name
    "database_id": "your-database-id",        // Replace with actual ID
    "migrations_dir": "migrations/"           // Auto-applied on deploy
  }]
}
```

### `webflow.json`
Webflow Cloud integration

```json
{
  "cloud": {
    "framework": "astro",
    "project_id": "83af84b9-344b-404e-a504-b462c40dee89"
  },
  "devlink": {
    "rootDir": "./src/site-components",
    "cssModules": true
  }
}
```

### `.env` (Local Only)
Development environment variables

```env
# Optional - only if using CMS
WEBFLOW_CMS_SITE_API_TOKEN="your-token-here"
WEBFLOW_API_HOST="https://api.webflow.com"
```

**Security**: Never commit `.env` to git!

---

## 🎯 Query Template Variables

### Variable Syntax

**In SQL**: Use `@` prefix
```sql
WHERE date >= @start_date AND hotel_id = @hotel_id
```

**In Code**: Pass without `@` prefix
```typescript
{
  name: "start_date",
  type: "DATE",
  value: "2025-01-01"
}
```

### Variable Types

| Type | BigQuery Type | Example Value | Description |
|------|---------------|---------------|-------------|
| `STRING` | `STRING` | `"HOTEL001"` | Text values |
| `INT64` | `INT64` | `42` | Whole numbers |
| `FLOAT64` | `FLOAT64` | `3.14` | Decimal numbers |
| `DATE` | `DATE` | `"2025-01-15"` | Date (YYYY-MM-DD) |
| `TIMESTAMP` | `TIMESTAMP` | `"2025-01-15T10:30:00Z"` | Date + time |
| `BOOL` | `BOOL` | `true` | Boolean values |

### Template Placeholders

Use curly braces for dynamic substitution:

| Placeholder | Replaced With | Example |
|-------------|---------------|---------|
| `{project_id}` | Hotel's GCP project ID | `my-analytics-project` |
| `{dataset_id}` | Hotel's dataset ID | `production_metrics` |
| `{table_name}` | Hotel's table name | `daily_bookings` |

**Example**:
```sql
SELECT COUNT(*) as value
FROM `{project_id}.{dataset_id}.{table_name}`
WHERE date >= @start_date
```

**Becomes**:
```sql
SELECT COUNT(*) as value
FROM `my-analytics-project.production_metrics.daily_bookings`
WHERE date >= '2025-01-01'
```

---

## 💾 Caching Strategy

### Current Implementation

- **Cache Duration**: 24 hours
- **Reset Time**: 7:00 AM PST daily
- **Storage**: In-memory (per-request)
- **Key Format**: `${hotel_code}:${sql_query}:${variables_hash}`

### Cache Behavior

```typescript
// First request: Fresh query
GET /api/bigquery/execute-query → BigQuery → Cache → Response (cached: false)

// Subsequent requests: Cached
GET /api/bigquery/execute-query → Cache → Response (cached: true)

// After 7am PST: Cache cleared
GET /api/bigquery/execute-query → BigQuery → Cache → Response (cached: false)
```

### Future Enhancement (Phase 2)

- Move cache to KV namespace (persistent)
- Add manual cache refresh button
- Per-query cache TTL
- Cache invalidation on data updates

---

## 🚀 Deployment Workflow

### Local Development

```bash
# 1. Install dependencies
npm install

# 2. Create D1 database
npx wrangler d1 create bigquery-dashboard

# 3. Update wrangler.jsonc with database_id

# 4. Initialize schema
npx wrangler d1 execute bigquery-dashboard --local --file=./schema.sql

# 5. Start dev server
npm run dev

# 6. Access admin panel
open http://localhost:3000/admin
```

### Production Deployment

```bash
# 1. Commit changes
git add -A
git commit -m "feat: add hotel configurations"

# 2. Push to GitHub
git push origin main

# 3. Webflow Cloud auto-deploys

# 4. Initialize production schema (first time only)
npx wrangler d1 execute bigquery-dashboard --remote --file=./schema.sql

# 5. Configure environment variables in Webflow dashboard
# Site Settings → Apps & Integrations → [Your App] → Settings
```

---

## 🔐 Security Checklist

### Development
- [ ] `.env` file is gitignored
- [ ] No credentials in source code
- [ ] Service account has minimum permissions
- [ ] Dev server uses HTTPS (production)

### Production
- [ ] Environment variables set in Webflow dashboard
- [ ] Service account keys rotated regularly
- [ ] BigQuery audit logs enabled
- [ ] D1 backups configured
- [ ] CORS properly configured
- [ ] Rate limiting enabled (Phase 2)

### Future (Phase 3)
- [ ] User authentication enabled
- [ ] Role-based access control
- [ ] Session management
- [ ] Audit logging
- [ ] IP whitelisting

---

## 🐛 Troubleshooting

### Dev Server Won't Start

```bash
# Kill processes on port 3000
npx kill-port 3000

# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Start fresh
npm run dev
```

### Database Not Found

```bash
# List all D1 databases
npx wrangler d1 list

# Check wrangler.jsonc has correct database_id
cat wrangler.jsonc | grep database_id

# Recreate if needed
npx wrangler d1 create bigquery-dashboard
```

### Admin Panel Shows Empty

```bash
# Check tables exist
npx wrangler d1 execute bigquery-dashboard --local --command="SELECT name FROM sqlite_master WHERE type='table';"

# Reinitialize if missing
npx wrangler d1 execute bigquery-dashboard --local --file=./schema.sql

# Hard refresh browser
# Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)
```

### Query Execution Fails

**Check**:
1. Service account JSON is valid
2. BigQuery API is enabled in GCP
3. Service account has `BigQuery Data Viewer` role
4. Data location matches dataset location
5. Query syntax is correct
6. Variables are properly defined

**Debug**:
```bash
# Test query in BigQuery console first
# Copy/paste exact query
# Replace @variables with actual values
# Verify it runs successfully
```

---

## 📊 Performance Tips

### Query Optimization

✅ **DO**:
- Use `LIMIT` for large result sets
- Index frequently filtered columns
- Use partitioned tables
- Select only needed columns
- Use approximate aggregates (`APPROX_COUNT_DISTINCT`)

❌ **DON'T**:
- Use `SELECT *`
- Scan entire tables without filters
- Use complex `JOIN`s unnecessarily
- Query data older than needed

### Cache Optimization

✅ **DO**:
- Use consistent variable naming
- Query at regular intervals (hourly)
- Group similar queries together
- Pre-fetch common metrics

❌ **DON'T**:
- Query with random variable values
- Bypass cache unnecessarily
- Query every second
- Cache volatile data

---

## 📚 Next Steps

### Phase 2: Client Dashboard
- [ ] Year/month filter dropdown
- [ ] Dynamic metric cards (KPI display)
- [ ] Query execution with variables
- [ ] Loading states and error handling
- [ ] Responsive design

### Phase 3: User Management
- [ ] User authentication (email/password)
- [ ] Hotel access permissions
- [ ] Role-based access control
- [ ] Session management
- [ ] Audit logging

### Phase 4: Advanced Features
- [ ] Real-time data updates (WebSockets)
- [ ] Custom dashboard builder
- [ ] Export to CSV/Excel
- [ ] Scheduled reports (email)
- [ ] Data visualization (charts)

---

## 🆘 Support

### Documentation
- `SETUP_INSTRUCTIONS.md` - Complete setup guide
- `D1_SETUP.md` - D1 database configuration
- `ADMIN_QUICK_START.md` - Admin panel usage
- `DASHBOARD_SETUP.md` - Dashboard configuration

### External Resources
- [Cloudflare D1 Docs](https://developers.cloudflare.com/d1/)
- [BigQuery API Docs](https://cloud.google.com/bigquery/docs)
- [Webflow Cloud Docs](https://webflow.com/cloud)
- [Astro Docs](https://docs.astro.build)

---

**Last Updated**: February 18, 2026
**Version**: Phase 1 Complete
