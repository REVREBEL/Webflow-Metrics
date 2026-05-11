import type { APIRoute } from 'astro';
import { decrypt } from '../../../lib/encryption';
import { createBigQueryClient } from '../../../lib/bigquery-rest-client';

const headers = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

/**
 * Calculate next 7am PST timestamp for cache expiration
 */
function getNext7amPST(): number {
  const now = new Date();
  const pstOffset = -8 * 60; // PST is UTC-8
  const nowPST = new Date(now.getTime() + (now.getTimezoneOffset() + pstOffset) * 60000);
  
  const target = new Date(nowPST);
  target.setHours(7, 0, 0, 0);
  
  if (nowPST >= target) {
    target.setDate(target.getDate() + 1);
  }
  
  const targetUTC = target.getTime() - (target.getTimezoneOffset() + pstOffset) * 60000;
  return Math.floor(targetUTC / 1000); // Return Unix timestamp in seconds
}

/**
 * Hash a query string to detect changes (using Web Crypto API)
 */
async function hashQuery(query: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(query);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex.substring(0, 16);
}

export const POST: APIRoute = async ({ request, locals }) => {
  console.log('[Cache Refresh] Handler called');
  console.log('[Cache Refresh] Locals:', JSON.stringify(Object.keys(locals || {})));
  console.log('[Cache Refresh] Runtime:', JSON.stringify(Object.keys((locals as any)?.runtime || {})));
  console.log('[Cache Refresh] Env:', JSON.stringify(Object.keys((locals as any)?.runtime?.env || {})));
  
  // Outer try-catch to prevent any HTML error responses
  try {
    try {
      const env = (locals as any).runtime?.env;
      const db = env?.DB;

      console.log('[Cache Refresh] Env check:', { hasEnv: !!env, hasDB: !!db, dbType: typeof db });

      if (!env) {
        console.error('[Cache Refresh] No environment available');
        return new Response(
          JSON.stringify({ error: 'Environment not configured. Make sure the app is properly deployed.' }),
          { status: 500, headers }
        );
      }

      if (!db) {
        console.error('[Cache Refresh] No database available');
        return new Response(
          JSON.stringify({ error: 'Database not configured. Make sure D1 bindings are set up in Webflow Cloud.' }),
          { status: 500, headers }
        );
      }

      const body = await request.json() as {
        hotel_code?: string;
        year?: number;
        month?: number;
      };

      const { hotel_code, year, month } = body;

      // If no params provided, refresh all hotels for current month
      const hotelsToRefresh = hotel_code 
        ? [hotel_code] 
        : (await db.prepare('SELECT hotel_code FROM hotels').all()).results.map((h: any) => h.hotel_code);

      const now = new Date();
      const yearToRefresh = year || now.getFullYear();
      const monthToRefresh = month || (now.getMonth() + 1);

      let totalCached = 0;
      let totalCalculated = 0;
      const errors: string[] = [];

      for (const hotelCode of hotelsToRefresh) {
        try {
          // Fetch hotel configuration
          const hotel = await db
            .prepare('SELECT * FROM hotels WHERE hotel_code = ?')
            .bind(hotelCode)
            .first() as any;

          if (!hotel) {
            errors.push(`Hotel ${hotelCode} not found`);
            continue;
          }

          // Fetch all query templates
          const templatesResult = await db
            .prepare(`
              SELECT 
                t.*,
                bt.full_table_path
              FROM query_templates_v2 t
              LEFT JOIN bigquery_tables bt ON t.table_id = bt.id
              ORDER BY t.template_name
            `)
            .all();

          if (!templatesResult.results || templatesResult.results.length === 0) {
            continue;
          }

          const templates = (templatesResult.results as any[]).map((t: any) => ({
            ...t,
            group_by_columns: t.group_by_columns ? JSON.parse(t.group_by_columns) : null,
            filters: t.filters ? JSON.parse(t.filters) : null,
          }));

          // Decrypt credentials and initialize BigQuery REST client
          const serviceAccountJson = await decrypt(hotel.service_account_json, env);

          const bigquery = createBigQueryClient(hotel.project_id, serviceAccountJson);

          // Calculate date range
          const startDate = `${yearToRefresh}-${String(monthToRefresh).padStart(2, '0')}-01`;
          const lastDay = new Date(yearToRefresh, monthToRefresh, 0).getDate();
          const endDate = `${yearToRefresh}-${String(monthToRefresh).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;

          // Build query function (same as metrics endpoint)
          const buildQuery = (template: any): string => {
            if (template.use_custom_sql) {
              let query = template.custom_sql;
              query = query
                .replace(/\{\{hotel_code\}\}/g, hotelCode)
                .replace(/\{\{project_id\}\}/g, hotel.project_id)
                .replace(/\{\{dataset_id\}\}/g, hotel.dataset_id || '')
                .replace(/\{\{table_id\}\}/g, hotel.table_id || '')
                .replace(/\{\{start_date\}\}/g, startDate)
                .replace(/\{\{end_date\}\}/g, endDate)
                .replace(/\{\{year\}\}/g, String(yearToRefresh))
                .replace(/\{\{month\}\}/g, String(monthToRefresh));
              return query;
            }

            const agg = template.aggregation_type || 'COUNT';
            const aggCol = template.aggregation_column || '*';
            const tablePath = template.full_table_path;

            let selectClause = '';
            if (template.group_by_columns && template.group_by_columns.length > 0) {
              const groupCols = template.group_by_columns.join(', ');
              selectClause = `${groupCols}, ${agg}(${aggCol}) as value`;
            } else {
              selectClause = `${agg}(${aggCol}) as value`;
            }

            let query = `SELECT ${selectClause}\nFROM \`${tablePath}\``;

            const whereClauses: string[] = [];
            
            if (!template.use_custom_sql) {
              whereClauses.push(`property_code = '${hotelCode}'`);
            }

            if (!template.use_custom_sql && template.filters && template.filters.length > 0) {
              template.filters.forEach((filter: any) => {
                const column = filter.column;
                const operator = filter.operator;
                const value = filter.value;

                let filterValue = value
                  .replace(/\{\{hotel_code\}\}/g, hotelCode)
                  .replace(/\{\{project_id\}\}/g, hotel.project_id)
                  .replace(/\{\{dataset_id\}\}/g, hotel.dataset_id || '')
                  .replace(/\{\{table_id\}\}/g, hotel.table_id || '')
                  .replace(/\{\{start_date\}\}/g, startDate)
                  .replace(/\{\{end_date\}\}/g, endDate)
                  .replace(/\{\{year\}\}/g, String(yearToRefresh))
                  .replace(/\{\{month\}\}/g, String(monthToRefresh));

                if (operator === 'BETWEEN') {
                  const [start, end] = filterValue.split(' AND ');
                  whereClauses.push(`${column} BETWEEN '${start.trim()}' AND '${end.trim()}'`);
                } else if (operator === 'IN') {
                  whereClauses.push(`${column} IN (${filterValue})`);
                } else if (operator === 'IS NULL' || operator === 'IS NOT NULL') {
                  whereClauses.push(`${column} ${operator}`);
                } else {
                  whereClauses.push(`${column} ${operator} '${filterValue}'`);
                }
              });
            }

            if (whereClauses.length > 0) {
              query += `\nWHERE ${whereClauses.join('\n  AND ')}`;
            }

            if (template.group_by_columns && template.group_by_columns.length > 0) {
              query += `\nGROUP BY ${template.group_by_columns.join(', ')}`;
            }

            return query;
          };

          // Execute queries and cache results
          const expiresAt = getNext7amPST();
          const cachedAt = Math.floor(Date.now() / 1000);

          for (const template of templates) {
            try {
              const query = buildQuery(template);
              const queryHash = await hashQuery(query);

              console.log(`[Cache] Executing query for ${hotelCode} - ${template.metric_name}`);

              const rows = await bigquery.query({
                query,
                location: hotel.data_location || 'US',
                timeoutMs: 30000,
              });

              let value = null;
              if (rows && rows.length > 0) {
                const firstRow = rows[0];
                if ('value' in firstRow) {
                  value = firstRow.value;
                } else {
                  const keys = Object.keys(firstRow);
                  const valueKey = keys.find(k => 
                    !['date', 'month', 'year', 'day', 'property_code', 'segment', 'category'].includes(k.toLowerCase())
                  );
                  if (valueKey) {
                    value = firstRow[valueKey];
                  } else if (keys.length > 0) {
                    value = firstRow[keys[0]];
                  }
                }
              }

              // Store in cache
              await db
                .prepare(`
                  INSERT INTO metric_cache (hotel_code, year, month, metric_name, value, cached_at, expires_at, query_hash)
                  VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                  ON CONFLICT(hotel_code, year, month, metric_name) 
                  DO UPDATE SET value = excluded.value, cached_at = excluded.cached_at, expires_at = excluded.expires_at, query_hash = excluded.query_hash
                `)
                .bind(hotelCode, yearToRefresh, monthToRefresh, template.metric_name, value, cachedAt, expiresAt, queryHash)
                .run();

              totalCached++;
            } catch (error: any) {
              errors.push(`${hotelCode} - ${template.metric_name}: ${error.message}`);
            }
          }

          // Now run calculations
          const calculationsResult = await db
            .prepare('SELECT * FROM calculations ORDER BY display_order')
            .all();

          if (calculationsResult.results && calculationsResult.results.length > 0) {
            for (const calc of calculationsResult.results as any[]) {
              try {
                const formula = JSON.parse(calc.formula);
                
                if (formula.type === 'divide') {
                  // Fetch numerator and denominator from cache
                  const numerator = await db
                    .prepare('SELECT value FROM metric_cache WHERE hotel_code = ? AND year = ? AND month = ? AND metric_name = ?')
                    .bind(hotelCode, yearToRefresh, monthToRefresh, formula.numerator)
                    .first() as any;

                  const denominator = await db
                    .prepare('SELECT value FROM metric_cache WHERE hotel_code = ? AND year = ? AND month = ? AND metric_name = ?')
                    .bind(hotelCode, yearToRefresh, monthToRefresh, formula.denominator)
                    .first() as any;

                  if (numerator && denominator && denominator.value && denominator.value !== 0) {
                    const calculatedValue = numerator.value / denominator.value;

                    // Store calculated metric
                    await db
                      .prepare(`
                        INSERT INTO metric_cache (hotel_code, year, month, metric_name, value, cached_at, expires_at, query_hash)
                        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                        ON CONFLICT(hotel_code, year, month, metric_name) 
                        DO UPDATE SET value = excluded.value, cached_at = excluded.cached_at, expires_at = excluded.expires_at
                      `)
                      .bind(hotelCode, yearToRefresh, monthToRefresh, calc.display_name, calculatedValue, cachedAt, expiresAt, 'calculated')
                      .run();

                    totalCalculated++;
                  }
                }
              } catch (error: any) {
                errors.push(`${hotelCode} - ${calc.display_name}: ${error.message}`);
              }
            }
          }

        } catch (error: any) {
          errors.push(`${hotelCode}: ${error.message}`);
        }
      }

      return new Response(
        JSON.stringify({
          success: true,
          cached: totalCached,
          calculated: totalCalculated,
          hotels: hotelsToRefresh.length,
          errors: errors.length > 0 ? errors : undefined
        }),
        { status: 200, headers }
      );
    } catch (error: any) {
      console.error('Cache refresh error:', error);
      return new Response(
        JSON.stringify({ error: error.message || 'Unknown error occurred' }),
        { status: 500, headers }
      );
    }
  } catch (outerError: any) {
    // Absolute fallback - ensure we always return JSON
    console.error('Critical cache refresh error:', outerError);
    return new Response(
      JSON.stringify({ error: 'Critical error: ' + (outerError.message || 'Unknown error') }),
      { status: 500, headers }
    );
  }
};

export const OPTIONS: APIRoute = async () => {
  return new Response(null, { status: 204, headers });
};







