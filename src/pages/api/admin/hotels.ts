import type { APIRoute } from 'astro';
import { WebflowClient } from 'webflow-api';
import { encrypt, decrypt } from '../../../lib/encryption';

const headers = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

// GET: Fetch all hotels
export const GET: APIRoute = async ({ locals }) => {
  try {
    const env = (locals as any).runtime?.env;
    const db = env?.DB;

    if (!db) {
      return new Response(
        JSON.stringify({ error: 'Database not configured' }),
        { status: 500, headers }
      );
    }

    // Fetch all hotels (without sensitive data)
    const hotels = await db
      .prepare(
        `SELECT 
          hotel_code, 
          hotel_name, 
          project_id,
          dataset_id,
          table_id,
          data_location,
          created_at,
          updated_at
        FROM hotels 
        ORDER BY hotel_name`
      )
      .all();

    return new Response(JSON.stringify(hotels.results || []), {
      status: 200,
      headers,
    });
  } catch (error: any) {
    console.error('Error fetching hotels:', error);
    
    // Check if it's a "no such table" error
    if (error.message?.includes('no such table')) {
      return new Response(
        JSON.stringify({ error: 'Database not configured. Please initialize the database first.' }),
        { status: 500, headers }
      );
    }

    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers }
    );
  }
};

// POST: Create a new hotel
export const POST: APIRoute = async ({ request, locals }) => {
  try {
    const env = (locals as any).runtime?.env;
    const db = env?.DB;

    console.log('POST /api/admin/hotels - DB exists:', !!db);

    if (!db) {
      return new Response(
        JSON.stringify({ error: 'Database not configured' }),
        { status: 500, headers }
      );
    }

    const body = await request.json() as {
      hotel_code: string;
      hotel_name: string;
      project_id: string;
      dataset_id?: string;
      table_id?: string;
      data_location: string;
      service_account_json: string;
    };
    const { hotel_code, hotel_name, project_id, dataset_id, table_id, data_location, service_account_json } = body;

    console.log('Creating hotel:', { hotel_code, hotel_name, project_id, data_location });

    if (!hotel_code || !hotel_name || !project_id || !data_location || !service_account_json) {
      return new Response(
        JSON.stringify({ error: 'hotel_code, hotel_name, project_id, data_location, and service_account_json are required' }),
        { status: 400, headers }
      );
    }

    // Validate service_account_json is valid JSON
    try {
      JSON.parse(service_account_json);
    } catch (e) {
      return new Response(
        JSON.stringify({ error: 'service_account_json must be valid JSON' }),
        { status: 400, headers }
      );
    }

    // Encrypt the service account JSON before storing
    const encryptedJson = await encrypt(service_account_json, env);

    // Insert new hotel with encrypted credentials
    const insertResult = await db
      .prepare(
        `INSERT INTO hotels (
          hotel_code, 
          hotel_name, 
          project_id, 
          dataset_id, 
          table_id, 
          data_location, 
          service_account_json, 
          created_at,
          updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))`
      )
      .bind(
        hotel_code,
        hotel_name,
        project_id,
        dataset_id || null,
        table_id || null,
        data_location || 'US',
        encryptedJson
      )
      .run();

    console.log('Insert result:', insertResult);

    // Verify it was inserted by querying back (without returning credentials)
    const verify = await db
      .prepare('SELECT id, hotel_code, hotel_name, project_id, dataset_id, table_id, data_location, created_at, updated_at FROM hotels WHERE hotel_code = ?')
      .bind(hotel_code)
      .first();

    console.log('Verification query result:', verify);

    return new Response(
      JSON.stringify({ 
        success: true, 
        hotel: verify,
        inserted: !!verify
      }),
      { status: 201, headers }
    );
  } catch (error: any) {
    console.error('Error creating hotel:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers }
    );
  }
};

// DELETE: Remove a hotel
export const DELETE: APIRoute = async ({ request, locals }) => {
  try {
    const env = (locals as any).runtime?.env;
    const db = env?.DB;

    if (!db) {
      return new Response(
        JSON.stringify({ error: 'Database not configured' }),
        { status: 500, headers }
      );
    }

    const url = new URL(request.url);
    const hotel_code = url.searchParams.get('hotel_code');

    if (!hotel_code) {
      return new Response(
        JSON.stringify({ error: 'hotel_code parameter is required' }),
        { status: 400, headers }
      );
    }

    await db
      .prepare('DELETE FROM hotels WHERE hotel_code = ?')
      .bind(hotel_code)
      .run();

    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers }
    );
  } catch (error: any) {
    console.error('Error deleting hotel:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
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













