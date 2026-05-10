import React from 'react';

export function TestComponent() {
  console.log('TestComponent rendering');
  
  return (
    <div className="p-8 bg-card text-foreground">
      <h1 className="text-4xl font-bold mb-4">Test Component</h1>
      <p className="text-lg">If you see this, React is working!</p>
      <div className="mt-4 p-4 bg-primary text-primary-foreground rounded">
        This should have primary colors
      </div>
    </div>
  );
}
