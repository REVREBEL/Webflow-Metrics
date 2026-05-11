# Client Dashboard Setup Guide - Phase 2

## 🎯 Overview

The client dashboard is the public-facing interface where users can view real-time BigQuery metrics with hotel and time period filters.

---

## ✅ What's Been Built (Phase 2)

### Frontend Components

**ClientDashboard Component** (`src/components/ClientDashboard.tsx`)
- Hotel selector dropdown (multi-hotel support)
- Year/month filter for time periods
- Dynamic metric card grid
- Loading states with spinners
- Error handling and display
- Manual refresh button
- Cache status indicators (green = cached, blue = fresh)
- Responsive design (mobile-friendly)

### API Endpoints

**Query Template Management**
- `GET /api/admin/hotels/[hotel_code]/templates` - Fetch templates
- `POST /api/admin/hotels/[hotel_code]/templates` - Create/update template
- `DELETE /api/admin/hotels/[hotel_code]/templates` - Delete template

### Features

✅ **Hotel Selection**
- Dropdown shows all configured hotels
- Auto-selects first hotel on load
- Persists selection across filter changes

✅ **Date Filtering**
- Year selector (current year + 2 years back)
- Month selector (all 12 months)
- Auto-calculates date ranges (start/end of month)

✅ **Query Execution**
- Parallel query execution (fast)
- Automatic variable substitution
- Smart variable detection and mapping
- Real-time result display

✅ **Metric Display**
- Grid layout (responsive: 1/2/3 columns)
- Currency formatting (for revenue metrics)
- Percentage formatting (for rate metrics)
- Number formatting (with commas)
- Loading skeletons
- Error messages

✅ **Cache Integration**
- Displays cache status (green dot = cached)
- Manual refresh button
- 24-hour cache with 7am PST reset

---

## 🎨 UI Components

### Filter Card

```
┌─────────────────────────────────────────┐
│ Filters                                 │
│ Select hotel and time period            │
├─────────────────────────────────────────┤
│  Hotel            Year        Month     │
│  [Grand Plaza ▼] [2026 ▼]  [Feb ▼]    │
└─────────────────────────────────────────┘
```

### Metric Card

```
┌─────────────────────────────┐
│ Total Bookings           ─  │  ← Trend icon (future)
├─────────────────────────────┤
│ 1,234                       │  ← Formatted value
│ 🟢 Cached data              │  ← Cache status
└─────────────────────────────┘
```

### Loading State

```
┌─────────────────────────────┐
│ Total Bookings           ─  │
├─────────────────────────────┤
│ ⟳ Loading...                │  ← Spinner
└─────────────────────────────┘
```

### Error State

```
┌─────────────────────────────┐
│ Total Bookings           ─  │
├─────────────────────────────┤
│ Error                       │
│ Query execution failed      │
└─────────────────────────────┘
```

---

## 🔧 Variable Auto-Mapping

The dashboard automatically maps filter selections to query variables:

### Date Variables

| Filter Selection | Generated Variables |
|-----------------|---------------------|
| Year: 2026, Month: February | `start_date` = "2026-02-01" |
|                              | `end_date` = "2026-02-28" |
|                              | `year` = 2026 |
|                              | `month` = 2 |

### Hotel Variables

| Variable Name | Mapped Value |
|--------------|--------------|
| `hotel_id` | Selected hotel_code |
| `hotel_code` | Selected hotel_code |

### Example Query Template

**Template SQL**:
```sql
SELECT COUNT(*) as value
FROM `{project_id}.{dataset_id}.bookings`
WHERE booking_date >= @start_date
  AND booking_date <= @end_date
  AND hotel_id = @hotel_id
```

**Executed Query** (Feb 2026, GRAND_PLAZA):
```sql
SELECT COUNT(*) as value
FROM `hotel-analytics-prod.production_metrics.bookings`
WHERE booking_date >= '2026-02-01'
  AND booking_date <= '2026-02-28'
  AND hotel_id = 'GRAND_PLAZA'
```

