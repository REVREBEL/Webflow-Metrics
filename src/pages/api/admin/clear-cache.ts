import type { APIRoute } from 'astro';

const headers = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

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

    // Delete all cache entries
    const result = await db
      .prepare('DELETE FROM metric_cache')
      .run();

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Cache cleared successfully',
        deleted: result.meta?.changes || 0
      }),
      { status: 200, headers }
    );
  } catch (error: any) {
    console.error('Clear cache error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers }
    );
  }
};

export const OPTIONS: APIRoute = async () => {
  return new Response(null, { status: 204, headers });
};
