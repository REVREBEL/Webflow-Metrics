import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

interface DonutChartProps {
  value: number; // Current value (e.g., 85 for 85%)
  max?: number; // Maximum value (default 100)
  size?: number; // Size in pixels (default 120)
  thickness?: number; // Donut thickness (default 20)
  color?: string; // Primary color
  backgroundColor?: string; // Background color
  showLabel?: boolean; // Show center label
  label?: string; // Custom label text
}

export function DonutChart({
  value,
  max = 100,
  size = 120,
  thickness = 20,
  color = 'hsl(var(--primary))',
  backgroundColor = 'hsl(var(--muted))',
  showLabel = true,
  label,
}: DonutChartProps) {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);
  const remaining = 100 - percentage;

  const data = [
    { name: 'Value', value: percentage },
    { name: 'Remaining', value: remaining },
  ];

  const COLORS = [color, backgroundColor];

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={size / 2 - thickness}
            outerRadius={size / 2}
            paddingAngle={0}
            dataKey="value"
            startAngle={90}
            endAngle={-270}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index]} stroke="none" />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      
      {showLabel && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className="text-2xl font-bold" style={{ color }}>
              {label || `${Math.round(percentage)}%`}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