---

## 📊 Metric Value Formatting

### Currency Formatting

Template names containing:
- `revenue`
- `amount`
- `price`

Are formatted as: `$1,234.56`

**Example**: "Monthly Revenue" → `$45,678.90`

### Percentage Formatting

Template names containing:
- `rate`
- `percent`

Are formatted as: `85.5%`

**Example**: "Occupancy Rate" → `92.3%`

### Number Formatting

All other numeric values are formatted with commas:

**Example**: "Total Bookings" → `1,234`

---

## 🚀 Usage Flow

### 1. Initial Load

```
User visits dashboard (/)
         ↓
Fetch all hotels
         ↓
Auto-select first hotel
         ↓
Fetch query templates for hotel
         ↓
Execute queries with current month
         ↓
Display results in metric cards
```

### 2. Changing Filters

```
User changes hotel/year/month
         ↓
Fetch query templates (if hotel changed)
         ↓
Re-execute all queries with new filters
         ↓
Update metric cards with new results
```

### 3. Manual Refresh

```
User clicks "Refresh Data" button
         ↓
Re-execute all queries (bypass cache check)
         ↓
Update metric cards with fresh results
```

---

## 🎯 Query Template Requirements

For the dashboard to work correctly, query templates must:

### 1. Return a `value` Column

```sql
SELECT COUNT(*) as value  -- ✅ GOOD
FROM bookings;

SELECT COUNT(*)           -- ❌ BAD (no alias)
FROM bookings;
```

### 2. Use Standard Variable Names

**Recommended Variables**:
- `@start_date` (DATE) - Start of period
- `@end_date` (DATE) - End of period
- `@year` (INT64) - Year filter
- `@month` (INT64) - Month filter (1-12)
- `@hotel_id` (STRING) - Hotel identifier
- `@hotel_code` (STRING) - Hotel code

### 3. Use Template Placeholders

```sql
-- ✅ GOOD - Dynamic substitution
SELECT * FROM `{project_id}.{dataset_id}.{table_name}`

-- ❌ BAD - Hardcoded (not reusable)
SELECT * FROM `my-project-123.production.bookings`
```

---

## 🐛 Troubleshooting

### No Hotels Display

**Symptoms**: Empty state showing "No Hotels Configured"

**Solutions**:
1. Go to `/admin` and add at least one hotel
2. Verify hotel has BigQuery credentials configured
3. Test connection in admin panel

### No Metrics Display

**Symptoms**: Empty state showing "No Query Templates"

**Solutions**:
1. Go to `/admin`
2. Edit the selected hotel
3. Add query templates with `@` variables
4. Save configuration

### Metric Shows "Error"

**Symptoms**: Red "Error" text in metric card

**Common Causes**:

1. **Invalid SQL Query**
   - Test query in BigQuery console first
   - Verify syntax is correct
   - Check table names exist

2. **Missing Variables**
   - Ensure query uses standard variable names
   - Check variables are properly detected
   - Verify variable types match query needs

3. **Data Location Mismatch**
   - Check hotel's data_location matches dataset
   - Update data_location in admin panel if needed

4. **Permission Issues**
   - Verify service account has BigQuery Data Viewer role
   - Check BigQuery API is enabled
   - Verify service account JSON is valid

### Metric Shows "N/A"

**Symptoms**: Metric card displays "N/A" instead of value

**Causes**:
- Query returned NULL
- Query returned empty result set
- Column is not named "value"

**Solutions**:
1. Add fallback in query:
   ```sql
   SELECT COALESCE(COUNT(*), 0) as value
   ```

2. Ensure column is aliased as "value":
   ```sql
   SELECT SUM(amount) as value  -- ✅
   ```

### Slow Loading

**Symptoms**: Metrics take >5 seconds to load

**Solutions**:
1. **Optimize Queries**
   - Add WHERE clause date filters
   - Use partitioned tables
   - Add indexes
   - Use LIMIT for testing

