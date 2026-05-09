import type { APIRoute } from 'astro';

const headers = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

/**
 * Get list of hotels for client dashboard
 */
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

    // Fetch all hotels (only basic info, no sensitive data)
    const { results } = await db
      .prepare('SELECT hotel_code, hotel_name, total_rooms FROM hotels ORDER BY hotel_name')
      .all();

    return new Response(JSON.stringify({ hotels: results || [] }), {
      status: 200,
      headers,
    });
  } catch (error: any) {
    console.error('Error fetching hotels for client:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to fetch hotels', details: error.message }),
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

