# BigQuery Dashboard - Complete Quick Start Guide

**Get your dashboard running in 10 minutes!** 🚀

---

## 📋 Prerequisites

Before you start, make sure you have:

- [ ] Google Cloud project with BigQuery enabled
- [ ] Service account with BigQuery Data Viewer role
- [ ] Service account JSON key file
- [ ] BigQuery dataset with data
- [ ] Cloudflare D1 database (auto-provisioned)

---

## 🚀 Quick Start (10 Minutes)

### Step 1: Setup Environment (2 min)

1. **Navigate to your project**
   ```bash
   cd your-project-directory
   ```

2. **Create/verify `.env` file exists**
   ```bash
   # Should already exist, but verify it contains:
   # WEBFLOW_CMS_SITE_API_TOKEN=your_token
   # WEBFLOW_API_HOST=your_host
   ```

3. **Install dependencies** (if not already done)
   ```bash
   npm install
   ```

### Step 2: Run Database Migrations (1 min)

```bash
# For local development
npx wrangler d1 execute DB --local --file=./schema.sql

# For production (when ready to deploy)
npx wrangler d1 execute DB --remote --file=./schema.sql
```

**Expected output**:
```
✅ 4 tables created successfully
- hotels
- query_templates  
- cache_entries
- audit_log
```

### Step 3: Start Dev Server (1 min)

```bash
npm run dev
```

**Server will start at**: http://localhost:3000

### Step 4: Configure First Hotel (3 min)

1. **Open admin panel**: http://localhost:3000/admin

2. **Click "Add New Hotel"**

3. **Fill in hotel details**:
   ```
   Hotel Code:     GRAND_PLAZA
   Hotel Name:     Grand Plaza Hotel
   BigQuery Project ID: your-project-id
   Dataset ID:     production_metrics
   Data Location:  US  (or EU, asia-northeast1, etc.)
   ```

4. **Paste Service Account JSON**:
   - Open your service account key file
   - Copy entire JSON content
   - Paste into "Service Account JSON" field

5. **Click "Save Hotel"**

6. **Test Connection**: Click "Test Connection" button
   - Should show: ✅ "Connection successful!"

### Step 5: Add Query Template (3 min)

1. **Click "Edit" on your hotel**

2. **Add a query template**:
   ```
   Template ID:    total_bookings
   Template Name:  Total Bookings
   SQL Query:      
   SELECT COUNT(*) as value
   FROM `{project_id}.{dataset_id}.bookings`
   WHERE booking_date >= @start_date
     AND booking_date <= @end_date
   ```

3. **Define variables**:
   ```
   Variable Name:  start_date
   Variable Type:  DATE
   
   Variable Name:  end_date  
   Variable Type:  DATE
   ```

4. **Click "Save Template"**

### Step 6: View Dashboard! ✨

1. **Open homepage**: http://localhost:3000

2. **Should see**:
   - Hotel selector (auto-selected to "Grand Plaza Hotel")
   - Year/month filters (current month selected)
   - Metric card showing "Total Bookings" with value

3. **Try changing filters**:
   - Select different month → metrics update
   - Click "Refresh Data" → re-fetches from BigQuery

---

## 🎯 Success Checklist

After completing the quick start, you should have:

- [x] Dev server running on port 3000
- [x] Admin panel accessible at `/admin`
- [x] At least one hotel configured
- [x] BigQuery connection tested successfully
- [x] At least one query template created
- [x] Dashboard displaying metrics on homepage
- [x] Filters working (hotel/year/month)
- [x] Refresh button fetching new data

---

## 📊 Example Queries to Add

Here are some common queries you can add to get started:

### 1. Total Revenue
```sql
SELECT COALESCE(SUM(amount), 0) as value
FROM `{project_id}.{dataset_id}.bookings`
WHERE booking_date >= @start_date
  AND booking_date <= @end_date
  AND hotel_id = @hotel_code
```

**Variables**: `start_date` (DATE), `end_date` (DATE), `hotel_code` (STRING)

### 2. Occupancy Rate
```sql
WITH occupancy_calc AS (
  SELECT 
    COUNT(DISTINCT room_id) as occupied_rooms,
    (SELECT COUNT(*) FROM `{project_id}.{dataset_id}.rooms` WHERE hotel_id = @hotel_code) as total_rooms
  FROM `{project_id}.{dataset_id}.bookings`
  WHERE booking_date >= @start_date
    AND booking_date <= @end_date
    AND hotel_id = @hotel_code
)
SELECT 
  ROUND((occupied_rooms / NULLIF(total_rooms, 0)) * 100, 1) as value
FROM occupancy_calc
```

**Variables**: `start_date` (DATE), `end_date` (DATE), `hotel_code` (STRING)

### 3. Average Stay Duration
```sql
SELECT 
  COALESCE(ROUND(AVG(DATE_DIFF(checkout_date, checkin_date, DAY)), 1), 0) as value
FROM `{project_id}.{dataset_id}.bookings`
WHERE checkin_date >= @start_date
  AND checkin_date <= @end_date
  AND hotel_id = @hotel_code
```

**Variables**: `start_date` (DATE), `end_date` (DATE), `hotel_code` (STRING)

