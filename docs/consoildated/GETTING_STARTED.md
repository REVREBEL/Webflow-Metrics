# Getting Started with BigQuery Dashboard

## ✅ What's Been Built

You now have a complete, working BigQuery dashboard connector with:

1. **Welcome Screen** - Choose between demo mode or real BigQuery connection
2. **Configuration Wizard** - Secure service account setup and metric configuration  
3. **Live Dashboard** - Real-time KPI cards using Webflow components
4. **Intelligent Caching** - 5-minute TTL to minimize BigQuery costs
5. **Query Preview** - See raw results in tabular format

## 🚀 Quick Start

### 1. Start the Development Server

```bash
npm run dev
```

Visit http://localhost:3000

### 2. Try Demo Mode (No Setup Required)

1. Click **"Try Demo Dashboard"**
2. Explore with pre-populated sample data
3. See how the dashboard works without needing BigQuery

### 3. Connect to Real BigQuery

#### Step A: Create Service Account

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Select your project
3. Navigate to **IAM & Admin** > **Service Accounts**
4. Click **Create Service Account**
5. Add these roles:
   - `BigQuery Data Viewer`
   - `BigQuery Job User`
6. Create and download JSON key

#### Step B: Configure Dashboard

1. Click **"Configure BigQuery"**
2. Paste your service account JSON
3. Click **"Test Connection"**
4. Wait for success confirmation
5. Add your metrics:
   - **Metric Name**: Display name (e.g., "Total Users")
   - **Table Name**: Optional reference
   - **SQL Query**: Your BigQuery SQL
6. Click **"Save Configuration & View Dashboard"**

## 📊 Example Queries to Try

### Using Public Datasets

Test with Google's free public datasets (no billing required for small queries):

```sql
-- Total US baby names count
SELECT COUNT(*) as value 
FROM `bigquery-public-data.usa_names.usa_1910_current`
```

```sql
-- Popular names from 2020
SELECT SUM(number) as value 
FROM `bigquery-public-data.usa_names.usa_1910_current` 
WHERE year = 2020
```

```sql
-- Total unique names
SELECT COUNT(DISTINCT name) as value 
FROM `bigquery-public-data.usa_names.usa_1910_current`
```

### With Your Own Data

```sql
-- Replace with your project.dataset.table
SELECT COUNT(*) as value 
FROM `your-project.your_dataset.your_table`
WHERE date >= CURRENT_DATE()
```

## 🏗️ Project Structure

```
src/
├── components/
│   ├── DashboardApp.tsx          # Main app component
│   ├── DemoMode.tsx              # Welcome screen
│   ├── BigQueryConfig.tsx        # Configuration wizard
│   ├── BigQueryDashboard.tsx     # Dashboard display
│   └── SecurityNote.tsx          # Security information
│
├── pages/
│   ├── index.astro               # Entry point
│   └── api/bigquery/
│       ├── test-connection.ts    # Connection validator API
│       ├── execute-query.ts      # Query executor API
│       └── sample-data.ts        # Demo data API
│
├── lib/
│   ├── bigquery-client.ts        # BigQuery SDK wrapper
│   ├── cache-manager.ts          # In-memory caching
│   └── base-url.ts              # URL helper
│
└── site-components/              # Webflow components
    ├── KpiCard.jsx              # Used for metrics display
    └── DevLinkProvider.jsx      # Webflow provider
```

## 🔒 Security

### Current Implementation (Development)
- ✅ Service account JSON sent directly to BigQuery API
- ✅ Credentials NOT stored on server
- ✅ Server-side query execution only
- ✅ Only results cached (not credentials)

### Production Recommendations
- 🔐 Store encrypted credentials in Cloudflare KV
- 🔐 Add user authentication
- 🔐 Implement rate limiting
- 🔐 Add query validation/sanitization
- 🔐 Enable audit logging

## 💰 Cost Management

BigQuery costs are based on data processed:
- **Free Tier**: 1 TB/month
- **On-Demand**: $5 per TB

### With Our Caching (5-minute TTL)
**Example: 3 metrics, refreshing every 5 minutes**
- 12 queries/hour per metric = 36 queries/hour
- 10 MB average per query = 360 MB/hour
- 24 hours = 8.64 GB/day
- **Monthly**: ~259 GB (~$1.30, well within free tier!)

### Tips to Reduce Costs
- ✅ Use caching (already implemented!)
- ✅ Add WHERE clauses to limit data scanned
- ✅ Query only needed columns
- ✅ Use partitioned tables
- ✅ Set budget alerts in Google Cloud Console

## 🎨 Customization

### Adding More Metrics
1. In the Configuration wizard, click **"+ Add Another Metric"**
2. Fill in metric details
3. Save and view updated dashboard

### Changing Cache Duration
Edit `src/components/BigQueryDashboard.tsx`:
```typescript
cacheTTL: 5 * 60 * 1000, // Change to desired milliseconds
```

### Styling
- Main styles in `src/styles/global.css`
- Webflow component styles auto-generated
- Full Tailwind CSS + shadcn/ui available

## 🧪 Testing

### Test Connection
1. Use the "Test Connection" button in configuration
2. Verifies service account is valid
3. Checks BigQuery API access

### Test Queries
1. Run queries in BigQuery console first
2. Verify results before adding to dashboard
3. Check that queries return numeric values for KPIs

### Common Issues

**"Connection test failed"**
- ✓ Check JSON is valid
- ✓ Verify service account has required roles
- ✓ Ensure BigQuery API is enabled

**"Query execution failed"**
- ✓ Use backticks: \`project.dataset.table\`
- ✓ Test query in BigQuery console
- ✓ Check service account has dataset access

**"No data" displayed**
- ✓ Query returns at least one row
- ✓ Result has a numeric field
- ✓ Check browser console for errors

## 📚 Next Steps

### Immediate
- [x] ✅ Try demo mode
- [ ] Connect your BigQuery project
- [ ] Add your first metric
- [ ] Test with public datasets

### Short Term
- [ ] Add more metrics
- [ ] Customize styling
- [ ] Set up cost alerts in GCP
- [ ] Test with your team

### Long Term (Production)
- [ ] Add user authentication
- [ ] Implement persistent caching (KV)
- [ ] Add data export functionality
- [ ] Create multiple dashboards
- [ ] Add charting/visualization
- [ ] Set up monitoring/alerting

## 🆘 Support

### Documentation
- [README.md](./README.md) - Full project documentation
- [DASHBOARD_SETUP.md](./DASHBOARD_SETUP.md) - Detailed setup guide
- [PROJECT_SUMMARY.md](./PROJECT_SUMMARY.md) - Technical overview

### Resources
- [BigQuery Documentation](https://cloud.google.com/bigquery/docs)
- [BigQuery Public Datasets](https://cloud.google.com/bigquery/public-data)
- [Service Account Setup](https://cloud.google.com/iam/docs/service-accounts)
- [BigQuery SQL Reference](https://cloud.google.com/bigquery/docs/reference/standard-sql)

### Troubleshooting
1. Check browser console for errors
2. Verify service account permissions
3. Test queries in BigQuery console
4. Check BigQuery quotas/limits
5. Review audit logs in Google Cloud

## 🎉 You're Ready!

Your BigQuery dashboard is fully set up and ready to use. Start with demo mode to learn the interface, then connect your real data to create powerful, cost-effective analytics dashboards.

**Happy Dashboarding! 📊**

---

Built with Astro, React, TypeScript, Webflow Components, and BigQuery.
