"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Label } from './ui/label';
import { DevLinkProvider } from '../site-components/DevLinkProvider';

// Import Webflow input components
import { ToggleGroup } from '../site-components/basics/ToggleGroup';
import { NumberStepper } from '../site-components/inputs/NumberStepper';
import { DateInput } from '../site-components/inputs/DateInput';
import { ColorPicker } from '../site-components/inputs/ColorPicker';

// Import our chart components
import { AreaChart, BarChart, LineChart, DonutChart } from './charts';

export interface ChartConfig {
  chartType: 'area' | 'bar' | 'line' | 'donut';
  title: string;
  dataPoints: number;
  startDate: string;
  endDate: string;
  primaryColor: string;
  secondaryColor: string;
  showLegend: boolean;
  showGrid: boolean;
}

interface ChartConfiguratorProps {
  onConfigChange?: (config: ChartConfig) => void;
  initialConfig?: Partial<ChartConfig>;
}

export function ChartConfigurator({ onConfigChange, initialConfig }: ChartConfiguratorProps) {
  console.log('ChartConfigurator rendering...');
  
  const [config, setConfig] = useState<ChartConfig>({
    chartType: 'bar',
    title: 'Revenue Overview',
    dataPoints: 12,
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    primaryColor: '#00a6b6',
    secondaryColor: '#71c9c5',
    showLegend: true,
    showGrid: true,
    ...initialConfig,
  });

  console.log('Current config:', config);

  const updateConfig = (updates: Partial<ChartConfig>) => {
    const newConfig = { ...config, ...updates };
    setConfig(newConfig);
    onConfigChange?.(newConfig);
  };

  // Sample data for chart preview
  const sampleData = Array.from({ length: config.dataPoints }, (_, i) => ({
    name: `Point ${i + 1}`,
    value: Math.floor(Math.random() * 1000) + 500,
    value2: Math.floor(Math.random() * 800) + 400,
  }));

  const renderChart = () => {
    const chartProps = {
      data: sampleData,
      className: "h-[300px]",
    };

    switch (config.chartType) {
      case 'area':
        return <AreaChart {...chartProps} />;
      case 'bar':
        return <BarChart {...chartProps} />;
      case 'line':
        return <LineChart {...chartProps} />;
      case 'donut':
        return <DonutChart {...chartProps} />;
      default:
        return <BarChart {...chartProps} />;
    }
  };

  return (
    <DevLinkProvider>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Configuration Panel */}
        <Card>
          <CardHeader>
            <CardTitle>Chart Configuration</CardTitle>
            <CardDescription>
              Customize your chart using the controls below
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Chart Type Selector */}
            <div className="space-y-2">
              <Label>Chart Type</Label>
              <div className="flex gap-2">
                <button
                  onClick={() => updateConfig({ chartType: 'bar' })}
                  className={`px-4 py-2 rounded border ${
                    config.chartType === 'bar'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-background'
                  }`}
                >
                  Bar
                </button>
                <button
                  onClick={() => updateConfig({ chartType: 'line' })}
                  className={`px-4 py-2 rounded border ${
                    config.chartType === 'line'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-background'
                  }`}
                >
                  Line
                </button>
                <button
                  onClick={() => updateConfig({ chartType: 'area' })}
                  className={`px-4 py-2 rounded border ${
                    config.chartType === 'area'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-background'
                  }`}
                >
                  Area
                </button>
                <button
                  onClick={() => updateConfig({ chartType: 'donut' })}
                  className={`px-4 py-2 rounded border ${
                    config.chartType === 'donut'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-background'
                  }`}
                >
                  Donut
                </button>
              </div>
            </div>

            {/* Webflow Toggle Group - Chart Options */}
            <div className="space-y-2">
              <Label>Chart Options (Webflow Toggle Group)</Label>
              <div className="p-4 border rounded bg-muted/50">
                <ToggleGroup />
                <p className="text-xs text-muted-foreground mt-2">
                  Note: This is a Webflow component placeholder. Configure in Webflow Designer.
                </p>
              </div>
            </div>

            {/* Number Stepper - Data Points */}
            <div className="space-y-2">
              <Label>Number of Data Points</Label>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => updateConfig({ dataPoints: Math.max(1, config.dataPoints - 1) })}
                  className="px-3 py-1 border rounded hover:bg-muted"
                >
                  -
                </button>
                <span className="font-mono text-lg w-12 text-center">{config.dataPoints}</span>
                <button
                  onClick={() => updateConfig({ dataPoints: Math.min(50, config.dataPoints + 1) })}
                  className="px-3 py-1 border rounded hover:bg-muted"
                >
                  +
                </button>
              </div>
              <div className="p-4 border rounded bg-muted/50">
                <NumberStepper />
                <p className="text-xs text-muted-foreground mt-2">
                  Webflow Number Stepper component
                </p>
              </div>
            </div>

            {/* Date Range */}
            <div className="space-y-2">
              <Label>Date Range</Label>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs">Start Date</Label>
                  <input
                    type="date"
                    value={config.startDate}
                    onChange={(e) => updateConfig({ startDate: e.target.value })}
                    className="w-full px-3 py-2 border rounded"
                  />
                </div>
                <div>
                  <Label className="text-xs">End Date</Label>
                  <input
                    type="date"
                    value={config.endDate}
                    onChange={(e) => updateConfig({ endDate: e.target.value })}
                    className="w-full px-3 py-2 border rounded"
                  />
                </div>
              </div>
              <div className="p-4 border rounded bg-muted/50">
                <DateInput />
                <p className="text-xs text-muted-foreground mt-2">
                  Webflow Date Input component
                </p>
              </div>
            </div>

            {/* Color Pickers */}
            <div className="space-y-2">
              <Label>Chart Colors</Label>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs">Primary Color</Label>
                  <input
                    type="color"
                    value={config.primaryColor}
                    onChange={(e) => updateConfig({ primaryColor: e.target.value })}
                    className="w-full h-10 border rounded cursor-pointer"
                  />
                </div>
                <div>
                  <Label className="text-xs">Secondary Color</Label>
                  <input
                    type="color"
                    value={config.secondaryColor}
                    onChange={(e) => updateConfig({ secondaryColor: e.target.value })}
                    className="w-full h-10 border rounded cursor-pointer"
                  />
                </div>
              </div>
              <div className="p-4 border rounded bg-muted/50">
                <ColorPicker />
                <p className="text-xs text-muted-foreground mt-2">
                  Webflow Color Picker component
                </p>
              </div>
            </div>

            {/* Toggle Options */}
            <div className="space-y-2">
              <Label>Display Options</Label>
              <div className="space-y-2">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={config.showLegend}
                    onChange={(e) => updateConfig({ showLegend: e.target.checked })}
                    className="w-4 h-4"
                  />
                  <span className="text-sm">Show Legend</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={config.showGrid}
                    onChange={(e) => updateConfig({ showGrid: e.target.checked })}
                    className="w-4 h-4"
                  />
                  <span className="text-sm">Show Grid</span>
                </label>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Chart Preview */}
        <Card>
          <CardHeader>
            <CardTitle>Chart Preview</CardTitle>
            <CardDescription>
              Live preview of your configured chart
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="text-center">
                <h3 className="text-lg font-semibold">{config.title}</h3>
                <p className="text-sm text-muted-foreground">
                  {config.startDate} to {config.endDate}
                </p>
              </div>
              {renderChart()}
              <div className="p-4 bg-muted rounded text-sm space-y-1">
                <p><strong>Type:</strong> {config.chartType}</p>
                <p><strong>Data Points:</strong> {config.dataPoints}</p>
                <p><strong>Primary Color:</strong> <span className="inline-block w-4 h-4 rounded" style={{ backgroundColor: config.primaryColor }}></span> {config.primaryColor}</p>
                <p><strong>Secondary Color:</strong> <span className="inline-block w-4 h-4 rounded" style={{ backgroundColor: config.secondaryColor }}></span> {config.secondaryColor}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DevLinkProvider>
  );
}

