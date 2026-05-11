# Changelog

## v2.1.0 - Webflow KpiCard Integration (2026-02-18)

### 🎉 Major Features

#### 1. Webflow Component Integration
- **Native KpiCard**: Replaced custom React cards with Webflow's DevLink KpiCard component
- **Design Automation**: Design changes in Webflow Designer now auto-sync to dashboard
- **DevLinkProvider**: Properly wrapped components for correct rendering
- **Component CSS**: Added `site-components/global.css` import to layout

**Benefits**:
- ✅ Design changes propagate automatically
- ✅ No code changes needed for styling updates
- ✅ Consistent with Webflow design system
- ✅ Professional, polished UI out of the box

**Files Changed**:
- `src/components/BigQueryDashboard.tsx` - Integrated KpiCard
- `src/layouts/main.astro` - Added DevLink CSS import
- `WEBFLOW_INTEGRATION_SUMMARY.md` - New comprehensive guide

#### 2. Metric Slot Assignment System
- **5 Slots Available**: Primary + Metric 1-4
- **Smart Assignment**: Automatic slot suggestions for new metrics
- **Visual Mapping**: Clear UI showing which metric appears where
- **No Duplicates**: Prevents assigning multiple metrics to same slot
- **Flexible Reordering**: Easy to change metric prominence

**Slot Types**:
- **Primary**: Large featured metric (main display)
- **Metric 1-4**: Four supporting metrics (smaller displays)

**UI Features**:
- Dropdown selector for each metric's slot
- Only shows available slots
- Clear labels: "Primary (Featured)", "Metric 1", etc.
- Default intelligent assignment for new metrics

**Files Changed**:
- `src/components/BigQueryConfig.tsx` - Added slot configuration UI
- `src/components/BigQueryDashboard.tsx` - Organized results by slot
- `src/components/DashboardApp.tsx` - Updated interfaces with slot property

#### 3. Persistent Connection State
- **Smart Reconnection**: Skip connection test if previously successful
- **Connection Memory**: Remembers successful connections in localStorage
- **Auto-advance**: Successful connection automatically goes to metrics screen
- **Better UX**: No need to re-test connection when reconfiguring

**Flow Improvements**:
- **Before**: Test connection required every time you returned to config
- **After**: If connection was successful, skip directly to metrics tab
- **Clear Config**: Option to reset and start fresh if needed

**Features**:
- Saves `connectionTested` flag with config
- Shows "Using saved credentials" message
- Auto-advances to metrics tab after successful test
- Maintains projectId from successful connection

**Files Changed**:
- `src/components/BigQueryConfig.tsx` - Added connection persistence logic

### 📝 New Documentation

#### WEBFLOW_INTEGRATION_SUMMARY.md
Comprehensive guide covering:
- Integration overview and benefits
- Configuration flow improvements
- Slot assignment system
- Usage guide for users and developers
- Troubleshooting
- Future enhancements
- Best practices

### 🔧 Technical Implementation

#### Component Structure

**BigQueryDashboard.tsx**
```tsx
<DevLinkProvider>
  <KpiCard
    // Primary Metric
    primaryMetricPrimaryMetricLabel="Total Revenue"
    primaryMetricPrimaryMetricText="$1,234,567"
    
    // Sub Metrics
    metric1SubMetricLabel="Active Users"
    metric1SubMetricText="15,234"
    
    metric2SubMetricLabel="Conversion Rate"
    metric2SubMetricText="3.2%"
    
    metric3SecondaryMetricLabel="Avg Order Value"
    metric3SubMetricText="$87.50"
    
    metric4SecondaryMetricLabel="Customer Lifetime Value"
    metric4MetricVarText="$1,245"
  />
</DevLinkProvider>
```

**Key Features**:
- Maps query results to KpiCard props based on slot assignment
- Handles missing metrics gracefully (shows "—")
- Supports error states with dedicated cards
- Maintains cache information display

#### Interface Updates

**MetricConfig (Updated)**
```typescript
interface MetricConfig {
  id: string;
  name: string;
  tableName: string;
  query: string;
  variables?: QueryVariable[];
  slot?: 'primary' | 'metric1' | 'metric2' | 'metric3' | 'metric4';  // NEW
}
```

#### Helper Functions

**getAvailableSlots()**
```typescript
// Prevents duplicate slot assignments
// Returns only slots not used by other metrics
const getAvailableSlots = (currentMetricId: string) => {
  const usedSlots = new Set(
    metrics
      .filter(m => m.id !== currentMetricId)
      .map(m => m.slot)
      .filter(Boolean)
  );
  
  return (['primary', 'metric1', 'metric2', 'metric3', 'metric4'] as const)
    .filter(slot => !usedSlots.has(slot));
};
```

### 🐛 Bug Fixes

1. **Missing DevLink CSS**
   - Fixed: Added `import '../site-components/global.css'` to layout
   - Impact: KpiCard now renders with correct styling

2. **Type Errors in Dashboard**
   - Fixed: Added proper TypeScript interfaces for API responses
   - Added `QueryResponse` interface
   - All type checks now pass ✅

3. **Prop Mismatch in DashboardApp**
   - Fixed: Changed `onBack` to `onReconfigure` to match interface
   - Consistent naming across components

### 🎯 Migration Guide

#### Automatic Migration
- **No Breaking Changes**: Existing configurations continue to work
- **Default Slots**: Metrics without slots get auto-assigned to available slots
- **Backward Compatible**: Old configs load and auto-upgrade with slots

#### For Users with Existing Dashboards
1. Open your dashboard
2. Click "⚙️ Reconfigure"
3. Go to Metrics tab
4. Notice each metric now has a "Dashboard Slot" dropdown
5. Adjust slot assignments as desired
6. Save configuration

