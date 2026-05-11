# Phase 4: Hybrid Query Builder - Testing Checklist

Use this checklist to verify all Phase 4 features are working correctly after deployment.

---

## Pre-Flight Checks

### 1. Database Initialization

- [ ] Deploy to Webflow Cloud (or run locally)
- [ ] Visit `/admin`
- [ ] If "Database not configured" appears, click "Initialize Database"
- [ ] Verify success message appears
- [ ] Confirm new tables exist:
  - `bigquery_tables`
  - `bigquery_table_columns`
  - `query_templates_v2`
  - `template_suggestions`

### 2. Hotel Configuration

- [ ] At least one hotel is configured with:
  - Valid BigQuery credentials
  - Project ID
  - Data location
  - (Optional) Dataset ID and Table ID

---

## Table Registry Tests

### 3. List Tables in Dataset

**Navigate to**: Admin Panel → Table Registry

- [ ] Select a configured hotel from dropdown
- [ ] Enter a dataset ID (e.g., `analytics_dataset`)
- [ ] Click "List Tables"
- [ ] Verify tables are displayed with:
  - Table name
  - Row count
  - Description (if available)

**Expected**: List of tables from BigQuery dataset

**If Failed**:
- Check BigQuery credentials are valid
- Verify dataset ID exists in the project
- Ensure service account has BigQuery Data Viewer role

---

### 4. Discover Table Schema

**Continue from step 3**:

- [ ] Select a table from the dropdown
- [ ] Click "Discover Schema"
- [ ] Verify schema details are displayed:
  - Table ID
  - Full table path
  - Column list with types
  - Column badges (Filterable, Groupable, Aggregatable)

**Expected**: Detailed schema information with columns classified by capability

**If Failed**:
- Check table exists in dataset
- Verify service account permissions
- Check data location matches hotel configuration

---

### 5. Register a Table

**Continue from step 4**:

- [ ] Review discovered schema
- [ ] Table Key is auto-filled (editable)
- [ ] Display Name is auto-filled (editable)
- [ ] Optionally add description
- [ ] Click "Register Table"
- [ ] Verify success message
- [ ] Table appears in "Registered Tables" section below

**Expected**: Table is registered and appears in the registry

**If Failed**:
- Check table_key is unique (not already registered)
- Verify database is initialized
- Check browser console for errors

---

### 6. View Registered Tables

**Scroll to**: "Registered Tables" section

- [ ] Registered table(s) appear
- [ ] Display name is shown
- [ ] Table key and column count displayed
- [ ] Full table path shown (if available)
- [ ] Click "View Columns" to expand
- [ ] Verify all columns are listed with types

**Expected**: All registered tables are visible with metadata

---

### 7. Delete a Table

**In "Registered Tables" section**:

- [ ] Click "Delete" on a test table
- [ ] Confirm deletion in dialog
- [ ] Verify table is removed from list
- [ ] (Note: Associated templates will also be deleted)

**Expected**: Table is removed from registry

---

## Query Builder Tests

### 8. Visual Mode - Simple Aggregation

**Navigate to**: Admin Panel → Query Builder

- [ ] Enter Template Name: `test_total_bookings`
- [ ] Enter Display Name: `Test Total Bookings`
- [ ] Select a registered table
- [ ] Aggregation Type: `COUNT`
- [ ] Column: `*` (or any column)
- [ ] Verify default filter: `hotel_code = {{hotel_code}}`
- [ ] Click "Add Filter"
- [ ] Add filter: `date BETWEEN {{start_date}} AND {{end_date}}`
- [ ] Verify SQL preview updates automatically
- [ ] Click "Save Template"
- [ ] Verify success message

**Expected SQL**:
```sql
SELECT COUNT(*) as value
FROM `{{project_id}}.{{dataset_id}}.table_name`
WHERE hotel_code = '{{hotel_code}}'
  AND date BETWEEN '{{start_date}}' AND '{{end_date}}'
```

**If Failed**:
- Check table is selected
- Verify required fields are filled
- Check browser console for errors

---

### 9. Visual Mode - Aggregation with GROUP BY

**Continue in Query Builder**:

- [ ] Enter Template Name: `test_revenue_by_segment`
- [ ] Enter Display Name: `Test Revenue by Segment`
- [ ] Select table with `revenue` and `segment` columns
- [ ] Aggregation Type: `SUM`
- [ ] Column: `revenue` (or numeric column)
- [ ] Click "Add dimension" under Group By
- [ ] Select: `segment` (or any groupable column)
- [ ] Verify SQL preview includes GROUP BY
- [ ] Add filters as needed
- [ ] Click "Save Template"
- [ ] Verify success message

**Expected SQL**:
```sql
SELECT segment, SUM(revenue) as value
FROM `{{project_id}}.{{dataset_id}}.table_name`
WHERE hotel_code = '{{hotel_code}}'
GROUP BY segment
```

**If Failed**:
- Check selected column is numeric (aggregatable)
- Verify GROUP BY column is string/date (groupable)
- Check SQL preview for errors

---

### 10. Visual Mode - Multiple Filters

**Continue in Query Builder**:

- [ ] Create a new template
- [ ] Select table
- [ ] Configure aggregation
- [ ] Add multiple filters:
  - `hotel_code = {{hotel_code}}`
  - `date >= {{start_date}}`
  - `date <= {{end_date}}`
  - `status = 'confirmed'` (or any column)
- [ ] Verify all filters appear in SQL preview
- [ ] Test different operators: `=`, `!=`, `>`, `<`, `BETWEEN`, `IN`, `LIKE`
- [ ] Click "Save Template"

**Expected**: All filters are included in WHERE clause with correct operators

---

### 11. Advanced Mode - Custom SQL

**Continue in Query Builder**:

