import React from 'react';
import { DashboardShell, DashboardHeader, DashboardContent, DashboardGrid } from './dashboard';
import { StatsCard, StatsGrid, MetricCard, ComparisonCard } from './statistics';
import { BarChartComponent, LineChartComponent, AreaChartComponent } from './charts';
import { Button } from './ui/button';
import { 
  DollarSign, 
  Users, 
  CreditCard, 
  Activity,
  TrendingUp,
  Calendar,
  Hotel
} from 'lucide-react';

// Sample data for charts
const revenueData = [
  { month: 'Jan', revenue: 45000, bookings: 120 },
  { month: 'Feb', revenue: 52000, bookings: 145 },
  { month: 'Mar', revenue: 48000, bookings: 130 },
  { month: 'Apr', revenue: 61000, bookings: 170 },
  { month: 'May', revenue: 58000, bookings: 160 },
  { month: 'Jun', revenue: 70000, bookings: 195 }
];

const occupancyData = [
  { day: 'Mon', occupancy: 85 },
  { day: 'Tue', occupancy: 92 },
  { day: 'Wed', occupancy: 78 },
  { day: 'Thu', occupancy: 88 },
  { day: 'Fri', occupancy: 95 },
  { day: 'Sat', occupancy: 100 },
  { day: 'Sun', occupancy: 89 }
];

const multiLineData = [
  { week: 'Week 1', rooms: 85, revenue: 42000, adr: 145 },
  { week: 'Week 2', rooms: 92, revenue: 48000, adr: 152 },
  { week: 'Week 3', rooms: 78, revenue: 38000, adr: 138 },
  { week: 'Week 4', rooms: 95, revenue: 52000, adr: 158 }
];

export function ComponentShowcase() {
  return (
    <DashboardShell>
      <DashboardContent>
        <DashboardHeader
          heading="Component Showcase"
          description="All available chart and statistic components for your dashboard"
        >
          <Button>Download Report</Button>
        </DashboardHeader>

        {/* Stats Cards Section */}
        <section className="space-y-4">
          <h2 className="text-2xl font-heading font-bold">Statistics Cards</h2>
          
          <StatsGrid columns={4}>
            <StatsCard
              title="Total Revenue"
              value="$45,231.89"
              description="from last month"
              trend={{ value: 20.1, isPositive: true }}
              icon={<DollarSign className="h-4 w-4" />}
            />
            <StatsCard
              title="Bookings"
              value="+2,350"
              description="from last month"
              trend={{ value: 18.1, isPositive: true, label: "vs last month" }}
              icon={<Calendar className="h-4 w-4" />}
            />
            <StatsCard
              title="Occupancy Rate"
              value="73.5%"
              description="from last week"
              trend={{ value: 4.3, isPositive: false }}
              icon={<Hotel className="h-4 w-4" />}
            />
            <StatsCard
              title="Active Guests"
              value="+573"
              description="checked in today"
              trend={{ value: 12.5, isPositive: true }}
              icon={<Users className="h-4 w-4" />}
            />
          </StatsGrid>
        </section>

        {/* Metric Cards Section */}
        <section className="space-y-4 mt-8">
          <h2 className="text-2xl font-heading font-bold">Metric Cards</h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <MetricCard
              title="Average Daily Rate"
              value="$285"
              subtitle="Per night"
              description="↑ 8% from last period"
              variant="primary"
              icon={<DollarSign className="h-5 w-5 text-primary" />}
            />
            <MetricCard
              title="RevPAR"
              value="$209.48"
              subtitle="Revenue per available room"
              description="↑ 12% from last month"
              variant="success"
              icon={<TrendingUp className="h-5 w-5 text-green-600" />}
            />
            <MetricCard
              title="Guest Satisfaction"
              value="4.8/5"
              subtitle="Based on 234 reviews"
              description="↓ 0.2 from last quarter"
              variant="warning"
              icon={<Activity className="h-5 w-5 text-amber-600" />}
            />
          </div>
        </section>

        {/* Comparison Card */}
        <section className="space-y-4 mt-8">
          <h2 className="text-2xl font-heading font-bold">Comparison Card</h2>
          
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
              },
              {
                label: 'Average Stay',
                current: 3.2,
                previous: 2.9,
                format: (v) => `${v.toFixed(1)} nights`
              }
            ]}
          />
        </section>

        {/* Charts Section */}
        <section className="space-y-4 mt-8">
          <h2 className="text-2xl font-heading font-bold">Chart Components</h2>
          
          <DashboardGrid columns={2}>
            <BarChartComponent
              title="Monthly Revenue"
              description="Revenue by month"
              data={revenueData}
              dataKey="revenue"
              xAxisKey="month"
              yAxisLabel="Revenue ($)"
              color="hsl(var(--chart-1))"
            />
            
            <BarChartComponent
              title="Weekly Occupancy"
              description="Occupancy percentage by day"
              data={occupancyData}
              dataKey="occupancy"
              xAxisKey="day"
              yAxisLabel="Occupancy (%)"
              color="hsl(var(--chart-2))"
            />
          </DashboardGrid>

          <LineChartComponent
            title="Performance Trends"
            description="Multiple metrics over time"
            data={multiLineData}
            lines={[
              { dataKey: 'rooms', name: 'Rooms Sold', stroke: 'hsl(var(--chart-1))' },
              { dataKey: 'adr', name: 'ADR ($)', stroke: 'hsl(var(--chart-2))' }
            ]}
            xAxisKey="week"
            yAxisLabel="Value"
          />

          <AreaChartComponent
            title="Revenue & Bookings"
            description="Stacked area chart showing combined metrics"
            data={revenueData}
            areas={[
              { dataKey: 'revenue', name: 'Revenue ($)', fill: 'hsl(var(--chart-1))' },
              { dataKey: 'bookings', name: 'Bookings', fill: 'hsl(var(--chart-3))' }
            ]}
            xAxisKey="month"
            yAxisLabel="Value"
            stacked={false}
          />
        </section>

        {/* Usage Instructions */}
        <section className="space-y-4 mt-8 p-6 bg-muted rounded-lg">
          <h2 className="text-2xl font-heading font-bold">Usage Instructions</h2>
          <div className="space-y-4 text-sm">
            <div>
              <h3 className="font-semibold mb-2">Statistics Components</h3>
              <pre className="bg-background p-3 rounded overflow-x-auto">
{`import { StatsCard, StatsGrid, MetricCard } from './components/statistics';

<StatsCard
  title="Total Revenue"
  value="$45,231.89"
  trend={{ value: 20.1, isPositive: true }}
  icon={<DollarSign />}
/>`}
              </pre>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Chart Components</h3>
              <pre className="bg-background p-3 rounded overflow-x-auto">
{`import { BarChartComponent } from './components/charts';

<BarChartComponent
  title="Monthly Revenue"
  data={data}
  dataKey="revenue"
  xAxisKey="month"
/>`}
              </pre>
            </div>
          </div>
        </section>
      </DashboardContent>
    </DashboardShell>
  );
}
