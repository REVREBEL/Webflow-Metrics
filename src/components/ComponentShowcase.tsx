import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { AreaChart, BarChart, LineChart, DonutChart, StackedBarChart } from './charts';
import { MetricCard, StatsCard } from './statistics';

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

export function ComponentShowcase() {
  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <div>
          <h1 className="text-4xl font-bold font-heading">Component Showcase</h1>
          <p className="text-muted-foreground mt-2">All available chart and statistic components</p>
        </div>

        {/* Statistics Cards Section */}
        <section className="space-y-4">
          <h2 className="text-2xl font-heading font-bold">Statistics Cards</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <StatsCard
              title="Total Revenue"
              value="$45,231"
              description="+20.1% from last month"
              trend="up"
            />
            <StatsCard
              title="Bookings"
              value="2,350"
              description="+180 from last month"
              trend="up"
            />
            <StatsCard
              title="Occupancy"
              value="85.2%"
              description="-2% from last month"
              trend="down"
            />
            <StatsCard
              title="ADR"
              value="$195"
              description="+$12 from last month"
              trend="up"
            />
          </div>
        </section>

        {/* Metric Cards Section */}
        <section className="space-y-4">
          <h2 className="text-2xl font-heading font-bold">Metric Cards</h2>
          <div className="grid gap-4 md:grid-cols-3">
            <MetricCard
              title="Revenue"
              value="$45,231"
              change={20.1}
              changeLabel="from last month"
            />
            <MetricCard
              title="Guests"
              value="1,234"
              change={-5.2}
              changeLabel="from last month"
            />
            <MetricCard
              title="RevPAR"
              value="$166"
              change={15.3}
              changeLabel="from last month"
            />
          </div>
        </section>

        {/* Charts Section */}
        <section className="space-y-4">
          <h2 className="text-2xl font-heading font-bold">Charts</h2>
          
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Area Chart</CardTitle>
                <CardDescription>Monthly revenue trend</CardDescription>
              </CardHeader>
              <CardContent>
                <AreaChart data={revenueData} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Bar Chart</CardTitle>
                <CardDescription>Bookings by month</CardDescription>
              </CardHeader>
              <CardContent>
                <BarChart data={revenueData} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Line Chart</CardTitle>
                <CardDescription>Revenue vs Bookings</CardDescription>
              </CardHeader>
              <CardContent>
                <LineChart data={revenueData} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Donut Chart</CardTitle>
                <CardDescription>Revenue distribution</CardDescription>
              </CardHeader>
              <CardContent>
                <DonutChart data={revenueData} />
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Usage Instructions */}
        <section className="space-y-4 p-6 bg-muted rounded-lg">
          <h2 className="text-2xl font-heading font-bold">Usage Instructions</h2>
          <div className="space-y-4 text-sm">
            <div>
              <h3 className="font-semibold mb-2">Statistics Components</h3>
              <pre className="bg-background p-3 rounded overflow-x-auto">
{`import { StatsCard, MetricCard } from './components/statistics';

<StatsCard
  title="Total Revenue"
  value="$45,231"
  description="+20.1% from last month"
  trend="up"
/>`}
              </pre>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Chart Components</h3>
              <pre className="bg-background p-3 rounded overflow-x-auto">
{`import { BarChart } from './components/charts';

<BarChart data={data} />`}
              </pre>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
