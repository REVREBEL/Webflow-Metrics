import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Textarea } from './ui/textarea';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Alert, AlertDescription } from './ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { SecurityNote } from './SecurityNote';
import { baseUrl } from '../lib/base-url';

interface MetricConfig {
  id: string;
  name: string;
  tableName: string;
  query: string;
  variables?: QueryVariable[];
  slot?: 'primary' | 'metric1' | 'metric2' | 'metric3' | 'metric4'; // KPI Card slot assignment
}

interface QueryVariable {
  name: string;
  type: 'date' | 'string' | 'number';
  defaultValue?: string;
}

interface BigQueryConfigProps {
  onConfigComplete: (config: {
    serviceAccountJson: string;
    dataLocation: string;
    metrics: MetricConfig[];
  }) => void;
}

interface TestConnectionResponse {
  success: boolean;
  projectId?: string;
  error?: string;
}

const STORAGE_KEY = 'bigquery_config';

export function BigQueryConfig({ onConfigComplete }: BigQueryConfigProps) {
  const [serviceAccountJson, setServiceAccountJson] = useState('');
  const [dataLocation, setDataLocation] = useState('US');
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<{
    success?: boolean;
    message?: string;
    projectId?: string;
  }>({});
  
  const [metrics, setMetrics] = useState<MetricConfig[]>([
    { id: '1', name: '', tableName: '', query: '', variables: [], slot: 'primary' }
  ]);
  
  const [activeTab, setActiveTab] = useState('connection');
  const [hasTestedConnection, setHasTestedConnection] = useState(false);

  // Load saved config from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const config = JSON.parse(saved);
        if (config.serviceAccountJson) {
          setServiceAccountJson(config.serviceAccountJson);
        }
        if (config.dataLocation) {
          setDataLocation(config.dataLocation);
        }
        if (config.metrics && config.metrics.length > 0) {
          setMetrics(config.metrics);
        }
        // If we have saved credentials, mark connection as tested
        if (config.serviceAccountJson && config.connectionTested) {
          setConnectionStatus({
            success: true,
            message: '✓ Using saved credentials',
            projectId: config.projectId,
          });
          setHasTestedConnection(true);
        }
      }
    } catch (error) {
      console.warn('Failed to load saved configuration:', error);
    }
  }, []);

  // Save config to localStorage whenever it changes
  const saveToLocalStorage = (config: { 
    serviceAccountJson: string; 
    dataLocation: string;
    metrics: MetricConfig[];
    connectionTested?: boolean;
    projectId?: string;
  }) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
    } catch (error) {
      console.warn('Failed to save configuration:', error);
    }
  };

  const handleTestConnection = async () => {
    setIsTestingConnection(true);
    setConnectionStatus({});

    try {
      const response = await fetch(`${baseUrl}/api/bigquery/test-connection`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ serviceAccountJson, dataLocation }),
      });

      const result = await response.json() as TestConnectionResponse;

      if (result.success && result.projectId) {
        setConnectionStatus({
          success: true,
          message: `✓ Connection successful! Project ID: ${result.projectId}`,
          projectId: result.projectId,
        });
        setHasTestedConnection(true);
        // Save credentials with connection success flag
        saveToLocalStorage({ 
          serviceAccountJson, 
          dataLocation, 
          metrics,
          connectionTested: true,
          projectId: result.projectId
        });
        // Auto-advance to metrics tab after successful connection
        setTimeout(() => setActiveTab('metrics'), 1500);
      } else {
        setConnectionStatus({
          success: false,
          message: `✗ ${result.error || 'Connection failed'}`,
        });
        setHasTestedConnection(false);
      }
    } catch (error) {
      setConnectionStatus({
        success: false,
        message: '✗ Failed to test connection. Please check your JSON and try again.',
      });
      setHasTestedConnection(false);
    } finally {
      setIsTestingConnection(false);
    }
  };

  const addMetric = () => {
    const usedSlots = new Set(metrics.map(m => m.slot).filter(Boolean));
    const availableSlot = (['primary', 'metric1', 'metric2', 'metric3', 'metric4'] as const)
      .find(slot => !usedSlots.has(slot)) || 'metric1';
    
    setMetrics([
      ...metrics,
      { 
        id: Date.now().toString(), 
        name: '', 
        tableName: '', 
        query: '', 
        variables: [],
        slot: availableSlot
      }
    ]);
  };

  const removeMetric = (id: string) => {
    if (metrics.length > 1) {
      setMetrics(metrics.filter(m => m.id !== id));
    }
  };

  const updateMetric = (id: string, field: keyof MetricConfig, value: string | QueryVariable[] | MetricConfig['slot']) => {
    setMetrics(metrics.map(m => 
      m.id === id ? { ...m, [field]: value } : m
    ));
  };

  const addVariableToMetric = (metricId: string) => {
    setMetrics(metrics.map(m => {
      if (m.id === metricId) {
        const variables = m.variables || [];
        return {
          ...m,
          variables: [...variables, { name: '', type: 'date' as const, defaultValue: '' }]
        };
      }
      return m;
    }));
  };

  const updateVariable = (metricId: string, varIndex: number, field: keyof QueryVariable, value: string) => {
    setMetrics(metrics.map(m => {
      if (m.id === metricId && m.variables) {
        const newVariables = [...m.variables];
        // Strip @ symbol from variable names
        const cleanedValue = field === 'name' && value.startsWith('@') ? value.substring(1) : value;
        newVariables[varIndex] = { ...newVariables[varIndex], [field]: cleanedValue };
        return { ...m, variables: newVariables };
      }
      return m;
    }));
  };

  const removeVariable = (metricId: string, varIndex: number) => {
    setMetrics(metrics.map(m => {
      if (m.id === metricId && m.variables) {
        return { ...m, variables: m.variables.filter((_, i) => i !== varIndex) };
      }
      return m;
    }));
  };

  const handleSaveConfiguration = () => {
    // Validate all fields
    const hasEmptyFields = metrics.some(m => !m.name || !m.query);
    if (!serviceAccountJson || hasEmptyFields) {
      alert('Please fill in at least the Metric Name and SQL Query fields before saving');
      return;
    }

    const config = {
      serviceAccountJson,
      dataLocation,
      metrics,
      connectionTested: hasTestedConnection,
      projectId: connectionStatus.projectId,
    };

    // Save to localStorage
    saveToLocalStorage(config);

    onConfigComplete(config);
  };

  const handleClearConfig = () => {
    if (confirm('Are you sure you want to clear all saved configuration?')) {
      localStorage.removeItem(STORAGE_KEY);
      setServiceAccountJson('');
      setDataLocation('US');
      setMetrics([{ id: '1', name: '', tableName: '', query: '', variables: [], slot: 'primary' }]);
      setConnectionStatus({});
      setHasTestedConnection(false);
      setActiveTab('connection');
    }
  };

  const isConnectionValid = hasTestedConnection && connectionStatus.success === true;

  // Get available slots for a metric (excluding already used ones, except the metric's own slot)
  const getAvailableSlots = (currentMetricId: string) => {
    const usedSlots = new Set(
      metrics
        .filter(m => m.id !== currentMetricId)
        .map(m => m.slot)
        .filter(Boolean)
    );
    
    return (['primary', 'metric1', 'metric2', 'metric3', 'metric4'] as const)
      .filter(slot => !usedSlots.has(slot));
  };

  return (
    <div className="w-full max-w-5xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl">BigQuery Dashboard Configuration</CardTitle>
              <CardDescription>
                Configure your BigQuery connection and define metrics for your dashboard
              </CardDescription>
            </div>
            {(serviceAccountJson || metrics.some(m => m.name)) && (
              <Button variant="outline" size="sm" onClick={handleClearConfig}>
                Clear Config
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="connection">1. Connection</TabsTrigger>
              <TabsTrigger value="metrics" disabled={!isConnectionValid}>
                2. Metrics
              </TabsTrigger>
            </TabsList>

            <TabsContent value="connection" className="space-y-4">
              <SecurityNote />
              
              <div className="space-y-2">
                <Label htmlFor="serviceAccount">
                  Service Account JSON <span className="text-destructive">*</span>
                </Label>
                <Textarea
                  id="serviceAccount"
                  placeholder='Paste your Google Cloud service account JSON here...

Example:
{
  "type": "service_account",
  "project_id": "your-project",
  "private_key_id": "...",
  "private_key": "-----BEGIN PRIVATE KEY-----\\n...\\n-----END PRIVATE KEY-----\\n",
  "client_email": "...",
  ...
}'
                  value={serviceAccountJson}
                  onChange={(e) => setServiceAccountJson(e.target.value)}
                  rows={14}
                  className="font-mono text-sm"
                />
                <p className="text-sm text-muted-foreground">
                  Required roles: <strong>BigQuery Data Viewer</strong> and <strong>BigQuery Job User</strong>
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="dataLocation">
                  Data Location <span className="text-destructive">*</span>
                </Label>
                <Select value={dataLocation} onValueChange={setDataLocation}>
                  <SelectTrigger id="dataLocation">
                    <SelectValue placeholder="Select data location" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="US">US (Multi-region)</SelectItem>
                    <SelectItem value="EU">EU (Multi-region)</SelectItem>
                    <SelectItem value="us-central1">us-central1</SelectItem>
                    <SelectItem value="us-east1">us-east1</SelectItem>
                    <SelectItem value="us-east4">us-east4</SelectItem>
                    <SelectItem value="us-west1">us-west1</SelectItem>
                    <SelectItem value="us-west2">us-west2</SelectItem>
                    <SelectItem value="us-west3">us-west3</SelectItem>
                    <SelectItem value="us-west4">us-west4</SelectItem>
                    <SelectItem value="europe-north1">europe-north1</SelectItem>
                    <SelectItem value="europe-west1">europe-west1</SelectItem>
                    <SelectItem value="europe-west2">europe-west2</SelectItem>
                    <SelectItem value="europe-west3">europe-west3</SelectItem>
                    <SelectItem value="europe-west4">europe-west4</SelectItem>
                    <SelectItem value="europe-west6">europe-west6</SelectItem>
                    <SelectItem value="asia-east1">asia-east1</SelectItem>
                    <SelectItem value="asia-east2">asia-east2</SelectItem>
                    <SelectItem value="asia-northeast1">asia-northeast1</SelectItem>
                    <SelectItem value="asia-northeast2">asia-northeast2</SelectItem>
                    <SelectItem value="asia-northeast3">asia-northeast3</SelectItem>
                    <SelectItem value="asia-south1">asia-south1</SelectItem>
                    <SelectItem value="asia-southeast1">asia-southeast1</SelectItem>
                    <SelectItem value="asia-southeast2">asia-southeast2</SelectItem>
                    <SelectItem value="australia-southeast1">australia-southeast1</SelectItem>
                    <SelectItem value="southamerica-east1">southamerica-east1</SelectItem>
                    <SelectItem value="northamerica-northeast1">northamerica-northeast1</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-sm text-muted-foreground">
                  Select the location where your BigQuery datasets are stored. Must match your data location.
                </p>
              </div>

              {connectionStatus.message && (
                <Alert variant={connectionStatus.success ? 'default' : 'destructive'}>
                  <AlertDescription>{connectionStatus.message}</AlertDescription>
                </Alert>
              )}

              {hasTestedConnection && connectionStatus.success ? (
                <Button 
                  onClick={() => setActiveTab('metrics')}
                  className="w-full"
                  size="lg"
                >
                  Continue to Metrics Setup →
                </Button>
              ) : (
                <Button 
                  onClick={handleTestConnection} 
                  disabled={!serviceAccountJson || isTestingConnection}
                  className="w-full"
                  size="lg"
                >
                  {isTestingConnection ? 'Testing Connection...' : 'Test Connection'}
                </Button>
              )}
            </TabsContent>

            <TabsContent value="metrics" className="space-y-4">
              <Alert>
                <AlertDescription>
                  <strong>KPI Card Integration:</strong> Assign each metric to a slot on your dashboard card.
                  <br />
                  • <strong>Primary:</strong> Large featured metric
                  <br />
                  • <strong>Metric 1-4:</strong> Smaller supporting metrics
                </AlertDescription>
              </Alert>

              <div className="space-y-4">
                {metrics.map((metric, index) => (
                  <Card key={metric.id}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">Metric {index + 1}</CardTitle>
                        {metrics.length > 1 && (
                          <Button 
                            variant="destructive" 
                            size="sm"
                            onClick={() => removeMetric(metric.id)}
                          >
                            Remove
                          </Button>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor={`name-${metric.id}`}>
                            Metric Name <span className="text-destructive">*</span>
                          </Label>
                          <Input
                            id={`name-${metric.id}`}
                            placeholder="e.g., Total Revenue, Active Users"
                            value={metric.name}
                            onChange={(e) => updateMetric(metric.id, 'name', e.target.value)}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor={`slot-${metric.id}`}>
                            Dashboard Slot <span className="text-destructive">*</span>
                          </Label>
                          <Select 
                            value={metric.slot || 'primary'} 
                            onValueChange={(value) => updateMetric(metric.id, 'slot', value as MetricConfig['slot'])}
                          >
                            <SelectTrigger id={`slot-${metric.id}`}>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {getAvailableSlots(metric.id).map(slot => (
                                <SelectItem key={slot} value={slot}>
                                  {slot === 'primary' ? 'Primary (Featured)' : `Metric ${slot.replace('metric', '')}`}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <p className="text-xs text-muted-foreground">
                            Where this metric appears on the KPI card
                          </p>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor={`table-${metric.id}`}>
                          Table Name <span className="text-muted-foreground">(optional)</span>
                        </Label>
                        <Input
                          id={`table-${metric.id}`}
                          placeholder="e.g., project.dataset.table (for documentation)"
                          value={metric.tableName}
                          onChange={(e) => updateMetric(metric.id, 'tableName', e.target.value)}
                        />
                        <p className="text-xs text-muted-foreground">
                          For reference only - use the full table path in your query
                        </p>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor={`query-${metric.id}`}>
                          SQL Query <span className="text-destructive">*</span>
                        </Label>
                        <Textarea
                          id={`query-${metric.id}`}
                          placeholder={`SELECT COUNT(*) as value 
FROM \`${connectionStatus.projectId || 'project'}.dataset.table\`
WHERE date BETWEEN @start_date AND @end_date`}
                          value={metric.query}
                          onChange={(e) => updateMetric(metric.id, 'query', e.target.value)}
                          rows={8}
                          className="font-mono text-sm"
                        />
                        <p className="text-xs text-muted-foreground">
                          <strong>In your SQL:</strong> Use <code className="bg-muted px-1 py-0.5 rounded">@variable_name</code> for parameters.
                          <br />
                          <strong>Below:</strong> Define variable names <strong>without</strong> the @ symbol.
                        </p>
                      </div>

                      {/* Query Variables */}
                      <div className="space-y-3 border-t pt-4">
                        <div className="flex items-center justify-between">
                          <Label className="text-base">Query Variables</Label>
                          <Button 
                            type="button"
                            variant="outline" 
                            size="sm"
                            onClick={() => addVariableToMetric(metric.id)}
                          >
                            + Add Variable
                          </Button>
                        </div>
                        
                        {metric.variables && metric.variables.length > 0 ? (
                          <div className="space-y-3">
                            {metric.variables.map((variable, varIndex) => (
                              <div key={varIndex} className="flex gap-2 items-start p-3 border rounded-lg">
                                <div className="flex-1 space-y-2">
                                  <div className="grid grid-cols-3 gap-2">
                                    <div>
                                      <Label className="text-xs">Variable Name</Label>
                                      <Input
                                        placeholder="e.g., start_date (no @)"
                                        value={variable.name}
                                        onChange={(e) => updateVariable(metric.id, varIndex, 'name', e.target.value)}
                                        className="text-sm"
                                      />
                                    </div>
                                    <div>
                                      <Label className="text-xs">Type</Label>
                                      <Select 
                                        value={variable.type} 
                                        onValueChange={(value) => updateVariable(metric.id, varIndex, 'type', value)}
                                      >
                                        <SelectTrigger className="text-sm">
                                          <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                          <SelectItem value="date">Date</SelectItem>
                                          <SelectItem value="string">String</SelectItem>
                                          <SelectItem value="number">Number</SelectItem>
                                        </SelectContent>
                                      </Select>
                                    </div>
                                    <div>
                                      <Label className="text-xs">Default Value</Label>
                                      <Input
                                        placeholder={variable.type === 'date' ? 'YYYY-MM-DD' : 'default value'}
                                        value={variable.defaultValue || ''}
                                        onChange={(e) => updateVariable(metric.id, varIndex, 'defaultValue', e.target.value)}
                                        className="text-sm"
                                      />
                                    </div>
                                  </div>
                                </div>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => removeVariable(metric.id, varIndex)}
                                  className="mt-5"
                                >
                                  ×
                                </Button>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-sm text-muted-foreground">
                            No variables defined. Add variables to make your queries dynamic (e.g., date ranges).
                          </p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {metrics.length < 5 && (
                <Button onClick={addMetric} variant="outline" className="w-full">
                  + Add Another Metric (Max 5)
                </Button>
              )}

              <Button 
                onClick={handleSaveConfiguration}
                className="w-full"
                size="lg"
              >
                Save Configuration & View Dashboard
              </Button>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
