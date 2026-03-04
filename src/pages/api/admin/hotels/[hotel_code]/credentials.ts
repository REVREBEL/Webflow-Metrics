import type { APIRoute } from 'astro';
import { decrypt } from '../../../../../lib/encryption';

/**
 * Get decrypted credentials for a specific hotel
 * This endpoint should only be called server-side for query execution
 */
export const GET: APIRoute = async ({ params, locals }) => {
  try {
    const env = (locals as any).runtime?.env;
    const db = env?.DB;

    if (!db) {
      return new Response(
        JSON.stringify({ error: 'Database not configured' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (!env?.ENCRYPTION_KEY) {
      return new Response(
        JSON.stringify({ error: 'Encryption key not configured' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const { hotel_code } = params;

    if (!hotel_code) {
      return new Response(
        JSON.stringify({ error: 'hotel_code is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Get hotel with encrypted credentials
    const hotel = await db
      .prepare('SELECT hotel_code, project_id, dataset_id, table_id, data_location, service_account_json FROM hotels WHERE hotel_code = ?')
      .bind(hotel_code)
      .first();

    if (!hotel) {
      return new Response(
        JSON.stringify({ error: 'Hotel not found' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Decrypt credentials
    const decryptedCredentials = await decrypt(hotel.service_account_json, env);

    return new Response(
      JSON.stringify({
        hotel_code: hotel.hotel_code,
        project_id: hotel.project_id,
        dataset_id: hotel.dataset_id,
        table_id: hotel.table_id,
        data_location: hotel.data_location,
        service_account_json: decryptedCredentials
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    console.error('Error fetching hotel credentials:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};


