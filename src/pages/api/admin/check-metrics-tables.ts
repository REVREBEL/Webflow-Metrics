import type { APIRoute } from 'astro';

const headers = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
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

    // Check what tables exist
    const tables = await db
      .prepare(
        `SELECT name, sql FROM sqlite_master WHERE type='table' ORDER BY name`
      )
      .all();

    // Try to get schema for data_templates if it exists
    let dataTemplatesSchema = null;
    let metricDefinitionsSchema = null;

    try {
      const dtSchema = await db
        .prepare(`PRAGMA table_info(data_templates)`)
        .all();
      dataTemplatesSchema = dtSchema.results;
    } catch (e) {
      dataTemplatesSchema = { error: 'Table does not exist' };
    }

    try {
      const mdSchema = await db
        .prepare(`PRAGMA table_info(metric_definitions)`)
        .all();
      metricDefinitionsSchema = mdSchema.results;
    } catch (e) {
      metricDefinitionsSchema = { error: 'Table does not exist' };
    }

    return new Response(
      JSON.stringify({
        allTables: tables.results,
        dataTemplatesSchema,
        metricDefinitionsSchema
      }),
      { status: 200, headers }
    );
  } catch (error: any) {
    console.error('Error checking tables:', error);
    return new Response(
      JSON.stringify({ error: error.message, stack: error.stack }),
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
