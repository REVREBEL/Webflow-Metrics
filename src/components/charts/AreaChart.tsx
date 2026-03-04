import React from 'react';
import { Area, AreaChart as RechartsAreaChart, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';

interface AreaChartProps {
  title: string;
  description?: string;
  data: Array<Record<string, any>>;
  areas: Array<{ dataKey: string; fill?: string; stroke?: string; name?: string }>;
  xAxisKey: string;
  yAxisLabel?: string;
  className?: string;
  stacked?: boolean;
}

export function AreaChartComponent({
  title,
  description,
  data,
  areas,
  xAxisKey,
  yAxisLabel,
  className = '',
  stacked = false
}: AreaChartProps) {
  const defaultColors = [
    'hsl(var(--chart-1))',
    'hsl(var(--chart-2))',
    'hsl(var(--chart-3))',
    'hsl(var(--chart-4))',
    'hsl(var(--chart-5))'
  ];

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <RechartsAreaChart data={data}>
            <defs>
              {areas.map((area, index) => {
                const color = area.fill || defaultColors[index % defaultColors.length];
                return (
                  <linearGradient key={area.dataKey} id={`gradient-${area.dataKey}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={color} stopOpacity={0.8} />
                    <stop offset="95%" stopColor={color} stopOpacity={0.1} />
                  </linearGradient>
                );
              })}
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis 
              dataKey={xAxisKey}
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
            />
            <YAxis
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
              label={yAxisLabel ? { value: yAxisLabel, angle: -90, position: 'insideLeft' } : undefined}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(var(--popover))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '6px'
              }}
            />
            <Legend />
            {areas.map((area, index) => (
              <Area
                key={area.dataKey}
                type="monotone"
                dataKey={area.dataKey}
                name={area.name || area.dataKey}
                stackId={stacked ? 'stack' : undefined}
                stroke={area.stroke || defaultColors[index % defaultColors.length]}
                fill={`url(#gradient-${area.dataKey})`}
                strokeWidth={2}
              />
            ))}
          </RechartsAreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
