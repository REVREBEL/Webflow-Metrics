import type { APIRoute } from 'astro';
import { createBigQueryClient } from '../../../../lib/bigquery-rest-client';
import { decrypt } from '../../../../lib/encryption';

// SECURITY: Restrictive CORS - only allow same-origin requests
const headers = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export const OPTIONS: APIRoute = async () => {
  return new Response(null, { status: 204, headers });
};

/**
 * Validate SQL query patterns for security
 * Only allow SELECT statements from expected datasets
 */
function validateQuerySecurity(query: string, hotel: any): { valid: boolean; error?: string } {
  const normalizedQuery = query.trim().toUpperCase();
  
  // 1. Must start with SELECT
  if (!normalizedQuery.startsWith('SELECT')) {
    return { valid: false, error: 'Only SELECT queries are allowed' };
  }
  
  // 2. No multi-statement queries (check for semicolons not in strings)
  const semicolonCount = (query.match(/;/g) || []).length;
  if (semicolonCount > 0) {
    return { valid: false, error: 'Multi-statement queries are not allowed' };
  }
  
  // 3. Blacklist dangerous keywords
  const dangerousKeywords = [
    'DROP', 'DELETE', 'INSERT', 'UPDATE', 'CREATE', 'ALTER', 
    'TRUNCATE', 'GRANT', 'REVOKE', 'EXEC', 'EXECUTE'
  ];
  
  for (const keyword of dangerousKeywords) {
    // Use word boundaries to avoid false positives
    const regex = new RegExp(`\\b${keyword}\\b`, 'i');
    if (regex.test(query)) {
      return { valid: false, error: `Keyword '${keyword}' is not allowed` };
    }
  }
  
  // 4. Must reference the hotel's project and dataset
  if (!query.includes(hotel.project_id)) {
    return { valid: false, error: 'Query must reference the configured project_id' };
  }
  
  if (hotel.dataset_id && !query.includes(hotel.dataset_id)) {
    return { valid: false, error: 'Query must reference the configured dataset_id' };
  }
  
  return { valid: true };
}

/**
 * Sanitize error messages to avoid leaking sensitive information
 */
function sanitizeError(error: any): string {
  const message = error.message || 'Unknown error';
  
  // Remove any potential credential information
  const sanitized = message
    .replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, '[EMAIL]')
    .replace(/\b[A-Za-z0-9+/]{40,}\b/g, '[KEY]')
    .replace(/\b\d{12,}\b/g, '[ID]');
  
  return sanitized;
}

