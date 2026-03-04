import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Alert, AlertDescription } from './ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { baseUrl } from '../lib/base-url';
import { QueryBuilder } from './QueryBuilder';
import { TableRegistry } from './TableRegistry';

interface Hotel {
  id?: number;
  hotel_code: string;
  hotel_name: string;
  project_id: string;
  dataset_id?: string | null;
  table_id?: string | null;
  data_location: string;
  created_at?: string;
  updated_at?: string;
}

interface GlobalQueryTemplate {
  id?: number;
  template_name: string;
  metric_name: string;
  sql_query: string;
  description?: string;
  created_at?: string;
  updated_at?: string;
}

export function AdminPanel() {
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [templates, setTemplates] = useState<GlobalQueryTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [dbInitialized, setDbInitialized] = useState<boolean | null>(null);
  const [initializingDb, setInitializingDb] = useState(false);

  const [formData, setFormData] = useState({
    hotel_code: '',
    hotel_name: '',
    service_account_json: '',
    data_location: 'US',
    project_id: '',
    dataset_id: '',
    table_id: ''
  });

  const [templateFormData, setTemplateFormData] = useState({
    template_name: '',
    metric_name: '',
    sql_query: '',
    description: ''
  });

  useEffect(() => {
    fetchHotels();
    fetchTemplates();
  }, []);

  const fetchHotels = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${baseUrl}/api/admin/hotels`);
      const data = await response.json() as Hotel[] | { error?: string };
      
      if (response.ok) {
        const hotelArray = Array.isArray(data) ? data : [];
        setHotels(hotelArray);
        setDbInitialized(true);
      } else {
        const errorData = data as { error?: string };
        if (errorData.error?.includes('Database not configured') || errorData.error?.includes('no such table')) {
          setDbInitialized(false);
        }
        setError(errorData.error || 'Failed to fetch hotels');
      }
    } catch (err) {
      setError('Failed to connect to server');
    } finally {
      setLoading(false);
    }
  };

  const fetchTemplates = async () => {
    try {
      const response = await fetch(`${baseUrl}/api/admin/templates`);
      const data = await response.json();
      
      if (response.ok) {
        setTemplates(Array.isArray(data) ? data : []);
      } else {
        console.error('Failed to fetch templates:', data);
      }
    } catch (err) {
      console.error('Error fetching templates:', err);
    }
  };

  const initializeDatabase = async () => {
    setInitializingDb(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch(`${baseUrl}/api/admin/init-database`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      
      const responseText = await response.text();
      let data;
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        setError(`Server returned invalid response. Status: ${response.status}`);
        return;
      }

      if (response.ok && data.success) {
        setSuccess(data.message || 'Database initialized successfully!');
        setDbInitialized(true);
        // Run migration to add global templates table
        await fetch(`${baseUrl}/api/admin/init-database`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ migration: '0003_global_templates' })
        });
        setTimeout(() => fetchHotels(), 1000);
      } else {
        setError(data.error || 'Failed to initialize database');
      }
    } catch (err: any) {
      setError(`Failed to initialize database: ${err.message}`);
    } finally {
      setInitializingDb(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch(`${baseUrl}/api/admin/hotels`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await response.json() as { error?: string; success?: boolean };

      if (response.ok) {
        setSuccess('Hotel configuration saved successfully!');
        setFormData({
          hotel_code: '',
          hotel_name: '',
          service_account_json: '',
          data_location: 'US',
          project_id: '',
          dataset_id: '',
          table_id: ''
        });
        fetchHotels();
      } else {
        setError(data.error || 'Failed to save hotel');
      }
    } catch (err) {
      setError('Failed to save hotel configuration');
    }
  };

  const handleTemplateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch(`${baseUrl}/api/admin/templates`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(templateFormData)
      });

      const data = await response.json() as { error?: string; success?: boolean };

      if (response.ok) {
        setSuccess('Query template saved successfully!');
        setTemplateFormData({
          template_name: '',
          metric_name: '',
          sql_query: '',
          description: ''
        });
        fetchTemplates();
      } else {
        setError(data.error || 'Failed to save template');
      }
    } catch (err) {
      setError('Failed to save query template');
    }
  };

  const handleTemplateDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this template?')) return;

    try {
      const response = await fetch(`${baseUrl}/api/admin/templates?id=${id}`, {
        method: 'DELETE',
      });

      const data = await response.json() as { error?: string; success?: boolean };

      if (response.ok) {
        setSuccess('Template deleted successfully!');
        fetchTemplates();
      } else {
        setError(data.error || 'Failed to delete template');
      }
    } catch (err) {
      setError('Failed to delete template');
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-heading font-bold mb-2">Admin Panel</h1>
          <p className="text-muted-foreground">Manage hotel configurations and global query templates</p>
        </div>
        <a
          href={`${baseUrl}/dashboard`}
          className="inline-flex items-center px-4 py-2 bg-primary text-primary-foreground rounded-md hover:opacity-90"
        >
          📊 View Dashboard
        </a>
      </div>

      {/* Database Initialization Warning */}
      {dbInitialized === false && (
        <Alert className="mb-6 border-amber-500 bg-amber-50">
          <AlertDescription className="flex items-center justify-between gap-4">
            <div>
              <strong className="font-semibold">Database not initialized</strong>
              <p className="mt-1 text-sm">The database tables need to be created before you can add hotels.</p>
            </div>
            <Button
              onClick={initializeDatabase}
              disabled={initializingDb}
              variant="default"
              className="shrink-0"
            >
              {initializingDb ? 'Initializing...' : 'Initialize Database'}
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      {success && (
        <Alert className="mb-6 border-green-500 text-green-700">
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="query-builder" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="query-builder">Query Builder</TabsTrigger>
          <TabsTrigger value="table-registry">Table Registry</TabsTrigger>
          <TabsTrigger value="hotels">Hotels</TabsTrigger>
        </TabsList>

        <TabsContent value="query-builder" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Visual Query Builder</CardTitle>
              <CardDescription>
                Build queries visually with drag-and-drop or write custom SQL
              </CardDescription>
            </CardHeader>
            <CardContent>
              <QueryBuilder />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="table-registry" className="space-y-6">
          <TableRegistry />
        </TabsContent>

        <TabsContent value="templates" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Global Query Templates</CardTitle>
              <CardDescription>
                Create universal query templates that work for all hotels. Use placeholders like {'{'}
                {'{'}hotel_code{'}'}{'}'},  {'{'}{'{'}project_id{'}'}{'}'},  {'{'}{'{'}start_date{'}'}{'}'},  {'{'}{'{'}end_date{'}'}{'}'}, etc.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Add Template Form */}
              <form onSubmit={handleTemplateSubmit} className="space-y-4 border p-4 rounded-lg bg-muted/30">
                <h3 className="font-semibold">Add New Query Template</h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="template_name">Template Name *</Label>
                    <Input
                      id="template_name"
                      placeholder="total_bookings"
                      value={templateFormData.template_name}
                      onChange={(e) => setTemplateFormData({ ...templateFormData, template_name: e.target.value })}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="metric_name">Display Name *</Label>
                    <Input
                      id="metric_name"
                      placeholder="Total Bookings"
                      value={templateFormData.metric_name}
                      onChange={(e) => setTemplateFormData({ ...templateFormData, metric_name: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Input
                    id="description"
                    placeholder="Count of all bookings for the selected period"
                    value={templateFormData.description}
                    onChange={(e) => setTemplateFormData({ ...templateFormData, description: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="sql_query">SQL Query Template *</Label>
                  <Textarea
                    id="sql_query"
                    placeholder={`SELECT COUNT(*) as total\nFROM \`{{project_id}}.{{dataset_id}}.bookings\`\nWHERE hotel_code = '{{hotel_code}}'\n  AND date BETWEEN '{{start_date}}' AND '{{end_date}}'`}
                    value={templateFormData.sql_query}
                    onChange={(e) => setTemplateFormData({ ...templateFormData, sql_query: e.target.value })}
                    rows={12}
                    className="font-mono text-sm"
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    Available placeholders: {'{'}{'{'}hotel_code{'}'}{'}'},  {'{'}{'{'}project_id{'}'}{'}'},  {'{'}{'{'}dataset_id{'}'}{'}'},  {'{'}{'{'}table_id{'}'}{'}'},  {'{'}{'{'}start_date{'}'}{'}'},  {'{'}{'{'}end_date{'}'}{'}'},  {'{'}{'{'}year{'}'}{'}'},  {'{'}{'{'}month{'}'}{'}'} 
                  </p>
                </div>

                <Button type="submit" className="w-full">
                  Save Query Template
                </Button>
              </form>

              {/* Templates List */}
              <div>
                <h3 className="font-semibold mb-4">
                  Configured Templates ({templates.length})
                </h3>
                
                {templates.length === 0 ? (
                  <p className="text-center py-8 text-muted-foreground border rounded-lg">
                    No templates configured yet. Add your first template above.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {templates.map((template) => (
                      <div 
                        key={template.id}
                        className="p-4 border rounded-lg hover:bg-muted/50"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h4 className="font-semibold">{template.metric_name}</h4>
                            <p className="text-sm text-muted-foreground">
                              Template: {template.template_name}
                            </p>
                            {template.description && (
                              <p className="text-sm text-muted-foreground mt-1">
                                {template.description}
                              </p>
                            )}
                          </div>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleTemplateDelete(template.id!)}
                          >
                            Delete
                          </Button>
                        </div>
                        <pre className="text-xs bg-muted p-3 rounded overflow-x-auto mt-3">
                          {template.sql_query}
                        </pre>
                        <p className="text-xs text-muted-foreground mt-2">
                          Updated: {new Date(template.updated_at || template.created_at || Date.now()).toLocaleDateString()}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="hotels" className="space-y-6">
          {/* Database Tools */}
          <Card>
            <CardHeader>
              <CardTitle>Database Tools</CardTitle>
              <CardDescription>
                Initialize the database schema (creates tables if they don't exist)
              </CardDescription>
            </CardHeader>
            <CardContent className="flex gap-4 items-center">
              <Button
                onClick={initializeDatabase}
                disabled={initializingDb}
                variant="outline"
              >
                {initializingDb ? 'Initializing...' : 'Initialize Database'}
              </Button>
              <div className="text-sm text-muted-foreground">
                <p>Run this once to create the database tables. Safe to run multiple times.</p>
              </div>
            </CardContent>
          </Card>

          {/* Add Hotel Form */}
          <Card>
            <CardHeader>
              <CardTitle>Add/Update Hotel Configuration</CardTitle>
              <CardDescription>
                Configure BigQuery credentials and settings for each hotel property
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="hotel_code">Hotel Code *</Label>
                    <Input
                      id="hotel_code"
                      placeholder="DTWDFH"
                      value={formData.hotel_code}
                      onChange={(e) => setFormData({ ...formData, hotel_code: e.target.value.toUpperCase() })}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="hotel_name">Hotel Name *</Label>
                    <Input
                      id="hotel_name"
                      placeholder="Detroit Doubletree"
                      value={formData.hotel_name}
                      onChange={(e) => setFormData({ ...formData, hotel_name: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="project_id">BigQuery Project ID *</Label>
                    <Input
                      id="project_id"
                      placeholder="my-project-123456"
                      value={formData.project_id}
                      onChange={(e) => setFormData({ ...formData, project_id: e.target.value })}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="data_location">Data Location</Label>
                    <Input
                      id="data_location"
                      placeholder="US"
                      value={formData.data_location}
                      onChange={(e) => setFormData({ ...formData, data_location: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="dataset_id">Dataset ID (optional)</Label>
                    <Input
                      id="dataset_id"
                      placeholder="analytics_dataset"
                      value={formData.dataset_id}
                      onChange={(e) => setFormData({ ...formData, dataset_id: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="table_id">Table ID (optional)</Label>
                    <Input
                      id="table_id"
                      placeholder="bookings_table"
                      value={formData.table_id}
                      onChange={(e) => setFormData({ ...formData, table_id: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="service_account_json">Service Account JSON *</Label>
                  <Textarea
                    id="service_account_json"
                    placeholder='{"type": "service_account", ...}'
                    value={formData.service_account_json}
                    onChange={(e) => setFormData({ ...formData, service_account_json: e.target.value })}
                    rows={8}
                    className="font-mono text-sm"
                    required
                  />
                </div>

                <Button type="submit" className="w-full" disabled={dbInitialized === false}>
                  Save Hotel Configuration
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Hotels List */}
          <Card>
            <CardHeader>
              <CardTitle>Configured Hotels</CardTitle>
              <CardDescription>
                {hotels.length} hotel(s) configured
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <p className="text-center py-8 text-muted-foreground">Loading hotels...</p>
              ) : hotels.length === 0 ? (
                <p className="text-center py-8 text-muted-foreground">No hotels configured yet</p>
              ) : (
                <div className="space-y-3">
                  {hotels.map((hotel) => (
                    <div 
                      key={hotel.hotel_code}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50"
                    >
                      <div>
                        <h3 className="font-semibold">{hotel.hotel_name}</h3>
                        <p className="text-sm text-muted-foreground">
                          Code: {hotel.hotel_code} • Project: {hotel.project_id} • Location: {hotel.data_location}
                        </p>
                        {(hotel.dataset_id || hotel.table_id) && (
                          <p className="text-sm text-muted-foreground">
                            {hotel.dataset_id && `Dataset: ${hotel.dataset_id}`}
                            {hotel.dataset_id && hotel.table_id && ' • '}
                            {hotel.table_id && `Table: ${hotel.table_id}`}
                          </p>
                        )}
                        <p className="text-xs text-muted-foreground mt-1">
                          Updated: {new Date(hotel.updated_at || hotel.created_at || Date.now()).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

