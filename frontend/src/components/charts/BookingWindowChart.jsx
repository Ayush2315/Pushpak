import React from 'react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';

export default function BookingWindowChart({ data }) {
  if (!data || data.length === 0) {
    return <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)' }}>No booking window data available.</div>;
  }

  // Ensure horizons sorted logically from longest planning to walk-up or vice versa
  // Convention: T+45 -> T+30 -> T+15 -> T+7 -> T+1
  const sortedData = [...data].sort((a, b) => b.lead_time_days - a.lead_time_days);

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const item = payload[0].payload;
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
            Horizon: {item.lead_time_bucket} ({item.lead_time_days} days before departure)
          </p>
          <p style={{ color: '#1e3a8a', margin: '2px 0' }}>
            <strong>Average Fare:</strong> ₹{item.avg_fare?.toLocaleString('en-IN')}
          </p>
          <p style={{ color: '#64748b', margin: '2px 0' }}>
            <strong>Range:</strong> ₹{item.min_fare?.toLocaleString('en-IN')} - ₹{item.max_fare?.toLocaleString('en-IN')}
          </p>
          <p style={{ color: '#059669', margin: '2px 0' }}>
            {item.yield_index != null ? (
              <><strong>Yield Ratio:</strong> {item.yield_index}x of route average</>
            ) : (
              <><strong>Fare Spread:</strong> ₹{(item.max_fare - item.min_fare)?.toLocaleString('en-IN')}</>
            )}
          </p>
          <p style={{ color: '#94a3b8', fontSize: '11px', marginTop: '4px' }}>
            Sample Size: {item.observation_count} observations
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div style={{ width: '100%', height: 300 }}>
      <ResponsiveContainer>
        <AreaChart
          data={sortedData}
          margin={{ top: 10, right: 30, left: 15, bottom: 10 }}
        >
          <defs>
            <linearGradient id="fareGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#d97706" stopOpacity={0.25} />
              <stop offset="95%" stopColor="#d97706" stopOpacity={0.0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
          <XAxis 
            dataKey="lead_time_bucket" 
            tickLine={false} 
            axisLine={{ stroke: '#e2e8f0' }}
            tick={{ fill: '#64748b', fontSize: 12, fontWeight: 500 }}
          />
          <YAxis 
            domain={['dataMin - 1000', 'dataMax + 1000']}
            tickLine={false} 
            axisLine={{ stroke: '#e2e8f0' }}
            tick={{ fill: '#64748b', fontSize: 12 }}
            tickFormatter={(val) => `₹${val / 1000}k`}
          />
          <Tooltip content={<CustomTooltip />} />
          <Area 
            type="monotone" 
            dataKey="avg_fare" 
            stroke="#d97706" 
            strokeWidth={2.5}
            fillOpacity={1} 
            fill="url(#fareGradient)" 
            dot={{ r: 4, fill: '#d97706', stroke: '#ffffff', strokeWidth: 2 }}
            activeDot={{ r: 6, fill: '#1e3a8a', stroke: '#ffffff', strokeWidth: 2 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
