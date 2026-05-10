import type { APIRoute } from 'astro';

/**
 * Configuration Export Endpoint
 * 
 * Exports all configuration data from the database including:
 * - Hotels (with encrypted credentials)
 * - Query Templates
 * - Global Query Templates
 * - Data Templates
 * - Metric Definitions
 * - Card Configurations
 * - BigQuery Tables Registry
 * - BigQuery Table Columns
 * - Query Templates V2
 * - Template Suggestions
 * 
 * Usage: GET /api/admin/export-config
 */
export const GET: APIRoute = async ({ locals }) => {
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
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

    console.log('Exporting configuration...');

    // Export all configuration tables
    const config: any = {
      version: '1.0',
      exported_at: new Date().toISOString(),
      data: {},
    };

    // Hotels
    const hotels = await db.prepare('SELECT * FROM hotels').all();
    config.data.hotels = hotels.results;

    // Query Templates
    const queryTemplates = await db.prepare('SELECT * FROM query_templates').all();
    config.data.query_templates = queryTemplates.results;

    // Global Query Templates
    try {
      const globalTemplates = await db.prepare('SELECT * FROM global_query_templates').all();
      config.data.global_query_templates = globalTemplates.results;
    } catch (e) {
      console.log('global_query_templates table does not exist');
      config.data.global_query_templates = [];
    }

    // Data Templates
    try {
      const dataTemplates = await db.prepare('SELECT * FROM data_templates').all();
      config.data.data_templates = dataTemplates.results;
    } catch (e) {
      console.log('data_templates table does not exist');
      config.data.data_templates = [];
    }

    // Metric Definitions
    try {
      const metricDefinitions = await db.prepare('SELECT * FROM metric_definitions').all();
      config.data.metric_definitions = metricDefinitions.results;
    } catch (e) {
      console.log('metric_definitions table does not exist');
      config.data.metric_definitions = [];
    }

    // Card Configurations
    try {
      const cardConfigs = await db.prepare('SELECT * FROM card_configs').all();
      config.data.card_configs = cardConfigs.results;
    } catch (e) {
      console.log('card_configs table does not exist');
      config.data.card_configs = [];
    }

    // BigQuery Tables Registry
    try {
      const bqTables = await db.prepare('SELECT * FROM bigquery_tables').all();
      config.data.bigquery_tables = bqTables.results;
    } catch (e) {
      console.log('bigquery_tables table does not exist');
      config.data.bigquery_tables = [];
    }

    // BigQuery Table Columns
    try {
      const bqColumns = await db.prepare('SELECT * FROM bigquery_table_columns').all();
      config.data.bigquery_table_columns = bqColumns.results;
    } catch (e) {
      console.log('bigquery_table_columns table does not exist');
      config.data.bigquery_table_columns = [];
    }

    // Query Templates V2
    try {
      const templatesV2 = await db.prepare('SELECT * FROM query_templates_v2').all();
      config.data.query_templates_v2 = templatesV2.results;
    } catch (e) {
      console.log('query_templates_v2 table does not exist');
      config.data.query_templates_v2 = [];
    }

    // Template Suggestions
    try {
      const suggestions = await db.prepare('SELECT * FROM template_suggestions').all();
      config.data.template_suggestions = suggestions.results;
    } catch (e) {
      console.log('template_suggestions table does not exist');
      config.data.template_suggestions = [];
    }

    console.log('Configuration exported successfully');

    // Return as downloadable JSON file
    return new Response(JSON.stringify(config, null, 2), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="dashboard-config-${new Date().toISOString().split('T')[0]}.json"`,
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (error: any) {
    console.error('Export error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'Failed to export configuration',
        details: error.toString(),
      }),
      { status: 500, headers }
    );
  }
};

// Handle OPTIONS for CORS
export const OPTIONS: APIRoute = async () => {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
};
