# Global Query Templates Guide

## Overview

The dashboard now uses **Global Query Templates** instead of per-hotel templates. This means you create query templates once and they work for all hotels by automatically injecting the hotel-specific parameters at runtime.

## Benefits

✅ **Single Source of Truth**: Create templates once, use everywhere  
✅ **Easier Maintenance**: Update one template instead of updating it for each hotel  
✅ **Automatic Filtering**: Hotel code and other parameters are injected automatically  
✅ **Consistent Metrics**: All hotels use the same query logic  

## How It Works

### Template Placeholders

Use these placeholders in your SQL queries - they will be replaced at runtime:

| Placeholder | Description | Example Value |
|------------|-------------|---------------|
| `{{hotel_code}}` | Current hotel code | `DTWDFH` |
| `{{project_id}}` | BigQuery project ID | `my-project-123456` |
| `{{dataset_id}}` | Dataset ID from hotel config | `analytics_dataset` |
| `{{table_id}}` | Table ID from hotel config | `bookings_table` |
| `{{start_date}}` | Start of selected month | `2024-01-01` |
| `{{end_date}}` | End of selected month | `2024-01-31` |
| `{{year}}` | Selected year | `2024` |
| `{{month}}` | Selected month | `1` |

### Example Template

**Template Name**: `total_bookings`  
**Display Name**: `Total Bookings`  
**SQL Query**:
```sql
SELECT COUNT(*) as total
FROM `{{project_id}}.{{dataset_id}}.bookings`
WHERE hotel_code = '{{hotel_code}}'
  AND date BETWEEN '{{start_date}}' AND '{{end_date}}'
```

When executed for hotel `DTWDFH` in January 2024, this becomes:
```sql
SELECT COUNT(*) as total
FROM `my-project-123456.analytics_dataset.bookings`
WHERE hotel_code = 'DTWDFH'
  AND date BETWEEN '2024-01-01' AND '2024-01-31'
```

## Creating Templates

### In the Admin Panel

1. Go to **Admin Panel** → **Global Query Templates** tab
2. Fill in:
   - **Template Name**: Unique identifier (e.g., `total_revenue`)
   - **Display Name**: What users see (e.g., `Total Revenue`)
   - **Description**: Optional explanation
   - **SQL Query**: Your query with placeholders
3. Click **Save Query Template**

### Template Best Practices

#### ✅ DO:
- Use descriptive template names (`total_bookings`, `average_daily_rate`)
- Always filter by `hotel_code` to isolate hotel data
- Use date range placeholders (`{{start_date}}`, `{{end_date}}`)
- Return a single value (first column of first row is displayed)
- Add helpful descriptions

#### ❌ DON'T:
- Hardcode hotel codes or project IDs
- Return multiple columns (only first is used)
- Create hotel-specific templates (defeats the purpose)
- Use complex result structures

## Database Schema

### global_query_templates Table

```sql
CREATE TABLE global_query_templates (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  template_name TEXT UNIQUE NOT NULL,
  metric_name TEXT NOT NULL,
  sql_query TEXT NOT NULL,
  description TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

## Migration from Per-Hotel Templates

If you had per-hotel templates (`query_templates` table), you'll need to:

1. Identify common query patterns
2. Create global templates with placeholders
3. Test with one hotel first
4. Delete old per-hotel templates once verified

The old `query_templates` table still exists but is no longer used by the dashboard.

## API Endpoints

### Get All Templates
```bash
GET /api/admin/templates
```

### Create Template
```bash
POST /api/admin/templates
Content-Type: application/json

{
  "template_name": "total_bookings",
  "metric_name": "Total Bookings",
  "sql_query": "SELECT COUNT(*) FROM ...",
  "description": "Count of all bookings"
}
```

### Delete Template
```bash
DELETE /api/admin/templates?id=1
```

## Metrics API

The `/api/client/metrics` endpoint automatically:
1. Fetches hotel configuration (project_id, dataset_id, credentials)
2. Loads all global templates
3. Replaces placeholders with actual values
4. Executes queries against BigQuery
5. Returns metrics array

Example request:
```bash
POST /api/client/metrics
Content-Type: application/json

{
  "hotel_code": "DTWDFH",
  "year": 2024,
  "month": 1
}
```

Example response:
```json
{
  "metrics": [
    {
      "metric_name": "Total Bookings",
      "value": 152,
      "success": true
    },
    {
      "metric_name": "Total Revenue",
      "value": 45230.50,
      "success": true
    }
  ]
}
```

## Troubleshooting

### No metrics showing
- Check that you've created at least one global template
- Verify template queries are valid SQL
- Check BigQuery credentials are correct for the hotel

### Wrong values
- Verify placeholder replacement is working correctly
- Check date range calculation
- Test query directly in BigQuery console with actual values

### Template errors
- Ensure `hotel_code` filter is present
- Verify table/dataset names exist in BigQuery
- Check for SQL syntax errors

## Example Templates

### Total Bookings
```sql
SELECT COUNT(*) as total_bookings
FROM `{{project_id}}.{{dataset_id}}.bookings`
WHERE hotel_code = '{{hotel_code}}'
  AND booking_date BETWEEN '{{start_date}}' AND '{{end_date}}'
```

### Total Revenue
```sql
SELECT COALESCE(SUM(revenue), 0) as total_revenue
FROM `{{project_id}}.{{dataset_id}}.transactions`
WHERE hotel_code = '{{hotel_code}}'
  AND transaction_date BETWEEN '{{start_date}}' AND '{{end_date}}'
```

### Average Daily Rate
```sql
SELECT COALESCE(AVG(room_rate), 0) as avg_daily_rate
FROM `{{project_id}}.{{dataset_id}}.bookings`
WHERE hotel_code = '{{hotel_code}}'
  AND check_in_date BETWEEN '{{start_date}}' AND '{{end_date}}'
```

### Occupancy Rate
```sql
SELECT ROUND(
  (COUNT(DISTINCT booking_id) * 100.0 / 
   (SELECT COUNT(*) FROM `{{project_id}}.{{dataset_id}}.rooms` 
    WHERE hotel_code = '{{hotel_code}}')
  ), 2) as occupancy_rate
FROM `{{project_id}}.{{dataset_id}}.bookings`
WHERE hotel_code = '{{hotel_code}}'
  AND check_in_date BETWEEN '{{start_date}}' AND '{{end_date}}'
```
