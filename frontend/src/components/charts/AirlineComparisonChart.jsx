import React from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Cell 
} from 'recharts';

export default function AirlineComparisonChart({ data, routeAvgFare }) {
  if (!data || data.length === 0) {
    return <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)' }}>No airline comparison data available.</div>;
  }

  // Assign distinct institutional colors for airlines
  const getAirlineColor = (code) => {
    switch (code?.toUpperCase()) {
      case '6E': return '#0284c7'; // IndiGo Blue
      case 'AI': return '#b91c1c'; // Air India Red
      case 'SG': return '#ea580c'; // SpiceJet Orange
      case 'UK': return '#4c1d95'; // Vistara Purple
      case 'QP': return '#059669'; // Akasa Green
      default: return '#1e3a8a';
    }
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const item = payload[0].payload;
      const diffVal = item.diff_from_route_avg ?? item.diff_from_market_avg ?? 0;
      const rankVal = item.price_rank ?? (data.indexOf(item) + 1);
      return (
        <div style={{
          backgroundColor: '#ffffff',
          border: '1px solid var(--border-subtle)',
          borderRadius: '8px',
          padding: '10px 14px',
          boxShadow: 'var(--shadow-md)',
          fontSize: '12px'
        }}>
          <p style={{ fontWeight: '600', color: 'var(--text-primary)', marginBottom: '4px' }}>
            {item.airline_name} ({item.airline_code})
          </p>
          <p style={{ color: '#0f172a', margin: '2px 0' }}>
            <strong>Average Fare:</strong> ₹{item.avg_fare?.toLocaleString('en-IN')}
          </p>
          <p style={{ color: diffVal >= 0 ? '#ea580c' : '#059669', margin: '2px 0' }}>
            <strong>Diff vs Route Mean:</strong> {diffVal >= 0 ? '+' : ''}₹{Number(diffVal).toFixed(2)}
          </p>
          <p style={{ color: '#64748b', margin: '2px 0' }}>
            <strong>Price Rank:</strong> #{rankVal} of {data.length}
          </p>
          <p style={{ color: '#94a3b8', fontSize: '11px', marginTop: '4px' }}>
            Observations: {item.observation_count}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div style={{ width: '100%', height: 280 }}>
      <ResponsiveContainer>
        <BarChart
          data={data}
          margin={{ top: 10, right: 30, left: 15, bottom: 10 }}
          barCategoryGap="30%"
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
          <XAxis 
            dataKey="airline_code" 
            tickLine={false} 
            axisLine={{ stroke: '#e2e8f0' }}
            tick={{ fill: '#475569', fontSize: 12, fontWeight: 600 }}
          />
          <YAxis 
            domain={['dataMin - 500', 'dataMax + 500']}
            tickLine={false} 
            axisLine={{ stroke: '#e2e8f0' }}
            tick={{ fill: '#64748b', fontSize: 12 }}
            tickFormatter={(val) => `₹${val}`}
          />
          <Tooltip content={<CustomTooltip />} />
          <Bar 
            dataKey="avg_fare" 
            name="Average Fare" 
            radius={[4, 4, 0, 0]}
            maxBarSize={45}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={getAirlineColor(entry.airline_code)} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
