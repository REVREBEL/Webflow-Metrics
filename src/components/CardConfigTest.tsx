import React from 'react';
import CardManager from './CardManager';

export default function CardConfigTest() {
  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--background)' }}>
      <div style={{ padding: '2rem', maxWidth: '1400px', margin: '0 auto' }}>
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
            Card Configuration Test
          </h1>
          <p style={{ color: 'var(--muted-foreground)' }}>
            Test the configurable card backend - create, edit, and manage dashboard cards
          </p>
        </div>

        <CardManager />
      </div>
    </div>
  );
}
