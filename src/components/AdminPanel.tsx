
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
import { MigrationManager } from './MigrationManager';

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
  const [activeTab, setActiveTab] = useState('hotels');
  const [clearingCache, setClearingCache] = useState(false);
  const [cacheMessage, setCacheMessage] = useState<string | null>(null);

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

  const clearCache = async () => {
    setClearingCache(true);
    setCacheMessage(null);
    
    try {
      const response = await fetch(`${baseUrl}/api/bigquery/clear-cache`, {
        method: 'POST',
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setCacheMessage('Cache cleared successfully!');
      } else {
        setCacheMessage(`Error: ${data.error || 'Failed to clear cache'}`);
      }
    } catch (err: any) {
      setCacheMessage(`Error: ${err.message}`);
    } finally {
      setClearingCache(false);
      setTimeout(() => setCacheMessage(null), 5000);
    }
  };

  const handleEditHotel = (hotel: Hotel) => {
    setFormData({
      hotel_code: hotel.hotel_code,
      hotel_name: hotel.hotel_name,
      project_id: hotel.project_id,
      dataset_id: hotel.dataset_id || '',
      table_id: hotel.table_id || '',
      data_location: hotel.data_location,
      service_account_json: '', // Leave empty for security - user must re-enter
    });
    // Scroll to form
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteHotel = async (hotelCode: string) => {
    if (!confirm(`Are you sure you want to delete hotel ${hotelCode}? This cannot be undone.`)) return;

    try {
      const response = await fetch(`${baseUrl}/api/admin/hotels?hotel_code=${hotelCode}`, {
        method: 'DELETE',
      });

      const data = await response.json() as { error?: string; success?: boolean };

      if (response.ok) {
        setSuccess('Hotel deleted successfully!');
        fetchHotels();
      } else {
        setError(data.error || 'Failed to delete hotel');
      }
    } catch (err) {
      setError('Failed to delete hotel');
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

      <Tabs defaultValue="hotels" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="query-builder">Query Builder</TabsTrigger>
          <TabsTrigger value="table-registry">Table Registry</TabsTrigger>
          <TabsTrigger value="migrations">Migrations</TabsTrigger>
          <TabsTrigger value="cache">Cache</TabsTrigger>
          <TabsTrigger value="hotels">Hotels</TabsTrigger>
        </TabsList>

        <TabsContent value="query-builder" className="space-y-6">
          <QueryBuilder />
        </TabsContent>

        <TabsContent value="table-registry" className="space-y-6">
          <TableRegistry />
        </TabsContent>

        <TabsContent value="migrations" className="space-y-6">
          <MigrationManager />
        </TabsContent>

        <TabsContent value="cache" className="space-y-6">
          {/* Cache Migration */}
          <Card>
            <CardHeader>
              <CardTitle>Cache Migration</CardTitle>
              <CardDescription>
                Run this once to create the cache and calculations tables
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                onClick={async () => {
                  setError(null);
                  setSuccess(null);
                  try {
                    const response = await fetch(`${baseUrl}/api/admin/migrate-cache`, {
                      method: 'POST'
                    });
                    const data = await response.json();
                    if (response.ok) {
                      setSuccess('Cache migration completed successfully!');
                    } else {
                      setError(data.error || 'Migration failed');
                    }
                  } catch (err: any) {
                    setError(err.message);
                  }
                }}
              >
                Run Cache Migration
              </Button>
            </CardContent>
          </Card>

          {/* Cache Refresh */}
          <Card>
            <CardHeader>
              <CardTitle>Refresh Cache</CardTitle>
              <CardDescription>
                Query BigQuery and populate the cache with fresh data. Runs calculations automatically.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  This will execute all query templates for all hotels and cache the results in the D1 database.
                  Calculated metrics (like ADR) will be automatically computed and cached as well.
                </p>
                <p className="text-sm text-muted-foreground font-semibold">
                  Cache expires at 7am PST daily (aligned with your data processing schedule).
                </p>
              </div>
              <Button
                onClick={async () => {
                  setClearingCache(true);
                  setCacheMessage(null);
                  setError(null);
                  setSuccess(null);
                  try {
                    const response = await fetch(`${baseUrl}/api/admin/refresh-cache`, {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({})
                    });
                    
                    // Try to parse response as JSON
                    let data;
                    const contentType = response.headers.get('content-type');
                    if (contentType && contentType.includes('application/json')) {
                      data = await response.json();
                    } else {
                      // If not JSON, read as text
                      const text = await response.text();
                      setError(`Server error: ${text.substring(0, 200)}${text.length > 200 ? '...' : ''}`);
                      setClearingCache(false);
                      return;
                    }
                    
                    if (response.ok) {
                      setSuccess(
                        `Cache refreshed! Cached ${data.cached} metrics, calculated ${data.calculated} metrics across ${data.hotels} hotel(s).`
                      );
                      if (data.errors && data.errors.length > 0) {
                        setCacheMessage(`Errors: ${data.errors.join(', ')}`);
                      }
                    } else {
                      setError(data.error || 'Failed to refresh cache');
                    }
                  } catch (err: any) {
                    setError(`Cache refresh failed: ${err.message}`);
                  } finally {
                    setClearingCache(false);
                  }
                }}
                disabled={clearingCache}
              >
                {clearingCache ? 'Refreshing...' : 'Refresh Cache for All Hotels'}
              </Button>
              {cacheMessage && (
                <Alert className="mt-4">
                  <AlertDescription>{cacheMessage}</AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          {/* Clear Cache */}
          <Card>
            <CardHeader>
              <CardTitle>Clear Cache</CardTitle>
              <CardDescription>
                Remove all cached data from the database
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                onClick={async () => {
                  if (!confirm('Are you sure you want to clear all cached data?')) return;
                  setError(null);
                  setSuccess(null);
                  try {
                    const response = await fetch(`${baseUrl}/api/admin/clear-cache`, {
                      method: 'POST'
                    });
                    const data = await response.json();
                    if (response.ok) {
                      setSuccess('Cache cleared successfully!');
                    } else {
                      setError(data.error || 'Failed to clear cache');
                    }
                  } catch (err: any) {
                    setError(err.message);
                  }
                }}
                variant="destructive"
              >
                Clear All Cache
              </Button>
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
                {formData.hotel_code 
                  ? `Editing: ${formData.hotel_name} (${formData.hotel_code}) - Re-enter Service Account JSON to update credentials`
                  : 'Configure BigQuery credentials and settings for each hotel property'
                }
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
                  {formData.hotel_code ? 'Update Hotel Configuration' : 'Save Hotel Configuration'}
                </Button>
                
                {formData.hotel_code && (
                  <Button 
                    type="button" 
                    variant="outline" 
                    className="w-full"
                    onClick={() => setFormData({
                      hotel_code: '',
                      hotel_name: '',
                      service_account_json: '',
                      data_location: 'US',
                      project_id: '',
                      dataset_id: '',
                      table_id: ''
                    })}
                  >
                    Cancel Edit
                  </Button>
                )}
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
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditHotel(hotel)}
                        >
                          Edit
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDeleteHotel(hotel.hotel_code)}
                        >
                          Delete
                        </Button>
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









