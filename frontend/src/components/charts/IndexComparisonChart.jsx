import React from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  ReferenceLine, 
  Legend, 
  Cell 
} from 'recharts';

export default function IndexComparisonChart({ summaryData, headlineData, coreData }) {
  if (!summaryData && !headlineData) {
    return <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)' }}>No index data available.</div>;
  }

  // Build comparison data: Composite Macro + Route breakdown
  const data = [
    {
      category: 'Macro Network',
      Headline: summaryData?.headline_index || headlineData?.index_value || 133.79,
      Core: summaryData?.core_index || coreData?.index_value || 112.94,
    },
  ];

  if (headlineData?.route_contributions && coreData?.route_contributions) {
    headlineData.route_contributions.forEach((hRoute) => {
      const cRoute = coreData.route_contributions.find(c => c.route_code === hRoute.route_code);
      data.push({
        category: hRoute.route_code,
        Headline: hRoute.route_index,
        Core: cRoute ? cRoute.route_index : null,
      });
    });
  }

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const hVal = payload.find(p => p.dataKey === 'Headline')?.value;
      const cVal = payload.find(p => p.dataKey === 'Core')?.value;
      const spread = hVal && cVal ? (hVal - cVal).toFixed(2) : null;

      return (
        <div style={{
          backgroundColor: '#ffffff',
          border: '1px solid var(--border-subtle)',
          borderRadius: '8px',
          padding: '10px 14px',
          boxShadow: 'var(--shadow-md)',
          fontSize: '12px'
        }}>
          <p style={{ fontWeight: '600', color: 'var(--text-primary)', marginBottom: '4px' }}>{label}</p>
          <p style={{ color: '#1e3a8a', margin: '2px 0' }}>
            <strong>Headline Index:</strong> {hVal}
          </p>
          {cVal && (
            <p style={{ color: '#059669', margin: '2px 0' }}>
              <strong>Core Index:</strong> {cVal}
            </p>
          )}
          {spread && (
            <p style={{ color: '#d97706', margin: '2px 0', borderTop: '1px solid #f1f5f9', paddingTop: '4px' }}>
              <strong>Surge Spread:</strong> +{spread} pts
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div style={{ width: '100%', height: 320 }}>
      <ResponsiveContainer>
        <BarChart
          data={data}
          margin={{ top: 20, right: 30, left: 10, bottom: 10 }}
          barCategoryGap="25%"
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
          <XAxis 
            dataKey="category" 
            tickLine={false} 
            axisLine={{ stroke: '#e2e8f0' }}
            tick={{ fill: '#64748b', fontSize: 12, fontWeight: 500 }}
          />
          <YAxis 
            domain={[80, 160]} 
            tickLine={false} 
            axisLine={{ stroke: '#e2e8f0' }}
            tick={{ fill: '#64748b', fontSize: 12 }}
            label={{ value: 'Index Points (Base = 100.00)', angle: -90, position: 'insideLeft', fill: '#94a3b8', fontSize: 11, dx: -2 }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend 
            wrapperStyle={{ paddingTop: 10, fontSize: '12px' }}
          />
          <ReferenceLine y={100} stroke="#94a3b8" strokeDasharray="4 4" label={{ value: 'Base 100.00', fill: '#94a3b8', fontSize: 10, position: 'right' }} />
          
          {/* PUSHPAK Headline: Navy Blue */}
          <Bar 
            dataKey="Headline" 
            name="PUSHPAK Headline (All Horizons)" 
            fill="#1e3a8a" 
            radius={[4, 4, 0, 0]} 
            maxBarSize={45} 
          />
          
          {/* PUSHPAK Core: Institutional Green */}
          <Bar 
            dataKey="Core" 
            name="PUSHPAK Core (Structural Capacity)" 
            fill="#059669" 
            radius={[4, 4, 0, 0]} 
            maxBarSize={45} 
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
