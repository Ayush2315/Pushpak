import React from 'react';
import { Plane } from 'lucide-react';
import { useLanguage } from '../hooks/useLanguage';

export default function RouteSelector({ routes, selectedRoute, onSelectRoute, showAll = false }) {
  const { t } = useLanguage();

  return (
    <div className="route-selector-container">
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <Plane size={15} color="var(--gov-navy)" />
        <span className="route-selector-label">{t('common.selectRoute')}:</span>
      </div>

      <div className="route-btn-group">
        {showAll && (
          <button
            onClick={() => onSelectRoute(null)}
            className={`route-btn ${selectedRoute === null ? 'active' : ''}`}
          >
            {t('common.allRoutes')}
          </button>
        )}

        {routes.map((r) => {
          const code = typeof r === 'string' ? r : r.route_code;
          return (
            <button
              key={code}
              onClick={() => onSelectRoute(code)}
              className={`route-btn ${selectedRoute === code ? 'active' : ''}`}
            >
              {code}
            </button>
          );
        })}
      </div>
    </div>
  );
}
