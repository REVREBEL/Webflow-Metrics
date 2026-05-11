# BigQuery Dashboard - Project Summary

## 🎯 Project Overview

A multi-hotel BigQuery analytics dashboard built on **Webflow Cloud** + **Cloudflare Workers**, designed for client-facing real-time metrics with secure credential management and reusable query templates.

---

## ✅ Phase 1: Complete (Backend + Admin Panel)

### What's Built

**Backend Infrastructure**
- ✅ D1 database with schema for multi-hotel configs
- ✅ Secure credential storage (service account JSON)
- ✅ Query template system with variable detection
- ✅ BigQuery API wrapper with error handling
- ✅ Caching layer (24hr TTL, 7am PST reset)
- ✅ API endpoints for CRUD operations

**Admin Panel**
- ✅ Hotel management interface (`/admin`)
- ✅ BigQuery configuration forms
- ✅ Connection testing
- ✅ Query template editor
- ✅ Variable auto-detection (`@variable_name`)
- ✅ Data location selector

**Security**
- ✅ Credentials stored in D1 (encrypted at rest)
- ✅ Server-side only API access
- ✅ No client-side credential exposure
- ✅ HTTPS in transit

---

## 🚧 Phase 2: In Progress (Client Dashboard)

### Next Steps

**Dashboard UI**
- 🔲 Hotel selector dropdown
- 🔲 Year/month filter
- 🔲 Dynamic metric cards (KPI display)
- 🔲 Query execution with variable substitution
- 🔲 Loading states
- 🔲 Error handling
- 🔲 Cache status indicator
- 🔲 Manual refresh button

**UX Improvements**
- 🔲 Responsive design (mobile-friendly)
- 🔲 Skeleton loaders
- 🔲 Empty states
- 🔲 Error messages

**Performance**
- 🔲 Move cache to KV (persistent)
- 🔲 Query result pagination
- 🔲 Parallel query execution

---

## 🚧 Phase 3: Planned (User Management)

**Authentication**
- 🔲 Email/password login
- 🔲 Session management
- 🔲 Password reset flow

**Authorization**
- 🔲 Role-based access control (admin/viewer)
- 🔲 Hotel-level permissions
- 🔲 User-hotel assignments

**Security**
- 🔲 Protect admin panel (auth required)
- 🔲 Audit logging
- 🔲 Rate limiting

---

## 📁 Key Files

### Configuration
- `wrangler.jsonc` - Cloudflare bindings (D1)
- `webflow.json` - Webflow Cloud integration
- `schema.sql` - Initial database schema
- `.env` - Local environment variables (gitignored)

### Backend
- `src/lib/bigquery-client.ts` - BigQuery API wrapper
- `src/lib/cache-manager.ts` - Caching logic
- `src/pages/api/admin/hotels.ts` - Hotel CRUD API
- `src/pages/api/bigquery/execute-query.ts` - Query execution
- `src/pages/api/bigquery/test-connection.ts` - Connection testing

### Frontend
- `src/components/AdminPanel.tsx` - Admin UI
- `src/components/DashboardApp.tsx` - Main app entry
- `src/pages/admin.astro` - Admin page
- `src/pages/index.astro` - Dashboard page (Phase 2)

### Documentation
- `SETUP_INSTRUCTIONS.md` - Complete setup guide
- `D1_SETUP.md` - D1 database configuration
- `ADMIN_QUICK_START.md` - Admin panel usage
- `QUICK_REFERENCE.md` - API reference + troubleshooting
- `WEBFLOW_COMPLETE_GUIDE.md` - Webflow Cloud architecture

---

## 🗄️ Database Schema

```sql
-- Hotel configurations
hotel_configs (
  hotel_code TEXT PRIMARY KEY,
  hotel_name TEXT NOT NULL,
  service_account_json TEXT NOT NULL,
  data_location TEXT DEFAULT 'US',
  project_id TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)

-- Reusable query templates
query_templates (
  template_id TEXT PRIMARY KEY,
  hotel_code TEXT REFERENCES hotel_configs,
  template_name TEXT NOT NULL,
  sql_query TEXT NOT NULL,
  variables TEXT, -- JSON array
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)

-- Dashboard configurations (Phase 2)
dashboard_configs (
  config_id TEXT PRIMARY KEY,
  hotel_code TEXT REFERENCES hotel_configs,
  config_name TEXT NOT NULL,
  layout TEXT, -- JSON
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)

-- User accounts (Phase 3)
users (
  user_id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT DEFAULT 'viewer',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)

-- User-hotel permissions (Phase 3)
user_hotels (
  user_id TEXT REFERENCES users,
  hotel_code TEXT REFERENCES hotel_configs,
  access_level TEXT DEFAULT 'read',
  PRIMARY KEY (user_id, hotel_code)
)
```

---

## 🔌 API Endpoints

### Admin
- `GET /api/admin/hotels` - List hotels
- `POST /api/admin/hotels` - Create/update hotel
- `DELETE /api/admin/hotels` - Delete hotel

