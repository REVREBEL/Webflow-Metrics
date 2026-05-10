"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';

export function ChartConfiguratorSimple() {
  const [chartType, setChartType] = useState('bar');
  
  console.log('ChartConfiguratorSimple rendering, chartType:', chartType);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Chart Configuration</CardTitle>
          <CardDescription>Simple test version</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-sm">Current chart type: {chartType}</p>
            <div className="flex gap-2">
              <button
                onClick={() => setChartType('bar')}
                className="px-4 py-2 bg-primary text-primary-foreground rounded"
              >
                Bar Chart
              </button>
              <button
                onClick={() => setChartType('line')}
                className="px-4 py-2 bg-secondary text-secondary-foreground rounded"
              >
                Line Chart
              </button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Preview</CardTitle>
          <CardDescription>Chart type: {chartType}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-64 bg-muted rounded flex items-center justify-center">
            <p className="text-lg font-semibold">
              {chartType.toUpperCase()} CHART PREVIEW
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
