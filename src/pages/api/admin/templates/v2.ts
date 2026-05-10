import type { APIRoute } from 'astro';
import { BigQuery } from '@google-cloud/bigquery';
import { decrypt } from '../../../../lib/encryption';

const headers = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export const OPTIONS: APIRoute = async () => {
  return new Response(null, { status: 204, headers });
};

/**
 * Validate a data template by testing it against BigQuery
 * This endpoint requires a hotel_code to get credentials for testing
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

    // Decrypt service account
    const encryptionKey = env?.ENCRYPTION_KEY;
    if (!encryptionKey) {
      return new Response(
        JSON.stringify({ error: 'Encryption key not configured' }),
        { status: 500, headers }
      );
    }

    const serviceAccountJson = await decrypt(hotel.service_account_json, encryptionKey);
    const serviceAccount = JSON.parse(serviceAccountJson);

    // Initialize BigQuery
    const bigquery = new BigQuery({
      projectId: hotel.project_id,
      credentials: serviceAccount,
    });

    // Build test query with sample parameters
    const testQuery = buildTestQuery(query_template, hotel);

    // Execute query with LIMIT 1 to test structure
    const validationQuery = `${testQuery} LIMIT 1`;
    
    let queryResult;
    try {
      [queryResult] = await bigquery.query({ query: validationQuery });
    } catch (error: any) {
      return new Response(
        JSON.stringify({ 
          valid: false,
          error: 'Query execution failed',
          details: error.message,
          query: validationQuery
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

    const validationResult = {
      valid: isValid,
      declaredColumns: output_columns,
      actualColumns,
      missingColumns,
      extraColumns,
      sampleRow: queryResult[0] || null,
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
    return new Response(
      JSON.stringify({ 
        valid: false,
        error: error.message,
        stack: error.stack
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

  // Replace @parameters with test values
  query = query.replace(/@hotel_code/g, `'${hotel.hotel_code}'`);
  query = query.replace(/@start_date/g, `'${year}-${month}-01'`);
  query = query.replace(/@end_date/g, `'${year}-${month}-28'`);
  query = query.replace(/@year/g, year);
  query = query.replace(/@month/g, month);

  return query;
}