### 4. New Customers
```sql
SELECT COUNT(DISTINCT customer_id) as value
FROM `{project_id}.{dataset_id}.bookings`
WHERE booking_date >= @start_date
  AND booking_date <= @end_date
  AND hotel_id = @hotel_code
  AND is_first_booking = TRUE
```

**Variables**: `start_date` (DATE), `end_date` (DATE), `hotel_code` (STRING)

---

## 🔧 Common Issues & Solutions

### Issue 1: "Database not configured"

**Cause**: D1 binding not found

**Solution**:
```bash
# Check wrangler.jsonc has correct binding
# Should contain:
[[d1_databases]]
binding = "DB"
database_name = "hotel-analytics-db"
database_id = "your-database-id"

# Run migrations again
npx wrangler d1 execute DB --local --file=./schema.sql
```

### Issue 2: "Connection failed" when testing

**Causes**:
- Invalid service account JSON
- Missing BigQuery API permissions
- Wrong project ID or dataset ID
- Data location mismatch

**Solutions**:
1. Verify service account has "BigQuery Data Viewer" role
2. Enable BigQuery API in Google Cloud Console
3. Double-check project ID (exact match)
4. Verify dataset exists in BigQuery
5. Match data location (US/EU/etc.) to actual dataset location

### Issue 3: No metrics showing on dashboard

**Causes**:
- No query templates added
- Query syntax error
- Missing required variables
- Query doesn't return "value" column

**Solutions**:
1. Add at least one query template
2. Test query in BigQuery console first
3. Ensure query uses `@variable_name` syntax
4. Query must have `SELECT ... as value`

### Issue 4: "Query execution failed"

**Causes**:
- Invalid SQL syntax
- Table doesn't exist
- Missing variables
- Type mismatch

**Solutions**:
1. Copy query and test in BigQuery console
2. Verify table name format: `` `project.dataset.table` ``
3. Check all variables are defined in template
4. Ensure variable types match query needs (DATE vs STRING vs INT64)

---

## 🎨 Next Steps

### Add More Hotels

1. Go to `/admin`
2. Click "Add New Hotel"
3. Repeat Step 4 from Quick Start
4. Dashboard hotel selector will now show multiple hotels

### Add More Metrics

1. Go to `/admin`
2. Edit a hotel
3. Add new query templates
4. Dashboard will automatically show new metric cards

### Customize Formatting

Edit `src/components/ClientDashboard.tsx`:

```typescript
const formatValue = (value: number | string | null, template_name: string): string => {
  // Add your custom formatters here
  if (template_name.includes('nights')) {
    return `${value} nights`;
  }
  // ... existing formatters
};
```

---

## 📚 Additional Resources

### Documentation

- **`SETUP_INSTRUCTIONS.md`** - Detailed setup with D1 configuration
- **`ADMIN_QUICK_START.md`** - Admin panel detailed guide
- **`DASHBOARD_SETUP.md`** - Client dashboard features (Phase 2)
- **`QUICK_REFERENCE.md`** - API endpoints reference
- **`PROJECT_SUMMARY.md`** - Architecture and design decisions

### Admin Panel Features

- Add/edit/delete hotels
- Test BigQuery connections
- Manage query templates
- Configure variables
- View audit logs (future)

### Dashboard Features

- Multi-hotel selector
- Year/month filtering
- Real-time metric display
- Caching (24hr, resets 7am PST)
- Manual refresh
- Error handling
- Responsive design

---

## 🚨 Important Notes

### Security

⚠️ **Service Account JSON**:
- Stored encrypted in D1 database
- Never exposed to client
- Only used server-side
- Keep your JSON file secure

⚠️ **API Endpoints**:
- `/api/admin/*` - Currently public (add auth in Phase 3)
- `/api/bigquery/*` - Server-side only, requires hotel_code

### Performance

💡 **Caching**:
- First query: ~2-3 seconds (BigQuery)
- Cached queries: <100ms
- Cache duration: 24 hours
- Reset time: 7:00 AM PST

💡 **Query Optimization**:
- Use partitioned tables
- Add date filters in WHERE clause
- Use APPROX functions for large datasets
- Limit result rows with LIMIT clause

### Development vs Production

**Local Development**:
```bash
npm run dev
# Uses --local flag for D1
# No persistent storage
```

**Production Deployment**:
```bash
npm run build
npx wrangler deploy
# Uses remote D1 binding
# Persistent storage in Cloudflare
```

---

## ✅ Quick Start Complete!

You now have:
- ✅ Working BigQuery dashboard
- ✅ Admin panel for configuration
- ✅ Client dashboard with filters
- ✅ Caching and performance optimizations
- ✅ Multi-hotel support

**What's Next?**

🔐 **Phase 3**: Add authentication and user management  
📊 **Phase 4**: Add charts, exports, and advanced analytics  
🎨 **Custom**: Integrate your Webflow components

---

**Need Help?**

- Check `TROUBLESHOOTING.md` for common issues
- Review `PROJECT_SUMMARY.md` for architecture details
- See `ADMIN_QUICK_START.md` for admin panel guide

---

**Happy Dashboarding!** 🎉
