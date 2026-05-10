import type { APIRoute } from 'astro';

const headers = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

const migrations = [
  { file: '0007_metric_definitions.sql', name: 'Create metric definition tables' },
  { file: '0008_default_metrics.sql', name: 'Add default metrics' },
  { file: '0010_add_display_name.sql', name: 'Add display_name column' }
];

/**
 * Run database migration SQL
 * Supports both single statements and multiple statements separated by semicolons
 */
export const POST: APIRoute = async ({ request, locals }) => {
  try {
    const env = (locals as any).runtime?.env;
    const db = env?.DB;

    if (!db) {
      return new Response(
        JSON.stringify({ error: 'Database not configured' }),
        { status: 500, headers }
      );
    }

    const body = await request.json();
    const { sql, description } = body;

    if (!sql || typeof sql !== 'string') {
      return new Response(
        JSON.stringify({ error: 'SQL statement is required' }),
        { status: 400, headers }
      );
    }

    console.log('🔄 Running migration:', description || 'Custom SQL');
    console.log('📝 SQL:', sql);

    // Split by semicolons for multiple statements
    const statements = sql
      .split(';')
      .map((s: string) => s.trim())
      .filter((s: string) => s.length > 0);

    const results = [];

    for (const statement of statements) {
      try {
        console.log('  ➡️ Executing:', statement.substring(0, 100) + '...');
        
        // Check if it's a SELECT/PRAGMA query (returns results)
        if (
          statement.toUpperCase().startsWith('SELECT') ||
          statement.toUpperCase().startsWith('PRAGMA')
        ) {
          const result = await db.prepare(statement).all();
          results.push({
            statement: statement.substring(0, 100),
            type: 'query',
            rows: result.results?.length || 0,
            data: result.results
          });
        } else {
          // DDL/DML statement (ALTER, CREATE, INSERT, UPDATE, DELETE)
          const result = await db.prepare(statement).run();
          results.push({
            statement: statement.substring(0, 100),
            type: 'mutation',
            success: result.success !== false,
            meta: result.meta
          });
        }
        
        console.log('  ✅ Statement executed successfully');
      } catch (error: any) {
        console.error('  ❌ Statement failed:', error.message);
        
        // Check if error is about column already existing
        if (error.message.includes('duplicate column name')) {
          results.push({
            statement: statement.substring(0, 100),
            type: 'skipped',
            message: 'Column already exists (skipped)'
          });
          continue;
        }
        
        // For other errors, throw to rollback
        throw error;
      }
    }

    console.log('✅ Migration complete');

    return new Response(
      JSON.stringify({
        success: true,
        message: `Migration completed successfully. Executed ${statements.length} statement(s).`,
        results,
        description
      }),
      { status: 200, headers }
    );
  } catch (error: any) {
    console.error('❌ Migration failed:', error);
    
    let errorMessage = error.message;
    let hint = '';

    // Provide helpful hints for common errors
    if (errorMessage.includes('no such table')) {
      hint = 'Table does not exist. You may need to initialize the database first.';
    } else if (errorMessage.includes('duplicate column')) {
      hint = 'Column already exists. This migration may have already been run.';
    } else if (errorMessage.includes('syntax error')) {
      hint = 'SQL syntax error. Check your SQL statement for typos.';
    }

    return new Response(
      JSON.stringify({
        error: errorMessage,
        hint,
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

