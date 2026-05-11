# Query Variables & Configuration Guide

## Overview

The BigQuery Dashboard now supports:
1. **Persistent Credentials** - Credentials are saved to browser localStorage
2. **Data Location Configuration** - Specify the exact location of your BigQuery datasets
3. **Dynamic Query Variables** - Create parameterized queries with date ranges and other variables

---

## 1. Persistent Credentials

### How It Works
- Service account JSON and all configuration is automatically saved to browser `localStorage`
- Configuration persists across browser sessions
- No server-side storage - all data stays in your browser
- Use "Clear Config" button to remove saved credentials

### Security
- Credentials never leave your browser except during API calls
- No credentials are stored on the server
- All queries execute server-side using credentials sent in each request

---

## 2. Data Location Configuration

### Why This Matters
BigQuery requires that queries specify the correct data location. If your data is in `us-central1` but you query with default `US`, you'll get errors.

### Supported Locations
- **Multi-region**: `US`, `EU`
- **Americas**: `us-central1`, `us-east1`, `us-east4`, `us-west1`, `us-west2`, `us-west3`, `us-west4`, `northamerica-northeast1`, `southamerica-east1`
- **Europe**: `europe-north1`, `europe-west1`, `europe-west2`, `europe-west3`, `europe-west4`, `europe-west6`
- **Asia Pacific**: `asia-east1`, `asia-east2`, `asia-northeast1`, `asia-northeast2`, `asia-northeast3`, `asia-south1`, `asia-southeast1`, `asia-southeast2`, `australia-southeast1`

### How to Set
1. Go to Connection tab
2. Select your data location from the dropdown
3. Must match where your BigQuery datasets are stored

---

## 3. Query Variables

### What Are Query Variables?
Variables allow you to create dynamic queries that can be changed without editing SQL. Perfect for:
- Date ranges
- Filtering by specific values
- A/B testing different parameters
- Production vs testing environments

### Variable Types
- **date** - Date fields (YYYY-MM-DD format)
- **string** - Text values
- **number** - Numeric values

### How to Add Variables

#### 1. Define Variables in Configuration
```sql
-- Example query with variables
SELECT 
  COUNT(*) as total_users,
  SUM(revenue) as total_revenue
FROM `project.dataset.users`
WHERE 
  created_date BETWEEN @start_date AND @end_date
  AND status = @user_status
  AND revenue > @min_revenue
```

#### 2. Add Variable Definitions
In the metric configuration:
- Click "Add Variable"
- **Variable Name**: `start_date` (matches `@start_date` in query)
- **Type**: `date`
- **Default Value**: `2024-01-01` (optional)

Repeat for each variable:
- `end_date` → `date` → `2024-12-31`
- `user_status` → `string` → `active`
- `min_revenue` → `number` → `100`

### Using Variables in Dashboard

#### Testing Mode
1. Click "📅 Set Variables" button
2. Adjust date ranges or other values
3. Click "Apply & Refresh"
4. Queries run with your test values

#### Production Mode
- Variables use default values automatically
- Can still adjust via "Set Variables" dialog
- Perfect for daily/weekly reports with fixed date logic

### Variable Examples

#### Example 1: Date Range Analysis
```sql
SELECT 
  DATE(timestamp) as date,
  COUNT(DISTINCT user_id) as daily_active_users
FROM `project.analytics.events`
WHERE 
  DATE(timestamp) BETWEEN @start_date AND @end_date
GROUP BY date
ORDER BY date
```

Variables:
- `start_date` (date) → Default: 7 days ago
- `end_date` (date) → Default: today

#### Example 2: Product Filter
```sql
SELECT 
  product_category,
  SUM(quantity) as total_sold,
  SUM(revenue) as total_revenue
FROM `project.sales.transactions`
WHERE 
  product_category = @category
  AND sale_date >= @since_date
GROUP BY product_category
```

Variables:
- `category` (string) → Default: "Electronics"
- `since_date` (date) → Default: "2024-01-01"

#### Example 3: Threshold-Based Metrics
```sql
SELECT 
  COUNT(*) as high_value_customers
FROM `project.crm.customers`
WHERE 
  lifetime_value > @min_value
  AND signup_date >= @min_signup_date
```

