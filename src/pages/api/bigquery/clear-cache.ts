import type { APIRoute } from 'astro';

export const POST: APIRoute = async ({ locals }) => {
  const db = locals?.runtime?.env?.DB;
  
  if (!db) {
    return new Response(JSON.stringify({ 
      success: false,
      error: 'Database not configured' 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    // Clear all cache entries from D1 database
    await db.prepare(`DELETE FROM cache_entries`).run();
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Cache cleared successfully' 
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    console.error('Clear cache error:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || 'Failed to clear cache' 
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
