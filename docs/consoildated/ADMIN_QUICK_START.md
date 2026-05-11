# Admin Panel Quick Start Guide

## 🎯 Purpose

The Admin Panel allows you to manage hotel configurations, BigQuery credentials, and query templates for your dashboard.

---

## 🚀 Quick Access

**URL**: `http://localhost:3000/admin` (local) or `https://your-site.webflow.io/your-app/admin` (production)

---

## 📋 Features

### 1. Hotel Management
- ➕ Add new hotels
- ✏️ Edit existing configurations
- 🗑️ Delete hotels
- 📊 View all configured hotels

### 2. BigQuery Configuration
- 🔐 Secure credential storage
- 🌍 Data location settings
- 📍 Project/dataset configuration
- ✅ Connection testing

### 3. Query Templates
- 📝 SQL query builder
- 🔢 Variable detection (auto-detects `@variable_name`)
- 📊 Reusable metric templates
- 🎯 Type-safe parameters

---

## 🏨 Adding a Hotel

### Step 1: Click "Add New Hotel"

### Step 2: Fill Basic Information

**Hotel Code** (required)
- Unique identifier for the hotel
- Example: `HOTEL001`, `GRAND_PLAZA`, `NYC_MARRIOTT`
- Used in APIs and database references
- Cannot be changed after creation

**Hotel Name** (required)
- Display name for the hotel
- Example: `Grand Plaza Hotel`, `NYC Marriott Downtown`
- Shown in dropdowns and UI

### Step 3: Configure BigQuery

**Project ID** (required)
- Your Google Cloud Project ID
- Example: `my-analytics-project-123456`
- Find in GCP Console: Home → Project Info

**Dataset ID** (optional)
- BigQuery dataset containing your tables
- Example: `hotel_analytics`, `production_data`
- Leave empty to specify in query templates

**Table Name** (optional)
- Main table for queries
- Example: `daily_metrics`, `booking_data`
- Leave empty to specify in query templates

**Data Location** (required)
- Geographic location of your BigQuery dataset
- Options: `US`, `EU`, or specific region (e.g., `asia-northeast1`)
- Must match your dataset's location (check in BigQuery console)
- ⚠️ **Mismatch causes query failures!**

### Step 4: Add Service Account JSON

**Getting Your Service Account JSON:**