Variables:
- `min_value` (number) → Default: 1000
- `min_signup_date` (date) → Default: "2024-01-01"

---

## Best Practices

### 1. Always Set Default Values
Provide sensible defaults so the dashboard works immediately without variable configuration.

### 2. Use Meaningful Variable Names
- ✅ `start_date`, `end_date`, `min_revenue`
- ❌ `var1`, `x`, `temp`

### 3. Document Variables
Use the Table Name field to document what variables your query expects:
```
Table: project.dataset.transactions
Variables: @start_date, @end_date (date range for analysis)
```

### 4. Test Before Production
1. Configure query with variables
2. Use "Set Variables" to test with different values
3. Verify results before saving configuration

### 5. Leverage Caching
- Variables are included in cache key
- Same variable values = cached results
- Different values = new query execution
- Cache expires at 7am PST daily

---

## Troubleshooting

### "Connection test failed"
- Check data location matches your dataset
- Verify service account has correct permissions
- Ensure JSON is valid

### "Query execution failed"
- Verify variable names match query (`@variable_name`)
- Check variable types match query expectations
- Ensure table names are correct and accessible

### Variables not updating
- Click "Apply & Refresh" after changing variables
- Check that variable names match exactly (case-sensitive)
- Verify variables are defined in metric configuration

### Cached data with wrong variables
- Use "Refresh All" to force new queries
- Clear browser cache if needed
- Variables are part of cache key - changing variables should bypass cache

---

## API Details

### Execute Query with Variables
```typescript
POST /api/bigquery/execute-query
{
  "serviceAccountJson": "...",
  "dataLocation": "us-central1",
  "query": "SELECT * FROM table WHERE date = @date",
  "metricName": "Daily Users",
  "variables": [
    {
      "name": "date",
      "type": "date",
      "value": "2024-01-15"
    }
  ],
  "useCache": true
}
```

### Response
```typescript
{
  "success": true,
  "data": [...],
  "cached": false,
  "timestamp": "2024-01-15T12:00:00Z",
  "rowCount": 150,
  "cacheInfo": "Data will be cached until 7am PST"
}
```

---

## Example Use Cases

### Use Case 1: Daily Revenue Report
**Query**: Calculate yesterday's revenue
```sql
SELECT SUM(amount) as revenue
FROM `sales.transactions`
WHERE DATE(timestamp) = @report_date
```

**Variables**:
- `report_date` (date) → Default: CURRENT_DATE() - 1

**Production**: Runs automatically with yesterday's date
**Testing**: Adjust date to review historical days

### Use Case 2: A/B Test Analysis
**Query**: Compare conversion rates
```sql
SELECT 
  experiment_variant,
  COUNT(*) as users,
  SUM(converted) as conversions
FROM `experiments.results`
WHERE 
  experiment_name = @experiment
  AND date BETWEEN @start_date AND @end_date
GROUP BY experiment_variant
```

**Variables**:
- `experiment` (string) → Change to analyze different tests
- `start_date`, `end_date` (date) → Adjust analysis period

### Use Case 3: Top Performers
**Query**: Find top products above threshold
```sql
SELECT 
  product_id,
  product_name,
  SUM(revenue) as total_revenue
FROM `sales.products`
WHERE revenue > @min_revenue
GROUP BY product_id, product_name
ORDER BY total_revenue DESC
LIMIT @limit
```

**Variables**:
- `min_revenue` (number) → Adjust threshold
- `limit` (number) → Change top N results

---

## Migration Guide

### Existing Dashboards
If you have an existing dashboard configuration:
1. Your queries will continue to work
2. Add `dataLocation` field to saved config (defaults to `US`)
3. Optionally add variables to make queries dynamic

### Adding Variables to Existing Queries
1. Go to "Back to Config"
2. Edit metric in Metrics tab
3. Click "Add Variable" for each parameter
4. Update query to use `@variable_name` syntax
5. Save and test with "Set Variables"

---

## Summary

✅ **Credentials Persist** - No need to re-enter after errors  
✅ **Location Aware** - Specify exact BigQuery data location  
✅ **Dynamic Queries** - Use variables for flexible analysis  
✅ **Test & Production** - Same queries, different variable values  
✅ **Cached Results** - Variables included in cache key for performance  

Your dashboard is now production-ready with flexible configuration and reliable data access! 🎉
