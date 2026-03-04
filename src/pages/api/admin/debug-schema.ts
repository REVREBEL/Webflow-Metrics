import type { APIRoute } from 'astro';

/**
 * Debug endpoint to see actual database schema
 */
export const GET: APIRoute = async ({ locals }) => {
  try {
    const env = (locals as any).runtime?.env;
    const db = env?.DB;

    if (!db) {
      return new Response(
        JSON.stringify({ error: 'Database not configured' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Get all tables
    const tables = await db
      .prepare("SELECT name, sql FROM sqlite_master WHERE type='table' ORDER BY name")
      .all();

    // Get hotels table structure specifically
    let hotelsSchema = null;
    try {
      const hotelsInfo = await db.prepare('PRAGMA table_info(hotels)').all();
      hotelsSchema = hotelsInfo.results;
    } catch (e) {
      hotelsSchema = { error: 'Table does not exist' };
    }

    return new Response(
      JSON.stringify({
        allTables: tables.results,
        hotelsTableColumns: hotelsSchema,
      }, null, 2),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
