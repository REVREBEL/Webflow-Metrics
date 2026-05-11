# Environment Guide - Where Am I?

## 🗺️ Understanding Your Environment

### Quick Check: Where Are You?

```
┌─────────────────────────────────────────────────────────┐
│                                                         │
│  Is your URL localhost:3000?                            │
│                                                         │
│  ┌─────────────┐              ┌─────────────────────┐  │
│  │    YES      │              │        NO           │  │
│  └─────┬───────┘              └──────────┬──────────┘  │
│        │                                 │             │
│        ▼                                 ▼             │
│  You're in:                        You're in:         │
│  • Webflow Workbench               • Webflow Cloud    │
│  • Or Local Dev                    (Production)       │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## 🔍 Detailed Environment Detection

### Webflow Workbench

**URL**: `http://localhost:3000` (in preview pane)

**Indicators**:
- ✅ Can edit code
- ✅ Can see file tree
- ✅ Hot reload works
- ❌ Database errors
- ❌ Can't save hotels

**What This Is**:
- Development/preview environment
- For code editing and UI testing
- NOT for full functionality testing

**Database Status**: ❌ Not available

---

### Webflow Cloud (Production)

**URL**: `https://your-app-name.webflow.io`

**Indicators**:
- ✅ Full URL (not localhost)
- ✅ Can save hotels
- ✅ Database works
- ✅ BigQuery queries work
- ✅ All features functional

**What This Is**:
- Production deployment
- Cloudflare Workers environment
- Full D1 database support

**Database Status**: ✅ Auto-provisioned

---

### Local Development

**URL**: `http://localhost:3000` (from terminal)

**Indicators**:
- ✅ Running `npm run dev` in terminal
- ✅ Have `node_modules/` folder
- ✅ Cloned repo to your machine
- ⚠️ May need manual D1 setup

**What This Is**:
- Running on your local machine
- Full control over environment
- Can test everything locally

**Database Status**: ⚠️ Requires manual setup

---

## 🎯 What Works Where?

### Complete Feature Matrix

| Feature | Workbench | Cloud | Local |
|---------|-----------|-------|-------|
| **Code Editing** | ✅ | ❌ | ✅ |
| **UI Preview** | ✅ | ✅ | ✅ |
| **Hot Reload** | ✅ | ❌ | ✅ |
| **D1 Database** | ❌ | ✅ | ⚠️ Manual |
| **Add Hotels** | ❌ | ✅ | ⚠️ After setup |
| **Query Templates** | ❌ | ✅ | ⚠️ After setup |
| **BigQuery** | ❌ | ✅ | ✅ |
| **Dashboard Metrics** | ❌ | ✅ | ⚠️ After setup |
| **Cache** | ❌ | ✅ | ⚠️ After setup |
| **Debugging** | ✅ Console | ⚠️ Logs | ✅ Full |

---

## 🔄 Workflow Recommendations

### For Code Changes

```
Webflow Workbench
       ↓ (edit code)
       ↓ (preview UI)
       ↓ (commit)
Deploy to Webflow Cloud
       ↓
Test Full Functionality
```

### For Database Testing

**Option A: Use Webflow Cloud** (Recommended)
```
1. Make changes in Workbench
2. Deploy to Cloud
3. Test at https://your-app.webflow.io
```

**Option B: Use Local Dev**
```
1. Clone repo
2. Setup D1 locally (see D1_SETUP.md)
3. Test at http://localhost:3000
4. Push changes back
```

---

## 🚨 Common Confusion Points

### "Why doesn't the database work in preview?"

**Answer**: Webflow Workbench preview is **code-only**. Database bindings aren't available in preview environments.

**Solution**: Deploy to Webflow Cloud where D1 is provisioned automatically.

---

### "Do I need to setup D1 manually?"

**For Webflow Cloud**: ❌ NO! Auto-provisioned on deployment.

**For Local Dev**: ✅ YES! Run wrangler commands (see D1_SETUP.md).

---

### "Can I test everything in Workbench?"

**No**. Workbench limitations:
- ❌ No D1 database
- ❌ No Cloudflare bindings
- ❌ No server-side env variables
- ✅ Only UI/code preview

**For full testing**: Deploy to Cloud or setup locally.

---

## 📊 Decision Tree

```
Need to test database features?
│
├─ YES → Do you want to test locally?
│   │
│   ├─ YES → Setup local D1 database
│   │         (Follow D1_SETUP.md)
│   │         Run: npm run dev
│   │         Test: http://localhost:3000
│   │
│   └─ NO  → Deploy to Webflow Cloud
│             (Click "Deploy" in Workbench)
│             Test: https://your-app.webflow.io
│
└─ NO  → Just previewing UI?
          Stay in Workbench preview
          (Database errors are expected)
```

---

## 🎯 Quick Environment Commands

### Check Current Environment (in code)

```typescript
// In any API route or component
const isLocal = import.meta.env.DEV;
const isProduction = import.meta.env.PROD;

// Check if D1 is available
const db = locals?.runtime?.env?.DB;
const hasDatabase = db !== undefined;

console.log({
  isLocal,        // true in Workbench or local dev
  isProduction,   // true in Webflow Cloud
  hasDatabase     // true only if D1 is available
});
```

