# Component Library Documentation

This document provides a comprehensive guide to using the custom chart, statistics, and dashboard components in your BigQuery Dashboard application.

## 📊 Chart Components

All chart components are built with Recharts and automatically use your Webflow design system colors.

### BarChartComponent

Display data as vertical bars.

```tsx
import { BarChartComponent } from './components/charts';

<BarChartComponent
  title="Monthly Revenue"
  description="Revenue by month in 2024"
  data={[
    { month: 'Jan', revenue: 45000 },
    { month: 'Feb', revenue: 52000 },
    // ...
  ]}
  dataKey="revenue"
  xAxisKey="month"
  yAxisLabel="Revenue ($)"
  color="hsl(var(--chart-1))"
  className="col-span-2"
/>
```

**Props:**
- `title` (string): Chart title
- `description?` (string): Optional subtitle
- `data` (Array): Array of data objects
- `dataKey` (string): Key in data object to plot
- `xAxisKey` (string): Key for x-axis labels
- `yAxisLabel?` (string): Optional y-axis label
- `color?` (string): Bar color (defaults to primary)
- `className?` (string): Additional CSS classes

### LineChartComponent

Display multiple data series as lines.

```tsx
import { LineChartComponent } from './components/charts';

<LineChartComponent
  title="Performance Trends"
  description="Multiple metrics over time"
  data={weeklyData}
  lines={[
    { dataKey: 'revenue', name: 'Revenue', stroke: 'hsl(var(--chart-1))' },
    { dataKey: 'bookings', name: 'Bookings', stroke: 'hsl(var(--chart-2))' }
  ]}
  xAxisKey="week"
  yAxisLabel="Value"
/>
```

**Props:**
- `title` (string): Chart title
- `description?` (string): Optional subtitle
- `data` (Array): Array of data objects
- `lines` (Array): Array of line configurations
  - `dataKey` (string): Key to plot
  - `name?` (string): Legend name
  - `stroke?` (string): Line color
- `xAxisKey` (string): Key for x-axis
- `yAxisLabel?` (string): Optional y-axis label
- `className?` (string): Additional CSS classes

### AreaChartComponent

Display data as filled areas, optionally stacked.

```tsx
import { AreaChartComponent } from './components/charts';

<AreaChartComponent
  title="Revenue & Bookings"
  description="Combined metrics"
  data={monthlyData}
  areas={[
    { dataKey: 'revenue', name: 'Revenue', fill: 'hsl(var(--chart-1))' },
    { dataKey: 'bookings', name: 'Bookings', fill: 'hsl(var(--chart-3))' }
  ]}
  xAxisKey="month"
  stacked={false}
/>
```

**Props:**
- `title` (string): Chart title
- `description?` (string): Optional subtitle
- `data` (Array): Array of data objects
- `areas` (Array): Array of area configurations
  - `dataKey` (string): Key to plot
  - `name?` (string): Legend name
  - `fill?` (string): Fill color
  - `stroke?` (string): Border color
- `xAxisKey` (string): Key for x-axis
- `yAxisLabel?` (string): Optional y-axis label
- `stacked?` (boolean): Stack areas (default: false)
- `className?` (string): Additional CSS classes

## 📈 Statistics Components

### StatsCard

Compact card for displaying a single metric with trend indicator.

```tsx
import { StatsCard } from './components/statistics';

<StatsCard
  title="Total Revenue"
  value="$45,231.89"
  description="from last month"
  trend={{ value: 20.1, isPositive: true }}
  icon={<DollarSign className="h-4 w-4" />}
/>
```

**Props:**
- `title` (string): Metric name
- `value` (string | number): Main value to display
- `description?` (string): Additional context
- `trend?` (object): Trend indicator
  - `value` (number): Percentage change
  - `isPositive` (boolean): Green or red indicator
  - `label?` (string): Custom trend label
- `icon?` (ReactNode): Icon to display
- `className?` (string): Additional CSS classes

### StatsGrid

Responsive grid container for StatsCards.

```tsx
import { StatsGrid, StatsCard } from './components/statistics';

<StatsGrid columns={4}>
  <StatsCard {...} />
  <StatsCard {...} />
  <StatsCard {...} />
  <StatsCard {...} />
</StatsGrid>
```

**Props:**
- `columns` (1 | 2 | 3 | 4): Number of columns (default: 4)
- `children` (ReactNode): StatsCard components
- `className?` (string): Additional CSS classes

### MetricCard

Larger card for detailed metrics with variants.

```tsx
import { MetricCard } from './components/statistics';

<MetricCard
  title="Average Daily Rate"
  value="$285"
  subtitle="Per night"
  description="↑ 8% from last period"
  variant="primary"
  icon={<DollarSign className="h-5 w-5" />}
  footer={<Button size="sm">View Details</Button>}
/>
```

