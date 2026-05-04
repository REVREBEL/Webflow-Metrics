import React from 'react';
import { KpiCard } from '../site-components/KpiCard';
import { ConcentricDonutChart } from './charts/ConcentricDonutChart';

interface KpiCardWithDataProps {
  // Revenue metrics
  totalRevenueBudget: number;
  totalRevenueOTB: number;
  
  transientRevenueBudget: number;
  transientRevenueOTB: number;
  
  groupRevenueBudget: number;
  groupRevenueOTB: number;
  
  // Primary metrics with variances
  revenueOTB: number;
  revenueVariance: number;
  
  occupancyOTB: number;
  occupancyVariance: number;
  
  roomsOTB: number;
  roomsVariance: number;
  
  adrOTB: number;
  adrVariance: number;
  
  revparOTB: number;
  revparVariance: number;
}

export function KpiCardWithData({
  totalRevenueBudget,
  totalRevenueOTB,
  transientRevenueBudget,
  transientRevenueOTB,
  groupRevenueBudget,
  groupRevenueOTB,
  revenueOTB,
  revenueVariance,
  occupancyOTB,
  occupancyVariance,
  roomsOTB,
  roomsVariance,
  adrOTB,
  adrVariance,
  revparOTB,
  revparVariance
}: KpiCardWithDataProps) {
  
  // Calculate revenue reach (remaining to book)
  const totalRevenueReach = Math.max(0, totalRevenueBudget - totalRevenueOTB);
  const transientRevenueReach = Math.max(0, transientRevenueBudget - transientRevenueOTB);
  const groupRevenueReach = Math.max(0, groupRevenueBudget - groupRevenueOTB);
  
  // Format currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };
  
  const formatCurrencyDecimal = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };
  
  const formatPercent = (value: number) => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(1)}%`;
  };
  
  const formatVariance = (value: number, isCurrency = true, decimals = 0) => {
    const formatted = isCurrency 
      ? (decimals > 0 ? formatCurrencyDecimal(Math.abs(value)) : formatCurrency(Math.abs(value)))
      : Math.abs(value).toFixed(decimals);
    return `${value >= 0 ? '+' : '-'}${formatted}`;
  };
  
  // Arrow icon helper
  const getArrowIcon = (variance: number) => {
    const color = variance >= 0 
      ? 'var(--_apps---charts--positive)' 
      : 'var(--_apps---charts--negative)';
    const icon = variance >= 0 ? 'fi-arrow-up' : 'fi-arrow-down';
    
    return (
      <i 
        className={`fi ${icon}`}
        style={{ 
          color,
          fontSize: '1.25rem'
        }}
      />
    );
  };

  return (
    <KpiCard
      // Concentric Donut Chart
      chart1DonutChartSlot={
        <ConcentricDonutChart
          centerValue={formatCurrency(totalRevenueReach)}
          centerLabel="TO BOOK"
          rings={[
            {
              label: 'Total Revenue',
              otb: totalRevenueOTB,
              revenueReach: totalRevenueReach,
              budget: totalRevenueBudget,
              fillColor: 'var(--_apps---metrics--total)',
              bgColor: 'var(--_apps---metrics--total-inverse)'
            },
            {
              label: 'Transient Revenue',
              otb: transientRevenueOTB,
              revenueReach: transientRevenueReach,
              budget: transientRevenueBudget,
              fillColor: 'var(--_apps---metrics--transient)',
              bgColor: 'var(--_apps---metrics--transient-inverse)'
            },
            {
              label: 'Group Revenue',
              otb: groupRevenueOTB,
              revenueReach: groupRevenueReach,
              budget: groupRevenueBudget,
              fillColor: 'var(--_apps---metrics--group)',
              bgColor: 'var(--_apps---metrics--group-inverse)'
            }
          ]}
        />
      }
      
      // Primary Revenue Metric
      primaryMetricPrimaryMetricSlot={formatCurrency(revenueOTB)}
      primaryMetricPrimaryMetricVarSlot={formatVariance(revenueVariance)}
      primaryMetricVarianceIconSlot={getArrowIcon(revenueVariance)}
      
      // Occupancy
      metric1SubMetricSlot={`${occupancyOTB.toFixed(1)}%`}
      metric1SubMetricVarSlot={formatPercent(occupancyVariance)}
      metric1VarianceIconSlot={getArrowIcon(occupancyVariance)}
      
      // Rooms
      metric2SubMetricSlot={roomsOTB.toLocaleString()}
      metric2SubMetricVarSlot={formatVariance(roomsVariance, false)}
      metric2VarianceIconSlot={getArrowIcon(roomsVariance)}
      
      // ADR
      metric3SubMetricSlot={formatCurrencyDecimal(adrOTB)}
      metric3SubMetricVarSlot={formatVariance(adrVariance, true, 2)}
      metric3VarianceIconSlot={getArrowIcon(adrVariance)}
      
      // RevPAR
      metric4SubMetricSlot={formatCurrencyDecimal(revparOTB)}
      metric4SubMetricVarSlot={formatVariance(revparVariance, true, 2)}
      metric4VarianceIconSlot={getArrowIcon(revparVariance)}
    />
  );
}
