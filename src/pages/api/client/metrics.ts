import type { APIRoute } from 'astro';
import { decrypt } from '../../../lib/encryption';
import { createBigQueryClient } from '../../../lib/bigquery-rest-client';

const headers = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    const env = (locals as any).runtime?.env;
    const db = env?.DB;

    if (!db) {
      return new Response(
        JSON.stringify({ error: 'Database not configured' }),
        { status: 500, headers }
      );
    }

    const body = await request.json() as {
      hotel_code: string;
      year: number;
      month: number;
      force_refresh?: boolean;
    };
    const { hotel_code, year, month, force_refresh } = body;

    if (!hotel_code || !year || !month) {
      return new Response(
        JSON.stringify({ error: 'hotel_code, year, and month are required' }),
        { status: 400, headers }
      );
    }

    const nowTimestamp = Math.floor(Date.now() / 1000);

    // Check if cache table exists
    let cacheTableExists = false;
    try {
      await db.prepare('SELECT 1 FROM metric_cache LIMIT 1').all();
      cacheTableExists = true;
    } catch (e) {
      console.log('[Cache] Cache table does not exist yet');
    }

    if (!cacheTableExists) {
      return new Response(
        JSON.stringify({ 
          metrics: [],
          error: 'Cache not initialized. Please run cache migration in Admin Panel → Cache tab.',
          requiresMigration: true
        }),
        { status: 200, headers }
      );
    }

    // Check cache first (unless force_refresh is true)
    if (!force_refresh) {
      const cachedMetrics = await db
        .prepare(`
          SELECT metric_name, value, cached_at, expires_at
          FROM metric_cache
          WHERE hotel_code = ? 
            AND year = ? 
            AND month = ?
            AND expires_at > ?
          ORDER BY metric_name
        `)
        .bind(hotel_code, year, month, nowTimestamp)
        .all();

      if (cachedMetrics.results && cachedMetrics.results.length > 0) {
        console.log(`[Cache] Serving ${cachedMetrics.results.length} metrics from cache for ${hotel_code}`);
        
        const metrics = (cachedMetrics.results as any[]).map(m => ({
          metric_name: m.metric_name,
          value: m.value,
          success: true,
          cached: true,
          cached_at: m.cached_at,
          expires_at: m.expires_at
        }));

        return new Response(
          JSON.stringify({ metrics }),
          { status: 200, headers }
        );
      }
    }

    // Cache miss - return empty with helpful message
    console.log(`[Cache] Cache miss for ${hotel_code} ${year}-${month}`);
    
    return new Response(
      JSON.stringify({ 
        metrics: [],
        message: 'No cached data found. Please refresh cache in Admin Panel → Cache tab.',
        requiresRefresh: true
      }),
      { status: 200, headers }
    );

  } catch (error: any) {
    console.error('Error fetching metrics:', error);
    return new Response(
      JSON.stringify({ 
        metrics: [],
        error: error.message 
      }),
      { status: 500, headers }
    );
  }
};

export const OPTIONS: APIRoute = async () => {
  return new Response(null, {
    status: 204,
    headers,
  });
};