The dashboard will now use the Webflow KpiCard with your chosen layout!

### 📊 Examples

#### Slot Assignment Best Practices

**Financial Dashboard**
- **Primary**: Total Revenue (most important)
- **Metric 1**: New Customers
- **Metric 2**: Average Order Value
- **Metric 3**: Conversion Rate
- **Metric 4**: Customer Lifetime Value

**Analytics Dashboard**
- **Primary**: Total Page Views (main KPI)
- **Metric 1**: Unique Visitors
- **Metric 2**: Avg Session Duration
- **Metric 3**: Bounce Rate
- **Metric 4**: Goal Completions

**Operations Dashboard**
- **Primary**: Active Orders (current status)
- **Metric 1**: Pending Shipments
- **Metric 2**: Customer Tickets
- **Metric 3**: Avg Resolution Time
- **Metric 4**: Team Members Online

### 🚀 Performance

- **No Performance Impact**: KpiCard is statically rendered
- **Efficient Rendering**: DevLinkProvider adds minimal overhead
- **Same Cache Strategy**: 24-hour cache still applies
- **Optimized Queries**: No changes to query execution

### 🔐 Security

- **No Security Changes**: Same security model as v2.0
- **Client-side Only**: Credentials still stored in localStorage
- **No Server Storage**: No credential storage on server
- **DevLink Components**: Rendered client-side with DevLinkProvider

### 🎨 UI Improvements

1. **Professional Design**: Webflow's KpiCard provides polished, modern UI
2. **Responsive Layout**: KpiCard adapts to different screen sizes
3. **Consistent Styling**: Matches site design system automatically
4. **Clear Hierarchy**: Primary metric visually prominent
5. **Better Labels**: Slot assignment makes metric placement clear

### 🔮 Future Enhancements

#### Potential Features
1. **Drag & Drop Slots**: Visual reordering interface
2. **Chart Integration**: Use KpiCard's chart slots
3. **Custom Formatting**: Per-metric number formatting
4. **Conditional Coloring**: Threshold-based styling
5. **Trend Indicators**: Period-over-period comparisons
6. **More Webflow Components**: 
   - Navigation cards
   - Button components  
   - Tag components
   - Meta components

#### Advanced Capabilities
- Multi-dashboard support
- Dashboard templates
- Export/import configurations
- Scheduled snapshots
- Alert notifications
- Team sharing

---

## v2.0.0 - Enhanced Configuration & Variables (2024)

### 🎉 Major Features

#### 1. Persistent Configuration
- **localStorage Integration**: All configuration (credentials, metrics, variables) now persists in browser
- **Auto-reload**: Configuration automatically loads on page refresh
- **Clear Config Button**: Easy way to reset all saved data
- **No Re-entry Required**: Credentials survive errors and page refreshes

**Files Changed**:
- `src/components/BigQueryConfig.tsx` - Added localStorage save/load logic
- `src/components/DashboardApp.tsx` - Updated config interface

#### 2. Data Location Configuration
- **Location Selector**: Dropdown with all BigQuery regions
- **Multi-region Support**: US, EU, and all regional locations
- **Error Prevention**: Fixes "location mismatch" errors
- **25+ Locations**: Americas, Europe, Asia-Pacific regions

**Locations Added**:
- Multi-region: US, EU
- Americas: us-central1, us-east1, us-east4, us-west1-4, northamerica-northeast1, southamerica-east1
- Europe: europe-north1, europe-west1-4, europe-west6
- Asia: asia-east1-2, asia-northeast1-3, asia-south1, asia-southeast1-2, australia-southeast1

**Files Changed**:
- `src/components/BigQueryConfig.tsx` - Added location dropdown
- `src/lib/bigquery-client.ts` - Added location parameter
- `src/pages/api/bigquery/test-connection.ts` - Pass location to client
- `src/pages/api/bigquery/execute-query.ts` - Pass location to client

#### 3. Dynamic Query Variables
- **Variable System**: Support for date, string, and number variables
- **Testing UI**: "Set Variables" dialog for adjusting parameters
- **Default Values**: Pre-fill variables with sensible defaults
- **Production Ready**: Variables work in both test and production modes

**Variable Types**:
- `date` - Date fields (YYYY-MM-DD)
- `string` - Text values
- `number` - Numeric values

**Features**:
- Define variables in metric configuration
- Use `@variable_name` in SQL queries
- Adjust variables via UI dialog
- Variables included in cache key

**Files Changed**:
- `src/components/BigQueryConfig.tsx` - Added variable configuration UI
- `src/components/BigQueryDashboard.tsx` - Added "Set Variables" dialog
- `src/pages/api/bigquery/execute-query.ts` - Added variable parameter support
- `src/lib/bigquery-client.ts` - Added query parameter support

### 📝 Documentation

#### New Files
- `VARIABLE_CONFIGURATION.md` - Comprehensive guide on using variables
- `WEBFLOW_COMPLETE_GUIDE.md` - Complete Webflow integration guide (from learning notes)

#### Updated Files
- `README.md` - Added v2.0 features, variable examples, updated troubleshooting
- `CHANGELOG.md` - This file

---

## v1.0.0 - Initial Release

### Features
- BigQuery connection with service accounts
- Multi-metric configuration
- 24-hour cache (7am PST reset)
- Demo mode
- Query result preview
- Manual refresh
- Basic security with client-side credentials

---

**Last Updated**: February 18, 2026  
**Current Version**: v2.1.0  
**Status**: ✅ Production Ready with Webflow Integration
