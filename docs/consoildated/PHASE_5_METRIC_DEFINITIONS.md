# Phase 5: Metric Definition System

## Overview

The new metric definition system separates data fetching from metric calculations, making it easier to manage and create new metrics without writing code.

## Architecture

### Two-Part System

1. **Data Templates** - Define what raw data to fetch from BigQuery
   - Contains the SQL query
   - Declares which columns are returned
   - One query can power multiple metrics
   - Results are cached for reuse

2. **Metric Definitions** - Define how to calculate metrics from cached data
   - Contains the formula (e.g., `revenue / rooms_sold`)
   - Specifies formatting (currency, percentage, number)
   - Can have prefix/suffix, decimals, category
   - Multiple metrics can use the same data template

## Database Schema

### `data_templates` Table
```sql
CREATE TABLE data_templates (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  template_name TEXT NOT NULL UNIQUE,
  description TEXT,
  query_template TEXT NOT NULL,
  output_columns TEXT NOT NULL, -- JSON array of column names
  created_at TEXT,
  updated_at TEXT
);
```

### `metric_definitions` Table
```sql
CREATE TABLE metric_definitions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  metric_name TEXT NOT NULL,
  data_template_id INTEGER NOT NULL,
  formula TEXT NOT NULL,
  format_type TEXT DEFAULT 'number', -- number, currency, percentage
  decimal_places INTEGER DEFAULT 2,
  prefix TEXT, -- e.g., "$"
  suffix TEXT, -- e.g., "%"
  display_order INTEGER DEFAULT 0,
  category TEXT, -- e.g., "Revenue", "Occupancy"
  description TEXT,
  created_at TEXT,
  updated_at TEXT,
  FOREIGN KEY (data_template_id) REFERENCES data_templates(id)
);
```

## API Endpoints

### Data Templates
- `GET /api/admin/data-templates` - List all templates
- `POST /api/admin/data-templates` - Create new template
- `PUT /api/admin/data-templates` - Update template
- `DELETE /api/admin/data-templates?id={id}` - Delete template

### Metric Definitions
- `GET /api/admin/metric-definitions` - List all metrics
- `GET /api/admin/metric-definitions?template_id={id}` - Filter by template
- `POST /api/admin/metric-definitions` - Create new metric
- `PUT /api/admin/metric-definitions` - Update metric
- `DELETE /api/admin/metric-definitions?id={id}` - Delete metric

### Migration
- `POST /api/admin/migrate-metrics` - Run the migration to create tables

## UI Components

### MetricsManager Component
Located at `src/components/MetricsManager.tsx`

**Three Tabs:**

1. **Overview** - Dashboard showing all templates and metrics
   - Quick stats
   - Metrics grouped by template
   - Visual catalog

2. **Data Templates** - Manage BigQuery queries
   - Create/edit/delete templates
   - Define output columns
   - View SQL queries

3. **Metrics** - Manage metric definitions
   - Create/edit/delete metrics
   - Define formulas using column names
   - Set formatting options

## Example Usage

### Create a Data Template

**Template Name:** Hotel Performance  
**Description:** Daily revenue and occupancy data  
**Output Columns:** `date, revenue, rooms_sold, rooms_available`  
**Query:**
```sql
SELECT 
  DATE(date) as date,
  SUM(revenue) as revenue,
  SUM(rooms_sold) as rooms_sold,
  SUM(rooms_available) as rooms_available
FROM `project.dataset.table`
WHERE hotel_code = @hotel_code
  AND EXTRACT(YEAR FROM date) = @year
  AND EXTRACT(MONTH FROM date) = @month
GROUP BY date
ORDER BY date
```

### Create Metrics from This Template

**Metric 1: ADR (Average Daily Rate)**
- Formula: `revenue / rooms_sold`
- Format: Currency
- Prefix: $
- Decimals: 2

**Metric 2: Occupancy**
- Formula: `(rooms_sold / rooms_available) * 100`
- Format: Percentage
- Suffix: %
- Decimals: 1

**Metric 3: RevPAR (Revenue Per Available Room)**
- Formula: `revenue / rooms_available`
- Format: Currency
- Prefix: $
- Decimals: 2

## Benefits

✅ **One Query, Multiple Metrics** - Fetch data once, calculate many metrics  
✅ **No Code Required** - Create new metrics through the UI  
✅ **Easy Testing** - Change formulas without re-querying BigQuery  
✅ **Better Caching** - Cache raw data, not calculated metrics  
✅ **Flexible Formatting** - Customize display per metric  
✅ **Organization** - Group metrics by category  
✅ **Reusability** - Same formula pattern for different data sources  

## Migration from Old System

The old system used one template per metric in the `global_templates` table. The new system:

1. Creates `data_templates` table for queries
2. Creates `metric_definitions` table for calculations
3. Keeps `query_cache` compatible with both systems (adds `data_template_id` column)
4. Allows gradual migration - both systems can coexist

## Next Steps

1. ✅ Run migration: `/api/admin/migrate-metrics`
2. ✅ Access Metrics Manager in Admin Panel
3. Create your first data template
4. Add metric definitions using the template
5. Update client dashboard to display metrics

## Client Dashboard Integration

The client dashboard will:
1. Fetch all metric definitions for display
2. Group metrics by category
3. Load cached data from data templates
4. Calculate metrics on-the-fly using formulas
5. Format values according to metric settings
6. Display in cards/charts

## Future Enhancements

- **Formula Validation** - Check formulas before saving
- **Formula Builder** - Visual formula editor
- **Aggregations** - SUM, AVG, MIN, MAX over date ranges
- **Comparisons** - Year-over-year, month-over-month
- **Thresholds** - Define good/bad ranges with color coding
- **Export** - Download metric definitions as JSON
- **Import** - Bulk import metric templates