### BigQuery
- `POST /api/bigquery/test-connection` - Test credentials
- `POST /api/bigquery/execute-query` - Run query with variables

### Future (Phase 2+)
- `GET /api/dashboards/:hotel_code` - Get dashboard config
- `POST /api/dashboards/:hotel_code` - Save dashboard layout
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout

---

## 🎨 Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      Webflow Cloud                          │
│  ┌─────────────────────────────────────────────────────┐   │
│  │              Astro Application                      │   │
│  │                                                      │   │
│  │  ┌──────────────┐       ┌──────────────┐          │   │
│  │  │  Admin Panel │       │  Dashboard   │          │   │
│  │  │  (/admin)    │       │  (/)         │          │   │
│  │  └──────┬───────┘       └──────┬───────┘          │   │
│  │         │                      │                   │   │
│  │         └──────────┬───────────┘                   │   │
│  │                    │                               │   │
│  │         ┌──────────▼─────────────┐                │   │
│  │         │   API Routes           │                │   │
│  │         │  /api/admin/hotels     │                │   │
│  │         │  /api/bigquery/*       │                │   │
│  │         └──────────┬─────────────┘                │   │
│  │                    │                               │   │
│  │         ┌──────────▼─────────────┐                │   │
│  │         │  BigQuery Client       │                │   │
│  │         │  + Cache Manager       │                │   │
│  │         └──────────┬─────────────┘                │   │
│  └────────────────────┼──────────────────────────────┘   │
│                       │                                   │
│         ┌─────────────┼─────────────────────┐            │
│         │   Cloudflare Workers Bindings     │            │
│         │                                    │            │
│         │  ┌────────┐         ┌──────────┐  │            │
│         │  │   D1   │         │   KV     │  │            │
│         │  │Database│         │  Cache   │  │            │
│         │  └────────┘         └──────────┘  │            │
│         └────────────────────────────────────┘            │
└─────────────────────────────────────────────────────────────┘
                         │
                         │ (Outbound API Call)
                         ▼
┌─────────────────────────────────────────────────────────────┐
│               Google Cloud Platform                         │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │             BigQuery API                             │  │
│  │  ┌────────────────────────────────────────────┐     │  │
│  │  │  Dataset: hotel_analytics                  │     │  │
│  │  │  ┌──────────────┐  ┌──────────────┐       │     │  │
│  │  │  │ daily_metrics│  │   bookings   │       │     │  │
│  │  │  └──────────────┘  └──────────────┘       │     │  │
│  │  └────────────────────────────────────────────┘     │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔐 Security Model

### Credential Storage
```
Service Account JSON (BigQuery)
         │
         ▼
┌────────────────────┐
│   D1 Database      │ ← Encrypted at rest
│   (Cloudflare)     │ ← HTTPS in transit
└────────────────────┘
         │
         ▼ (Server-side only)
┌────────────────────┐
│  API Routes        │ ← locals.runtime.env.DB
│  (Astro)           │ ← Never exposed to client
└────────────────────┘
         │
         ▼
┌────────────────────┐
│  BigQuery API      │ ← TLS 1.3
│  (Google Cloud)    │ ← OAuth 2.0
└────────────────────┘
```

### Access Control

**Phase 1** (Current):
- ❌ No authentication
- ⚠️ Admin panel publicly accessible
- ✅ Credentials not exposed to client

**Phase 3** (Planned):
- ✅ User authentication required
- ✅ Role-based access (admin/viewer)
- ✅ Hotel-level permissions
- ✅ Audit logging

---

## 🚀 Deployment Process

### Local Development
```bash
1. Create D1: npx wrangler d1 create bigquery-dashboard
2. Update wrangler.jsonc with database_id
3. Init schema: npx wrangler d1 execute ... --local --file=./schema.sql
4. Start dev: npm run dev
5. Access: http://localhost:3000/admin
```

### Production Deployment
```bash
1. Commit changes: git add -A && git commit -m "..."
2. Push to GitHub: git push origin main
3. Webflow Cloud auto-deploys
4. Init production schema (first time):
   npx wrangler d1 execute ... --remote --file=./schema.sql
5. Set env vars in Webflow dashboard
```

---

## 📊 Data Flow

### Query Execution Flow

```
Client Request
      │
      ▼
┌─────────────────┐
│  POST /api/     │ 1. Receive request
│  bigquery/      │    - hotel_code
│  execute-query  │    - sql_query
└────────┬────────┘    - variables[]
         │
         ▼
┌─────────────────┐
│  Cache Check    │ 2. Check cache
│  (in-memory)    │    Key: hotel:query:vars
└────────┬────────┘
         │
    ┌────┴────┐
    │   Hit?  │
    └────┬────┘
         │
    ┌────┴────────────────┐
    │                     │
   YES                   NO
    │                     │
    ▼                     ▼
┌─────────────┐   ┌─────────────────┐
│Return Cache │   │  Fetch Config   │ 3. Get hotel config
│   Result    │   │  from D1        │    from D1 database
└─────────────┘   └────────┬────────┘
                           │
                           ▼
                  ┌─────────────────┐
                  │  Substitute     │ 4. Replace placeholders
                  │  Placeholders   │    {project_id}, etc.
                  └────────┬────────┘
                           │
                           ▼
                  ┌─────────────────┐
                  │  Execute Query  │ 5. Call BigQuery API
                  │  on BigQuery    │    with credentials
                  └────────┬────────┘
                           │
                           ▼
                  ┌─────────────────┐
                  │  Extract Value  │ 6. Parse result
                  │  from Result    │    (column named 'value')
                  └────────┬────────┘
                           │
                           ▼
                  ┌─────────────────┐
                  │  Cache Result   │ 7. Store in cache
                  │  (24hr TTL)     │    (expires 7am PST)
                  └────────┬────────┘
                           │
                           ▼
                  ┌─────────────────┐
                  │  Return to      │ 8. Send response
                  │  Client         │    { value, cached: false }
                  └─────────────────┘
```

---

## 🎯 Success Criteria

### Phase 1 ✅
- [x] D1 database configured
- [x] Admin panel functional
- [x] Hotels can be added/edited/deleted
- [x] BigQuery connection tested
- [x] Query templates saved
- [x] Variables auto-detected
- [x] Credentials stored securely

### Phase 2 🚧
- [ ] Client dashboard displays metrics
- [ ] Year/month filters work
- [ ] Multiple hotels selectable
- [ ] Queries execute with variables
- [ ] Cache works correctly
- [ ] Loading states implemented
- [ ] Error handling complete

### Phase 3 🔲
- [ ] Users can register/login
- [ ] Admins can manage hotels
- [ ] Viewers can see dashboards
- [ ] Permissions enforced
- [ ] Audit log functional

---

## 📈 Performance Targets

### Query Execution
- First request: < 3 seconds
- Cached requests: < 100ms
- Cache hit rate: > 80%

### Page Load
- Admin panel: < 2 seconds
- Dashboard: < 1 second (cached)

### Scalability
- Hotels: 100+ supported
- Users: 1000+ supported (Phase 3)
- Concurrent queries: 50+

---

## 🐛 Known Issues

### Phase 1
- ⚠️ Admin panel not protected (no auth)
- ⚠️ Cache is in-memory (resets on deploy)
- ⚠️ No audit logging
- ⚠️ No rate limiting

### Planned Fixes
- Phase 3: Add authentication
- Phase 2: Move cache to KV
- Phase 3: Implement audit logs
- Phase 2: Add rate limiting

---

## 📚 Documentation Index

### Setup Guides
- `SETUP_INSTRUCTIONS.md` - Complete setup walkthrough
- `D1_SETUP.md` - D1 database configuration
- `ADMIN_QUICK_START.md` - Admin panel usage guide

### Reference
- `QUICK_REFERENCE.md` - API reference + troubleshooting
- `WEBFLOW_COMPLETE_GUIDE.md` - Webflow Cloud architecture
- `PROJECT_SUMMARY.md` - This document

### Legacy (Pre-D1)
- `DASHBOARD_SETUP.md` - Original single-hotel approach
- `VARIABLE_CONFIGURATION.md` - Query variable handling
- `CACHE_UPDATE_SUMMARY.md` - Caching implementation

---

## 🎓 Key Learnings

### Architecture Decisions

**Why D1 for Credentials?**
- ✅ Encrypted at rest by Cloudflare
- ✅ Server-side only access
- ✅ No environment variable limits
- ✅ Proper relational structure

**Why Multi-Hotel Design?**
- ✅ Client needs multiple properties
- ✅ Single codebase for all hotels
- ✅ Centralized management
- ✅ Easier maintenance

**Why Query Templates?**
- ✅ Reusable across time periods
- ✅ Type-safe variables
- ✅ Easy to modify without code changes
- ✅ Client can manage their own queries

**Why Cache at 7am PST?**
- ✅ Aligns with BigQuery data processing (6am PST)
- ✅ Fresh data every morning
- ✅ Reduces API costs
- ✅ Predictable behavior

---

## 🚀 Next Actions

1. **Test Admin Panel** (`/admin`)
   - Add a test hotel
   - Configure BigQuery credentials
   - Add query templates
   - Test connection

2. **Build Client Dashboard** (Phase 2)
   - Create hotel selector
   - Add year/month filters
   - Display metric cards
   - Implement query execution

3. **Add Authentication** (Phase 3)
   - User registration/login
   - Protect admin panel
   - Add permissions

---

## 📞 Support

**Documentation**: All `.md` files in project root
**Architecture Guide**: `WEBFLOW_COMPLETE_GUIDE.md`
**Quick Reference**: `QUICK_REFERENCE.md`

---

**Last Updated**: February 18, 2026
**Current Phase**: Phase 1 Complete ✅
**Next Phase**: Phase 2 (Client Dashboard) 🚧
