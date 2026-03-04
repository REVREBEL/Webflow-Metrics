



# BigQuery Dashboard Connector

A secure, production-ready dashboard for connecting to Google BigQuery and displaying real-time metrics.

## 🔐 CRITICAL SECURITY SETUP

**Before deploying, you MUST configure encryption:**

1. **Generate an encryption key** (32+ characters):
   ```bash
   openssl rand -base64 32
   ```

2. **Add to Webflow Cloud**:
   - Go to **Settings** → **Environment Variables**
   - Add: `ENCRYPTION_KEY` = `<your-generated-key>`
   - Mark as **Secret**

3. **Add to local `.env`**:
   ```env
   ENCRYPTION_KEY="your-generated-key-here"
   ```

**Why?** Service account credentials are encrypted in the database. Without this key, the app cannot decrypt credentials and queries will fail.

📖 **See [ENCRYPTION_SETUP.md](./ENCRYPTION_SETUP.md) for full details**

---

# BigQuery Dashboard - Hotel Analytics

A real-time analytics dashboard for hotel performance metrics powered by Google BigQuery and deployed on Webflow Cloud.

---

## 🎯 Quick Start

### You're in Webflow Workbench?

**Seeing "Database not configured" error?** → This is normal! 

👉 **Solution**: Deploy to Webflow Cloud where D1 database will be auto-provisioned.

📖 **Read**: [`DEPLOYMENT_GUIDE.md`](./DEPLOYMENT_GUIDE.md)

---

## 🚀 Deployment (Webflow Cloud)

### 1. Pre-Flight Check

Ensure these files exist:
- ✅ `wrangler.jsonc` (D1 binding configured)
- ✅ `migrations/0001_initial_schema.sql` (database schema)
- ✅ No build errors: `npm run build`

### 2. Deploy

1. Click **"Deploy"** in Webflow Workbench
2. Wait for build to complete
3. D1 database auto-provisioned ✨
4. Migrations run automatically ✨

### 3. First-Time Setup

1. Visit: `https://your-app.webflow.io/admin`
2. Click "Add New Hotel"
3. Enter BigQuery credentials
4. Create query templates
5. View metrics! 🎉

📖 **Full Guide**: [`DEPLOYMENT_GUIDE.md`](./DEPLOYMENT_GUIDE.md)

---

## 📁 Project Structure

```
bigquery-dashboard/
├── src/
│   ├── components/         # React UI components
│   │   ├── AdminPanel.tsx      # Hotel & template management
│   │   ├── ClientDashboard.tsx # Main dashboard interface
│   │   ├── BigQueryConfig.tsx  # Connection testing
│   │   └── DemoMode.tsx        # Sample data preview
│   ├── pages/
│   │   ├── index.astro         # Dashboard page
│   │   ├── admin.astro         # Admin panel
│   │   └── api/                # API endpoints
│   ├── lib/
│   │   ├── bigquery-client.ts  # BigQuery integration
│   │   └── cache-manager.ts    # 24hr cache with 7am reset
│   └── site-components/        # Webflow components (KpiCard)
├── migrations/
│   └── 0001_initial_schema.sql # D1 database schema
├── wrangler.jsonc              # Cloudflare Workers config
├── schema.sql                  # Schema backup
└── docs/                       # 📚 Documentation
```

---

## 🏗️ Architecture

### Tech Stack

- **Frontend**: Astro + React + Tailwind CSS + shadcn/ui
- **Backend**: Cloudflare Workers (serverless)
- **Database**: Cloudflare D1 (SQLite)
- **Data Source**: Google BigQuery
- **Deployment**: Webflow Cloud
- **Components**: Webflow Devlink (KpiCard)

### Data Flow

```
Client Browser
    ↓
Astro SSR + React Components
    ↓
API Routes (Cloudflare Workers)
    ↓
D1 Database (credentials & templates)
    ↓
BigQuery API (metric queries)
    ↓
Cache Layer (24hr, resets 7am PST)
    ↓
Display in KpiCard Components
```

---

## 🎨 Features

### ✅ Phase 1: Admin Panel (Complete)

- Hotel configuration management
- BigQuery credential storage (secure, server-side)
- Connection testing
- Query template builder
- Variable substitution (@hotel_code, @year, @month)
- Demo mode with sample data

