import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Badge } from './ui/badge';
import { baseUrl } from '../lib/base-url';
import MetricDiscovery from './MetricDiscovery';
import { Table, TableBody, TableCell, TableRow } from './ui/table';

interface DataTemplate {
  id: number;
  template_name: string;
  description?: string;
  query_template: string;
  output_columns: string[];
  created_at: string;
  updated_at: string;
}

interface MetricDefinition {
  id: number;
  metric_name: string;
  display_name: string;
  data_template_id: number;
  template_name: string;
  formula: string;
  format_type: string;
  decimal_places: number;
  prefix?: string;
  suffix?: string;
  display_order: number;
  category?: string;
  description?: string;
  output_columns: string[];
}

export default function MetricsManager() {
  const [templates, setTemplates] = useState<DataTemplate[]>([]);
  const [metrics, setMetrics] = useState<MetricDefinition[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [needsMigration, setNeedsMigration] = useState(false);
  const [dbCheckResult, setDbCheckResult] = useState<any>(null);

  // Form states
  const [showTemplateForm, setShowTemplateForm] = useState(false);
  const [showMetricForm, setShowMetricForm] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<DataTemplate | null>(null);
  const [editingMetric, setEditingMetric] = useState<MetricDefinition | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [templatesRes, metricsRes] = await Promise.all([
        fetch(`${baseUrl}/api/admin/data-templates`),
        fetch(`${baseUrl}/api/admin/metric-definitions`)
      ]);

      if (templatesRes.ok) {
        const data = await templatesRes.json();
        setTemplates(data);
        setNeedsMigration(false);
      } else {
        const errorData = await templatesRes.json().catch(() => ({ error: 'Unknown error' }));
        console.error('Templates fetch failed:', templatesRes.status, errorData);
        
        // Only set needsMigration if it's a table-not-found error
        if (errorData.error?.includes('no such table') || errorData.error?.includes('data_templates')) {
          setNeedsMigration(true);
        } else {
          alert(`Error loading templates: ${errorData.error}`);
        }
        setTemplates([]);
      }

      if (metricsRes.ok) {
        const data = await metricsRes.json();
        setMetrics(data);
      } else {
        const errorData = await metricsRes.json().catch(() => ({ error: 'Unknown error' }));
        console.error('Metrics fetch failed:', metricsRes.status, errorData);
        
        // Only set needsMigration if it's a table-not-found error
        if (errorData.error?.includes('no such table') || errorData.error?.includes('metric_definitions')) {
          setNeedsMigration(true);
        } else {
          alert(`Error loading metrics: ${errorData.error}`);
        }
        setMetrics([]);
      }
    } catch (error) {
      console.error('Error loading data:', error);
      alert(`Network error: ${error}`);
      setTemplates([]);
      setMetrics([]);
    } finally {
      setLoading(false);
    }
  };

  const runMigration = async () => {
    if (!confirm('Run metric definition migration? This will create new tables.')) return;

    try {
      const res = await fetch(`${baseUrl}/api/admin/migrate-metrics`, {
        method: 'POST'
      });

      const data = await res.json();
      console.log('Migration response:', data);
      
      // Show the response immediately
      alert(`Migration response:\n${JSON.stringify(data, null, 2)}`);

      if (res.ok) {
        setDbCheckResult({
          migrationSuccess: true,
          ...data
        });
        setNeedsMigration(false);
        loadData();
      } else {
        setDbCheckResult({
          migrationSuccess: false,
          error: data.error,
          details: data.details
        });
      }
    } catch (error) {
      console.error('Migration error:', error);
      alert(`Migration error: ${error}`);
      setDbCheckResult({
        migrationSuccess: false,
        error: String(error)
      });
    }
  };

  const checkDatabase = async () => {
    try {
      const res = await fetch(`${baseUrl}/api/admin/check-metrics-tables`);
      const data = await res.json();
      console.log('Database state:', data);
      setDbCheckResult(data);
    } catch (error) {
      console.error('Database check error:', error);
      setDbCheckResult({ error: String(error) });
    }
  };

  const deleteTemplate = async (id: number) => {
    if (!confirm('Delete this template? All associated metrics will also be deleted.')) return;

    try {
      const res = await fetch(`${baseUrl}/api/admin/data-templates?id=${id}`, {
        method: 'DELETE'
      });

      if (res.ok) {
        loadData();
      }
    } catch (error) {
      console.error('Error deleting template:', error);
    }
  };

  const deleteMetric = async (id: number) => {
    if (!confirm('Delete this metric?')) return;

    try {
      const res = await fetch(`${baseUrl}/api/admin/metric-definitions?id=${id}`, {
        method: 'DELETE'
      });

      if (res.ok) {
        loadData();
      }
    } catch (error) {
      console.error('Error deleting metric:', error);
    }
  };

  if (loading) {
    return <div className="p-8">Loading metrics system...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Metric Discovery - shows when new metrics are found */}
      <MetricDiscovery onComplete={loadData} />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold font-heading">Metrics Manager</h2>
          <p className="text-muted-foreground">Manage data templates and metric definitions</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={checkDatabase} variant="outline">
            Check Database
          </Button>
          <Button onClick={runMigration} variant="outline">
            Run Migration
          </Button>
        </div>
      </div>

      {needsMigration && (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <div className="text-yellow-600 dark:text-yellow-400 text-xl">⚠️</div>
            <div className="flex-1">
              <h3 className="font-semibold text-yellow-900 dark:text-yellow-100">Migration Required</h3>
              <p className="text-sm text-yellow-800 dark:text-yellow-200 mt-1">
                The metric definition tables don't exist yet. Click "Run Migration" above to create them.
              </p>
            </div>
          </div>
        </div>
      )}

      {dbCheckResult && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Database Check Results</CardTitle>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setDbCheckResult(null)}
              >
                ✕
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label className="text-xs">Summary:</Label>
                <div className="mt-2 space-y-1">
                  <div>Total tables: {dbCheckResult.allTables?.length || 0}</div>
                  <div>
                    data_templates: {dbCheckResult.allTables?.some((t: any) => t.name === 'data_templates') ? '✓ EXISTS' : '✗ MISSING'}
                  </div>
                  <div>
                    metric_definitions: {dbCheckResult.allTables?.some((t: any) => t.name === 'metric_definitions') ? '✓ EXISTS' : '✗ MISSING'}
                  </div>
                </div>
              </div>
              <div>
                <Label className="text-xs">Full Results (click to copy):</Label>
                <pre 
                  className="text-xs bg-muted p-4 rounded mt-2 overflow-x-auto cursor-pointer hover:bg-muted/80"
                  onClick={(e) => {
                    navigator.clipboard.writeText(JSON.stringify(dbCheckResult, null, 2));
                    alert('Copied to clipboard!');
                  }}
                >
                  {JSON.stringify(dbCheckResult, null, 2)}
                </pre>
              </div>
            </div>

            {dbCheckResult && (
              <div className="mt-4 p-4 bg-muted rounded-lg">
                <h4 className="font-semibold mb-2">Migration Result:</h4>
                <pre className="text-xs overflow-auto">
                  {JSON.stringify(dbCheckResult, null, 2)}
                </pre>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="templates">Data Templates ({templates.length})</TabsTrigger>
          <TabsTrigger value="metrics">Metrics ({metrics.length})</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Data Templates</CardTitle>
                <CardDescription>
                  BigQuery queries that fetch raw data
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold">{templates.length}</div>
                <div className="space-y-2 mt-4">
                  {templates.slice(0, 5).map(t => (
                    <div key={t.id} className="flex items-center justify-between p-2 bg-muted rounded">
                      <span className="font-medium">{t.template_name}</span>
                      <Badge variant="secondary">{t.output_columns.length} columns</Badge>
                    </div>
                  ))}
                </div>
                <Button 
                  className="w-full mt-4" 
                  onClick={() => setActiveTab('templates')}
                >
                  Manage Templates
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Metric Definitions</CardTitle>
                <CardDescription>
                  Calculated metrics from cached data
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold">{metrics.length}</div>
                <div className="space-y-2 mt-4">
                  {metrics.slice(0, 5).map(m => (
                    <div key={m.id} className="flex items-center justify-between p-2 bg-muted rounded">
                      <span className="font-medium">{m.metric_name}</span>
                      <Badge>{m.format_type}</Badge>
                    </div>
                  ))}
                </div>
                <Button 
                  className="w-full mt-4" 
                  onClick={() => setActiveTab('metrics')}
                >
                  Manage Metrics
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Metrics by Template */}
          <Card>
            <CardHeader>
              <CardTitle>Metrics by Data Template</CardTitle>
              <CardDescription>See which metrics use each data source</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {templates.map(template => {
                  const templateMetrics = metrics.filter(m => m.data_template_id === template.id);
                  return (
                    <div key={template.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold">{template.template_name}</h4>
                        <Badge variant="secondary">{templateMetrics.length} metrics</Badge>
                      </div>
                      {template.description && (
                        <p className="text-sm text-muted-foreground mb-2">{template.description}</p>
                      )}
                      <div className="flex flex-wrap gap-2 mt-2">
                        {template.output_columns.map(col => (
                          <Badge key={col} variant="outline">{col}</Badge>
                        ))}
                      </div>
                      {templateMetrics.length > 0 && (
                        <div className="mt-3 space-y-1">
                          {templateMetrics.map(m => (
                            <div key={m.id} className="text-sm bg-muted p-2 rounded">
                              <span className="font-medium">{m.metric_name}</span>: {m.formula}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Templates Tab */}
        <TabsContent value="templates" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-semibold">Data Templates</h3>
            <Button onClick={() => { setEditingTemplate(null); setShowTemplateForm(true); }}>
              + New Template
            </Button>
          </div>

          {showTemplateForm && (
            <TemplateForm
              template={editingTemplate}
              onSave={() => {
                setShowTemplateForm(false);
                setEditingTemplate(null);
                loadData();
              }}
              onCancel={() => {
                setShowTemplateForm(false);
                setEditingTemplate(null);
              }}
            />
          )}

          <div className="grid gap-4">
            {templates.map(template => (
              <Card key={template.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle>{template.template_name}</CardTitle>
                      {template.description && (
                        <CardDescription>{template.description}</CardDescription>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setEditingTemplate(template);
                          setShowTemplateForm(true);
                        }}
                      >
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => deleteTemplate(template.id)}
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div>
                    <Label className="text-xs">Output Columns:</Label>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {template.output_columns.map(col => (
                        <Badge key={col} variant="secondary">{col}</Badge>
                      ))}
                    </div>
                  </div>
                  <div>
                    <Label className="text-xs">Query Template:</Label>
                    <pre className="text-xs bg-muted p-2 rounded mt-1 overflow-x-auto">
                      {template.query_template}
                    </pre>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Metrics Tab */}
        <TabsContent value="metrics" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-semibold">Metric Definitions</h3>
            <Button onClick={() => { setEditingMetric(null); setShowMetricForm(true); }}>
              + New Metric
            </Button>
          </div>

          {showMetricForm && (
            <MetricForm
              metric={editingMetric}
              templates={templates}
              onSave={() => {
                setShowMetricForm(false);
                setEditingMetric(null);
                loadData();
              }}
              onCancel={() => {
                setShowMetricForm(false);
                setEditingMetric(null);
              }}
            />
          )}

          <div className="grid gap-4">
            {metrics.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center text-muted-foreground">
                  No metrics found. Create a new metric by clicking the "+ New Metric" button.
                </CardContent>
              </Card>
            ) : (
              metrics.map(metric => (
                <Card key={metric.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 space-y-2">
                        <div>
                          <div className="font-medium">{metric.display_name}</div>
                          <div className="text-xs text-muted-foreground font-mono">{metric.metric_name}</div>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Badge variant="outline">{metric.template_name}</Badge>
                          <span className="font-mono text-muted-foreground">{metric.formula}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge>{metric.format_type}</Badge>
                          {metric.category && <Badge variant="secondary">{metric.category}</Badge>}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setEditingMetric(metric);
                            setShowMetricForm(true);
                          }}
                        >
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => deleteMetric(metric.id)}
                        >
                          Delete
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Template Form Component
function TemplateForm({ 
  template, 
  onSave, 
  onCancel 
}: { 
  template: DataTemplate | null; 
  onSave: () => void; 
  onCancel: () => void;
}) {
  const [formData, setFormData] = useState({
    template_name: template?.template_name || '',
    description: template?.description || '',
    query_template: template?.query_template || '',
    output_columns: template?.output_columns.join(', ') || ''
  });
  const [saving, setSaving] = useState(false);
  const [validating, setValidating] = useState(false);
  const [validationResult, setValidationResult] = useState<any>(null);
  const [hotels, setHotels] = useState<any[]>([]);
  const [selectedHotel, setSelectedHotel] = useState('');

  // Load hotels for validation
  useEffect(() => {
    const loadHotels = async () => {
      try {
        const res = await fetch(`${baseUrl}/api/admin/hotels`);
        if (res.ok) {
          const data = await res.json();
          setHotels(data);
          if (data.length > 0) {
            setSelectedHotel(data[0].hotel_code);
          }
        }
      } catch (error) {
        console.error('Error loading hotels:', error);
      }
    };
    loadHotels();
  }, []);

  const handleValidate = async () => {
    if (!selectedHotel) {
      alert('Please select a hotel for validation');
      return;
    }

    setValidating(true);
    setValidationResult(null);

    try {
      const columns = formData.output_columns.split(',').map(c => c.trim()).filter(c => c);
      
      const res = await fetch(`${baseUrl}/api/admin/templates/v2`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          hotel_code: selectedHotel,
          query_template: formData.query_template,
          output_columns: columns,
          action: 'validate'
        })
      });

      const result = await res.json();
      setValidationResult(result);
    } catch (error) {
      console.error('Validation error:', error);
      setValidationResult({
        valid: false,
        error: 'Network error during validation'
      });
    } finally {
      setValidating(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const columns = formData.output_columns.split(',').map(c => c.trim()).filter(c => c);
      const method = template ? 'PUT' : 'POST';
      const body = {
        ...(template && { id: template.id }),
        template_name: formData.template_name,
        description: formData.description,
        query_template: formData.query_template,
        output_columns: columns
      };

      const res = await fetch(`${baseUrl}/api/admin/data-templates`, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      if (res.ok) {
        onSave();
      } else {
        const error = await res.json();
        alert(`Error: ${error.error}`);
      }
    } catch (error) {
      console.error('Error saving template:', error);
      alert('Failed to save template');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{template ? 'Edit' : 'New'} Data Template</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="template_name">Template Name*</Label>
            <Input
              id="template_name"
              value={formData.template_name}
              onChange={e => setFormData({ ...formData, template_name: e.target.value })}
              required
            />
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              value={formData.description}
              onChange={e => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          <div>
            <Label htmlFor="query_template">BigQuery SQL*</Label>
            <Textarea
              id="query_template"
              value={formData.query_template}
              onChange={e => setFormData({ ...formData, query_template: e.target.value })}
              rows={10}
              className="font-mono text-xs"
              required
            />
            <p className="text-xs text-muted-foreground mt-1">
              Use {'{project_id}'}, {'{dataset_id}'}, @hotel_code, @start_date, @end_date as placeholders
            </p>
          </div>

          <div>
            <Label htmlFor="output_columns">Output Columns* (comma-separated)</Label>
            <Input
              id="output_columns"
              value={formData.output_columns}
              onChange={e => setFormData({ ...formData, output_columns: e.target.value })}
              placeholder="revenue, rooms_sold, rooms_available"
              required
            />
          </div>

          {/* Validation Section */}
          <div className="border-t pt-4">
            <div className="flex items-center gap-2 mb-2">
              <Label htmlFor="validation_hotel">Test Query Against Hotel:</Label>
              <Select value={selectedHotel} onValueChange={setSelectedHotel}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Select hotel" />
                </SelectTrigger>
                <SelectContent>
                  {hotels.map(h => (
                    <SelectItem key={h.hotel_code} value={h.hotel_code}>
                      {h.hotel_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button 
                type="button" 
                variant="outline" 
                onClick={handleValidate}
                disabled={validating || !selectedHotel}
              >
                {validating ? 'Validating...' : '🔍 Validate Query'}
              </Button>
            </div>

            {validationResult && (
              <div className={`mt-3 p-4 rounded-lg border ${
                validationResult.valid 
                  ? 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800' 
                  : 'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800'
              }`}>
                <div className="flex items-start gap-2">
                  <span className="text-xl">
                    {validationResult.valid ? '✅' : '❌'}
                  </span>
                  <div className="flex-1">
                    <h4 className="font-semibold mb-2">{validationResult.message}</h4>
                    
                    {validationResult.error && (
                      <div className="text-sm mb-2">
                        <strong>Error:</strong> {validationResult.error}
                        {validationResult.details && (
                          <pre className="mt-1 text-xs bg-black/10 p-2 rounded overflow-auto">
                            {validationResult.details}
                          </pre>
                        )}
                      </div>
                    )}

                    {validationResult.missingColumns && validationResult.missingColumns.length > 0 && (
                      <div className="text-sm mb-2">
                        <strong>Missing columns:</strong> {validationResult.missingColumns.join(', ')}
                        <p className="text-xs mt-1">These columns are declared but not returned by the query</p>
                      </div>
                    )}

                    {validationResult.extraColumns && validationResult.extraColumns.length > 0 && (
                      <div className="text-sm mb-2">
                        <strong>Extra columns:</strong> {validationResult.extraColumns.join(', ')}
                        <p className="text-xs mt-1">These columns are returned but not declared</p>
                      </div>
                    )}

                    {validationResult.actualColumns && (
                      <details className="text-sm mt-2">
                        <summary className="cursor-pointer font-medium">
                          Actual columns returned ({validationResult.actualColumns.length})
                        </summary>
                        <div className="mt-2 flex flex-wrap gap-1">
                          {validationResult.actualColumns.map((col: string) => (
                            <Badge key={col} variant="secondary">{col}</Badge>
                          ))}
                        </div>
                      </details>
                    )}

                    {validationResult.sampleRow && (
                      <details className="text-sm mt-2">
                        <summary className="cursor-pointer font-medium">
                          Sample data row
                        </summary>
                        <pre className="mt-2 text-xs bg-black/10 p-2 rounded overflow-auto">
                          {JSON.stringify(validationResult.sampleRow, null, 2)}
                        </pre>
                      </details>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="flex gap-2">
            <Button type="submit" disabled={saving}>
              {saving ? 'Saving...' : 'Save Template'}
            </Button>
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

// Metric Form Component
function MetricForm({ 
  metric, 
  templates,
  onSave, 
  onCancel 
}: { 
  metric: MetricDefinition | null;
  templates: DataTemplate[];
  onSave: () => void; 
  onCancel: () => void;
}) {
  const [formData, setFormData] = useState({
    metric_name: metric?.metric_name || '',
    display_name: metric?.display_name || '',
    data_template_id: metric?.data_template_id?.toString() || '',
    formula: metric?.formula || '',
    format_type: metric?.format_type || 'number',
    decimal_places: metric?.decimal_places || 2,
    prefix: metric?.prefix || '',
    suffix: metric?.suffix || '',
    display_order: metric?.display_order || 0,
    category: metric?.category || '',
    description: metric?.description || ''
  });
  const [saving, setSaving] = useState(false);
  const formulaInputRef = useState<HTMLInputElement | null>(null);

  const selectedTemplate = templates.find(t => t.id === parseInt(formData.data_template_id));

  const insertColumnIntoFormula = (columnName: string) => {
    const input = formulaInputRef[0];
    if (!input) return;

    const start = input.selectionStart || 0;
    const end = input.selectionEnd || 0;
    const currentFormula = formData.formula;
    
    const newFormula = 
      currentFormula.substring(0, start) + 
      columnName + 
      currentFormula.substring(end);
    
    setFormData({ ...formData, formula: newFormula });
    
    // Set cursor position after inserted text
    setTimeout(() => {
      input.focus();
      input.setSelectionRange(start + columnName.length, start + columnName.length);
    }, 0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const method = metric ? 'PUT' : 'POST';
      const body = {
        ...(metric && { id: metric.id }),
        metric_name: formData.metric_name,
        display_name: formData.display_name,
        data_template_id: parseInt(formData.data_template_id),
        formula: formData.formula,
        format_type: formData.format_type,
        decimal_places: parseInt(formData.decimal_places.toString()),
        prefix: formData.prefix || undefined,
        suffix: formData.suffix || undefined,
        display_order: parseInt(formData.display_order.toString()),
        category: formData.category || undefined,
        description: formData.description || undefined
      };

      const res = await fetch(`${baseUrl}/api/admin/metric-definitions`, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      if (res.ok) {
        onSave();
      } else {
        const error = await res.json();
        alert(`Error: ${error.error}`);
      }
    } catch (error) {
      console.error('Error saving metric:', error);
      alert('Failed to save metric');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{metric ? 'Edit' : 'New'} Metric Definition</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="metric_name">Metric Name (Database ID)*</Label>
              <Input
                id="metric_name"
                value={formData.metric_name}
                onChange={e => setFormData({ ...formData, metric_name: e.target.value })}
                placeholder="adr_otb"
                className="font-mono"
                required
              />
              <p className="text-xs text-muted-foreground mt-1">
                Lowercase, underscores only (e.g., adr_otb, occupancy_rate)
              </p>
            </div>

            <div>
              <Label htmlFor="display_name">Display Name*</Label>
              <Input
                id="display_name"
                value={formData.display_name}
                onChange={e => setFormData({ ...formData, display_name: e.target.value })}
                placeholder="ADR On-the-Books"
                required
              />
              <p className="text-xs text-muted-foreground mt-1">
                User-friendly name shown in UI
              </p>
            </div>
          </div>

          <div>
            <Label htmlFor="data_template_id">Data Source*</Label>
            <Select
              value={formData.data_template_id}
              onValueChange={value => setFormData({ ...formData, data_template_id: value })}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Select template" />
              </SelectTrigger>
              <SelectContent>
                {templates.map(t => (
                  <SelectItem key={t.id} value={t.id.toString()}>
                    {t.template_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedTemplate && (
            <div className="bg-muted p-3 rounded text-sm">
              <Label className="text-xs">Available columns (click to insert):</Label>
              <div className="flex flex-wrap gap-1 mt-1">
                <Badge 
                  variant="outline"
                  className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
                  onClick={() => insertColumnIntoFormula('ROOM_COUNT')}
                >
                  ROOM_COUNT
                </Badge>
                {selectedTemplate.output_columns.map(col => (
                  <Badge 
                    key={col} 
                    variant="secondary"
                    className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
                    onClick={() => insertColumnIntoFormula(col)}
                  >
                    {col}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          <div>
            <Label htmlFor="formula">Formula*</Label>
            <Input
              id="formula"
              ref={(el) => { formulaInputRef[0] = el; }}
              value={formData.formula}
              onChange={e => setFormData({ ...formData, formula: e.target.value })}
              placeholder="revenue / rooms_sold"
              className="font-mono"
              required
            />
            <p className="text-xs text-muted-foreground mt-1">
              Click column badges above to insert. Use +, -, *, / operators. ROOM_COUNT uses the hotel's total rooms.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="format_type">Format Type*</Label>
              <Select
                value={formData.format_type}
                onValueChange={value => setFormData({ ...formData, format_type: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="number">Number</SelectItem>
                  <SelectItem value="currency">Currency</SelectItem>
                  <SelectItem value="percentage">Percentage</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="decimal_places">Decimals</Label>
              <Input
                id="decimal_places"
                type="number"
                value={formData.decimal_places}
                onChange={e => setFormData({ ...formData, decimal_places: parseInt(e.target.value) || 0 })}
                min="0"
                max="10"
              />
            </div>

            <div>
              <Label htmlFor="display_order">Display Order</Label>
              <Input
                id="display_order"
                type="number"
                value={formData.display_order}
                onChange={e => setFormData({ ...formData, display_order: parseInt(e.target.value) || 0 })}
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="prefix">Prefix</Label>
              <Input
                id="prefix"
                value={formData.prefix}
                onChange={e => setFormData({ ...formData, prefix: e.target.value })}
                placeholder="$"
              />
            </div>

            <div>
              <Label htmlFor="suffix">Suffix</Label>
              <Input
                id="suffix"
                value={formData.suffix}
                onChange={e => setFormData({ ...formData, suffix: e.target.value })}
                placeholder="%"
              />
            </div>

            <div>
              <Label htmlFor="category">Category</Label>
              <Input
                id="category"
                value={formData.category}
                onChange={e => setFormData({ ...formData, category: e.target.value })}
                placeholder="Revenue, Occupancy"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={e => setFormData({ ...formData, description: e.target.value })}
              rows={2}
            />
          </div>

          <div className="flex gap-2">
            <Button type="submit" disabled={saving}>
              {saving ? 'Saving...' : 'Save Metric'}
            </Button>
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}























