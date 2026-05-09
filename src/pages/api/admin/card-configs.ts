import type { APIRoute } from 'astro';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type'
};

export const OPTIONS: APIRoute = async () => {
  return new Response(null, {
    status: 204,
    headers: corsHeaders
  });
};

export const GET: APIRoute = async ({ locals }) => {
  const db = locals.runtime?.env?.DB;
  
  if (!db) {
    return new Response(JSON.stringify({ error: 'Database not configured' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  }

  try {
    const { results } = await db.prepare(`
      SELECT * FROM card_configs
      ORDER BY created_at DESC
    `).all();

    const configs = results.map((row: any) => ({
      ...row,
      slots: JSON.parse(row.slots)
    }));

    return new Response(JSON.stringify(configs), {
      status: 200,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  } catch (error: any) {
    console.error('Error fetching card configs:', error);
    return new Response(JSON.stringify({ 
      error: error.message || 'Failed to fetch card configs' 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  }
};

export const POST: APIRoute = async ({ request, locals }) => {
  const db = locals.runtime?.env?.DB;
  
  if (!db) {
    return new Response(JSON.stringify({ error: 'Database not configured' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  }

  const { card_name, card_type, slots } = await request.json();

  if (!card_name || !card_type || !slots) {
    return new Response(JSON.stringify({ 
      error: 'card_name, card_type, and slots are required' 
    }), {
      status: 400,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  }

  try {
    const result = await db.prepare(`
      INSERT INTO card_configs (card_name, card_type, slots)
      VALUES (?, ?, ?)
    `).bind(
      card_name,
      card_type,
      JSON.stringify(slots)
    ).run();

    return new Response(JSON.stringify({ 
      success: true, 
      id: result.meta.last_row_id 
    }), {
      status: 201,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  } catch (error: any) {
    console.error('Error creating card config:', error);
    return new Response(JSON.stringify({ 
      error: error.message || 'Failed to create card config' 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  }
};

export const PUT: APIRoute = async ({ request, locals }) => {
  const db = locals.runtime?.env?.DB;
  
  if (!db) {
    return new Response(JSON.stringify({ error: 'Database not configured' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  }

  const { id, card_name, card_type, slots } = await request.json();

  if (!id || !card_name || !card_type || !slots) {
    return new Response(JSON.stringify({ 
      error: 'id, card_name, card_type, and slots are required' 
    }), {
      status: 400,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  }

  try {
    await db.prepare(`
      UPDATE card_configs 
      SET card_name = ?, 
          card_type = ?, 
          slots = ?,
          updated_at = datetime('now')
      WHERE id = ?
    `).bind(
      card_name,
      card_type,
      JSON.stringify(slots),
      id
    ).run();

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  } catch (error: any) {
    console.error('Error updating card config:', error);
    return new Response(JSON.stringify({ 
      error: error.message || 'Failed to update card config' 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  }
};

export const DELETE: APIRoute = async ({ request, locals }) => {
  const db = locals.runtime?.env?.DB;
  
  if (!db) {
    return new Response(JSON.stringify({ error: 'Database not configured' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  }

  const { id } = await request.json();

  if (!id) {
    return new Response(JSON.stringify({ error: 'id is required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  }

  try {
    await db.prepare('DELETE FROM card_configs WHERE id = ?').bind(id).run();

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  } catch (error: any) {
    console.error('Error deleting card config:', error);
    return new Response(JSON.stringify({ 
      error: error.message || 'Failed to delete card config' 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  }
};
