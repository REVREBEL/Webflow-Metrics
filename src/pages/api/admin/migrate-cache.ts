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

    console.log('[Migration] Starting cache migration...');

    // Read the migration file
    const migration = `
-- Cache table for storing query results
CREATE TABLE IF NOT EXISTS metric_cache (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  hotel_code TEXT NOT NULL,
  year INTEGER NOT NULL,
  month INTEGER NOT NULL,
  metric_name TEXT NOT NULL,
  value REAL,
  cached_at INTEGER NOT NULL,
  expires_at INTEGER NOT NULL,
  query_hash TEXT NOT NULL,
  UNIQUE(hotel_code, year, month, metric_name)
);

CREATE INDEX IF NOT EXISTS idx_cache_lookup ON metric_cache(hotel_code, year, month, expires_at);
CREATE INDEX IF NOT EXISTS idx_cache_expiry ON metric_cache(expires_at);

-- Calculations table for defining formulas
CREATE TABLE IF NOT EXISTS calculations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  calculation_name TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  formula TEXT NOT NULL,
  format_type TEXT DEFAULT 'number',
  decimal_places INTEGER DEFAULT 2,
  description TEXT,
  display_order INTEGER DEFAULT 0,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);

-- Insert default calculations
INSERT OR IGNORE INTO calculations (calculation_name, display_name, formula, format_type, decimal_places, description, display_order, created_at, updated_at)
VALUES 
  (
    'adr',
    'Average Daily Rate (ADR)',
    '{"type":"divide","numerator":"Total Revenue by Month","denominator":"Total Rooms by Month"}',
    'currency',
    2,
    'Revenue per room sold',
    1,
    strftime('%s', 'now'),
    strftime('%s', 'now')
  );
`;

    // Split into individual statements and execute
    const statements = migration
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));

    console.log(`[Migration] Executing ${statements.length} statements...`);

    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      console.log(`[Migration] Statement ${i + 1}/${statements.length}: ${statement.substring(0, 50)}...`);
      
      try {
        await db.prepare(statement).run();
        console.log(`[Migration] ✓ Statement ${i + 1} completed`);
      } catch (err: any) {
        console.error(`[Migration] ✗ Statement ${i + 1} failed:`, err);
        // Continue with other statements even if one fails
      }
    }

    // Verify tables were created
    const tables = await db.prepare(`
      SELECT name FROM sqlite_master 
      WHERE type='table' AND (name='metric_cache' OR name='calculations')
      ORDER BY name
    `).all();

    console.log('[Migration] Tables found:', tables.results);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Cache and calculations tables created successfully',
        statements_executed: statements.length,
        tables_created: (tables.results || []).map((t: any) => t.name)
      }),
      { status: 200, headers }
    );
  } catch (error: any) {
    console.error('Migration error:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: error.toString()
      }),
      { status: 500, headers }
    );
  }
};

export const OPTIONS: APIRoute = async () => {
  return new Response(null, { status: 204, headers });
};

