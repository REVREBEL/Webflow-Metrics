import type { APIRoute } from 'astro';

/**
 * Migration Endpoint: Add total_rooms column to existing hotels table
 * 
 * This endpoint adds the total_rooms column to an existing hotels table
 * without dropping or losing any existing data.
 * 
 * Usage: POST /api/admin/add-total-rooms-column
 */
export const POST: APIRoute = async ({ locals }) => {
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

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

    console.log('Checking if total_rooms column exists...');

    // Check current schema
    const schema = await db.prepare('PRAGMA table_info(hotels)').all();
    const columns = schema.results.map((col: any) => col.name);
    
    console.log('Current hotels columns:', columns);

    if (columns.includes('total_rooms')) {
      return new Response(
        JSON.stringify({
          success: true,
          message: 'Column total_rooms already exists',
          columns,
        }),
        { status: 200, headers }
      );
    }

    console.log('Adding total_rooms column...');

    // Add the column
    await db.prepare('ALTER TABLE hotels ADD COLUMN total_rooms INTEGER DEFAULT NULL').run();

    console.log('Column added successfully');

    // Verify it was added
    const newSchema = await db.prepare('PRAGMA table_info(hotels)').all();
    const newColumns = newSchema.results.map((col: any) => col.name);

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Column total_rooms added successfully',
        columns: newColumns,
      }),
      { status: 200, headers }
    );
  } catch (error: any) {
    console.error('Migration error:', error);
    
    // Check if error is because column already exists
    if (error.message?.includes('duplicate column name')) {
      return new Response(
        JSON.stringify({
          success: true,
          message: 'Column total_rooms already exists',
        }),
        { status: 200, headers }
      );
    }

    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'Failed to add column',
        details: error.toString(),
      }),
      { status: 500, headers }
    );
  }
};

// Allow GET for easy browser testing
export const GET: APIRoute = async (context) => {
  return POST(context);
};

// Handle OPTIONS for CORS
export const OPTIONS: APIRoute = async () => {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
};
