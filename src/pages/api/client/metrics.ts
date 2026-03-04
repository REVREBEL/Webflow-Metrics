import type { APIRoute } from 'astro';
import { decrypt } from '../../../lib/encryption';
import { BigQuery } from '@google-cloud/bigquery';

const headers = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

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

    const body = await request.json() as {
      hotel_code: string;
      year: number;
      month: number;
    };
    const { hotel_code, year, month } = body;

    if (!hotel_code || !year || !month) {
      return new Response(
        JSON.stringify({ error: 'hotel_code, year, and month are required' }),
        { status: 400, headers }
      );
    }

    // Fetch hotel configuration
    const hotel = await db
      .prepare('SELECT * FROM hotels WHERE hotel_code = ?')
      .bind(hotel_code)
      .first() as any;

    if (!hotel) {
      return new Response(
        JSON.stringify({ error: 'Hotel not found' }),
        { status: 404, headers }
      );
    }

    // Fetch all global query templates
    const templates = await db
      .prepare('SELECT * FROM global_query_templates ORDER BY template_name')
      .all();

    if (!templates.results || templates.results.length === 0) {
      return new Response(
        JSON.stringify({ metrics: [] }),
        { status: 200, headers }
      );
    }

    // Decrypt service account JSON
    const serviceAccountJson = await decrypt(hotel.service_account_json, env);
    const credentials = JSON.parse(serviceAccountJson);

    // Initialize BigQuery client
    const bigquery = new BigQuery({
      projectId: hotel.project_id,
      credentials,
      location: hotel.data_location || 'US',
    });

    // Calculate date range
    const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
    const lastDay = new Date(year, month, 0).getDate();
    const endDate = `${year}-${String(month).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;

    // Execute all queries
    const metricPromises = (templates.results as any[]).map(async (template) => {
      try {
        // Replace placeholders in the query
        let query = template.sql_query
          .replace(/\{\{hotel_code\}\}/g, hotel_code)
          .replace(/\{\{project_id\}\}/g, hotel.project_id)
          .replace(/\{\{dataset_id\}\}/g, hotel.dataset_id || '')
          .replace(/\{\{table_id\}\}/g, hotel.table_id || '')
          .replace(/\{\{start_date\}\}/g, startDate)
          .replace(/\{\{end_date\}\}/g, endDate)
          .replace(/\{\{year\}\}/g, String(year))
          .replace(/\{\{month\}\}/g, String(month));

        // Execute query
        const [rows] = await bigquery.query({ query });

        // Extract the first row's first value
        let value = null;
        if (rows && rows.length > 0) {
          const firstRow = rows[0];
          // Get the first column value
          const keys = Object.keys(firstRow);
          if (keys.length > 0) {
            value = firstRow[keys[0]];
          }
        }

        return {
          metric_name: template.metric_name,
          value,
          success: true,
        };
      } catch (error: any) {
        console.error(`Error executing query for ${template.metric_name}:`, error);
        return {
          metric_name: template.metric_name,
          value: null,
          success: false,
          error: error.message,
        };
      }
    });

    const metrics = await Promise.all(metricPromises);

    return new Response(
      JSON.stringify({ metrics }),
      { status: 200, headers }
    );
  } catch (error: any) {
    console.error('Error fetching metrics:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
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
