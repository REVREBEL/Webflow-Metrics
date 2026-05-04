import React from 'react';
import { DevLinkProvider } from '../site-components/DevLinkProvider';
import { KpiCard } from '../site-components/KpiCard';
import { ConcentricDonutChart } from './charts/ConcentricDonutChart';

// Helper function to get variance icon based on value
function getVarianceIcon(value: string | number) {
  const numValue = typeof value === 'string' 
    ? parseFloat(value.replace(/[^0-9.-]/g, '')) 
    : value;
  
  if (numValue >= 0) {
    // Arrow up
    return (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" className="w-4 h-4">
        <path d="M8 2L3 7h3v7h4V7h3L8 2z" />
      </svg>
    );
  } else {
    // Arrow down
    return (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" className="w-4 h-4">
        <path d="M8 14l5-5h-3V2H6v7H3l5 5z" />
      </svg>
    );
  }
}

export function KpiCardTest() {
  console.log('KpiCardTest rendering...');
  
  // Sample data
  const totalBudget = 500000;
  const totalOTB = 375000; // On The Books
  const totalRevenueReach = totalBudget - totalOTB; // 125000 - TO BOOK
  
  const transientBudget = 300000;
  const transientOTB = 225000;
  const transientRevenueReach = transientBudget - transientOTB; // 75000
  
  const groupBudget = 200000;
  const groupOTB = 150000;
  const groupRevenueReach = groupBudget - groupOTB; // 50000
  
  // Metric values with mix of positive and negative variances
  const metrics = {
    primary: { value: '$125,000', variance: '+$5,000' },
    occupancy: { value: '85%', variance: '+2%' },
    rooms: { value: '120', variance: '-5' }, // Negative variance example
    adr: { value: '$450', variance: '+$10' },
    revpar: { value: '$382', variance: '-$15' }, // Negative variance example
  };
  
  return (
    <DevLinkProvider>
      <div className="p-8 min-h-screen bg-background">
        <h1 className="text-2xl font-bold mb-4 text-foreground">KPI Card Test</h1>
        <p className="mb-4 text-muted-foreground">Testing Webflow KpiCard component with Concentric Donut Chart...</p>
        
        <div className="mt-8">
          <KpiCard
            // Primary Metric (Budget)
            primaryMetricPrimaryMetricSlot={metrics.primary.value}
            primaryMetricPrimaryMetricVarSlot={metrics.primary.variance}
            primaryMetricVarianceIconSlot={getVarianceIcon(metrics.primary.variance)}
            
            // Metric 1 (Occupancy)
            metric1SubMetricSlot={metrics.occupancy.value}
            metric1SubMetricVarSlot={metrics.occupancy.variance}
            metric1VarianceIconSlot={getVarianceIcon(metrics.occupancy.variance)}
            
            // Metric 2 (Rooms) - Negative variance
            metric2SubMetricSlot={metrics.rooms.value}
            metric2SubMetricVarSlot={metrics.rooms.variance}
            metric2VarianceIconSlot={getVarianceIcon(metrics.rooms.variance)}
            
            // Metric 3 (ADR)
            metric3SubMetricSlot={metrics.adr.value}
            metric3SubMetricVarSlot={metrics.adr.variance}
            metric3VarianceIconSlot={getVarianceIcon(metrics.adr.variance)}
            
            // Metric 4 (REVPAR) - Negative variance
            metric4SubMetricSlot={metrics.revpar.value}
            metric4SubMetricVarSlot={metrics.revpar.variance}
            metric4VarianceIconSlot={getVarianceIcon(metrics.revpar.variance)}
            
            // Concentric Donut Chart with 3 rings
            chart1DonutChartSlot={
              <ConcentricDonutChart
                centerValue={`$${(totalRevenueReach / 1000).toFixed(0)}K`}
                centerLabel="TO BOOK"
                size={280}
                ringThickness={20}
                ringSpacing={4}
                rings={[
                  {
                    label: 'Total Revenue',
                    otb: totalOTB,
                    revenueReach: totalRevenueReach,
                    budget: totalBudget,
                    fillColor: 'var(--_apps---metrics--total)',
                    bgColor: 'var(--_apps---metrics--total-inverse)'
                  },
                  {
                    label: 'Transient Revenue',
                    otb: transientOTB,
                    revenueReach: transientRevenueReach,
                    budget: transientBudget,
                    fillColor: 'var(--_apps---metrics--transient)',
                    bgColor: 'var(--_apps---metrics--transient-inverse)'
                  },
                  {
                    label: 'Group Revenue',
                    otb: groupOTB,
                    revenueReach: groupRevenueReach,
                    budget: groupBudget,
                    fillColor: 'var(--_apps---metrics--group)',
                    bgColor: 'var(--_apps---metrics--group-inverse)'
                  }
                ]}
              />
            }
            chart2HorizontalBarChartSlot={
              <div className="w-full h-32 bg-muted rounded flex items-center justify-center text-sm text-muted-foreground">
                Bar Chart (Coming Next)
              </div>
            }
          />
        </div>
        
        <div className="mt-8 p-4 bg-card border border-border rounded-lg">
          <h2 className="font-semibold mb-2">Component Info:</h2>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>✓ DevLinkProvider wrapper added</li>
            <li>✓ KpiCard component imported</li>
            <li>✓ Concentric Donut Chart with 3 rings</li>
            <li>✓ Using metric color variables</li>
            <li>✓ Dynamic variance arrows (up/down based on value)</li>
            <li>• Outer Ring: Total Revenue (${totalOTB.toLocaleString()} OTB / ${totalBudget.toLocaleString()} Budget)</li>
            <li>• Middle Ring: Transient Revenue (${transientOTB.toLocaleString()} OTB / ${transientBudget.toLocaleString()} Budget)</li>
            <li>• Inner Ring: Group Revenue (${groupOTB.toLocaleString()} OTB / ${groupBudget.toLocaleString()} Budget)</li>
            <li>• Center: ${(totalRevenueReach / 1000).toFixed(0)}K TO BOOK</li>
          </ul>
        </div>
      </div>
    </DevLinkProvider>
  );
}


