# Hybrid Query Builder Guide

## Overview

The Hybrid Query Builder provides a **table-driven, visual query building experience** with the option to use advanced SQL for complex queries. This system eliminates the need to manually write SQL for common queries while still providing full flexibility when needed.

---

## Architecture

### 1. Table Registry
Tables are registered once with their schema metadata (columns, types, descriptions). This enables:
- Automatic placeholder generation
- Type-aware filtering
- Smart aggregation options
- Visual query building

### 2. Query Templates V2
Templates are built visually or with custom SQL and stored in the database. Each template:
- References a registered table
- Defines aggregation logic (SUM, COUNT, AVG, etc.)
- Includes filters (with placeholder support)
- Can group by dimensions
- Generates SQL automatically OR uses custom SQL

### 3. Global Placeholders
Always available in all queries:
- `{{hotel_code}}` - Current hotel identifier
- `{{project_id}}` - BigQuery project ID
- `{{dataset_id}}` - BigQuery dataset ID
- `{{table_id}}` - BigQuery table ID
- `{{start_date}}` - Start date for date range filters
- `{{end_date}}` - End date for date range filters
- `{{year}}` - Current year filter
- `{{month}}` - Current month filter

### 4. Table-Specific Placeholders
Automatically generated from registered table columns:
- Each column becomes a placeholder: `{{column_name}}`
- Can be used in filters, GROUP BY, or custom SQL
- Type-aware (numeric, string, date, etc.)

---

## User Flow

### Step 1: Register Tables (Schema Discovery)

1. **Navigate to Admin Panel → Table Registry**
2. **Select a hotel** with BigQuery credentials
3. **Enter dataset ID** (e.g., `analytics_dataset`)
4. **Click "List Tables"** to discover available tables
5. **Select a table** and click "Discover Schema"
6. **Review discovered columns** (types, aggregatable, filterable, groupable)
7. **Provide a table key** (unique identifier, e.g., `reservations`)
8. **Provide a display name** (e.g., "Reservations")
9. **Click "Register Table"**

The system will:
- Fetch table schema from BigQuery
- Identify numeric columns (aggregatable)
- Identify string/date columns (groupable)
- Store metadata in the database

### Step 2: Build Query Templates

#### Visual Mode (Recommended for most use cases)

1. **Navigate to Admin Panel → Query Builder**
2. **Fill in basic info**:
   - Template Name: `total_revenue_by_segment`
   - Display Name: `Total Revenue by Segment`
   - Description: `Sum of revenue grouped by customer segment`
3. **Select a registered table** (e.g., "Reservations")
4. **Configure aggregation**:
   - Aggregation Type: `SUM`
   - Column: `revenue`
5. **Add GROUP BY** (optional):
   - Click "Add dimension" → Select `segment`
6. **Add filters**:
   - Default: `hotel_code = {{hotel_code}}`
   - Add: `booking_date BETWEEN {{start_date}} AND {{end_date}}`
7. **Preview generated SQL** in the preview pane
8. **Click "Save Template"**

Generated SQL example:
```sql
SELECT segment, SUM(revenue) as value
FROM `{{project_id}}.{{dataset_id}}.reservations`
WHERE hotel_code = '{{hotel_code}}'
  AND booking_date BETWEEN '{{start_date}}' AND '{{end_date}}'
GROUP BY segment
```

#### Advanced Mode (For complex queries)

1. **Follow steps 1-3 from Visual Mode**
2. **Switch to "Advanced SQL" tab**
3. **Write custom SQL** with placeholders:
   ```sql
   SELECT 
     COALESCE(SUM(revenue), 0) as value
   FROM `{{project_id}}.{{dataset_id}}.reservations`
   WHERE hotel_code = '{{hotel_code}}'
     AND booking_date BETWEEN '{{start_date}}' AND '{{end_date}}'
     AND cancellation_date IS NULL
     AND segment IN ('Leisure', 'Corporate')
   ```
4. **Click "Save Template"**

---

## Benefits of This Approach

### ✅ **No SQL Required** (Visual Mode)
- Point-and-click query building
- Automatic SQL generation
- Type-safe column selection
- Preview before saving

### ✅ **Table-Driven**
- Register tables once, reuse everywhere
- Automatic placeholder generation
- Schema-aware building (only show aggregatable columns for SUM/AVG)
- Consistent naming across templates

### ✅ **Flexible**
- Visual mode for simple queries
- Advanced mode for complex logic
- Mix and match as needed
- Full SQL control when required

### ✅ **Maintainable**
- Table metadata stored in database
- Easy to update schema
- Templates reference tables (not hardcoded paths)
- Self-documenting (column types, descriptions)

