import type { APIRoute } from 'astro';

const headers = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

// Embedded migration SQL (works in both dev and production)
const MIGRATION_SQL = `
-- Migration: Add metric definition system with data templates and metric definitions
-- This replaces the old query_templates table with a more robust system

-- Drop old tables if they exist (to ensure clean schema)
DROP TABLE IF EXISTS metric_definitions;
DROP TABLE IF EXISTS data_templates;

-- Create data_templates table (replaces query_templates)
CREATE TABLE IF NOT EXISTS data_templates (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  template_name TEXT NOT NULL UNIQUE,
  description TEXT,
  query_template TEXT NOT NULL,
  output_columns TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Create metric_definitions table
CREATE TABLE IF NOT EXISTS metric_definitions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  metric_name TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  data_template_id INTEGER NOT NULL,
  formula TEXT NOT NULL,
  format_type TEXT NOT NULL DEFAULT 'number',
  decimal_places INTEGER NOT NULL DEFAULT 2,
  prefix TEXT,
  suffix TEXT,
  display_order INTEGER NOT NULL DEFAULT 0,
  category TEXT,
  description TEXT,
  calculation_id TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (data_template_id) REFERENCES data_templates(id) ON DELETE CASCADE
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_metric_definitions_template 
  ON metric_definitions(data_template_id);

CREATE INDEX IF NOT EXISTS idx_metric_definitions_calculation 
  ON metric_definitions(calculation_id);

-- Create card_configs table for dashboard card configurations
CREATE TABLE IF NOT EXISTS card_configs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  card_name TEXT NOT NULL,
  card_type TEXT NOT NULL,
  slots TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);
`;

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

    console.log('[Metric Migration] Starting migration...');

    // Split by semicolons and execute each statement
    // Remove comments first, then split
    const cleanedSQL = MIGRATION_SQL
      .split('\n')
      .filter(line => !line.trim().startsWith('--'))
      .join('\n');

    const statements = cleanedSQL
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0);

    console.log(`[Metric Migration] Found ${statements.length} statements to execute`);
    console.log('[Metric Migration] Statements:', statements);

    const results = [];
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      if (statement.trim()) {
        try {
          console.log(`[Metric Migration] Statement ${i + 1}/${statements.length}:`);
          console.log(statement);
          const result = await db.prepare(statement).run();
          results.push({ statement: i + 1, success: true, sql: statement.substring(0, 100) });
          console.log(`[Metric Migration] Statement ${i + 1} executed successfully`);
        } catch (error: any) {
          console.error(`[Metric Migration] Statement ${i + 1} failed:`, error.message);
          console.error('Failed SQL:', statement);
          results.push({ statement: i + 1, success: false, error: error.message, sql: statement.substring(0, 100) });
          // Continue with other statements even if one fails
        }
      }
    }

    // Verify the tables were created (safe query that won't fail)
    const allTables = await db.prepare(
      `SELECT name FROM sqlite_master WHERE type='table' ORDER BY name`
    ).all();

    const createdTables = allTables.results?.filter((t: any) => 
      t.name === 'data_templates' || t.name === 'metric_definitions'
    ) || [];

    console.log('[Metric Migration] All tables:', allTables.results?.map((t: any) => t.name));
    console.log('[Metric Migration] Created tables:', createdTables);

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Metric definition system migrated',
        results,
        tablesCreated: createdTables.length,
        tables: createdTables
      }),
      { status: 200, headers }
    );
  } catch (error: any) {
    console.error('[Metric Migration] Error:', error);
    return new Response(
      JSON.stringify({
        error: error.message,
        details: error.stack
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





