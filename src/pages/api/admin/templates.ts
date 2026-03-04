import type { APIRoute } from 'astro';

const headers = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

// GET: Fetch all global query templates
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

    const templates = await db
      .prepare(
        `SELECT 
          id,
          template_name,
          metric_name,
          sql_query,
          description,
          created_at,
          updated_at
        FROM global_query_templates 
        ORDER BY template_name`
      )
      .all();

    return new Response(JSON.stringify(templates.results || []), {
      status: 200,
      headers,
    });
  } catch (error: any) {
    console.error('Error fetching templates:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers }
    );
  }
};

// POST: Create a new global query template
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
      template_name: string;
      metric_name: string;
      sql_query: string;
      description?: string;
    };
    const { template_name, metric_name, sql_query, description } = body;

    if (!template_name || !metric_name || !sql_query) {
      return new Response(
        JSON.stringify({ error: 'template_name, metric_name, and sql_query are required' }),
        { status: 400, headers }
      );
    }

    // Insert new template
    const insertResult = await db
      .prepare(
        `INSERT INTO global_query_templates (
          template_name, 
          metric_name, 
          sql_query, 
          description,
          created_at,
          updated_at
        ) VALUES (?, ?, ?, ?, datetime('now'), datetime('now'))`
      )
      .bind(template_name, metric_name, sql_query, description || null)
      .run();

    // Fetch the created template
    const template = await db
      .prepare('SELECT * FROM global_query_templates WHERE id = ?')
      .bind(insertResult.meta.last_row_id)
      .first();

    return new Response(
      JSON.stringify({ success: true, template }),
      { status: 201, headers }
    );
  } catch (error: any) {
    console.error('Error creating template:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers }
    );
  }
};

// DELETE: Remove a global query template
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
    const id = url.searchParams.get('id');

    if (!id) {
      return new Response(
        JSON.stringify({ error: 'id parameter is required' }),
        { status: 400, headers }
      );
    }

    await db
      .prepare('DELETE FROM global_query_templates WHERE id = ?')
      .bind(parseInt(id))
      .run();

    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers }
    );
  } catch (error: any) {
    console.error('Error deleting template:', error);
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
