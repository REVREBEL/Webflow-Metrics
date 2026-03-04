import React from 'react';
import { cn } from '../../lib/utils';

interface DashboardShellProps {
  children: React.ReactNode;
  className?: string;
}

export function DashboardShell({ children, className }: DashboardShellProps) {
  return (
    <div className={cn('min-h-screen bg-background', className)}>
      {children}
    </div>
  );
}

interface DashboardHeaderProps {
  heading: string;
  description?: string;
  children?: React.ReactNode;
  className?: string;
}

export function DashboardHeader({
  heading,
  description,
  children,
  className
}: DashboardHeaderProps) {
  return (
    <div className={cn('flex items-center justify-between pb-6', className)}>
      <div className="space-y-1">
        <h1 className="text-3xl font-heading font-bold tracking-tight">{heading}</h1>
        {description && (
          <p className="text-muted-foreground">{description}</p>
        )}
      </div>
      {children && <div className="flex items-center gap-2">{children}</div>}
    </div>
  );
}

interface DashboardContentProps {
  children: React.ReactNode;
  className?: string;
}

export function DashboardContent({ children, className }: DashboardContentProps) {
  return (
    <div className={cn('container mx-auto p-6 max-w-7xl', className)}>
      {children}
    </div>
  );
}

interface DashboardGridProps {
  children: React.ReactNode;
  columns?: 1 | 2 | 3 | 4;
  className?: string;
}

export function DashboardGrid({ children, columns = 3, className }: DashboardGridProps) {
  const gridClass = {
    1: 'grid-cols-1',
    2: 'md:grid-cols-2',
    3: 'md:grid-cols-2 lg:grid-cols-3',
    4: 'md:grid-cols-2 lg:grid-cols-4'
  }[columns];

  return (
    <div className={cn('grid gap-6', gridClass, className)}>
      {children}
    </div>
  );
}
