# 🚀 Quick Start - v2.0

## What's New in v2.0?

✅ **Persistent Config** - Never re-enter credentials  
✅ **Data Location** - Fix location mismatch errors  
✅ **Query Variables** - Dynamic date ranges & parameters  

---

## 5-Minute Setup

### 1. Start the App
```bash
npm install
npm run dev
```

### 2. Configure Connection
1. Click **"Configure BigQuery"**
2. Paste service account JSON
3. Select **data location** (e.g., `us-central1`)
4. Click **"Test Connection"** ✓

### 3. Add a Metric with Variables

**Example: Daily Active Users**

**Query**:
```sql
SELECT COUNT(DISTINCT user_id) as value
FROM `my-project.analytics.events`
WHERE DATE(timestamp) BETWEEN @start_date AND @end_date
```

**Variables**:
- Click **"Add Variable"**
- Name: `start_date` | Type: `date` | Default: `2024-01-01`
- Name: `end_date` | Type: `date` | Default: `2024-12-31`

### 4. View Dashboard
- Click **"Save Configuration & View Dashboard"**
- Click **"📅 Set Variables"** to adjust dates
- Click **"Apply & Refresh"**

---

## Common Queries with Variables

### 1. Revenue by Date Range
```sql
SELECT SUM(amount) as value
FROM `project.sales.transactions`
WHERE date BETWEEN @start_date AND @end_date
```
Variables: `start_date` (date), `end_date` (date)

### 2. Top Products Above Threshold
```sql
SELECT COUNT(*) as value
FROM `project.products.inventory`
WHERE price > @min_price
AND category = @category
```
Variables: `min_price` (number), `category` (string)

### 3. User Cohort Analysis
```sql
SELECT COUNT(*) as value
FROM `project.users.signups`
WHERE signup_date = @cohort_date
AND status = @user_status
```
Variables: `cohort_date` (date), `user_status` (string)

---

## Troubleshooting

### ❌ "Location mismatch" error
**Solution**: Go to Connection tab → Select correct data location (e.g., `us-central1`)

### ❌ Variable not working
**Solution**: Use `@variable_name` in query (with `@` prefix)

### ❌ Lost configuration
**Solution**: Config is now saved! Reload page to restore. Use "Clear Config" to reset.

---

## Data Locations by Region

### Most Common
- `US` - Multi-region (default)
- `us-central1` - Iowa
- `us-east1` - South Carolina
- `europe-west1` - Belgium
- `asia-northeast1` - Tokyo

### How to Check Your Location
1. Go to BigQuery Console
2. Click on your dataset
3. Look for "Data location" in details panel
4. Use that exact value in the dashboard

---

## Variable Best Practices

### ✅ Do's
- Use clear names: `start_date`, `min_revenue`, `user_status`
- Set default values for immediate use
- Test with "Set Variables" before production
- Document variables in Table Name field

### ❌ Don'ts
- Generic names: `var1`, `x`, `temp`
- Missing default values
- Forgetting `@` prefix in queries
- Mismatched variable types

---

## Cache Behavior with Variables

- Cache key includes variable values
- Same variables = cached results ✓
- Different variables = new query 🔴
- Cache expires 7am PST daily
- "Refresh All" bypasses cache

---

## Example: Complete Metric Setup

**Metric Name**: Monthly Revenue

**Table Name**: `my-project.sales.transactions`

**Query**:
```sql
SELECT 
  SUM(amount) as value,
  COUNT(*) as transaction_count
FROM `my-project.sales.transactions`
WHERE 
  DATE(created_at) BETWEEN @start_date AND @end_date
  AND status = @status
  AND amount > @min_amount
```

**Variables**:
1. `start_date` (date) → Default: `2024-01-01`
2. `end_date` (date) → Default: `2024-01-31`
3. `status` (string) → Default: `completed`
4. `min_amount` (number) → Default: `10`

**Testing**:
1. Save metric
2. Go to dashboard
3. Click "📅 Set Variables"
4. Adjust dates/values
5. Click "Apply & Refresh"

---

## Keyboard Shortcuts

- None yet! (Future enhancement)

---

## Quick Commands

```bash
# Development
npm run dev

# Type check
npm run astro check

# Build
npm run build

# Preview production
npm run preview
```

---

## Need Help?

📚 Full Documentation: [README.md](./README.md)  
🔧 Variable Guide: [VARIABLE_CONFIGURATION.md](./VARIABLE_CONFIGURATION.md)  
📝 Setup Guide: [DASHBOARD_SETUP.md](./DASHBOARD_SETUP.md)  
🐛 Changelog: [CHANGELOG.md](./CHANGELOG.md)  

---

## Pro Tips

1. **Start Simple**: Begin without variables, add them later
2. **Test Queries**: Run in BigQuery console first
3. **Use Partitioned Tables**: Save costs on large datasets
4. **Set Cost Alerts**: Avoid surprise BigQuery bills
5. **Cache Wisely**: Variables included in cache key
6. **Clear Config**: Use button to reset saved credentials
7. **Location Matters**: Must match your dataset location!

---

## Support

Having issues? Check:
1. Service account roles (BigQuery Data Viewer + Job User)
2. Data location matches your dataset
3. Query works in BigQuery console
4. Variable names match query (`@name`)
5. Browser console for errors

---

**Ready to build?** Start with Demo Mode to explore, then configure your real connection! 🎉
