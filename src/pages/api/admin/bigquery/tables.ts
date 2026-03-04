import type { APIRoute } from 'astro';

const headers = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

/**
 * Manage BigQuery table registry
 */

// GET: Fetch all registered tables with their columns
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

    // Fetch all tables
    const tables = await db
      .prepare('SELECT * FROM bigquery_tables WHERE is_active = 1 ORDER BY table_name')
      .all();

    // Fetch columns for each table
    const tablesWithColumns = await Promise.all(
      (tables.results || []).map(async (table: any) => {
        const columns = await db
          .prepare('SELECT * FROM bigquery_table_columns WHERE table_id = ? ORDER BY column_name')
          .bind(table.id)
          .all();

        return {
          ...table,
          columns: columns.results || [],
        };
      })
    );

    return new Response(JSON.stringify(tablesWithColumns), {
      status: 200,
      headers,
    });
  } catch (error: any) {
    console.error('Error fetching tables:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers }
    );
  }
};

// POST: Register a new table (from schema discovery)
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
      table_key: string;
      table_name: string;
      full_table_path?: string;
      description?: string;
      columns: Array<{
        column_name: string;
        column_type: string;
        is_filterable?: boolean;
        is_groupable?: boolean;
        is_aggregatable?: boolean;
        description?: string;
      }>;
    };

    const { table_key, table_name, full_table_path, description, columns } = body;

    if (!table_key || !table_name || !columns || columns.length === 0) {
      return new Response(
        JSON.stringify({ error: 'table_key, table_name, and columns are required' }),
        { status: 400, headers }
      );
    }

    // Insert table
    const tableResult = await db
      .prepare(
        `INSERT INTO bigquery_tables (table_key, table_name, full_table_path, description, created_at, updated_at)
         VALUES (?, ?, ?, ?, datetime('now'), datetime('now'))`
      )
      .bind(table_key, table_name, full_table_path || null, description || null)
      .run();

    const tableId = tableResult.meta.last_row_id;

    // Insert columns
    for (const column of columns) {
      await db
        .prepare(
          `INSERT INTO bigquery_table_columns (
            table_id, column_name, column_type, 
            is_filterable, is_groupable, is_aggregatable, description
          ) VALUES (?, ?, ?, ?, ?, ?, ?)`
        )
        .bind(
          tableId,
          column.column_name,
          column.column_type,
          column.is_filterable !== false ? 1 : 0,
          column.is_groupable !== false ? 1 : 0,
          column.is_aggregatable === true ? 1 : 0,
          column.description || null
        )
        .run();
    }

    // Fetch the created table with columns
    const table = await db
      .prepare('SELECT * FROM bigquery_tables WHERE id = ?')
      .bind(tableId)
      .first();

    const tableColumns = await db
      .prepare('SELECT * FROM bigquery_table_columns WHERE table_id = ?')
      .bind(tableId)
      .all();

    return new Response(
      JSON.stringify({
        success: true,
        table: {
          ...table,
          columns: tableColumns.results || [],
        },
      }),
      { status: 201, headers }
    );
  } catch (error: any) {
    console.error('Error registering table:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers }
    );
  }
};

// DELETE: Remove a registered table
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
    const tableId = url.searchParams.get('table_id');

    if (!tableId) {
      return new Response(
        JSON.stringify({ error: 'table_id parameter is required' }),
        { status: 400, headers }
      );
    }

    // Delete table (columns will be deleted via CASCADE)
    await db
      .prepare('DELETE FROM bigquery_tables WHERE id = ?')
      .bind(parseInt(tableId))
      .run();

    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers }
    );
  } catch (error: any) {
    console.error('Error deleting table:', error);
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
