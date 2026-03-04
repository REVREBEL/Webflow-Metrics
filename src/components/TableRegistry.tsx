import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import { Alert, AlertDescription } from './ui/alert';
import { baseUrl } from '../lib/base-url';

interface Hotel {
  hotel_code: string;
  hotel_name: string;
  project_id: string;
  dataset_id?: string;
}

interface BigQueryTable {
  id?: number;
  table_key: string;
  table_name: string;
  full_table_path?: string;
  description?: string;
  columns: any[];
}

export function TableRegistry() {
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [registeredTables, setRegisteredTables] = useState<BigQueryTable[]>([]);
  const [selectedHotel, setSelectedHotel] = useState<string>('');
  const [datasetId, setDatasetId] = useState<string>('');
  const [availableTables, setAvailableTables] = useState<any[]>([]);
  const [selectedTableId, setSelectedTableId] = useState<string>('');
  const [discoveredSchema, setDiscoveredSchema] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Form state for registering table
  const [tableKey, setTableKey] = useState('');
  const [tableName, setTableName] = useState('');
  const [tableDescription, setTableDescription] = useState('');

  useEffect(() => {
    fetchHotels();
    fetchRegisteredTables();
  }, []);

  const fetchHotels = async () => {
    try {
      console.log('[TableRegistry] Fetching hotels...');
      const response = await fetch(`${baseUrl}/api/admin/hotels`);
      const data = await response.json();
      console.log('[TableRegistry] Hotels response:', { status: response.status, data });
      if (response.ok) {
        setHotels(Array.isArray(data) ? data : []);
        console.log(`[TableRegistry] Loaded ${Array.isArray(data) ? data.length : 0} hotels`);
      } else {
        console.error('[TableRegistry] Failed to fetch hotels:', data);
      }
    } catch (err) {
      console.error('[TableRegistry] Error fetching hotels:', err);
    }
  };

  const fetchRegisteredTables = async () => {
    try {
      console.log('[TableRegistry] Fetching registered tables...');
      const response = await fetch(`${baseUrl}/api/admin/bigquery/tables`);
      const data = await response.json();
      console.log('[TableRegistry] Tables response:', { status: response.status, data });
      
      if (response.ok) {
        setRegisteredTables(data);
        console.log(`[TableRegistry] Loaded ${data.length} registered tables`);
      } else {
        const errorMsg = data.error || 'Unknown error';
        if (errorMsg.includes('no such table')) {
          setError('Database not initialized. Please click "Initialize Database" button at the top of the page.');
        } else {
          setError(`Failed to load tables: ${errorMsg}`);
        }
        console.error('[TableRegistry] Failed to fetch tables:', data);
      }
    } catch (err: any) {
      console.error('[TableRegistry] Error fetching tables:', err);
      setError(`Error loading tables: ${err.message}`);
    } finally {
      setInitialLoading(false);
    }
  };

  const listTables = async () => {
    if (!selectedHotel || !datasetId) {
      setError('Please select a hotel and enter a dataset ID');
      return;
    }

    setLoading(true);
    setError(null);
    setAvailableTables([]);

    try {
      const response = await fetch(`${baseUrl}/api/admin/bigquery/list-tables`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          hotel_code: selectedHotel,
          dataset_id: datasetId,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setAvailableTables(data.tables || []);
        setSuccess(`Found ${data.tables?.length || 0} tables in dataset`);
      } else {
        setError(data.error || 'Failed to list tables');
      }
    } catch (err: any) {
      setError(`Failed to list tables: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const discoverSchema = async () => {
    if (!selectedHotel || !datasetId || !selectedTableId) {
      setError('Please select a hotel, dataset, and table');
      return;
    }

    setLoading(true);
    setError(null);
    setDiscoveredSchema(null);

    try {
      const response = await fetch(`${baseUrl}/api/admin/bigquery/discover-schema`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          hotel_code: selectedHotel,
          dataset_id: datasetId,
          table_id: selectedTableId,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setDiscoveredSchema(data);
        setTableKey(selectedTableId);
        setTableName(selectedTableId.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()));
        setSuccess(`Discovered ${data.columns?.length || 0} columns`);
      } else {
        setError(data.error || 'Failed to discover schema');
      }
    } catch (err: any) {
      setError(`Failed to discover schema: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const registerTable = async () => {
    if (!discoveredSchema || !tableKey || !tableName) {
      setError('Please discover a schema first and provide table name');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${baseUrl}/api/admin/bigquery/tables`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          table_key: tableKey,
          table_name: tableName,
          full_table_path: discoveredSchema.full_table_path,
          description: tableDescription,
          columns: discoveredSchema.columns,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess('Table registered successfully!');
        setDiscoveredSchema(null);
        setTableKey('');
        setTableName('');
        setTableDescription('');
        setSelectedTableId('');
        fetchRegisteredTables();
      } else {
        setError(data.error || 'Failed to register table');
      }
    } catch (err: any) {
      setError(`Failed to register table: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const deleteTable = async (tableId: number) => {
    if (!confirm('Are you sure you want to delete this table? All associated templates will also be deleted.')) {
      return;
    }

    try {
      const response = await fetch(`${baseUrl}/api/admin/bigquery/tables?table_id=${tableId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setSuccess('Table deleted successfully');
        fetchRegisteredTables();
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to delete table');
      }
    } catch (err: any) {
      setError(`Failed to delete table: ${err.message}`);
    }
  };

  const getColumnTypeColor = (type: string) => {
    if (['INTEGER', 'INT64', 'FLOAT', 'FLOAT64', 'NUMERIC'].includes(type)) return 'bg-blue-100 text-blue-700';
    if (['STRING', 'BYTES'].includes(type)) return 'bg-green-100 text-green-700';
    if (['DATE', 'DATETIME', 'TIMESTAMP'].includes(type)) return 'bg-purple-100 text-purple-700';
    if (['BOOLEAN', 'BOOL'].includes(type)) return 'bg-amber-100 text-amber-700';
    return 'bg-gray-100 text-gray-700';
  };

  return (
    <div className="space-y-6">
      {initialLoading ? (
        <Card>
          <CardContent className="py-8">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              <p className="mt-4 text-muted-foreground">Loading table registry...</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          {success && (
            <Alert className="border-green-500 text-green-700">
              <AlertDescription>{success}</AlertDescription>
            </Alert>
          )}

      {/* Schema Discovery */}
      <Card>
        <CardHeader>
          <CardTitle>Discover BigQuery Table Schema</CardTitle>
          <CardDescription>
            Connect to BigQuery and automatically discover table structures
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Hotel</Label>
              <Select value={selectedHotel} onValueChange={setSelectedHotel}>
                <SelectTrigger>
                  <SelectValue placeholder="Select hotel..." />
                </SelectTrigger>
                <SelectContent>
                  {hotels.map((hotel) => (
                    <SelectItem key={hotel.hotel_code} value={hotel.hotel_code}>
                      {hotel.hotel_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Dataset ID</Label>
              <Input
                placeholder="analytics_dataset"
                value={datasetId}
                onChange={(e) => setDatasetId(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>&nbsp;</Label>
              <Button onClick={listTables} disabled={loading || !selectedHotel || !datasetId} className="w-full">
                {loading ? 'Loading...' : 'List Tables'}
              </Button>
            </div>
          </div>

          {availableTables.length > 0 && (
            <>
              <div className="space-y-2">
                <Label>Select Table to Discover</Label>
                <Select value={selectedTableId} onValueChange={setSelectedTableId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a table..." />
                  </SelectTrigger>
                  <SelectContent>
                    {availableTables.map((table) => (
                      <SelectItem key={table.table_id} value={table.table_id}>
                        {table.table_name} ({table.row_count?.toLocaleString() || 0} rows)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Button onClick={discoverSchema} disabled={loading || !selectedTableId} className="w-full">
                {loading ? 'Discovering...' : 'Discover Schema'}
              </Button>
            </>
          )}
        </CardContent>
      </Card>

      {/* Discovered Schema */}
      {discoveredSchema && (
        <Card>
          <CardHeader>
            <CardTitle>Discovered Schema: {discoveredSchema.table_id}</CardTitle>
            <CardDescription>
              {discoveredSchema.columns.length} columns found • {discoveredSchema.row_count?.toLocaleString() || 0} rows
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Table Key (unique identifier) *</Label>
                <Input
                  placeholder="reservations"
                  value={tableKey}
                  onChange={(e) => setTableKey(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>Display Name *</Label>
                <Input
                  placeholder="Reservations"
                  value={tableName}
                  onChange={(e) => setTableName(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Description</Label>
              <Input
                placeholder="Hotel reservation records"
                value={tableDescription}
                onChange={(e) => setTableDescription(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Full Table Path</Label>
              <Input value={discoveredSchema.full_table_path} disabled className="font-mono text-sm" />
            </div>

            {/* Columns */}
            <div className="space-y-2">
              <Label>Columns ({discoveredSchema.columns.length})</Label>
              <div className="border rounded-lg p-4 max-h-96 overflow-y-auto space-y-2">
                {discoveredSchema.columns.map((col: any, index: number) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-muted rounded">
                    <div className="flex items-center gap-3">
                      <code className="font-mono text-sm font-semibold">{col.column_name}</code>
                      <Badge className={getColumnTypeColor(col.column_type)}>
                        {col.column_type}
                      </Badge>
                    </div>
                    <div className="flex gap-2 text-xs">
                      {col.is_filterable && <Badge variant="outline">Filterable</Badge>}
                      {col.is_groupable && <Badge variant="outline">Groupable</Badge>}
                      {col.is_aggregatable && <Badge variant="outline">Aggregatable</Badge>}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <Button onClick={registerTable} disabled={loading || !tableKey || !tableName} className="w-full">
              {loading ? 'Registering...' : 'Register Table'}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Registered Tables */}
      <Card>
        <CardHeader>
          <CardTitle>Registered Tables ({registeredTables.length})</CardTitle>
          <CardDescription>
            Tables available for query template building
          </CardDescription>
        </CardHeader>
        <CardContent>
          {registeredTables.length === 0 ? (
            <p className="text-center py-8 text-muted-foreground">
              No tables registered yet. Discover and register tables above.
            </p>
          ) : (
            <div className="space-y-3">
              {registeredTables.map((table) => (
                <div 
                  key={table.id}
                  className="p-4 border rounded-lg hover:bg-muted/50"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h4 className="font-semibold">{table.table_name}</h4>
                      <p className="text-sm text-muted-foreground">
                        Key: {table.table_key} • {table.columns.length} columns
                      </p>
                      {table.description && (
                        <p className="text-sm text-muted-foreground mt-1">{table.description}</p>
                      )}
                    </div>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => deleteTable(table.id!)}
                    >
                      Delete
                    </Button>
                  </div>
                  
                  {table.full_table_path && (
                    <code className="text-xs bg-muted p-2 rounded block mt-2">
                      {table.full_table_path}
                    </code>
                  )}

                  <details className="mt-3">
                    <summary className="text-sm font-medium cursor-pointer">
                      View Columns ({table.columns.length})
                    </summary>
                    <div className="mt-2 space-y-1 pl-4">
                      {table.columns.map((col: any) => (
                        <div key={col.id} className="text-xs flex items-center justify-between py-1">
                          <span className="font-mono">{col.column_name}</span>
                          <Badge variant="outline" className="text-xs">
                            {col.column_type}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </details>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
        </>
      )}
    </div>
  );
}




