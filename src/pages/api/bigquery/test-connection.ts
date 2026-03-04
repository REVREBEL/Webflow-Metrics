import type { APIRoute } from 'astro';
import { BigQueryClient, parseServiceAccountJson } from '../../../lib/bigquery-client';

interface TestConnectionRequest {
  serviceAccountJson: string;
  dataLocation?: string;
}

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json() as TestConnectionRequest;
    const { serviceAccountJson, dataLocation } = body;

    if (!serviceAccountJson) {
      return new Response(
        JSON.stringify({ success: false, error: 'Service account JSON is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const credentials = parseServiceAccountJson(serviceAccountJson);
    const projectId = credentials.project_id;

    if (!projectId) {
      return new Response(
        JSON.stringify({ success: false, error: 'Invalid service account: missing project_id' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const client = new BigQueryClient({ credentials, projectId, location: dataLocation || 'US' });
    const isConnected = await client.testConnection();

    if (isConnected) {
      return new Response(
        JSON.stringify({ success: true, projectId }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    } else {
      return new Response(
        JSON.stringify({ success: false, error: 'Connection test failed' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }
  } catch (error: any) {
    console.error('Test connection error:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message || 'Connection test failed' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
