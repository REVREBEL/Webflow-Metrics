import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { ArrowUpIcon, ArrowDownIcon, TrendingUp, TrendingDown } from 'lucide-react';
import { cn } from '../../lib/utils';

interface StatsCardProps {
  title: string;
  value: string | number;
  description?: string;
  trend?: {
    value: number;
    isPositive: boolean;
    label?: string;
  };
  icon?: React.ReactNode;
  className?: string;
}

export function StatsCard({
  title,
  value,
  description,
  trend,
  icon,
  className
}: StatsCardProps) {
  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon && <div className="text-muted-foreground">{icon}</div>}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {(description || trend) && (
          <div className="flex items-center gap-2 mt-1">
            {trend && (
              <span className={cn(
                "inline-flex items-center gap-1 text-xs font-medium",
                trend.isPositive ? "text-green-600" : "text-red-600"
              )}>
                {trend.isPositive ? (
                  <ArrowUpIcon className="h-3 w-3" />
                ) : (
                  <ArrowDownIcon className="h-3 w-3" />
                )}
                {Math.abs(trend.value)}%
              </span>
            )}
            <p className="text-xs text-muted-foreground">
              {trend?.label || description}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

interface StatsGridProps {
  children: React.ReactNode;
  columns?: 1 | 2 | 3 | 4;
  className?: string;
}

export function StatsGrid({ children, columns = 4, className }: StatsGridProps) {
  const gridClass = {
    1: 'grid-cols-1',
    2: 'md:grid-cols-2',
    3: 'md:grid-cols-3',
    4: 'md:grid-cols-2 lg:grid-cols-4'
  }[columns];

  return (
    <div className={cn('grid grid-cols-1 gap-4', gridClass, className)}>
      {children}
    </div>
  );
}
