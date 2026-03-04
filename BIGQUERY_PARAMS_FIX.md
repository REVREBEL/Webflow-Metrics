# BigQuery Parameter Name Fix

## The Problem
BigQuery has different conventions for parameters in SQL vs. the SDK:

### In SQL Queries
You **MUST** use `@` prefix:
```sql
SELECT * 
FROM table
WHERE property_name = @selected_hotel_value
  AND date = @start_date
```

### In SDK Parameters
You **MUST NOT** use `@` prefix:
```javascript
// ❌ Wrong
params: { '@selected_hotel_value': 'Foundation Hotel' }

// ✅ Correct
params: { 'selected_hotel_value': 'Foundation Hotel' }
```

## The Solution
We've implemented automatic `@` stripping in two places so users can enter variable names either way:

### 1. Frontend (BigQueryConfig.tsx)
When users enter variable names, we automatically strip the leading `@`:
```typescript
const cleanedValue = field === 'name' && value.startsWith('@') 
  ? value.substring(1) 
  : value;
```

**UI Updates:**
- Added clear tooltip explaining the difference between SQL syntax and variable names
- Placeholder text now says "e.g., start_date (no @)"
- Inline help text clarifies: "In your SQL: Use @variable_name | Below: Define names without @"

### 2. Backend (execute-query.ts)
As a safety measure, we also strip `@` before sending to BigQuery:
```typescript
const cleanName = variable.name.startsWith('@') 
  ? variable.name.substring(1) 
  : variable.name;
```

## How to Use

### Writing Your Query
Keep the `@` symbol in your SQL:
```sql
SELECT 
  SUM(revenue) as total_revenue
FROM `project.dataset.table`
WHERE 
  hotel_name = @selected_hotel_value
  AND year = @selected_year
```

### Defining Variables
Enter variable names **without** the `@` symbol:
- Variable Name: `selected_hotel_value` ✅
- Variable Name: `selected_year` ✅
- Variable Name: `selected_month` ✅

Or with `@` (will be cleaned automatically):
- Variable Name: `@selected_hotel_value` ✅ (becomes `selected_hotel_value`)
- Variable Name: `@selected_year` ✅ (becomes `selected_year`)

## Quick Reference

| Location | Syntax | Example |
|----------|--------|---------|
| **SQL Query** | WITH `@` | `WHERE name = @hotel_name` |
| **Variable Name Field** | WITHOUT `@` (preferred) | `hotel_name` |
| **Variable Name Field** | WITH `@` (also works) | `@hotel_name` → cleaned to `hotel_name` |

## Testing
To verify the fix works:
1. In your SQL query, use `@variable_name`
2. In the Variable Name field, enter `variable_name` (no @)
3. Save and run the query
4. Check terminal logs for "Parameters object:" - should show names without `@`
5. Query should execute successfully

## Error Messages
If you see "Query parameter 'X' not found":
1. Check that your variable name in SQL matches the variable definition (ignoring the @)
2. Clear localStorage and re-enter configuration: `localStorage.clear()`
3. Make sure all variables have values before executing queries
