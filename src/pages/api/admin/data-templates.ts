import type { APIRoute } from 'astro';

const headers = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

// GET: Fetch all data templates
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
          description,
          query_template,
          output_columns,
          created_at,
          updated_at
        FROM data_templates 
        ORDER BY template_name`
      )
      .all();

    // Parse output_columns from JSON string
    const parsed = (templates.results || []).map((t: any) => ({
      ...t,
      output_columns: JSON.parse(t.output_columns || '[]')
    }));

    return new Response(JSON.stringify(parsed), {
      status: 200,
      headers,
    });
  } catch (error: any) {
    console.error('Error fetching data templates:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers }
    );
  }
};

// POST: Create a new data template
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
      description?: string;
      query_template: string;
      output_columns: string[];
    };

    const { template_name, description, query_template, output_columns } = body;

    if (!template_name || !query_template || !output_columns || output_columns.length === 0) {
      return new Response(
        JSON.stringify({ error: 'template_name, query_template, and output_columns are required' }),
        { status: 400, headers }
      );
    }

    // Insert new template
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

    // Fetch the created template
    const created = await db
      .prepare('SELECT * FROM data_templates WHERE id = ?')
      .bind(result.meta.last_row_id)
      .first();

    return new Response(
      JSON.stringify({
        success: true,
        template: {
          ...created,
          output_columns: JSON.parse((created as any).output_columns)
        }
      }),
      { status: 201, headers }
    );
  } catch (error: any) {
    console.error('Error creating data template:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers }
    );
  }
};

// PUT: Update a data template
export const PUT: APIRoute = async ({ request, locals }) => {
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
      id: number;
      template_name: string;
      description?: string;
      query_template: string;
      output_columns: string[];
    };

    const { id, template_name, description, query_template, output_columns } = body;

    if (!id || !template_name || !query_template || !output_columns) {
      return new Response(
        JSON.stringify({ error: 'id, template_name, query_template, and output_columns are required' }),
        { status: 400, headers }
      );
    }

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
        id
      )
      .run();

    const updated = await db
      .prepare('SELECT * FROM data_templates WHERE id = ?')
      .bind(id)
      .first();

    return new Response(
      JSON.stringify({
        success: true,
        template: {
          ...updated,
          output_columns: JSON.parse((updated as any).output_columns)
        }
      }),
      { status: 200, headers }
    );
  } catch (error: any) {
    console.error('Error updating data template:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers }
    );
  }
};

// DELETE: Remove a data template
export const DELETE: APIRoute = async ({ request, locals }) => {
  const url = new URL(request.url);
  const id = url.searchParams.get('id');

  if (!id) {
    return new Response(
      JSON.stringify({ error: 'Template ID is required' }),
      { status: 400, headers }
    );
  }

  const env = (locals as any).runtime?.env;
  const db = env?.DB;

  if (!db) {
    return new Response(
      JSON.stringify({ error: 'Database not configured' }),
      { status: 500, headers }
    );
  }

  try {
    await db
      .prepare('DELETE FROM data_templates WHERE id = ?')
      .bind(id)
      .run();

    return new Response(
      JSON.stringify({ success: true, message: 'Template deleted successfully' }),
      { status: 200, headers }
    );
  } catch (error: any) {
    return new Response(
      JSON.stringify({ error: `Failed to delete template: ${error.message}` }),
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
