import type { APIRoute } from 'astro';
import { decrypt } from '../../../lib/encryption';
import { BigQuery } from '@google-cloud/bigquery';

const headers = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export const OPTIONS: APIRoute = async () => {
  return new Response(null, { status: 204, headers });
};

export const GET: APIRoute = async ({ url, locals }) => {
  try {
    const env = (locals as any).runtime?.env;
    const db = env?.DB;

    if (!db) {
      return new Response(
        JSON.stringify({ error: 'Database not configured' }),
        { status: 500, headers }
      );
    }

    const hotel_code = url.searchParams.get('hotel_code');
    const year = url.searchParams.get('year');
    const month = url.searchParams.get('month');

    if (!hotel_code || !year || !month) {
      return new Response(
        JSON.stringify({ error: 'hotel_code, year, and month are required' }),
        { status: 400, headers }
      );
    }

    // Get hotel configuration
    const hotelResult = await db
      .prepare('SELECT * FROM hotels WHERE hotel_code = ?')
      .bind(hotel_code)
      .first();

    if (!hotelResult) {
      return new Response(
        JSON.stringify({ error: 'Hotel not found' }),
        { status: 404, headers }
      );
    }

    const hotel = hotelResult as any;

    // Get all metric definitions
    const metricsResult = await db
      .prepare(`
        SELECT 
          md.id,
          md.metric_name,
          md.data_template_id,
          md.formula,
          md.format_type,
          md.decimal_places,
          md.prefix,
          md.suffix,
          md.category,
          md.description,
          dt.template_name,
          dt.query_template,
          dt.output_columns
        FROM metric_definitions md
        LEFT JOIN data_templates dt ON md.data_template_id = dt.id
        ORDER BY md.display_order, md.metric_name
      `)
      .all();

    if (!metricsResult.results || metricsResult.results.length === 0) {
      return new Response(
        JSON.stringify({ metrics: [] }),
        { status: 200, headers }
      );
    }

    const metrics = metricsResult.results as any[];

    // Decrypt service account
    const encryptionKey = env?.ENCRYPTION_KEY;
    if (!encryptionKey) {
      return new Response(
        JSON.stringify({ error: 'Encryption key not configured' }),
        { status: 500, headers }
      );
    }

    const serviceAccountJson = await decrypt(hotel.service_account_json, encryptionKey);
    const serviceAccount = JSON.parse(serviceAccountJson);

    // Initialize BigQuery
    const bigquery = new BigQuery({
      projectId: hotel.project_id,
      credentials: serviceAccount,
    });

    // Group metrics by data template to avoid duplicate queries
    const templateGroups = new Map<number, any[]>();
    for (const metric of metrics) {
      const templateId = metric.data_template_id;
      if (!templateGroups.has(templateId)) {
        templateGroups.set(templateId, []);
      }
      templateGroups.get(templateId)!.push(metric);
    }

    // Execute queries per template and calculate all metrics
    const allResults: any[] = [];

    for (const [templateId, templateMetrics] of templateGroups) {
      try {
        const firstMetric = templateMetrics[0];
        
        // Check if we have a query template
        if (!firstMetric.query_template) {
          // Add error for all metrics in this template
          for (const metric of templateMetrics) {
            allResults.push({
              metricId: metric.id,
              value: '—',
              rawValue: 0,
              displayName: metric.metric_name,
              error: 'No query template defined',
            });
          }
          continue;
        }

        // Build and execute the query once for this template
        const query = buildQuery(firstMetric, hotel, year, month);
        const [rows] = await bigquery.query({ query });
        const row = rows[0] || {};

        // Parse output columns
        const outputColumns = JSON.parse(firstMetric.output_columns || '[]');

        // First, add all raw column values as metrics
        for (const columnName of outputColumns) {
          if (row.hasOwnProperty(columnName)) {
            const rawValue = Number(row[columnName]) || 0;
            allResults.push({
              metricId: `${templateId}_${columnName}`,
              value: rawValue.toFixed(2),
              rawValue,
              displayName: columnName,
              category: firstMetric.category || 'Raw Data',
            });
          }
        }

        // Then, calculate all formula-based metrics for this template
        for (const metric of templateMetrics) {
          try {
            const rawValue = evaluateFormula(metric.formula, row, hotel);
            const formattedValue = formatValue(rawValue, metric);

            allResults.push({
              metricId: metric.id,
              value: formattedValue,
              rawValue,
              displayName: metric.metric_name,
              category: metric.category,
            });
          } catch (error: any) {
            console.error(`Error calculating metric ${metric.metric_name}:`, error);
            allResults.push({
              metricId: metric.id,
              value: 'Error',
              rawValue: 0,
              displayName: metric.metric_name,
              error: error.message,
            });
          }
        }
      } catch (error: any) {
        console.error(`Error fetching data for template ${templateId}:`, error);
        // Add error for all metrics in this template
        for (const metric of templateMetrics) {
          allResults.push({
            metricId: metric.id,
            value: 'Error',
            rawValue: 0,
            displayName: metric.metric_name,
            error: error.message,
          });
        }
      }
    }

    return new Response(JSON.stringify(allResults), {
      status: 200,
      headers,
    });
  } catch (error: any) {
    console.error('Error fetching metrics:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers }
    );
  }
};

function buildQuery(metric: any, hotel: any, year: string, month: string): string {
  let query = metric.query_template;

  // Replace placeholders
  query = query.replace(/\{project_id\}/g, hotel.project_id);
  query = query.replace(/\{dataset_id\}/g, hotel.dataset_id);
  query = query.replace(/\{year\}/g, year);
  query = query.replace(/\{month\}/g, month.padStart(2, '0'));

  return query;
}

function formatValue(value: number, metric: any): string {
  const formatted = value.toFixed(metric.decimal_places || 0);
  const prefix = metric.prefix || '';
  const suffix = metric.suffix || '';
  return `${prefix}${formatted}${suffix}`;
}

function evaluateFormula(formula: string, values: Record<string, any>, hotel: any): number {
  try {
    // If formula is just a column name, return that value
    if (values.hasOwnProperty(formula)) {
      return Number(values[formula]) || 0;
    }

    // Replace column names with their values
    let expression = formula;
    
    // First, replace ROOM_COUNT with the hotel's total_rooms value
    if (hotel.total_rooms) {
      expression = expression.replace(/\bROOM_COUNT\b/g, String(hotel.total_rooms));
    }
    
    // Then replace column names with their values
    for (const [key, value] of Object.entries(values)) {
      // Only replace if it's a number
      if (typeof value === 'number' || !isNaN(Number(value))) {
        expression = expression.replace(new RegExp(`\\b${key}\\b`, 'g'), String(value));
      }
    }

    // Safely evaluate the expression
    // Note: In production, use a proper expression evaluator library
    const result = eval(expression);
    return Number(result) || 0;
  } catch (error) {
    console.error('Error evaluating formula:', error, 'Formula:', formula, 'Values:', values);
    return 0;
  }
}