### Detect Webflow Cloud

```typescript
// Check if running on Cloudflare Workers
const isCloudflare = typeof locals?.runtime?.env !== 'undefined';

// Check if D1 is bound
const hasD1 = typeof locals?.runtime?.env?.DB !== 'undefined';
```

---

## 🚀 Getting Started in Each Environment

### Starting in Workbench (Current)

✅ **You're here!**

**Next Steps**:
1. Review your code changes
2. Preview UI in browser pane
3. When ready, deploy to Cloud
4. Test full functionality there

**Read**: [`DEPLOYMENT_GUIDE.md`](./DEPLOYMENT_GUIDE.md)

---

### Moving to Webflow Cloud

**Steps**:
1. Click "Deploy" in Workbench
2. Wait 1-2 minutes for build
3. Visit: `https://your-app.webflow.io`
4. Everything works! ✅

**Read**: [`QUICK_START_GUIDE.md`](./QUICK_START_GUIDE.md)

---

### Setting Up Local Dev

**Steps**:
```bash
# 1. Clone repo
git clone <repo-url>
cd bigquery-dashboard

# 2. Install deps
npm install

# 3. Setup D1
npx wrangler d1 create bigquery-dashboard
# Update wrangler.jsonc with database_id

# 4. Run migrations
npx wrangler d1 execute DB --local --file=./schema.sql

# 5. Start dev server
npm run dev

# 6. Open browser
open http://localhost:3000/admin
```

**Read**: [`LOCAL_DEVELOPMENT.md`](./LOCAL_DEVELOPMENT.md)

---

## 📋 Environment Comparison

### Development (Workbench)

**Purpose**: Code editing & UI preview  
**Database**: ❌ Not available  
**Best For**: Making code changes  
**Limitations**: Can't test database features  

### Staging (Webflow Cloud)

**Purpose**: Testing & production  
**Database**: ✅ Auto-provisioned  
**Best For**: Full feature testing  
**Limitations**: Can't edit code directly  

### Local (Your Machine)

**Purpose**: Full development environment  
**Database**: ⚠️ Manual setup required  
**Best For**: Complex debugging & testing  
**Limitations**: Requires setup, uses local resources  

---

## 🎓 Pro Tips

### Tip 1: Use the Right Tool for the Job

- **Editing UI**: Use Workbench
- **Testing features**: Deploy to Cloud
- **Debugging complex issues**: Setup locally

### Tip 2: Understand Limitations

Don't waste time trying to get database working in Workbench - it's not designed for that!

### Tip 3: Fast Iteration

```
Edit code in Workbench
       ↓
Deploy to Cloud (1-2 min)
       ↓
Test feature
       ↓
Repeat
```

This is faster than local setup for simple changes!

### Tip 4: When to Go Local

Consider local dev when:
- ✅ Making many rapid changes
- ✅ Need detailed debugging
- ✅ Testing complex database scenarios
- ✅ Working offline
- ✅ Need to inspect D1 directly

---

## 🆘 Troubleshooting by Environment

### "Database not configured" in Workbench

**This is normal!** Database isn't available here.

**Solution**: Deploy to Webflow Cloud.

---

### "Database not configured" in Webflow Cloud

**This is a problem!** Database should be available.

**Solutions**:
1. Check deployment logs
2. Re-deploy
3. Verify wrangler.jsonc
4. Contact Webflow support

**Read**: [`DATABASE_NOT_CONFIGURED_FIX.md`](./DATABASE_NOT_CONFIGURED_FIX.md)

---

### "Database not configured" in Local Dev

**Expected** if you haven't setup D1 yet.

**Solution**: Follow D1 setup guide.

**Read**: [`D1_SETUP.md`](./D1_SETUP.md)

---

## 📚 Environment-Specific Guides

| Environment | Guide |
|-------------|-------|
| Workbench → Cloud | [`DEPLOYMENT_GUIDE.md`](./DEPLOYMENT_GUIDE.md) |
| Setting up Local | [`LOCAL_DEVELOPMENT.md`](./LOCAL_DEVELOPMENT.md) |
| D1 Database | [`D1_SETUP.md`](./D1_SETUP.md) |
| Using Admin Panel | [`ADMIN_QUICK_START.md`](./ADMIN_QUICK_START.md) |
| Using Dashboard | [`QUICK_START_GUIDE.md`](./QUICK_START_GUIDE.md) |

---

## ✅ Summary

**3 Environments**:
1. 🔧 **Webflow Workbench** - Code editing only
2. ☁️ **Webflow Cloud** - Full functionality (deploy here!)
3. 💻 **Local Dev** - Full control (optional)

**Current Problem**: "Database not configured"
**Your Environment**: Webflow Workbench
**Solution**: Deploy to Webflow Cloud

**Action**: Click "Deploy" → Database works automatically! ✅

---

**Last Updated**: February 18, 2026
