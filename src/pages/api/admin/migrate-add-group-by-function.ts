import type { APIRoute } from 'astro';

const headers = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

/**
 * Migration: Add group_by_function column to query_templates_v2
 */
export const POST: APIRoute = async ({ locals }) => {
  try {
    const env = (locals as any).runtime?.env;
    const db = env?.DB;

    if (!db) {
      return new Response(
        JSON.stringify({ error: 'Database not configured' }),
        { status: 500, headers }
      );
    }

    console.log('🔄 Starting migration: Add group_by_function column');

    // Check if column already exists
    const tableInfo = await db
      .prepare("PRAGMA table_info(query_templates_v2)")
      .all();

    const columnExists = tableInfo.results?.some(
      (col: any) => col.name === 'group_by_function'
    );

    if (columnExists) {
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Column group_by_function already exists',
          alreadyMigrated: true
        }),
        { status: 200, headers }
      );
    }

    // Add the column
    await db
      .prepare("ALTER TABLE query_templates_v2 ADD COLUMN group_by_function TEXT")
      .run();

    console.log('✅ Migration complete: group_by_function column added');

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Successfully added group_by_function column to query_templates_v2',
        alreadyMigrated: false
      }),
      { status: 200, headers }
    );
  } catch (error: any) {
    console.error('❌ Migration failed:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: 'Failed to add group_by_function column. The table may not exist yet.'
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