### ✅ **Scalable**
- Add new tables without code changes
- Reuse table definitions across templates
- Template suggestions for common patterns
- Centralized schema management

---

## Database Tables

### `bigquery_tables`
Stores registered BigQuery tables with metadata.

| Column | Type | Description |
|--------|------|-------------|
| id | INTEGER | Primary key |
| table_key | TEXT | Unique identifier (e.g., "reservations") |
| table_name | TEXT | Display name (e.g., "Reservations") |
| full_table_path | TEXT | Full path (e.g., "project.dataset.table") |
| description | TEXT | Optional description |
| is_active | INTEGER | 1 = active, 0 = inactive |

### `bigquery_table_columns`
Stores column definitions for each table.

| Column | Type | Description |
|--------|------|-------------|
| id | INTEGER | Primary key |
| table_id | INTEGER | References bigquery_tables.id |
| column_name | TEXT | Column name |
| column_type | TEXT | BigQuery type (STRING, INTEGER, DATE, etc.) |
| is_filterable | INTEGER | Can be used in WHERE clauses |
| is_groupable | INTEGER | Can be used in GROUP BY |
| is_aggregatable | INTEGER | Can be used in SUM/AVG/etc. |
| description | TEXT | Optional description |

### `query_templates_v2`
Stores query templates (visual or custom SQL).

| Column | Type | Description |
|--------|------|-------------|
| id | INTEGER | Primary key |
| template_name | TEXT | Unique identifier |
| metric_name | TEXT | Display name |
| table_id | INTEGER | References bigquery_tables.id |
| aggregation_type | TEXT | SUM, COUNT, AVG, MIN, MAX, COUNT_DISTINCT |
| aggregation_column | TEXT | Column to aggregate |
| group_by_columns | TEXT | JSON array of column names |
| filters | TEXT | JSON array of filter objects |
| custom_sql | TEXT | Custom SQL (if use_custom_sql = 1) |
| use_custom_sql | INTEGER | 0 = visual, 1 = custom SQL |
| description | TEXT | Optional description |

### `template_suggestions`
Pre-filled template examples users can customize.

| Column | Type | Description |
|--------|------|-------------|
| id | INTEGER | Primary key |
| suggestion_name | TEXT | Unique identifier |
| table_key | TEXT | Table this applies to |
| metric_name | TEXT | Display name |
| aggregation_type | TEXT | SUM, COUNT, AVG, etc. |
| aggregation_column | TEXT | Column to aggregate |
| description | TEXT | What this template does |

---

## API Endpoints

### Schema Discovery

**`POST /api/admin/bigquery/list-tables`**
List all tables in a BigQuery dataset.

Request body:
```json
{
  "hotel_code": "DTWDFH",
  "dataset_id": "analytics_dataset"
}
```

Response:
```json
{
  "success": true,
  "dataset_id": "analytics_dataset",
  "project_id": "my-project-123456",
  "tables": [
    {
      "table_id": "reservations",
      "table_name": "Reservations",
      "description": "Hotel reservation data",
      "row_count": 125000
    }
  ]
}
```

**`POST /api/admin/bigquery/discover-schema`**
Discover schema for a specific table.

Request body:
```json
{
  "hotel_code": "DTWDFH",
  "dataset_id": "analytics_dataset",
  "table_id": "reservations"
}
```

Response:
```json
{
  "success": true,
  "table_id": "reservations",
  "full_table_path": "my-project-123456.analytics_dataset.reservations",
  "columns": [
    {
      "column_name": "revenue",
      "column_type": "FLOAT64",
      "is_filterable": true,
      "is_groupable": false,
      "is_aggregatable": true
    }
  ]
}
```

### Table Registry

**`GET /api/admin/bigquery/tables`**
Fetch all registered tables with columns.

**`POST /api/admin/bigquery/tables`**
Register a new table.

Request body:
```json
{
  "table_key": "reservations",
  "table_name": "Reservations",
  "full_table_path": "project.dataset.reservations",
  "description": "Hotel reservation records",
  "columns": [
    {
      "column_name": "revenue",
      "column_type": "FLOAT64",
      "is_filterable": true,
      "is_groupable": false,
      "is_aggregatable": true
    }
  ]
}
```

**`DELETE /api/admin/bigquery/tables?table_id=1`**
Remove a registered table (cascades to templates).

### Query Templates V2

**`GET /api/admin/templates/v2`**
Fetch all templates with table information.

**`POST /api/admin/templates/v2`**
Create a new template.