- [ ] Enter Template Name: `test_custom_query`
- [ ] Enter Display Name: `Test Custom Query`
- [ ] Select a registered table
- [ ] Switch to "Advanced SQL" tab
- [ ] Enter custom SQL:
   ```sql
   SELECT COALESCE(SUM(revenue), 0) as value
   FROM `{{project_id}}.{{dataset_id}}.reservations`
   WHERE hotel_code = '{{hotel_code}}'
     AND date BETWEEN '{{start_date}}' AND '{{end_date}}'
     AND status != 'cancelled'
   ```
- [ ] Click "Save Template"
- [ ] Verify success message

**Expected**: Custom SQL template is saved

---

### 12. Placeholder Validation

**Test placeholder usage**:

- [ ] Create template with `{{hotel_code}}`
- [ ] Create template with `{{start_date}}` and `{{end_date}}`
- [ ] Create template with `{{project_id}}`, `{{dataset_id}}`, `{{table_id}}`
- [ ] Verify SQL preview shows placeholders correctly
- [ ] Save templates
- [ ] (Later) Verify placeholders are replaced on dashboard

**Expected**: All placeholders are supported and replaced correctly

---

## Integration Tests

### 13. Dashboard Display (V2 Templates)

**Navigate to**: Dashboard (`/dashboard`)

- [ ] Select hotel
- [ ] Select year/month (or date range)
- [ ] Verify metrics from v2 templates appear
- [ ] Check metric cards show:
  - Metric name
  - Value
  - Loading state
  - Error state (if query fails)
- [ ] Test "Clear Cache & Refresh" button
- [ ] Verify metrics update

**Expected**: V2 templates display on dashboard alongside old templates

**If Failed**:
- Check dashboard is fetching from correct API endpoint
- Verify templates are saved correctly
- Check browser console for errors
- Test query execution manually in BigQuery

---

### 14. Placeholder Replacement

**On Dashboard**:

- [ ] Select different hotels
- [ ] Verify `{{hotel_code}}` is replaced with selected hotel
- [ ] Change date range
- [ ] Verify `{{start_date}}` and `{{end_date}}` are replaced
- [ ] Check query results make sense for selected filters

**Expected**: Placeholders are replaced with actual values from user selections

**If Failed**:
- Check API endpoint handles placeholder replacement
- Verify parameter passing from frontend to backend
- Test query with hardcoded values in BigQuery console

---

### 15. Error Handling

**Test error scenarios**:

- [ ] Create template with invalid SQL (e.g., wrong table name)
- [ ] Try to register duplicate table_key
- [ ] Try to save template without required fields
- [ ] Disconnect BigQuery credentials and test schema discovery
- [ ] Test query execution with missing hotel_code

**Expected**: Appropriate error messages are displayed

**If Failed**:
- Add better error handling
- Improve error messages
- Add validation before operations

---

## Performance Tests

### 16. Schema Discovery Speed

- [ ] Time how long it takes to list tables
- [ ] Time how long it takes to discover schema

**Expected**: Under 3 seconds for most datasets

**If Slow**:
- Check BigQuery API response time
- Verify network connectivity
- Consider caching table lists

---

### 17. Query Execution Speed

**On Dashboard**:

- [ ] Time how long metrics take to load (first time)
- [ ] Time how long cached metrics take to load (second time)
- [ ] Test with 5+ metrics

**Expected**:
- First load: 5-10 seconds (depends on BigQuery)
- Cached load: <1 second

**If Slow**:
- Check BigQuery query complexity
- Verify cache is working
- Consider query optimization (indexes, partitioning)

---

## Clean Up

### 18. Delete Test Data

- [ ] Delete test templates from Query Builder
- [ ] Delete test tables from Table Registry
- [ ] (Optional) Keep examples for documentation

**Expected**: Test data is removed, system is clean

---

## Documentation Verification

### 19. Documentation Accuracy

- [ ] Read `HYBRID_QUERY_BUILDER_GUIDE.md`
- [ ] Verify all described features work as documented
- [ ] Note any discrepancies
- [ ] Update documentation if needed

**Expected**: Documentation matches actual behavior

---

## Final Checks

### 20. Production Readiness

- [ ] All tests passed
- [ ] No console errors
- [ ] No broken functionality
- [ ] Documentation is up-to-date
- [ ] Database is backed up (if needed)
- [ ] Ready for production use!

**Expected**: System is stable and ready for users

---

## Troubleshooting

### Common Issues

#### "No tables found"
- Check BigQuery credentials
- Verify dataset ID is correct
- Ensure service account has permissions

#### "Schema discovery failed"
- Table may not exist
- Service account lacks permissions
- Check data location matches hotel config

#### "Template save failed"
- Ensure table is registered first
- Check required fields are filled
- Verify template_name is unique

#### "Placeholders not replaced"
- Check API endpoint logic
- Verify placeholder format: `{{placeholder_name}}`
- Test with hardcoded values first

#### "Query execution failed"
- Check SQL syntax
- Verify table path is correct
- Ensure columns exist in table
- Test query manually in BigQuery console

---

## Success Criteria

### All Green ✅

- [ ] Schema discovery works
- [ ] Table registration works
- [ ] Visual query builder generates correct SQL
- [ ] Advanced SQL mode accepts custom queries
- [ ] Templates save successfully
- [ ] Dashboard displays v2 templates
- [ ] Placeholders are replaced correctly
- [ ] No console errors
- [ ] Performance is acceptable

### Ready for Phase 5! 🚀

---

**Testing Date**: _______________  
**Tester**: _______________  
**Environment**: [ ] Local  [ ] Webflow Cloud  
**Status**: [ ] All Passed  [ ] Issues Found (see notes)  

**Notes**:
_______________________________________________
_______________________________________________
_______________________________________________
