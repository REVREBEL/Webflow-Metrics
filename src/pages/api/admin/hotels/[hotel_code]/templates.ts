import type { APIRoute } from 'astro';

// GET: List query templates for a hotel
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

    const { hotel_code } = params;

    const result = await db
      .prepare('SELECT * FROM query_templates WHERE hotel_code = ? ORDER BY metric_name')
      .bind(hotel_code)
      .all();

    return new Response(JSON.stringify(result.results || []), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    console.error('Error fetching templates:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};

// POST: Create or update a query template
export const POST: APIRoute = async ({ params, request, locals }) => {
  try {
    const env = (locals as any).runtime?.env;
    const db = env?.DB;

    if (!db) {
      return new Response(
        JSON.stringify({ error: 'Database not configured' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const { hotel_code } = params;
    const body = await request.json() as {
      metric_name: string;
      query_text: string;
      description?: string;
    };
    const { metric_name, query_text, description } = body;

    if (!metric_name || !query_text) {
      return new Response(
        JSON.stringify({ error: 'metric_name and query_text are required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Upsert: Insert or replace
    await db
      .prepare(
        `INSERT OR REPLACE INTO query_templates 
         (hotel_code, metric_name, query_text, description) 
         VALUES (?, ?, ?, ?)`
      )
      .bind(hotel_code, metric_name, query_text, description || null)
      .run();

    return new Response(
      JSON.stringify({ success: true, hotel_code, metric_name }),
      { status: 201, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    console.error('Error saving template:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};

// DELETE: Remove a query template
export const DELETE: APIRoute = async ({ params, request, locals }) => {
  try {
    const env = (locals as any).runtime?.env;
    const db = env?.DB;

    if (!db) {
      return new Response(
        JSON.stringify({ error: 'Database not configured' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const { hotel_code } = params;
    const url = new URL(request.url);
    const metric_name = url.searchParams.get('metric_name');

    if (!metric_name) {
      return new Response(
        JSON.stringify({ error: 'metric_name parameter is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    await db
      .prepare('DELETE FROM query_templates WHERE hotel_code = ? AND metric_name = ?')
      .bind(hotel_code, metric_name)
      .run();

    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    console.error('Error deleting template:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};


