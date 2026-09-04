import React from 'react';

export default function MetricCard({
  label,
  value,
  delta,
  deltaType = 'up', // 'up', 'down', 'neutral'
  subtext,
  icon: Icon,
  accentColor
}) {
  return (
    <div className="metric-card">
      <div className="metric-header">
        <span className="metric-label">{label}</span>
        {Icon && (
          <div className="metric-icon-badge" style={accentColor ? { color: accentColor } : {}}>
            <Icon size={16} />
          </div>
        )}
      </div>

      <div className="metric-value-row">
        <span className="metric-value">{value}</span>
        {delta && (
          <span className={`metric-delta delta-${deltaType}`}>
            {delta}
          </span>
        )}
      </div>

      {subtext && <span className="metric-subtext">{subtext}</span>}
    </div>
  );
}
