# Group By Date Granularity Update

## Overview
Added support for date grouping granularity in the visual query builder, allowing users to aggregate daily data by Week, Month, Quarter, or Year using BigQuery's `DATE_TRUNC` function.

## Changes Made

### 1. Database Schema
Added `group_by_function` column to `query_templates_v2` table:
- **Column**: `group_by_function TEXT`
- **Purpose**: Store the date granularity (day, week, month, quarter, year)
- **Migration**: `migrations/0005_add_group_by_function.sql`

### 2. API Updates (`src/pages/api/admin/templates/v2.ts`)
- Added `group_by_function` field to POST and PUT request body types
- Updated INSERT statement to include `group_by_function`
- Updated UPDATE statement to include `group_by_function`

### 3. Frontend Updates (`src/components/QueryBuilder.tsx`)

#### State Management
- `group_by_function` state already existed, now properly saved/loaded
- Added to payload when saving templates
- Added to handleEdit to restore when editing templates
- Added to SavedTemplate interface

#### SQL Generation
The visual query builder now generates proper SQL with `DATE_TRUNC`:

**Before** (incorrect for daily data):
```sql
SELECT stay_date, SUM(rev_otb) AS value
FROM `project.dataset.table`
WHERE property_name = @selected_hotel_value
  AND EXTRACT(YEAR FROM stay_date) = @selected_year
GROUP BY stay_date
ORDER BY stay_date
```

**After** (correct with DATE_TRUNC):
```sql
SELECT DATE_TRUNC(stay_date, MONTH) as stay_date_month, SUM(rev_otb) AS value
FROM `project.dataset.table`
WHERE property_name = @selected_hotel_value
  AND EXTRACT(YEAR FROM stay_date) = @selected_year
GROUP BY DATE_TRUNC(stay_date, MONTH)
ORDER BY DATE_TRUNC(stay_date, MONTH)
```

#### UI
The UI already had the date granularity selector that appears when a date column is selected for grouping:
- None (use exact date)
- Group by Day
- Group by Week
- Group by Month
- Group by Quarter
- Group by Year

## How It Works

1. **Column Detection**: When you select a column for "Group By", the system checks if it contains "date" in the name
2. **Granularity Selector**: If a date column is detected, a dropdown appears to select the grouping granularity
3. **SQL Generation**: 
   - In SELECT: `DATE_TRUNC(stay_date, MONTH) as stay_date_month`
   - In GROUP BY: `DATE_TRUNC(stay_date, MONTH)`
   - In ORDER BY: `DATE_TRUNC(stay_date, MONTH)`
4. **Persistence**: The selected granularity is saved to the database with the template

## Example Use Cases

### Monthly Revenue
```sql
SELECT DATE_TRUNC(stay_date, MONTH) as stay_date_month, SUM(revenue) AS value
FROM `project.dataset.bookings`
WHERE hotel_code = @hotel_code
GROUP BY DATE_TRUNC(stay_date, MONTH)
ORDER BY DATE_TRUNC(stay_date, MONTH)
```

### Quarterly Occupancy
```sql
SELECT DATE_TRUNC(check_in_date, QUARTER) as check_in_date_quarter, AVG(occupancy_rate) AS value
FROM `project.dataset.occupancy`
WHERE property_id = @property_id
GROUP BY DATE_TRUNC(check_in_date, QUARTER)
ORDER BY DATE_TRUNC(check_in_date, QUARTER)
```

### Yearly Guest Count
```sql
SELECT DATE_TRUNC(arrival_date, YEAR) as arrival_date_year, COUNT(*) AS value
FROM `project.dataset.guests`
WHERE hotel_code = @hotel_code
GROUP BY DATE_TRUNC(arrival_date, YEAR)
ORDER BY DATE_TRUNC(arrival_date, YEAR)
```

## Migration Instructions

### For Existing Databases
Run the migration to add the column:
```sql
ALTER TABLE query_templates_v2 ADD COLUMN group_by_function TEXT;
```

Or reinitialize the database through the Admin Panel:
1. Go to Admin Panel
2. Click "Initialize Database"
3. All tables will be recreated with the new schema

### For New Databases
The `init-database` endpoint already includes the new column in the schema, so no migration is needed.

## Notes

- The feature only applies to columns with "date" in the name
- The default value is "none" which uses the exact date value
- This works seamlessly with existing templates (they'll have NULL/none for group_by_function)
- The UI automatically shows/hides the granularity selector based on column selection
