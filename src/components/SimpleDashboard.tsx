import React, { useState, useEffect } from 'react';
import { baseUrl } from '../lib/base-url';

interface Hotel {
  hotel_code: string;
  hotel_name: string;
}

export function SimpleDashboard() {
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchHotels();
  }, []);

  const fetchHotels = async () => {
    try {
      const response = await fetch(`${baseUrl}/api/client/hotels`);
      const data = await response.json();
      
      if (response.ok) {
        setHotels(data.hotels || []);
      } else {
        setError(data.error || 'Failed to fetch hotels');
      }
    } catch (err) {
      setError('Failed to connect to server');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '2rem', minHeight: '100vh', background: 'var(--background)', color: 'var(--foreground)' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '1rem' }}>
          Simple Dashboard Test
        </h1>

        {loading && (
          <div style={{ padding: '2rem', textAlign: 'center' }}>
            <p>Loading hotels...</p>
          </div>
        )}

        {error && (
          <div style={{ padding: '1rem', background: 'var(--destructive)', color: 'white', borderRadius: '8px', marginBottom: '1rem' }}>
            <strong>Error:</strong> {error}
          </div>
        )}

        {!loading && !error && hotels.length === 0 && (
          <div style={{ padding: '2rem', background: 'var(--card)', border: '2px solid var(--border)', borderRadius: '8px' }}>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>No Hotels Configured</h2>
            <p style={{ color: 'var(--muted-foreground)', marginBottom: '1rem' }}>
              Please add hotels in the admin panel first
            </p>
            <a 
              href={`${baseUrl}/admin`}
              style={{ 
                display: 'inline-block', 
                padding: '0.5rem 1rem', 
                background: 'var(--primary)', 
                color: 'var(--primary-foreground)', 
                textDecoration: 'none',
                borderRadius: '4px'
              }}
            >
              Go to Admin Panel
            </a>
          </div>
        )}

        {!loading && hotels.length > 0 && (
          <div style={{ padding: '2rem', background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '8px' }}>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Hotels Found</h2>
            <ul style={{ listStyle: 'none', padding: 0 }}>
              {hotels.map((hotel) => (
                <li 
                  key={hotel.hotel_code}
                  style={{ 
                    padding: '1rem', 
                    marginBottom: '0.5rem', 
                    background: 'var(--muted)', 
                    borderRadius: '4px' 
                  }}
                >
                  <strong>{hotel.hotel_name}</strong> ({hotel.hotel_code})
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
