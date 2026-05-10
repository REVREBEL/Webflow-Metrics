import type { APIRoute } from 'astro';

const headers = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export const OPTIONS: APIRoute = async () => {
  return new Response(null, { status: 204, headers });
};

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

    // Check metric_definitions schema
    const schemaResult = await db
      .prepare("PRAGMA table_info(metric_definitions)")
      .all();

    // Get sample data
    const dataResult = await db
      .prepare("SELECT * FROM metric_definitions LIMIT 5")
      .all();

    return new Response(
      JSON.stringify({
        schema: schemaResult.results,
        sampleData: dataResult.results,
        columnNames: (schemaResult.results as any[]).map(col => col.name)
      }),
      { status: 200, headers }
    );
  } catch (error: any) {
    console.error('Error checking schema:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers }
    );
  }
};