Request body (visual mode):
```json
{
  "template_name": "total_revenue_by_segment",
  "metric_name": "Total Revenue by Segment",
  "table_id": 1,
  "description": "Sum of revenue grouped by segment",
  "use_custom_sql": 0,
  "aggregation_type": "SUM",
  "aggregation_column": "revenue",
  "group_by_columns": "[\"segment\"]",
  "filters": "[{\"column\": \"hotel_code\", \"operator\": \"=\", \"value\": \"{{hotel_code}}\"}]"
}
```

Request body (advanced mode):
```json
{
  "template_name": "complex_revenue_query",
  "metric_name": "Complex Revenue Metric",
  "table_id": 1,
  "description": "Custom complex query",
  "use_custom_sql": 1,
  "custom_sql": "SELECT COALESCE(SUM(revenue), 0) as value..."
}
```

**`DELETE /api/admin/templates/v2?template_id=1`**
Delete a template.

---

## Example Workflows

### Workflow 1: Simple Metric (Total Bookings)
1. Register "reservations" table
2. Create template: COUNT(*), filter by hotel_code and date range
3. Save → Auto-generates SQL
4. Dashboard displays metric

### Workflow 2: Grouped Metric (Revenue by Segment)
1. Register "reservations" table
2. Create template: SUM(revenue), GROUP BY segment
3. Add filters: hotel_code, date range
4. Save → Auto-generates SQL with GROUP BY
5. Dashboard displays breakdown

### Workflow 3: Complex Custom Query
1. Register "reservations" table
2. Switch to Advanced Mode
3. Write custom SQL with JOINs, CTEs, etc.
4. Use placeholders: {{hotel_code}}, {{start_date}}, etc.
5. Save → Executes custom SQL

---

## Tips & Best Practices

### When to Use Visual Mode
- Simple aggregations (SUM, COUNT, AVG)
- Single table queries
- Standard filters and GROUP BY
- Quick metric creation

### When to Use Advanced Mode
- Multiple table JOINs
- Complex calculations (CASE statements, window functions)
- CTEs or subqueries
- Performance optimizations (partitioning, clustering)

### Column Type Guidelines
- **Aggregatable**: Numeric columns (INTEGER, FLOAT64, NUMERIC)
- **Groupable**: String, DATE, DATETIME, TIMESTAMP columns
- **Filterable**: All columns (can be used in WHERE clauses)

### Filter Placeholder Tips
- Use quotes for string placeholders: `'{{hotel_code}}'`
- Use direct placeholders for dates: `{{start_date}}`
- BETWEEN operator: `date BETWEEN '{{start_date}}' AND '{{end_date}}'`
- IN operator: `segment IN ('Leisure', 'Corporate')`

### Performance Optimization
- Always filter by `hotel_code` to isolate hotel data
- Add date range filters to limit scan size
- Use clustered/partitioned columns when available
- Consider materialized views for complex aggregations

---

## Migration from Old System

### Old System (Manual SQL)
```sql
-- Stored as raw SQL string
SELECT SUM(revenue) as value
FROM `my-project.analytics_dataset.reservations`
WHERE hotel_code = 'DTWDFH'
  AND date BETWEEN '2024-01-01' AND '2024-12-31'
```

### New System (Visual Builder)
1. Register "reservations" table
2. Visual builder:
   - Aggregation: SUM(revenue)
   - Filters: hotel_code = {{hotel_code}}, date BETWEEN {{start_date}} AND {{end_date}}
3. Auto-generates SQL with placeholders

### Benefits of Migration
- ✅ No hardcoded project/dataset/table names
- ✅ Reusable table definitions
- ✅ Visual editing for non-SQL users
- ✅ Type-safe column selection
- ✅ Easy to update when schema changes

---

## Troubleshooting

### "No tables found"
- Check BigQuery credentials
- Verify dataset ID is correct
- Ensure service account has BigQuery permissions

### "Schema discovery failed"
- Table may not exist in dataset
- Service account may lack permissions
- Check data location matches hotel configuration

### "Template save failed"
- Ensure table is registered first
- Check required fields (template_name, metric_name)
- Verify aggregation_type for visual mode
- Verify custom_sql for advanced mode

### "Query execution failed"
- Check placeholder values are being replaced
- Verify table path is correct
- Ensure column names match exactly
- Test query manually in BigQuery console

---

## Next Steps

1. ✅ Register your first table (e.g., "reservations")
2. ✅ Create a simple template (e.g., "Total Bookings")
3. ✅ Test on the dashboard
4. ✅ Add more complex templates as needed
5. ✅ Explore advanced mode for custom queries

Need help? Check the [QUICK_START_V2.md](./QUICK_START_V2.md) guide or ask for assistance.
