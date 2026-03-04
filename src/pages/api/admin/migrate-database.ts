import type { APIRoute } from 'astro';

/**
 * Database Migration Endpoint
 * 
 * Safely adds new columns to existing tables without losing data.
 * This is idempotent and safe to run multiple times.
 */
export const POST: APIRoute = async ({ locals }) => {
  try {
    const env = (locals as any).runtime?.env;
    const db = env?.DB;

    if (!db) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Database not configured',
        }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Check if hotels table exists
    const tablesResult = await db
      .prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='hotels'")
      .all();

    if (!tablesResult.results || tablesResult.results.length === 0) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Hotels table does not exist. Run "Initialize Database" first.',
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Get current table structure
    const tableInfo = await db.prepare('PRAGMA table_info(hotels)').all();
    
    const existingColumns = new Set(
      tableInfo.results.map((col: any) => col.name)
    );

    // Define expected columns from our latest schema
    const expectedColumns = [
      'id',
      'hotel_code',
      'hotel_name',
      'project_id',
      'dataset_id',
      'table_id',
      'data_location',
      'service_account_json',
      'created_at',
      'updated_at'
    ];

    const missingColumns = expectedColumns.filter(col => !existingColumns.has(col));

    // If table is missing critical columns, it needs to be recreated
    if (missingColumns.includes('service_account_json') || 
        missingColumns.includes('hotel_code') ||
        missingColumns.includes('hotel_name')) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Table schema is too outdated. Please recreate the database.',
          currentColumns: Array.from(existingColumns),
          missingColumns,
          recommendation: 'The table structure is incompatible. You may need to drop and recreate the database.',
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Add missing non-critical columns
    const columnsToAdd = [];
    
    if (!existingColumns.has('project_id')) {
      columnsToAdd.push('ALTER TABLE hotels ADD COLUMN project_id TEXT');
    }
    if (!existingColumns.has('dataset_id')) {
      columnsToAdd.push('ALTER TABLE hotels ADD COLUMN dataset_id TEXT');
    }
    if (!existingColumns.has('table_id')) {
      columnsToAdd.push('ALTER TABLE hotels ADD COLUMN table_id TEXT');
    }
    if (!existingColumns.has('data_location')) {
      columnsToAdd.push('ALTER TABLE hotels ADD COLUMN data_location TEXT DEFAULT "US"');
    }
    if (!existingColumns.has('updated_at')) {
      columnsToAdd.push('ALTER TABLE hotels ADD COLUMN updated_at DATETIME');
    }

    // Execute column additions
    for (const sql of columnsToAdd) {
      console.log('Executing:', sql);
      await db.prepare(sql).run();
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: columnsToAdd.length > 0 
          ? 'Database migrated successfully' 
          : 'Database is already up to date',
        currentColumns: Array.from(existingColumns),
        columnsAdded: columnsToAdd.length,
        columns: columnsToAdd,
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    console.error('Migration error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'Migration failed',
        details: error.toString(),
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};

export const GET: APIRoute = async (context) => {
  return POST(context);
};
