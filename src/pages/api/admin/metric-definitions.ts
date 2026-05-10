import type { APIRoute } from 'astro';

const headers = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

// GET: Fetch all metric definitions (with optional filtering by template)
export const GET: APIRoute = async ({ request, locals }) => {
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
    const templateId = url.searchParams.get('template_id');

    let query = `
      SELECT 
        m.id,
        m.metric_name,
        m.display_name,
        m.data_template_id,
        m.formula,
        m.format_type,
        m.decimal_places,
        m.prefix,
        m.suffix,
        m.display_order,
        m.category,
        m.description,
        m.created_at,
        m.updated_at,
        t.template_name,
        t.output_columns
      FROM metric_definitions m
      LEFT JOIN data_templates t ON m.data_template_id = t.id
    `;

    if (templateId) {
      query += ` WHERE m.data_template_id = ?`;
    }

    query += ` ORDER BY m.category, m.display_order, m.metric_name`;

    const stmt = db.prepare(query);
    const metrics = templateId 
      ? await stmt.bind(templateId).all()
      : await stmt.all();

    // Parse output_columns
    const parsed = (metrics.results || []).map((m: any) => ({
      ...m,
      output_columns: JSON.parse(m.output_columns || '[]')
    }));

    return new Response(JSON.stringify(parsed), {
      status: 200,
      headers,
    });
  } catch (error: any) {
    console.error('Error fetching metric definitions:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers }
    );
  }
};

// POST: Create a new metric definition
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
      metric_name: string;
      display_name?: string;
      data_template_id: number;
      formula: string;
      format_type?: string;
      decimal_places?: number;
      prefix?: string;
      suffix?: string;
      display_order?: number;
      category?: string;
      description?: string;
    };

    const {
      metric_name,
      display_name,
      data_template_id,
      formula,
      format_type = 'number',
      decimal_places = 2,
      prefix,
      suffix,
      display_order = 0,
      category,
      description
    } = body;

    if (!metric_name || !data_template_id || !formula) {
      return new Response(
        JSON.stringify({ error: 'metric_name, data_template_id, and formula are required' }),
        { status: 400, headers }
      );
    }

    // Insert new metric
    const result = await db
      .prepare(
        `INSERT INTO metric_definitions (
          metric_name,
          display_name,
          data_template_id,
          formula,
          format_type,
          decimal_places,
          prefix,
          suffix,
          display_order,
          category,
          description,
          created_at,
          updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))`
      )
      .bind(
        metric_name,
        display_name || metric_name,
        data_template_id,
        formula,
        format_type,
        decimal_places,
        prefix || null,
        suffix || null,
        display_order,
        category || null,
        description || null
      )
      .run();

    // Fetch the created metric with template info
    const created = await db
      .prepare(`
        SELECT 
          m.*,
          t.template_name,
          t.output_columns
        FROM metric_definitions m
        LEFT JOIN data_templates t ON m.data_template_id = t.id
        WHERE m.id = ?
      `)
      .bind(result.meta.last_row_id)
      .first();

    return new Response(
      JSON.stringify({
        success: true,
        metric: {
          ...created,
          output_columns: JSON.parse((created as any).output_columns || '[]')
        }
      }),
      { status: 201, headers }
    );
  } catch (error: any) {
    console.error('Error creating metric definition:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers }
    );
  }
};

// PUT: Update a metric definition
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
      metric_name: string;
      display_name?: string;
      data_template_id: number;
      formula: string;
      format_type?: string;
      decimal_places?: number;
      prefix?: string;
      suffix?: string;
      display_order?: number;
      category?: string;
      description?: string;
    };

    const {
      id,
      metric_name,
      display_name,
      data_template_id,
      formula,
      format_type = 'number',
      decimal_places = 2,
      prefix,
      suffix,
      display_order = 0,
      category,
      description
    } = body;

    if (!id || !metric_name || !data_template_id || !formula) {
      return new Response(
        JSON.stringify({ error: 'id, metric_name, data_template_id, and formula are required' }),
        { status: 400, headers }
      );
    }

    await db
      .prepare(
        `UPDATE metric_definitions SET
          metric_name = ?,
          display_name = ?,
          data_template_id = ?,
          formula = ?,
          format_type = ?,
          decimal_places = ?,
          prefix = ?,
          suffix = ?,
          display_order = ?,
          category = ?,
          description = ?,
          updated_at = datetime('now')
        WHERE id = ?`
      )
      .bind(
        metric_name,
        display_name || metric_name,
        data_template_id,
        formula,
        format_type,
        decimal_places,
        prefix || null,
        suffix || null,
        display_order,
        category || null,
        description || null,
        id
      )
      .run();

    const updated = await db
      .prepare(`
        SELECT 
          m.*,
          t.template_name,
          t.output_columns
        FROM metric_definitions m
        LEFT JOIN data_templates t ON m.data_template_id = t.id
        WHERE m.id = ?
      `)
      .bind(id)
      .first();

    return new Response(
      JSON.stringify({
        success: true,
        metric: {
          ...updated,
          output_columns: JSON.parse((updated as any).output_columns || '[]')
        }
      }),
      { status: 200, headers }
    );
  } catch (error: any) {
    console.error('Error updating metric definition:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers }
    );
  }
};

// DELETE: Remove a metric definition
export const DELETE: APIRoute = async ({ request, locals }) => {
  const url = new URL(request.url);
  const id = url.searchParams.get('id');

  if (!id) {
    return new Response(
      JSON.stringify({ error: 'Metric ID is required' }),
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
      .prepare('DELETE FROM metric_definitions WHERE id = ?')
      .bind(id)
      .run();

    return new Response(
      JSON.stringify({ success: true, message: 'Metric deleted successfully' }),
      { status: 200, headers }
    );
  } catch (error: any) {
    return new Response(
      JSON.stringify({ error: `Failed to delete metric: ${error.message}` }),
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