/**
 * Validate a data template by testing it against BigQuery
 * This endpoint requires a hotel_code to get credentials for testing
 * 
 * SECURITY: This endpoint should be protected by authentication middleware
 */
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

    // TODO: Add authentication check here
    // const authHeader = request.headers.get('Authorization');
    // if (!authHeader || !isValidAdminToken(authHeader)) {
    //   return new Response(
    //     JSON.stringify({ error: 'Unauthorized' }),
    //     { status: 401, headers }
    //   );
    // }

    const body = await request.json() as {
      hotel_code: string;
      query_template: string;
      output_columns: string[];
      action?: 'validate' | 'save';
      template_name?: string;
      description?: string;
      template_id?: number;
    };

    const { 
      hotel_code, 
      query_template, 
      output_columns,
      action = 'validate',
      template_name,
      description,
      template_id
    } = body;

    if (!hotel_code || !query_template || !output_columns || output_columns.length === 0) {
      return new Response(
        JSON.stringify({ 
          error: 'hotel_code, query_template, and output_columns are required' 
        }),
        { status: 400, headers }
      );
    }

    // Get hotel configuration for testing
    const hotelResult = await db
      .prepare('SELECT * FROM hotels WHERE hotel_code = ?')
      .bind(hotel_code)
      .first();

    if (!hotelResult) {
      return new Response(
        JSON.stringify({ error: 'Hotel not found' }),
        { status: 404, headers }
      );
    }

    const hotel = hotelResult as any;

    // Build test query with sample parameters BEFORE security validation
    const testQuery = buildTestQuery(query_template, hotel);

    // SECURITY: Validate query before execution
    const securityCheck = validateQuerySecurity(testQuery, hotel);
    if (!securityCheck.valid) {
      return new Response(
        JSON.stringify({ 
          valid: false,
          error: 'Query security validation failed',
          details: securityCheck.error
        }),
        { status: 400, headers }
      );
    }

    // Decrypt service account - FIXED: Pass env object instead of string
    if (!env?.ENCRYPTION_KEY) {
      return new Response(
        JSON.stringify({ error: 'Encryption key not configured' }),
        { status: 500, headers }
      );
    }

    const serviceAccountJson = await decrypt(hotel.service_account_json, env);

    // Initialize BigQuery REST client (Cloudflare Workers compatible)
    const bigquery = createBigQueryClient(hotel.project_id, serviceAccountJson);

    // Execute query with LIMIT 1 to test structure
    const validationQuery = `${testQuery} LIMIT 1`;
    
    let queryResult;
    try {
      // Execute query with timeout and byte limit
      queryResult = await bigquery.query({
        query: validationQuery,
        location: hotel.data_location || 'US',
        maximumBytesBilled: '100000000', // 100MB limit
        timeoutMs: 30000, // 30 second timeout
      });
    } catch (error: any) {
      // SECURITY: Sanitize error messages
      return new Response(
        JSON.stringify({ 
          valid: false,
          error: 'Query execution failed',
          details: sanitizeError(error)
        }),
        { status: 400, headers }
      );
    }

    // Get the actual columns returned by the query
    const actualColumns = queryResult.length > 0 
      ? Object.keys(queryResult[0])
      : [];

    // Check if declared columns match actual columns
    const missingColumns = output_columns.filter(col => !actualColumns.includes(col));
    const extraColumns = actualColumns.filter(col => !output_columns.includes(col));

    const isValid = missingColumns.length === 0 && extraColumns.length === 0;

    // SECURITY: Don't return full query text or raw sample data to unauthorized callers
    // Only return column structure information
    const validationResult = {
      valid: isValid,
      declaredColumns: output_columns,
      actualColumns,
      missingColumns,
      extraColumns,
      // Only return column names and types, not actual data
      columnTypes: queryResult.length > 0 
        ? Object.entries(queryResult[0]).reduce((acc, [key, value]) => {
            acc[key] = typeof value;
            return acc;
          }, {} as Record<string, string>)
        : {},
      message: isValid 
        ? 'Query validation successful! All columns match.'
        : 'Column mismatch detected. Please review the differences below.'
    };

    // If action is 'save' and validation passed, save the template
    if (action === 'save' && isValid) {
      if (!template_name) {
        return new Response(
          JSON.stringify({ error: 'template_name is required for save action' }),
          { status: 400, headers }
        );
      }

      if (template_id) {
        // Update existing template
        await db
          .prepare(
            `UPDATE data_templates SET
              template_name = ?,
              description = ?,
              query_template = ?,
              output_columns = ?,
              updated_at = datetime('now')
            WHERE id = ?`
          )
          .bind(
            template_name,
            description || null,
            query_template,
            JSON.stringify(output_columns),
            template_id
          )
          .run();

        const updated = await db
          .prepare('SELECT * FROM data_templates WHERE id = ?')
          .bind(template_id)
          .first();

        return new Response(
          JSON.stringify({
            ...validationResult,
            saved: true,
            template: {
              ...updated,
              output_columns: JSON.parse((updated as any).output_columns)
            }
          }),
          { status: 200, headers }
        );
      } else {
        // Create new template
        const result = await db
          .prepare(
            `INSERT INTO data_templates (
              template_name,
              description,
              query_template,
              output_columns,
              created_at,
              updated_at
            ) VALUES (?, ?, ?, ?, datetime('now'), datetime('now'))`
          )
          .bind(
            template_name,
            description || null,
            query_template,
            JSON.stringify(output_columns)
          )
          .run();

        const created = await db
          .prepare('SELECT * FROM data_templates WHERE id = ?')
          .bind(result.meta.last_row_id)
          .first();

        return new Response(
          JSON.stringify({
            ...validationResult,
            saved: true,
            template: {
              ...created,
              output_columns: JSON.parse((created as any).output_columns)
            }
          }),
          { status: 201, headers }
        );
      }
    }

    // Just return validation results
    return new Response(
      JSON.stringify(validationResult),
      { status: isValid ? 200 : 400, headers }
    );

  } catch (error: any) {
    console.error('Template validation error:', error);
    // SECURITY: Sanitize error messages in production
    return new Response(
      JSON.stringify({ 
        valid: false,
        error: 'Internal server error',
        details: sanitizeError(error)
      }),
      { status: 500, headers }
    );
  }
};

function buildTestQuery(template: string, hotel: any): string {
  let query = template;

  // Replace placeholders with test values
  query = query.replace(/\{project_id\}/g, hotel.project_id);
  query = query.replace(/\{dataset_id\}/g, hotel.dataset_id);
  
  // Use current year/month for testing
  const now = new Date();
  const year = now.getFullYear().toString();
  const month = (now.getMonth() + 1).toString().padStart(2, '0');
  
  query = query.replace(/\{year\}/g, year);
  query = query.replace(/\{month\}/g, month);

  // Replace @parameters with test values (properly escaped)
  query = query.replace(/@hotel_code/g, `'${hotel.hotel_code.replace(/'/g, "''")}'`);
  query = query.replace(/@start_date/g, `'${year}-${month}-01'`);
  query = query.replace(/@end_date/g, `'${year}-${month}-28'`);
  query = query.replace(/@year/g, year);
  query = query.replace(/@month/g, month);

  return query;
}