1. Go to [GCP Console](https://console.cloud.google.com/)
2. Navigate to: **IAM & Admin → Service Accounts**
3. Click **Create Service Account** or select existing
4. Grant role: **BigQuery Data Viewer** (minimum)
5. Create key → JSON format
6. Download and paste the entire contents

**Example Format:**
```json
{
  "type": "service_account",
  "project_id": "your-project-id",
  "private_key_id": "abc123...",
  "private_key": "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n",
  "client_email": "service-account@project.iam.gserviceaccount.com",
  "client_id": "123456789",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs/service-account..."
}
```

**Security Note**: 
- ✅ Stored encrypted in D1
- ✅ Server-side only
- ✅ Never exposed to client
- ✅ HTTPS in transit

### Step 5: Add Query Templates

Click **"Add Query Template"** for each metric you want to track.

**Template Name** (required)
- Descriptive name for the metric
- Example: `Total Bookings`, `Revenue This Month`, `Occupancy Rate`

**SQL Query** (required)
- BigQuery-compatible SQL
- Use `@variable_name` for parameters
- Use `{project_id}`, `{dataset_id}`, `{table_name}` for dynamic substitution

**Example Queries:**

**Total Bookings (with date range)**
```sql
SELECT 
  COUNT(*) as value
FROM `{project_id}.{dataset_id}.{table_name}`
WHERE booking_date >= @start_date
  AND booking_date <= @end_date
  AND hotel_id = @hotel_id
```

**Revenue This Year**
```sql
SELECT 
  SUM(total_amount) as value
FROM `{project_id}.{dataset_id}.bookings`
WHERE EXTRACT(YEAR FROM booking_date) = @year
  AND hotel_id = @hotel_id
```

**Average Occupancy Rate**
```sql
SELECT 
  AVG(occupancy_percentage) as value
FROM `{project_id}.{dataset_id}.daily_stats`
WHERE date >= @start_date
  AND date <= @end_date
  AND hotel_id = @hotel_id
```

**Variables (auto-detected)**
- System automatically detects `@variable_name` in SQL
- Assigns default type: `STRING`
- Override types as needed:
  - `STRING`: Text values
  - `INT64`: Whole numbers
  - `FLOAT64`: Decimal numbers
  - `DATE`: Date values (YYYY-MM-DD)
  - `TIMESTAMP`: Date + time
  - `BOOL`: True/false

### Step 6: Test Connection

Click **"Test Connection"** to verify:
- ✅ Service account JSON is valid
- ✅ BigQuery API is accessible
- ✅ Credentials have proper permissions
- ✅ Data location matches dataset

**Success**: Green checkmark + "Connection successful"
**Failure**: Error message with details

### Step 7: Save

Click **"Save Hotel Configuration"**

---

## ✏️ Editing a Hotel

1. Find the hotel in the list
2. Click **"Edit"** button
3. Modify any fields
4. Click **"Update Hotel Configuration"**

**Note**: `hotel_code` cannot be changed (primary key)

---

## 🗑️ Deleting a Hotel

1. Find the hotel in the list
2. Click **"Delete"** button
3. Confirm deletion

⚠️ **Warning**: This permanently deletes:
- Hotel configuration
- BigQuery credentials
- All query templates
- Associated dashboard configs

---

## 🔍 Common Issues & Solutions

### Connection Test Fails

**Symptom**: Red error message when testing connection

**Causes & Solutions**:

1. **Invalid Service Account JSON**
   - Verify JSON is properly formatted
   - Check for copy/paste errors
   - Ensure entire JSON is included

2. **BigQuery API Not Enabled**
   - Go to GCP Console
   - Navigate to: APIs & Services → Library
   - Search for "BigQuery API"
   - Click "Enable"

3. **Insufficient Permissions**
   - Service account needs: `BigQuery Data Viewer` role
   - Go to: IAM & Admin → IAM
   - Find service account email
   - Add role if missing

4. **Data Location Mismatch**
   - Check dataset location in BigQuery console
   - Update "Data Location" field to match
   - Common: US dataset + EU location = failure

5. **Project ID Wrong**
   - Verify project ID matches GCP console
   - Format: `my-project-123456`
   - Not the project name or number

### Query Variables Not Detected

**Symptom**: Variables list is empty after adding query

**Solution**:
- Ensure variables use `@` prefix: `@start_date`
- Not `:start_date` or `$start_date`
- Variables must be in SQL query text
- Reload page if detection fails

### Admin Panel Shows Empty

**Symptom**: No hotels display even after adding

**Causes**:
1. **Database Not Initialized**
   ```bash
   npx wrangler d1 execute bigquery-dashboard --local --file=./schema.sql
   ```

2. **Dev Server Not Running Platform Proxy**
   ```bash
   # Kill and restart
   npm run dev
   ```

3. **Browser Cache**
   - Hard refresh: `Ctrl+Shift+R` (Windows) or `Cmd+Shift+R` (Mac)
   - Clear browser storage: DevTools → Application → Clear storage

### Save Fails with No Error

**Symptom**: Click save, nothing happens

**Solution**:
1. Open browser DevTools (F12)
2. Check Console tab for errors
3. Check Network tab for failed requests
4. Verify all required fields are filled
5. Verify service account JSON is valid

---

## 🎯 Best Practices

### Query Templates

✅ **DO**:
- Use descriptive template names
- Include `value` alias for result column
- Use variables for dates, hotel IDs
- Test queries in BigQuery console first
- Comment complex queries

❌ **DON'T**:
- Hardcode dates or hotel IDs
- Use `SELECT *` (specify columns)
- Forget backticks around table names
- Use incompatible SQL dialects

### Security

✅ **DO**:
- Use dedicated service accounts
- Grant minimum necessary permissions
- Rotate service account keys periodically
- Monitor BigQuery audit logs

❌ **DON'T**:
- Share service account JSON files
- Grant owner/editor roles
- Commit credentials to git
- Use personal GCP accounts

### Organization

✅ **DO**:
- Use consistent hotel_code format
- Group related query templates
- Document query purposes
- Keep queries simple and focused

❌ **DON'T**:
- Use special characters in hotel_code
- Create duplicate templates
- Write overly complex queries
- Mix different metric types

---

## 📊 Example Configuration

**Hotel**: Grand Plaza NYC

**Hotel Code**: `GRAND_PLAZA_NYC`

**BigQuery**:
- Project: `hotel-analytics-prod`
- Dataset: `production_metrics`
- Table: `daily_bookings`
- Location: `US`

**Query Templates**:

1. **Today's Bookings**
   ```sql
   SELECT COUNT(*) as value
   FROM `{project_id}.{dataset_id}.{table_name}`
   WHERE booking_date = CURRENT_DATE()
     AND hotel_id = @hotel_id
   ```

2. **Monthly Revenue**
   ```sql
   SELECT SUM(total_amount) as value
   FROM `{project_id}.{dataset_id}.{table_name}`
   WHERE EXTRACT(YEAR FROM booking_date) = @year
     AND EXTRACT(MONTH FROM booking_date) = @month
     AND hotel_id = @hotel_id
   ```

3. **Average Rating**
   ```sql
   SELECT AVG(rating) as value
   FROM `{project_id}.reviews`
   WHERE review_date >= @start_date
     AND review_date <= @end_date
     AND hotel_id = @hotel_id
   ```

---

## 🔐 Security Notes

### Where Credentials Are Stored

✅ **D1 Database** (Cloudflare)
- Service account JSON
- Query templates
- Hotel configurations

✅ **Environment Variables** (Webflow Dashboard)
- `WEBFLOW_CMS_SITE_API_TOKEN` (optional)
- `WEBFLOW_API_HOST` (optional)

❌ **Never in Git**
- `.env` file (gitignored)
- Service account keys
- API tokens

### Access Control

**Current (Phase 1)**: Admin panel is publicly accessible

**Future (Phase 3)**: 
- User authentication
- Role-based access control
- Hotel-level permissions
- Audit logging

---

## 📚 Related Documentation

- **Setup Guide**: `SETUP_INSTRUCTIONS.md`
- **D1 Database**: `D1_SETUP.md`
- **Dashboard Guide**: `DASHBOARD_SETUP.md`
- **Quick Reference**: `QUICK_REFERENCE.md`

---

## ✅ Checklist

Before using the dashboard:

- [ ] D1 database created and initialized
- [ ] Admin panel accessible at `/admin`
- [ ] At least one hotel configured
- [ ] Service account JSON valid
- [ ] Connection test passed
- [ ] Query templates added
- [ ] Variables properly detected

---

**Ready to build the client dashboard!** 🚀

Next: Configure your hotel, then we'll build Phase 2 (client dashboard with filters).
