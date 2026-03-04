import type { APIRoute } from 'astro';

const headers = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

/**
 * Debug endpoint to inspect database state
 */
export const GET: APIRoute = async ({ locals }) => {
  try {
    const env = (locals as any).runtime?.env;
    const db = env?.DB;

    if (!db) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Database not configured',
        }),
        { status: 500, headers }
      );
    }

    // Get all tables
    const tables = await db
      .prepare("SELECT name FROM sqlite_master WHERE type='table'")
      .all();

    // Get all hotels
    const hotels = await db
      .prepare('SELECT * FROM hotels')
      .all();

    // Get all query templates
    const templates = await db
      .prepare('SELECT * FROM query_templates')
      .all();

    // Get table schemas
    const hotelSchema = await db
      .prepare("SELECT sql FROM sqlite_master WHERE type='table' AND name='hotels'")
      .first();

    const templateSchema = await db
      .prepare("SELECT sql FROM sqlite_master WHERE type='table' AND name='query_templates'")
      .first();

    // Check for table registry tables
    const tablesTableExists = await db
      .prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='bigquery_tables'")
      .first();

    const columnsTableExists = await db
      .prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='bigquery_table_columns'")
      .first();

    const templatesV2TableExists = await db
      .prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='query_templates_v2'")
      .first();

    let registeredTablesCount = 0;
    let registeredColumnsCount = 0;
    if (tablesTableExists) {
      const tablesCount = await db.prepare('SELECT COUNT(*) as count FROM bigquery_tables').first();
      registeredTablesCount = (tablesCount as any)?.count || 0;
    }
    if (columnsTableExists) {
      const columnsCount = await db.prepare('SELECT COUNT(*) as count FROM bigquery_table_columns').first();
      registeredColumnsCount = (columnsCount as any)?.count || 0;
    }

    return new Response(
      JSON.stringify({
        success: true,
        tables: tables.results || [],
        hotels: hotels.results || [],
        templates: templates.results || [],
        schemas: {
          hotels: hotelSchema,
          query_templates: templateSchema,
        },
        database: {
          configured: true,
          hotels_table_exists: !!hotelsTableExists,
          templates_table_exists: !!templatesTableExists,
          tables_table_exists: !!tablesTableExists,
          columns_table_exists: !!columnsTableExists,
          templates_v2_table_exists: !!templatesV2TableExists,
        },
        counts: {
          hotels: hotelsCount,
          templates: templatesCount,
          registered_tables: registeredTablesCount,
          registered_columns: registeredColumnsCount,
        },
        all_tables: allTables.results,
      }, null, 2),
      { status: 200, headers }
    );
  } catch (error: any) {
    console.error('Debug error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'Failed to debug database',
        details: error.toString(),
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


