import type { APIRoute } from 'astro';
import { BigQuery } from '@google-cloud/bigquery';

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    const env = (locals as any).runtime?.env;
    const db = env?.DB;

    const body = await request.json() as {
      hotel_code: string;
      query: string;
      variables?: Array<{ name: string; value: any }>;
      metricName: string;
      useCache?: boolean;
    };
    const { hotel_code, query, variables = [], metricName, useCache = true } = body;

    console.log('Execute query request:', { hotel_code, metricName, variablesCount: variables?.length, useCache });

    if (!hotel_code || !query || !metricName) {
      return new Response(
        JSON.stringify({ error: 'hotel_code, query, and metricName are required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (!db) {
      return new Response(
        JSON.stringify({ error: 'Database not configured' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Fetch hotel credentials from database
    const hotel = await db
      .prepare('SELECT project_id, data_location, service_account_json FROM hotels WHERE hotel_code = ?')
      .bind(hotel_code)
      .first();

    if (!hotel) {
      return new Response(
        JSON.stringify({ error: `Hotel not found: ${hotel_code}` }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Decrypt credentials
    const serviceAccountJson = hotel.service_account_json;
    const credentials = JSON.parse(serviceAccountJson);

    // Check cache if enabled
    if (useCache && db) {
      const cacheKey = `${hotel_code}:${metricName}`;
      const cached = await db
        .prepare('SELECT value, cached_at FROM query_cache WHERE cache_key = ? AND datetime(cached_at, \'+1 hour\') > datetime(\'now\')')
        .bind(cacheKey)
        .first();

      if (cached) {
        console.log('Returning cached result for:', cacheKey);
        return new Response(
          JSON.stringify({ 
            value: cached.value,
            cached: true,
            cached_at: cached.cached_at
          }),
          { status: 200, headers: { 'Content-Type': 'application/json' } }
        );
      }
    }

    // Initialize BigQuery client
    const bigquery = new BigQuery({
      projectId: hotel.project_id,
      credentials,
    });

    // Build params object from variables array
    const params: Record<string, any> = {};
    if (Array.isArray(variables)) {
      variables.forEach((variable: { name: string; value: any }) => {
        if (variable.name && variable.value !== undefined) {
          params[variable.name] = variable.value;
        }
      });
    }

    console.log('Executing query with params:', params);

    // Execute query
    const [rows] = await bigquery.query({
      query,
      params,
      location: hotel.data_location || 'US',
    });

    console.log('Query executed successfully, rows:', rows?.length);

    // Extract value from first row
    let value = null;
    if (rows && rows.length > 0) {
      const row = rows[0];
      value = row.value ?? row.total ?? row.count ?? row[Object.keys(row)[0]];
    }

    console.log('Extracted value:', value);

    // Cache the result if DB is available
    if (useCache && db) {
      const cacheKey = `${hotel_code}:${metricName}`;
      await db
        .prepare('INSERT OR REPLACE INTO query_cache (cache_key, value, cached_at) VALUES (?, ?, CURRENT_TIMESTAMP)')
        .bind(cacheKey, String(value))
        .run();
    }

    return new Response(
      JSON.stringify({ value, cached: false }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    console.error('Error executing query:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: error.toString()
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};



