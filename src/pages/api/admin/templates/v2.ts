import type { APIRoute } from 'astro';

const headers = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

/**
 * Query Templates V2 (Table-driven with visual builder support)
 */

// GET: Fetch all templates with table information
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
      .prepare(`
        SELECT 
          t.*,
          bt.table_name,
          bt.table_key,
          bt.full_table_path
        FROM query_templates_v2 t
        LEFT JOIN bigquery_tables bt ON t.table_id = bt.id
        ORDER BY t.created_at DESC
      `)
      .all();

    const result = (templates.results || []).map((t: any) => ({
      ...t,
      group_by_columns: t.group_by_columns ? JSON.parse(t.group_by_columns) : null,
      filters: t.filters ? JSON.parse(t.filters) : null,
    }));

    return new Response(JSON.stringify(result), {
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

// POST: Create new template
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
      table_id: number;
      description?: string;
      use_custom_sql?: number;
      custom_sql?: string;
      aggregation_type?: string;
      aggregation_column?: string;
      group_by_columns?: string;
      group_by_function?: string;
      filters?: string;
    };

    const {
      template_name,
      metric_name,
      table_id,
      description,
      use_custom_sql,
      custom_sql,
      aggregation_type,
      aggregation_column,
      group_by_columns,
      group_by_function,
      filters,
    } = body;

    if (!template_name || !metric_name || !table_id) {
      return new Response(
        JSON.stringify({ error: 'template_name, metric_name, and table_id are required' }),
        { status: 400, headers }
      );
    }

    // Validate that either custom_sql or visual builder fields are provided
    if (use_custom_sql && !custom_sql) {
      return new Response(
        JSON.stringify({ error: 'custom_sql is required when use_custom_sql is true' }),
        { status: 400, headers }
      );
    }

    if (!use_custom_sql && !aggregation_type) {
      return new Response(
        JSON.stringify({ error: 'aggregation_type is required for visual builder mode' }),
        { status: 400, headers }
      );
    }

    const result = await db
      .prepare(
        `INSERT INTO query_templates_v2 (
          template_name, metric_name, table_id, description,
          use_custom_sql, custom_sql,
          aggregation_type, aggregation_column, group_by_columns, group_by_function, filters,
          created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))`
      )
      .bind(
        template_name,
        metric_name,
        table_id,
        description || null,
        use_custom_sql || 0,
        custom_sql || null,
        aggregation_type || null,
        aggregation_column || null,
        group_by_columns || null,
        group_by_function || null,
        filters || null
      )
      .run();

    // Fetch the created template
    const template = await db
      .prepare('SELECT * FROM query_templates_v2 WHERE id = ?')
      .bind(result.meta.last_row_id)
      .first();

    return new Response(
      JSON.stringify({
        success: true,
        template,
      }),
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

// PUT: Update existing template
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
      template_id: number;
      template_name: string;
      metric_name: string;
      table_id: number;
      description?: string;
      use_custom_sql?: number;
      custom_sql?: string;
      aggregation_type?: string;
      aggregation_column?: string;
      group_by_columns?: string;
      group_by_function?: string;
      filters?: string;
    };

    const {
      template_id,
      template_name,
      metric_name,
      table_id,
      description,
      use_custom_sql,
      custom_sql,
      aggregation_type,
      aggregation_column,
      group_by_columns,
      group_by_function,
      filters,
    } = body;

    if (!template_id || !template_name || !metric_name || !table_id) {
      return new Response(
        JSON.stringify({ error: 'template_id, template_name, metric_name, and table_id are required' }),
        { status: 400, headers }
      );
    }

    // Validate that either custom_sql or visual builder fields are provided
    if (use_custom_sql && !custom_sql) {
      return new Response(
        JSON.stringify({ error: 'custom_sql is required when use_custom_sql is true' }),
        { status: 400, headers }
      );
    }

    if (!use_custom_sql && !aggregation_type) {
      return new Response(
        JSON.stringify({ error: 'aggregation_type is required for visual builder mode' }),
        { status: 400, headers }
      );
    }

    await db
      .prepare(
        `UPDATE query_templates_v2 SET
          template_name = ?,
          metric_name = ?,
          table_id = ?,
          description = ?,
          use_custom_sql = ?,
          custom_sql = ?,
          aggregation_type = ?,
          aggregation_column = ?,
          group_by_columns = ?,
          group_by_function = ?,
          filters = ?,
          updated_at = datetime('now')
        WHERE id = ?`
      )
      .bind(
        template_name,
        metric_name,
        table_id,
        description || null,
        use_custom_sql || 0,
        custom_sql || null,
        aggregation_type || null,
        aggregation_column || null,
        group_by_columns || null,
        group_by_function || null,
        filters || null,
        template_id
      )
      .run();

    // Fetch the updated template
    const template = await db
      .prepare('SELECT * FROM query_templates_v2 WHERE id = ?')
      .bind(template_id)
      .first();

    return new Response(
      JSON.stringify({
        success: true,
        template,
      }),
      { status: 200, headers }
    );
  } catch (error: any) {
    console.error('Error updating template:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers }
    );
  }
};

// DELETE: Remove a template
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
    const templateId = url.searchParams.get('template_id');

    if (!templateId) {
      return new Response(
        JSON.stringify({ error: 'template_id parameter is required' }),
        { status: 400, headers }
      );
    }

    await db
      .prepare('DELETE FROM query_templates_v2 WHERE id = ?')
      .bind(parseInt(templateId))
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






