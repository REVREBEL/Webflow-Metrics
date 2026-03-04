





import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { baseUrl } from '../lib/base-url';

interface TableColumn {
  id: number;
  column_name: string;
  column_type: string;
  is_filterable: number;
  is_groupable: number;
  is_aggregatable: number;
  description?: string;
}

interface BigQueryTable {
  id: number;
  table_key: string;
  table_name: string;
  full_table_path?: string;
  description?: string;
  columns: TableColumn[];
}

interface Filter {
  column: string;
  operator: string;
  value: string;
}

interface SavedTemplate {
  id: number;
  template_name: string;
  metric_name: string;
  table_id: number;
  table_name?: string;
  aggregation_type?: string;
  aggregation_column?: string;
  group_by_columns?: string;
  filters?: string;
  custom_sql?: string;
  use_custom_sql: number;
  description?: string;
  created_at: string;
  updated_at: string;
}

export function QueryBuilder() {
  const [tables, setTables] = useState<BigQueryTable[]>([]);
  const [savedTemplates, setSavedTemplates] = useState<SavedTemplate[]>([]);
  const [selectedTable, setSelectedTable] = useState<BigQueryTable | null>(null);
  const [editingTemplateId, setEditingTemplateId] = useState<number | null>(null);
  const [mode, setMode] = useState<'visual' | 'advanced'>('visual');
  
  // Visual mode state
  const [templateName, setTemplateName] = useState('');
  const [metricName, setMetricName] = useState('');
  const [description, setDescription] = useState('');
  const [aggregationType, setAggregationType] = useState<string>('COUNT');
  const [aggregationColumn, setAggregationColumn] = useState<string>('*');
  const [groupByColumns, setGroupByColumns] = useState<string[]>([]);
  const [filters, setFilters] = useState<Filter[]>([
    { column: 'hotel_code', operator: '=', value: '{{hotel_code}}' }
  ]);
  
  // Advanced mode state
  const [customSql, setCustomSql] = useState('');
  
  const [generatedSql, setGeneratedSql] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    fetchTables();
    fetchTemplates();
  }, []);

  useEffect(() => {
    if (mode === 'visual' && selectedTable) {
      generateSql();
    }
  }, [selectedTable, aggregationType, aggregationColumn, groupByColumns, filters]);

  const fetchTables = async () => {
    try {
      const response = await fetch(`${baseUrl}/api/admin/bigquery/tables`);
      const data = await response.json();
      if (response.ok) {
        setTables(data);
      }
    } catch (err) {
      console.error('Error fetching tables:', err);
    }
  };

  const fetchTemplates = async () => {
    try {
      const response = await fetch(`${baseUrl}/api/admin/templates/v2`);
      const data = await response.json();
      if (response.ok) {
        setSavedTemplates(data);
      }
    } catch (err) {
      console.error('Error fetching templates:', err);
    }
  };

  const loadTemplate = (template: SavedTemplate) => {
    setEditingTemplateId(template.id);
    setTemplateName(template.template_name);
    setMetricName(template.metric_name);
    setDescription(template.description || '');
    
    const table = tables.find(t => t.id === template.table_id);
    setSelectedTable(table || null);
    
    if (template.use_custom_sql) {
      setMode('advanced');
      setCustomSql(template.custom_sql || '');
    } else {
      setMode('visual');
      setAggregationType(template.aggregation_type || 'COUNT');
      setAggregationColumn(template.aggregation_column || '*');
      setGroupByColumns(template.group_by_columns ? JSON.parse(template.group_by_columns) : []);
      setFilters(template.filters ? JSON.parse(template.filters) : [{ column: 'hotel_code', operator: '=', value: '{{hotel_code}}' }]);
    }
    
    // Scroll to form
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const deleteTemplate = async (id: number) => {
    if (!confirm('Are you sure you want to delete this template?')) {
      return;
    }

    try {
      const response = await fetch(`${baseUrl}/api/admin/templates/v2?template_id=${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setSuccess('Template deleted successfully');
        fetchTemplates();
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to delete template');
      }
    } catch (err) {
      setError('Failed to delete template');
    }
  };

  const resetForm = () => {
    setEditingTemplateId(null);
    setTemplateName('');
    setMetricName('');
    setDescription('');
    setAggregationType('COUNT');
    setAggregationColumn('*');
    setGroupByColumns([]);
    setFilters([{ column: 'hotel_code', operator: '=', value: '{{hotel_code}}' }]);
    setCustomSql('');
    setSelectedTable(null);
  };

  const generateSql = () => {
    if (!selectedTable) return;

    const tablePath = selectedTable.full_table_path || 
      `{{project_id}}.{{dataset_id}}.${selectedTable.table_key}`;

    // Build SELECT clause
    let selectClause = '';
    if (aggregationType === 'COUNT' && aggregationColumn === '*') {
      selectClause = 'COUNT(*) as value';
    } else if (aggregationType === 'COUNT_DISTINCT') {
      selectClause = `COUNT(DISTINCT ${aggregationColumn}) as value`;
    } else if (['SUM', 'AVG', 'MIN', 'MAX'].includes(aggregationType)) {
      selectClause = `${aggregationType}(${aggregationColumn}) as value`;
    }

    // Add group by columns to SELECT if any
    if (groupByColumns.length > 0) {
      selectClause = `${groupByColumns.join(', ')}, ${selectClause}`;
    }

    // Build WHERE clause
    const whereClauses = filters
      .filter(f => f.column && f.operator && f.value)
      .map(f => {
        // Handle date placeholders
        if (f.value.includes('{{start_date}}') || f.value.includes('{{end_date}}')) {
          return `${f.column} ${f.operator} '${f.value}'`;
        }
        // Handle other placeholders
        if (f.value.startsWith('{{') && f.value.endsWith('}}')) {
          return `${f.column} ${f.operator} '${f.value}'`;
        }
        // Handle string values
        if (f.operator === 'IN') {
          return `${f.column} IN (${f.value})`;
        }
        return `${f.column} ${f.operator} '${f.value}'`;
      });

    let whereClause = whereClauses.length > 0 ? `WHERE ${whereClauses.join('\n  AND ')}` : '';

    // Build GROUP BY clause
    let groupByClause = groupByColumns.length > 0 ? `GROUP BY ${groupByColumns.join(', ')}` : '';

    // Combine
    const sql = `SELECT ${selectClause}
FROM \`${tablePath}\`
${whereClause}
${groupByClause}`.trim();

    setGeneratedSql(sql);
  };

  const addFilter = () => {
    setFilters([...filters, { column: '', operator: '=', value: '' }]);
  };

  const updateFilter = (index: number, field: keyof Filter, value: string) => {
    const newFilters = [...filters];
    newFilters[index][field] = value;
    setFilters(newFilters);
  };

  const removeFilter = (index: number) => {
    setFilters(filters.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    setError(null);
    setSuccess(null);

    if (!templateName || !metricName || !selectedTable) {
      setError('Template name, metric name, and table selection are required');
      return;
    }

    const payload = {
      template_id: editingTemplateId,
      template_name: templateName,
      metric_name: metricName,
      table_id: selectedTable.id,
      description,
      use_custom_sql: mode === 'advanced' ? 1 : 0,
      custom_sql: mode === 'advanced' ? customSql : null,
      aggregation_type: mode === 'visual' ? aggregationType : null,
      aggregation_column: mode === 'visual' ? aggregationColumn : null,
      group_by_columns: mode === 'visual' && groupByColumns.length > 0 ? JSON.stringify(groupByColumns) : null,
      filters: mode === 'visual' ? JSON.stringify(filters) : null,
    };

    try {
      const response = await fetch(`${baseUrl}/api/admin/templates/v2`, {
        method: editingTemplateId ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(editingTemplateId ? 'Template updated successfully!' : 'Template saved successfully!');
        resetForm();
        fetchTemplates();
      } else {
        setError(data.error || 'Failed to save template');
      }
    } catch (err) {
      setError('Failed to save template');
    }
  };

  const filterableColumns = selectedTable?.columns.filter(c => c.is_filterable) || [];
  const groupableColumns = selectedTable?.columns.filter(c => c.is_groupable) || [];
  const aggregatableColumns = selectedTable?.columns.filter(c => c.is_aggregatable) || [];

  return (
    <div className="space-y-6">
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-md text-red-700">
          {error}
        </div>
      )}
      
      {success && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-md text-green-700">
          {success}
        </div>
      )}

      {/* Saved Templates */}
      <Card>
        <CardHeader>
          <CardTitle>Saved Templates ({savedTemplates.length})</CardTitle>
          <CardDescription>Manage your query templates</CardDescription>
        </CardHeader>
        <CardContent>
          {savedTemplates.length === 0 ? (
            <p className="text-center py-8 text-muted-foreground">
              No templates saved yet. Create one below.
            </p>
          ) : (
            <div className="space-y-3">
              {savedTemplates.map((template) => (
                <div
                  key={template.id}
                  className={`p-4 border rounded-lg hover:bg-muted/50 ${
                    editingTemplateId === template.id ? 'ring-2 ring-primary' : ''
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold">{template.metric_name}</h4>
                        <Badge variant={template.use_custom_sql ? 'default' : 'secondary'}>
                          {template.use_custom_sql ? 'Custom SQL' : 'Visual'}
                        </Badge>
                        {editingTemplateId === template.id && (
                          <Badge variant="outline">Editing</Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Key: {template.template_name}
                      </p>
                      {template.description && (
                        <p className="text-sm text-muted-foreground mt-1">
                          {template.description}
                        </p>
                      )}
                      <div className="flex gap-2 mt-2 text-xs text-muted-foreground">
                        <span>Table: {template.table_name || `ID ${template.table_id}`}</span>
                        {!template.use_custom_sql && template.aggregation_type && (
                          <>
                            <span>•</span>
                            <span>{template.aggregation_type}({template.aggregation_column})</span>
                          </>
                        )}
                      </div>
                      {!template.use_custom_sql && template.filters && (
                        <div className="mt-2">
                          <details className="text-xs">
                            <summary className="cursor-pointer text-muted-foreground hover:text-foreground">
                              View Filters ({JSON.parse(template.filters).length})
                            </summary>
                            <div className="mt-2 pl-4 space-y-1">
                              {JSON.parse(template.filters).map((f: Filter, i: number) => (
                                <div key={i} className="font-mono">
                                  {f.column} {f.operator} {f.value}
                                </div>
                              ))}
                            </div>
                          </details>
                        </div>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => loadTemplate(template)}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => deleteTemplate(template.id)}
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Editing Indicator */}
      {editingTemplateId && (
        <Card className="border-primary">
          <CardContent className="py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Badge>Editing Template</Badge>
                <span className="text-sm text-muted-foreground">
                  Make changes below and click "Save Template" to update
                </span>
              </div>
              <Button variant="outline" size="sm" onClick={resetForm}>
                Cancel Edit
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Basic Info */}
      <Card>
        <CardHeader>
          <CardTitle>Template Configuration</CardTitle>
          <CardDescription>Define the basic properties of your metric template</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="template_name">Template Name *</Label>
              <Input
                id="template_name"
                placeholder="total_revenue_by_segment"
                value={templateName}
                onChange={(e) => setTemplateName(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="metric_name">Display Name *</Label>
              <Input
                id="metric_name"
                placeholder="Total Revenue by Segment"
                value={metricName}
                onChange={(e) => setMetricName(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              placeholder="Sum of revenue grouped by customer segment"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="table_select">Select Table *</Label>
            <Select
              value={selectedTable?.id.toString() || ''}
              onValueChange={(value) => {
                const table = tables.find(t => t.id.toString() === value);
                setSelectedTable(table || null);
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Choose a table..." />
              </SelectTrigger>
              <SelectContent>
                {tables.map((table) => (
                  <SelectItem key={table.id} value={table.id.toString()}>
                    {table.table_name} ({table.columns.length} columns)
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedTable && (
              <p className="text-sm text-muted-foreground mt-1">
                {selectedTable.description || `Table: ${selectedTable.table_key}`}
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {selectedTable && (
        <Tabs value={mode} onValueChange={(v) => setMode(v as 'visual' | 'advanced')}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="visual">Visual Builder</TabsTrigger>
            <TabsTrigger value="advanced">Advanced SQL</TabsTrigger>
          </TabsList>

          <TabsContent value="visual" className="space-y-6">
            {/* Aggregation */}
            <Card>
              <CardHeader>
                <CardTitle>Aggregation</CardTitle>
                <CardDescription>Define how to calculate the metric value</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Aggregation Type</Label>
                    <Select value={aggregationType} onValueChange={setAggregationType}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="COUNT">COUNT</SelectItem>
                        <SelectItem value="COUNT_DISTINCT">COUNT DISTINCT</SelectItem>
                        <SelectItem value="SUM">SUM</SelectItem>
                        <SelectItem value="AVG">AVG</SelectItem>
                        <SelectItem value="MIN">MIN</SelectItem>
                        <SelectItem value="MAX">MAX</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Column</Label>
                    <Select 
                      value={aggregationColumn} 
                      onValueChange={setAggregationColumn}
                      disabled={aggregationType === 'COUNT' && aggregationColumn === '*'}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {aggregationType === 'COUNT' && (
                          <SelectItem value="*">* (All rows)</SelectItem>
                        )}
                        {(aggregationType === 'COUNT_DISTINCT' ? filterableColumns : aggregatableColumns).map((col) => (
                          <SelectItem key={col.column_name} value={col.column_name}>
                            {col.column_name}
                            <Badge variant="outline" className="ml-2">{col.column_type}</Badge>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Group By */}
            <Card>
              <CardHeader>
                <CardTitle>Group By (Optional)</CardTitle>
                <CardDescription>Break down the metric by dimensions</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  {groupByColumns.map((col, index) => (
                    <Badge key={index} variant="secondary" className="px-3 py-1">
                      {col}
                      <button
                        className="ml-2 hover:text-destructive"
                        onClick={() => setGroupByColumns(groupByColumns.filter((_, i) => i !== index))}
                      >
                        ×
                      </button>
                    </Badge>
                  ))}
                </div>
                
                <Select
                  value=""
                  onValueChange={(value) => {
                    if (value && !groupByColumns.includes(value)) {
                      setGroupByColumns([...groupByColumns, value]);
                    }
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Add dimension..." />
                  </SelectTrigger>
                  <SelectContent>
                    {groupableColumns
                      .filter(col => !groupByColumns.includes(col.column_name))
                      .map((col) => (
                        <SelectItem key={col.column_name} value={col.column_name}>
                          {col.column_name}
                          <Badge variant="outline" className="ml-2">{col.column_type}</Badge>
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>

            {/* Filters */}
            <Card>
              <CardHeader>
                <CardTitle>Filters</CardTitle>
                <CardDescription>Add WHERE conditions to filter the data</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {filters.map((filter, index) => (
                  <div key={index} className="grid grid-cols-12 gap-2 items-end">
                    <div className="col-span-4 space-y-2">
                      <Label>Column</Label>
                      <Select
                        value={filter.column}
                        onValueChange={(value) => updateFilter(index, 'column', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select column..." />
                        </SelectTrigger>
                        <SelectContent>
                          {filterableColumns.map((col) => (
                            <SelectItem key={col.column_name} value={col.column_name}>
                              {col.column_name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="col-span-3 space-y-2">
                      <Label>Operator</Label>
                      <Select
                        value={filter.operator}
                        onValueChange={(value) => updateFilter(index, 'operator', value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="=">=</SelectItem>
                          <SelectItem value="!=">!=</SelectItem>
                          <SelectItem value=">">{'>'}</SelectItem>
                          <SelectItem value="<">{'<'}</SelectItem>
                          <SelectItem value=">=">{'>='}</SelectItem>
                          <SelectItem value="<=">{'<='}</SelectItem>
                          <SelectItem value="BETWEEN">BETWEEN</SelectItem>
                          <SelectItem value="IN">IN</SelectItem>
                          <SelectItem value="LIKE">LIKE</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="col-span-4 space-y-2">
                      <Label>Value</Label>
                      <Input
                        placeholder="{{hotel_code}} or 'value'"
                        value={filter.value}
                        onChange={(e) => updateFilter(index, 'value', e.target.value)}
                      />
                    </div>

                    <div className="col-span-1">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFilter(index)}
                        disabled={filters.length === 1}
                      >
                        ×
                      </Button>
                    </div>
                  </div>
                ))}

                <Button type="button" variant="outline" size="sm" onClick={addFilter}>
                  + Add Filter
                </Button>

                <div className="text-xs text-muted-foreground mt-4 p-3 bg-muted rounded">
                  <strong>Available placeholders:</strong> {'{{hotel_code}}'}, {'{{start_date}}'}, {'{{end_date}}'}, {'{{year}}'}, {'{{month}}'}, {'{{project_id}}'}, {'{{dataset_id}}'}, {'{{table_id}}'}
                </div>
              </CardContent>
            </Card>

            {/* SQL Preview */}
            <Card>
              <CardHeader>
                <CardTitle>Generated SQL</CardTitle>
                <CardDescription>Preview of the SQL query that will be executed</CardDescription>
              </CardHeader>
              <CardContent>
                <pre className="text-xs bg-muted p-4 rounded overflow-x-auto font-mono">
                  {generatedSql || 'Configure aggregation and filters above to see generated SQL'}
                </pre>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="advanced" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Custom SQL Query</CardTitle>
                <CardDescription>
                  Write your own SQL query. Use placeholders like {`{{hotel_code}}, {{start_date}}, {{end_date}}, {{year}}, {{month}}, {{project_id}}, {{dataset_id}}, {{table_id}}`}, etc.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  placeholder={`SELECT SUM(revenue) as value\nFROM \`{{project_id}}.{{dataset_id}}.${selectedTable.table_key}\`\nWHERE hotel_code = '{{hotel_code}}'\n  AND date BETWEEN '{{start_date}}' AND '{{end_date}}'`}
                  value={customSql}
                  onChange={(e) => setCustomSql(e.target.value)}
                  rows={15}
                  className="font-mono text-sm"
                />

                <div className="text-xs text-muted-foreground p-3 bg-muted rounded">
                  <strong>Tips:</strong>
                  <ul className="list-disc list-inside mt-2 space-y-1">
                    <li>Query must return a single value (first column of first row)</li>
                    <li>Use placeholders for dynamic values: {'{{hotel_code}}'}, {'{{start_date}}'}, {'{{end_date}}'}, etc.</li>
                    <li>Always filter by hotel_code to isolate hotel data</li>
                    <li>Use COALESCE() for null-safe aggregations</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}

      <div className="flex gap-4">
        <Button onClick={handleSave} disabled={!selectedTable} className="flex-1">
          {editingTemplateId ? 'Update Template' : 'Save Template'}
        </Button>
        <Button variant="outline" onClick={resetForm}>
          {editingTemplateId ? 'Cancel Edit' : 'Reset Form'}
        </Button>
      </div>
    </div>
  );
}








