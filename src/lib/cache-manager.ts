/**
 * @deprecated This in-memory cache is no longer used.
 * 
 * Caching is now handled by D1 database (metric_cache table).
 * See:
 * - /api/admin/refresh-cache - Populate cache from BigQuery
 * - /api/client/metrics - Read from cache (falls back to BigQuery if cache miss)
 * - /api/admin/clear-cache - Clear all cached data
 * 
 * Benefits of D1 cache:
 * - Persistent across worker restarts
 * - Shared across all worker instances
 * - Supports calculated metrics (e.g., ADR = revenue / rooms)
 * - Expires at 7am PST daily (aligned with data processing)
 */

// Cache manager with 24-hour TTL and 7am PST reset point
// Data is processed once daily at 6am, so we cache until 7am the next day

interface CacheEntry {
  data: any[];
  timestamp: number;
  expiresAt: number; // Exact expiration timestamp
}

class CacheManager {
  private cache: Map<string, CacheEntry> = new Map();

  /**
   * Get the next 7am PST timestamp
   * This is when the cache should reset since data is processed at 6am PST
   */
  private getNext7amPST(): number {
    const now = new Date();
    
    // Convert current time to PST (UTC-8 or UTC-7 for PDT)
    // For simplicity, we'll use UTC-8 (PST) consistently
    const pstOffset = -8 * 60; // PST is UTC-8
    const nowPST = new Date(now.getTime() + (now.getTimezoneOffset() + pstOffset) * 60000);
    
    // Set to 7am PST today
    const target = new Date(nowPST);
    target.setHours(7, 0, 0, 0);
    
    // If we're past 7am PST today, move to tomorrow
    if (nowPST >= target) {
      target.setDate(target.getDate() + 1);
    }
    
    // Convert back to UTC timestamp
    const targetUTC = target.getTime() - (target.getTimezoneOffset() + pstOffset) * 60000;
    
    return targetUTC;
  }

  /**
   * Set cache entry with expiration at 7am PST
   */
  set(key: string, data: any[], customExpiresAt?: number): void {
    const expiresAt = customExpiresAt || this.getNext7amPST();
    
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      expiresAt,
    });
    
    // Log cache info for debugging
    const hoursUntilExpiry = (expiresAt - Date.now()) / (1000 * 60 * 60);
    console.log(`[Cache] Set key "${key}" - expires in ${hoursUntilExpiry.toFixed(1)} hours (at 7am PST)`);
  }

  /**
   * Get cached data if not expired
   */
  get(key: string): any[] | null {
    const entry = this.cache.get(key);
    
    if (!entry) {
      return null;
    }

    const now = Date.now();
    const isExpired = now >= entry.expiresAt;
    
    if (isExpired) {
      this.cache.delete(key);
      console.log(`[Cache] Key "${key}" expired - clearing cache`);
      return null;
    }

    const hoursUntilExpiry = (entry.expiresAt - now) / (1000 * 60 * 60);
    console.log(`[Cache] Hit for "${key}" - expires in ${hoursUntilExpiry.toFixed(1)} hours`);
    
    return entry.data;
  }

  /**
   * Check if key exists and is not expired
   */
  has(key: string): boolean {
    const data = this.get(key);
    return data !== null;
  }

  /**
   * Clear all cache
   */
  clear(): void {
    this.cache.clear();
    console.log('[Cache] All cache cleared');
  }

  /**
   * Delete specific cache entry
   */
  delete(key: string): void {
    this.cache.delete(key);
    console.log(`[Cache] Deleted key "${key}"`);
  }

  /**
   * Get cache key based on metric name and query
   */
  getCacheKey(metricName: string, query: string): string {
    return `${metricName}:${this.hashString(query)}`;
  }

  /**
   * Simple string hash function
   */
  private hashString(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return hash.toString(36);
  }

  /**
   * Get cache statistics
   */
  getStats(): {
    totalEntries: number;
    entries: Array<{
      key: string;
      age: string;
      expiresIn: string;
    }>;
  } {
    const now = Date.now();
    const entries: Array<{ key: string; age: string; expiresIn: string }> = [];
    
    for (const [key, entry] of this.cache.entries()) {
      const ageMs = now - entry.timestamp;
      const expiresInMs = entry.expiresAt - now;
      
      entries.push({
        key,
        age: this.formatDuration(ageMs),
        expiresIn: expiresInMs > 0 ? this.formatDuration(expiresInMs) : 'expired',
      });
    }
    
    return {
      totalEntries: this.cache.size,
      entries,
    };
  }

  /**
   * Format milliseconds to human-readable duration
   */
  private formatDuration(ms: number): string {
    const hours = Math.floor(ms / (1000 * 60 * 60));
    const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  }
}

export const cacheManager = new CacheManager();

