import type { APIRoute } from 'astro';

/**
 * Configuration Import Endpoint
 * 
 * Imports configuration data from a previously exported backup.
 * This will REPLACE all existing configuration data.
 * 
 * Usage: POST /api/admin/import-config
 * Body: JSON configuration file content
 */
export const POST: APIRoute = async ({ request, locals }) => {
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
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

    // Parse the uploaded configuration
    const config = await request.json();

    if (!config.version || !config.data) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Invalid configuration file format',
        }),
        { status: 400, headers }
      );
    }

    console.log('Importing configuration...');
    console.log('Config version:', config.version);
    console.log('Exported at:', config.exported_at);

    const imported: any = {
      hotels: 0,
      query_templates: 0,
      global_query_templates: 0,
      data_templates: 0,
      metric_definitions: 0,
      card_configs: 0,
      bigquery_tables: 0,
      bigquery_table_columns: 0,
      query_templates_v2: 0,
      template_suggestions: 0,
    };

    // Import Hotels
    if (config.data.hotels && config.data.hotels.length > 0) {
      console.log(`Importing ${config.data.hotels.length} hotels...`);
      
      for (const hotel of config.data.hotels) {
        try {
          await db.prepare(`
            INSERT OR REPLACE INTO hotels 
            (id, hotel_code, hotel_name, project_id, dataset_id, table_id, data_location, service_account_json, total_rooms, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          `).bind(
            hotel.id,
            hotel.hotel_code,
            hotel.hotel_name,
            hotel.project_id,
            hotel.dataset_id,
            hotel.table_id,
            hotel.data_location || 'US',
            hotel.service_account_json,
            hotel.total_rooms || null,
            hotel.created_at,
            hotel.updated_at
          ).run();
          imported.hotels++;
        } catch (e) {
          console.error(`Failed to import hotel ${hotel.hotel_code}:`, e);
        }
      }
    }

    // Import Query Templates
    if (config.data.query_templates && config.data.query_templates.length > 0) {
      console.log(`Importing ${config.data.query_templates.length} query templates...`);
      
      for (const template of config.data.query_templates) {
        try {
          await db.prepare(`
            INSERT OR REPLACE INTO query_templates 
            (id, template_id, hotel_code, template_name, sql_query, variables, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?)
          `).bind(
            template.id,
            template.template_id,
            template.hotel_code,
            template.template_name,
            template.sql_query,
            template.variables,
            template.created_at
          ).run();
          imported.query_templates++;
        } catch (e) {
          console.error(`Failed to import query template ${template.template_id}:`, e);
        }
      }
    }

    // Import Global Query Templates
    if (config.data.global_query_templates && config.data.global_query_templates.length > 0) {
      console.log(`Importing ${config.data.global_query_templates.length} global query templates...`);
      
      for (const template of config.data.global_query_templates) {
        try {
          await db.prepare(`
            INSERT OR REPLACE INTO global_query_templates 
            (id, template_name, metric_name, sql_query, description, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?)
          `).bind(
            template.id,
            template.template_name,
            template.metric_name,
            template.sql_query,
            template.description,
            template.created_at,
            template.updated_at
          ).run();
          imported.global_query_templates++;
        } catch (e) {
          console.error(`Failed to import global template ${template.template_name}:`, e);
        }
      }
    }

    // Import Data Templates
    if (config.data.data_templates && config.data.data_templates.length > 0) {
      console.log(`Importing ${config.data.data_templates.length} data templates...`);
      
      for (const template of config.data.data_templates) {
        try {
          await db.prepare(`
            INSERT OR REPLACE INTO data_templates 
            (id, template_name, description, query_template, output_columns, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?)
          `).bind(
            template.id,
            template.template_name,
            template.description,
            template.query_template,
            template.output_columns,
            template.created_at,
            template.updated_at
          ).run();
          imported.data_templates++;
        } catch (e) {
          console.error(`Failed to import data template ${template.template_name}:`, e);
        }
      }
    }

    // Import Metric Definitions
    if (config.data.metric_definitions && config.data.metric_definitions.length > 0) {
      console.log(`Importing ${config.data.metric_definitions.length} metric definitions...`);
      
      for (const metric of config.data.metric_definitions) {
        try {
          await db.prepare(`
            INSERT OR REPLACE INTO metric_definitions 
            (id, metric_name, data_template_id, formula, format_type, decimal_places, prefix, suffix, display_order, category, description, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          `).bind(
            metric.id,
            metric.metric_name,
            metric.data_template_id,
            metric.formula,
            metric.format_type || 'number',
            metric.decimal_places || 2,
            metric.prefix,
            metric.suffix,
            metric.display_order || 0,
            metric.category,
            metric.description,
            metric.created_at,
            metric.updated_at
          ).run();
          imported.metric_definitions++;
        } catch (e) {
          console.error(`Failed to import metric definition ${metric.metric_name}:`, e);
        }
      }
    }

    // Import Card Configurations
    if (config.data.card_configs && config.data.card_configs.length > 0) {
      console.log(`Importing ${config.data.card_configs.length} card configurations...`);
      
      for (const card of config.data.card_configs) {
        try {
          await db.prepare(`
            INSERT OR REPLACE INTO card_configs 
            (id, card_name, metric_id, position, size, color_scheme, show_trend, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
          `).bind(
            card.id,
            card.card_name,
            card.metric_id,
            card.position || 0,
            card.size || 'medium',
            card.color_scheme || 'default',
            card.show_trend !== undefined ? card.show_trend : 1,
            card.created_at,
            card.updated_at
          ).run();
          imported.card_configs++;
        } catch (e) {
          console.error(`Failed to import card config ${card.card_name}:`, e);
        }
      }
    }

    // Import BigQuery Tables
    if (config.data.bigquery_tables && config.data.bigquery_tables.length > 0) {
      console.log(`Importing ${config.data.bigquery_tables.length} BigQuery tables...`);
      
      for (const table of config.data.bigquery_tables) {
        try {
          await db.prepare(`
            INSERT OR REPLACE INTO bigquery_tables 
            (id, table_key, table_name, full_table_path, description, is_active, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
          `).bind(
            table.id,
            table.table_key,
            table.table_name,
            table.full_table_path,
            table.description,
            table.is_active !== undefined ? table.is_active : 1,
            table.created_at,
            table.updated_at
          ).run();
          imported.bigquery_tables++;
        } catch (e) {
          console.error(`Failed to import BigQuery table ${table.table_key}:`, e);
        }
      }
    }

    // Import BigQuery Table Columns
    if (config.data.bigquery_table_columns && config.data.bigquery_table_columns.length > 0) {
      console.log(`Importing ${config.data.bigquery_table_columns.length} BigQuery table columns...`);
      
      for (const column of config.data.bigquery_table_columns) {
        try {
          await db.prepare(`
            INSERT OR REPLACE INTO bigquery_table_columns 
            (id, table_id, column_name, column_type, is_filterable, is_groupable, is_aggregatable, description, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
          `).bind(
            column.id,
            column.table_id,
            column.column_name,
            column.column_type,
            column.is_filterable !== undefined ? column.is_filterable : 1,
            column.is_groupable !== undefined ? column.is_groupable : 1,
            column.is_aggregatable !== undefined ? column.is_aggregatable : 0,
            column.description,
            column.created_at
          ).run();
          imported.bigquery_table_columns++;
        } catch (e) {
          console.error(`Failed to import column ${column.column_name}:`, e);
        }
      }
    }

    // Import Query Templates V2
    if (config.data.query_templates_v2 && config.data.query_templates_v2.length > 0) {
      console.log(`Importing ${config.data.query_templates_v2.length} query templates v2...`);
      
      for (const template of config.data.query_templates_v2) {
        try {
          await db.prepare(`
            INSERT OR REPLACE INTO query_templates_v2 
            (id, template_name, metric_name, table_id, aggregation_type, aggregation_column, group_by_columns, group_by_function, filters, custom_sql, use_custom_sql, description, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          `).bind(
            template.id,
            template.template_name,
            template.metric_name,
            template.table_id,
            template.aggregation_type,
            template.aggregation_column,
            template.group_by_columns,
            template.group_by_function,
            template.filters,
            template.custom_sql,
            template.use_custom_sql !== undefined ? template.use_custom_sql : 0,
            template.description,
            template.created_at,
            template.updated_at
          ).run();
          imported.query_templates_v2++;
        } catch (e) {
          console.error(`Failed to import query template v2 ${template.template_name}:`, e);
        }
      }
    }

    // Import Template Suggestions
    if (config.data.template_suggestions && config.data.template_suggestions.length > 0) {
      console.log(`Importing ${config.data.template_suggestions.length} template suggestions...`);
      
      for (const suggestion of config.data.template_suggestions) {
        try {
          await db.prepare(`
            INSERT OR REPLACE INTO template_suggestions 
            (id, suggestion_name, table_key, metric_name, aggregation_type, aggregation_column, group_by_columns, filters, description, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          `).bind(
            suggestion.id,
            suggestion.suggestion_name,
            suggestion.table_key,
            suggestion.metric_name,
            suggestion.aggregation_type,
            suggestion.aggregation_column,
            suggestion.group_by_columns,
            suggestion.filters,
            suggestion.description,
            suggestion.created_at
          ).run();
          imported.template_suggestions++;
        } catch (e) {
          console.error(`Failed to import template suggestion ${suggestion.suggestion_name}:`, e);
        }
      }
    }

    console.log('Configuration imported successfully');
    console.log('Import summary:', imported);

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Configuration imported successfully',
        imported,
      }),
      { status: 200, headers }
    );
  } catch (error: any) {
    console.error('Import error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'Failed to import configuration',
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
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
};
