import { useState, useEffect } from 'react';
import { BigQueryConfig } from './BigQueryConfig';
import { BigQueryDashboard } from './BigQueryDashboard';
import { DemoMode } from './DemoMode';

interface QueryVariable {
  name: string;
  type: 'date' | 'string' | 'number';
  defaultValue?: string;
}

interface MetricConfig {
  id: string;
  name: string;
  tableName: string;
  query: string;
  variables?: QueryVariable[];
  slot?: 'primary' | 'metric1' | 'metric2' | 'metric3' | 'metric4';
}

interface DashboardConfig {
  serviceAccountJson: string;
  dataLocation: string;
  metrics: MetricConfig[];
}

type AppScreen = 'welcome' | 'config' | 'dashboard';

export function DashboardApp() {
  const [currentScreen, setCurrentScreen] = useState<AppScreen>('welcome');
  const [config, setConfig] = useState<DashboardConfig | null>(null);

  useEffect(() => {
    console.log('[DashboardApp] Mounted and rendering');
    console.log('[DashboardApp] Current screen:', currentScreen);
  }, [currentScreen]);

  const handleUseDemoData = () => {
    console.log('[DashboardApp] Demo data selected');
    // Create demo configuration
    const demoConfig: DashboardConfig = {
      serviceAccountJson: JSON.stringify({
        type: "service_account",
        project_id: "demo-project",
      }),
      dataLocation: 'US',
      metrics: [
        {
          id: '1',
          name: 'Total Users',
          tableName: 'demo.analytics.users',
          query: 'SELECT 15847 as value',
          slot: 'primary',
        },
        {
          id: '2',
          name: 'Total Revenue',
          tableName: 'demo.sales.transactions',
          query: 'SELECT 284750.45 as value',
          slot: 'metric1',
        },
        {
          id: '3',
          name: 'Active Sessions',
          tableName: 'demo.analytics.sessions',
          query: 'SELECT 3421 as value',
          slot: 'metric2',
        }
      ]
    };
    
    setConfig(demoConfig);
    setCurrentScreen('dashboard');
  };

  const handleUseRealConnection = () => {
    console.log('[DashboardApp] Real connection selected');
    setCurrentScreen('config');
  };

  const handleConfigComplete = (newConfig: DashboardConfig) => {
    console.log('[DashboardApp] Config complete');
    setConfig(newConfig);
    setCurrentScreen('dashboard');
  };

  const handleBackToConfig = () => {
    console.log('[DashboardApp] Back to config');
    setCurrentScreen('config');
  };

  console.log('[DashboardApp] Rendering, screen =', currentScreen);

  return (
    <div className="min-h-screen bg-background p-8">
      <h1 className="text-4xl font-bold mb-8">BigQuery Dashboard</h1>
      
      {currentScreen === 'welcome' && (
        <DemoMode 
          onUseDemoData={handleUseDemoData}
          onUseRealConnection={handleUseRealConnection}
        />
      )}
      
      {currentScreen === 'config' && (
        <BigQueryConfig onConfigComplete={handleConfigComplete} />
      )}
      
      {currentScreen === 'dashboard' && config && (
        <BigQueryDashboard 
          config={config} 
          onReconfigure={handleBackToConfig}
        />
      )}
    </div>
  );
}
