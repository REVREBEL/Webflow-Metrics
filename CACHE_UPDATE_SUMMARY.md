# Cache Update Summary - 24-Hour Daily Reset

## Overview
Updated the BigQuery Dashboard caching system to use a 24-hour cache period with automatic reset at 7am PST, aligned with the daily data processing schedule at 6am PST.

## Changes Made

### 1. Cache Manager (`src/lib/cache-manager.ts`)
**Key Updates:**
- Changed from 5-minute TTL to 24-hour cache with 7am PST reset
- Added `getNext7amPST()` method to calculate the next 7am PST timestamp
- Cache entries now expire at 7am PST regardless of when they were created
- Improved logging to show hours until expiration
- Cache persists across the day since data only updates once at 6am

**Time Zone Handling:**
```typescript
// Calculates next 7am PST (UTC-8)
// If current time is before 7am PST: expires today at 7am
// If current time is after 7am PST: expires tomorrow at 7am
```

### 2. Execute Query API (`src/pages/api/bigquery/execute-query.ts`)
**Key Updates:**
- Removed custom `cacheTTL` parameter
- All cache entries now use the 7am PST reset automatically
- Added better cache info messages in API responses
- Returns `cacheInfo` field indicating cache expiration policy

### 3. Dashboard Component (`src/components/BigQueryDashboard.tsx`)
**Key Updates:**
- Displays cache status with 📦 emoji for cached data
- Shows "Cache expires: 7am PST" message for cached metrics
- Updated alert to explain the 24-hour cache policy
- Removed cache TTL configuration from UI

### 4. Fixed Tailwind CSS Error
**Issue:**
- Tailwind CSS was trying to process `site-components/global.css` causing parse errors
- Stack trace: "Unexpected semicolon" in Webflow-generated CSS

**Solution:**
- Imported `site-components/global.css` directly in React component
- Removed problematic link tag from layout
- Added Vite plugin to skip Tailwind processing for Webflow CSS (preventive)

## Cache Behavior

### Daily Schedule
```
6:00 AM PST - Data processing completes in BigQuery
7:00 AM PST - Cache expires, next query will fetch fresh data
7:01 AM PST - First query of the day caches data until 7am next day
```

### Cache Lifecycle Example
1. **Monday 8:00 AM**: User queries metric → Data cached until Tuesday 7am
2. **Monday 3:00 PM**: User queries again → Returns cached data (no BigQuery cost)
3. **Tuesday 7:01 AM**: Cache expires, new query fetches fresh data
4. **Tuesday 9:00 AM**: Returns cached data from 7:01 AM query

### Benefits
1. **Cost Optimization**: Only 1 BigQuery query per metric per day (max)
2. **Performance**: Instant responses from cache throughout the day
3. **Predictable**: Cache reset aligns with data processing schedule
4. **Simple**: No manual cache management needed

## User Experience

### Cache Indicators
- 📦 **Cached** badge on metrics using cached data
- 🔴 **Live** badge on metrics with fresh data
- Timestamp showing when data was last updated
- "Cache expires: 7am PST" message

### Manual Refresh
- "Refresh All" button bypasses cache and fetches fresh data
- Useful for testing or verifying data
- New data is cached until next 7am PST

## Configuration

No configuration needed! Cache automatically:
- Resets at 7am PST every day
- Handles timezone conversions
- Clears expired entries on access

## Testing

To test the cache behavior:
1. **Demo Mode**: Use sample data to see cache indicators
2. **Live Mode**: Query metrics multiple times - second query should show "📦 Cached"
3. **Force Refresh**: Click "Refresh All" to bypass cache
4. **Time Test**: Cache will reset at 7am PST (can be verified in logs)

## Logging

Cache operations are logged to console:
```
[Cache] Set key "metric-name:hash" - expires in 23.5 hours (at 7am PST)
[Cache] Hit for "metric-name:hash" - expires in 18.2 hours
[Cache] Key "metric-name:hash" expired - clearing cache
```

## Security & Privacy

- Service account credentials are NEVER cached
- Only query results are cached
- Cache is in-memory (cleared on server restart)
- No sensitive data persists on disk

## Next Steps

Consider adding:
1. Persistent cache using Cloudflare KV (survives restarts)
2. Cache warming at 7:01 AM PST (pre-populate dashboard)
3. Cache statistics dashboard (hit rate, size, age)
4. Manual cache clear button for admins
