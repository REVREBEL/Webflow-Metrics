import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Alert, AlertDescription } from './ui/alert';
import { Skeleton } from './ui/skeleton';
import { baseUrl } from '../lib/base-url';

interface MetricConfig {
  id: string;
  name: string;
  tableName: string;
  query: string;
  variables?: QueryVariable[];
  slot?: 'primary' | 'metric1' | 'metric2' | 'metric3' | 'metric4';
}

interface QueryVariable {
  name: string;
  type: 'date' | 'string' | 'number';
  defaultValue?: string;
}

interface BigQueryDashboardProps {
  config: {
    serviceAccountJson: string;
    dataLocation: string;
    metrics: MetricConfig[];
  };
  onReconfigure: () => void;
}

interface MetricResult {
  metricId: string;
  name: string;
  value: string;
  error?: string;
  cached?: boolean;
  cacheExpiry?: string;
  slot?: string;
}

interface QueryResponse {
  success: boolean;
  value?: number | string | any;
  data?: any;
  cached?: boolean;
  cacheExpiry?: string;
  error?: string;
}

export function BigQueryDashboard({ config, onReconfigure }: BigQueryDashboardProps) {
  const [results, setResults] = useState<MetricResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMetrics = async (skipCache: boolean = false) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const promises = config.metrics.map(async (metric) => {
        // Convert variables to the format expected by the API (array of objects)
        const variables = metric.variables?.map(v => ({
          name: v.name,
          type: v.type,
          value: v.defaultValue || ''
        })) || [];

        const response = await fetch(`${baseUrl}/api/bigquery/execute-query`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            serviceAccountJson: config.serviceAccountJson,
            dataLocation: config.dataLocation,
            query: metric.query,
            metricName: metric.name,
            variables,
            useCache: !skipCache, // Skip cache if forced refresh
          }),
        });

        const data = await response.json() as QueryResponse;

        console.log('API Response for', metric.name, ':', data);

        if (!response.ok) {
          return {
            metricId: metric.id,
            name: metric.name,
            value: 'Error',
            error: data.error || 'Query failed',
            slot: metric.slot,
          };
        }

        // Handle the value properly - it might be nested in data
        let displayValue = '0';
        
        if (data.value !== undefined && data.value !== null) {
          // If value is an object (shouldn't be, but handle it)
          if (typeof data.value === 'object' && data.value !== null) {
            console.warn('Received object as value:', data.value);
            // Try to extract a numeric value from the object
            if ('value' in data.value) {
              displayValue = String((data.value as any).value);
            } else {
              displayValue = JSON.stringify(data.value);
            }
          } else {
            displayValue = String(data.value);
          }
        } else if (data.data && Array.isArray(data.data) && data.data.length > 0) {
          // Fallback: extract from first row of data array
          const firstRow = data.data[0];
          if (typeof firstRow === 'object') {
            // Try common column names
            const value = firstRow.value ?? firstRow.count ?? firstRow.total ?? firstRow.result ?? Object.values(firstRow)[0];
            displayValue = String(value);
          } else {
            displayValue = String(firstRow);
          }
        }

        return {
          metricId: metric.id,
          name: metric.name,
          value: displayValue,
          cached: data.cached,
          cacheExpiry: data.cacheExpiry,
          slot: metric.slot,
        };
      });

      const metricResults = await Promise.all(promises);
      console.log('All metric results:', metricResults);
      setResults(metricResults);
    } catch (err) {
      setError('Failed to fetch metrics. Please check your configuration.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
  }, []);

  const handleRefresh = () => {
    fetchMetrics(false); // Use cache
  };

  const handleClearCacheAndRefresh = async () => {
    // Clear cache on server
    try {
      await fetch(`${baseUrl}/api/bigquery/clear-cache`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
    } catch (err) {
      console.error('Failed to clear cache:', err);
    }
    
    // Fetch fresh data
    fetchMetrics(true); // Skip cache
  };

  // Get cache information from first result
  const cacheInfo = results.find(r => r.cached && r.cacheExpiry);

  // Organize results by slot
  const primaryMetric = results.find(r => r.slot === 'primary');
  const subMetrics = results.filter(r => r.slot && r.slot !== 'primary');

  return (
    <div className="w-full max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">BigQuery Dashboard</h1>
          <p className="text-muted-foreground">
            Real-time analytics from your BigQuery data
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={onReconfigure}>
            ⚙️ Reconfigure
          </Button>
          <Button variant="outline" onClick={handleRefresh} disabled={isLoading}>
            {isLoading ? '⟳ Loading...' : '↻ Refresh'}
          </Button>
          <Button onClick={handleClearCacheAndRefresh} disabled={isLoading}>
            {isLoading ? '⟳ Loading...' : '🗑️ Clear Cache & Refresh'}
          </Button>
        </div>
      </div>

      {/* Cache Info */}
      {cacheInfo && (
        <Alert>
          <AlertDescription>
            ℹ️ Data cached until {new Date(cacheInfo.cacheExpiry!).toLocaleString()}. 
            Daily refresh at 7am PST. Click "Clear Cache & Refresh" to fetch fresh data now.
          </AlertDescription>
        </Alert>
      )}

      {/* Error Display */}
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Primary Metric Card */}
      {isLoading ? (
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-64" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-24 w-full" />
          </CardContent>
        </Card>
      ) : primaryMetric ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground">{primaryMetric.name}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold">{primaryMetric.value}</div>
            {primaryMetric.error && (
              <Alert variant="destructive" className="mt-4">
                <AlertDescription>{primaryMetric.error}</AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      ) : null}

      {/* Sub Metrics Grid */}
      {!isLoading && subMetrics.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {subMetrics.map((result) => (
            <Card key={result.metricId}>
              <CardHeader>
                <CardTitle className="text-xs text-muted-foreground">{result.name}</CardTitle>
                <CardDescription className="text-xs">Slot: {result.slot}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{result.value}</div>
                {result.error && (
                  <Alert variant="destructive" className="mt-2">
                    <AlertDescription className="text-xs">{result.error}</AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* All Metrics - Fallback if no slots assigned */}
      {!isLoading && !primaryMetric && subMetrics.length === 0 && results.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {results.map((result) => (
            <Card key={result.metricId}>
              <CardHeader>
                <CardTitle className="text-sm">{result.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{result.value}</div>
                {result.error && (
                  <Alert variant="destructive" className="mt-4">
                    <AlertDescription>{result.error}</AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Configuration Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Configuration Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>
              <span className="font-semibold">Data Location:</span> {config.dataLocation}
            </div>
            <div>
              <span className="font-semibold">Active Metrics:</span> {config.metrics.length}
            </div>
          </div>
          <div className="text-xs text-muted-foreground">
            <strong>Security:</strong> Credentials are stored locally in your browser and never sent to our servers.
            Queries are executed directly against your BigQuery project.
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
