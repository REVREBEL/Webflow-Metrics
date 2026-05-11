import type { APIRoute } from 'astro';

/**
 * Database Initialization Endpoint
 * 
 * This endpoint initializes the D1 database schema.
 * It will DROP existing tables and recreate them with the correct schema.
 * 
 * Usage: POST /api/admin/init-database
 */
export const POST: APIRoute = async ({ locals }) => {
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  const migrationFiles = [
    '0001_initial_schema.sql',
    '0002_complete_schema.sql',
    '0003_global_templates.sql',
    '0004_table_registry.sql',
    '0005_add_group_by_function.sql',
    '0006_cache_and_calculations.sql',
    '0007_metric_definitions.sql',
    '0008_default_metrics.sql',
    '0009_add_total_rooms.sql',
  ];

  try {
    // Access DB using Webflow Cloud pattern
    const env = (locals as any).runtime?.env;
    const db = env?.DB;

    if (!db) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Database not configured. Check wrangler.jsonc binding.',
        }),
        { status: 500, headers }
      );
    }

    console.log('Starting database initialization - dropping existing tables...');

    // Drop existing tables in correct order (foreign keys first)
    try {
      await db.prepare('DROP TABLE IF EXISTS audit_log').run();
      console.log('Dropped audit_log');
    } catch (e) {
      console.log('audit_log does not exist or error dropping:', e);
    }

    try {
      await db.prepare('DROP TABLE IF EXISTS cache_entries').run();
      console.log('Dropped cache_entries');
    } catch (e) {
      console.log('cache_entries does not exist or error dropping:', e);
    }

    try {
      await db.prepare('DROP TABLE IF EXISTS query_cache').run();
      console.log('Dropped query_cache');
    } catch (e) {
      console.log('query_cache does not exist or error dropping:', e);
    }

    try {
      await db.prepare('DROP TABLE IF EXISTS query_templates').run();
      console.log('Dropped query_templates');
    } catch (e) {
      console.log('query_templates does not exist or error dropping:', e);
    }

    try {
      await db.prepare('DROP TABLE IF EXISTS hotels').run();
      console.log('Dropped hotels');
    } catch (e) {
      console.log('hotels does not exist or error dropping:', e);
    }

    console.log('Creating hotels table...');
    
    // Create hotels table with ALL required columns
    await db.prepare(`
      CREATE TABLE hotels (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        hotel_code TEXT UNIQUE NOT NULL,
        hotel_name TEXT NOT NULL,
        project_id TEXT NOT NULL,
        dataset_id TEXT,
        table_id TEXT,
        data_location TEXT NOT NULL DEFAULT 'US',
        service_account_json TEXT NOT NULL,
        total_rooms INTEGER DEFAULT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `).run();

    console.log('Hotels table created successfully');
    console.log('Creating query_templates table...');

    await db.prepare(`
      CREATE TABLE query_templates (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        template_id TEXT UNIQUE NOT NULL,
        hotel_code TEXT NOT NULL,
        template_name TEXT NOT NULL,
        sql_query TEXT NOT NULL,
        variables TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (hotel_code) REFERENCES hotels(hotel_code) ON DELETE CASCADE
      )
    `).run();

    console.log('Query templates table created successfully');
    console.log('Creating global_query_templates table...');

    await db.prepare(`
      CREATE TABLE IF NOT EXISTS global_query_templates (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        template_name TEXT UNIQUE NOT NULL,
        metric_name TEXT NOT NULL,
        sql_query TEXT NOT NULL,
        description TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `).run();

    console.log('Global query templates table created successfully');
    console.log('Creating data templates and metric definitions tables...');

    // Data templates define what raw data to fetch from BigQuery
    await db.prepare(`
      CREATE TABLE IF NOT EXISTS data_templates (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        template_name TEXT NOT NULL UNIQUE,
        description TEXT,
        query_template TEXT NOT NULL,
        output_columns TEXT NOT NULL,
        created_at TEXT NOT NULL DEFAULT (datetime('now')),
        updated_at TEXT NOT NULL DEFAULT (datetime('now'))
      )
    `).run();

    console.log('Data templates table created successfully');

    // Metric definitions define how to calculate metrics from cached data
    await db.prepare(`
      CREATE TABLE IF NOT EXISTS metric_definitions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        metric_name TEXT NOT NULL,
        display_name TEXT,
        data_template_id INTEGER NOT NULL,
        formula TEXT NOT NULL,
        format_type TEXT NOT NULL DEFAULT 'number',
        decimal_places INTEGER DEFAULT 2,
        prefix TEXT,
        suffix TEXT,
        display_order INTEGER DEFAULT 0,
        category TEXT,
        description TEXT,
        created_at TEXT NOT NULL DEFAULT (datetime('now')),
        updated_at TEXT NOT NULL DEFAULT (datetime('now')),
        FOREIGN KEY (data_template_id) REFERENCES data_templates(id) ON DELETE CASCADE
      )
    `).run();

    console.log('Metric definitions table created successfully');

    // Card configurations for dashboard
    await db.prepare(`
      CREATE TABLE IF NOT EXISTS card_configs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        card_name TEXT NOT NULL,
        metric_id INTEGER NOT NULL,
        position INTEGER DEFAULT 0,
        size TEXT DEFAULT 'medium',
        color_scheme TEXT DEFAULT 'default',
        show_trend INTEGER DEFAULT 1,
        created_at TEXT NOT NULL DEFAULT (datetime('now')),
        updated_at TEXT NOT NULL DEFAULT (datetime('now')),
        FOREIGN KEY (metric_id) REFERENCES metric_definitions(id) ON DELETE CASCADE
      )
    `).run();

    console.log('Card configs table created successfully');
    console.log('Creating table registry tables...');

    // BigQuery Tables Registry
    await db.prepare(`
      CREATE TABLE IF NOT EXISTS bigquery_tables (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        table_key TEXT UNIQUE NOT NULL,
        table_name TEXT NOT NULL,
        full_table_path TEXT,
        description TEXT,
        is_active INTEGER DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `).run();

    console.log('BigQuery tables registry created successfully');

    // Table Columns
    await db.prepare(`
      CREATE TABLE IF NOT EXISTS bigquery_table_columns (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        table_id INTEGER NOT NULL,
        column_name TEXT NOT NULL,
        column_type TEXT NOT NULL,
        is_filterable INTEGER DEFAULT 1,
        is_groupable INTEGER DEFAULT 1,
        is_aggregatable INTEGER DEFAULT 0,
        description TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (table_id) REFERENCES bigquery_tables(id) ON DELETE CASCADE,
        UNIQUE(table_id, column_name)
      )
    `).run();

    console.log('BigQuery table columns created successfully');

    // Query Templates V2 (table-driven)
    await db.prepare(`
      CREATE TABLE IF NOT EXISTS query_templates_v2 (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        template_name TEXT UNIQUE NOT NULL,
        metric_name TEXT NOT NULL,
        table_id INTEGER NOT NULL,
        aggregation_type TEXT,
        aggregation_column TEXT,
        group_by_columns TEXT,
        group_by_function TEXT,
        filters TEXT,
        custom_sql TEXT,
        use_custom_sql INTEGER DEFAULT 0,
        description TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (table_id) REFERENCES bigquery_tables(id) ON DELETE CASCADE
      )
    `).run();

    console.log('Query templates v2 created successfully');

    // Template Suggestions
    await db.prepare(`
      CREATE TABLE IF NOT EXISTS template_suggestions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        suggestion_name TEXT NOT NULL,
        table_key TEXT NOT NULL,
        metric_name TEXT NOT NULL,
        aggregation_type TEXT NOT NULL,
        aggregation_column TEXT,
        group_by_columns TEXT,
        filters TEXT,
        description TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `).run();

    console.log('Template suggestions created successfully');

    console.log('Creating cache_entries table...');

    await db.prepare(`
      CREATE TABLE cache_entries (
        cache_key TEXT PRIMARY KEY,
        cache_value TEXT NOT NULL,
        expires_at TEXT NOT NULL,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      )
    `).run();

    console.log('Cache entries table created successfully');
    console.log('Creating audit_log table...');

    await db.prepare(`
      CREATE TABLE audit_log (
        log_id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id TEXT,
        action TEXT NOT NULL,
        resource_type TEXT,
        resource_id TEXT,
        details TEXT,
        ip_address TEXT,
        user_agent TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      )
    `).run();

    console.log('Audit log table created successfully');
    console.log('Creating indexes...');

    // Create indexes
    await db.prepare('CREATE INDEX IF NOT EXISTS idx_query_templates_hotel ON query_templates(hotel_code)').run();
    await db.prepare('CREATE INDEX IF NOT EXISTS idx_cache_expires ON cache_entries(expires_at)').run();
    await db.prepare('CREATE INDEX IF NOT EXISTS idx_audit_log_resource ON audit_log(resource_type, resource_id)').run();
    await db.prepare('CREATE INDEX IF NOT EXISTS idx_table_columns_table ON bigquery_table_columns(table_id)').run();
    await db.prepare('CREATE INDEX IF NOT EXISTS idx_templates_v2_table ON query_templates_v2(table_id)').run();
    await db.prepare('CREATE INDEX IF NOT EXISTS idx_template_suggestions_table ON template_suggestions(table_key)').run();
    await db.prepare('CREATE INDEX IF NOT EXISTS idx_metric_definitions_template ON metric_definitions(data_template_id)').run();
    await db.prepare('CREATE INDEX IF NOT EXISTS idx_card_configs_metric ON card_configs(metric_id)').run();

    console.log('Indexes created successfully');
    console.log('Inserting template suggestions...');

    // Insert example template suggestions
    const suggestions = [
      ['total_bookings', 'reservations', 'Total Bookings', 'COUNT', '*', 'Count of all reservations'],
      ['total_revenue', 'reservations', 'Total Revenue', 'SUM', 'revenue', 'Sum of all revenue'],
      ['average_daily_rate', 'reservations', 'Average Daily Rate', 'AVG', 'room_rate', 'Average room rate'],
      ['unique_guests', 'reservations', 'Unique Guests', 'COUNT_DISTINCT', 'guest_id', 'Count of unique guests'],
      ['total_rooms_sold', 'reservations', 'Total Rooms Sold', 'COUNT', 'room_id', 'Total number of rooms sold'],
      ['max_revenue', 'reservations', 'Maximum Revenue', 'MAX', 'revenue', 'Highest revenue transaction'],
    ];

    for (const [name, table_key, metric, agg_type, agg_col, desc] of suggestions) {
      await db.prepare(
        `INSERT OR IGNORE INTO template_suggestions 
         (suggestion_name, table_key, metric_name, aggregation_type, aggregation_column, description)
         VALUES (?, ?, ?, ?, ?, ?)`
      ).bind(name, table_key, metric, agg_type, agg_col, desc).run();
    }

    console.log('Template suggestions inserted successfully');
    console.log('Verifying schema...');

    // Verify hotels table structure
    const hotelsSchema = await db.prepare('PRAGMA table_info(hotels)').all();
    const columnNames = hotelsSchema.results.map((col: any) => col.name);

    console.log('Hotels table columns:', columnNames);

    // Check for service_account_json column specifically
    const hasServiceAccountJson = columnNames.includes('service_account_json');

    if (!hasServiceAccountJson) {
      throw new Error('service_account_json column was not created! Schema verification failed.');
    }

    // Verify all tables were created
    const tablesResult = await db
      .prepare("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name")
      .all();

    const tables = tablesResult.results.map((t: any) => t.name);

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Database initialized successfully. All tables recreated with correct schema.',
        tables,
        hotelsColumns: columnNames,
        verified: hasServiceAccountJson,
      }),
      { status: 200, headers }
    );
  } catch (error: any) {
    console.error('Database initialization error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'Failed to initialize database',
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

// Handle OPTIONS for CORS preflight
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