### ✅ Phase 2: Client Dashboard (Complete)

- Hotel selector dropdown
- Year/month filters
- Dynamic metric cards
- Real-time BigQuery queries
- Smart caching (24hr TTL, 7am reset)
- Webflow KpiCard component integration
- Clear cache & refresh functionality

### ✅ Phase 3: Global Templates (Complete)

- Global query templates (work for all hotels)
- Variable substitution ({{hotel_code}}, {{start_date}}, {{end_date}}, etc.)
- Template library management
- Reusable metric definitions

### ✅ Phase 4: Hybrid Query Builder (Complete)

- **Visual Query Builder** - Build queries without writing SQL
- **Schema Discovery** - Automatic BigQuery table introspection
- **Table Registry** - Centralized table metadata management
- **Smart Placeholders** - Auto-generated from table columns
- **Advanced SQL Mode** - Full SQL editor for complex queries
- **Type-Aware Building** - Only show relevant columns for operations
- **Live SQL Preview** - See generated SQL as you build

### 🔜 Phase 5: Future Enhancements

- User authentication & authorization
- Role-based access control (viewer, editor, admin)
- Multi-metric templates
- Custom date ranges
- Export to CSV/PDF
- Email reports
- Alert notifications
- Query builder UI
- Performance monitoring

---

## 📊 Database Schema

### Tables

| Table | Purpose |
|-------|---------|
| `hotels` | Hotel configurations & BigQuery credentials |
| `query_templates` | Reusable SQL queries for metrics |
| `cache_entries` | Cached query results (24hr TTL) |
| `audit_log` | Security & debugging audit trail |

📖 **Full Schema**: [`migrations/0001_initial_schema.sql`](./migrations/0001_initial_schema.sql)

---

## 🔐 Security

### BigQuery Credentials

- ✅ Stored in D1 database (server-side only)
- ✅ Never exposed to client
- ✅ Encrypted at rest by Cloudflare
- ✅ Accessed only by server API routes
- ❌ NOT in environment variables
- ❌ NOT in git repository
- ❌ NOT in client-side code

### Service Account Permissions

Required BigQuery IAM role:
- **BigQuery Data Viewer** (read-only)

Recommended principle:
- **Least privilege** - Only grant read access to specific datasets

