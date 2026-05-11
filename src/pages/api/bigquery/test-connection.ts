import type { APIRoute } from 'astro';
import { createBigQueryClient } from '../../../lib/bigquery-rest-client';

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

    // Parse to validate and get project ID
    const credentials = JSON.parse(serviceAccountJson);
    const projectId = credentials.project_id;

    if (!projectId) {
      return new Response(
        JSON.stringify({ success: false, error: 'Invalid service account: missing project_id' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Test connection by creating client and running a simple query
    const client = createBigQueryClient(projectId, serviceAccountJson);
    
    // Run a simple query to test the connection
    await client.query({
      query: 'SELECT 1 as test',
      location: dataLocation || 'US',
      timeoutMs: 10000,
    });

    return new Response(
      JSON.stringify({ success: true, projectId }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    console.error('Test connection error:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message || 'Connection test failed' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};

