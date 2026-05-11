import type { APIRoute } from 'astro';
import { createBigQueryClient } from '../../../../lib/bigquery-rest-client';
import { decrypt } from '../../../../lib/encryption';

const headers = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

/**
 * Discover BigQuery table schema
 * POST body: { hotel_code: string, dataset_id: string, table_id: string }
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
      dataset_id: string;
      table_id: string;
    };
    const { hotel_code, dataset_id, table_id } = body;

    if (!hotel_code || !dataset_id || !table_id) {
      return new Response(
        JSON.stringify({ error: 'hotel_code, dataset_id, and table_id are required' }),
        { status: 400, headers }
      );
    }

    // Fetch hotel configuration
    const hotel = await db
      .prepare('SELECT * FROM hotels WHERE hotel_code = ?')
      .bind(hotel_code)
      .first() as any;

    if (!hotel) {
      return new Response(
        JSON.stringify({ error: 'Hotel not found' }),
        { status: 404, headers }
      );
    }

    // Decrypt service account JSON
    const serviceAccountJson = await decrypt(hotel.service_account_json, env);

    // Initialize BigQuery REST client (Cloudflare Workers compatible)
    const bigquery = createBigQueryClient(hotel.project_id, serviceAccountJson);

    // Get table metadata
    const metadata = await bigquery.getTable(dataset_id, table_id);
    const schema = metadata.schema;

    if (!schema || !schema.fields) {
      return new Response(
        JSON.stringify({ error: 'No schema found for table' }),
        { status: 404, headers }
      );
    }

    // Map BigQuery field types to our column definitions
    const columns = schema.fields.map((field: any) => {
      const type = field.type;
      const isNumeric = ['INTEGER', 'INT64', 'FLOAT', 'FLOAT64', 'NUMERIC', 'BIGNUMERIC', 'DECIMAL'].includes(type);
      const isDate = ['DATE', 'DATETIME', 'TIMESTAMP', 'TIME'].includes(type);
      const isString = ['STRING', 'BYTES'].includes(type);

      return {
        column_name: field.name,
        column_type: type,
        is_filterable: true,
        is_groupable: isString || isDate,
        is_aggregatable: isNumeric,
        description: field.description || null,
        mode: field.mode || 'NULLABLE', // NULLABLE, REQUIRED, REPEATED
      };
    });

    return new Response(
      JSON.stringify({
        success: true,
        table_id,
        dataset_id,
        project_id: hotel.project_id,
        full_table_path: `${hotel.project_id}.${dataset_id}.${table_id}`,
        columns,
        row_count: metadata.numRows || '0',
      }),
      { status: 200, headers }
    );
  } catch (error: any) {
    console.error('Error discovering schema:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: error.toString()
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