📖 **Security Guide**: [`DEPLOYMENT_GUIDE.md#security-checklist`](./DEPLOYMENT_GUIDE.md#-security-checklist)

---

## 🧪 Testing

### Development (Webflow Workbench)

**Available**:
- ✅ UI/UX preview
- ✅ Component rendering
- ✅ Styling & responsive design
- ✅ TypeScript validation
- ✅ Build success

**Not Available**:
- ❌ D1 database (no binding in preview)
- ❌ BigQuery integration
- ❌ API endpoint testing

**Solution**: Deploy to Webflow Cloud or test locally.

### Local Development

```bash
# 1. Clone repo
git clone <your-repo>
cd bigquery-dashboard

# 2. Install dependencies
npm install

# 3. Setup D1 database
npx wrangler d1 create bigquery-dashboard
# Update wrangler.jsonc with database_id
npx wrangler d1 execute DB --local --file=./schema.sql

# 4. Run dev server
npm run dev

# 5. Test
open http://localhost:3000/admin
```

📖 **Local Setup**: [`LOCAL_DEVELOPMENT.md`](./LOCAL_DEVELOPMENT.md)

---

## 📚 Documentation

| Document | Description |
|----------|-------------|
| [`DEPLOYMENT_GUIDE.md`](./DEPLOYMENT_GUIDE.md) | **START HERE** - Deploy to Webflow Cloud |
| [`LOCAL_DEVELOPMENT.md`](./LOCAL_DEVELOPMENT.md) | Understanding environments & local setup |
| [`D1_SETUP.md`](./D1_SETUP.md) | Detailed D1 database configuration |
| [`QUICK_START_GUIDE.md`](./QUICK_START_GUIDE.md) | Using the dashboard after deployment |
| [`ADMIN_QUICK_START.md`](./ADMIN_QUICK_START.md) | Admin panel walkthrough |
| [`HYBRID_QUERY_BUILDER_GUIDE.md`](./HYBRID_QUERY_BUILDER_GUIDE.md) | Visual query builder & table registry |
| [`PROJECT_SUMMARY.md`](./PROJECT_SUMMARY.md) | Architecture & technical details |
| [`PHASE_1_COMPLETE.md`](./PHASE_1_COMPLETE.md) | Phase 1 features & API reference |
| [`PHASE_2_COMPLETE.md`](./PHASE_2_COMPLETE.md) | Phase 2 features & client dashboard |
| [`PHASE_4_HYBRID_QUERY_BUILDER.md`](./PHASE_4_HYBRID_QUERY_BUILDER.md) | Phase 4 implementation summary |

---

## 🐛 Common Issues

### "Database not configured"

**In Webflow Workbench**: Normal - D1 not available in preview  
**In Webflow Cloud**: Re-deploy or check logs  
**Locally**: Run D1 setup commands  

📖 [`DEPLOYMENT_GUIDE.md#troubleshooting`](./DEPLOYMENT_GUIDE.md#-troubleshooting)

### "Connection failed" (BigQuery)

- Check service account JSON is valid
- Verify project ID is correct
- Ensure data location matches (US, EU, etc.)
- Confirm service account has BigQuery Data Viewer role

### Metrics showing wrong values

- Ensure query returns a column named `value`
- Check variable substitution (@hotel_code, @year, @month)
- Verify data exists in BigQuery for selected filters
- Try clearing cache with "Clear Cache & Refresh" button

---

## 🔄 Development Workflow

### Making Changes

1. **Edit Code** in Webflow Workbench
2. **Preview** UI changes (DB features won't work)
3. **Deploy** to Webflow Cloud
4. **Test** in production environment
5. **Iterate** as needed

### Database Changes

1. **Create New Migration**: `migrations/NNNN_description.sql`
2. **Use ALTER TABLE** (not CREATE TABLE)
3. **Test Locally First** (if possible)
4. **Deploy** (migration runs automatically)
5. **Verify** changes in production

---

## 🎯 Roadmap

### Current: Phase 4 ✅
- Visual Query Builder (no SQL required)
- Schema Discovery & Table Registry
- Smart placeholder generation
- Advanced SQL mode for complex queries
- Type-aware column selection
- Live SQL preview

### Next: Phase 5 🔜
- User authentication (Cloudflare Access or Auth0)
- Role-based permissions
- Query performance insights
- Template suggestions & recommendations
- Query validation & testing
- Export & reporting features

### Future: Phase 6 🚀
- Real-time updates (WebSockets)
- Predictive analytics
- Custom alerting
- Mobile app
- White-label deployment

---

## 🤝 Contributing

### Setup Development Environment

See [`LOCAL_DEVELOPMENT.md`](./LOCAL_DEVELOPMENT.md)

### Code Style

- TypeScript strict mode
- ESLint + Prettier
- React functional components with hooks
- Astro component patterns
- Tailwind CSS (via Webflow variables)

### Pull Request Process

1. Create feature branch
2. Make changes
3. Test locally
4. Update documentation
5. Submit PR with description

---

## 📞 Support

### Getting Help

1. **Search Documentation** - Check relevant guide
2. **Check Logs** - Deployment & runtime logs
3. **Test Locally** - Isolate the issue
4. **Webflow Support** - For platform issues
5. **GitHub Issues** - For code/feature questions

### Reporting Bugs

Include:
- Steps to reproduce
- Expected vs actual behavior
- Error messages & logs
- Environment (Workbench, Cloud, Local)
- Screenshots if applicable

---

## 📄 License

MIT License - See LICENSE file for details

---

## 🎉 Quick Links

| Link | Description |
|------|-------------|
| [Deploy Now](./DEPLOYMENT_GUIDE.md) | Deploy to Webflow Cloud |
| [Admin Guide](./ADMIN_QUICK_START.md) | Using the admin panel |
| [User Guide](./QUICK_START_GUIDE.md) | Using the dashboard |
| [Troubleshooting](./DEPLOYMENT_GUIDE.md#-troubleshooting) | Common issues & solutions |

---

**Current Status**: Phase 4 Complete ✅  
**Ready for**: Production Deployment with Hybrid Query Builder 🚀

**Last Updated**: February 20, 2026





