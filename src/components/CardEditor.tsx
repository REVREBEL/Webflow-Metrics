import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { baseUrl } from '../lib/base-url';

interface MetricDefinition {
  id: number;
  metric_name: string;
  display_name: string;
  category?: string;
  format_type: string;
  decimal_places: number;
  prefix?: string;
  suffix?: string;
}

interface CardSlot {
  slotName: string;
  metricId: number | null;
  label?: string;
}

interface CardConfig {
  id?: number;
  card_name: string;
  card_type: 'kpi' | 'chart' | 'stat';
  slots: CardSlot[];
}

export default function CardEditor({ 
  onSave, 
  onCancel,
  existingConfig 
}: { 
  onSave: () => void;
  onCancel: () => void;
  existingConfig?: CardConfig;
}) {
  const [metrics, setMetrics] = useState<MetricDefinition[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [config, setConfig] = useState<CardConfig>(existingConfig || {
    card_name: '',
    card_type: 'kpi',
    slots: [
      { slotName: 'metric1', metricId: null, label: 'Primary Metric' },
      { slotName: 'metric2', metricId: null, label: 'Secondary Metric' },
      { slotName: 'metric3', metricId: null, label: 'Tertiary Metric' }
    ]
  });

  // Load available metrics
  useEffect(() => {
    loadMetrics();
  }, []);

  const loadMetrics = async () => {
    try {
      const res = await fetch(`${baseUrl}/api/admin/metric-definitions`);
      if (res.ok) {
        const data = await res.json();
        setMetrics(data);
      }
    } catch (error) {
      console.error('Error loading metrics:', error);
    } finally {
      setLoading(false);
    }
  };

  // Group metrics by category
  const metricsByCategory = metrics.reduce((acc, metric) => {
    const category = metric.category || 'Uncategorized';
    if (!acc[category]) acc[category] = [];
    acc[category].push(metric);
    return acc;
  }, {} as Record<string, MetricDefinition[]>);

  const assignMetricToSlot = (slotIndex: number, metricId: number) => {
    const newSlots = [...config.slots];
    newSlots[slotIndex].metricId = metricId;
    setConfig({ ...config, slots: newSlots });
  };

  const removeMetricFromSlot = (slotIndex: number) => {
    const newSlots = [...config.slots];
    newSlots[slotIndex].metricId = null;
    setConfig({ ...config, slots: newSlots });
  };

  const getMetricById = (id: number | null) => {
    if (!id) return null;
    return metrics.find(m => m.id === id);
  };

  const handleSave = async () => {
    if (!config.card_name) {
      alert('Please enter a card name');
      return;
    }

    setSaving(true);
    try {
      const method = config.id ? 'PUT' : 'POST';
      const res = await fetch(`${baseUrl}/api/admin/card-configs`, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config)
      });

      if (res.ok) {
        onSave();
      } else {
        const error = await res.json();
        alert(`Error: ${error.error}`);
      }
    } catch (error) {
      console.error('Error saving card config:', error);
      alert('Failed to save card configuration');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="p-4">Loading metrics...</div>;
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Left: Configuration */}
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Card Configuration</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="card_name">Card Name*</Label>
              <Input
                id="card_name"
                value={config.card_name}
                onChange={e => setConfig({ ...config, card_name: e.target.value })}
                placeholder="Revenue Overview"
              />
            </div>

            <div>
              <Label htmlFor="card_type">Card Type</Label>
              <Select
                value={config.card_type}
                onValueChange={(value: any) => setConfig({ ...config, card_type: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="kpi">KPI Card</SelectItem>
                  <SelectItem value="chart">Chart Card</SelectItem>
                  <SelectItem value="stat">Stat Card</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Slot Assignment */}
        <Card>
          <CardHeader>
            <CardTitle>Assign Metrics to Slots</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {config.slots.map((slot, index) => {
              const assignedMetric = getMetricById(slot.metricId);
              
              return (
                <div key={slot.slotName} className="border rounded-lg p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium">{slot.label}</Label>
                    {assignedMetric && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => removeMetricFromSlot(index)}
                      >
                        ✕
                      </Button>
                    )}
                  </div>

                  {assignedMetric ? (
                    <div className="bg-primary/10 border border-primary rounded p-2">
                      <div className="font-medium text-sm">{assignedMetric.display_name}</div>
                      <div className="text-xs text-muted-foreground font-mono">
                        {assignedMetric.metric_name}
                      </div>
                      <Badge variant="outline" className="mt-1 text-xs">
                        {assignedMetric.format_type}
                      </Badge>
                    </div>
                  ) : (
                    <div className="text-sm text-muted-foreground italic">
                      No metric assigned - click a metric from the library →
                    </div>
                  )}
                </div>
              );
            })}
          </CardContent>
        </Card>

        <div className="flex gap-2">
          <Button onClick={handleSave} disabled={saving}>
            {saving ? 'Saving...' : 'Save Card'}
          </Button>
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        </div>
      </div>

      {/* Right: Metric Library */}
      <div>
        <Card>
          <CardHeader>
            <CardTitle>Metric Library</CardTitle>
            <p className="text-sm text-muted-foreground">
              Click a metric to assign it to the selected slot
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 max-h-[600px] overflow-y-auto">
              {Object.entries(metricsByCategory).map(([category, categoryMetrics]) => (
                <div key={category}>
                  <h4 className="font-semibold text-sm mb-2 text-muted-foreground">
                    {category}
                  </h4>
                  <div className="space-y-2">
                    {categoryMetrics.map(metric => {
                      const isAssigned = config.slots.some(s => s.metricId === metric.id);
                      
                      return (
                        <div
                          key={metric.id}
                          className={`
                            border rounded-lg p-3 cursor-pointer transition-all
                            ${isAssigned 
                              ? 'bg-primary/5 border-primary/50' 
                              : 'hover:bg-muted hover:border-primary'
                            }
                          `}
                          onClick={() => {
                            // Assign to first empty slot
                            const emptySlotIndex = config.slots.findIndex(s => s.metricId === null);
                            if (emptySlotIndex !== -1) {
                              assignMetricToSlot(emptySlotIndex, metric.id);
                            }
                          }}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="font-medium text-sm">{metric.display_name}</div>
                              <div className="text-xs text-muted-foreground font-mono">
                                {metric.metric_name}
                              </div>
                            </div>
                            <Badge variant="outline" className="text-xs">
                              {metric.format_type}
                            </Badge>
                          </div>
                          {isAssigned && (
                            <Badge variant="secondary" className="mt-2 text-xs">
                              ✓ Assigned
                            </Badge>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
