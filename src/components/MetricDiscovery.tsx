import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import { Alert, AlertDescription } from './ui/alert';
import { baseUrl } from '../lib/base-url';

interface DiscoveredMetric {
  metric_name: string;
  display_name: string;
  data_template_id: number;
  template_name: string;
  formula: string;
  format_type: string;
  decimal_places: number;
  prefix?: string;
  suffix?: string;
  category?: string;
  description?: string;
  source: string;
  is_filter?: boolean;
}

export default function MetricDiscovery({ onComplete }: { onComplete: () => void }) {
  const [discovering, setDiscovering] = useState(false);
  const [discovered, setDiscovered] = useState<DiscoveredMetric[]>([]);
  const [selectedMetrics, setSelectedMetrics] = useState<Set<string>>(new Set());
  const [importing, setImporting] = useState(false);
  const [showFilters, setShowFilters] = useState(true);

  useEffect(() => {
    checkForNewMetrics();
  }, []);

  const checkForNewMetrics = async () => {
    setDiscovering(true);
    try {
      const res = await fetch(`${baseUrl}/api/admin/metric-definitions/discover`);
      if (res.ok) {
        const data = await res.json();
        if (data.count > 0) {
          setDiscovered(data.metrics);
          // Select all by default
          setSelectedMetrics(new Set(data.metrics.map((m: DiscoveredMetric) => m.metric_name)));
        }
      }
    } catch (error) {
      console.error('Error discovering metrics:', error);
    } finally {
      setDiscovering(false);
    }
  };

  const updateMetric = (metricName: string, field: string, value: any) => {
    setDiscovered(prev =>
      prev.map(m =>
        m.metric_name === metricName ? { ...m, [field]: value } : m
      )
    );
  };

  const toggleMetricSelection = (metricName: string) => {
    setSelectedMetrics(prev => {
      const newSet = new Set(prev);
      if (newSet.has(metricName)) {
        newSet.delete(metricName);
      } else {
        newSet.add(metricName);
      }
      return newSet;
    });
  };

  const commitMetrics = async () => {
    const metricsToCommit = discovered.filter(m => selectedMetrics.has(m.metric_name));
    
    if (metricsToCommit.length === 0) {
      alert('Please select at least one metric to commit');
      return;
    }

    setImporting(true);
    try {
      const res = await fetch(`${baseUrl}/api/admin/metric-definitions/discover`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ metrics: metricsToCommit })
      });

      if (res.ok) {
        const result = await res.json();
        alert(`✓ Successfully added ${result.count} metrics to the library!`);
        setSelectedMetrics(new Set());
        if (onComplete) onComplete();
      } else {
        const error = await res.json();
        alert(`Error: ${error.error}`);
      }
    } catch (error) {
      console.error('Error committing metrics:', error);
      alert('Failed to commit metrics');
    } finally {
      setImporting(false);
    }
  };

  if (discovering) {
    return (
      <Alert>
        <AlertDescription>
          🔍 Scanning for new metrics from data templates...
        </AlertDescription>
      </Alert>
    );
  }

  if (discovered.length > 0) {
    const allSelected = discovered.every(m => selectedMetrics.has(m.metric_name));
    const filterColumns = discovered.filter(m => m.is_filter);
    const metricColumns = discovered.filter(m => !m.is_filter);
    const displayedColumns = showFilters ? discovered : metricColumns;

    return (
      <Card className="border-blue-200 dark:border-blue-800">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <span className="text-2xl">🔍</span>
                New Columns Discovered
              </CardTitle>
              <CardDescription>
                Found {metricColumns.length} metrics and {filterColumns.length} filter columns
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
              >
                {showFilters ? 'Hide' : 'Show'} Filters ({filterColumns.length})
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  if (allSelected) {
                    setSelectedMetrics(new Set());
                  } else {
                    setSelectedMetrics(new Set(discovered.map(m => m.metric_name)));
                  }
                }}
              >
                {allSelected ? 'Deselect All' : 'Select All'}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4 max-h-[600px] overflow-y-auto">
            {displayedColumns.map((metric) => {
              const isSelected = selectedMetrics.has(metric.metric_name);
              const isFilter = metric.is_filter;
              
              return (
                <Card
                  key={metric.metric_name}
                  className={`transition-all ${
                    isFilter 
                      ? 'border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50'
                      : isSelected 
                        ? 'border-primary bg-primary/5' 
                        : 'opacity-60'
                  }`}
                >
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-4">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleMetricSelection(metric.metric_name)}
                        className="mt-1 w-4 h-4"
                      />
                      
                      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Column 1 */}
                        <div className="space-y-3">
                          <div>
                            <Label className="text-xs text-muted-foreground">Column Name</Label>
                            <div className="font-mono text-sm font-medium">{metric.metric_name}</div>
                            <div className="text-xs text-muted-foreground">
                              from {metric.template_name}
                            </div>
                            {isFilter && (
                              <Badge variant="outline" className="mt-1 bg-gray-100 dark:bg-gray-800">
                                🔍 Filter/Lookup
                              </Badge>
                            )}
                          </div>

                          <div>
                            <Label htmlFor={`display-${metric.metric_name}`}>Display Name*</Label>
                            <Input
                              id={`display-${metric.metric_name}`}
                              value={metric.display_name}
                              onChange={(e) => {
                                e.stopPropagation();
                                updateMetric(metric.metric_name, 'display_name', e.target.value);
                              }}
                              onClick={(e) => e.stopPropagation()}
                              disabled={!isSelected}
                            />
                          </div>

                          <div>
                            <Label htmlFor={`category-${metric.metric_name}`}>Category</Label>
                            <Input
                              id={`category-${metric.metric_name}`}
                              value={metric.category || ''}
                              onChange={(e) => {
                                e.stopPropagation();
                                updateMetric(metric.metric_name, 'category', e.target.value);
                              }}
                              onClick={(e) => e.stopPropagation()}
                              placeholder="e.g., Revenue, Occupancy"
                              disabled={!isSelected}
                            />
                          </div>
                        </div>

                        {/* Column 2 */}
                        <div className="space-y-3">
                          <div onClick={(e) => e.stopPropagation()}>
                            <Label htmlFor={`format-${metric.metric_name}`}>Format Type</Label>
                            <Select
                              value={metric.format_type}
                              onValueChange={(value) => updateMetric(metric.metric_name, 'format_type', value)}
                              disabled={!isSelected}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="number">Number</SelectItem>
                                <SelectItem value="currency">Currency</SelectItem>
                                <SelectItem value="percentage">Percentage</SelectItem>
                                <SelectItem value="filter">Filter/Lookup</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="grid grid-cols-3 gap-2">
                            <div>
                              <Label htmlFor={`decimals-${metric.metric_name}`}>Decimals</Label>
                              <Input
                                id={`decimals-${metric.metric_name}`}
                                type="number"
                                min="0"
                                max="4"
                                value={metric.decimal_places}
                                onChange={(e) => {
                                  e.stopPropagation();
                                  updateMetric(metric.metric_name, 'decimal_places', parseInt(e.target.value));
                                }}
                                onClick={(e) => e.stopPropagation()}
                                disabled={!isSelected}
                              />
                            </div>
                            <div>
                              <Label htmlFor={`prefix-${metric.metric_name}`}>Prefix</Label>
                              <Input
                                id={`prefix-${metric.metric_name}`}
                                value={metric.prefix || ''}
                                onChange={(e) => {
                                  e.stopPropagation();
                                  updateMetric(metric.metric_name, 'prefix', e.target.value);
                                }}
                                onClick={(e) => e.stopPropagation()}
                                placeholder="$"
                                disabled={!isSelected}
                              />
                            </div>
                            <div>
                              <Label htmlFor={`suffix-${metric.metric_name}`}>Suffix</Label>
                              <Input
                                id={`suffix-${metric.metric_name}`}
                                value={metric.suffix || ''}
                                onChange={(e) => {
                                  e.stopPropagation();
                                  updateMetric(metric.metric_name, 'suffix', e.target.value);
                                }}
                                onClick={(e) => e.stopPropagation()}
                                placeholder="%"
                                disabled={!isSelected}
                              />
                            </div>
                          </div>

                          <div>
                            <Label htmlFor={`desc-${metric.metric_name}`}>Description</Label>
                            <Input
                              id={`desc-${metric.metric_name}`}
                              value={metric.description || ''}
                              onChange={(e) => {
                                e.stopPropagation();
                                updateMetric(metric.metric_name, 'description', e.target.value);
                              }}
                              onClick={(e) => e.stopPropagation()}
                              placeholder="Optional description"
                              disabled={!isSelected}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <div className="flex gap-2 pt-4 border-t">
            <Button
              onClick={commitMetrics}
              disabled={importing || selectedMetrics.size === 0}
              className="flex-1"
            >
              {importing ? 'Committing...' : `Commit ${selectedMetrics.size} Metric${selectedMetrics.size !== 1 ? 's' : ''} to Library`}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return null;
}




