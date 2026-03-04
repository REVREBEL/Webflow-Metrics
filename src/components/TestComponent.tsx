import React from 'react';

export function TestComponent() {
  return (
    <div style={{ padding: '2rem', background: '#f0f0f0', borderRadius: '8px' }}>
      <h1 style={{ color: '#163666' }}>React is Working! ✓</h1>
      <p>This is a simple React component with no dependencies.</p>
      <button 
        onClick={() => alert('Button clicked!')}
        style={{ padding: '0.5rem 1rem', background: '#163666', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
      >
        Click Me
      </button>
    </div>
  );
}
