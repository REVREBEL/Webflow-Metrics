import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Alert, AlertDescription } from './ui/alert';
import { baseUrl } from '../lib/base-url';

interface Migration {
  name: string;
  description: string;
  sql: string;
  version: string;
}

// Pre-defined migrations that can be run
const AVAILABLE_MIGRATIONS = [
  {
    id: 'add_display_name',
    name: 'Add display_name column to metric_definitions',
    description: 'Adds display_name column to allow user-friendly metric names',
    sql: `-- Check and add display_name column
PRAGMA table_info(metric_definitions);

-- Add column (will fail gracefully if exists)
ALTER TABLE metric_definitions ADD COLUMN display_name TEXT;

-- Populate display_name from metric_name for existing records
UPDATE metric_definitions 
SET display_name = REPLACE(REPLACE(UPPER(SUBSTR(metric_name, 1, 1)) || SUBSTR(metric_name, 2), '_', ' '), 'Adr', 'ADR')
WHERE display_name IS NULL OR display_name = '';`,
  },
  // Future migrations can be added here
];

export function MigrationManager() {
  const [selectedMigration, setSelectedMigration] = useState<Migration | null>(null);
  const [customSql, setCustomSql] = useState('');
  const [mode, setMode] = useState<'preset' | 'custom'>('preset');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

  const runMigration = async (sql: string, description: string) => {
    setLoading(true);
    setResult(null);

    try {
      const response = await fetch(`${baseUrl}/api/admin/run-migration`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sql, description })
      });

      const data = await response.json();

      if (response.ok) {
        setResult({
          success: true,
          message: data.message || 'Migration completed successfully'
        });
      } else {
        setResult({
          success: false,
          message: data.error || 'Migration failed'
        });
      }
    } catch (error: any) {
      setResult({
        success: false,
        message: `Error: ${error.message}`
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRunPresetMigration = () => {
    if (!selectedMigration) return;
    runMigration(selectedMigration.sql, selectedMigration.description);
  };

  const handleRunCustomMigration = () => {
    if (!customSql.trim()) return;
    runMigration(customSql, 'Custom migration');
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Database Migrations</CardTitle>
          <CardDescription>
            Run database schema updates without losing existing data
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Mode Selector */}
          <div className="flex gap-2">
            <Button
              variant={mode === 'preset' ? 'default' : 'outline'}
              onClick={() => setMode('preset')}
            >
              Preset Migrations
            </Button>
            <Button
              variant={mode === 'custom' ? 'default' : 'outline'}
              onClick={() => setMode('custom')}
            >
              Custom SQL
            </Button>
          </div>

          {/* Preset Migrations */}
          {mode === 'preset' && (
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Available Migrations</label>
                <div className="space-y-2">
                  {AVAILABLE_MIGRATIONS.map((migration) => (
                    <div
                      key={migration.version}
                      className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                        selectedMigration?.version === migration.version
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:border-primary/50'
                      }`}
                      onClick={() => setSelectedMigration(migration)}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-medium">
                            {migration.version} - {migration.name}
                          </h4>
                          <p className="text-sm text-muted-foreground mt-1">
                            {migration.description}
                          </p>
                        </div>
                        {selectedMigration?.version === migration.version && (
                          <span className="text-xs bg-primary text-primary-foreground px-2 py-1 rounded">
                            Selected
                          </span>
                        )}
                      </div>
                      {selectedMigration?.version === migration.version && (
                        <div className="mt-3 p-3 bg-muted rounded text-sm font-mono overflow-x-auto">
                          {migration.sql}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <Button
                onClick={handleRunPresetMigration}
                disabled={!selectedMigration || loading}
                className="w-full"
              >
                {loading ? 'Running Migration...' : 'Run Selected Migration'}
              </Button>
            </div>
          )}

          {/* Custom SQL */}
          {mode === 'custom' && (
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Custom SQL</label>
                <Textarea
                  value={customSql}
                  onChange={(e) => setCustomSql(e.target.value)}
                  placeholder="ALTER TABLE table_name ADD COLUMN column_name TEXT;&#x0a;&#x0a;-- You can run multiple statements separated by semicolons&#x0a;-- Be careful: Changes are applied immediately!"
                  className="font-mono text-sm min-h-[200px]"
                />
                <p className="text-xs text-muted-foreground">
                  ⚠️ Warning: Custom SQL runs directly on your database. Make sure to test in development first!
                </p>
              </div>

              <Button
                onClick={handleRunCustomMigration}
                disabled={!customSql.trim() || loading}
                className="w-full"
                variant="destructive"
              >
                {loading ? 'Running Migration...' : 'Run Custom SQL'}
              </Button>
            </div>
          )}

          {/* Result */}
          {result && (
            <Alert variant={result.success ? 'default' : 'destructive'}>
              <AlertDescription>
                {result.success ? '✅ ' : '❌ '}
                {result.message}
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Info Card */}
      <Card>
        <CardHeader>
          <CardTitle>Migration Best Practices</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <ul className="list-disc list-inside space-y-1">
            <li>Always test migrations in development before running in production</li>
            <li>Backup your data before running custom SQL (export from Webflow Cloud)</li>
            <li>Preset migrations are safe and idempotent (can run multiple times)</li>
            <li>Custom SQL should use "IF NOT EXISTS" or "IF EXISTS" clauses when possible</li>
            <li>Each migration runs in a transaction (rolls back on error)</li>
          </ul>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button
            variant="outline"
            className="w-full justify-start"
            onClick={async () => {
              setLoading(true);
              try {
                const response = await fetch(`${baseUrl}/api/admin/debug-schema`);
                const data = await response.json();
                console.log('Database Schema:', data);
                alert('Schema logged to console. Check browser developer tools.');
              } catch (error) {
                alert('Failed to fetch schema');
              } finally {
                setLoading(false);
              }
            }}
          >
            📋 View Current Schema
          </Button>
          
          <Button
            variant="outline"
            className="w-full justify-start"
            onClick={() => {
              const sql = `-- Check if column exists
PRAGMA table_info(query_templates_v2);

-- View all tables
SELECT name FROM sqlite_master WHERE type='table';

-- Count records
SELECT COUNT(*) FROM query_templates_v2;`;
              setMode('custom');
              setCustomSql(sql);
            }}
          >
            📝 Load Example Diagnostic SQL
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}


