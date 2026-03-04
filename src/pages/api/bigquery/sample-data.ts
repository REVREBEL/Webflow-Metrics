import type { APIRoute } from 'astro';

// Mock data generator for testing without a real BigQuery connection
export const GET: APIRoute = async ({ url }) => {
  const metricType = url.searchParams.get('type') || 'count';
  
  let sampleData: any[] = [];

  switch (metricType) {
    case 'count':
      sampleData = [{ value: 12453, metric: 'Total Count' }];
      break;
    case 'revenue':
      sampleData = [{ total_revenue: 284750.45, currency: 'USD' }];
      break;
    case 'users':
      sampleData = [{ active_users: 3421, new_users: 285 }];
      break;
    case 'time_series':
      sampleData = [
        { date: '2024-01-01', value: 100 },
        { date: '2024-01-02', value: 150 },
        { date: '2024-01-03', value: 175 },
        { date: '2024-01-04', value: 200 },
        { date: '2024-01-05', value: 225 },
      ];
      break;
    default:
      sampleData = [{ value: Math.floor(Math.random() * 10000) }];
  }

  return new Response(
    JSON.stringify({
      success: true,
      data: sampleData,
      cached: false,
      timestamp: new Date().toISOString(),
      sample: true,
    }),
    {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    }
  );
};
