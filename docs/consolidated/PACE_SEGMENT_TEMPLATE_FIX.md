# Fix for Pace Segment Data Template

## Problem
Your current query has multiple columns aliased as `value`, which causes only one column to be returned.

## Corrected SQL Query

```sql
SELECT 
  segment_code,
  SUM(rooms_otb) as rooms_otb,
  SUM(rooms_stly) as rooms_stly,
  SUM(rooms_st2y) as rooms_st2y,
  SUM(rooms_ly_actual) as rooms_ly_actual,
  SUM(rev_otb) as rev_otb,
  SUM(rev_stly) as rev_stly,
  SUM(rev_st2y) as rev_st2y,
  SUM(rev_ly_actual) as rev_ly_actual,
  SUM(rooms_forecast) as rooms_forecast,
  SUM(rev_forecast) as rev_forecast,
  SUM(rms_rooms_forecast) as rms_rooms_forecast,
  SUM(rms_rev_forecast) as rms_rev_forecast,
  SUM(rooms_budget) as rooms_budget,
  SUM(rev_budget) as rev_budget,
  SUM(cancelled_rooms) as cancelled_rooms,
  SUM(cancelled_rooms_ly_actual) as cancelled_rooms_ly_actual,
  SUM(noshow_rooms) as noshow_rooms,
  SUM(noshow_rooms_ly_actual) as noshow_rooms_ly_actual
FROM `{project_id}.{dataset_id}.vw_pace_segment_current`
WHERE property_code = @hotel_code
  AND stay_date BETWEEN @start_date AND @end_date
GROUP BY segment_code
ORDER BY segment_code
```

## Output Columns (comma-separated)

```
segment_code, rooms_otb, rooms_stly, rooms_st2y, rooms_ly_actual, rev_otb, rev_stly, rev_st2y, rev_ly_actual, rooms_forecast, rev_forecast, rms_rooms_forecast, rms_rev_forecast, rooms_budget, rev_budget, cancelled_rooms, cancelled_rooms_ly_actual, noshow_rooms, noshow_rooms_ly_actual
```

## Steps to Fix

1. Go to **Admin Panel** → **Metrics Manager** → **Data Templates** tab
2. Find your pace segment template and click **Edit**
3. Replace the query with the corrected SQL above
4. Update the **Output Columns** field with the comma-separated list above
5. Click **Save Template**

## Example Metrics You Can Create

Once the template is fixed, you can create metrics like:

### ADR (Average Daily Rate)
- **Formula**: `rev_otb / rooms_otb`
- **Format**: Currency
- **Prefix**: $
- **Decimals**: 2

### Occupancy Rate
- **Formula**: `rooms_otb / ROOM_COUNT * 100`
- **Format**: Percentage
- **Suffix**: %
- **Decimals**: 1

### Revenue Variance vs Budget
- **Formula**: `(rev_otb - rev_budget) / rev_budget * 100`
- **Format**: Percentage
- **Suffix**: %
- **Decimals**: 1

### Rooms Sold vs Last Year
- **Formula**: `rooms_otb - rooms_ly_actual`
- **Format**: Number
- **Decimals**: 0

### Revenue vs Forecast
- **Formula**: `rev_otb - rev_forecast`
- **Format**: Currency
- **Prefix**: $
- **Decimals**: 0

### Cancellation Rate
- **Formula**: `cancelled_rooms / (rooms_otb + cancelled_rooms) * 100`
- **Format**: Percentage
- **Suffix**: %
- **Decimals**: 1

## Notes

- The query uses `{project_id}` and `{dataset_id}` placeholders that will be replaced with your hotel's configuration
- Parameters like `@hotel_code`, `@start_date`, and `@end_date` are handled by the BigQuery parameterized query system
- All column names should match exactly what BigQuery returns
- You can use `ROOM_COUNT` in any formula to reference the hotel's total room count