2. **Leverage Caching**
   - Subsequent loads use cache (fast)
   - Cache resets at 7am PST daily
   - Manual refresh bypasses cache

3. **Reduce Query Count**
   - Combine related metrics into one query
   - Use subqueries or CTEs
   - Return multiple values in one result

---

## 📈 Performance Optimization

### Query Optimization Tips

✅ **DO**:
```sql
-- Use date partitioning
SELECT COUNT(*) as value
FROM `project.dataset.bookings_partitioned`
WHERE _PARTITIONDATE >= @start_date
  AND _PARTITIONDATE <= @end_date

-- Use APPROX functions for large datasets
SELECT APPROX_COUNT_DISTINCT(user_id) as value
FROM bookings

-- Limit columns
SELECT SUM(amount) as value
FROM bookings
```

❌ **DON'T**:
```sql
-- Scan entire table without filters
SELECT COUNT(*) as value
FROM bookings  -- No WHERE clause!

-- Use SELECT *
SELECT *
FROM bookings
WHERE date >= @start_date

-- Complex JOINs without need
SELECT COUNT(*) as value
FROM bookings b
JOIN users u ON b.user_id = u.id
JOIN hotels h ON b.hotel_id = h.id
-- When only COUNT is needed!
```

### Caching Strategy

**Current Behavior**:
- First query: 2-3 seconds (BigQuery)
- Cached queries: <100ms (in-memory)
- Cache duration: 24 hours
- Cache reset: 7:00 AM PST

**Future Enhancements** (Phase 3):
- Move cache to KV namespace (persistent)
- Per-query cache TTL
- Cache warming (pre-fetch common queries)
- Cache invalidation API

---

## 🎨 Customization

### Adding Custom Formatters

Edit `src/components/ClientDashboard.tsx`:

```typescript
const formatValue = (value: number | string | null, template_name: string): string => {
  if (value === null || value === undefined) return 'N/A';
  
  // Add custom formatter
  if (template_name.toLowerCase().includes('rating')) {
    return `⭐ ${Number(value).toFixed(1)}/5.0`;
  }
  
  // ... existing formatters
};
```

### Changing Date Range

Currently shows: Current year + 2 years back

To show more years:

```typescript
// From
const years = Array.from({ length: 3 }, (_, i) => new Date().getFullYear() - i);

// To (5 years back)
const years = Array.from({ length: 6 }, (_, i) => new Date().getFullYear() - i);
```

### Customizing Grid Layout

Current: 1/2/3 column responsive grid

```typescript
// From
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

// To (4 columns on large screens)
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
```

---

## 🚀 Next Steps

### Phase 3: Authentication & Permissions

**Planned Features**:
- User registration/login
- Role-based access control
- Hotel-level permissions
- Audit logging
- Session management

### Phase 4: Advanced Features

**Future Enhancements**:
- Chart visualization (line/bar/pie)
- Export to CSV/Excel
- Scheduled email reports
- Custom dashboard builder
- Trend analysis
- Comparative metrics (vs. last month/year)
- Real-time updates (WebSockets)

---

## ✅ Phase 2 Checklist

- [x] Hotel selector dropdown
- [x] Year/month filters
- [x] Dynamic metric cards
- [x] Query execution with variables
- [x] Loading states
- [x] Error handling
- [x] Cache status indicators
- [x] Manual refresh button
- [x] Responsive design
- [x] Currency/percentage formatting
- [x] API endpoint for templates
- [x] Parallel query execution

---

## 📚 Related Documentation

- `SETUP_INSTRUCTIONS.md` - Initial setup guide
- `ADMIN_QUICK_START.md` - Admin panel usage
- `QUICK_REFERENCE.md` - API reference
- `PROJECT_SUMMARY.md` - Architecture overview
- `PHASE_1_COMPLETE.md` - Phase 1 completion guide

---

**Phase 2 Status**: ✅ **COMPLETE**
**Last Updated**: February 18, 2026
