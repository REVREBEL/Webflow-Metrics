import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import { DevLinkProvider } from '../site-components/DevLinkProvider';
import * as KpiCard from '../site-components/KpiCard';
import { baseUrl } from '../lib/base-url';

interface Hotel {
  id: number;
  hotel_name: string;
  hotel_code: string;
}

interface MetricDefinition {
  id: number;
  metric_name: string;
  display_name: string;
  format_type: string;
  decimal_places: number;
  prefix?: string;
  suffix?: string;
}

interface CardConfig {
  id: number;
  card_name: string;
  card_type: string;
  slots: Array<{
    slotName: string;
    metricId: number | null;
    label?: string;
  }>;
}

interface MetricValue {
  metricId: number;
  value: string;
  rawValue: number;
  displayName: string;
}

export default function DashboardWithCards() {
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [selectedHotel, setSelectedHotel] = useState<string>('');
  const [cardConfigs, setCardConfigs] = useState<CardConfig[]>([]);
  const [metricDefinitions, setMetricDefinitions] = useState<MetricDefinition[]>([]);
  const [metricValues, setMetricValues] = useState<Record<number, MetricValue>>({});
  const [loading, setLoading] = useState(true);
  const [loadingMetrics, setLoadingMetrics] = useState(false);

  // Date filters
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;
  const [selectedYear, setSelectedYear] = useState(currentYear.toString());
  const [selectedMonth, setSelectedMonth] = useState(currentMonth.toString());

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    if (selectedHotel) {
      loadMetricValues();
    }
  }, [selectedHotel, selectedYear, selectedMonth]);

  const loadInitialData = async () => {
    setLoading(true);
    try {
      // Load hotels
      const hotelsRes = await fetch(`${baseUrl}/api/client/hotels`);
      if (hotelsRes.ok) {
        const hotelsData = await hotelsRes.json();
        setHotels(hotelsData);
        if (hotelsData.length > 0) {
          setSelectedHotel(hotelsData[0].hotel_code);
        }
      }

      // Load card configurations
      const cardsRes = await fetch(`${baseUrl}/api/admin/card-configs`);
      if (cardsRes.ok) {
        const cardsData = await cardsRes.json();
        setCardConfigs(cardsData);
      }

      // Load metric definitions
      const metricsRes = await fetch(`${baseUrl}/api/admin/metric-definitions`);
      if (metricsRes.ok) {
        const metricsData = await metricsRes.json();
        setMetricDefinitions(metricsData);
      }
    } catch (error) {
      console.error('Error loading initial data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMetricValues = async () => {
    if (!selectedHotel) return;

    setLoadingMetrics(true);
    try {
      const res = await fetch(
        `${baseUrl}/api/client/metrics-by-definition?hotel_code=${selectedHotel}&year=${selectedYear}&month=${selectedMonth}`
      );

      if (res.ok) {
        const data = await res.json();
        
        // Convert array to map for easy lookup
        const valuesMap: Record<number, MetricValue> = {};
        data.forEach((metric: any) => {
          valuesMap[metric.metricId] = metric;
        });
        
        setMetricValues(valuesMap);
      }
    } catch (error) {
      console.error('Error loading metric values:', error);
    } finally {
      setLoadingMetrics(false);
    }
  };

  const formatMetricValue = (metricId: number): string => {
    const value = metricValues[metricId];
    if (!value) return '—';
    return value.value;
  };

  const getMetricDefinition = (metricId: number | null): MetricDefinition | null => {
    if (!metricId) return null;
    return metricDefinitions.find(m => m.id === metricId) || null;
  };

  const renderCard = (config: CardConfig) => {
    const slot1 = config.slots[0];
    const slot2 = config.slots[1];
    const slot3 = config.slots[2];

    const metric1 = getMetricDefinition(slot1?.metricId);
    const metric2 = getMetricDefinition(slot2?.metricId);
    const metric3 = getMetricDefinition(slot3?.metricId);

    const value1 = slot1?.metricId ? formatMetricValue(slot1.metricId) : '—';
    const value2 = slot2?.metricId ? formatMetricValue(slot2.metricId) : '—';
    const value3 = slot3?.metricId ? formatMetricValue(slot3.metricId) : '—';

    if (config.card_type === 'kpi') {
      return (
        <KpiCard.KpiCard
          key={config.id}
          metric1Slot={
            <div className="text-center">
              <div className="text-sm text-muted-foreground mb-1">
                {metric1?.display_name || slot1?.label || 'Metric 1'}
              </div>
              <div className="text-3xl font-bold">
                {loadingMetrics ? '...' : value1}
              </div>
            </div>
          }
          metric2Slot={
            metric2 ? (
              <div className="text-center">
                <div className="text-sm text-muted-foreground mb-1">
                  {metric2.display_name}
                </div>
                <div className="text-2xl font-semibold">
                  {loadingMetrics ? '...' : value2}
                </div>
              </div>
            ) : undefined
          }
          metric3Slot={
            metric3 ? (
              <div className="text-center">
                <div className="text-sm text-muted-foreground mb-1">
                  {metric3.display_name}
                </div>
                <div className="text-2xl font-semibold">
                  {loadingMetrics ? '...' : value3}
                </div>
              </div>
            ) : undefined
          }
        />
      );
    }

    // Fallback to standard card for other types
    return (
      <Card key={config.id}>
        <CardHeader>
          <CardTitle>{config.card_name}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {config.slots.map((slot, idx) => {
              const metric = getMetricDefinition(slot.metricId);
              const value = slot.metricId ? formatMetricValue(slot.metricId) : '—';
              
              if (!metric) return null;

              return (
                <div key={idx} className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">
                    {metric.display_name}
                  </span>
                  <span className="text-lg font-semibold">
                    {loadingMetrics ? '...' : value}
                  </span>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-8">
        <div className="max-w-7xl mx-auto">
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-muted-foreground">Loading dashboard...</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (hotels.length === 0) {
    return (
      <div className="min-h-screen bg-background p-8">
        <div className="max-w-7xl mx-auto">
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-muted-foreground mb-4">No hotels configured</p>
              <Button onClick={() => window.location.href = `${baseUrl}/admin`}>
                Go to Admin Panel
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (cardConfigs.length === 0) {
    return (
      <div className="min-h-screen bg-background p-8">
        <div className="max-w-7xl mx-auto">
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-muted-foreground mb-4">No dashboard cards configured</p>
              <Button onClick={() => window.location.href = `${baseUrl}/admin`}>
                Configure Cards in Admin Panel
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <DevLinkProvider>
      <div className="min-h-screen bg-background p-8">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold font-heading">Dashboard</h1>
              <p className="text-muted-foreground">Real-time metrics and analytics</p>
            </div>
            <Button 
              variant="outline" 
              onClick={() => window.location.href = `${baseUrl}/admin`}
            >
              Admin Panel
            </Button>
          </div>

          {/* Filters */}
          <Card>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Hotel Selector */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Hotel</label>
                  <Select value={selectedHotel} onValueChange={setSelectedHotel}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {hotels.map(hotel => (
                        <SelectItem key={hotel.hotel_code} value={hotel.hotel_code}>
                          {hotel.hotel_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Year Selector */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Year</label>
                  <Select value={selectedYear} onValueChange={setSelectedYear}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[currentYear - 1, currentYear, currentYear + 1].map(year => (
                        <SelectItem key={year} value={year.toString()}>
                          {year}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Month Selector */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Month</label>
                  <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: 12 }, (_, i) => i + 1).map(month => (
                        <SelectItem key={month} value={month.toString()}>
                          {new Date(2000, month - 1).toLocaleString('default', { month: 'long' })}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="mt-4 flex items-center gap-2">
                <Button onClick={loadMetricValues} disabled={loadingMetrics}>
                  {loadingMetrics ? 'Refreshing...' : 'Refresh Data'}
                </Button>
                {loadingMetrics && (
                  <Badge variant="secondary">Loading metrics...</Badge>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Dashboard Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {cardConfigs.map(config => renderCard(config))}
          </div>

          {/* Stats Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold">{cardConfigs.length}</div>
                  <div className="text-sm text-muted-foreground">Cards</div>
                </div>
                <div>
                  <div className="text-2xl font-bold">
                    {Object.keys(metricValues).length}
                  </div>
                  <div className="text-sm text-muted-foreground">Metrics Loaded</div>
                </div>
                <div>
                  <div className="text-2xl font-bold">{hotels.length}</div>
                  <div className="text-sm text-muted-foreground">Hotels</div>
                </div>
                <div>
                  <div className="text-2xl font-bold">
                    {selectedMonth}/{selectedYear}
                  </div>
                  <div className="text-sm text-muted-foreground">Period</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DevLinkProvider>
  );
}

