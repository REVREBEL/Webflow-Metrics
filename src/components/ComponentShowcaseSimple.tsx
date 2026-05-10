"use client";

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { AreaChart, BarChart, LineChart, DonutChart, StackedBarChart } from './charts';
import { MetricCard, StatsCard } from './statistics';

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
                  <AreaChart data={sampleChartData} />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Bar Chart</CardTitle>
                  <CardDescription>Bookings by month</CardDescription>
                </CardHeader>
                <CardContent>
                  <BarChart data={sampleChartData} />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Line Chart</CardTitle>
                  <CardDescription>Revenue vs Bookings</CardDescription>
                </CardHeader>
                <CardContent>
                  <LineChart data={sampleChartData} />
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
              <StatsCard
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
  );
}

export default ComponentShowcaseSimple;














