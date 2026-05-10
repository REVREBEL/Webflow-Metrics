import React from 'react';
import { DevLinkProvider } from '../site-components/DevLinkProvider';
import { DailyMixChart } from './DailyMixChart';

export default function WebflowChartTest() {
  console.log('WebflowChartTest rendering');
  
  return (
    <DevLinkProvider>
      <div style={{ padding: '2rem', backgroundColor: '#f0f0f0', minHeight: '100vh' }}>
        <h1 style={{ marginBottom: '2rem' }}>Webflow Chart Test</h1>
        
        <div style={{ marginBottom: '2rem', padding: '1rem', backgroundColor: 'white', border: '2px solid red' }}>
          <h2>DailyMixChart with Wrapper</h2>
          <DailyMixChart
            title="Test Chart Title"
            metric1Label="Transient"
            metric2Label="Group"
            chartData={
              <div style={{ height: '300px', backgroundColor: '#e0e0e0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                Chart Slot Content
              </div>
            }
            horizontalAxis={
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0 1rem' }}>
                <span>Day 1</span>
                <span>Day 15</span>
                <span>Day 30</span>
              </div>
            }
          />
        </div>

        <div style={{ marginTop: '2rem', padding: '1rem', backgroundColor: 'white' }}>
          <h2>CSS Classes Check</h2>
          <div className="bar-mix-card add-shadow">
            <p>This div has class "bar-mix-card add-shadow"</p>
            <p>If you see proper styling, CSS is loaded correctly</p>
          </div>
        </div>
      </div>
    </DevLinkProvider>
  );
}
