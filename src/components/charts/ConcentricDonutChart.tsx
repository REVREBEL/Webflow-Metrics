import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

interface DonutRingData {
  label: string;
  otb: number; // On the Books value
  revenueReach: number; // Revenue Reach (remaining to budget)
  budget: number; // Total budget (otb + revenueReach)
  fillColor: string; // Color for OTB portion
  bgColor: string; // Color for remaining portion
}

interface ConcentricDonutChartProps {
  centerValue: string; // e.g., "$45,000"
  centerLabel: string; // e.g., "TO BOOK"
  rings: DonutRingData[];
  size?: number;
  ringThickness?: number;
  ringSpacing?: number;
}

export function ConcentricDonutChart({
  centerValue,
  centerLabel,
  rings,
  size = 280,
  ringThickness = 24,
  ringSpacing = 4
}: ConcentricDonutChartProps) {
  const centerHoleDiameter = 110;
  const centerHoleRadius = centerHoleDiameter / 2;

  return (
    <div style={{ position: 'relative', width: size, height: size, margin: '0 auto' }}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          {rings.map((ring, index) => {
            // Calculate radius for this ring
            // Innermost ring has smallest radius, outer rings get progressively larger
            const ringIndex = rings.length - 1 - index; // Reverse so outer ring is drawn first
            const innerRadius = centerHoleRadius + (ringIndex * (ringThickness + ringSpacing));
            const outerRadius = innerRadius + ringThickness;

            const data = [
              { name: 'OTB', value: ring.otb },
              { name: 'Remaining', value: ring.revenueReach }
            ];

            const colors = [ring.fillColor, ring.bgColor];

            return (
              <Pie
                key={`ring-${index}`}
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={innerRadius}
                outerRadius={outerRadius}
                startAngle={90}
                endAngle={-270}
                dataKey="value"
                stroke="none"
              >
                {data.map((entry, idx) => (
                  <Cell key={`cell-${idx}`} fill={colors[idx]} />
                ))}
              </Pie>
            );
          })}
        </PieChart>
      </ResponsiveContainer>

      {/* Center Label */}
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          textAlign: 'center',
          pointerEvents: 'none'
        }}
      >
        <div
          style={{
            fontFamily: 'var(--_apps---font--metrics)',
            fontSize: '1.75rem',
            fontWeight: 'bold',
            color: 'var(--_apps---colors--foreground)',
            lineHeight: 1.2,
            marginBottom: '0.25rem'
          }}
        >
          {centerValue}
        </div>
        <div
          style={{
            fontFamily: 'var(--_apps---font--body)',
            fontSize: '0.75rem',
            color: 'var(--_apps---colors--foreground)',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            opacity: 0.8
          }}
        >
          {centerLabel}
        </div>
      </div>
    </div>
  );
}
