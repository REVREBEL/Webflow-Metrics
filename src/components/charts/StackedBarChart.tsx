import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface StackedBarChartProps {
  data: Array<{
    day: number;
    transient: number;
    group: number;
    isWeekend?: boolean;
  }>;
  height?: number;
}

export function StackedBarChart({ data, height = 300 }: StackedBarChartProps) {
  // Transform data to use different colors for weekends
  const chartData = data.map(item => ({
    day: item.day,
    // Weekday values
    transient_weekday: !item.isWeekend ? item.transient : 0,
    group_weekday: !item.isWeekend ? item.group : 0,
    // Weekend values
    transient_weekend: item.isWeekend ? item.transient : 0,
    group_weekend: item.isWeekend ? item.group : 0,
  }));

  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
        <XAxis 
          dataKey="day" 
          className="text-xs"
          tick={{ fill: 'hsl(var(--foreground))' }}
        />
        <YAxis 
          className="text-xs"
          tick={{ fill: 'hsl(var(--foreground))' }}
        />
        <Tooltip 
          contentStyle={{
            backgroundColor: 'hsl(var(--card))',
            border: '1px solid hsl(var(--border))',
            borderRadius: '6px',
          }}
          formatter={(value: number, name: string) => {
            const label = name.includes('transient') ? 'Transient' : 'Group';
            return [value.toLocaleString(), label];
          }}
        />
        <Legend 
          formatter={(value: string) => {
            if (value === 'transient_weekday' || value === 'transient_weekend') return 'Transient';
            if (value === 'group_weekday' || value === 'group_weekend') return 'Group';
            return value;
          }}
        />
        
        {/* Weekday bars - chart-3 and chart-4 */}
        <Bar 
          dataKey="transient_weekday" 
          stackId="weekday"
          fill="hsl(var(--chart-3))" 
          name="transient_weekday"
        />
        <Bar 
          dataKey="group_weekday" 
          stackId="weekday"
          fill="hsl(var(--chart-4))" 
          name="group_weekday"
        />
        
        {/* Weekend bars - chart-5 and chart-6 (we'll use chart-5 and a darker variant) */}
        <Bar 
          dataKey="transient_weekend" 
          stackId="weekend"
          fill="hsl(var(--chart-5))" 
          name="transient_weekend"
        />
        <Bar 
          dataKey="group_weekend" 
          stackId="weekend"
          fill="hsl(var(--destructive))" 
          name="group_weekend"
        />
      </BarChart>
    </ResponsiveContainer>
  );
}
