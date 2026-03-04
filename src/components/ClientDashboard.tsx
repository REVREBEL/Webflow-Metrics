import React, { useState, useEffect } from 'react';
import { baseUrl } from '../lib/base-url';

interface Hotel {
  hotel_code: string;
  hotel_name: string;
}

interface Metric {
  metric_name: string;
  value: any;
  success: boolean;
  error?: string;
}

export function ClientDashboard() {
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [selectedHotel, setSelectedHotel] = useState<string>('');
  const [year, setYear] = useState<number>(new Date().getFullYear());
  const [month, setMonth] = useState<number>(new Date().getMonth() + 1);
  const [metrics, setMetrics] = useState<Metric[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingHotels, setLoadingHotels] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`${baseUrl}/api/client/hotels`)
      .then(res => res.json())
      .then(data => {
        const hotelList = data.hotels || [];
        setHotels(hotelList);
        if (hotelList.length > 0) {
          setSelectedHotel(hotelList[0].hotel_code);
        }
        setLoadingHotels(false);
      })
      .catch(() => {
        setError('Failed to load hotels');
        setLoadingHotels(false);
      });
  }, []);

  const fetchMetrics = () => {
    if (!selectedHotel) return;
    
    setLoading(true);
    setError(null);
    
    fetch(`${baseUrl}/api/client/metrics`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ hotel_code: selectedHotel, year, month }),
    })
      .then(res => res.json())
      .then(data => {
        setMetrics(data.metrics || []);
        setLoading(false);
      })
      .catch(() => {
        setError('Failed to load metrics');
        setLoading(false);
      });
  };

  useEffect(() => {
    if (selectedHotel) {
      fetchMetrics();
    }
  }, [selectedHotel, year, month]);

  const formatValue = (value: any): string => {
    if (value === null || value === undefined) return 'N/A';
    if (typeof value === 'number') return value.toLocaleString();
    return String(value);
  };

  const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i);
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  if (loadingHotels) {
    return <div style={{ padding: '2rem' }}><h2>Loading hotels...</h2></div>;
  }

  if (hotels.length === 0) {
    return (
      <div style={{ padding: '2rem' }}>
        <h1 style={{ fontSize: '2rem', marginBottom: '1rem' }}>No Hotels Configured</h1>
        <p style={{ marginBottom: '1rem' }}>Please add hotels in the admin panel first</p>
        <a 
          href={`${baseUrl}/admin`}
          style={{ 
            display: 'inline-block',
            padding: '0.75rem 1.5rem',
            background: '#163666',
            color: 'white',
            textDecoration: 'none',
            borderRadius: '4px'
          }}
        >
          Go to Admin Panel
        </a>
      </div>
    );
  }

  return (
    <div style={{ 
      minHeight: '100vh',
      background: '#eff5f6',
      padding: '2rem'
    }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <div>
            <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold', marginBottom: '0.5rem', color: '#163666' }}>
              Dashboard
            </h1>
            <p style={{ color: '#666' }}>
              View real-time analytics and metrics
            </p>
          </div>
          <a
            href={`${baseUrl}/admin`}
            style={{
              padding: '0.75rem 1.5rem',
              background: '#163666',
              color: 'white',
              textDecoration: 'none',
              borderRadius: '4px',
              fontWeight: '500',
              whiteSpace: 'nowrap'
            }}
          >
            ⚙️ Admin Panel
          </a>
        </div>

        {/* Error */}
        {error && (
          <div style={{ 
            padding: '1rem',
            marginBottom: '1rem',
            background: '#e05047',
            color: 'white',
            borderRadius: '8px'
          }}>
            {error}
          </div>
        )}

        {/* Filters */}
        <div style={{ 
          padding: '1.5rem',
          background: 'white',
          borderRadius: '8px',
          marginBottom: '2rem',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
        }}>
          <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem', color: '#163666' }}>Filters</h2>
          
          <div style={{ 
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '1rem',
            marginBottom: '1rem'
          }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: '500' }}>
                Hotel
              </label>
              <select
                value={selectedHotel}
                onChange={e => setSelectedHotel(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.5rem',
                  border: '1px solid #ccc',
                  borderRadius: '4px',
                  fontSize: '1rem'
                }}
              >
                {hotels.map(h => (
                  <option key={h.hotel_code} value={h.hotel_code}>{h.hotel_name}</option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: '500' }}>
                Year
              </label>
              <select
                value={year}
                onChange={e => setYear(parseInt(e.target.value))}
                style={{
                  width: '100%',
                  padding: '0.5rem',
                  border: '1px solid #ccc',
                  borderRadius: '4px',
                  fontSize: '1rem'
                }}
              >
                {years.map(y => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: '500' }}>
                Month
              </label>
              <select
                value={month}
                onChange={e => setMonth(parseInt(e.target.value))}
                style={{
                  width: '100%',
                  padding: '0.5rem',
                  border: '1px solid #ccc',
                  borderRadius: '4px',
                  fontSize: '1rem'
                }}
              >
                {months.map((m, i) => (
                  <option key={i + 1} value={i + 1}>{m}</option>
                ))}
              </select>
            </div>
          </div>

          <button
            onClick={fetchMetrics}
            disabled={loading}
            style={{
              padding: '0.75rem 1.5rem',
              background: loading ? '#ccc' : '#163666',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontSize: '1rem',
              fontWeight: '500'
            }}
          >
            {loading ? 'Loading...' : 'Refresh Metrics'}
          </button>
        </div>

        {/* Metrics */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem' }}>
            <h2>Loading metrics...</h2>
          </div>
        ) : metrics.length > 0 ? (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '1.5rem'
          }}>
            {metrics.map(m => (
              <div
                key={m.metric_name}
                style={{
                  padding: '1.5rem',
                  background: 'white',
                  borderRadius: '8px',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                  border: m.success ? 'none' : '2px solid #e05047'
                }}
              >
                <h3 style={{ fontSize: '1rem', marginBottom: '1rem', color: '#666' }}>
                  {m.metric_name}
                </h3>
                {m.success ? (
                  <p style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#00a6b6' }}>
                    {formatValue(m.value)}
                  </p>
                ) : (
                  <div>
                    <p style={{ color: '#e05047', fontSize: '0.875rem' }}>Failed to load</p>
                    {m.error && <p style={{ fontSize: '0.75rem', color: '#999' }}>{m.error}</p>}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div style={{
            padding: '3rem',
            textAlign: 'center',
            background: 'white',
            borderRadius: '8px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
          }}>
            <p style={{ color: '#666' }}>
              No metrics configured for this hotel. Add query templates in the Admin Panel.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