**Props:**
- `title` (string): Metric name
- `value` (string | number): Main value
- `subtitle?` (string): Secondary text
- `description?` (string): Additional context
- `variant?` ('default' | 'primary' | 'secondary' | 'success' | 'warning' | 'danger'): Color scheme
- `icon?` (ReactNode): Icon element
- `footer?` (ReactNode): Custom footer content
- `className?` (string): Additional CSS classes

### ComparisonCard

Compare current vs previous period metrics.

```tsx
import { ComparisonCard } from './components/statistics';

<ComparisonCard
  title="Month-over-Month Comparison"
  metrics={[
    {
      label: 'Total Revenue',
      current: 145230,
      previous: 132400,
      format: (v) => `$${(v / 1000).toFixed(1)}k`
    },
    {
      label: 'Bookings',
      current: 856,
      previous: 742
    }
  ]}
/>
```

**Props:**
- `title` (string): Card title
- `metrics` (Array): Array of comparison metrics
  - `label` (string): Metric name
  - `current` (number): Current value
  - `previous` (number): Previous value
  - `format?` (function): Custom formatter
- `className?` (string): Additional CSS classes

## 🏗️ Dashboard Layout Components

### DashboardShell

Root container for dashboard pages.

```tsx
import { DashboardShell } from './components/dashboard';

<DashboardShell>
  {/* Dashboard content */}
</DashboardShell>
```

### DashboardHeader

Page header with title and actions.

```tsx
import { DashboardHeader } from './components/dashboard';

<DashboardHeader
  heading="Analytics Dashboard"
  description="Real-time metrics and insights"
>
  <Button>Download Report</Button>
</DashboardHeader>
```

**Props:**
- `heading` (string): Page title
- `description?` (string): Subtitle
- `children?` (ReactNode): Action buttons
- `className?` (string): Additional CSS classes

### DashboardContent

Container with consistent padding and max-width.

```tsx
import { DashboardContent } from './components/dashboard';

<DashboardContent>
  {/* Page content */}
</DashboardContent>
```

### DashboardGrid

Responsive grid for layout.

```tsx
import { DashboardGrid } from './components/dashboard';

<DashboardGrid columns={3}>
  <Card>...</Card>
  <Card>...</Card>
  <Card>...</Card>
</DashboardGrid>
```

**Props:**
- `columns` (1 | 2 | 3 | 4): Number of columns
- `children` (ReactNode): Grid items
- `className?` (string): Additional CSS classes

## 🎨 Color Scheme

All components use CSS variables from your Webflow design system:

- `hsl(var(--chart-1))` - Primary chart color (teal)
- `hsl(var(--chart-2))` - Secondary chart color (light teal)
- `hsl(var(--chart-3))` - Tertiary chart color (blue)
- `hsl(var(--chart-4))` - Quaternary chart color (yellow)
- `hsl(var(--chart-5))` - Quinary chart color (orange)

## 📦 Complete Example

```tsx
import React from 'react';
import { 
  DashboardShell, 
  DashboardHeader, 
  DashboardContent, 
  DashboardGrid 
} from './components/dashboard';
import { StatsCard, StatsGrid, MetricCard } from './components/statistics';
import { BarChartComponent, LineChartComponent } from './components/charts';
import { DollarSign, TrendingUp } from 'lucide-react';

export function MyDashboard() {
  return (
    <DashboardShell>
      <DashboardContent>
        <DashboardHeader
          heading="Hotel Analytics"
          description="Performance metrics for January 2024"
        />

        <StatsGrid columns={4} className="mb-6">
          <StatsCard
            title="Revenue"
            value="$145,230"
            trend={{ value: 12.5, isPositive: true }}
            icon={<DollarSign className="h-4 w-4" />}
          />
          {/* More stats cards... */}
        </StatsGrid>

        <DashboardGrid columns={2}>
          <BarChartComponent
            title="Monthly Revenue"
            data={revenueData}
            dataKey="revenue"
            xAxisKey="month"
          />
          <LineChartComponent
            title="Bookings Trend"
            data={bookingsData}
            lines={[{ dataKey: 'bookings' }]}
            xAxisKey="date"
          />
        </DashboardGrid>
      </DashboardContent>
    </DashboardShell>
  );
}
```

## 🔍 View Live Examples

Visit `/showcase` to see all components in action with sample data and code examples.

## 💡 Tips

1. **Consistent Colors**: Use `hsl(var(--chart-N))` variables for consistent theming
2. **Responsive Design**: All components are mobile-responsive by default
3. **Data Format**: Ensure your BigQuery results match the expected data structure
4. **Performance**: Components use ResponsiveContainer for optimal rendering
5. **Accessibility**: All charts include proper ARIA labels and keyboard navigation

## 🆘 Troubleshooting

**Charts not showing?**
- Check that your data array has the correct keys matching `dataKey` and `xAxisKey`
- Ensure data values are numbers, not strings

**Colors not working?**
- Verify that `generated/webflow.css` is imported in your layout
- Check browser console for CSS variable errors

**Components not rendering?**
- Make sure you're using `client:only="react"` directive in .astro files
- Check that all required props are provided
