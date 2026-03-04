import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { cn } from '../../lib/utils';

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  description?: string;
  variant?: 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'danger';
  icon?: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
}

export function MetricCard({
  title,
  value,
  subtitle,
  description,
  variant = 'default',
  icon,
  footer,
  className
}: MetricCardProps) {
  const variantClasses = {
    default: 'bg-card border-border',
    primary: 'bg-primary/5 border-primary/20',
    secondary: 'bg-secondary/5 border-secondary/20',
    success: 'bg-green-50 border-green-200 dark:bg-green-950/20 dark:border-green-900/30',
    warning: 'bg-amber-50 border-amber-200 dark:bg-amber-950/20 dark:border-amber-900/30',
    danger: 'bg-red-50 border-red-200 dark:bg-red-950/20 dark:border-red-900/30'
  };

  return (
    <Card className={cn(variantClasses[variant], className)}>
      <CardHeader className="space-y-1">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {title}
            </CardTitle>
            {subtitle && (
              <CardDescription className="text-xs">{subtitle}</CardDescription>
            )}
          </div>
          {icon && (
            <div className="rounded-md bg-muted/50 p-2">
              {icon}
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="text-3xl font-bold tracking-tight">{value}</div>
        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
        {footer && (
          <div className="pt-2 border-t">{footer}</div>
        )}
      </CardContent>
    </Card>
  );
}

interface ComparisonMetric {
  label: string;
  current: number;
  previous: number;
  format?: (value: number) => string;
}

interface ComparisonCardProps {
  title: string;
  metrics: ComparisonMetric[];
  className?: string;
}

export function ComparisonCard({ title, metrics, className }: ComparisonCardProps) {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {metrics.map((metric, index) => {
            const change = ((metric.current - metric.previous) / metric.previous) * 100;
            const isPositive = change >= 0;
            const format = metric.format || ((v: number) => v.toString());

            return (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{metric.label}</span>
                  <span className={cn(
                    "text-xs font-semibold",
                    isPositive ? "text-green-600" : "text-red-600"
                  )}>
                    {isPositive ? '+' : ''}{change.toFixed(1)}%
                  </span>
                </div>
                <div className="flex items-baseline gap-3">
                  <span className="text-2xl font-bold">{format(metric.current)}</span>
                  <span className="text-sm text-muted-foreground">
                    vs {format(metric.previous)}
                  </span>
                </div>
                {index < metrics.length - 1 && (
                  <div className="h-px bg-border mt-4" />
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
