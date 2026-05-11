# Phase 3: Global Query Templates - Complete ✅

## What Changed

The dashboard has been refactored to use **Global Query Templates** instead of per-hotel templates. This provides a much better developer and admin experience.

## Key Changes

### 1. New Database Table
- Added `global_query_templates` table
- Stores universal query templates with placeholders
- Works for all hotels automatically

### 2. New API Endpoints
- `GET /api/admin/templates` - Fetch all global templates
- `POST /api/admin/templates` - Create new template
- `DELETE /api/admin/templates?id={id}` - Delete template

### 3. Updated Admin Panel
- **Global Query Templates** tab (now default tab)
- Create templates once, use everywhere
- Helpful placeholder documentation
- Template validation

### 4. Updated Metrics API
- `/api/client/metrics` now uses global templates
- Automatically injects hotel-specific parameters
- Executes all templates for selected hotel/period

### 5. Template Placeholders

Templates support these dynamic placeholders:
- `{{hotel_code}}` - Current hotel
- `{{project_id}}` - BigQuery project
- `{{dataset_id}}` - Dataset from hotel config
- `{{table_id}}` - Table from hotel config
- `{{start_date}}` - First day of selected month
- `{{end_date}}` - Last day of selected month
- `{{year}}` - Selected year
- `{{month}}` - Selected month (1-12)

## Migration Steps

If you need to initialize the new table:

1. Go to **Admin Panel**
2. Click **Initialize Database** (safe to run multiple times)
3. Create your first global template in the **Global Query Templates** tab

## Example Template

**Template Name**: `total_bookings`  
**Display Name**: `Total Bookings`  
**SQL Query**:
```sql
SELECT COUNT(*) as total
FROM `{{project_id}}.{{dataset_id}}.bookings`
WHERE hotel_code = '{{hotel_code}}'
  AND date BETWEEN '{{start_date}}' AND '{{end_date}}'
```

## Benefits

✅ Create templates once, use for all hotels  
✅ Easier to maintain and update  
✅ Consistent metrics across properties  
✅ Automatic parameter injection  
✅ No per-hotel configuration needed  

## Next Steps

1. **Initialize Database** - Run init endpoint to add new table
2. **Create Templates** - Add your first global templates
3. **Test Dashboard** - Select a hotel and see metrics populate
4. **Add More Templates** - Build out your metrics library

## Files Changed

- `migrations/0003_global_templates.sql` - New migration
- `src/pages/api/admin/templates.ts` - New endpoint
- `src/pages/api/admin/init-database.ts` - Updated to create global table
- `src/pages/api/client/metrics.ts` - Rewritten to use global templates
- `src/components/AdminPanel.tsx` - Complete refactor for global templates
- `src/components/ClientDashboard.tsx` - Added navigation back to admin

## Documentation

See **GLOBAL_TEMPLATES_GUIDE.md** for:
- Complete placeholder reference
- Template best practices
- Example queries
- Troubleshooting guide
- API documentation

## Navigation Improvements

- Dashboard now has "⚙️ Admin Panel" button in top right
- Admin Panel now has "📊 View Dashboard" button in top right
- Easy navigation between admin and client views

---

**Status**: ✅ Complete and ready to use!
