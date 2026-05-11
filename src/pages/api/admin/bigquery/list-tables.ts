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
 * List all tables in a BigQuery dataset
 * POST body: { hotel_code: string, dataset_id: string }
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
    };
    const { hotel_code, dataset_id } = body;

    if (!hotel_code || !dataset_id) {
      return new Response(
        JSON.stringify({ error: 'hotel_code and dataset_id are required' }),
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

    // List tables in the dataset
    const tables = await bigquery.listTables(dataset_id);

    const tableList = tables.map((table: any) => ({
      table_id: table.tableReference.tableId,
      table_name: table.friendlyName || table.tableReference.tableId,
      description: null, // Basic list doesn't include description
      created: null,
      row_count: 0,
    }));

    return new Response(
      JSON.stringify({
        success: true,
        dataset_id,
        project_id: hotel.project_id,
        tables: tableList,
      }),
      { status: 200, headers }
    );
  } catch (error: any) {
    console.error('Error listing tables:', error);
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


