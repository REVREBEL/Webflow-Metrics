import React from 'react';
import { StatsCard, MetricCard } from './statistics';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Area, AreaChart, Bar, BarChart, Line, LineChart, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { KpiCardWithData } from './KpiCardWithData';
import { DevLinkProvider } from '../site-components/DevLinkProvider';
import DailyMixChart from './DailyMixChart';

export function ComponentShowcaseSimple() {
  console.log('ComponentShowcaseSimple rendering - complete with Daily Mix');
  
  // Sample data for charts
  const sampleChartData = [
    { name: 'Jan', value: 4000, revenue: 2400 },
    { name: 'Feb', value: 3000, revenue: 1398 },
    { name: 'Mar', value: 2000, revenue: 9800 },
    { name: 'Apr', value: 2780, revenue: 3908 },
    { name: 'May', value: 1890, revenue: 4800 },
    { name: 'Jun', value: 2390, revenue: 3800 },
  ];
  
  return (
    <DevLinkProvider>
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
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={sampleChartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" />
                      <YAxis stroke="hsl(var(--muted-foreground))" />
                      <Tooltip />
                      <Area type="monotone" dataKey="revenue" stroke="hsl(var(--chart-1))" fill="hsl(var(--chart-1))" fillOpacity={0.3} />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Bar Chart</CardTitle>
                  <CardDescription>Bookings by month</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={sampleChartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" />
                      <YAxis stroke="hsl(var(--muted-foreground))" />
                      <Tooltip />
                      <Bar dataKey="value" fill="hsl(var(--chart-2))" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Line Chart</CardTitle>
                  <CardDescription>Revenue vs Bookings</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={sampleChartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" />
                      <YAxis stroke="hsl(var(--muted-foreground))" />
                      <Tooltip />
                      <Line type="monotone" dataKey="revenue" stroke="hsl(var(--chart-1))" strokeWidth={2} />
                      <Line type="monotone" dataKey="value" stroke="hsl(var(--chart-2))" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </section>

          {/* Daily Mix Chart Section */}
          <section className="space-y-4">
            <div>
              <h2 className="text-2xl font-heading font-bold">Daily Mix Chart</h2>
              <p className="text-muted-foreground">Stacked bar chart showing transient vs group bookings with weekend highlighting</p>
            </div>
            <DailyMixChart hotelCode="DEMO" year={2024} month={1} />
          </section>

          {/* KPI Card with Concentric Donut Chart */}
          <section className="space-y-6">
            <div>
              <h2 className="text-3xl font-bold font-heading mb-2">KPI Card</h2>
              <p className="text-muted-foreground">
                Multi-layer concentric donut chart with revenue metrics
              </p>
            </div>
            <div className="flex justify-center">
              <KpiCardWithData
                totalRevenueBudget={500000}
                totalRevenueOTB={355000}
                transientRevenueBudget={350000}
                transientRevenueOTB={245000}
                groupRevenueBudget={150000}
                groupRevenueOTB={110000}
                revenueOTB={355000}
                revenueVariance={25000}
                occupancyOTB={78.5}
                occupancyVariance={5.2}
                roomsOTB={1250}
                roomsVariance={150}
                adrOTB={284.00}
                adrVariance={12.50}
                revparOTB={223.14}
                revparVariance={18.75}
              />
            </div>
          </section>
        </div>
      </div>
    </DevLinkProvider>
  );
}

export default ComponentShowcaseSimple;













